
import { SidebarNavigation } from "./SidebarNavigation";

interface DesktopSidebarProps {
  handleLogout: () => void;
}

export const DesktopSidebar = ({ handleLogout }: DesktopSidebarProps) => {
  return (
    <aside className="hidden lg:flex lg:w-64 flex-col bg-white border-r shadow-sm">
      <SidebarNavigation handleLogout={handleLogout} />
    </aside>
  );
};
