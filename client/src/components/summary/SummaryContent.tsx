import { FC } from "react";
import { Summary } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SummaryContentProps {
  summary: Summary | undefined;
  activeTab: "short" | "medium" | "detailed";
  isLoading: boolean;
  error: Error | null;
}

export const SummaryContent: FC<SummaryContentProps> = ({ 
  summary, 
  activeTab, 
  isLoading, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-gray-800" />
        <Skeleton className="h-4 w-full bg-gray-800" />
        <Skeleton className="h-4 w-5/6 bg-gray-800" />
        <Skeleton className="h-4 w-4/5 bg-gray-800" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-gray-900 border-red-900 text-red-400">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load summary. Please try regenerating the summary.
        </AlertDescription>
      </Alert>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
          <path d="M8 7h8M8 11h8M8 15h5"/>
        </svg>
        <p className="text-sm text-gray-500">Summary not available.</p>
      </div>
    );
  }

  // Short Summary (Bullet Points)
  if (activeTab === "short") {
    // Handle bullet points display
    if (summary.shortSummary) {
      if (summary.shortSummary.includes('•')) {
        // Already has bullet points
        return (
          <div className="text-sm text-gray-300 whitespace-pre-line">
            {summary.shortSummary}
          </div>
        );
      } else {
        // Convert to bullet points if not already formatted
        return (
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
            {summary.shortSummary.split(/\n|\./).filter(point => point.trim().length > 10).map((point, index) => (
              <li key={index}>{point.trim()}</li>
            ))}
          </ul>
        );
      }
    } else {
      return <p className="text-sm text-gray-500">Short summary not available.</p>;
    }
  }

  // Medium Summary (Extract)
  if (activeTab === "medium") {
    return (
      <div className="text-sm text-gray-300">
        {summary.mediumSummary ? (
          <p className="whitespace-pre-line">{summary.mediumSummary}</p>
        ) : (
          <p className="text-gray-500">Medium summary not available.</p>
        )}
      </div>
    );
  }

  // Helper function for simple markdown rendering
  const renderMarkdown = (text: string) => {
    // Split by newlines to handle paragraphs
    return text.split('\n\n').map((paragraph, index) => {
      // Bold text handling (**text**)
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      
      return (
        <div key={index} className="mb-3 text-gray-300 leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              // Remove ** and render as strong
              return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
            } else if (part.startsWith('# ')) {
              // Header 1
              return <h3 key={i} className="text-lg font-bold text-white mb-2 mt-4">{part.slice(2)}</h3>;
            } else if (part.startsWith('## ')) {
              // Header 2
              return <h4 key={i} className="text-md font-semibold text-blue-400 mb-2 mt-3">{part.slice(3)}</h4>;
            } else if (part.trim().startsWith('- ')) {
              // List items
               return <li key={i} className="ml-4 list-disc text-gray-300">{part.trim().slice(2)}</li>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  // Detailed Summary
  if (activeTab === "detailed") {
    return (
      <div className="text-sm">
        {summary.detailedSummary ? (
          <div>{renderMarkdown(summary.detailedSummary)}</div>
        ) : (
          <p className="text-gray-500">Detailed summary not available.</p>
        )}
      </div>
    );
  }

  return null;
};
