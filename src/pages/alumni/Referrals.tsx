
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, UserCheck, CheckCircle, XCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RequestStatus } from "@/types";
import { mockReferralRequests } from "@/lib/mock-data";

// Mock students data
const mockStudents = [
  {
    id: "s1",
    name: "John Doe",
    department: "Computer Engineering",
    year: "TY",
    skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    avatar: "https://ui-avatars.com/api/?name=John+Doe",
  },
  {
    id: "s2",
    name: "Jane Smith",
    department: "Information Technology",
    year: "BTECH",
    skills: ["Python", "Machine Learning", "Data Analysis", "SQL"],
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith",
  },
  {
    id: "s3",
    name: "Alex Johnson",
    department: "CSE (AI & ML)",
    year: "TY",
    skills: ["Python", "TensorFlow", "Computer Vision", "NLP"],
    avatar: "https://ui-avatars.com/api/?name=Alex+Johnson",
  },
  {
    id: "s4",
    name: "Sarah Williams",
    department: "Electronics & Telecommunication Engineering",
    year: "BTECH",
    skills: ["VLSI", "Embedded Systems", "Circuit Design", "IoT"],
    avatar: "https://ui-avatars.com/api/?name=Sarah+Williams",
  },
];

const Referrals = () => {
  const { toast } = useToast();
  const [referrals, setReferrals] = useState(mockReferralRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  // Filter students based on search term
  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const onSubmit = (data: any) => {
    if (!selectedStudent) {
      toast({
        title: "No student selected",
        description: "Please select a student to refer.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would send this to the API
    console.log("Form data:", { ...data, studentId: selectedStudent });
    
    // Mock success notification
    toast({
      title: "Referral submitted",
      description: "Your referral has been successfully submitted.",
    });
    
    // Reset form
    reset();
    setSelectedStudent(null);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Student Referrals</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Refer a Student</CardTitle>
          <CardDescription>
            Help students from your alma mater by referring them to job positions at your company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Step 1: Select a Student</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name, department or skills..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Skills</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <TableRow 
                            key={student.id} 
                            className={`cursor-pointer ${selectedStudent === student.id ? 'bg-placement-primary/10' : ''}`}
                            onClick={() => setSelectedStudent(student.id)}
                          >
                            <TableCell>
                              <div className="flex items-center justify-center">
                                {selectedStudent === student.id ? (
                                  <CheckCircle className="h-5 w-5 text-placement-primary" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30"></div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={student.avatar} alt={student.name} />
                                  <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{student.department}</TableCell>
                            <TableCell>{student.year}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {student.skills.slice(0, 2).map((skill, i) => (
                                  <Badge key={i} variant="outline" className="bg-muted/50">
                                    {skill}
                                  </Badge>
                                ))}
                                {student.skills.length > 2 && (
                                  <Badge variant="outline" className="bg-muted/50">
                                    +{student.skills.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No students found matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Step 2: Referral Information</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="jobTitle" className="text-sm font-medium">Job Title</label>
                    <Input 
                      id="jobTitle" 
                      placeholder="e.g. Software Developer" 
                      {...register("jobTitle", { required: true })}
                    />
                    {errors.jobTitle && <p className="text-red-500 text-xs">This field is required</p>}
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
                  <label htmlFor="message" className="text-sm font-medium">Referral Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="Explain why you're referring this student and their potential fit for the role..." 
                    className="min-h-32"
                    {...register("message", { required: true })}
                  />
                  {errors.message && <p className="text-red-500 text-xs">This field is required</p>}
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-placement-primary hover:bg-placement-primary/90"
                  disabled={!selectedStudent}
                >
                  <UserCheck className="h-4 w-4 mr-2" /> Submit Referral
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>
            Track the status of your student referrals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Job Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">John Doe</TableCell>
                    <TableCell>{referral.jobTitle}</TableCell>
                    <TableCell>{referral.company}</TableCell>
                    <TableCell>{new Date(referral.referredAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          referral.status === RequestStatus.PENDING 
                            ? 'bg-yellow-500' 
                            : referral.status === RequestStatus.APPROVED 
                              ? 'bg-green-600' 
                              : 'bg-red-500'
                        }
                      >
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't referred any students yet. 
                Use the form above to make your first student referral.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;
