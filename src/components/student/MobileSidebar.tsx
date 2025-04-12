
import { X } from "lucide-react";
import { SidebarNavigation } from "./SidebarNavigation";

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLogout: () => void;
}

export const MobileSidebar = ({ 
  isOpen, 
  setIsOpen, 
  handleLogout 
}: MobileSidebarProps) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-40 flex">
      <div 
        className="fixed inset-0 bg-black/20" 
        onClick={() => setIsOpen(false)}
      />
      <div className="relative flex flex-col w-64 max-w-xs bg-white pb-4 overflow-y-auto">
        <SidebarNavigation 
          handleLogout={handleLogout} 
          isMobile={true}
          onItemClick={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
};
