
// I'm going to update only the parts with errors, not the entire file
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, MapPin, Briefcase, Clock, CreditCard, Users, Plus, FileText, Edit, Trash, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Department, Year, JobOpportunity, UserRole } from "@/types";
import { supabase, convertToDepartment, convertToYear } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Opportunities = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<JobOpportunity | null>(null);
  const [applications, setApplications] = useState<{[jobId: string]: number}>({});
  const [viewApplicationsFor, setViewApplicationsFor] = useState<string | null>(null);
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [selectedYears, setSelectedYears] = useState<Year[]>([]);
  
  useEffect(() => {
    fetchOpportunities();
    fetchApplicationCounts();
  }, []);
  
  useEffect(() => {
    if (editingOpportunity) {
      setValue("title", editingOpportunity.title);
      setValue("company", editingOpportunity.company);
      setValue("location", editingOpportunity.location);
      setValue("description", editingOpportunity.description);
      setValue("requirements", editingOpportunity.requirements.join(", "));
      setValue("package", editingOpportunity.package);
      setValue("minimumCgpa", editingOpportunity.minimumCgpa);
      setValue("deadline", new Date(editingOpportunity.deadline).toISOString().split('T')[0]);
      
      setSelectedDepartments(editingOpportunity.eligibleDepartments);
      setSelectedYears(editingOpportunity.eligibleYears);
    }
  }, [editingOpportunity, setValue]);
  
  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_opportunities')
        .select('*')
        .order('posted_at', { ascending: false });
        
      if (error) throw error;
      
      const formattedOpportunities: JobOpportunity[] = data.map(item => ({
        id: item.id,
        title: item.title,
        company: item.company,
        location: item.location,
        description: item.description,
        requirements: item.requirements as string[],
        eligibleDepartments: item.eligible_departments.map(dept => convertToDepartment(dept)),
        eligibleYears: item.eligible_years.map(year => convertToYear(year)),
        minimumCgpa: item.minimum_cgpa,
        package: item.package,
        postedBy: {
          id: item.posted_by,
          name: "Training & Placement Cell",
          role: UserRole.PLACEMENT
        },
        postedAt: item.posted_at,
        deadline: item.deadline
      }));
      
      setOpportunities(formattedOpportunities);
    } catch (error: any) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error fetching opportunities",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchApplicationCounts = async () => {
    try {
      // PostgreSQL aggregation isn't directly supported by Supabase JS
      // Use a workaround approach
      const { data, error } = await supabase
        .from('job_applications')
        .select('job_id');
        
      if (error) throw error;
      
      // Group by job_id and count manually
      const counts: Record<string, number> = {};
      data.forEach(app => {
        counts[app.job_id] = (counts[app.job_id] || 0) + 1;
      });
      
      setApplications(counts);
    } catch (error: any) {
      console.error("Error fetching application counts:", error);
    }
  };
  
  const fetchApplicantsForJob = async (jobId: string) => {
    setIsLoadingApplicants(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          student_id,
          applied_at,
          status,
          profiles!job_applications_student_id_fkey(
            first_name,
            last_name,
            avatar
          ),
          students!inner(
            department,
            year,
            prn
          )
        `)
        .eq('job_id', jobId);
        
      if (error) throw error;
      
      setJobApplicants(data || []);
    } catch (error: any) {
      console.error("Error fetching applicants:", error);
      toast({
        title: "Error fetching applicants",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingApplicants(false);
    }
  };
  
  const onSubmit = async (data: any) => {
    if (selectedDepartments.length === 0 || selectedYears.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one department and year",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const processedRequirements = data.requirements.split(',').map((req: string) => req.trim());
      
      const jobData = {
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        requirements: processedRequirements,
        eligible_departments: selectedDepartments,
        eligible_years: selectedYears,
        minimum_cgpa: parseFloat(data.minimumCgpa),
        package: parseFloat(data.package),
        deadline: new Date(data.deadline).toISOString(),
        posted_by: user?.id
      };
      
      let result;
      
      if (editingOpportunity) {
        result = await supabase
          .from('job_opportunities')
          .update(jobData)
          .eq('id', editingOpportunity.id);
          
        if (result.error) throw result.error;
        
        toast({
          title: "Opportunity updated",
          description: "The job opportunity has been successfully updated.",
        });
      } else {
        result = await supabase
          .from('job_opportunities')
          .insert([jobData]);
          
        if (result.error) throw result.error;
        
        toast({
          title: "Opportunity created",
          description: "The job opportunity has been successfully posted.",
        });
      }
      
      reset();
      setSelectedDepartments([]);
      setSelectedYears([]);
      setEditingOpportunity(null);
      
      fetchOpportunities();
      fetchApplicationCounts();
      
    } catch (error: any) {
      console.error("Error submitting opportunity:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepartmentToggle = (department: Department) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  const handleYearToggle = (year: Year) => {
    setSelectedYears(prev => 
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  const handleDeleteOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_opportunities')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setOpportunities(prev => prev.filter(opp => opp.id !== id));
      
      toast({
        title: "Opportunity deleted",
        description: "The job opportunity has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting opportunity:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleEditOpportunity = (opportunity: JobOpportunity) => {
    setEditingOpportunity(opportunity);
  };
  
  const handleViewApplications = (jobId: string) => {
    setViewApplicationsFor(jobId);
    fetchApplicantsForJob(jobId);
  };
  
  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: status })
        .eq('id', applicationId);
        
      if (error) throw error;
      
      setJobApplicants(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
      
      toast({
        title: "Status updated",
        description: `Application status updated to ${status}`,
      });
    } catch (error: any) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Opportunities</h1>
      
      <Tabs defaultValue="view">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Opportunities</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" /> {opportunity.company}
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" /> {opportunity.location}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditOpportunity(opportunity)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteOpportunity(opportunity.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Job Description</h3>
                      <p className="text-sm text-gray-600">{opportunity.description}</p>
                      
                      <h3 className="text-sm font-semibold mt-4 mb-2">Requirements</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {opportunity.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Eligible Departments</h3>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.eligibleDepartments.map((dept, i) => (
                            <Badge key={i} variant="outline" className="bg-muted/50">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Eligible Years</h3>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.eligibleYears.map((year, i) => (
                            <Badge key={i} variant="outline" className="bg-muted/50">
                              {year}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Deadline:</span>
                          <span className="ml-2">{new Date(opportunity.deadline).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Package:</span>
                          <span className="ml-2">₹{opportunity.package} LPA</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Min. CGPA:</span>
                          <span className="ml-2">{opportunity.minimumCgpa}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          className="w-full bg-placement-primary hover:bg-placement-primary/90"
                          onClick={() => handleViewApplications(opportunity.id)}
                        >
                          View Applications 
                          {applications[opportunity.id] && (
                            <Badge className="ml-2 bg-white text-placement-primary">
                              {applications[opportunity.id]}
                            </Badge>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
                <p className="text-muted-foreground mb-4">Create your first job opportunity to get started.</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create Opportunity
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingOpportunity ? "Edit Job Opportunity" : "Create New Job Opportunity"}</CardTitle>
              <CardDescription>
                {editingOpportunity 
                  ? "Update the details of the job opportunity."
                  : "Fill in the details below to post a new job opportunity for students."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Job Title</label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Software Developer Intern" 
                      {...register("title", { required: true })}
                    />
                    {errors.title && <p className="text-red-500 text-xs">This field is required</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium">Company</label>
                    <Input 
                      id="company" 
                      placeholder="e.g. Google" 
                      {...register("company", { required: true })}
                    />
                    {errors.company && <p className="text-red-500 text-xs">This field is required</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">Location</label>
                  <Input 
                    id="location" 
                    placeholder="e.g. Bangalore, India" 
                    {...register("location", { required: true })}
                  />
                  {errors.location && <p className="text-red-500 text-xs">This field is required</p>}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Job Description</label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the job role and responsibilities..." 
                    className="min-h-32"
                    {...register("description", { required: true })}
                  />
                  {errors.description && <p className="text-red-500 text-xs">This field is required</p>}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="requirements" className="text-sm font-medium">Requirements (comma-separated)</label>
                    <Textarea 
                      id="requirements" 
                      placeholder="e.g. JavaScript, React, Node.js" 
                      {...register("requirements", { required: true })}
                    />
                    {errors.requirements && <p className="text-red-500 text-xs">This field is required</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Eligible Departments</label>
                    <div className="grid grid-cols-2 gap-2 border rounded-md p-3 h-[118px] overflow-y-auto">
                      {Object.values(Department).map((dept) => (
                        <div key={dept} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`dept-${dept}`} 
                            checked={selectedDepartments.includes(dept)}
                            onCheckedChange={() => handleDepartmentToggle(dept)}
                          />
                          <label htmlFor={`dept-${dept}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {dept}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedDepartments.length === 0 && (
                      <p className="text-red-500 text-xs">Select at least one department</p>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Eligible Years</label>
                    <div className="flex flex-wrap gap-2 border rounded-md p-3">
                      {Object.values(Year).map((year) => (
                        <div key={year} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`year-${year}`} 
                            checked={selectedYears.includes(year)}
                            onCheckedChange={() => handleYearToggle(year)}
                          />
                          <label htmlFor={`year-${year}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {year}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedYears.length === 0 && (
                      <p className="text-red-500 text-xs">Select at least one year</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="package" className="text-sm font-medium">Package (LPA)</label>
                    <Input 
                      id="package" 
                      type="number" 
                      placeholder="e.g. 12" 
                      step="0.1"
                      {...register("package", { required: true, min: 0 })}
                    />
                    {errors.package && <p className="text-red-500 text-xs">Valid package required</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="minimumCgpa" className="text-sm font-medium">Minimum CGPA</label>
                    <Input 
                      id="minimumCgpa" 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g. 7.5" 
                      {...register("minimumCgpa", { required: true, min: 0, max: 10 })}
                    />
                    {errors.minimumCgpa && <p className="text-red-500 text-xs">Valid CGPA required (0-10)</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="deadline" className="text-sm font-medium">Application Deadline</label>
                  <Input 
                    id="deadline" 
                    type="date" 
                    {...register("deadline", { required: true })}
                  />
                  {errors.deadline && <p className="text-red-500 text-xs">This field is required</p>}
                </div>
                
                <div className="flex gap-2">
                  {editingOpportunity && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setEditingOpportunity(null);
                        reset();
                        setSelectedDepartments([]);
                        setSelectedYears([]);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="bg-placement-primary hover:bg-placement-primary/90"
                    disabled={isSubmitting || selectedDepartments.length === 0 || selectedYears.length === 0}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingOpportunity ? "Update Opportunity" : "Post Opportunity"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog 
        open={viewApplicationsFor !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setViewApplicationsFor(null);
            setJobApplicants([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Applications</DialogTitle>
            <DialogDescription>
              Students who have applied for this job opportunity.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingApplicants ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : jobApplicants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>PRN</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobApplicants.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                        {application.profiles?.avatar && (
                          <img 
                            src={application.profiles.avatar} 
                            alt={`${application.profiles.first_name}`}
                            className="h-full w-full object-cover" 
                          />
                        )}
                      </div>
                      <span>
                        {application.profiles?.first_name} {application.profiles?.last_name}
                      </span>
                    </TableCell>
                    <TableCell>{application.students?.department}</TableCell>
                    <TableCell>{application.students?.year}</TableCell>
                    <TableCell>{application.students?.prn}</TableCell>
                    <TableCell>{new Date(application.applied_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={
                        application.status === "pending" ? "bg-yellow-500" :
                        application.status === "shortlisted" ? "bg-green-500" :
                        "bg-red-500"
                      }>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={application.status}
                        onValueChange={(value) => handleUpdateApplicationStatus(application.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="shortlisted">Shortlist</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications yet</h3>
              <p className="text-muted-foreground">No students have applied for this job opportunity yet.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Opportunities;
