"use client";

import { usePathname } from "next/navigation";

import { Breadcrumb, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { ModeToggle } from "./color-mode-switcher";
import { UserOptions } from "./user-options";
import { CreateOptions } from "./create-options";

const NavHeader = () => {
  const pathname = usePathname();

  return (
    <header className="flex justify-between h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 dark:bg-sidebar bg-sidebar">
      <div className="flex gap-2 items-center">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbLink href="#">
            {pathname === "/"
              ? "Home"
              : pathname.charAt(1).toUpperCase() + pathname.slice(2)}
          </BreadcrumbLink>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-5 pe-3">
        <ModeToggle />
        <CreateOptions />
        <UserOptions />
      </div>
    </header>
  );
};

export default NavHeader;
