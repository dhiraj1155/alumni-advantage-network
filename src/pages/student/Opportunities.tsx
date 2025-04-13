import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Users, 
  Search, 
  Filter, 
  Briefcase, 
  CheckCircle, 
  XCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Department, Year, JobOpportunity, UserRole } from "@/types";
import { supabase, convertToDepartment, convertToYear } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const StudentOpportunities = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applyingToJob, setApplyingToJob] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    year: ""
  });
  
  useEffect(() => {
    fetchOpportunities();
    if (user) {
      fetchUserApplications();
    }
  }, [user]);
  
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
  
  const fetchUserApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('student_id', user?.id);
        
      if (error) throw error;
      
      const jobIds = data?.map(app => app.job_id) || [];
      setAppliedJobs(jobIds);
    } catch (error: any) {
      console.error("Error fetching user applications:", error);
    }
  };
  
  const filteredOpportunities = opportunities.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filters.department || job.eligibleDepartments.includes(filters.department as Department);
    
    const matchesYear = !filters.year || job.eligibleYears.includes(filters.year as Year);
    
    return matchesSearch && matchesDepartment && matchesYear;
  });
  
  const handleApply = async (jobId: string) => {
    if (appliedJobs.includes(jobId)) return;
    
    setApplyingToJob(jobId);
    
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([
          { job_id: jobId, student_id: user?.id }
        ]);
        
      if (error) throw error;
      
      setAppliedJobs([...appliedJobs, jobId]);
      
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      
      if (error.code === '23505') {
        toast({
          title: "Already applied",
          description: "You have already applied for this job opportunity.",
        });
        setAppliedJobs([...appliedJobs, jobId]);
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setApplyingToJob(null);
    }
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      department: "",
      year: ""
    });
    setSearchTerm("");
  };

  const handleTabChange = (tabId: string) => {
    const tabElement = document.querySelector(`[data-value="${tabId}"]`);
    if (tabElement) {
      (tabElement as HTMLElement).focus();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Opportunities</h1>
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Opportunities</h1>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job title, company or location..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="w-1/2">
                <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-departments">All Departments</SelectItem>
                    {Object.values(Department).map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-1/2">
                <Select value={filters.year} onValueChange={(value) => handleFilterChange("year", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-years">All Years</SelectItem>
                    {Object.values(Year).map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {(searchTerm || filters.department || filters.year) && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={resetFilters} size="sm">
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
          <TabsTrigger value="recommended">Recommended for You</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4 space-y-4">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" /> {job.company}
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" /> {job.location}
                      </CardDescription>
                    </div>
                    {appliedJobs.includes(job.id) && (
                      <Badge className="bg-green-600">Applied</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{job.description}</p>
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Requirements:</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {job.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-wrap gap-y-2">
                      <div className="w-full sm:w-1/2 flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Deadline:</span>
                        <span className="ml-2">{new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="w-full sm:w-1/2 flex items-center text-sm">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Package:</span>
                        <span className="ml-2">₹{job.package} LPA</span>
                      </div>
                      
                      <div className="w-full sm:w-1/2 flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Min. CGPA:</span>
                        <span className="ml-2">{job.minimumCgpa}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Posted by: {job.postedBy.role === "placement" ? "Training & Placement Cell" : "Alumni"}
                    </p>
                  </div>
                  {appliedJobs.includes(job.id) ? (
                    <Button variant="outline" disabled>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Applied
                    </Button>
                  ) : (
                    <Button 
                      className="bg-placement-primary hover:bg-placement-primary/90"
                      onClick={() => handleApply(job.id)}
                      disabled={applyingToJob === job.id}
                    >
                      {applyingToJob === job.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying...
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="applied" className="mt-4 space-y-4">
          {opportunities
            .filter(job => appliedJobs.includes(job.id))
            .map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <Badge className="bg-green-600 mr-2">Applied</Badge>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" /> {job.company}
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" /> {job.location}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-600">Applied</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-y-2">
                      <div className="w-full sm:w-1/2 flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Applied on:</span>
                        <span className="ml-2">{new Date().toLocaleDateString()}</span>
                      </div>
                      
                      <div className="w-full sm:w-1/2 flex items-center text-sm">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Package:</span>
                        <span className="ml-2">₹{job.package} LPA</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Posted by: {job.postedBy.role === "placement" ? "Training & Placement Cell" : "Alumni"}
                    </p>
                  </div>
                  <Badge variant="outline">Status: Under Review</Badge>
                </CardFooter>
              </Card>
            ))}
          
          {appliedJobs.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
                <Button 
                  variant="outline" 
                  onClick={() => handleTabChange("all")}
                >
                  Browse Opportunities
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="recommended" className="mt-4 space-y-4">
          {opportunities.slice(0, 2).map((job) => (
            <Card key={job.id} className="border-placement-primary/40">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <Badge className="bg-placement-primary mr-2">Recommended</Badge>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" /> {job.company}
                      <span className="mx-2">•</span>
                      <MapPin className="h-4 w-4 mr-1" /> {job.location}
                    </CardDescription>
                  </div>
                  {appliedJobs.includes(job.id) && (
                    <Badge className="bg-green-600">Applied</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{job.description}</p>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Requirements:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {job.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-y-2">
                    <div className="w-full sm:w-1/2 flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Deadline:</span>
                      <span className="ml-2">{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="w-full sm:w-1/2 flex items-center text-sm">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Package:</span>
                      <span className="ml-2">₹{job.package} LPA</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Matched based on your skills: {job.requirements[0]}, {job.requirements[1]}
                  </p>
                </div>
                {appliedJobs.includes(job.id) ? (
                  <Button variant="outline" disabled>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Applied
                  </Button>
                ) : (
                  <Button 
                    className="bg-placement-primary hover:bg-placement-primary/90"
                    onClick={() => handleApply(job.id)}
                    disabled={applyingToJob === job.id}
                  >
                    {applyingToJob === job.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying...
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentOpportunities;
