"use client"

import { useEffect, useState } from "react";
import { ChevronDown, Filter, Check, CirclePlus } from "lucide-react";
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ClassesCards } from "@/components/class-cards";
import { toast } from "react-toastify";

import { getClasses } from "@/actions/classActions";
import { useLoadingStore } from "@/stores/loadingStore";
import { useClassStore } from "@/stores/classStore";
import ClassDialog from "@/components/class-dialog";

const orderOptions = [
  { label: "Newest", value: "newest" },
  { label: "Older", value: "older" },
  { label: "A-Z", value: "a-z" },
  { label: "Z-A", value: "z-a" }
]

const filterOptions = [
  { label: "Name", value: "", name: "title" },
  { label: "Class Time", value: "", name: "class_time" },
  { label: "Members", value: "", name: "members" },
]

export default function Classes() {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
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
  const [filterOption, setFilterOption] = useState({})

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const updateFilterOption = (key: string, value: string) => {
    setFilterOption((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Your Classes</h1>

      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Create</p>
          <CirclePlus size={20} className="hover:cursor-pointer" onClick={() => setIsDialogOpen(true)} />
          <ClassDialog type="create" isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
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
                <CommandList>
                  <CommandEmpty>Not found</CommandEmpty>
                  <CommandGroup>
                    {orderOptions.map((option) => (
                      <CommandItem
                        key={option.label}
                        value={option.value}
                        onSelect={(currentValue) => {
                          setOrderOption(currentValue === orderOption ? "" : currentValue)
                          setOpenOrderOption(false)
                        }}
                        className="hover:cursor-pointer"
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
                className="w-[105px] justify-between"
              >
                {Object.keys(filterOption).length > 0 ? "Filtered" : "Filter"}
                <Filter className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {filterOptions.map((filter) => (
                      <div key={filter.label} className="p-1">
                        <Label htmlFor={filter.value}>{filter.label}</Label>
                        <Input
                          id={filter.value}
                          value={filterOption[filter.name] || ""}
                          className="border mt-1"
                          onChange={(e) => updateFilterOption(filter.name, e.target.value)}
                        />
                      </div>
                    ))}

                    {/* <div className="w-full flex justify-between p-1">
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
                    </div> */}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ClassesCards orderOption={orderOption} filterOption={filterOption} />
    </div >
  )
}