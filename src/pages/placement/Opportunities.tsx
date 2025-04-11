import { useState } from "react";
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
import { Building, Calendar, MapPin, Briefcase, Clock, CreditCard, Users, Plus, FileText, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Department, Year } from "@/types";
import { mockJobOpportunities } from "@/lib/mock-data";

const Opportunities = () => {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState(mockJobOpportunities);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [selectedYears, setSelectedYears] = useState<Year[]>([]);
  
  const onSubmit = (data: any) => {
    // In a real app, we would send this to the API
    console.log("Form data:", { ...data, eligibleDepartments: selectedDepartments, eligibleYears: selectedYears });
    
    // Mock success notification
    toast({
      title: "Opportunity created",
      description: "The job opportunity has been successfully posted.",
    });
    
    // Reset form
    reset();
    setSelectedDepartments([]);
    setSelectedYears([]);
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

  const handleDeleteOpportunity = (id: string) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== id));
    toast({
      title: "Opportunity deleted",
      description: "The job opportunity has been successfully deleted.",
    });
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
          {opportunities.length > 0 ? (
            opportunities.map((opportunity, index) => (
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
                      <Button variant="ghost" size="icon">
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
                        <Button className="w-full bg-placement-primary hover:bg-placement-primary/90">
                          View Applications
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
              <CardTitle>Create New Job Opportunity</CardTitle>
              <CardDescription>
                Fill in the details below to post a new job opportunity for students.
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
                
                <Button 
                  type="submit" 
                  className="bg-placement-primary hover:bg-placement-primary/90"
                  disabled={selectedDepartments.length === 0 || selectedYears.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" /> Post Opportunity
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Opportunities;
