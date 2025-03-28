"use client";

import { usePathname } from "next/navigation";
import { Users, Home, Folder, FilePlus, SquarePlus, LogOut, ClipboardPlus, } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import NavLogo from "./nav-logo";
import { useUserStore } from "@/stores/userStore";
import ClassDialog from "./class-dialog";
import { useState } from "react";

const items = [
  {
    title: "Home",
    url: "home",
    icon: Home,
  },
  {
    title: "Your Library",
    url: "library",
    icon: Folder,
  },
  {
    title: "Your Classes",
    url: "classes",
    icon: Users,
  },
  {
    title: "Test",
    url: "#",
    icon: FilePlus,
  },
  {
    title: "Flashcards",
    url: "#",
    icon: SquarePlus,
  },
  {
    title: "Notes",
    url: "#",
    icon: ClipboardPlus,
  },

  {

    title: "Class",
    url: "#",
    icon: Users,
  },
  {
    title: "Log out",
    url: "#",
    icon: LogOut,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isFlashcardsDialogOpen, setIsFlashcardsDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  // Filter options for no teacher user
  const filteredItems = items.filter(
    (item) => !(item.title === "Class" && user?.role !== "teacher")
  );

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <NavLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.title === "Test" && <Separator className="mb-1" />}
                    {item.title === "Log out" && <Separator className="mb-1" />}
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={
                        (item.url === "/" && pathname === "/") ||
                        `/${item.url}` === pathname
                      }
                    >
                      {/* Ak má item reálnu URL, navigujeme, inak otvárame modál */}
                      {item.url !== "#" ? (
                        <a href={`/${item.url.replace(/^\/+/, "")}`}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            if (item.title === "Class") setIsClassDialogOpen(true);
                            if (item.title === "Test") setIsTestDialogOpen(true);
                            if (item.title === "Flashcards") setIsFlashcardsDialogOpen(true);
                            if (item.title === "Notes") setIsNotesDialogOpen(true);
                          }}
                          className="flex items-center gap-2 w-full text-left"
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </button>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Modály */}
      <ClassDialog
        type="create"
        isOpen={isClassDialogOpen}
        onClose={() => setIsClassDialogOpen(false)}
      />
    </>
  );
}