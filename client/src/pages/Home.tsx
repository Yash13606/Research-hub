import { useEffect } from "react";
import { SearchSection } from "@/components/SearchSection";
import { ResultsSection } from "@/components/ResultsSection";
import { usePapers } from "@/hooks/usePapers";
import { SearchFilter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/contexts/AppStateContext";
import { apiRequest } from "@/lib/queryClient";

const Home = () => {
  const { toast } = useToast();
  const { 
    searchQuery, 
    setSearchQuery,
    filterOptions, 
    setFilterOptions,
    selectedDomain,
    setSelectedDomain,
    addRecentSearch
  } = useAppState();

  const searchFilter: SearchFilter = {
    query: searchQuery,
    platform: filterOptions.platform,
    domain: selectedDomain || filterOptions.domain,
    author: filterOptions.author,
    journal: filterOptions.journal,
    dateRange: filterOptions.dateRange as any,
    sortBy: filterOptions.sortBy as any,
    page: 1, 
    limit: 12
  };
  
  const { 
    data, 
    isLoading, 
    error 
  } = usePapers(searchFilter);

  const handleSearch = (filter: SearchFilter) => {
    // Update global state if changed from child
    if (filter.query !== searchQuery) setSearchQuery(filter.query || "");
    if (filter.domain && filter.domain !== selectedDomain) setSelectedDomain(filter.domain);
    
    // Save to recent searches history
    if (filter.query || filter.domain || filter.platform) {
      addRecentSearch({
        query: filter.query || "",
        filters: {
          platform: filter.platform,
          domain: filter.domain,
          author: filter.author,
          journal: filter.journal,
          dateRange: filter.dateRange,
          sortBy: filter.sortBy
        }
      });
      
      // Also persist to backend if needed
      saveRecentSearchbackend(1, filter);
    }
  };

  const saveRecentSearchbackend = async (userId: number, filter: SearchFilter) => {
    try {
      await apiRequest("POST", `/api/users/${userId}/recent-searches`, {
        query: filter.query,
        filters: {
          platform: filter.platform,
          domain: filter.domain,
          author: filter.author,
          journal: filter.journal,
          dateRange: filter.dateRange,
          sortBy: filter.sortBy
        }
      });
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

  const handlePageChange = (page: number) => {
    // We can handle pagination state locally or via URL params, keeping simple for now
    // Ideally update searchFilter's page but usePapers might need a trigger
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    window.history.pushState({}, "", url.toString());
    // Force re-fetch? usePapers depends on searchFilter which is derived from state. 
    // If we want pagination we might need page in global state. 
    // For this refactor let's keep page handling local to ResultsSection or refetch via URL
    window.dispatchEvent(new Event('popstate'));
  };

  // Show error toast if the query fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch papers. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <>
      <SearchSection 
        initialFilter={searchFilter} 
        onSearch={handleSearch} 
        isLoading={isLoading}
      />
      
      <ResultsSection 
        papers={data?.papers || []}
        total={data?.total || 0}
        currentPage={searchFilter.page}
        pageSize={searchFilter.limit}
        isLoading={isLoading} 
        error={error}
        onPageChange={handlePageChange}
        searchTerm={searchQuery}
        selectedDomain={selectedDomain}
        onClearFilters={() => {
          setSelectedDomain('');
          setSearchQuery('');
          setFilterOptions({}); // Reset others
        }}
      />
    </>
  );
};

export default Home;
