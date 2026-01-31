import { useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings as SettingsIcon, User, Bell, Palette, 
  Database, Key, Save, Mail, Globe
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DOMAINS, PLATFORMS, RESULTS_PER_PAGE } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect, Option } from "@/components/ui/multi-select";

const INTEREST_OPTIONS: Option[] = [
  { label: "Artificial Intelligence", value: "Artificial Intelligence" },
  { label: "Machine Learning", value: "Machine Learning" },
  { label: "Medicine", value: "Medicine" },
  { label: "Physics", value: "Physics" },
  { label: "Chemistry", value: "Chemistry" },
  { label: "Biology", value: "Biology" },
  { label: "Mathematics", value: "Mathematics" },
  { label: "Engineering", value: "Engineering" },
  { label: "Neuroscience", value: "Neuroscience" },
  { label: "Environmental Science", value: "Environmental Science" },
  { label: "Economics", value: "Economics" },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { 
    userProfile, setUserProfile,
    searchPreferences, setSearchPreferences,
    displaySettings, setDisplaySettings,
    clearRecentSearches, clearAllSavedPapers, resetAllPreferences
  } = useAppState();
  const { toast } = useToast();
  
  // Profile state (local buffer)
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [institution, setInstitution] = useState(userProfile.institution);
  // Parse initial CSV string to array
  const [interests, setInterests] = useState<string[]>(() => 
    userProfile.interests ? userProfile.interests.split(',').map(s => s.trim()).filter(Boolean) : []
  );

  // Preferences state (local buffer)
  const [defaultDomain, setDefaultDomain] = useState(() => 
    searchPreferences.defaultDomain || "all"
  );
  const [defaultPlatform, setDefaultPlatform] = useState(() => 
    searchPreferences.defaultPlatform || "all"
  );
  const [resultsPerPage, setResultsPerPage] = useState(searchPreferences.resultsPerPage);
  const [emailNotifications, setEmailNotifications] = useState(searchPreferences.emailNotifications);
  const [weeklyDigest, setWeeklyDigest] = useState(searchPreferences.weeklyDigest);
  const [includeAbstracts, setIncludeAbstracts] = useState(searchPreferences.includeAbstracts);
  const [exactMatch, setExactMatch] = useState(searchPreferences.exactMatch);

  // Display state (local buffer)
  const [theme, setTheme] = useState(displaySettings.theme);
  const [fontSize, setFontSize] = useState(displaySettings.fontSize);
  const [compactView, setCompactView] = useState(displaySettings.compactView);

  const handleSaveProfile = () => {
    // Convert array back to CSV string
    setUserProfile({ 
      name, 
      email, 
      institution, 
      interests: interests.join(', ') 
    });
    toast({
      title: "Profile Saved",
      description: "Your profile information has been updated.",
      duration: 3000,
    });
  };

  const handleSavePreferences = () => {
    setSearchPreferences({ 
      defaultDomain: defaultDomain === "all" ? "" : defaultDomain,
      defaultPlatform: defaultPlatform === "all" ? "" : defaultPlatform,
      resultsPerPage, 
      emailNotifications, 
      weeklyDigest,
      includeAbstracts,
      exactMatch
    });
    toast({
      title: "Preferences Saved",
      description: "Your search preferences have been updated.",
      duration: 3000,
    });
  };

  const handleSaveDisplay = () => {
    setDisplaySettings({ theme, fontSize, compactView });
    toast({
      title: "Display Settings Saved",
      description: "Your display settings have been updated.",
      duration: 3000,
    });
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your entire search history?")) {
      clearRecentSearches();
    }
  };

  const handleClearSaved = () => {
    if (confirm("Are you sure you want to delete all saved papers? This cannot be undone.")) {
      clearAllSavedPapers();
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all preferences to default?")) {
      resetAllPreferences();
      window.location.reload(); 
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setDisplaySettings({ theme: newTheme }); // Instant apply
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}`,
      duration: 1500,
    });
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            <SettingsIcon className="inline-block w-8 h-8 mr-3 text-blue-400" />
            Settings
          </h1>
          <p className="text-gray-400">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#1F1F1F] border border-gray-700 p-1">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="preferences"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="display"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Palette className="w-4 h-4 mr-2" />
                Display
              </TabsTrigger>
              <TabsTrigger 
                value="data"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Database className="w-4 h-4 mr-2" />
                Data & Privacy
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-[#1F1F1F]/50 border border-gray-700 rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#0A1A2F] border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#0A1A2F] border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution" className="text-gray-300">Institution</Label>
                    <Input
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="bg-[#0A1A2F] border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="interests" className="text-gray-300">Research Interests</Label>
                    <MultiSelect
                      options={INTEREST_OPTIONS}
                      selected={interests}
                      onChange={setInterests}
                      placeholder="Select your research interests"
                      className="bg-[#0A1A2F] border-gray-700 text-white"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <div className="bg-[#1F1F1F]/50 border border-gray-700 rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Search Preferences</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Default Domain</Label>
                    <Select value={defaultDomain} onValueChange={setDefaultDomain}>
                      <SelectTrigger className="bg-[#0A1A2F] border-gray-700 text-white">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1F1F1F] border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-800">All Domains</SelectItem>
                        {DOMAINS.filter(d => d !== 'Other').map(domain => (
                          <SelectItem key={domain} value={domain} className="text-white hover:bg-gray-800">
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Default Platform</Label>
                    <Select value={defaultPlatform} onValueChange={setDefaultPlatform}>
                      <SelectTrigger className="bg-[#0A1A2F] border-gray-700 text-white">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1F1F1F] border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-800">All Platforms</SelectItem>
                        {PLATFORMS.filter(p => p !== 'Other').map(platform => (
                          <SelectItem key={platform} value={platform} className="text-white hover:bg-gray-800">
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Results Per Page</Label>
                    <Select value={resultsPerPage} onValueChange={setResultsPerPage}>
                      <SelectTrigger className="bg-[#0A1A2F] border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1F1F1F] border-gray-700">
                        {RESULTS_PER_PAGE.map(num => (
                          <SelectItem key={num} value={num.toString()} className="text-white hover:bg-gray-800">
                            {num} results
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <div>
                          <Label className="text-gray-300">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive updates about new papers</p>
                        </div>
                      </div>
                      <Switch 
                        checked={emailNotifications} 
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-400" />
                        <div>
                          <Label className="text-gray-300">Weekly Digest</Label>
                          <p className="text-sm text-gray-500">Summary of trending papers</p>
                        </div>
                      </div>
                      <Switch 
                        checked={weeklyDigest} 
                        onCheckedChange={setWeeklyDigest}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSavePreferences}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" className="space-y-6">
              <div className="bg-[#1F1F1F]/50 border border-gray-700 rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Display Settings</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Theme</Label>
                    <div className="flex gap-2 p-1 bg-[#0A1A2F] rounded-lg border border-gray-700">
                      <Button
                        variant={theme === 'dark' ? 'default' : 'ghost'}
                        className={`flex-1 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => handleThemeChange('dark')}
                      >
                        Dark
                      </Button>
                      <Button
                        variant={theme === 'light' ? 'default' : 'ghost'}
                        className={`flex-1 ${theme === 'light' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => handleThemeChange('light')}
                      >
                        Light
                      </Button>
                      <Button
                        variant={theme === 'system' ? 'default' : 'ghost'}
                        className={`flex-1 ${theme === 'system' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => handleThemeChange('system')}
                      >
                        System
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Font Size</Label>
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger className="bg-[#0A1A2F] border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1F1F1F] border-gray-700">
                        <SelectItem value="small" className="text-white hover:bg-gray-800">Small</SelectItem>
                        <SelectItem value="medium" className="text-white hover:bg-gray-800">Medium</SelectItem>
                        <SelectItem value="large" className="text-white hover:bg-gray-800">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Compact View</Label>
                      <p className="text-sm text-gray-500">Show more content in less space</p>
                    </div>
                    <Switch 
                      checked={compactView} 
                      onCheckedChange={setCompactView}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveDisplay}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Display Settings
                </Button>
              </div>
            </TabsContent>

            {/* Data & Privacy Tab */}
            <TabsContent value="data" className="space-y-6">
              <div className="bg-[#1F1F1F]/50 border border-gray-700 rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Data & Privacy</h2>
                
                <div className="space-y-4">
                  <Button 
                    variant="outline"
                    className="w-full justify-start bg-[#0A1A2F] border-gray-700 text-white hover:bg-gray-800"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start bg-[#0A1A2F] border-gray-700 text-white hover:bg-gray-800"
                    onClick={handleClearHistory}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Clear Search History
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start bg-red-900/10 border-red-900/50 text-red-400 hover:bg-red-900/20"
                    onClick={handleClearSaved}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Clear Saved Papers
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start bg-yellow-900/10 border-yellow-900/50 text-yellow-400 hover:bg-yellow-900/20"
                    onClick={handleReset}
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Reset All Preferences
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full justify-start bg-red-900/20 border-red-900 text-red-400 hover:bg-red-900/30"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>


              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
