"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { Breadcrumb, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { ModeToggle } from "./color-mode-switcher";
import { UserOptions } from "./user-options";
import {
  CreateOptionsLoggedIn,
  CreateOptionsLoggedOut,
} from "./create-options";
import NavLogo from "./nav-logo";

export const NavHeaderLoggedIn = () => {
  const pathname = usePathname();

  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 dark:bg-sidebar bg-sidebar">
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

      <div className="flex items-center gap-3 md:pr-4">
        <ModeToggle />
        <CreateOptionsLoggedIn />
        <UserOptions />
      </div>
    </header>
  );
};

export const NavHeaderLoggedOut = () => {
  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 dark:bg-sidebar bg-sidebar">
      <div className="flex gap-2 items-center">
        <NavLogo />
      </div>

      <div className="flex items-center gap-3 md:pr-4">
        <ModeToggle />
        <CreateOptionsLoggedOut />
        <Button
          className="flex items-center gap-2 bg-purple hover:bg-violet-500 text-white hover:text-white"
          asChild
        >
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
};
