import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

import { Paper } from "@/lib/types";

interface FilterOptions {
  domain: string;
  platform: string;
  author: string;
  journal: string;
  dateRange: string;
  sortBy: string;
  institution: string;
}

interface RecentSearch {
  id: number;
  query: string;
  filters: Partial<FilterOptions>;
  timestamp: string;
  resultCount?: number;
}

interface AppState {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Domain state
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  
  // Filter state
  filterOptions: FilterOptions;
  setFilterOptions: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  
  // Saved papers state
  savedPapers: Paper[];
  addSavedPaper: (paper: Paper) => void;
  removeSavedPaper: (paperId: number) => void;
  isPaperSaved: (paperId: number) => boolean;
  
  // Recent searches state
  recentSearches: RecentSearch[];
  addRecentSearch: (search: Omit<RecentSearch, 'id' | 'timestamp'>) => void;
  removeRecentSearch: (searchId: number) => void;
  clearRecentSearches: () => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // View preferences
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const defaultFilterOptions: FilterOptions = {
  domain: '',
  platform: '',
  author: '',
  journal: '',
  dateRange: '',
  sortBy: 'relevance',
  institution: '',
};

const AppStateContext = createContext<AppState | undefined>(undefined);

interface UserProfile {
  name: string;
  email: string;
  institution: string;
  interests: string;
}

interface SearchPreferences {
  defaultDomain: string;
  defaultPlatform: string;
  resultsPerPage: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  includeAbstracts: boolean;
  exactMatch: boolean;
}

interface DisplaySettings {
  theme: string;
  fontSize: string;
  compactView: boolean;
}

interface AppState {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Domain state
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  
  // Filter state
  filterOptions: FilterOptions;
  setFilterOptions: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  
  // Saved papers state
  savedPapers: Paper[];
  addSavedPaper: (paper: Paper) => void;
  removeSavedPaper: (paperId: number) => void;
  isPaperSaved: (paperId: number) => boolean;
  
  // Recent searches state
  recentSearches: RecentSearch[];
  addRecentSearch: (search: Omit<RecentSearch, 'id' | 'timestamp'>) => void;
  removeRecentSearch: (searchId: number) => void;
  clearRecentSearches: () => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // View preferences
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  // New Global Settings
  userProfile: UserProfile;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  searchPreferences: SearchPreferences;
  setSearchPreferences: (prefs: Partial<SearchPreferences>) => void;
  displaySettings: DisplaySettings;
  setDisplaySettings: (settings: Partial<DisplaySettings>) => void;
  
  // Dashboard Stats
  totalSearchesCount: number;
  incrementTotalSearches: () => void;
  
  // Global Actions
  resetAllPreferences: () => void;
  clearAllSavedPapers: () => void;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Load state from localStorage
  const [searchQuery, setSearchQueryState] = useState(() => 
    localStorage.getItem('searchQuery') || ''
  );
  
  const [selectedDomain, setSelectedDomainState] = useState(() => 
    localStorage.getItem('selectedDomain') || ''
  );
  
  const [filterOptions, setFilterOptionsState] = useState<FilterOptions>(() => {
    const saved = localStorage.getItem('filterOptions');
    return saved ? JSON.parse(saved) : defaultFilterOptions;
  });
  
  const [savedPapers, setSavedPapers] = useState<Paper[]>(() => {
    const saved = localStorage.getItem('savedPapers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // New States Initialization
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      name: "John Doe",
      email: "john.doe@example.com",
      institution: "MIT",
      interests: "Artificial Intelligence, Machine Learning"
    };
  });

  const [searchPreferences, setSearchPreferencesState] = useState<SearchPreferences>(() => {
    const saved = localStorage.getItem('searchPreferences');
    return saved ? JSON.parse(saved) : {
      defaultDomain: "",
      defaultPlatform: "",
      resultsPerPage: "20",
      emailNotifications: true,
      weeklyDigest: false,
      includeAbstracts: true,
      exactMatch: false
    };
  });

  const [displaySettings, setDisplaySettingsState] = useState<DisplaySettings>(() => {
    const saved = localStorage.getItem('displaySettings');
    return saved ? JSON.parse(saved) : {
      theme: "dark",
      fontSize: "medium",
      compactView: false
    };
  });

  const [totalSearchesCount, setTotalSearchesCount] = useState<number>(() => {
    const saved = localStorage.getItem('totalSearchesCount');
    return saved ? parseInt(saved) : 0;
  });
  
  // Persist to localStorage
  useEffect(() => { localStorage.setItem('searchQuery', searchQuery); }, [searchQuery]);
  useEffect(() => { localStorage.setItem('selectedDomain', selectedDomain); }, [selectedDomain]);
  useEffect(() => { localStorage.setItem('filterOptions', JSON.stringify(filterOptions)); }, [filterOptions]);
  useEffect(() => { localStorage.setItem('savedPapers', JSON.stringify(savedPapers)); }, [savedPapers]);
  useEffect(() => { localStorage.setItem('recentSearches', JSON.stringify(recentSearches)); }, [recentSearches]);
  // New Persistence
  useEffect(() => { localStorage.setItem('userProfile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('searchPreferences', JSON.stringify(searchPreferences)); }, [searchPreferences]);
  useEffect(() => { localStorage.setItem('displaySettings', JSON.stringify(displaySettings)); }, [displaySettings]);
  useEffect(() => { localStorage.setItem('totalSearchesCount', totalSearchesCount.toString()); }, [totalSearchesCount]);
  
  // Actions
  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
  };
  
  const setSelectedDomain = (domain: string) => {
    setSelectedDomainState(domain);
    // Also update filter options to match
    setFilterOptionsState(prev => ({ ...prev, domain }));
    
    if (domain) {
      toast({
        title: "Domain Selected",
        description: `Filtering by ${domain}`,
        duration: 2000,
      });
    }
  };
  
  const setFilterOptions = (filters: Partial<FilterOptions>) => {
    setFilterOptionsState(prev => ({ ...prev, ...filters }));
  };
  
  const resetFilters = () => {
    setFilterOptionsState(defaultFilterOptions);
    setSelectedDomainState('');
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared",
      duration: 2000,
    });
  };
  
  const addSavedPaper = (paper: Paper) => {
    if (!savedPapers.find(p => p.id === paper.id)) {
      setSavedPapers(prev => [paper, ...prev]);
      toast({
        title: "Paper Saved",
        description: `"${paper.title.substring(0, 50)}..." added to saved papers`,
        duration: 3000,
      });
    }
  };
  
  const removeSavedPaper = (paperId: number) => {
    const paper = savedPapers.find(p => p.id === paperId);
    setSavedPapers(prev => prev.filter(p => p.id !== paperId));
    
    if (paper) {
      toast({
        title: "Paper Removed",
        description: `"${paper.title.substring(0, 50)}..." removed from saved papers`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const isPaperSaved = (paperId: number) => {
    return savedPapers.some(p => p.id === paperId);
  };
  
  const addRecentSearch = (search: Omit<RecentSearch, 'id' | 'timestamp'>) => {
    const newSearch: RecentSearch = {
      ...search,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    
    setRecentSearches(prev => [newSearch, ...prev.slice(0, 49)]); // Keep last 50
  };
  
  const removeRecentSearch = (searchId: number) => {
    setRecentSearches(prev => prev.filter(s => s.id !== searchId));
    toast({
      title: "Search Removed",
      description: "Search removed from history",
      duration: 2000,
    });
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    toast({
      title: "History Cleared",
      description: "All recent searches have been removed",
      variant: "destructive",
      duration: 2000,
    });
  };

  const setUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfileState(prev => ({ ...prev, ...profile }));
  };

  const setSearchPreferences = (prefs: Partial<SearchPreferences>) => {
    setSearchPreferencesState(prev => ({ ...prev, ...prefs }));
  };

  const setDisplaySettings = (settings: Partial<DisplaySettings>) => {
    setDisplaySettingsState(prev => ({ ...prev, ...settings }));
  };
  
  const incrementTotalSearches = () => {
    setTotalSearchesCount(prev => prev + 1);
  };
  
  const resetAllPreferences = () => {
    setSearchPreferencesState({
      defaultDomain: "",
      defaultPlatform: "",
      resultsPerPage: "20",
      emailNotifications: true,
      weeklyDigest: false,
      includeAbstracts: true,
      exactMatch: false
    });
    setDisplaySettingsState({
      theme: "dark",
      fontSize: "medium",
      compactView: false
    });
    setFilterOptionsState(defaultFilterOptions);
    toast({
      title: "Preferences Reset",
      description: "All settings have been restored to default",
    });
  };
  
  const clearAllSavedPapers = () => {
    setSavedPapers([]);
    toast({
      title: "Library Cleared",
      description: "All saved papers have been removed",
      variant: "destructive",
    });
  };
  
  const value: AppState = {
    searchQuery,
    setSearchQuery,
    selectedDomain,
    setSelectedDomain,
    filterOptions,
    setFilterOptions,
    resetFilters,
    savedPapers,
    addSavedPaper,
    removeSavedPaper,
    isPaperSaved,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    isLoading,
    setIsLoading,
    viewMode,
    setViewMode,
    userProfile,
    setUserProfile,
    searchPreferences,
    setSearchPreferences,
    displaySettings,
    setDisplaySettings,
    totalSearchesCount,
    incrementTotalSearches,
    resetAllPreferences,
    clearAllSavedPapers,
  };
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
