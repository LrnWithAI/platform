"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, ChevronDown, Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Cards } from "@/components/cards";
import { Class } from "@/types/class";
import { getClasses } from "@/actions/classActions";
import { toast } from "react-toastify";

const orderOptions = [
  { label: "Newest", value: "newest" },
  { label: "Older", value: "older" },
  { label: "A-Z", value: "a-z" },
  { label: "Z-A", value: "z-a" }
]

const filterOptions = [
  { label: "Subject", value: "", type: "input" },
  { label: "Class Time", value: "", type: "input" },
  { label: "Members", value: "", type: "input" },
]

export default function Classes() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await getClasses();
        if (response) {
          setClasses(response.data);
          toast.success("Classes loaded successfully!");
        } else {
          toast.error("Failed to fetch classes.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching classes.");
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);


  const [openOrderOption, setOpenOrderOption] = useState(false)
  const [orderOption, setOrderOption] = useState("")

  const [openFilterOption, setOpenFilterOption] = useState(false)
  const [filterOption, setFilterOption] = useState("")

  return (
    <div className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Your Classes</h1>

      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Create</p>
          <Dialog>
            <DialogTrigger>
              <CirclePlus size={20} />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <div className="text-center">
                    <strong className="font-bold text-2xl">Create Your Class</strong>
                    <p className="font-thin my-3">Details of your class</p>
                  </div>
                </DialogTitle>
                <DialogDescription className="border rounded-xl text-left p-3 flex flex-col gap-5">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      className="border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Subject</Label>
                    <Input
                      id="name"
                      className="border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Class Time</Label>
                    <Input
                      id="name"
                      className="border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Year</Label>
                    <Input
                      id="name"
                      className="border"
                    />
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 w-full">
                <DialogClose asChild className="w-full">
                  <Button type="button" variant="secondary" >
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild className="w-full">
                  <Button type="button" variant="default" onClick={() => router.push('/classes/new-class-example')}>
                    Ok
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 items-center">
          <Popover open={openOrderOption} onOpenChange={setOpenOrderOption}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openOrderOption}
                className="w-[110px] justify-between"
              >
                {orderOption ? orderOptions.find((option) => option.value === orderOption)?.label : "Order by"}
                <ChevronDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0">
              <Command>
                <CommandInput placeholder="Search" />
                <CommandList>
                  <CommandEmpty>Not found</CommandEmpty>
                  <CommandGroup>
                    {orderOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          setOrderOption(currentValue === orderOption ? "" : currentValue)
                          setOpenOrderOption(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            orderOption === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={openFilterOption} onOpenChange={setOpenFilterOption}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFilterOption}
                className="w-[90px] justify-between"
              >
                {filterOption ? filterOption : "Filter"}
                <Filter className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {filterOptions.map((filter) => (
                      filter.type === "input" && filterOption === filter.value && (
                        <div key={filter.value} className="p-1">
                          <Label htmlFor={filter.value}>{filter.label}</Label>
                          <Input
                            id={filter.value}
                            className="border mt-1"
                            onChange={(e) => setFilterOption(e.target.value)}
                          />
                        </div>
                      )
                    ))}

                    <div className="w-full flex justify-between p-1">
                      <Button
                        variant="default"
                        onClick={() => setOpenFilterOption(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setOpenFilterOption(false)}
                      >
                        Confirm
                      </Button>
                    </div>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Cards
        cards={classes}
        navigateTo="/classes/class-example"
      />
    </div >
  )
}