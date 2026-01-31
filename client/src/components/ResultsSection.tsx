import { FC, useState } from "react";
import { PaperCard } from "./PaperCard";
import { Pagination } from "./Pagination";
import { Paper } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { PaperCardSkeleton } from "./skeletons/PaperCardSkeleton";
import { AlertCircle, Search, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/contexts/AppStateContext";

interface ResultsSectionProps {
  papers: Paper[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
  searchTerm?: string;
  selectedDomain?: string;
  onClearFilters?: () => void;
}

export const ResultsSection: FC<ResultsSectionProps> = ({
  papers,
  total,
  currentPage,
  pageSize,
  isLoading,
  error,
  onPageChange,
  searchTerm,
  selectedDomain,
  onClearFilters
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { filterOptions, setFilterOptions } = useAppState();
  
  const totalPages = Math.ceil(total / pageSize);
  
  const getTitle = () => {
    if (selectedDomain && searchTerm) {
      return (
        <span className="flex flex-wrap items-center gap-2">
          Results for <span className="text-blue-400">"{searchTerm}"</span> in <span className="text-blue-400">{selectedDomain}</span>
        </span>
      );
    }
    if (selectedDomain) {
      return (
        <span className="flex items-center gap-2">
          Showing papers in: <span className="text-blue-400">{selectedDomain}</span>
        </span>
      );
    }
    if (searchTerm) {
      return (
        <span className="flex items-center gap-2">
           Results for: <span className="text-blue-400">"{searchTerm}"</span>
        </span>
      );
    }
    return "Trending Research Papers";
  };

  return (
    <section>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[#1F1F1F]/40 p-4 rounded-lg border border-gray-800 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white mb-2 sm:mb-0 flex flex-wrap items-center gap-3">
          {getTitle()}
          {(selectedDomain || searchTerm) && onClearFilters && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onClearFilters}
              className="text-xs h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              Clear Filters
            </Button>
          )}
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400 hidden sm:inline">{total} results</span>
          <div className="border-l border-gray-700 h-6 mx-2 hidden sm:block"></div>
          
           {/* Sort Dropdown */}
           <div className="mr-2">
             <Select 
               value={filterOptions.sortBy || "relevance"} 
               onValueChange={(val) => setFilterOptions({ sortBy: val as any })}
             >
               <SelectTrigger className="h-8 w-[140px] bg-gray-800 border-gray-700 text-xs text-gray-300 focus:ring-0 focus:ring-offset-0">
                 <div className="flex items-center">
                   <ArrowUpDown className="w-3 h-3 mr-2" />
                   <SelectValue placeholder="Sort" />
                 </div>
               </SelectTrigger>
               <SelectContent className="bg-[#1F1F1F] border-gray-700">
                 <SelectItem value="relevance" className="text-white hover:bg-gray-800 focus:bg-gray-800 text-xs">Most Relevant</SelectItem>
                 <SelectItem value="date_desc" className="text-white hover:bg-gray-800 focus:bg-gray-800 text-xs">Newest First</SelectItem>
                 <SelectItem value="citations_desc" className="text-white hover:bg-gray-800 focus:bg-gray-800 text-xs">Most Cited</SelectItem>
               </SelectContent>
             </Select>
           </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
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
            <PaperCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load research papers. Please try again later.
          </AlertDescription>
        </Alert>
      ) : papers.length === 0 ? (
        <div className="text-center py-20 bg-[#1F1F1F]/40 rounded-lg border border-gray-800 backdrop-blur-sm">
          <div className="bg-gray-800/50 p-4 rounded-full inline-block mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {selectedDomain ? `No papers found in ${selectedDomain}` : 'No papers found'}
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {selectedDomain 
              ? "Try clearing the filter or selecting another domain." 
              : "Try adjusting your search filters to find more research papers."}
          </p>
          <Button 
            variant="outline" 
            onClick={() => onClearFilters ? onClearFilters() : onPageChange(1)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            {selectedDomain || onClearFilters ? 'Clear All Filters' : 'Clear Search'}
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
