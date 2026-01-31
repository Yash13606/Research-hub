import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function PaperCardSkeleton() {
  return (
    <Card className="h-full bg-[#1F1F1F]/50 border-gray-700 animate-pulse">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded w-4/6"></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
          <div className="h-6 w-14 bg-gray-700 rounded-full"></div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-700 pt-4 flex justify-between">
        <div className="h-8 w-8 bg-gray-700 rounded"></div>
        <div className="h-8 w-24 bg-gray-700 rounded"></div>
        <div className="h-8 w-8 bg-gray-700 rounded"></div>
      </CardFooter>
    </Card>
  );
}
