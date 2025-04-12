
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";
import { toast } from "sonner";
import StudentOnboardingForm from "./StudentOnboardingForm";

const OnboardingCheck = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Only check for student profiles
        if (user.role === UserRole.STUDENT) {
          // Check if student has completed onboarding
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (studentError) {
            console.error("Error checking student profile:", studentError);
            toast.error("Error checking profile status");
          }

          // If no student record, student needs to complete onboarding
          setNeedsOnboarding(!studentData);
        }
      } catch (error) {
        console.error("Error in profile completion check:", error);
        toast.error("Error checking profile status");
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileCompletion();
  }, [user]);

  // This function will be called after successful onboarding submission
  const handleOnboardingSubmitted = async () => {
    setIsLoading(true);
    await refreshProfile();
    setNeedsOnboarding(false);
    setIsLoading(false);
    navigate("/student/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-placement-primary"></div>
      </div>
    );
  }

  if (needsOnboarding && user?.role === UserRole.STUDENT) {
    return <StudentOnboardingForm onSubmitSuccess={handleOnboardingSubmitted} />;
  }

  return <Outlet />;
};

export default OnboardingCheck;
