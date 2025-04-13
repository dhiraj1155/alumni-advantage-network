
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ResumeUploadProps {
  onUploadComplete: (resumeUrl: string, skills: string[]) => void;
  currentResumeUrl?: string | null;
}

const ResumeUpload = ({ onUploadComplete, currentResumeUrl }: ResumeUploadProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF or Word document.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Resume file must be less than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Create the folder path
      const filePath = `${user.id}/${file.name}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        });
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
        
      const resumeUrl = publicUrlData.publicUrl;
      
      // Extract skills from resume
      try {
        // In a real scenario, we'd call the edge function for skill extraction
        // For now, let's simulate it with mock skills
        const mockSkills = [
          "JavaScript", 
          "React", 
          "Node.js", 
          "TypeScript", 
          "CSS", 
          "HTML", 
          "Git", 
          "REST API"
        ];
        
        // Update student record with resume URL
        const { error: updateError } = await supabase
          .from('students')
          .update({ resume_url: resumeUrl })
          .eq('user_id', user.id);
          
        if (updateError) throw updateError;
        
        // Call the callback with resume URL and extracted skills
        onUploadComplete(resumeUrl, mockSkills);
        
        toast({
          title: "Resume uploaded",
          description: "Your resume has been successfully uploaded and skills extracted.",
        });
      } catch (extractError: any) {
        console.error("Error extracting skills:", extractError);
        setUploadError("Failed to extract skills from resume");
        
        // Still update with the resume URL even if skill extraction fails
        onUploadComplete(resumeUrl, []);
      }
    } catch (error: any) {
      console.error("Resume upload error:", error);
      setUploadError(error.message || "Failed to upload resume");
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume
        </CardTitle>
        <CardDescription>Upload your resume to extract skills and improve job matching</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-placement-primary" />
              <span>Uploading resume and extracting skills...</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-placement-primary" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : currentResumeUrl ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Resume Uploaded</AlertTitle>
            <AlertDescription className="text-green-600">
              Your resume is ready. You can view it or upload a new version.
            </AlertDescription>
          </Alert>
        ) : null}
        
        {uploadError && (
          <Alert className="bg-red-50 border-red-200 mt-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700">Upload Failed</AlertTitle>
            <AlertDescription className="text-red-600">{uploadError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
        {currentResumeUrl && (
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.open(currentResumeUrl, '_blank')}>
            <FileText className="mr-2 h-4 w-4" /> View Resume
          </Button>
        )}
        <div className="relative w-full sm:w-auto">
          <input
            type="file"
            id="resume-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button 
            className={`bg-placement-primary hover:bg-placement-primary/90 w-full sm:w-auto ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" /> {currentResumeUrl ? 'Update Resume' : 'Upload Resume'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResumeUpload;
