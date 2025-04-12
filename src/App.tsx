
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import StudentLayout from "@/components/layout/StudentLayout";
import PlacementLayout from "@/components/layout/PlacementLayout";
import AlumniLayout from "@/components/layout/AlumniLayout";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentLeaderboard from "./pages/student/Leaderboard";
import StudentOpportunities from "./pages/student/Opportunities";
import PlacementDashboard from "./pages/placement/Dashboard";
import PlacementOpportunities from "./pages/placement/Opportunities";
import PlacementStudents from "./pages/placement/Students";
import PlacementRequests from "./pages/placement/Requests";
import AlumniDashboard from "./pages/alumni/Dashboard";
import AlumniPostJobs from "./pages/alumni/PostJobs";
import AlumniSeminars from "./pages/alumni/Seminars";
import AlumniReferrals from "./pages/alumni/Referrals";
import NotFound from "./pages/NotFound";
import { UserRole } from "./types";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Main Layout */}
            <Route path="/" element={<MainLayout />} />
            
            {/* Student Routes */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="leaderboard" element={<StudentLeaderboard />} />
              <Route path="opportunities" element={<StudentOpportunities />} />
              <Route path="quizzes" element={<div>Quizzes - Coming Soon</div>} />
              {/* Removed interviewer bot and resume analyzer routes */}
            </Route>
            
            {/* Placement Cell Routes */}
            <Route 
              path="/placement" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.PLACEMENT]}>
                  <PlacementLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<PlacementDashboard />} />
              <Route path="opportunities" element={<PlacementOpportunities />} />
              <Route path="students" element={<PlacementStudents />} />
              <Route path="requests" element={<PlacementRequests />} />
            </Route>
            
            {/* Alumni Routes */}
            <Route 
              path="/alumni" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.ALUMNI]}>
                  <AlumniLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AlumniDashboard />} />
              <Route path="post-jobs" element={<AlumniPostJobs />} />
              <Route path="seminars" element={<AlumniSeminars />} />
              <Route path="referrals" element={<AlumniReferrals />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
