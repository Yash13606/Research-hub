import { FC, useState } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { DOMAINS, DOMAIN_ICONS } from "@/lib/constants";
import { SupportDialog } from "./SupportDialog";
import { 
  Home, 
  Bookmark, 
  History, 
  Settings, 
  Cpu, 
  HelpCircle,
  BarChart3,
  Users
} from "lucide-react";

interface SidebarProps {
  onCloseMobile: () => void;
}

import { useAppState } from "@/contexts/AppStateContext";

export const Sidebar: FC<SidebarProps> = ({ onCloseMobile }) => {
  const [location, setLocation] = useLocation();
  const { setSelectedDomain, selectedDomain } = useAppState();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-br from-blue-600/30 to-indigo-900/5 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                <path d="M8 7h8M8 11h8M8 15h5"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">ResearchPaperHub</h1>
          </div>
        </Link>
        <button
          onClick={onCloseMobile}
          className="md:hidden text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 py-2 flex-1">
        <div className="space-y-1">
          <Link href="/home">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/home') 
                ? 'bg-blue-900/20 text-blue-400' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
            }`}>
              <Home className="mr-3 h-5 w-5" />
              <span>Search</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/dashboard') 
                ? 'bg-blue-900/20 text-blue-400' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
            }`}>
              <BarChart3 className="mr-3 h-5 w-5" />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link href="/saved">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/saved') 
                ? 'bg-blue-900/20 text-blue-400' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
            }`}>
              <Bookmark className="mr-3 h-5 w-5" />
              <span>Saved Papers</span>
            </div>
          </Link>
          <Link href="/recent">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/recent') 
                ? 'bg-blue-900/20 text-blue-400' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
            }`}>
              <History className="mr-3 h-5 w-5" />
              <span>Recent Searches</span>
            </div>
          </Link>
          <Link href="/community">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/community') 
                ? 'bg-blue-900/20 text-blue-400' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
            }`}>
              <Users className="mr-3 h-5 w-5" />
              <span>Community</span>
            </div>
          </Link>
          <Link href="/settings">
            <div className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive('/settings') 
                ? 'bg-blue-900/20 text-blue-400' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-primary'
            }`}>
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </div>
          </Link>
        </div>

        <div className="mt-8">
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Domains
        </h3>
        <div className="mt-2 space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
          {DOMAINS.filter(d => d !== 'Other').map((domain) => {
            const Icon = DOMAIN_ICONS[domain] || Cpu;
            const isDomainActive = selectedDomain === domain;
            return (
              <div 
                key={domain}
                onClick={() => {
                  setSelectedDomain(domain);
                  if (location !== '/home') {
                    setLocation('/home');
                  }
                  onCloseMobile();
                }}
                className={`
                  group flex items-center px-4 py-2 text-sm font-medium mx-2 rounded-lg transition-all duration-300 cursor-pointer border
                  ${isDomainActive 
                    ? 'bg-blue-900/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] translate-x-1' 
                    : 'border-transparent text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-700 hover:translate-x-1'
                  }
                `}
              >
                <Icon className={`mr-3 h-5 w-5 transition-colors duration-300 ${isDomainActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-gray-400 group-hover:text-blue-400'}`} />
                <span className="truncate">{domain}</span>
                {isDomainActive && (
                  <motion.div
                    layoutId="active-domain-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 box-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      </nav>

      <div className="p-4">
        <div className="bg-blue-900/10 rounded-lg p-4 text-center border border-blue-900/20">
          <p className="text-sm text-gray-300 mb-2">Need help with research?</p>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md font-medium hover:from-blue-700 hover:to-indigo-700 transition duration-150 flex items-center justify-center shadow-lg hover:shadow-blue-900/20"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Contact Support
          </button>
        </div>
      </div>
      
      <SupportDialog open={isSupportOpen} onOpenChange={setIsSupportOpen} />
    </div>
  );
};
