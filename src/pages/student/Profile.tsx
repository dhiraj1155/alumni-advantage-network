
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Building, GraduationCap, FileText, Briefcase, Github, Linkedin, Globe, Upload, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockStudents } from "@/lib/mock-data";
import { Department, Year } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    linkedin: "",
    github: "",
    portfolio: ""
  });
  
  useEffect(() => {
    if (user) {
      // In a real app, we would fetch the student data from the API
      // For now, we'll use the mock data
      const student = mockStudents.find(s => s.userId === user.id);
      setStudentData(student);
      
      if (student) {
        setFormData({
          linkedin: student.socialLinks.linkedin || "",
          github: student.socialLinks.github || "",
          portfolio: student.socialLinks.portfolio || ""
        });
      }
    }
  }, [user]);

  if (!studentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-placement-primary"></div>
      </div>
    );
  }

  const handleSocialLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSocialLinksSave = () => {
    // In a real app, we would save this to the API
    toast({
      title: "Social links updated",
      description: "Your social links have been successfully updated.",
    });
    setIsEditMode(false);
  };

  const handleResumeUpload = () => {
    // In a real app, we would handle file upload
    toast({
      title: "Resume uploaded",
      description: "Your resume has been successfully uploaded and your skills have been extracted.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="mt-4 sm:mt-0">
          <Button onClick={handleResumeUpload} className="bg-placement-primary hover:bg-placement-primary/90">
            <Upload className="mr-2 h-4 w-4" /> Upload Resume
          </Button>
        </div>
      </div>
      
      {/* Main Profile Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* CARD 1: Profile photo and basic info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback className="text-2xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold mb-1">{user?.firstName} {user?.lastName}</h2>
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <Building className="h-4 w-4 mr-1" />
                <span>{studentData.department}</span>
              </div>
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="border-placement-primary/50 text-placement-primary">
                  {studentData.year}
                </Badge>
                {studentData.isSeda && (
                  <Badge variant="outline" className="border-placement-primary/50 text-placement-primary">
                    SEDA
                  </Badge>
                )}
                {studentData.isPlaced && (
                  <Badge className="bg-green-600">
                    Placed
                  </Badge>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={() => window.open(studentData.resumeUrl, '_blank')}>
                <FileText className="mr-2 h-4 w-4" /> View Resume
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* CARD 2: Social links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Social Links</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? "Cancel" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="linkedin" className="text-sm font-medium flex items-center">
                    <Linkedin className="h-4 w-4 mr-2 text-blue-600" /> LinkedIn
                  </label>
                  <Input 
                    id="linkedin" 
                    placeholder="https://linkedin.com/in/username" 
                    value={formData.linkedin}
                    onChange={handleSocialLinksChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="github" className="text-sm font-medium flex items-center">
                    <Github className="h-4 w-4 mr-2 text-gray-900" /> GitHub
                  </label>
                  <Input 
                    id="github" 
                    placeholder="https://github.com/username" 
                    value={formData.github}
                    onChange={handleSocialLinksChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="portfolio" className="text-sm font-medium flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-green-600" /> Portfolio
                  </label>
                  <Input 
                    id="portfolio" 
                    placeholder="https://yourportfolio.com" 
                    value={formData.portfolio}
                    onChange={handleSocialLinksChange}
                  />
                </div>
                
                <Button className="w-full bg-placement-primary hover:bg-placement-primary/90" onClick={handleSocialLinksSave}>
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <a 
                  href={studentData.socialLinks.linkedin || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!studentData.socialLinks.linkedin && 'pointer-events-none text-gray-400'}`}
                >
                  <Linkedin className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm">{studentData.socialLinks.linkedin || "Not added yet"}</span>
                </a>
                
                <a 
                  href={studentData.socialLinks.github || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!studentData.socialLinks.github && 'pointer-events-none text-gray-400'}`}
                >
                  <Github className="h-5 w-5 mr-2 text-gray-900" />
                  <span className="text-sm">{studentData.socialLinks.github || "Not added yet"}</span>
                </a>
                
                <a 
                  href={studentData.socialLinks.portfolio || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!studentData.socialLinks.portfolio && 'pointer-events-none text-gray-400'}`}
                >
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  <span className="text-sm">{studentData.socialLinks.portfolio || "Not added yet"}</span>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* CARD 3: Personal Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">College</p>
                <p className="font-medium">Example Engineering College</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">PRN</p>
                <p className="font-medium">{studentData.prn}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* CARD 4: Skills extracted from resume */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {studentData.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* CARD 5: Quiz history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Quiz History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium">
              <div>Quiz Name</div>
              <div>Category</div>
              <div>Date</div>
              <div>Score</div>
            </div>
            <Separator />
            {studentData.quizzes.map((quiz: any, index: number) => (
              <div key={index}>
                <div className="grid grid-cols-4 p-3 text-sm">
                  <div>{quiz.quizName}</div>
                  <div>{quiz.category}</div>
                  <div>{new Date(quiz.date).toLocaleDateString()}</div>
                  <div className="font-medium">{quiz.score}%</div>
                </div>
                {index < studentData.quizzes.length - 1 && <Separator />}
              </div>
            ))}
            {studentData.quizzes.length === 0 && (
              <div className="p-3 text-center text-sm text-muted-foreground">
                No quizzes taken yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
