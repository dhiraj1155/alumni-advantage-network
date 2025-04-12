
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Building, GraduationCap, FileText, Briefcase, Github, Linkedin, Globe, Upload, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Department, Year } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the types for our database data
interface StudentData {
  id: string;
  prn: string;
  department: Department;
  year: Year;
  is_seda: boolean;
  is_placed: boolean;
  resume_url: string | null;
}

interface SocialLinks {
  linkedin: string | null;
  github: string | null;
  leetcode: string | null;
  portfolio: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    linkedin: "",
    github: "",
    leetcode: "",
    portfolio: ""
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      
      try {
        // Fetch student data
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (studentError) {
          console.error("Error fetching student data:", studentError);
          throw studentError;
        }
        
        // Fetch social links
        const { data: linksData, error: linksError } = await supabase
          .from('social_links')
          .select('linkedin, github, leetcode, portfolio')
          .eq('user_id', user.id)
          .single();
          
        if (linksError) {
          console.error("Error fetching social links:", linksError);
          throw linksError;
        }
        
        setStudentData(studentData);
        setSocialLinks(linksData);
        
        // Initialize form data with fetched values
        setFormData({
          linkedin: linksData.linkedin || "",
          github: linksData.github || "",
          leetcode: linksData.leetcode || "",
          portfolio: linksData.portfolio || ""
        });
        
      } catch (error) {
        toast.error("Failed to load profile data", {
          description: "Please try refreshing the page."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
  }, [user]);

  const handleSocialLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSocialLinksSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('social_links')
        .update({
          linkedin: formData.linkedin || null,
          github: formData.github || null,
          leetcode: formData.leetcode || null,
          portfolio: formData.portfolio || null
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setSocialLinks({
        linkedin: formData.linkedin || null,
        github: formData.github || null,
        leetcode: formData.leetcode || null,
        portfolio: formData.portfolio || null
      });
      
      toast.success("Social links updated", {
        description: "Your social links have been successfully updated."
      });
      
      setIsEditMode(false);
    } catch (error: any) {
      toast.error("Failed to update social links", {
        description: error.message || "Please try again."
      });
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      toast.error("Invalid file format", {
        description: "Please upload a PDF file."
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 5MB."
      });
      return;
    }
    
    try {
      const fileName = `${user.id}_${Date.now()}.pdf`;
      
      // Check if storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some(bucket => bucket.name === 'resumes')) {
        await supabase.storage.createBucket('resumes', {
          public: false
        });
      }
      
      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Create a signed URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from('resumes')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry
        
      if (urlError) throw urlError;
      
      // Update the resume_url in the student record
      const { error: updateError } = await supabase
        .from('students')
        .update({ resume_url: urlData.signedUrl })
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setStudentData(prev => prev ? { ...prev, resume_url: urlData.signedUrl } : null);
      
      toast.success("Resume uploaded", {
        description: "Your resume has been successfully uploaded."
      });
      
    } catch (error: any) {
      console.error("Resume upload error:", error);
      toast.error("Resume upload failed", {
        description: error.message || "Please try again."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-placement-primary"></div>
      </div>
    );
  }
  
  if (!studentData || !socialLinks) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't find your student profile. Please complete the onboarding process.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="mt-4 sm:mt-0">
          <Button
            component="label"
            className="bg-placement-primary hover:bg-placement-primary/90"
            htmlFor="resume-upload"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Resume
            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleResumeUpload}
            />
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
              {studentData.resume_url ? (
                <Button variant="outline" className="w-full" onClick={() => window.open(studentData.resume_url || '#', '_blank')}>
                  <FileText className="mr-2 h-4 w-4" /> View Resume
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  <FileText className="mr-2 h-4 w-4" /> No Resume Uploaded
                </Button>
              )}
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
                  <label htmlFor="leetcode" className="text-sm font-medium flex items-center">
                    <svg 
                      className="h-4 w-4 mr-2 text-orange-500" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.357.497 1.823.043l.055-.043c.515-.515.515-1.357 0-1.872L15.286 6.01c-1.746-1.746-4.572-1.746-6.318 0l-4.319 4.38c-1.746 1.746-1.746 4.572 0 6.318l4.332 4.363c1.746 1.746 4.572 1.746 6.318 0l4.363-4.363c.515-.515.515-1.357 0-1.872s-1.357-.466-1.872 0h.013z" />
                    </svg>
                    LeetCode
                  </label>
                  <Input 
                    id="leetcode" 
                    placeholder="https://leetcode.com/username" 
                    value={formData.leetcode}
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
                  href={socialLinks.linkedin || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!socialLinks.linkedin && 'pointer-events-none text-gray-400'}`}
                >
                  <Linkedin className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm">{socialLinks.linkedin || "Not added yet"}</span>
                </a>
                
                <a 
                  href={socialLinks.github || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!socialLinks.github && 'pointer-events-none text-gray-400'}`}
                >
                  <Github className="h-5 w-5 mr-2 text-gray-900" />
                  <span className="text-sm">{socialLinks.github || "Not added yet"}</span>
                </a>
                
                <a 
                  href={socialLinks.leetcode || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!socialLinks.leetcode && 'pointer-events-none text-gray-400'}`}
                >
                  <svg 
                    className="h-5 w-5 mr-2 text-orange-500" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.357.497 1.823.043l.055-.043c.515-.515.515-1.357 0-1.872L15.286 6.01c-1.746-1.746-4.572-1.746-6.318 0l-4.319 4.38c-1.746 1.746-1.746 4.572 0 6.318l4.332 4.363c1.746 1.746 4.572 1.746 6.318 0l4.363-4.363c.515-.515.515-1.357 0-1.872s-1.357-.466-1.872 0h.013z" />
                  </svg>
                  <span className="text-sm">{socialLinks.leetcode || "Not added yet"}</span>
                </a>
                
                <a 
                  href={socialLinks.portfolio || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 ${!socialLinks.portfolio && 'pointer-events-none text-gray-400'}`}
                >
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  <span className="text-sm">{socialLinks.portfolio || "Not added yet"}</span>
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
      
      {/* CARD 4: Skills section (will be populated from resume analysis in future) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1">JavaScript</Badge>
            <Badge variant="outline" className="px-3 py-1">React</Badge>
            <Badge variant="outline" className="px-3 py-1">TypeScript</Badge>
            <Badge variant="outline" className="px-3 py-1">Node.js</Badge>
            <Badge variant="outline" className="px-3 py-1">Python</Badge>
            <Badge variant="outline" className="px-3 py-1">SQL</Badge>
            <Badge variant="outline" className="px-3 py-1">Git</Badge>
            <Badge variant="outline" className="px-3 py-1">Docker</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Skills will be automatically extracted when you upload your resume.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
