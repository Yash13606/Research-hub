import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, Calendar, Tag, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecentSearch } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const RecentSearches = () => {
  const userId = 1; // Hardcoded for demo
  const [, setLocation] = useLocation();

  const { data: recentSearches, isLoading, error } = useQuery({
    queryKey: [`/api/users/${userId}/recent-searches`],
    staleTime: 60000, // 1 minute
  });

  const clearAllMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/users/${userId}/recent-searches`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/recent-searches`] });
    },
  });

  const handleSearchClick = (search: RecentSearch) => {
    // Build query string from search data
    const params = new URLSearchParams();
    
    if (search.query) params.set("query", search.query);
    
    if (search.filters) {
      const filters = search.filters as Record<string, string>;
      if (filters.platform) params.set("platform", filters.platform);
      if (filters.domain) params.set("domain", filters.domain);
      if (filters.author) params.set("author", filters.author);
      if (filters.journal) params.set("journal", filters.journal);
      if (filters.dateRange) params.set("dateRange", filters.dateRange);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
    }
    
    // Navigate to home with these search params
    setLocation(`/?${params.toString()}`);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Recent Searches</h1>
        {recentSearches && recentSearches.length > 0 && (
          <Button
            variant="outline"
            onClick={() => clearAllMutation.mutate()}
            disabled={clearAllMutation.isPending}
            className="text-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array(5).fill(0).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load recent searches. Please try again later.
          </AlertDescription>
        </Alert>
      ) : recentSearches && recentSearches.length > 0 ? (
        <div className="grid gap-4">
          {recentSearches.map((search: RecentSearch) => (
            <Card key={search.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  {search.query || "All Papers"}
                </CardTitle>
                <CardDescription>
                  {formatTimestamp(search.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                {search.filters && (
                  <div className="space-y-2 text-sm">
                    {(search.filters as any).domain && (
                      <div className="flex items-center text-gray-600">
                        <Tag className="h-4 w-4 mr-2" />
                        <span>Domain: {(search.filters as any).domain}</span>
                      </div>
                    )}
                    {(search.filters as any).platform && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Platform: {(search.filters as any).platform}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t border-gray-100 pt-3">
                <Button 
                  variant="ghost" 
                  className="text-primary hover:bg-indigo-50 hover:text-indigo-700"
                  onClick={() => handleSearchClick(search)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Run this search again
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent searches</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your search history will appear here once you start searching for papers.
          </p>
          <Button onClick={() => setLocation('/')}>
            Start Searching
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentSearches;
