
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { mockUsers, setCurrentUserByRole } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setTestUser: (role: UserRole) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to load user profile data
  const loadUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      if (data) {
        const userData: User = {
          id: userId,
          email: userEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role as UserRole,
          avatar: data.avatar
        };
        
        return userData;
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
    return null;
  };

  // Function to refresh user profile
  const refreshProfile = async () => {
    if (!session?.user) return;
    
    const userData = await loadUserProfile(session.user.id, session.user.email || '');
    if (userData) {
      setUser(userData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          const userData = await loadUserProfile(
            currentSession.user.id, 
            currentSession.user.email || ''
          );
          
          if (userData) {
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          const userData = await loadUserProfile(
            initialSession.user.id, 
            initialSession.user.email || ''
          );
          
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Signing in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        
        // Handle specific errors
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email not verified",
            description: "Please check your email and verify your account before logging in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return false;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      return true;
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Registering with:", email, firstName, lastName, role);
      
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role,
          },
          emailRedirectTo: window.location.origin + '/auth/login'
        }
      });
      
      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Show verification email notification
      toast({
        title: "Registration successful",
        description: "A verification email has been sent to your inbox. Please verify your email to continue.",
      });
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      setTestUser, 
      refreshProfile 
    }}>
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
