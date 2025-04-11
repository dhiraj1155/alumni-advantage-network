
import { useState } from "react";
import { User, UserRole } from "@/types";
import { mockUsers, setCurrentUserByRole } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";

export const useMockAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  // Helper function for testing different user roles
  const setTestUser = (role: UserRole) => {
    const testUser = setCurrentUserByRole(role);
    if (testUser) {
      setUser(testUser);
      toast({
        title: "Test user set",
        description: `Now viewing as ${role}: ${testUser.firstName} ${testUser.lastName}`,
      });
    }
  };

  return {
    user,
    setTestUser
  };
};
