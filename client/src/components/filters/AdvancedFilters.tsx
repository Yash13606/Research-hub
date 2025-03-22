import { FC } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { SearchFilter } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AdvancedFiltersProps {
  filter: SearchFilter;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFilterChange: (filter: Partial<SearchFilter>) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  platforms: string[];
  domains: string[];
}

export const AdvancedFilters: FC<AdvancedFiltersProps> = ({
  filter,
  isExpanded,
  onToggleExpand,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  platforms,
  domains
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <span className="font-medium">Advanced Filters</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>
      
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Publication Platform Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Publication Platform</Label>
              <Select
                value={filter.platform}
                onValueChange={(value) => onFilterChange({ platform: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">All Platforms</SelectItem>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Publication Date Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</Label>
              <Select
                value={filter.dateRange}
                onValueChange={(value) => onFilterChange({ dateRange: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">All Time</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="1m">Last Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Domain Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Domain</Label>
              <Select
                value={filter.domain}
                onValueChange={(value) => onFilterChange({ domain: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">All Domains</SelectItem>
                    {domains.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Author Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Author</Label>
              <Input
                type="text"
                placeholder="Author name"
                value={filter.author}
                onChange={(e) => onFilterChange({ author: e.target.value })}
              />
            </div>
            
            {/* Journal Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Journal Name</Label>
              <Input
                type="text"
                placeholder="Journal name"
                value={filter.journal}
                onChange={(e) => onFilterChange({ journal: e.target.value })}
              />
            </div>
            
            {/* Sort Option */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Sort By</Label>
              <Select
                value={filter.sortBy}
                onValueChange={(value: any) => onFilterChange({ sortBy: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="citations">Citation Count</SelectItem>
                    <SelectItem value="date_desc">Newest First</SelectItem>
                    <SelectItem value="date_asc">Oldest First</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Custom date range inputs if "custom" is selected */}
          {filter.dateRange === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Start Date</Label>
                <Input
                  type="date"
                  value={filter.customStartDate || ""}
                  onChange={(e) => onFilterChange({ customStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">End Date</Label>
                <Input
                  type="date"
                  value={filter.customEndDate || ""}
                  onChange={(e) => onFilterChange({ customEndDate: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onResetFilters}
              className="mr-3"
            >
              Reset Filters
            </Button>
            <Button
              type="button"
              onClick={onApplyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
