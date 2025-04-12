
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen, TrendingUp, Award, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockStudents } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

// Mock quiz progress data
const quizProgressData = [
  { name: "Jan", score: 65 },
  { name: "Feb", score: 70 },
  { name: "Mar", score: 75 },
  { name: "Apr", score: 80 },
  { name: "May", score: 78 },
  { name: "Jun", score: 82 },
  { name: "Jul", score: 85 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      
      try {
        // Try to get data from Supabase first
        const { data: studentProfile, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching student data:", error);
          // Fallback to mock data
          const mockStudent = mockStudents.find(s => s.userId === user.id);
          setStudentData(mockStudent);
        } else if (studentProfile) {
          // Enhance with skills and quizzes from mock data for now
          // In a real app, these would be separate tables
          const mockStudent = mockStudents.find(s => s.userId === user.id);
          setStudentData({
            ...studentProfile,
            skills: mockStudent?.skills || [],
            quizzes: mockStudent?.quizzes || [],
            socialLinks: mockStudent?.socialLinks || {}
          });
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        // Fallback to mock data
        const mockStudent = mockStudents.find(s => s.userId === user.id);
        setStudentData(mockStudent);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (isLoading || !studentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-placement-primary"></div>
      </div>
    );
  }

  // Calculate average quiz score
  const averageScore = studentData.quizzes && studentData.quizzes.length > 0
    ? studentData.quizzes.reduce((sum: number, quiz: any) => sum + quiz.score, 0) / studentData.quizzes.length
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PRN</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.prn}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.department}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.year}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Quiz Score</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              From {studentData.quizzes?.length || 0} quizzes
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Skills Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">Web Development</div>
                <div className="text-gray-500">85%</div>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">Data Structures</div>
                <div className="text-gray-500">78%</div>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">Algorithms</div>
                <div className="text-gray-500">64%</div>
              </div>
              <Progress value={64} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">Database Management</div>
                <div className="text-gray-500">92%</div>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quiz Progress Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Quiz Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={quizProgressData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#1e40af" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity & Upcoming Events */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <BookOpen className="h-4 w-4 text-placement-primary" />
                </div>
                <div>
                  <p className="font-medium">Completed Data Structures Quiz</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-100 p-2">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Updated Profile</p>
                  <p className="text-sm text-gray-500">5 days ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-purple-100 p-2">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Moved up in Leaderboard</p>
                  <p className="text-sm text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="min-w-[50px] text-center">
                  <p className="text-lg font-bold">15</p>
                  <p className="text-xs text-gray-500">Jun</p>
                </div>
                <div>
                  <p className="font-medium">Amazon Recruitment Drive</p>
                  <p className="text-sm text-gray-500">Virtual • 10:00 AM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="min-w-[50px] text-center">
                  <p className="text-lg font-bold">22</p>
                  <p className="text-xs text-gray-500">Jun</p>
                </div>
                <div>
                  <p className="font-medium">Tech Workshop by Google</p>
                  <p className="text-sm text-gray-500">Auditorium • 2:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="min-w-[50px] text-center">
                  <p className="text-lg font-bold">30</p>
                  <p className="text-xs text-gray-500">Jun</p>
                </div>
                <div>
                  <p className="font-medium">Resume Building Seminar</p>
                  <p className="text-sm text-gray-500">Online • 11:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
