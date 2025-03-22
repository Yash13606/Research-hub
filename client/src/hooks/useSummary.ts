import { useQuery } from "@tanstack/react-query";
import { Summary } from "@/lib/types";

/**
 * Hook to fetch paper summary by paperId
 */
export function useSummary(paperId: number) {
  return useQuery<Summary>({
    queryKey: [`/api/papers/${paperId}/summary`],
    // Enable only when paperId is valid
    enabled: !!paperId,
    // Keep the summary in cache for a while
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}
