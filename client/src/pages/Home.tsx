import { useState, useEffect } from "react";
import { SearchSection } from "@/components/SearchSection";
import { ResultsSection } from "@/components/ResultsSection";
import { usePapers } from "@/hooks/usePapers";
import { SearchFilter } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const Home = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({
    query: "",
    platform: "",
    domain: "",
    author: "",
    journal: "",
    dateRange: "",
    sortBy: "relevance",
    page: 1,
    limit: 12
  });

  // Initialize filter from URL params on first render
  useEffect(() => {
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
    
    if (Object.keys(urlFilter).length > 0) {
      setSearchFilter(prev => ({ ...prev, ...urlFilter }));
    }
  }, []);

  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = usePapers(searchFilter);

  const handleSearch = (filter: SearchFilter) => {
    setSearchFilter(filter);
    
    // Save recent search for logged-in user
    // Note: In a real application, you'd check if user is logged in
    const userId = 1; // Hardcoded for demo
    
    // Only save meaningful searches
    if (filter.query || filter.domain || filter.platform) {
      saveRecentSearch(userId, filter);
    }
  };

  const saveRecentSearch = async (userId: number, filter: SearchFilter) => {
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
      // Don't show a toast here to avoid interrupting the user experience
    }
  };

  const handlePageChange = (page: number) => {
    const newFilter = { ...searchFilter, page };
    setSearchFilter(newFilter);
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
      />
      
      <ResultsSection 
        papers={data?.papers || []}
        total={data?.total || 0}
        currentPage={searchFilter.page}
        pageSize={searchFilter.limit}
        isLoading={isLoading} 
        error={error}
        onPageChange={handlePageChange}
        searchTerm={searchFilter.query}
      />
    </>
  );
};

export default Home;
