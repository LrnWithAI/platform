import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

import { BrainCircuit } from "lucide-react";

const NavLogo = () => {
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          className={`flex flex-row space-x-2 py-5 ${
            state == "collapsed" ? "mt-2" : "mt-0"
          }`}
        >
          <BrainCircuit className="w-8 h-8" />
          <a href="/" className="text-lg">
            LrnWithAI
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default NavLogo;
