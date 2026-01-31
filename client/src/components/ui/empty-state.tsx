import { motion } from 'framer-motion';
import { FileQuestion, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon: Icon = FileQuestion, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mb-6">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
        >
          <SearchIcon className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
