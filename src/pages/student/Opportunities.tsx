import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, Calendar, CreditCard, Users, Search, Filter, Briefcase, CheckCircle, XCircle } from "lucide-react";
import { mockJobOpportunities } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Department, Year } from "@/types";

const StudentOpportunities = () => {
  const { toast } = useToast();
  const [opportunities] = useState(mockJobOpportunities);
  const [appliedJobs] = useState<string[]>(["j1"]); // Mock data - in a real app this would come from the API
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    year: ""
  });
  
  const filteredOpportunities = opportunities.filter(job => {
    // Filter by search term
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by department if selected
    const matchesDepartment = !filters.department || job.eligibleDepartments.includes(filters.department as Department);
    
    // Filter by year if selected
    const matchesYear = !filters.year || job.eligibleYears.includes(filters.year as Year);
    
    return matchesSearch && matchesDepartment && matchesYear;
  });
  
  const handleApply = (jobId: string) => {
    // In a real app, we would send this to the API
    toast({
      title: "Application submitted",
      description: "Your application has been successfully submitted.",
    });
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
    // Find the tab element and focus it
    const tabElement = document.querySelector(`[data-value="${tabId}"]`);
    if (tabElement) {
      (tabElement as HTMLElement).focus();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Opportunities</h1>
      
      {/* Search and Filter */}
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
                    <SelectItem value="">All Departments</SelectItem>
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
                    <SelectItem value="">All Years</SelectItem>
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
      
      {/* Job Listings */}
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
                    >
                      Apply Now
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
                      <CardTitle className="text-xl">{job.title}</CardTitle>
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
                  >
                    Apply Now
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
