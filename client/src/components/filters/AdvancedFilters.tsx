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
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-sm">
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-200">Advanced Filters</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>
      
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Publication Platform Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-300 mb-1">Publication Platform</Label>
              <Select
                value={filter.platform || "all_platforms"}
                onValueChange={(value) => onFilterChange({ platform: value === "all_platforms" ? "" : value })}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectGroup>
                    <SelectItem value="all_platforms">All Platforms</SelectItem>
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
              <Label className="block text-sm font-medium text-gray-300 mb-1">Publication Date</Label>
              <Select
                value={filter.dateRange || "all_time"}
                onValueChange={(value) => onFilterChange({ dateRange: value === "all_time" ? "" : value })}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectGroup>
                    <SelectItem value="all_time">All Time</SelectItem>
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
              <Label className="block text-sm font-medium text-gray-300 mb-1">Domain</Label>
              <Select
                value={filter.domain || "all_domains"}
                onValueChange={(value) => onFilterChange({ domain: value === "all_domains" ? "" : value })}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectGroup>
                    <SelectItem value="all_domains">All Domains</SelectItem>
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
              <Label className="block text-sm font-medium text-gray-300 mb-1">Author</Label>
              <Input
                type="text"
                placeholder="Author name"
                value={filter.author}
                className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                onChange={(e) => onFilterChange({ author: e.target.value })}
              />
            </div>
            
            {/* Journal Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-300 mb-1">Journal Name</Label>
              <Input
                type="text"
                placeholder="Journal name"
                value={filter.journal}
                className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                onChange={(e) => onFilterChange({ journal: e.target.value })}
              />
            </div>
            
            {/* Sort Option */}
            <div>
              <Label className="block text-sm font-medium text-gray-300 mb-1">Sort By</Label>
              <Select
                value={filter.sortBy || "relevance"}
                onValueChange={(value: any) => onFilterChange({ sortBy: value })}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
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
                <Label className="block text-sm font-medium text-gray-300 mb-1">Start Date</Label>
                <Input
                  type="date"
                  value={filter.customStartDate || ""}
                  className="bg-gray-800 border-gray-700 text-gray-200"
                  onChange={(e) => onFilterChange({ customStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-1">End Date</Label>
                <Input
                  type="date"
                  value={filter.customEndDate || ""}
                  className="bg-gray-800 border-gray-700 text-gray-200"
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
              className="mr-3 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Reset Filters
            </Button>
            <Button
              type="button"
              onClick={onApplyFilters}
              className="bg-primary hover:bg-green-600"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
