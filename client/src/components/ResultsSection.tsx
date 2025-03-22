import { FC } from "react";
import { PaperCard } from "./PaperCard";
import { Pagination } from "./Pagination";
import { Paper } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, LayoutGrid, List } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ResultsSectionProps {
  papers: Paper[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
  searchTerm?: string;
}

export const ResultsSection: FC<ResultsSectionProps> = ({
  papers,
  total,
  currentPage,
  pageSize,
  isLoading,
  error,
  onPageChange,
  searchTerm
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const totalPages = Math.ceil(total / pageSize);
  
  const getTitle = () => {
    if (searchTerm) {
      return `Search Results for "${searchTerm}"`;
    }
    return "Recent Research Papers";
  };

  return (
    <section>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-lg font-semibold text-white mb-2 sm:mb-0">
          {getTitle()}
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">{total} results</span>
          <div className="border-l border-gray-700 h-6 mx-2"></div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-primary hover:bg-green-600' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-primary hover:bg-green-600' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
        }`}>
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-gray-900 rounded-lg border border-gray-800 p-5 shadow-sm">
              <Skeleton className="h-4 w-1/4 mb-2 bg-gray-800" />
              <Skeleton className="h-6 w-3/4 mb-3 bg-gray-800" />
              <Skeleton className="h-4 w-1/2 mb-3 bg-gray-800" />
              <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
              <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
              <Skeleton className="h-4 w-3/4 mb-4 bg-gray-800" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4 bg-gray-800" />
                <Skeleton className="h-8 w-1/4 bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="bg-gray-900 border-red-900 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load research papers. Please try again later.
          </AlertDescription>
        </Alert>
      ) : papers.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
          <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No papers found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Try adjusting your search filters to find more research papers.
          </p>
          <Button 
            variant="outline" 
            onClick={() => onPageChange(1)}
            className="mx-auto border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
          }`}>
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
};
