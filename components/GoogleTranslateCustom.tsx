"use client";

import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup } from "@/components/ui/command";
import { Loader2, Globe } from "lucide-react";
import { languages } from "@/lib/consts";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean
}

export default function CustomLanguageSwitcher({ compact = false }: Props) {
  const [selected, setSelected] = useState<string>("en")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/[a-z-]+\/([a-z-]+)/)
    if (match && match[1]) {
      setSelected(match[1])
    }
  }, [])

  const handleLanguageChange = (code: string) => {
    setSelected(code)
    setIsTranslating(true)
    setIsDropdownOpen(false)

    if (code === "en") {
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "googtrans=; domain=" + window.location.hostname + "; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "googtrans=; domain=." + window.location.hostname + "; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      setTimeout(() => {
        location.reload();
      }, 300);
      return;
    }

    const googTransValue = `/en/${code}`;
    document.cookie = `googtrans=${googTransValue}; path=/;`;
    document.cookie = `googtrans=${googTransValue}; domain=${window.location.hostname}; path=/;`;
    document.cookie = `googtrans=${googTransValue}; domain=.${window.location.hostname}; path=/;`;

    setTimeout(() => {
      location.reload();
    }, 500);
  };

  const currentLang = languages.find((l) => l.code === selected)

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={compact ? "ghost" : "outline"}
          size={compact ? "sm" : "default"}
          className={cn(
            "gap-2 items-center",
            compact ? "px-2 h-7 p-0" : "w-[70px] hidden md:flex"
          )}
        >
          {isTranslating ? <Loader2 className="animate-spin h-4 w-4" /> : <Globe size={16} />}
          {!compact && (currentLang?.short ?? selected.toUpperCase())}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Search language..." className="h-9" />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty>Language not found</CommandEmpty>
            <CommandGroup>
              {languages.map((lang) => (
                <CommandItem
                  key={lang.code}
                  onSelect={() => handleLanguageChange(lang.code)}
                  className="cursor-pointer"
                >
                  {lang.short} – {lang.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}