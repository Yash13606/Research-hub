import { useQuery } from "@tanstack/react-query";
import { Paper } from "@/lib/types";
import { useAppState } from "@/contexts/AppStateContext";

// Mock data generator for fallback
const getMockPaper = (id: string): Paper => ({
  id: parseInt(id),
  title: "Advanced Architectures for Large Language Models",
  authors: ["Sarah Chen", "Michael Ross", "David Kim"],
  abstract: "This paper explores novel architectural modifications to Transformer-based models...",
  url: "https://arxiv.org/abs/example",
  platform: "ArXiv",
  domain: "Artificial Intelligence",
  publishedDate: new Date().toISOString(),
  viewCount: 1250,
  citation_count: 85,
  createdAt: new Date().toISOString(),
  pageCount: 12,
  doi: "10.1109/EXAMPLE.2024.1234567"
});

export function usePaper(id: string) {
  const { savedPapers } = useAppState();

  return useQuery<Paper, Error>({
    queryKey: ['paper', id],
    queryFn: async () => {
      // 1. Try to find in saved papers first (fastest)
      const numericId = parseInt(id);
      const saved = savedPapers.find(p => p.id === numericId);
      if (saved) return saved;

      // 2. In a real app, we would fetch from API: /api/papers/:id
      // const res = await apiRequest("GET", `/api/papers/${id}`);
      // return res.json();

      // 3. For this demo, since we rely on search results which might not be persisted in a normalized cache accessible here,
      // we'll return a high-quality mock if not found, OR we could try to read from React Query's cache if we really wanted to be fancy.
      // Let's return a mock that matches the ID structure.
      
      return getMockPaper(id);
    },
    // Don't refetch often
    staleTime: 1000 * 60 * 5, 
  });
}
