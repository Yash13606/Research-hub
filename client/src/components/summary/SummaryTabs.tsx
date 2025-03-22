import { FC, useState } from "react";
import { useSummary } from "@/hooks/useSummary";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { SummaryContent } from "./SummaryContent";

interface SummaryTabsProps {
  paperId: number;
}

export const SummaryTabs: FC<SummaryTabsProps> = ({ paperId }) => {
  const [activeTab, setActiveTab] = useState<"short" | "medium" | "detailed">("short");
  const { data: summary, isLoading, error } = useSummary(paperId);
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateSummary = async () => {
    try {
      setIsRegenerating(true);
      await apiRequest("POST", `/api/papers/${paperId}/regenerate-summary`);
      
      // Invalidate the summary query to fetch the new summary
      await queryClient.invalidateQueries({ queryKey: [`/api/papers/${paperId}/summary`] });
      
      toast({
        title: "Summary regenerated",
        description: "The summary has been successfully regenerated.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error regenerating summary:", error);
      toast({
        title: "Failed to regenerate summary",
        description: "An error occurred while regenerating the summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div>
      {/* Summary Tabs */}
      <div className="flex border-b border-gray-800 mb-4">
        <button 
          onClick={() => setActiveTab("short")} 
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "short" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Short
        </button>
        <button 
          onClick={() => setActiveTab("medium")} 
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "medium" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Medium
        </button>
        <button 
          onClick={() => setActiveTab("detailed")} 
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "detailed" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Detailed
        </button>
      </div>
      
      {/* Summary Content */}
      <SummaryContent 
        summary={summary}
        activeTab={activeTab}
        isLoading={isLoading}
        error={error}
      />
      
      <div className="mt-4 flex items-center justify-between">
        <Button
          onClick={handleRegenerateSummary}
          variant="ghost"
          className="text-sm text-primary hover:text-green-400 hover:bg-green-900/20 p-2"
          disabled={isLoading || isRegenerating}
        >
          <RefreshCcw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Regenerating...' : 'Regenerate Summary'}
        </Button>
        <a href="#" className="text-sm text-primary hover:text-green-400 flex items-center">
          View Full Paper <ArrowRight className="h-4 w-4 ml-1" />
        </a>
      </div>
    </div>
  );
};
