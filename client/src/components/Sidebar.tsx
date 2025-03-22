import { FC } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";

// Import icons from Lucide
import { 
  Home, 
  Bookmark, 
  History, 
  Settings, 
  Cpu, 
  Heart, 
  Rocket, 
  Beaker, 
  Leaf,
  HelpCircle
} from "lucide-react";

interface SidebarProps {
  onCloseMobile: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ onCloseMobile }) => {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
            <path d="M8 7h8M8 11h8M8 15h5"/>
          </svg>
          <h1 className="text-xl font-semibold text-gray-800">ResearchPaperHub</h1>
        </div>
        <button
          onClick={onCloseMobile}
          className="md:hidden text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 py-2 flex-1">
        <div className="space-y-1">
          <Link href="/">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/') 
                ? 'bg-green-900/10 text-primary' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-primary'
            }`}>
              <Home className="mr-3 h-5 w-5" />
              <span>Home</span>
            </div>
          </Link>
          <Link href="/saved">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/saved') 
                ? 'bg-green-900/10 text-primary' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-primary'
            }`}>
              <Bookmark className="mr-3 h-5 w-5" />
              <span>Saved Papers</span>
            </div>
          </Link>
          <Link href="/recent">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/recent') 
                ? 'bg-green-900/10 text-primary' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-primary'
            }`}>
              <History className="mr-3 h-5 w-5" />
              <span>Recent Searches</span>
            </div>
          </Link>
          <Link href="/settings">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/settings') 
                ? 'bg-green-900/10 text-primary' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-primary'
            }`}>
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </div>
          </Link>
        </div>

        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Domains
          </h3>
          <div className="mt-2 space-y-1">
            <Link href="/?domain=Artificial Intelligence">
              <a className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary">
                <Cpu className="mr-3 h-5 w-5" />
                <span>Artificial Intelligence</span>
              </a>
            </Link>
            <Link href="/?domain=Medicine">
              <a className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary">
                <Heart className="mr-3 h-5 w-5" />
                <span>Medicine</span>
              </a>
            </Link>
            <Link href="/?domain=Physics">
              <a className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary">
                <Rocket className="mr-3 h-5 w-5" />
                <span>Physics</span>
              </a>
            </Link>
            <Link href="/?domain=Chemistry">
              <a className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary">
                <Beaker className="mr-3 h-5 w-5" />
                <span>Chemistry</span>
              </a>
            </Link>
            <Link href="/?domain=Biology">
              <a className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary">
                <Leaf className="mr-3 h-5 w-5" />
                <span>Biology</span>
              </a>
            </Link>
          </div>
        </div>
      </nav>

      <div className="p-4">
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Need help with research?</p>
          <button className="w-full px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-indigo-700 transition duration-150 flex items-center justify-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};
