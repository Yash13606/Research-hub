import { useRoute } from "wouter";
import { usePaper } from "@/hooks/usePaper";
import { useAppState } from "@/contexts/AppStateContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Bookmark, Share2, Download, FileText, 
  Quote, ExternalLink, Calendar, Users, Eye, Sparkles, 
  Cpu, Award, BookOpen, RefreshCw, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { generateBibTeX } from "@/lib/bibtex";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Summary } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

type SummaryLevel = "short" | "medium" | "detailed";

const PaperDetails = () => {
  const [, params] = useRoute("/paper/:id");
  const id = params?.id || "0";
  const { data: paper, isLoading, error } = usePaper(id);
  const { isPaperSaved, addSavedPaper, removeSavedPaper } = useAppState();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [summaryLevel, setSummaryLevel] = useState<SummaryLevel>("medium");
  const [isCopied, setIsCopied] = useState(false);

  // Fetch AI Summary
  const { data: summary, isLoading: isLoadingSummary } = useQuery<Summary>({
    queryKey: ['paper-summary', id],
    queryFn: async () => {
      // In a real scenario with proper backend connection:
      const res = await apiRequest("GET", `/api/papers/${id}/summary`);
      return res.json();
    },
    enabled: !!paper && !isLoading, // Only fetch if paper loaded
    retry: false
  });

  const { mutate: regenerateSummary, isPending: isRegenerating } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/papers/${id}/regenerate-summary`);
      return res.json();
    },
    onSuccess: (newSummary) => {
      queryClient.setQueryData(['paper-summary', id], newSummary);
      toast({ title: "Analysis Updated", description: "AI summary has been regenerated." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed", description: "Could not regenerate summary." });
    }
  });

  const handleCopySummary = () => {
    if (!summary) return;
    
    let textToCopy = "";
    if (summaryLevel === "short") textToCopy = summary.shortSummary || "";
    else if (summaryLevel === "medium") textToCopy = summary.mediumSummary || "";
    else textToCopy = summary.detailedSummary || "";
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({ description: "Summary copied to clipboard" });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Paper not found</h2>
        <p className="text-gray-400 mb-6">The requested paper details could not be loaded.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const isSaved = isPaperSaved(paper.id);

  const handleSave = () => {
    if (isSaved) {
      removeSavedPaper(paper.id);
    } else {
      addSavedPaper(paper);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Paper link copied to clipboard",
    });
  };

  const handleCite = () => {
    const bibtex = generateBibTeX(paper);
    navigator.clipboard.writeText(bibtex);
    toast({
      title: "Citation Copied",
      description: "BibTeX citation copied to clipboard",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      {/* Back Navigation */}
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 hover:bg-transparent hover:text-blue-400 text-gray-400"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline" className="bg-blue-900/10 text-blue-400 border-blue-900/30">
                {paper.platform}
              </Badge>
              <Badge variant="outline" className="border-gray-700 text-gray-400">
                {paper.domain}
              </Badge>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {new Date(paper.publishedDate).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {paper.title}
            </h1>
            
            <div className="flex items-center text-gray-300">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              {paper.authors.join(", ")}
            </div>
          </div>

          {/* AI Summary Card */}
          <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-900/10 to-transparent p-6 min-h-[300px]">

            
            {/* Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                   <h3 className="text-lg font-semibold text-blue-100 leading-none">AI Analysis</h3>
                   <span className="text-xs text-blue-400/60 font-mono">POWERED BY GEMINI</span>
                </div>
              </div>

              {/* Summary Level Toggles */}
              {summary && (
                <div className="flex items-center bg-[#0F172A] border border-blue-900/30 rounded-lg p-1">
                  {(['short', 'medium', 'detailed'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSummaryLevel(level)}
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize
                        ${summaryLevel === level 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'}
                      `}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Content */}
            {isLoadingSummary ? (
               <div className="space-y-4 py-4">
                 <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-8 w-8 rounded-full bg-blue-900/20" />
                    <Skeleton className="h-4 w-32 bg-blue-900/20" />
                 </div>
                 <Skeleton className="h-4 w-full bg-blue-900/20" />
                 <Skeleton className="h-4 w-5/6 bg-blue-900/20" />
                 <Skeleton className="h-4 w-4/5 bg-blue-900/20" />
                 <Skeleton className="h-4 w-full bg-blue-900/20" />
               </div>
            ) : summary ? (
              <div className="relative">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={summaryLevel}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-300 leading-relaxed space-y-4"
                    >
                      {summaryLevel === 'short' && (
                        <div className="bg-blue-900/5 border border-blue-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
                            <Award className="h-4 w-4 mr-2" /> Key Insight
                          </h4>
                          <div className="prose prose-invert prose-sm">
                            {summary.shortSummary?.split('\n').map((line, i) => (
                              <p key={i} className="mb-2 last:mb-0">{line}</p>
                            )) || "Summary unavailable."}
                          </div>
                        </div>
                      )}

                      {summaryLevel === 'medium' && (
                        <div>
                          {summary.mediumSummary ? (
                             <p className="text-sm md:text-base leading-7">{summary.mediumSummary}</p>
                          ) : (
                             <p className="text-sm italic text-gray-500">Medium summary unavailable.</p>
                          )}
                        </div>
                      )}

                      {summaryLevel === 'detailed' && (
                        <div className="space-y-4">
                          <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-800">
                             <div className="prose prose-invert max-w-none text-sm leading-7">
                               {summary.detailedSummary ? (
                                  summary.detailedSummary.split('\n\n').map((para, i) => (
                                    <p key={i} className="mb-4 last:mb-0">{para}</p>
                                  ))
                               ) : (<p>Detailed analysis unavailable.</p>)}
                             </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                 </AnimatePresence>

                 {/* Actions Footer */}
                 <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-blue-500/10">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopySummary}
                      className="text-gray-400 hover:text-white h-8"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 mr-2 text-green-400" /> : <Copy className="h-3.5 w-3.5 mr-2" />}
                      {isCopied ? "Copied" : "Copy Analysis"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => regenerateSummary()}
                      disabled={isRegenerating}
                      className="border-blue-900/30 hover:bg-blue-900/20 text-blue-400 h-8 text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                      {isRegenerating ? "Regenerating..." : "Regenerate"}
                    </Button>
                 </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Unable to generate AI summary.</p>
                <Button size="sm" variant="outline" className="mt-4" onClick={() => regenerateSummary()}>
                  Retry Analysis
                </Button>
              </div>
            )}
          </div>

          {/* Abstract */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">Full Abstract</h3>
            <p className="leading-7 text-gray-300">
              {paper.abstract}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Action Card */}
          <div className="sticky top-6 rounded-xl border border-gray-800 bg-[#0A1A2F]/50 backdrop-blur-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-white">Paper Actions</h3>
              <div className="text-xs text-gray-500">ID: {paper.id}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button 
                onClick={handleSave} 
                variant={isSaved ? "default" : "outline"}
                className={`w-full ${isSaved ? "bg-blue-600 hover:bg-blue-700" : "border-gray-700 hover:bg-gray-800"}`}
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} /> 
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>

            <div className="space-y-3">
               <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
                 <Download className="mr-2 h-4 w-4" /> Download PDF
               </Button>

               <Button variant="ghost" className="w-full text-gray-400 hover:text-white" onClick={handleCite}>
                 <Quote className="mr-2 h-4 w-4" /> Copy Citation
               </Button>
            </div>

            <Separator className="my-6 bg-gray-800" />

            <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-white">{paper.citation_count}</div>
                <div className="text-xs text-gray-500">Citations</div>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-white">{paper.viewCount}</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-white max-w-[80px] truncate" title={paper.pageCount?.toString() || "N/A"}>{paper.pageCount || "N/A"}</div>
                <div className="text-xs text-gray-500">Pages</div>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <Button size="icon" variant="ghost" className="h-8 w-8 ml-auto -mt-1 -mr-1 text-blue-400">
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <div className="text-xs text-gray-500 mt-1">Source Link</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default PaperDetails;
