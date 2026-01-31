import { useState, useEffect } from 'react';
import { GridPattern } from '@/components/ui/grid-pattern';
import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  BookOpen, Zap, Brain, TrendingUp, Search, BarChart3, 
  Sparkles, CheckCircle2, FileText, Share2, Layers, 
  Bookmark, Users, ArrowRight, Github, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020817] text-white overflow-hidden relative font-sans selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#020817] via-[#051025] to-[#020817]" />
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]",
            "opacity-[0.15] text-blue-500"
          )}
        />
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* 1. Sticky Navbar */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-[#020817]/80 backdrop-blur-md border-white/5 py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              ResearchHub
            </span>
          </div>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How it Works</a>
            <Link href="/community" className="hover:text-blue-400 transition-colors">Community</Link>
            <Link href="/home" className="hover:text-blue-400 transition-colors">Search</Link>
          </nav>

          <div className="flex gap-4 items-center">
             <Link href="/home">
               <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5 hidden sm:flex">Log in</Button>
             </Link>
             <Link href="/home">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-full px-6">
                Sign up
              </Button>
             </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32">
        
        {/* 2. Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-7xl font-bold mb-8 leading-[1.1] tracking-tight">
                Research Papers <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Simplified.
                </span>
              </h1>

              <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">
                Stop drowning in tabs. Search 50+ academic platforms instantly, get AI-powered summaries, and join a thriving collaborative community.
              </p>

              <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-10 text-sm font-medium text-gray-300">
                 {["Universal Search", "AI Summaries", "Smart Filtering", "Citation Tracking"].map((item, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                     {item}
                   </div>
                 ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                {/* Primary */}
                <Link href="/home">
                  <Button className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 rounded-xl border border-blue-500/20 transition-all hover:scale-105 active:scale-95">
                    <Search className="w-4 h-4 mr-2" />
                    Start Search
                  </Button>
                </Link>

                {/* Secondary */}
                <Link href="/rat-mode">
                  <Button variant="outline" className="h-12 px-6 text-base border-gray-700 bg-white/5 text-gray-200 hover:bg-white/10 hover:border-gray-500 hover:text-white rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                    <Brain className="w-4 h-4 mr-2" />
                    RAT Exam
                  </Button>
                </Link>

                {/* Tertiary */}
                <Link href="/community">
                   <Button variant="outline" className="h-12 px-6 text-base border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 hover:text-white rounded-xl backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                     <Users className="w-4 h-4 mr-2" />
                     Join Community
                   </Button>
                </Link>
              </div>
            </motion.div>

            {/* RIGHT: Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-[80px] rounded-full" />
               <motion.div 
                 animate={{ y: [0, -15, 0] }}
                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                 className="relative bg-[#0A101F]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
               >
                 <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-4">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                       <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                       <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                    </div>
                    <div className="flex-1 h-8 bg-black/20 rounded-lg border border-white/5 flex items-center px-4 text-xs text-gray-500 font-mono">
                       research-hub.ai/search?q=machine+learning
                    </div>
                 </div>
                 <div className="p-8 space-y-6">
                    <div className="flex gap-3">
                       <div className="h-10 grow bg-white/5 rounded-lg border border-white/5" />
                       <div className="h-10 w-10 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20" />
                    </div>
                    <div className="flex gap-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="h-6 w-20 bg-blue-500/10 rounded-full border border-blue-500/20" />
                       ))}
                    </div>
                    {[1, 2].map(i => (
                      <div key={i} className={`p-5 rounded-xl border border-white/5 bg-white/${i===1 ? '5' : '0'} ${i===2 ? 'opacity-50' : ''}`}>
                         <div className="h-5 w-3/4 bg-white/10 rounded mb-3" />
                         <div className="h-3 w-1/2 bg-white/5 rounded mb-4" />
                         <div className="h-2 w-full bg-white/5 rounded mb-2" />
                         <div className="h-2 w-5/6 bg-white/5 rounded" />
                      </div>
                    ))}
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </section>


        {/* 3. Features Grid (High Impact) */}
        <section id="features" className="py-32 relative">
           {/* Section Background Elements */}
           <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]" />
           </div>

           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             {/* Header */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="mb-20"
             >
               <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                 Everything you need to <span className="text-blue-400">research faster</span>
               </h2>
               <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                 Detailed analysis, unified search, and smart organization — all in one place.
               </p>
               <div className="h-px w-full bg-gradient-to-r from-blue-500/30 to-transparent mt-10" />
             </motion.div>
             
             {/* Grid */}
             <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "-100px" }}
               variants={{
                 hidden: { opacity: 0 },
                 visible: {
                   opacity: 1,
                   transition: {
                     staggerChildren: 0.1
                   }
                 }
               }}
               className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
             >
                {[
                  { icon: Search, title: "Universal Search", desc: "Access IEEE, ArXiv, Springer and more with one unified query.", highlight: true },
                  { icon: Brain, title: "AI Analysis", desc: "Generate short, medium, or detailed summaries instantly with Gemini AI.", highlight: true },
                  { icon: Layers, title: "Smart Filtering", desc: "Refine by domain, publication year, or citation count." },
                  { icon: Bookmark, title: "Personal Library", desc: "Save papers, manage collections, and export citations." },
                  { icon: Zap, title: "RAT Exam", desc: "Rapid analysis mode for students to review key concepts quickly." },
                  { icon: TrendingUp, title: "Trend Tracking", desc: "Visualize research growth and emerging domains over time." }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        transition: { duration: 0.6, ease: "easeOut" }
                      }
                    }}
                  >
                    <FeatureCard {...feature} />
                  </motion.div>
                ))}
             </motion.div>
           </div>
        </section>

        {/* 4. How It Works (Timeline - Full Width High Impact) */}
        <section id="how-it-works" className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden py-32">
           {/* Background Elements */}
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-b from-[#02050e]/0 via-blue-900/5 to-[#02050e]/0" />
             <GridPattern
               width={60}
               height={60}
               x={-1}
               y={-1}
               className={cn(
                 "[mask-image:linear-gradient(to_bottom,transparent,white,transparent)]",
                 "opacity-[0.08] text-blue-500"
               )}
             />
             {/* Center Focus Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
           </div>

           <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
             <div className="text-center mb-32">
               <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400">
                 From chaos to <span className="text-blue-400">clarity</span>
               </h2>
               <p className="text-gray-400 text-xl md:text-2xl font-light">Your research lifecycle, streamlined.</p>
             </div>

             <div className="relative">
               {/* Timeline Line (Desktop) */}
               <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent hidden md:block shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

               <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                 {[
                   { 
                     id: "01", 
                     title: "Search", 
                     desc: "Enter keywords. We scan reputable sources instantly." 
                   },
                   { 
                     id: "02", 
                     title: "Analyze", 
                     desc: "Get concise AI summaries, cutting reading time by 90%." 
                   },
                   { 
                     id: "03", 
                     title: "Organize", 
                     desc: "Save papers, export citations, and build your library." 
                   }
                 ].map((step, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: "-100px" }}
                     transition={{ duration: 0.7, delay: i * 0.3 }}
                     className="relative pt-12 md:pt-16 px-4 flex flex-col items-center text-center group"
                   >
                     {/* Timeline Dot/Badge */}
                     <div className="absolute top-0 md:-top-6 left-1/2 -translate-x-1/2 md:translate-y-0 -translate-y-1/2 w-12 h-12 rounded-full bg-[#020817] border border-blue-500/50 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:border-blue-400 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-all duration-500">
                       <span className="text-blue-400 font-mono font-bold">{step.id}</span>
                     </div>
                     
                     {/* Glass Card */}
                     <div className="w-full p-8 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/5 group-hover:bg-white/[0.07] group-hover:border-blue-500/30 transition-all duration-500 group-hover:-translate-y-2 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{step.title}</h3>
                       <p className="text-gray-400 leading-relaxed text-lg relative z-10">{step.desc}</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </div>
           </div>
        </section>


        {/* 5. Final CTA Section (Simple & Clean) */}
        {/* 5. Final CTA Section (Condensed & Animated) */}
        <section className="py-24 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/10 pointer-events-none" />
           <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl mx-auto px-4 text-center relative z-10"
           >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                Start researching smarter today
              </h2>
              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students and researchers improving their workflow with AI.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <motion.div
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <Link href="/home">
                     <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                       Get Started
                     </Button>
                   </Link>
                 </motion.div>
                 <motion.div
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <Link href="/community">
                     <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-sm">
                       Join Community
                     </Button>
                   </Link>
                 </motion.div>
              </div>
           </motion.div>
        </section>

        {/* 6. Footer (Redesigned) */}
        <footer className="border-t border-white/5 bg-[#02050e] relative">
           <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20">
                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-xl text-white">ResearchHub</span>
                   </div>
                   <p className="text-base text-gray-500 mb-6">Accelerating academic discovery for everyone.</p>
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-blue-400 cursor-pointer transition-colors">
                        <Github className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-blue-400 cursor-pointer transition-colors">
                        <Twitter className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-blue-400 cursor-pointer transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </div>
                   </div>
                </div>

                {/* Product */}
                <div>
                  <h4 className="font-bold text-white mb-6">Product</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">
                      <Link href="/home">Search</Link>
                    </li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">AI Analysis</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">
                      <Link href="/rat-mode">RAT Exam</Link>
                    </li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Personal Library</li>
                  </ul>
                </div>

                {/* Community */}
                <div>
                  <h4 className="font-bold text-white mb-6">Community</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Research Opportunities</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">
                      <Link href="/community">Discussions</Link>
                    </li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Collaboration</li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="font-bold text-white mb-6">Legal</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms of Service</li>
                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Contact</li>
                  </ul>
                </div>
             </div>
             
             <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
                <p>© 2024 ResearchHub Inc. All rights reserved.</p>
             </div>
           </div>
        </footer>

      </main>
    </div>
  );
}

interface FeatureCardProps {
  icon: any;
  title: string;
  desc: string;
  highlight?: boolean;
}

function FeatureCard({ icon: Icon, title, desc, highlight }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10">
      
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 relative z-10 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1">
        <h3 className="text-lg font-bold mb-2 text-white">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed text-sm">
          {desc}
        </p>
      </div>

      {/* Bottom Link */}
      <div className="relative z-10 mt-auto flex items-center text-sm font-medium text-blue-500/0 group-hover:text-blue-400 transition-all duration-300 -translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
        Learn more <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
}
