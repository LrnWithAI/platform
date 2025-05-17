"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Check, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTestsByUserId } from "@/actions/testActions";
import { getNotesByUserId } from "@/actions/notesActions";
import { getFlashcardsSetsByUserId } from "@/actions/flashcardsActions";
import { Test } from "@/types/test";
import { Note } from "@/types/note";
import { FlashcardsSet } from "@/types/flashcards";
import { useLoadingStore } from "@/stores/loadingStore";
import { useUserStore } from "@/stores/userStore";
import {
  CreateTestDialog,
  CreateFlashcardsDialog,
  CreateNotesDialog,
} from "@/components/create-test-dialog";
import { Cards } from "@/components/universal_cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const orderOptions = [
  { label: "Newest", value: "newest" },
  { label: "Older", value: "older" },
  { label: "A-Z", value: "a-z" },
  { label: "Z-A", value: "z-a" },
];

const filterOptions = [{ label: "Name", value: "", name: "title" }];

export default function Library() {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const user = useUserStore((state) => state.user);

  const [tests, setTests] = useState([] as Test[]);
  const [flashcards, setFlashcards] = useState([] as FlashcardsSet[]);
  const [notes, setNotes] = useState([] as Note[]);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;
      const response = await getTestsByUserId(user?.id);
      if (response.success) {
        setTests(response.data);
        toast.success("Tests fetched successfully!");
      } else {
        toast.error(response.message || "Failed to fetch tests.");
      }
      return response.data ?? [];
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("An error occurred while fetching tests.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, setLoading]);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;
      const response = await getNotesByUserId(user?.id);
      if (response.success) {
        setNotes(response.data);
        toast.success("Notes fetched successfully!");
      } else {
        toast.error(response.message || "Failed to fetch notes.");
      }
      return response.data ?? [];
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("An error occurred while fetching notes.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, setLoading]);

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;
      const response = await getFlashcardsSetsByUserId(user?.id);
      if (response.success) {
        setFlashcards(response.data);
        toast.success("Flashcards fetched successfully!");
      } else {
        toast.error(response.message || "Failed to fetch flashcards.");
      }
      return response.data ?? [];
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("An error occurred while fetching flashcards.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, setLoading]);

  useEffect(() => {
    fetchTests();
    fetchFlashcards();
    fetchNotes();
  }, [fetchTests, fetchFlashcards, fetchNotes]);

  // Stavy pre sekciu Tests
  const [openOrderOptionTests, setOpenOrderOptionTests] = useState(false);
  const [openFilterOptionTests, setOpenFilterOptionTests] = useState(false);
  const [orderOptionForTests, setOrderOptionForTests] = useState("");
  const [filterOptionForTests, setFilterOptionForTests] = useState({});

  // Stavy pre sekciu FlashCards
  const [openOrderOptionFlashcards, setOpenOrderOptionFlashcards] =
    useState(false);
  const [openFilterOptionFlashcards, setOpenFilterOptionFlashcards] =
    useState(false);
  const [orderOptionForFlashcards, setOrderOptionForFlashcards] = useState("");
  const [filterOptionForFlashcards, setFilterOptionForFlashcards] = useState(
    {}
  );

  // Stavy pre sekciu Notes
  const [openOrderOptionNotes, setOpenOrderOptionNotes] = useState(false);
  const [openFilterOptionNotes, setOpenFilterOptionNotes] = useState(false);
  const [orderOptionForNotes, setOrderOptionForNotes] = useState("");
  const [filterOptionForNotes, setFilterOptionForNotes] = useState({});

  const updateFilterOptionForTests = (key: string, value: string) => {
    setFilterOptionForTests((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFilterOptionForFlashcards = (key: string, value: string) => {
    setFilterOptionForFlashcards((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFilterOptionForNotes = (key: string, value: string) => {
    setFilterOptionForNotes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Your Library</h1>

      {/* Tests */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Tests</p>
          <CreateTestDialog />
        </div>

        <div className="flex gap-2 items-center">
          <Popover
            open={openOrderOptionTests}
            onOpenChange={setOpenOrderOptionTests}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openOrderOptionTests}
                className="w-[110px] justify-between"
              >
                {orderOptionForTests
                  ? orderOptions.find(
                    (option) => option.value === orderOptionForTests
                  )?.label
                  : "Order by"}
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
                          setOrderOptionForTests(
                            currentValue === orderOptionForTests
                              ? ""
                              : currentValue
                          );
                          setOpenOrderOptionTests(false);
                        }}
                        className="hover:cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            orderOptionForTests === option.value
                              ? "opacity-100"
                              : "opacity-0"
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

          <Popover
            open={openFilterOptionTests}
            onOpenChange={setOpenFilterOptionTests}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFilterOptionTests}
                className="w-[105px] justify-between"
              >
                {Object.keys(filterOptionForTests).length > 0
                  ? "Filtered"
                  : "Filter"}
                <Filter className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {filterOptions.map((filter) => (
                      <div key={filter.label} className="p-1">
                        <Label htmlFor={`tests-${filter.value}`}>
                          {filter.label}
                        </Label>
                        <Input
                          id={`tests-${filter.value}`}
                          value={filterOptionForTests[filter.name] || ""}
                          className="border mt-1"
                          onChange={(e) =>
                            updateFilterOptionForTests(
                              filter.name,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Cards
        orderOption={orderOptionForTests}
        filterOption={filterOptionForTests}
        data={tests}
        type="tests"
        refreshData={fetchTests}
      />

      {/* Flashcards */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Flashcards</p>
          <CreateFlashcardsDialog />
        </div>

        <div className="flex gap-2 items-center">
          <Popover
            open={openOrderOptionFlashcards}
            onOpenChange={setOpenOrderOptionFlashcards}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openOrderOptionFlashcards}
                className="w-[110px] justify-between"
              >
                {orderOptionForFlashcards
                  ? orderOptions.find(
                    (option) => option.value === orderOptionForFlashcards
                  )?.label
                  : "Order by"}
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
                          setOrderOptionForFlashcards(
                            currentValue === orderOptionForFlashcards
                              ? ""
                              : currentValue
                          );
                          setOpenOrderOptionFlashcards(false);
                        }}
                        className="hover:cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            orderOptionForFlashcards === option.value
                              ? "opacity-100"
                              : "opacity-0"
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

          <Popover
            open={openFilterOptionFlashcards}
            onOpenChange={setOpenFilterOptionFlashcards}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFilterOptionFlashcards}
                className="w-[105px] justify-between"
              >
                {Object.keys(filterOptionForFlashcards).length > 0
                  ? "Filtered"
                  : "Filter"}
                <Filter className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {filterOptions.map((filter) => (
                      <div key={filter.label} className="p-1">
                        <Label htmlFor={`tests-${filter.value}`}>
                          {filter.label}
                        </Label>
                        <Input
                          id={`tests-${filter.value}`}
                          value={filterOptionForFlashcards[filter.name] || ""}
                          className="border mt-1"
                          onChange={(e) =>
                            updateFilterOptionForFlashcards(
                              filter.name,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Cards
        orderOption={orderOptionForFlashcards}
        filterOption={filterOptionForFlashcards}
        data={flashcards}
        type="flashcards"
        refreshData={fetchFlashcards}
      />

      {/* Notes */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Notes</p>
          <CreateNotesDialog />
        </div>

        <div className="flex gap-2 items-center">
          <Popover
            open={openOrderOptionNotes}
            onOpenChange={setOpenOrderOptionNotes}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openOrderOptionNotes}
                className="w-[110px] justify-between"
              >
                {orderOptionForNotes
                  ? orderOptions.find(
                    (option) => option.value === orderOptionForNotes
                  )?.label
                  : "Order by"}
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
                          setOrderOptionForNotes(
                            currentValue === orderOptionForNotes
                              ? ""
                              : currentValue
                          );
                          setOpenOrderOptionNotes(false);
                        }}
                        className="hover:cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            orderOptionForNotes === option.value
                              ? "opacity-100"
                              : "opacity-0"
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

          <Popover
            open={openFilterOptionNotes}
            onOpenChange={setOpenFilterOptionNotes}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openFilterOptionNotes}
                className="w-[105px] justify-between"
              >
                {Object.keys(filterOptionForNotes).length > 0
                  ? "Filtered"
                  : "Filter"}
                <Filter className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {filterOptions.map((filter) => (
                      <div key={filter.label} className="p-1">
                        <Label htmlFor={`notes-${filter.value}`}>
                          {filter.label}
                        </Label>
                        <Input
                          id={`notes-${filter.value}`}
                          value={filterOptionForNotes[filter.name] || ""}
                          className="border mt-1"
                          onChange={(e) =>
                            updateFilterOptionForNotes(
                              filter.name,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Cards
        orderOption={orderOptionForNotes}
        filterOption={filterOptionForNotes}
        data={notes}
        type="notes"
        refreshData={fetchNotes}
      />
    </div>
  );
}
