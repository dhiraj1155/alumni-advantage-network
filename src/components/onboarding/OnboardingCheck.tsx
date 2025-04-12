
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";
import StudentOnboardingForm from "./StudentOnboardingForm";

const OnboardingCheck = () => {
  const { user } = useAuth();
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
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (studentError && studentError.code !== 'PGRST116') {
            console.error("Error checking student profile:", studentError);
          }

          // If no student record, student needs to complete onboarding
          setNeedsOnboarding(!studentData);
        }
      } catch (error) {
        console.error("Error in profile completion check:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileCompletion();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-placement-primary"></div>
      </div>
    );
  }

  if (needsOnboarding && user?.role === UserRole.STUDENT) {
    return <StudentOnboardingForm />;
  }

  return <Outlet />;
};

export default OnboardingCheck;
