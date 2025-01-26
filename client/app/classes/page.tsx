"use client"

import { useEffect, useState } from "react";
import { CirclePlus, ChevronDown, Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ClassesCards } from "@/components/class-cards";
import { toast } from "react-toastify";

import { createClass, getClasses } from "@/actions/classActions";
import { useLoadingStore } from "@/stores/loadingStore";
import { useClassStore } from "@/stores/classStore";
import { useUserStore } from "@/stores/userStore";

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
  const user = useUserStore((state) => state.user);

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

  const updateFilterOption = (key: string, value: string) => {
    setFilterOption((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [newClassData, setNewClassData] = useState({
    title: "",
    name: "",
    class_time: "",
    year: "",
    image_url: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setNewClassData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateClass = async () => {
    try {
      setLoading(true);
      if (!user) {
        toast.error("User information is missing.");
        return;
      }
      const updatedClassData = { ...newClassData, created_by: { id: user.id, name: user.full_name, role: user.role, email: user.email }, members: [{ id: user.id, name: user.full_name, role: user.role, email: user.email }] };
      const response = await createClass(updatedClassData);

      if (response.success) {
        toast.success("Class created successfully!");

        // Fetch updated classes
        const updatedClasses = await getClasses();
        if (updatedClasses) {
          setClasses(updatedClasses.data);
          toast.success("Updated classes loaded successfully!");
        }
      } else {
        toast.error(response.message || "Failed to create class.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the class.");
    } finally {
      setLoading(false);
    }
  };

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
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      className="border"
                      value={newClassData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      className="border"
                      value={newClassData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="class_time">Class Time</Label>
                    <Input
                      id="class_time"
                      className="border"
                      value={newClassData.class_time}
                      onChange={(e) => handleInputChange("class_time", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      className="border"
                      value={newClassData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image</Label>
                    <Input
                      id="image_url"
                      className="border"
                      type="file"
                      value={newClassData.image_url}
                      onChange={(e) => handleInputChange("image_url", e.target.value)}
                    />
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 w-full">
                <DialogClose asChild className="w-full">
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild className="w-full">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => handleCreateClass()}
                  >
                    Create
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