import { FC, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, BookmarkCheck, Share2, Eye, FileText } from "lucide-react";
import { SummaryTabs } from "./summary/SummaryTabs";
import { Paper } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface PaperCardProps {
  paper: Paper;
  isSaved?: boolean;
  userId?: number;
}

export const PaperCard: FC<PaperCardProps> = ({ paper, isSaved = false, userId = 1 }) => {
  const [expanded, setExpanded] = useState(false);
  const [isSavedState, setIsSavedState] = useState(isSaved);
  
  // Format the publication date
  const formattedDate = formatDistanceToNow(new Date(paper.publishedDate), { addSuffix: true });
  
  // Function to get platform badge color
  const getPlatformColor = (platform: string) => {
    const platformColors: Record<string, string> = {
      "ArXiv": "bg-indigo-50 text-primary",
      "IEEE Xplore": "bg-blue-50 text-blue-600",
      "Springer": "bg-green-50 text-green-600",
      "PubMed": "bg-red-50 text-red-600",
      "ScienceDirect": "bg-orange-50 text-orange-600"
    };
    return platformColors[platform] || "bg-gray-50 text-gray-600";
  };
  
  // Mutations
  const savePaperMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/users/${userId}/saved-papers`, { paperId: paper.id }),
    onSuccess: () => {
      setIsSavedState(true);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/saved-papers`] });
    },
  });
  
  const removeSavedPaperMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/users/${userId}/saved-papers/${paper.id}`),
    onSuccess: () => {
      setIsSavedState(false);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/saved-papers`] });
    },
  });
  
  const handleSaveToggle = () => {
    if (isSavedState) {
      removeSavedPaperMutation.mutate();
    } else {
      savePaperMutation.mutate();
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
          alert('Link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Could not copy text: ', err);
        });
    }
  };
  
  return (
    <Card className="paper-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-1.5">
              <span className={`px-2 py-1 text-xs font-medium rounded-md ${getPlatformColor(paper.platform)}`}>
                {paper.platform}
              </span>
              <span className="ml-2 text-xs text-gray-500">{formattedDate}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{paper.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{paper.authors.join(", ")}</p>
            <div className="text-sm text-gray-600 line-clamp-3">
              {paper.abstract}
            </div>
          </div>
          <div className="ml-4 flex flex-col items-center space-y-2">
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100"
              onClick={handleSaveToggle}
              disabled={savePaperMutation.isPending || removeSavedPaperMutation.isPending}
            >
              {isSavedState ? (
                <BookmarkCheck className="text-primary h-5 w-5" />
              ) : (
                <Bookmark className="text-gray-400 hover:text-primary h-5 w-5" />
              )}
            </button>
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100"
              onClick={handleShare}
            >
              <Share2 className="text-gray-400 hover:text-primary h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-sm">
            <span className="flex items-center text-gray-600 mr-3">
              <Eye className="h-4 w-4 mr-1" /> {paper.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center text-gray-600">
              <FileText className="h-4 w-4 mr-1" /> {paper.pageCount || "?"} pages
            </span>
          </div>
          <div>
            <Button
              onClick={() => setExpanded(!expanded)}
              variant="outline"
              className="px-3 py-1.5 text-sm font-medium text-primary bg-indigo-50 hover:bg-indigo-100 focus:outline-none border-indigo-100"
            >
              {expanded ? "Hide Summary" : "View Summary"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Expandable Summary Section */}
      {expanded && (
        <div className="px-5 pt-2 pb-5 border-t border-gray-100 bg-gray-50">
          <SummaryTabs paperId={paper.id} />
        </div>
      )}
    </Card>
  );
};
