"use client";

import { usePathname } from "next/navigation";
import { Users, Home, Folder, FilePlus, SquarePlus, LogOut, } from "lucide-react";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Separator } from "./ui/separator";

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
    title: "Log out",
    url: "#",
    icon: LogOut,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <h1>Logo</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
                    <a href={`/${item.url.replace(/^\/+/, "")}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}