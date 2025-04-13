
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Medal, Trophy, Search } from "lucide-react";
import { Department } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// Mock leaderboard data
const leaderboardData = [
  {
    id: 1,
    name: "Jane Smith",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith",
    department: Department.INFORMATION,
    year: "TY",
    score: 98,
    quizzesTaken: 15
  },
  {
    id: 2,
    name: "Alex Johnson",
    avatar: "https://ui-avatars.com/api/?name=Alex+Johnson",
    department: Department.COMPUTER,
    year: "BTECH",
    score: 95,
    quizzesTaken: 14
  },
  {
    id: 3,
    name: "Sam Wilson",
    avatar: "https://ui-avatars.com/api/?name=Sam+Wilson",
    department: Department.CSE_AI,
    year: "TY",
    score: 92,
    quizzesTaken: 12
  },
  {
    id: 4,
    name: "John Doe",
    avatar: "https://ui-avatars.com/api/?name=John+Doe",
    department: Department.COMPUTER,
    year: "TY",
    score: 90,
    quizzesTaken: 15
  },
  {
    id: 5,
    name: "Rita Patel",
    avatar: "https://ui-avatars.com/api/?name=Rita+Patel",
    department: Department.ELECTRONICS,
    year: "BTECH",
    score: 89,
    quizzesTaken: 13
  },
  {
    id: 6,
    name: "Michael Brown",
    avatar: "https://ui-avatars.com/api/?name=Michael+Brown",
    department: Department.MECHANICAL,
    year: "TY",
    score: 87,
    quizzesTaken: 14
  },
  {
    id: 7,
    name: "Sarah Lee",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Lee",
    department: Department.CSE_AIML,
    year: "SY",
    score: 85,
    quizzesTaken: 11
  },
  {
    id: 8,
    name: "David Chen",
    avatar: "https://ui-avatars.com/api/?name=David+Chen",
    department: Department.CSE_DATA,
    year: "TY",
    score: 84,
    quizzesTaken: 10
  },
  {
    id: 9,
    name: "Emma Watson",
    avatar: "https://ui-avatars.com/api/?name=Emma+Watson",
    department: Department.INFORMATION,
    year: "SY",
    score: 83,
    quizzesTaken: 12
  },
  {
    id: 10,
    name: "Raj Sharma",
    avatar: "https://ui-avatars.com/api/?name=Raj+Sharma",
    department: Department.COMPUTER,
    year: "BTECH",
    score: 82,
    quizzesTaken: 13
  }
];

// Mock department leaderboard data
const departmentLeaderboard = Object.values(Department).map((dept, index) => ({
  id: index + 1,
  department: dept,
  averageScore: Math.round(75 + Math.random() * 20),
  studentsParticipated: Math.round(50 + Math.random() * 100),
  totalQuizzes: Math.round(300 + Math.random() * 400)
})).sort((a, b) => b.averageScore - a.averageScore);

const Leaderboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  
  // Filter students based on search and department
  const filteredLeaderboard = leaderboardData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || student.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Find the current user's rank
  const currentUserRank = leaderboardData.findIndex(student => student.name === "John Doe") + 1;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      
      {/* User's current rank */}
      <Card className="bg-gradient-to-r from-placement-primary to-placement-secondary text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">Your Current Rank</p>
                <p className="text-3xl font-bold">#{currentUserRank}</p>
              </div>
            </div>
            
            <div className="md:ml-auto flex items-center gap-8">
              <div>
                <p className="text-sm font-medium text-white/70">Score</p>
                <p className="text-2xl font-bold">90</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-white/70">Quizzes Taken</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-white/70">Department Rank</p>
                <p className="text-2xl font-bold">#2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="students">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">Student Rankings</TabsTrigger>
          <TabsTrigger value="departments">Department Rankings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and filter */}
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4 mb-6">
                <div className="md:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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
              </div>
              
              {/* Top 3 students */}
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                {filteredLeaderboard.slice(0, 3).map((student, index) => (
                  <Card key={student.id} className={`border-2 ${index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-300' : 'border-amber-600'}`}>
                    <CardContent className="pt-6 pb-4 text-center">
                      <div className="flex justify-center mb-4">
                        {index === 0 ? (
                          <div className="relative">
                            <Avatar className="h-20 w-20 border-4 border-yellow-400">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-3 -right-3 bg-yellow-400 text-black rounded-full p-1">
                              <Trophy className="h-6 w-6" />
                            </div>
                          </div>
                        ) : (
                          <Avatar className={`h-20 w-20 border-4 ${index === 1 ? 'border-gray-300' : 'border-amber-600'}`}>
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{student.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{student.department} • {student.year}</p>
                      <div className="flex justify-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Rank</p>
                          <p className="text-xl font-bold">#{index + 1}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="text-xl font-bold">{student.score}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Quizzes</p>
                          <p className="text-xl font-bold">{student.quizzesTaken}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Rest of the leaderboard */}
              <div className="space-y-3">
                {filteredLeaderboard.slice(3).map((student, index) => (
                  <div 
                    key={student.id} 
                    className={`flex items-center p-3 rounded-md border ${student.name === "John Doe" ? "bg-placement-primary/5 border-placement-primary/30" : ""}`}
                  >
                    <div className="w-12 text-center font-bold text-lg text-muted-foreground">
                      #{index + 4}
                    </div>
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.department} • {student.year}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Score</div>
                        <div className="font-bold">{student.score}</div>
                      </div>
                      <div className="text-center min-w-[70px]">
                        <div className="text-sm text-muted-foreground">Quizzes</div>
                        <div className="font-bold">{student.quizzesTaken}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Department Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentLeaderboard.map((dept, index) => (
                  <div 
                    key={dept.id} 
                    className={`flex items-center p-4 rounded-md border ${index < 3 ? "border-placement-primary/30" : ""}`}
                  >
                    <div className="w-12 text-center">
                      {index === 0 ? (
                        <Medal className="h-6 w-6 text-yellow-500 mx-auto" />
                      ) : index === 1 ? (
                        <Medal className="h-6 w-6 text-gray-400 mx-auto" />
                      ) : index === 2 ? (
                        <Medal className="h-6 w-6 text-amber-700 mx-auto" />
                      ) : (
                        <div className="font-bold text-lg text-muted-foreground">#{index + 1}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{dept.department}</div>
                      <div className="text-sm text-muted-foreground">
                        {dept.studentsParticipated} participants • {dept.totalQuizzes} quizzes taken
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Avg. Score</div>
                        <div className="font-bold">{dept.averageScore}%</div>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-yellow-500 ml-2">Top Department</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
