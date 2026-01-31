import { FC, useState } from "react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, BookmarkCheck, Share2, Eye, FileText, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SummaryTabs } from "./summary/SummaryTabs";
import { Paper } from "@/lib/types";
import { generateBibTeX } from "@/lib/bibtex";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";

interface PaperCardProps {
  paper: Paper;
  isSaved?: boolean;
  userId?: number;
}

export const PaperCard: FC<PaperCardProps> = ({ paper, isSaved: initialIsSaved = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();
  const { addSavedPaper, removeSavedPaper, isPaperSaved } = useAppState();
  const { toast } = useToast();
  
  const isSaved = isPaperSaved(paper.id);
  
  // Format the publication date
  const formattedDate = formatDistanceToNow(new Date(paper.publishedDate), { addSuffix: true });
  
  // Function to get platform badge color
  // Function to get platform badge color
  const getPlatformColor = (platform: string) => {
    const platformColors: Record<string, string> = {
      "ArXiv": "bg-red-900/20 text-red-400 border border-red-900/50",
      "IEEE Xplore": "bg-blue-900/20 text-blue-400 border border-blue-900/50",
      "Springer": "bg-orange-900/20 text-orange-400 border border-orange-900/50",
      "PubMed": "bg-blue-900/20 text-blue-400 border border-blue-900/50",
      "ScienceDirect": "bg-orange-900/20 text-orange-400 border border-orange-900/50",
      "ACM Digital Library": "bg-blue-900/20 text-blue-400 border border-blue-900/50",
      "Nature": "bg-red-900/20 text-red-400 border border-red-900/50",
      "JSTOR": "bg-red-900/20 text-red-400 border border-red-900/50"
    };
    return platformColors[platform] || "bg-blue-900/20 text-blue-400 border border-blue-900/50";
  };
  
  // Mutations

  
  const handleSaveToggle = () => {
    if (isSaved) {
      removeSavedPaper(paper.id);
    } else {
      addSavedPaper(paper);
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: paper.title,
        text: `Check out this research paper: ${paper.title}`,
        url: paper.url
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback, copy URL to clipboard
      navigator.clipboard.writeText(paper.url)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Paper link copied to clipboard",
            duration: 2000,
          });
        })
        .catch((err) => {
          console.error('Could not copy text: ', err);
        });
    }
  };

  const handleCite = () => {
    const bibtex = generateBibTeX(paper);
    navigator.clipboard.writeText(bibtex)
      .then(() => {
        toast({
          title: "Citation Copied",
          description: "BibTeX citation copied to clipboard",
          duration: 2000,
        });
      })
      .catch((err) => console.error('Could not copy citation: ', err));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="paper-card overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-[#1F1F1F]/50 border-gray-700 hover:border-blue-500/50 backdrop-blur-sm group">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 cursor-pointer group" onClick={() => setLocation(`/paper/${paper.id}`)}>
              <div className="flex items-center mb-1.5">
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${getPlatformColor(paper.platform)}`}>
                  {paper.platform}
                </span>
                <span className="ml-2 text-xs text-gray-400">{formattedDate}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-blue-400 transition-colors leading-tight">
                {paper.title}
              </h3>
              <p className="text-sm text-gray-400 mb-2">{paper.authors.join(", ")}</p>
              <div className="text-sm text-gray-300 line-clamp-3">
                {paper.abstract}
              </div>
            </div>
            <div className="ml-4 flex flex-col items-center space-y-2">
              <motion.button 
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-blue-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleSaveToggle(); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={isSaved ? "Remove from saved" : "Save paper"}
              >
                {isSaved ? (
                  <Bookmark className="text-blue-500 h-5 w-5 fill-current" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </motion.button>
              <motion.button 
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-blue-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </motion.button>
              <motion.button 
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-green-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleCite(); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Cite this paper"
              >
                <Quote className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm">
              <span className="flex items-center text-gray-400 mr-3">
                <Eye className="h-4 w-4 mr-1" /> {paper.viewCount.toLocaleString()}
              </span>
              <span className="flex items-center text-gray-400">
                <FileText className="h-4 w-4 mr-1" /> {paper.pageCount || "?"} pages
              </span>
            </div>
            <div>
              <Button
                onClick={() => setLocation(`/paper/${paper.id}`)}
                variant="outline"
                className="px-4 py-2 text-sm font-medium text-blue-400 bg-blue-900/10 hover:bg-blue-900/20 focus:outline-none border-blue-900/30 transition-colors"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
        
        {/* Expandable Summary Section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pt-2 pb-5 border-t border-gray-800 bg-[#0A1A2F]/50">
                <SummaryTabs paperId={paper.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
