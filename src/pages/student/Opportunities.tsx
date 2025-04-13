
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobsDisplay from "@/components/placement/JobsDisplay";
import { Loader2 } from "lucide-react";

const Opportunities = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState<string | undefined>();
  const [filterYear, setFilterYear] = useState<string | undefined>();
  
  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);
  
  const fetchStudentData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      setStudentData(data);
      
      // Set initial filters based on student's department and year
      if (data) {
        setFilterDepartment(data.department);
        setFilterYear(data.year);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-placement-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Job Opportunities</h1>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium block mb-2">Department</label>
              <Select
                value={filterDepartment}
                onValueChange={setFilterDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS">Computer Science</SelectItem>
                  <SelectItem value="IT">Information Technology</SelectItem>
                  <SelectItem value="ENTC">Electronics & Telecom</SelectItem>
                  <SelectItem value="MECH">Mechanical</SelectItem>
                  <SelectItem value="CIVIL">Civil</SelectItem>
                  <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Year</label>
              <Select
                value={filterYear}
                onValueChange={setFilterYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FE">First Year</SelectItem>
                  <SelectItem value="SE">Second Year</SelectItem>
                  <SelectItem value="TE">Third Year</SelectItem>
                  <SelectItem value="BE">Final Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All Opportunities</TabsTrigger>
          <TabsTrigger value="recommended" className="flex-1">Recommended For You</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <JobsDisplay mode="student" />
        </TabsContent>
        
        <TabsContent value="recommended" className="mt-6">
          <JobsDisplay 
            mode="student" 
            filterByDepartment={studentData?.department} 
            filterByYear={studentData?.year} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Opportunities;
