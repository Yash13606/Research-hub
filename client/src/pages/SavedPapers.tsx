import { useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PaperCard } from "@/components/PaperCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, Download, Grid3x3, List, Filter, 
  Trash2, FolderPlus, BookMarked 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchFilter, Paper } from "@/lib/types";
import { DOMAINS, PLATFORMS, EXPORT_FORMATS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SavedPapers = () => {
  const { savedPapers, viewMode, setViewMode } = useAppState();
  const { toast } = useToast();
  
  const [filterDomain, setFilterDomain] = useState<string>('');
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date_added');

  const isLoading = false; // Data is already loaded in global state
  const error = null;

  // Filter and sort papers
  const filteredPapers = savedPapers
    .filter(paper => {
      if (filterDomain && paper.domain !== filterDomain) return false;
      if (filterPlatform && paper.platform !== filterPlatform) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_added') {
        // Sort by createdAt date if available, otherwise by ID
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return b.id - a.id;
      }
      if (sortBy === 'citations') return (b.citation_count || 0) - (a.citation_count || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const handleExport = (format: string) => {
    // Export functionality placeholder
    console.log(`Exporting ${filteredPapers.length} papers as ${format}`);
    toast({
      title: "Export Started",
      description: `Exporting ${filteredPapers.length} papers as ${format}...`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              <BookMarked className="inline-block w-8 h-8 mr-3 text-blue-400" />
              Saved Papers
            </h1>
            <p className="text-gray-400">
              {filteredPapers.length} {filteredPapers.length === 1 ? 'paper' : 'papers'} saved
            </p>
          </div>

          {/* Export Dropdown */}
          <div className="flex gap-2">
            <Select onValueChange={handleExport}>
              <SelectTrigger className="w-40 bg-[#1F1F1F] border-gray-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F1F1F] border-gray-700">
                {EXPORT_FORMATS.map(format => (
                  <SelectItem key={format.value} value={format.value} className="text-white hover:bg-gray-800">
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-[#1F1F1F]/50 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
              {/* Domain Filter */}
              <Select value={filterDomain || "all"} onValueChange={(val) => setFilterDomain(val === "all" ? "" : val)}>
                <SelectTrigger className="w-48 bg-[#0A1A2F] border-gray-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F1F] border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">All Domains</SelectItem>
                  {DOMAINS.filter(d => d !== 'Other').map(domain => (
                    <SelectItem key={domain} value={domain} className="text-white hover:bg-gray-800">
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Platform Filter */}
              <Select value={filterPlatform || "all"} onValueChange={(val) => setFilterPlatform(val === "all" ? "" : val)}>
                <SelectTrigger className="w-48 bg-[#0A1A2F] border-gray-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F1F] border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">All Platforms</SelectItem>
                  {PLATFORMS.filter(p => p !== 'Other').map(platform => (
                    <SelectItem key={platform} value={platform} className="text-white hover:bg-gray-800">
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-[#0A1A2F] border-gray-700 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F1F1F] border-gray-700">
                  <SelectItem value="date_added" className="text-white hover:bg-gray-800">Date Added</SelectItem>
                  <SelectItem value="citations" className="text-white hover:bg-gray-800">Citations</SelectItem>
                  <SelectItem value="title" className="text-white hover:bg-gray-800">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#0A1A2F] border-gray-700 text-gray-300 hover:bg-gray-800'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#0A1A2F] border-gray-700 text-gray-300 hover:bg-gray-800'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Papers Grid/List */}
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-[#1F1F1F]/50 rounded-lg border border-gray-700 p-5">
                <Skeleton className="h-4 w-1/4 mb-2 bg-gray-700" />
                <Skeleton className="h-6 w-3/4 mb-3 bg-gray-700" />
                <Skeleton className="h-4 w-1/2 mb-3 bg-gray-700" />
                <Skeleton className="h-20 w-full mb-4 bg-gray-700" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load saved papers. Please try again later.
            </AlertDescription>
          </Alert>
        ) : filteredPapers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 bg-[#1F1F1F]/30 rounded-lg border border-gray-700"
          >
            <BookMarked className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {savedPapers.length ? "No matching papers" : "No saved papers yet"}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {savedPapers.length 
                ? "Try adjusting your filters to see more results."
                : "Start saving interesting research papers to access them later."
              }
            </p>
            <Link href="/home">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Browse Papers
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredPapers.map((paper: Paper) => (
              <PaperCard 
                key={paper.id} 
                paper={paper} 
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPapers;
