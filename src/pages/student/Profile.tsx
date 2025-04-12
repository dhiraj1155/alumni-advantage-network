
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const { toast: shadowToast } = useToast();
  const [studentData, setStudentData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    linkedin: "",
    github: "",
    portfolio: ""
  });
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
          
        // Get social links
        const { data: socialLinks, error: socialError } = await supabase
          .from('social_links')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching student data:", error);
          // Fallback to mock data
          const mockStudent = mockStudents.find(s => s.userId === user.id);
          setStudentData(mockStudent);
          
          if (mockStudent) {
            setFormData({
              linkedin: mockStudent.socialLinks.linkedin || "",
              github: mockStudent.socialLinks.github || "",
              portfolio: mockStudent.socialLinks.portfolio || ""
            });
          }
        } else {
          // Merge student data with social links and mock skills/quizzes for now
          const mockStudent = mockStudents.find(s => s.userId === user.id);
          
          setStudentData({
            ...studentProfile,
            skills: mockStudent?.skills || [],
            quizzes: mockStudent?.quizzes || [],
            socialLinks: socialLinks || { linkedin: "", github: "", portfolio: "" }
          });
          
          setFormData({
            linkedin: socialLinks?.linkedin || "",
            github: socialLinks?.github || "",
            portfolio: socialLinks?.portfolio || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        // Fallback to mock data
        const mockStudent = mockStudents.find(s => s.userId === user.id);
        setStudentData(mockStudent);
        
        if (mockStudent) {
          setFormData({
            linkedin: mockStudent.socialLinks.linkedin || "",
            github: mockStudent.socialLinks.github || "",
            portfolio: mockStudent.socialLinks.portfolio || ""
          });
        }
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

  const handleSocialLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSocialLinksSave = async () => {
    try {
      // Check if social links record exists
      const { data: existingLinks, error: checkError } = await supabase
        .from('social_links')
        .select('id')
        .eq('user_id', user?.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        // Error other than "no rows returned"
        console.error("Error checking social links:", checkError);
        toast("Failed to update", {
          description: "There was an error updating your social links. Please try again.",
        });
        return;
      }
      
      if (existingLinks) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('social_links')
          .update({
            linkedin: formData.linkedin,
            github: formData.github,
            portfolio: formData.portfolio
          })
          .eq('id', existingLinks.id);
          
        if (updateError) {
          console.error("Error updating social links:", updateError);
          toast("Failed to update", {
            description: "There was an error updating your social links. Please try again.",
          });
          return;
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('social_links')
          .insert({
            user_id: user?.id,
            linkedin: formData.linkedin,
            github: formData.github,
            portfolio: formData.portfolio
          });
          
        if (insertError) {
          console.error("Error inserting social links:", insertError);
          toast("Failed to save", {
            description: "There was an error saving your social links. Please try again.",
          });
          return;
        }
      }
      
      // Update local state
      setStudentData(prev => ({
        ...prev,
        socialLinks: {
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio
        }
      }));
      
      toast("Links updated", {
        description: "Your social links have been successfully updated.",
      });
      
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving social links:", error);
      toast("Failed to save", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleResumeUpload = () => {
    // In a real app, we would handle file upload
    shadowToast({
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
                {studentData.is_seda && (
                  <Badge variant="outline" className="border-placement-primary/50 text-placement-primary">
                    SEDA
                  </Badge>
                )}
                {studentData.is_placed && (
                  <Badge className="bg-green-600">
                    Placed
                  </Badge>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={() => window.open(studentData.resume_url, '_blank')}>
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
                  href={studentData.socialLinks?.linkedin || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!studentData.socialLinks?.linkedin && 'pointer-events-none text-gray-400'}`}
                >
                  <Linkedin className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm">{studentData.socialLinks?.linkedin || "Not added yet"}</span>
                </a>
                
                <a 
                  href={studentData.socialLinks?.github || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!studentData.socialLinks?.github && 'pointer-events-none text-gray-400'}`}
                >
                  <Github className="h-5 w-5 mr-2 text-gray-900" />
                  <span className="text-sm">{studentData.socialLinks?.github || "Not added yet"}</span>
                </a>
                
                <a 
                  href={studentData.socialLinks?.portfolio || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!studentData.socialLinks?.portfolio && 'pointer-events-none text-gray-400'}`}
                >
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  <span className="text-sm">{studentData.socialLinks?.portfolio || "Not added yet"}</span>
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
            {studentData.skills && studentData.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                {skill}
              </Badge>
            ))}
            {(!studentData.skills || studentData.skills.length === 0) && (
              <p className="text-muted-foreground">No skills added yet. Upload your resume to extract skills.</p>
            )}
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
            {studentData.quizzes && studentData.quizzes.map((quiz: any, index: number) => (
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
            {(!studentData.quizzes || studentData.quizzes.length === 0) && (
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
