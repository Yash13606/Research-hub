import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  History, Search, Trash2, Clock, TrendingUp, 
  Filter, Calendar, RotateCcw 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";

interface RecentSearch {
  id: number;
  query: string;
  filters: {
    platform?: string;
    domain?: string;
    author?: string;
    journal?: string;
    dateRange?: string;
    sortBy?: string;
  };
  timestamp: string;
  resultCount?: number;
}

const RecentSearches = () => {
  const { recentSearches: searches, removeRecentSearch, clearRecentSearches } = useAppState();
  const { toast } = useToast();
  const isLoading = false; // Data is loaded from localStorage immediately

  const handleRerun = (search: RecentSearch) => {
    const params = new URLSearchParams();
    if (search.query) params.set('query', search.query);
    if (search.filters.platform) params.set('platform', search.filters.platform);
    if (search.filters.domain) params.set('domain', search.filters.domain);
    if (search.filters.author) params.set('author', search.filters.author);
    
    window.location.href = `/home?${params.toString()}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Group searches by date
  const groupedSearches = searches.reduce((acc, search) => {
    const date = new Date(search.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(search);
    return acc;
  }, {} as Record<string, RecentSearch[]>);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              <History className="inline-block w-8 h-8 mr-3 text-blue-400" />
              Recent Searches
            </h1>
            <p className="text-gray-400">
              {searches.length} {searches.length === 1 ? 'search' : 'searches'} in history
            </p>
          </div>

          {searches.length > 0 && (
            <Button
              variant="outline"
              className="bg-red-900/20 border-red-900 text-red-400 hover:bg-red-900/30"
              onClick={() => {
                if (confirm('Clear all search history?')) {
                  clearRecentSearches();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </motion.div>

        {/* Popular Searches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-[#1F1F1F]/50 border border-gray-700 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Popular Searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {['machine learning', 'quantum computing', 'CRISPR', 'neural networks', 'climate change'].map(term => (
              <Link key={term} href={`/home?query=${encodeURIComponent(term)}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#0A1A2F] border-gray-700 text-gray-300 hover:bg-blue-900/20 hover:border-blue-500 hover:text-blue-400"
                >
                  {term}
                </Button>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Search History Timeline */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-[#1F1F1F]/50 border border-gray-700 rounded-lg p-4">
                <Skeleton className="h-6 w-1/3 mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-2/3 bg-gray-700" />
              </div>
            ))}
          </div>
        ) : searches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 bg-[#1F1F1F]/30 rounded-lg border border-gray-700"
          >
            <History className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No search history yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Your recent searches will appear here for quick access
            </p>
            <Link href="/home">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Search className="w-4 h-4 mr-2" />
                Start Searching
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSearches).map(([date, dateSearches], groupIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + groupIndex * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    {date}
                  </h3>
                </div>
                <div className="space-y-3">
                  {dateSearches.map((search, index) => (
                    <motion.div
                      key={search.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="bg-[#1F1F1F]/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Search className="w-4 h-4 text-blue-400" />
                            <h4 className="text-lg font-semibold text-white">
                              {search.query || 'Browse All Papers'}
                            </h4>
                          </div>
                          
                          {/* Filters */}
                          {(search.filters.domain || search.filters.platform || search.filters.author) && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {search.filters.domain && (
                                <span className="px-2 py-1 text-xs bg-blue-900/20 text-blue-400 rounded border border-blue-900">
                                  <Filter className="w-3 h-3 inline mr-1" />
                                  {search.filters.domain}
                                </span>
                              )}
                              {search.filters.platform && (
                                <span className="px-2 py-1 text-xs bg-indigo-900/20 text-indigo-400 rounded border border-indigo-900">
                                  {search.filters.platform}
                                </span>
                              )}
                              {search.filters.author && (
                                <span className="px-2 py-1 text-xs bg-purple-900/20 text-purple-400 rounded border border-purple-900">
                                  Author: {search.filters.author}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(search.timestamp)}
                            </span>
                            {search.resultCount !== undefined && (
                              <span>{search.resultCount} results</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-900/20 border-blue-900 text-blue-400 hover:bg-blue-900/30"
                            onClick={() => handleRerun(search)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-900/20 border-red-900 text-red-400 hover:bg-red-900/30"
                            onClick={() => removeRecentSearch(search.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSearches;
