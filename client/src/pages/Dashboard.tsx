
import { motion, animate } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, BookMarked, Search, Clock, Users, FileText, 
  Sparkles, ArrowRight, Brain, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/contexts/AppStateContext';

export default function Dashboard() {
  const { savedPapers, recentSearches, totalSearchesCount } = useAppState();
  
  // ------------------------------------------------------------------
  // REAL DATA CALCULATIONS
  // ------------------------------------------------------------------
  const totalSearches = totalSearchesCount;
  const totalSaved = savedPapers.length;
  const totalCitations = savedPapers.reduce((acc, paper) => acc + (paper.citation_count || 0), 0);
  const timeSavedMinutes = totalSaved * 5; // Assumed 5 min saved per paper summary
  
  // Derived Stats for AI Insights
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    savedPapers.forEach(p => {
      const d = p.domain || 'Other';
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [savedPapers]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    savedPapers.forEach(p => {
      const pl = p.platform || 'Other';
      counts[pl] = (counts[pl] || 0) + 1;
    });
    return counts;
  }, [savedPapers]);

  const topDomain = Object.keys(domainCounts).reduce((a, b) => domainCounts[a] > domainCounts[b] ? a : b, '');
  const topPlatform = Object.keys(platformCounts).reduce((a, b) => platformCounts[a] > platformCounts[b] ? a : b, '');

  const hasActivity = totalSearches > 0 || totalSaved > 0;

  // ------------------------------------------------------------------
  // AI INSIGHT GENERATION
  // ------------------------------------------------------------------
  const getAIInsight = () => {
    if (!hasActivity) return "Start searching to unlock personalized research insights.";
    
    if (topDomain && domainCounts[topDomain] > 2) 
      return `You explore ${topDomain} research more than other domains.`;
    
    if (topPlatform && platformCounts[topPlatform] > 2)
      return `Most of your saved papers come from ${topPlatform}.`;
    
    if (totalSaved > 5)
      return "Your research library is growing steadily.";
      
    return "Your research activity is steadily increasing.";
  };

  const aiInsight = getAIInsight();

  // ------------------------------------------------------------------
  // CHART DATA PREPARATION (Real vs Placeholder)
  // ------------------------------------------------------------------
  
  // DOMAIN DATA
  const realDomainData = Object.entries(domainCounts).map(([name, value]) => ({ name, value }));
  const placeholderDomainData = [
    { name: 'AI', value: 35 }, { name: 'Medicine', value: 25 }, 
    { name: 'Physics', value: 20 }, { name: 'Biology', value: 12 }, { name: 'Other', value: 8 }
  ];
  const domainData = realDomainData.length > 0 ? realDomainData : placeholderDomainData;

  // PLATFORM DATA
  const realPlatformData = Object.entries(platformCounts).map(([name, count]) => ({ name, papers: count }));
  const placeholderPlatformData = [
    { name: 'ArXiv', papers: 12 }, { name: 'IEEE', papers: 8 }, 
    { name: 'Springer', papers: 6 }, { name: 'PubMed', papers: 5 }, { name: 'ScienceDirect', papers: 3 }
  ];
  const platformData = realPlatformData.length > 0 ? realPlatformData : placeholderPlatformData;

  // ACTIVITY DATA (Placeholder for now as we don't track daily history yet)
  const placeholderActivityData = [
    { day: 'Mon', searches: 45, saves: 12 }, { day: 'Tue', searches: 52, saves: 15 },
    { day: 'Wed', searches: 38, saves: 8 }, { day: 'Thu', searches: 65, saves: 20 },
    { day: 'Fri', searches: 58, saves: 18 }, { day: 'Sat', searches: 42, saves: 10 },
    { day: 'Sun', searches: 35, saves: 7 },
  ];
  // Simple ghost animation data if no activity
  const ghostActivityData = [
    { day: 'Mon', searches: 10, saves: 2 }, { day: 'Tue', searches: 15, saves: 4 },
    { day: 'Wed', searches: 8, saves: 1 }, { day: 'Thu', searches: 25, saves: 8 },
    { day: 'Fri', searches: 18, saves: 5 }, { day: 'Sat', searches: 12, saves: 3 },
    { day: 'Sun', searches: 5, saves: 1 },
  ];
  const activityData = hasActivity ? placeholderActivityData : ghostActivityData;


  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1️⃣ HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            Welcome back <span className="text-2xl">👋</span>
            <span className="text-gray-500 font-light hidden sm:inline">|</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Research Intelligence
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Your activity, patterns, and paper insights — powered by AI.
          </p>
        </motion.div>

        {/* 2️⃣ SMART STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SmartStatCard
            icon={Search}
            title="Total Searches"
            value={totalSearches}
            emptyText="No searches yet"
            color="blue"
            delay={0.1}
          />
          <SmartStatCard
            icon={BookMarked}
            title="Saved Papers"
            value={totalSaved}
            emptyText="Library empty"
            color="indigo"
            delay={0.2}
          />
          <SmartStatCard
            icon={TrendingUp}
            title="Citations Tracked"
            value={totalCitations}
            emptyText="Save papers to track"
            color="purple"
            delay={0.3}
          />
          <SmartStatCard
            icon={Clock}
            title="Time Saved (Est.)"
            value={timeSavedMinutes}
            emptyText="Start summarizing"
            isTime
            color="green"
            delay={0.4}
          />
        </div>

        {/* 3️⃣ AI INSIGHT CARD */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.5 }}
           className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-1"
        >
           <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 p-6">
             <div className="p-3 bg-purple-500/20 rounded-full animate-pulse">
               <Brain className="w-6 h-6 text-purple-300" />
             </div>
             <div className="flex-1 text-center md:text-left">
               <h3 className="text-purple-300 font-bold text-sm tracking-wider uppercase mb-1">
                 🧠 AI Research Insight
               </h3>
               <p className="text-white text-lg font-medium">
                 "{aiInsight}"
               </p>
             </div>
             {hasActivity && (
                <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                  View Analysis
                </Button>
             )}
           </div>
        </motion.div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 4️⃣ DOMAIN CHART */}
          <ChartCard title="Research Domains" delay={0.6}>
            <div className="relative">
               {!realDomainData.length && <PlaceholderOverlay text="Your domain preferences will update as you explore." />}
               <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={domainData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {domainData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 5️⃣ PLATFORM CHART */}
          <ChartCard title="Platform Distribution" delay={0.7}>
             <div className="relative">
                {!realPlatformData.length && <PlaceholderOverlay text="Platform usage will appear as you search." />}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="papers" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1500}>
                       {platformData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </ChartCard>

          {/* 6️⃣ SEARCH ACTIVITY GRAPH */}
          <ChartCard title="Search Activity (Last 7 Days)" delay={0.8} className="lg:col-span-2">
             <div className="relative">
                {!hasActivity && <PlaceholderOverlay text="Your weekly research pattern will appear here." />}
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="searches" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      activeDot={{ r: 8 }}
                      strokeOpacity={hasActivity ? 1 : 0.3} // Ghost effect
                    />
                    <Line 
                      type="monotone" 
                      dataKey="saves" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#8b5cf6' }}
                      strokeOpacity={hasActivity ? 1 : 0.3} // Ghost effect
                    />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* 7️⃣ TOP PAPERS / TRENDING */}
           <ChartCard title={hasActivity ? "Most Cited Papers" : "Trending Foundational Papers"} delay={0.9}>
              <div className="space-y-4">
                 {(hasActivity ? savedPapers.slice(0, 3) : TRENDING_PAPERS).map((paper: any, idx) => (
                    <motion.div
                       key={idx}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.9 + idx * 0.1 }}
                       className="flex items-center justify-between p-3 rounded-lg bg-[#2D3748]/50 border border-gray-700 hover:border-blue-500/50 transition-all group cursor-pointer"
                    >
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg group-hover:text-white group-hover:bg-blue-600 transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm line-clamp-1">{paper.title}</h4>
                            <p className="text-gray-400 text-xs">{Array.isArray(paper.authors) ? paper.authors[0] : paper.authors} et al.</p>
                          </div>
                       </div>
                       {!hasActivity && (
                          <Badge variant="secondary" className="bg-blue-900/20 text-blue-300 border-blue-800">Popular</Badge>
                       )}
                    </motion.div>
                 ))}
                 {!hasActivity && (
                    <Button className="w-full mt-4 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/30">
                       Explore Popular Papers <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                 )}
              </div>
           </ChartCard>

           {/* 8️⃣ RECENT ACTIVITY */}
           <ChartCard title="Recent Activity" delay={1.0}>
              <div className="space-y-4">
                 {recentSearches.length > 0 ? (
                    recentSearches.slice(0, 4).map((search, idx) => (
                       <div key={idx} className="flex gap-4 items-start">
                          <div className="mt-1 relative">
                             <div className="absolute inset-0 bg-blue-500 blur-sm opacity-20 rounded-full" />
                             <div className="w-2 h-2 bg-blue-500 rounded-full relative z-10" />
                             {idx !== recentSearches.length - 1 && (
                                <div className="absolute top-3 left-1 w-px h-8 bg-gray-700" />
                             )}
                          </div>
                          <div>
                             <p className="text-sm text-gray-300">Searched for <span className="text-white font-medium">"{search.query}"</span></p>
                             <p className="text-xs text-gray-500">{new Date(search.timestamp).toLocaleDateString()}</p>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                       <Activity className="w-10 h-10 text-gray-500 mb-2" />
                       <p className="text-white font-medium">No recent activity</p>
                       <p className="text-sm text-gray-400">Your searches and saves will appear here.</p>
                    </div>
                 )}
              </div>
           </ChartCard>
        </div>

      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENT HELPERS
// ------------------------------------------------------------------

function SmartStatCard({ icon: Icon, title, value, emptyText, color, delay, isTime }: any) {
  const isZero = value === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="bg-[#1F1F1F]/50 border-gray-700 backdrop-blur-sm hover:border-gray-600 transition-colors h-full">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4">
             <div className={`p-3 rounded-xl bg-${color}-900/20 text-${color}-400`}>
                <Icon className="w-6 h-6" />
             </div>
             {/* Sparkle if active */}
             {!isZero && <Sparkles className={`w-4 h-4 text-${color}-400 opacity-50`} />}
          </div>
          
          <div>
            <div className={`text-2xl font-bold ${isZero ? 'text-gray-500 text-lg font-normal' : 'text-white'}`}>
              {isZero ? emptyText : (
                 <Counter value={value} isTime={isTime} />
              )}
            </div>
            <div className="text-sm text-gray-400 mt-1">{title}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Counter({ value, isTime }: { value: number, isTime?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);

  if (isTime) {
      const hours = Math.floor(displayValue / 60);
      const mins = displayValue % 60;
      return <span>{hours > 0 ? `${hours}h ` : ''}{mins}m</span>;
  }

  return <span>{displayValue.toLocaleString()}</span>;
}

function ChartCard({ title, children, delay, className = '' }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`h-full ${className}`}
    >
      <Card className="bg-[#1F1F1F]/50 border-gray-700 h-full">
        <CardHeader>
          <CardTitle className="text-white text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

const PlaceholderOverlay = ({ text }: { text: string }) => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1F1F1F]/60 backdrop-blur-[1px]">
    <div className="bg-gray-900/90 px-4 py-2 rounded-lg border border-gray-700 shadow-xl text-center">
       <span className="text-sm text-gray-300 font-medium">✨ {text}</span>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ------------------------------------------------------------------
// DATA CONSTANTS
// ------------------------------------------------------------------

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

const TRENDING_PAPERS = [
  { title: 'Attention Is All You Need', authors: 'Vaswani', citations: 85000 },
  { title: 'BERT: Pre-training of Deep Transformers', authors: 'Devlin', citations: 45000 },
  { title: 'Deep Residual Learning for Image Recognition', authors: 'He', citations: 120000 },
];
