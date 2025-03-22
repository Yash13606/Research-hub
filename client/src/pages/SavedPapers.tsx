import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PaperCard } from "@/components/PaperCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchFilter, Paper } from "@/lib/types";
import { SearchSection } from "@/components/SearchSection";

const SavedPapers = () => {
  const userId = 1; // Hardcoded for demo
  const [filter, setFilter] = useState<SearchFilter>({
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

  const { data: savedPapers = [], isLoading, error } = useQuery<Paper[]>({
    queryKey: [`/api/users/${userId}/saved-papers`],
    staleTime: 60000, // 1 minute
  });

  // Filter papers based on search criteria
  const filteredPapers = filterPapers(savedPapers, filter);

  const handleSearch = (newFilter: SearchFilter) => {
    setFilter(newFilter);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Saved Papers</h1>
        <SearchSection initialFilter={filter} onSearch={handleSearch} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load saved papers. Please try again later.
          </AlertDescription>
        </Alert>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
            <path d="M8 7h8M8 11h8M8 15h5"/>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {savedPapers?.length ? "No matching papers found" : "No saved papers"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {savedPapers?.length 
              ? "Try adjusting your filters to see more results."
              : "Save interesting research papers to access them later."
            }
          </p>
          <Link href="/">
            <a className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-indigo-700 transition duration-150">
              Browse Papers
            </a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPapers.map((paper: Paper) => (
            <PaperCard 
              key={paper.id} 
              paper={paper} 
              isSaved={true}
              userId={userId}
            />
          ))}
        </div>
      )}
    </>
  );
};

// Helper function to filter papers based on search criteria
function filterPapers(papers: Paper[], filter: SearchFilter): Paper[] {
  return papers.filter(paper => {
    // Search by query (title, abstract, authors)
    if (filter.query && !paperMatchesQuery(paper, filter.query)) {
      return false;
    }
    
    // Filter by platform
    if (filter.platform && paper.platform !== filter.platform) {
      return false;
    }
    
    // Filter by domain (case-insensitive)
    if (filter.domain && paper.domain.toLowerCase() !== filter.domain.toLowerCase()) {
      return false;
    }
    
    // Filter by author
    if (filter.author && !paper.authors.some(author => 
      author.toLowerCase().includes(filter.author?.toLowerCase() || '')
    )) {
      return false;
    }
    
    // Filter by journal
    if (filter.journal && paper.journal && 
        !paper.journal.toLowerCase().includes(filter.journal.toLowerCase())) {
      return false;
    }
    
    return true;
  });
}

function paperMatchesQuery(paper: Paper, query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    paper.title.toLowerCase().includes(lowerQuery) || 
    paper.abstract.toLowerCase().includes(lowerQuery) ||
    paper.authors.some(author => author.toLowerCase().includes(lowerQuery))
  );
}

// Helper Link component
const Link = ({ href, children }: { href: string, children: React.ReactNode }) => {
  const [, setLocation] = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation(href);
  };
  
  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
};

export default SavedPapers;
