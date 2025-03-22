import { FC, ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 flex items-center justify-between md:hidden">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-gray-600 hover:text-primary focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
            <path d="M8 7h8M8 11h8M8 15h5"/>
          </svg>
          <h1 className="text-xl font-semibold text-gray-800">ResearchPaperHub</h1>
        </div>
        <div className="w-6 h-6">
          {/* Spacer to balance the layout */}
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`w-64 bg-white border-r border-gray-200 fixed top-0 left-0 bottom-0 transition-transform duration-200 ease-in-out z-30 md:relative md:translate-x-0 md:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay for mobile sidebar */}
      <div 
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black transition-opacity duration-200 ease-in-out z-20 md:hidden ${
          sidebarOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};
