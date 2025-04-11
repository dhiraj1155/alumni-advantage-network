
import React, { createContext, useContext } from "react";
import { User, UserRole } from "@/types";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useMockAuth } from "@/hooks/useMockAuth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setTestUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, login, register, logout } = useSupabaseAuth();
  const { setTestUser } = useMockAuth();

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    setTestUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
