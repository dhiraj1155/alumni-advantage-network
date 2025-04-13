
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, MapPin, GraduationCap, Building, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  package: number;
  minimum_cgpa: number;
  deadline: string;
  eligible_departments: string[];
  eligible_years: string[];
  requirements: string[];
  posted_at: string;
  posted_by: string;
}

interface JobsDisplayProps {
  mode?: 'student' | 'placement';
  filterByDepartment?: string;
  filterByYear?: string;
}

const JobsDisplay = ({ mode = 'student', filterByDepartment, filterByYear }: JobsDisplayProps) => {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchJobs();
  }, [mode, filterByDepartment, filterByYear]);
  
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('job_opportunities')
        .select('*')
        .order('posted_at', { ascending: false });
      
      if (mode === 'placement' && user) {
        // For placement officers, only show jobs they posted
        query = query.eq('posted_by', user.id);
      }
      
      if (mode === 'student') {
        // For students, filter by their department and year if provided
        if (filterByDepartment) {
          query = query.contains('eligible_departments', [filterByDepartment]);
        }
        
        if (filterByYear) {
          query = query.contains('eligible_years', [filterByYear]);
        }
        
        // Only show jobs with future deadlines
        query = query.gt('deadline', new Date().toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job opportunities.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Get department full name
  const getDepartmentName = (code: string) => {
    const departments: Record<string, string> = {
      'CS': 'Computer Science',
      'IT': 'Information Technology',
      'ENTC': 'Electronics & Telecom',
      'MECH': 'Mechanical',
      'CIVIL': 'Civil',
      'ELECTRICAL': 'Electrical'
    };
    
    return departments[code] || code;
  };
  
  // Get year full name
  const getYearName = (code: string) => {
    const years: Record<string, string> = {
      'FE': 'First Year',
      'SE': 'Second Year',
      'TE': 'Third Year',
      'BE': 'Final Year'
    };
    
    return years[code] || code;
  };
  
  const handleApply = async (jobId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          student_id: user.id,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully."
      });
    } catch (error: any) {
      console.error("Error applying for job:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-placement-primary" />
      </div>
    );
  }
  
  if (jobs.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No job opportunities found</h3>
          <p className="text-sm text-gray-500 text-center mt-2">
            {mode === 'student' 
              ? "Check back later for new opportunities matching your profile." 
              : "Start posting job opportunities for students."}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <div className="flex items-center mt-1 text-gray-500">
                  <Building className="h-4 w-4 mr-1" />
                  <CardDescription>{job.company}</CardDescription>
                </div>
              </div>
              <Badge className="bg-placement-primary/90">{job.package} LPA</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 pb-2">
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{job.location}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Deadline: {formatDate(job.deadline)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <GraduationCap className="h-4 w-4 mr-2" />
                <span>Min. CGPA: {job.minimum_cgpa}</span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Requirements</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {job.requirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="text-sm text-gray-600">{req}</li>
                  ))}
                  {job.requirements.length > 3 && (
                    <li className="text-sm text-gray-500">+{job.requirements.length - 3} more</li>
                  )}
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {job.eligible_departments.map((dept) => (
                  <Badge key={dept} variant="outline">{getDepartmentName(dept)}</Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {job.eligible_years.map((year) => (
                  <Badge key={year} variant="outline">{getYearName(year)}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50 border-t pt-4">
            {mode === 'student' ? (
              <Button 
                className="w-full bg-placement-primary hover:bg-placement-primary/90"
                onClick={() => handleApply(job.id)}
              >
                Apply Now
              </Button>
            ) : (
              <div className="w-full text-sm text-gray-500 text-center">
                Posted on {formatDate(job.posted_at)}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default JobsDisplay;
