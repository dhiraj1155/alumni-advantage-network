
import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TopNavbar } from "@/components/student/TopNavbar";
import { DesktopSidebar } from "@/components/student/DesktopSidebar";
import { MobileSidebar } from "@/components/student/MobileSidebar";

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
      />

      <div className="flex flex-1">
        <DesktopSidebar handleLogout={handleLogout} />
        
        <MobileSidebar 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen}
          handleLogout={handleLogout}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
