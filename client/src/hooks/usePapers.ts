import { useQuery } from "@tanstack/react-query";
import { SearchFilter, PapersResponse } from "@/lib/types";

/**
 * Hook to fetch papers based on search filters
 */
export function usePapers(filter: SearchFilter) {
  // Convert filter to query params
  const queryParams = new URLSearchParams();
  
  if (filter.query) queryParams.append("query", filter.query);
  if (filter.platform) queryParams.append("platform", filter.platform);
  if (filter.domain) queryParams.append("domain", filter.domain);
  if (filter.author) queryParams.append("author", filter.author);
  if (filter.journal) queryParams.append("journal", filter.journal);
  if (filter.dateRange) queryParams.append("dateRange", filter.dateRange);
  if (filter.customStartDate) queryParams.append("customStartDate", filter.customStartDate);
  if (filter.customEndDate) queryParams.append("customEndDate", filter.customEndDate);
  if (filter.sortBy) queryParams.append("sortBy", filter.sortBy);
  if (filter.page) queryParams.append("page", filter.page.toString());
  if (filter.limit) queryParams.append("limit", filter.limit.toString());
  
  const queryString = queryParams.toString();
  
  return useQuery<PapersResponse>({
    queryKey: [`/api/papers${queryString ? `?${queryString}` : ''}`],
    queryFn: async () => {
      // Simulate delay for realistic search feel
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE_URL}/api/papers${queryString ? `?${queryString}` : ''}`);
      if (!res.ok) {
        throw new Error('Failed to fetch papers');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
