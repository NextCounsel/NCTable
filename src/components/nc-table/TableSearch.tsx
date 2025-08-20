import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { TableSearchProps } from "./types";
import { cn } from "@/lib/utils";

export function TableSearch({
  searchFields,
  onSearch,
  placeholder = "Search...",
  className,
}: TableSearchProps) {
  const [selectedField, setSelectedField] = useState(
    searchFields[0]?.key || ""
  );
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(selectedField, value);
  };

  const handleFieldChange = (field: string) => {
    setSelectedField(field);
    if (searchValue) {
      onSearch(field, searchValue);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={selectedField} onValueChange={handleFieldChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {searchFields.map((field) => (
            <SelectItem key={field.key} value={field.key}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
