import { FC, useState, FormEvent, useEffect, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdvancedFilters } from "./filters/AdvancedFilters";
import { SearchFilter } from "@/lib/types";
import { PLATFORMS, DOMAINS } from "@/lib/constants";
import { debounce } from "@/lib/utils";

interface SearchSectionProps {
  initialFilter?: SearchFilter;
  onSearch: (filter: SearchFilter) => void;
}

export const SearchSection: FC<SearchSectionProps> = ({ initialFilter, onSearch }) => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/:tab");
  
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [filter, setFilter] = useState<SearchFilter>(initialFilter || {
    query: "",
    platform: "",
    domain: "",
    author: "",
    journal: "",
    dateRange: "",
    sortBy: "relevance",
    page: 1,
    limit: 10
  });
  
  useEffect(() => {
    // Update the filter when the location changes (e.g., direct link or back button)
    const searchParams = new URLSearchParams(window.location.search);
    const urlFilter: Partial<SearchFilter> = {};
    
    if (searchParams.has("query")) urlFilter.query = searchParams.get("query") || "";
    if (searchParams.has("platform")) urlFilter.platform = searchParams.get("platform") || "";
    if (searchParams.has("domain")) urlFilter.domain = searchParams.get("domain") || "";
    if (searchParams.has("author")) urlFilter.author = searchParams.get("author") || "";
    if (searchParams.has("journal")) urlFilter.journal = searchParams.get("journal") || "";
    if (searchParams.has("dateRange")) urlFilter.dateRange = searchParams.get("dateRange") as any || "";
    if (searchParams.has("sortBy")) urlFilter.sortBy = searchParams.get("sortBy") as any || "relevance";
    if (searchParams.has("page")) urlFilter.page = parseInt(searchParams.get("page") || "1");
    
    // Only update if there are actual filter params
    if (Object.keys(urlFilter).length > 0) {
      setFilter(prev => ({ ...prev, ...urlFilter }));
      
      // Expand advanced filters if any of the advanced options are set
      if (urlFilter.platform || urlFilter.domain || urlFilter.author || 
          urlFilter.journal || urlFilter.dateRange || urlFilter.sortBy !== "relevance") {
        setIsAdvancedExpanded(true);
      }
      
      // Trigger search with the URL parameters
      onSearch({ ...filter, ...urlFilter });
    }
  }, [location]);
  
  // Update URL when filter changes
  useEffect(() => {
    // Only update if this is not the initial render
    if (initialFilter) {
      updateUrl();
    }
  }, [filter]);

  // Update URL without causing a navigation
  const updateUrl = () => {
    const searchParams = new URLSearchParams();
    
    if (filter.query) searchParams.set("query", filter.query);
    if (filter.platform) searchParams.set("platform", filter.platform);
    if (filter.domain) searchParams.set("domain", filter.domain);
    if (filter.author) searchParams.set("author", filter.author);
    if (filter.journal) searchParams.set("journal", filter.journal);
    if (filter.dateRange) searchParams.set("dateRange", filter.dateRange);
    if (filter.sortBy && filter.sortBy !== "relevance") searchParams.set("sortBy", filter.sortBy);
    if (filter.page && filter.page > 1) searchParams.set("page", filter.page.toString());
    
    const queryString = searchParams.toString();
    const newUrl = params?.tab ? `/${params.tab}${queryString ? `?${queryString}` : ''}` : 
                                  `/${queryString ? `?${queryString}` : ''}`;
    
    // Only update the URL if it's different
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  };
  
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Reset to page 1 when search is triggered
    const newFilter = { ...filter, page: 1 };
    setFilter(newFilter);
    onSearch(newFilter);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, query: e.target.value });
  };
  
  const debouncedSearch = useCallback(
    debounce((newFilter: SearchFilter) => {
      onSearch(newFilter);
    }, 300),
    []
  );
  
  const handleFilterChange = (newFilterValues: Partial<SearchFilter>) => {
    const newFilter = { ...filter, ...newFilterValues, page: 1 };
    setFilter(newFilter);
    debouncedSearch(newFilter);
  };
  
  const handleResetFilters = () => {
    const resetFilter = {
      ...filter,
      platform: "",
      domain: "",
      author: "",
      journal: "",
      dateRange: "",
      sortBy: "relevance",
      page: 1
    };
    setFilter(resetFilter);
    onSearch(resetFilter);
  };
  
  return (
    <section className="mb-8">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Find Research Papers</h2>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Input
              type="text"
              className="w-full pl-12 pr-24 py-6 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search by title, author, keywords..."
              value={filter.query}
              onChange={handleInputChange}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Button 
              type="submit"
              className="absolute inset-y-0 right-0 px-4 bg-primary text-white rounded-r-lg hover:bg-indigo-700 transition"
            >
              Search
            </Button>
          </div>
        </form>
        
        {/* Advanced Filters */}
        <AdvancedFilters
          filter={filter}
          isExpanded={isAdvancedExpanded}
          onToggleExpand={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onApplyFilters={() => onSearch(filter)}
          platforms={PLATFORMS}
          domains={DOMAINS}
        />
      </div>
    </section>
  );
};
