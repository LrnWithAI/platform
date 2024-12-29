import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";

import { BrainCircuit } from "lucide-react";

const NavLogo = () => {
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="outline"
          className={`flex flex-row space-x-2 mb-3 mt-1 ${
            state == "collapsed" ? "mb-3" : ""
          }`}
        >
          <BrainCircuit className="w-8 h-8" />
          <a href="/" className="text-lg">
            LrnWithAI
          </a>
        </SidebarMenuButton>
        <Separator className="-mb-1" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default NavLogo;
