import { FC, useState, FormEvent, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdvancedFilters } from "./filters/AdvancedFilters";
import { SearchFilter } from "@/lib/types";
import { PLATFORMS, DOMAINS } from "@/lib/constants";

import { useAppState } from "@/contexts/AppStateContext";
import { motion, AnimatePresence } from "framer-motion";

interface SearchSectionProps {
  initialFilter?: SearchFilter; // Kept for compatibility but we'll prefer global state
  onSearch: (filter: SearchFilter) => void;
  isLoading?: boolean;
}

export const SearchSection: FC<SearchSectionProps> = ({ initialFilter, onSearch, isLoading = false }) => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/:tab");
  const { 
    searchQuery, setSearchQuery, 
    filterOptions, setFilterOptions, resetFilters,
    selectedDomain, setSelectedDomain,
    incrementTotalSearches
  } = useAppState();
  
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on custom event (e.g. from keyboard shortcut)
  useEffect(() => {
    const handleFocusSearch = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };
    
    window.addEventListener('focus-search', handleFocusSearch);
    return () => window.removeEventListener('focus-search', handleFocusSearch);
  }, []);

  // Sync local query with global state
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Construct current filter object from global state
  const currentFilter: SearchFilter = {
    query: searchQuery,
    platform: filterOptions.platform,
    domain: selectedDomain || filterOptions.domain,
    author: filterOptions.author,
    journal: filterOptions.journal,
    dateRange: filterOptions.dateRange as any,
    sortBy: filterOptions.sortBy as any,
    page: 1, // Reset to page 1 on filter change
    limit: 10
  };
  
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
      if (urlFilter.query !== undefined) {
        setSearchQuery(urlFilter.query);
        setLocalQuery(urlFilter.query);
      }
      
      const newOptions: any = {};
      if (urlFilter.platform !== undefined) newOptions.platform = urlFilter.platform;
      if (urlFilter.author !== undefined) newOptions.author = urlFilter.author;
      if (urlFilter.journal !== undefined) newOptions.journal = urlFilter.journal;
      if (urlFilter.dateRange !== undefined) newOptions.dateRange = urlFilter.dateRange;
      if (urlFilter.sortBy !== undefined) newOptions.sortBy = urlFilter.sortBy;
      
      if (Object.keys(newOptions).length > 0) {
        setFilterOptions(newOptions);
      }
      
      if (urlFilter.domain !== undefined) {
        setSelectedDomain(urlFilter.domain);
      }
      
      // Expand advanced filters if any of the advanced options are set
      if (urlFilter.platform || urlFilter.domain || urlFilter.author || 
          urlFilter.journal || urlFilter.dateRange || urlFilter.sortBy !== "relevance") {
        setIsAdvancedExpanded(true);
      }
      
      // Trigger search with the URL parameters
      onSearch({ ...currentFilter, ...urlFilter });
    }
  }, [location]);
  
  // Update URL when filter changes
  useEffect(() => {
    // Only update if this is not the initial render
    if (initialFilter) {
      updateUrl();
    }
  }, [searchQuery, filterOptions, selectedDomain]);

  // Update URL without causing a navigation
  const updateUrl = () => {
    const searchParams = new URLSearchParams();
    
    if (searchQuery) searchParams.set("query", searchQuery);
    if (filterOptions.platform) searchParams.set("platform", filterOptions.platform);
    if (selectedDomain) searchParams.set("domain", selectedDomain);
    else if (filterOptions.domain) searchParams.set("domain", filterOptions.domain);
    
    if (filterOptions.author) searchParams.set("author", filterOptions.author);
    if (filterOptions.journal) searchParams.set("journal", filterOptions.journal);
    if (filterOptions.dateRange) searchParams.set("dateRange", filterOptions.dateRange);
    if (filterOptions.sortBy && filterOptions.sortBy !== "relevance") searchParams.set("sortBy", filterOptions.sortBy);
    
    // Page is reset to 1 on new searches usually, so we don't always need to sync it to URL unless it's > 1
    // For now simplistic approach
    
    const queryString = searchParams.toString();
    const newUrl = params?.tab ? `/${params.tab}${queryString ? `?${queryString}` : ''}` : 
                                  `/${queryString ? `?${queryString}` : ''}`;
    
    // Only update the URL if it's different and valid
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    incrementTotalSearches();
    onSearch({ ...currentFilter, query: localQuery });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };
  
  const handleFilterChange = (newFilterValues: Partial<SearchFilter>) => {
    // Update global state
    if (newFilterValues.platform !== undefined) setFilterOptions({ platform: newFilterValues.platform });
    if (newFilterValues.domain !== undefined) setSelectedDomain(newFilterValues.domain);
    if (newFilterValues.author !== undefined) setFilterOptions({ author: newFilterValues.author });
    if (newFilterValues.journal !== undefined) setFilterOptions({ journal: newFilterValues.journal });
    if (newFilterValues.dateRange !== undefined) setFilterOptions({ dateRange: newFilterValues.dateRange });
    if (newFilterValues.sortBy !== undefined) setFilterOptions({ sortBy: newFilterValues.sortBy });
    
    // Trigger search
    onSearch({ ...currentFilter, ...newFilterValues });
  };
  
  const handleResetFilters = () => {
    resetFilters();
    setLocalQuery("");
    setSearchQuery("");
    onSearch({ 
      ...currentFilter, 
      query: "", 
      platform: "", 
      domain: "",
      author: "", 
      journal: "", 
      dateRange: "", 
      sortBy: "relevance" 
    });
  };
  
  return (
    <section className="mb-8">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">Find Research Papers</h2>
        <form onSubmit={handleSearch}>
          <div className="relative group">
            <Input
              ref={searchInputRef}
              type="text"
              className="w-full pl-12 pr-24 py-6 bg-[#0A1A2F] border border-gray-700 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-500/50"
              placeholder="Search by title, author, keywords..."
              value={localQuery}
              onChange={handleInputChange}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Button 
              type="submit"
              className="absolute inset-y-0 right-0 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-r-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200"
            >
              Search
            </Button>
          </div>
        </form>
        
        {/* Advanced Filters */}
        <AdvancedFilters
          filter={currentFilter}
          isExpanded={isAdvancedExpanded}
          onToggleExpand={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onApplyFilters={() => onSearch(currentFilter)}
          platforms={PLATFORMS}
          domains={DOMAINS}
        />
      </div>
    </section>
  );
};
