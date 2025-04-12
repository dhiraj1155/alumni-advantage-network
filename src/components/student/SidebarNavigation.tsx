
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { 
  LayoutDashboard, 
  User, 
  Award, 
  Briefcase, 
  Book, 
  MessageSquare, 
  FileText 
} from "lucide-react";

interface SidebarNavigationProps {
  handleLogout: () => void;
  isMobile?: boolean;
  onItemClick?: () => void;
}

export const SidebarNavigation = ({ 
  handleLogout, 
  isMobile = false,
  onItemClick 
}: SidebarNavigationProps) => {
  const { user } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "Profile", path: "/student/profile", icon: User },
    { name: "Leaderboard", path: "/student/leaderboard", icon: Award },
    { name: "Opportunities", path: "/student/opportunities", icon: Briefcase },
    { name: "Quizzes", path: "/student/quizzes", icon: Book },
    { name: "Interview Bot", path: "/student/interview-bot", icon: MessageSquare },
    { name: "Resume Analyzer", path: "/student/resume-analyzer", icon: FileText },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-8 mt-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar} alt={user?.firstName} />
          <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-sm">{user?.firstName} {user?.lastName}</span>
          <span className="text-xs text-gray-500">Student</span>
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
              isActive 
                ? "bg-placement-primary text-white" 
                : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={isMobile ? onItemClick : undefined}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};
