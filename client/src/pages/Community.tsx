import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  MessageSquare, 
  Briefcase, 
  Search, 
  Filter, 
  Plus,
  Building2,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Opportunity, Post, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Community() {
  const [activeTab, setActiveTab] = useState("opportunities");

  // Fetch opportunities
  const { data: opportunities, isLoading: loadingOpportunities, isError: errorOpportunities } = useQuery<Opportunity[]>({ 
    queryKey: ['/api/opportunities'] 
  });

  // Fetch posts
  const { data: posts, isLoading: loadingPosts, isError: errorPosts } = useQuery<Post[]>({ 
    queryKey: ['/api/community/posts'] 
  });

  // Mock researchers (since we don't have an endpoint yet)
  const researchers = [
    { id: 1, name: "Dr. Alan Grant", role: "Professor", field: "Paleontology", institution: "Montana State University" },
    { id: 2, name: "Dr. Ellie Sattler", role: "Researcher", field: "Paleobotany", institution: "InvGen" },
    { id: 3, name: "Ian Malcolm", role: "Mathematician", field: "Chaos Theory", institution: "Independent" },
    { id: 4, name: "Dr. Emily Chen", role: "Associate Professor", field: "Computer Science", institution: "MIT" },
    { id: 5, name: "Dr. Raj Patel", role: "Senior Researcher", field: "Renewable Energy", institution: "Caltech" },
    { id: 6, name: "Sarah Connor", role: "PhD Candidate", field: "Robotics", institution: "Carnegie Mellon" },
    { id: 7, name: "Dr. Otto Octavius", role: "Professor", field: "Nuclear Physics", institution: "Empire State U" },
    { id: 8, name: "Dr. Pamela Isley", role: "Botanist", field: "Eco-Toxicology", institution: "Gotham University" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-400" />
            Research Community
          </h1>
          <p className="text-gray-400 mt-2">Connect, collaborate, and contribute to cutting-edge research.</p>
        </div>
        <div className="flex gap-3">
           <Button className="bg-blue-600 hover:bg-blue-700">
             <Plus className="mr-2 h-4 w-4" /> Post Opportunity
           </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="opportunities" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-blue-950/40 border border-blue-900/30 p-1">
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-blue-600">
            <Briefcase className="mr-2 h-4 w-4" /> Opportunities
          </TabsTrigger>
          <TabsTrigger value="researchers" className="data-[state=active]:bg-blue-600">
            <GraduationCap className="mr-2 h-4 w-4" /> Researchers
          </TabsTrigger>
          <TabsTrigger value="discussions" className="data-[state=active]:bg-blue-600">
            <MessageSquare className="mr-2 h-4 w-4" /> Discussions
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
            <Users className="mr-2 h-4 w-4" /> My Profile
          </TabsTrigger>
        </TabsList>

        {/* OPPORTUNITIES TAB */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input placeholder="Search research positions..." className="pl-10 bg-blue-950/20 border-blue-900/30" />
            </div>
            <Button variant="outline" className="border-blue-900/30 text-blue-400">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>

          <div className="grid gap-4">
            {loadingOpportunities ? (
              <div className="text-gray-400">Loading opportunities...</div>
            ) : errorOpportunities ? (
              <div className="text-red-400 p-4 border border-red-500/30 rounded bg-red-500/10">
                Failed to load opportunities. Please check your connection.
              </div>
            ) : opportunities?.length === 0 ? (
               <div className="text-center py-10 text-gray-400 bg-blue-900/10 rounded-xl border border-blue-900/20">
                 No opportunities found at the moment.
               </div>
            ) : (
              opportunities?.map(op => (
                <Card key={op.id} className="bg-blue-950/20 border-blue-900/30 text-gray-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-white mb-2">{op.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <Building2 className="h-4 w-4" /> {op.institution} • {op.field}
                        </div>
                      </div>
                      <Badge variant={op.isRemote ? "secondary" : "outline"} className="bg-blue-900/30 text-blue-300 border-blue-800">
                        {op.isRemote ? "Remote" : "On-site"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">{op.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {op.requiredSkills?.map(skill => (
                        <Badge key={skill} variant="outline" className="border-blue-800 text-blue-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center border-t border-blue-900/30 pt-4">
                     <div className="flex items-center gap-4 text-sm text-gray-500">
                       {op.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {op.duration}</span>}
                       <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {op.institution}</span>
                     </div>
                     <Button size="sm">Apply Now</Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* RESEARCHERS TAB */}
        <TabsContent value="researchers">
           <div className="grid md:grid-cols-3 gap-6">
             {researchers.map(r => (
               <Card key={r.id} className="bg-blue-950/20 border-blue-900/30 text-center">
                 <CardContent className="pt-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
                      {r.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-white text-lg">{r.name}</h3>
                    <p className="text-blue-400 text-sm mb-1">{r.role}</p>
                    <p className="text-gray-400 text-sm mb-4">{r.institution}</p>
                    <Button variant="outline" size="sm" className="w-full border-blue-800 text-blue-300 hover:bg-blue-900/30">Connect</Button>
                 </CardContent>
               </Card>
             ))}
           </div>
        </TabsContent>

        {/* DISCUSSIONS TAB */}
        <TabsContent value="discussions">
           <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Trending Topics</h2>
              <Button size="sm" variant="secondary"><Plus className="mr-2 h-4 w-4" /> New Post</Button>
           </div>

           <div className="space-y-4">
              {loadingPosts ? (
                 <div className="text-gray-400">Loading discussions...</div>
              ) : errorPosts ? (
                 <div className="text-red-400 p-4 border border-red-500/30 rounded bg-red-500/10">
                   Failed to load discussions.
                 </div>
              ) : posts?.map(post => (
               <div key={post.id} className="p-6 rounded-xl bg-blue-950/20 border border-blue-900/30 hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-purple-900/30 text-purple-300 hover:bg-purple-900/40 border-0">{post.domain}</Badge>
                    <span className="text-xs text-gray-500">• Posted by User #{post.authorId}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                  <p className="text-gray-400 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1 hover:text-blue-400"><MessageSquare className="h-4 w-4" /> 12 Comments</div>
                    <div className="flex items-center gap-1 hover:text-red-400"><Sparkles className="h-4 w-4" /> {post.likes || 0} Likes</div>
                  </div>
               </div>
             ))}
           </div>
        </TabsContent>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
           <Card className="bg-blue-950/20 border-blue-900/30">
             <CardHeader>
               <CardTitle className="text-white">Your Research Profile</CardTitle>
               <CardDescription>Manage your academic identity and visibility.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Full Name</label>
                    <Input className="bg-blue-950/30 border-blue-900/50" defaultValue="User Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Current Role</label>
                    <select className="w-full h-10 rounded-md bg-blue-950/30 border border-blue-900/50 text-white px-3">
                      <option>Student</option>
                      <option>Professor</option>
                      <option>Researcher</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-sm text-gray-400">Bio & Interests</label>
                   <textarea className="w-full min-h-[100px] rounded-md bg-blue-950/30 border border-blue-900/50 text-white p-3" placeholder="Tell the community about your research interests..." />
                </div>
             </CardContent>
             <CardFooter>
               <Button>Save Profile</Button>
             </CardFooter>
           </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
