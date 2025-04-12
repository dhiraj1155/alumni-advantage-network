
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Department, Year } from "@/types";
import { toast } from "sonner";

// Define schema for form validation
const formSchema = z.object({
  prn: z.string().min(5, { message: "PRN must be at least 5 characters long" }),
  department: z.nativeEnum(Department, {
    required_error: "Please select a department",
  }),
  year: z.nativeEnum(Year, {
    required_error: "Please select a year",
  }),
  isSeda: z.boolean().default(false),
  linkedin: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  github: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  leetcode: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  portfolio: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const StudentOnboardingForm = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prn: "",
      department: undefined,
      year: undefined,
      isSeda: false,
      linkedin: "",
      github: "",
      leetcode: "",
      portfolio: "",
    }
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // First insert student data
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          prn: data.prn,
          department: data.department,
          year: data.year,
          is_seda: data.isSeda
        });
        
      if (studentError) throw studentError;
      
      // Then insert social links
      const { error: linksError } = await supabase
        .from('social_links')
        .insert({
          user_id: user.id,
          linkedin: data.linkedin || null,
          github: data.github || null,
          leetcode: data.leetcode || null,
          portfolio: data.portfolio || null
        });
        
      if (linksError) throw linksError;
      
      // Refresh the user's profile to include the new data
      await refreshProfile();
      
      toast.success("Profile setup complete!", {
        description: "Your student profile has been created successfully."
      });
      
      // Navigate to student dashboard
      navigate("/student/dashboard");
      
    } catch (error: any) {
      console.error("Error setting up profile:", error);
      toast.error("Profile setup failed", {
        description: error.message || "There was an error setting up your profile. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle validation errors in a custom submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            <span className="text-placement-primary">Complete</span> Your Profile
          </CardTitle>
          <CardDescription className="text-center">
            Please provide your details to complete your student profile setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* PRN */}
                <FormField
                  control={form.control}
                  name="prn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PRN (Permanent Registration Number)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your PRN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Department).map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Study</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Year).map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SEDA Member */}
                <FormField
                  control={form.control}
                  name="isSeda"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SEDA Member</FormLabel>
                        <FormDescription>
                          Are you a member of the Software Engineering & Developer Association?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Social Links</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* LinkedIn */}
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* GitHub */}
                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* LeetCode */}
                  <FormField
                    control={form.control}
                    name="leetcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LeetCode Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="https://leetcode.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Portfolio */}
                  <FormField
                    control={form.control}
                    name="portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourportfolio.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-placement-primary hover:bg-placement-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Complete Profile Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentOnboardingForm;
