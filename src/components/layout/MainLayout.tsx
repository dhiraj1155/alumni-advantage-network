
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import { UserRole } from "@/types";

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Redirect to the appropriate dashboard based on user role
  switch (user.role) {
    case UserRole.STUDENT:
      return <Navigate to="/student/dashboard" replace />;
    case UserRole.PLACEMENT:
      return <Navigate to="/placement/dashboard" replace />;
    case UserRole.ALUMNI:
      return <Navigate to="/alumni/dashboard" replace />;
    default:
      return <Outlet />;
  }
};

export default MainLayout;
