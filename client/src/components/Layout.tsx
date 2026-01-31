import { FC, ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { GridPattern } from "./ui/grid-pattern";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        if (window.location.pathname !== '/home') {
          setLocation('/home');
          // Start a timeout to allow navigation to complete before dispatching focus
          setTimeout(() => window.dispatchEvent(new CustomEvent('focus-search')), 100);
        } else {
          window.dispatchEvent(new CustomEvent('focus-search'));
        }
      }
      
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setLocation('/saved'); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen bg-[#0A1A2F] text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]",
            "opacity-50"
          )}
        />
      </div>

      {/* Mobile header */}
      <header className="relative z-10 bg-[#0A1A2F] border-b border-gray-800 py-4 px-4 flex items-center justify-between md:hidden">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-gray-400 hover:text-primary focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500/30 to-blue-900/5 p-1.5 rounded-lg mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
              <path d="M8 7h8M8 11h8M8 15h5"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">ResearchHub</h1>
        </div>
        <div className="w-6 h-6">
          {/* Spacer to balance the layout */}
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`w-64 bg-[#0A1A2F] border-r border-gray-800 fixed top-0 left-0 bottom-0 transition-transform duration-200 ease-in-out z-30 md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay for mobile sidebar */}
      <div 
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black/80 transition-opacity duration-200 ease-in-out z-20 md:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-auto bg-transparent">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
