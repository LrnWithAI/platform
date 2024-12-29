"use client";

import { Breadcrumb, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";

import { usePathname } from "next/navigation";
import { ModeToggle } from "./color-mode-switcher";

const NavHeader = () => {
  const pathname = usePathname();

  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 dark:bg-sidebar bg-sidebar">
      <div className="flex gap-2 items-center">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbLink href="#">
            {pathname === "/"
              ? "Home"
              : pathname.charAt(1).toUpperCase() + pathname.slice(2)}
          </BreadcrumbLink>
        </Breadcrumb>
      </div>

      <div className="flex items-center space-x-3">
        <ModeToggle />

        <Avatar>
          <AvatarImage
            src="teacher_profile_picture.jpg"
            alt="Teacher profile picture"
          />
          <AvatarFallback>MBi</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default NavHeader;
