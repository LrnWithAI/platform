import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { BrainCircuit } from "lucide-react";

const NavLogo = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          className="flex flex-row space-x-2"
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
