import { 
  users, type User, type InsertUser,
  papers, type Paper, type InsertPaper,
  savedPapers, type SavedPaper, type InsertSavedPaper,
  summaries, type Summary, type InsertSummary,
  recentSearches, type RecentSearch, type InsertRecentSearch,
  opportunities, type Opportunity, type InsertOpportunity,
  applications, type Application, type InsertApplication,
  posts, type Post, type InsertPost,
  type SearchFilter, PLATFORMS, DOMAINS
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // Paper operations
  getPaper(id: number): Promise<Paper | undefined>;
  getPaperByDOI(doi: string): Promise<Paper | undefined>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  searchPapers(filter: SearchFilter): Promise<{papers: Paper[], total: number}>;
  
  // Saved paper operations
  getSavedPapers(userId: number): Promise<Paper[]>;
  savePaper(savedPaper: InsertSavedPaper): Promise<SavedPaper>;
  removeSavedPaper(userId: number, paperId: number): Promise<void>;
  isSavedPaper(userId: number, paperId: number): Promise<boolean>;
  
  // Summary operations
  getSummary(paperId: number): Promise<Summary | undefined>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  updateSummary(summary: Partial<InsertSummary> & {paperId: number}): Promise<Summary | undefined>;
  
  // Recent searches operations
  getRecentSearches(userId: number): Promise<RecentSearch[]>;
  saveRecentSearch(search: InsertRecentSearch): Promise<RecentSearch>;
  clearRecentSearches(userId: number): Promise<void>;
  
  // Community - Opportunities
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  getOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  
  // Community - Applications
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByOpportunity(opportunityId: number): Promise<Application[]>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  
  // Community - Posts
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private papers: Map<number, Paper>;
  private savedPapers: Map<number, SavedPaper>;
  private summaries: Map<number, Summary>;
  private recentSearches: Map<number, RecentSearch>;
  private opportunities: Map<number, Opportunity>;
  private applications: Map<number, Application>;
  private posts: Map<number, Post>;
  
  private userId: number;
  private paperId: number;
  private savedPaperId: number;
  private summaryId: number;
  private searchId: number;
  private opportunityId: number;
  private applicationId: number;
  private postId: number;
  
  constructor() {
    this.users = new Map();
    this.papers = new Map();
    this.savedPapers = new Map();
    this.summaries = new Map();
    this.recentSearches = new Map();
    this.opportunities = new Map();
    this.applications = new Map();
    this.posts = new Map();
    
    this.userId = 1;
    this.paperId = 1;
    this.savedPaperId = 1;
    this.summaryId = 1;
    this.searchId = 1;
    this.opportunityId = 1;
    this.applicationId = 1;
    this.postId = 1;
    
    // Add sample data for testing
    this.initializeData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    // Ensure profile is correctly handled if it's undefined in updates
    const updatedUser = { ...user, ...updates };
    // If profile is being updated, merge it (shallow merge) or replace it. 
    // Here we'll do a simple replacements as 'updates' has precedence.
    if (updates.profile && user.profile) {
       // @ts-ignore
       updatedUser.profile = { ...user.profile, ...updates.profile }; 
    }
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    // Default role and profile
    const user: User = { 
       ...insertUser, 
       id, 
       createdAt: now,
       role: "student",
       profile: {
         institution: "University",
         field: "General",
         bio: "",
         skills: [],
         papersRead: 0
       }
    };
    this.users.set(id, user);
    return user;
  }
  
  // Paper operations
  async getPaper(id: number): Promise<Paper | undefined> {
    return this.papers.get(id);
  }
  
  async getPaperByDOI(doi: string): Promise<Paper | undefined> {
    return Array.from(this.papers.values()).find(
      (paper) => paper.doi === doi,
    );
  }
  
  async createPaper(insertPaper: InsertPaper): Promise<Paper> {
    const id = this.paperId++;
    const now = new Date();
    // Handle null values explicitly for type safety
    const paper: Paper = { 
      ...insertPaper, 
      id, 
      createdAt: now,
      doi: insertPaper.doi || null,
      pdfUrl: insertPaper.pdfUrl || null,
      journal: insertPaper.journal || null,
      pageCount: insertPaper.pageCount || null,
      viewCount: insertPaper.viewCount || null,
      citation_count: insertPaper.citation_count || null
    };
    this.papers.set(id, paper);
    return paper;
  }
  
  async searchPapers(filter: SearchFilter): Promise<{papers: Paper[], total: number}> {
    let filteredPapers = Array.from(this.papers.values());
    
    // Apply filters
    if (filter.query) {
      const query = filter.query.toLowerCase();
      filteredPapers = filteredPapers.filter(paper => 
        paper.title.toLowerCase().includes(query) ||
        paper.abstract.toLowerCase().includes(query) ||
        paper.authors.some(author => author.toLowerCase().includes(query))
      );
    }
    
    if (filter.platform) {
      filteredPapers = filteredPapers.filter(paper => 
        paper.platform === filter.platform
      );
    }
    
    if (filter.domain) {
      // Case-insensitive search for domain to improve matching
      const domainQuery = filter.domain.toLowerCase();
      filteredPapers = filteredPapers.filter(paper => 
        paper.domain.toLowerCase() === domainQuery
      );
    }
    
    if (filter.author) {
      const authorQuery = filter.author.toLowerCase();
      filteredPapers = filteredPapers.filter(paper => 
        paper.authors.some(author => author.toLowerCase().includes(authorQuery))
      );
    }
    
    if (filter.journal) {
      const journalQuery = filter.journal.toLowerCase();
      filteredPapers = filteredPapers.filter(paper => 
        paper.journal && paper.journal.toLowerCase().includes(journalQuery)
      );
    }
    
    if (filter.dateRange) {
      const now = new Date();
      let startDate: Date | undefined;
      
      switch (filter.dateRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1m':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (filter.customStartDate) {
            startDate = new Date(filter.customStartDate);
            const endDate = filter.customEndDate ? new Date(filter.customEndDate) : now;
            filteredPapers = filteredPapers.filter(paper => 
              paper.publishedDate >= startDate! && paper.publishedDate <= endDate
            );
          }
          break;
      }
      
      if (filter.dateRange !== 'custom' && startDate) {
        filteredPapers = filteredPapers.filter(paper => paper.publishedDate >= startDate);
      }
    }
    
    // Apply sorting
    switch (filter.sortBy) {
      case 'citations':
        filteredPapers.sort((a, b) => {
          const aCitations = a.citation_count || 0;
          const bCitations = b.citation_count || 0;
          return bCitations - aCitations;
        });
        break;
      case 'date_desc':
        filteredPapers.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
        break;
      case 'date_asc':
        filteredPapers.sort((a, b) => a.publishedDate.getTime() - b.publishedDate.getTime());
        break;
      case 'relevance':
      default:
        // Relevance is the default, no additional sorting for now
        break;
    }
    
    const total = filteredPapers.length;
    
    // Apply pagination
    const start = (filter.page - 1) * filter.limit;
    const end = start + filter.limit;
    filteredPapers = filteredPapers.slice(start, end);
    
    return { papers: filteredPapers, total };
  }
  
  // Saved paper operations
  async getSavedPapers(userId: number): Promise<Paper[]> {
    const userSavedPapers = Array.from(this.savedPapers.values()).filter(
      (savedPaper) => savedPaper.userId === userId,
    );
    
    return userSavedPapers.map(savedPaper => 
      this.papers.get(savedPaper.paperId)!
    ).filter(Boolean);
  }
  
  async savePaper(insertSavedPaper: InsertSavedPaper): Promise<SavedPaper> {
    const id = this.savedPaperId++;
    const now = new Date();
    const savedPaper: SavedPaper = { ...insertSavedPaper, id, createdAt: now };
    this.savedPapers.set(id, savedPaper);
    return savedPaper;
  }
  
  async removeSavedPaper(userId: number, paperId: number): Promise<void> {
    const savedPaperToRemove = Array.from(this.savedPapers.values()).find(
      (savedPaper) => savedPaper.userId === userId && savedPaper.paperId === paperId,
    );
    
    if (savedPaperToRemove) {
      this.savedPapers.delete(savedPaperToRemove.id);
    }
  }
  
  async isSavedPaper(userId: number, paperId: number): Promise<boolean> {
    return Array.from(this.savedPapers.values()).some(
      (savedPaper) => savedPaper.userId === userId && savedPaper.paperId === paperId,
    );
  }
  
  // Summary operations
  async getSummary(paperId: number): Promise<Summary | undefined> {
    return Array.from(this.summaries.values()).find(
      (summary) => summary.paperId === paperId,
    );
  }
  
  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = this.summaryId++;
    const now = new Date();
    // Handle null values explicitly for type safety
    const summary: Summary = { 
      ...insertSummary, 
      id, 
      createdAt: now, 
      updatedAt: now,
      shortSummary: insertSummary.shortSummary || null,
      mediumSummary: insertSummary.mediumSummary || null,
      detailedSummary: insertSummary.detailedSummary || null
    };
    this.summaries.set(id, summary);
    return summary;
  }
  
  async updateSummary(summary: Partial<InsertSummary> & {paperId: number}): Promise<Summary | undefined> {
    const existingSummary = await this.getSummary(summary.paperId);
    
    if (!existingSummary) {
      return undefined;
    }
    
    const now = new Date();
    const updatedSummary: Summary = {
      ...existingSummary,
      ...summary,
      updatedAt: now,
    };
    
    this.summaries.set(existingSummary.id, updatedSummary);
    return updatedSummary;
  }
  
  // Recent searches operations
  async getRecentSearches(userId: number): Promise<RecentSearch[]> {
    return Array.from(this.recentSearches.values())
      .filter((search) => search.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async saveRecentSearch(insertSearch: InsertRecentSearch): Promise<RecentSearch> {
    const id = this.searchId++;
    const now = new Date();
    // Handle null values explicitly for type safety
    const search: RecentSearch = { 
      ...insertSearch, 
      id, 
      createdAt: now,
      // Ensure filters is always defined (even if empty)
      filters: insertSearch.filters || {}
    };
    this.recentSearches.set(id, search);
    return search;
  }
  
  async clearRecentSearches(userId: number): Promise<void> {
    const userSearches = Array.from(this.recentSearches.values()).filter(
      (search) => search.userId === userId,
    );
    
    for (const search of userSearches) {
      this.recentSearches.delete(search.id);
    }
  }

  // --- COMMUNITY METHODS ---

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.opportunityId++;
    const now = new Date();
    const opportunity: Opportunity = {
      ...insertOpportunity,
      id,
      createdAt: now,
      // Default nullables
      duration: insertOpportunity.duration || null,
      isRemote: insertOpportunity.isRemote || false,
      requiredSkills: insertOpportunity.requiredSkills || []
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async getOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
     const id = this.applicationId++;
     const now = new Date();
     const app: Application = {
       ...insertApplication,
       id,
       createdAt: now,
       status: "pending",
       message: insertApplication.message || null
     };
     this.applications.set(id, app);
     return app;
  }

  async getApplicationsByOpportunity(opportunityId: number): Promise<Application[]> {
     return Array.from(this.applications.values())
       .filter(a => a.opportunityId === opportunityId)
       .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
     return Array.from(this.applications.values())
       .filter(a => a.studentId === userId)
       .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postId++;
    const now = new Date();
    const post: Post = {
      ...insertPost,
      id,
      createdAt: now,
      likes: 0,
      tags: insertPost.tags || []
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Initialize sample data for testing
  private initializeData() {
    // Create a test user
    const user: InsertUser = {
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
    };
    this.createUser(user);
    
    // Create sample papers with varying data
    const domains = [...DOMAINS];
    const platforms = [...PLATFORMS];
    
    const createSamplePaper = (index: number): InsertPaper => {
      const platform = platforms[index % platforms.length];
      const domain = domains[index % domains.length];
      const publishedDate = new Date();
      publishedDate.setDate(publishedDate.getDate() - (index * 7)); // Different dates

      const paper: InsertPaper = {
        title: `Sample Research Paper ${index + 1} on ${domain}`,
        authors: [`Author ${index + 1}`, `Co-author ${index + 1}`],
        abstract: `This is a sample abstract for research paper ${index + 1} in the field of ${domain}.`,
        doi: `10.1234/sample-${randomUUID().slice(0, 8)}`,
        url: `https://example.com/papers/${index + 1}`,
        pdfUrl: `https://example.com/papers/${index + 1}/pdf`,
        platform,
        domain,
        journal: `Journal of ${domain} Studies`,
        publishedDate,
        pageCount: 10 + index,
        viewCount: 100 * (index + 1),
        citation_count: 10 * (index + 1),
      };

      return paper;
    };
    
    // Create 30 sample papers
    for (let i = 0; i < 30; i++) {
      const paper = createSamplePaper(i);
      this.createPaper(paper);
    }
    
    // We're not pre-saving papers anymore to allow users to save papers themselves
    // Previously, papers 1-5 were pre-saved, causing "Paper already saved" errors
    
    // Create summaries for some papers
    for (let i = 1; i <= 10; i++) {
      this.createSummary({
        paperId: i,
        shortSummary: `Short summary for paper ${i} with bullet points.`,
        mediumSummary: `Medium length summary for paper ${i} with more detailed information.`,
        detailedSummary: `Detailed summary for paper ${i} with comprehensive analysis of the research.`,
      });
    }
    
    // Create some recent searches
    const searchQueries = [
      'machine learning',
      'quantum computing',
      'climate change',
      'neural networks',
      'vaccine research'
    ];
    
    for (let i = 0; i < searchQueries.length; i++) {
      this.saveRecentSearch({
        userId: 1,
        query: searchQueries[i],
        filters: {
          domain: domains[i % domains.length],
          platform: platforms[i % platforms.length],
        },
      });
    }

    // --- SAMPLE COMMUNITY DATA ---
    
    // Opportunities
    const opportunitiesData = [
      {
        professorId: 1,
        title: "AI Research Assistant",
        description: "Looking for a student to help with LLM fine-tuning and evaluation on medical datasets.",
        institution: "Tech University",
        field: "Artificial Intelligence",
        requiredSkills: ["Python", "PyTorch", "NLP", "HuggingFace"],
        duration: "3 months",
        isRemote: true
      },
      {
        professorId: 2,
        title: "Quantum Algorithms Intern",
        description: "Join our lab to simulate quantum error correction codes. Strong math background required.",
        institution: "Institute of Adv Study",
        field: "Physics",
        requiredSkills: ["Linear Algebra", "Qiskit", "Python"],
        duration: "6 months",
        isRemote: false
      },
      {
        professorId: 3,
        title: "Bioinformatics Analyst",
        description: "Analyzing single-cell RNA sequencing data to identify cancer markers.",
        institution: "Medical Center",
        field: "Biology",
        requiredSkills: ["R", "Bioconductor", "Statistics"],
        duration: "Summer 2024",
        isRemote: true
      },
      {
        professorId: 4,
        title: "Robotics Control Systems",
        description: "Developing robust control algorithms for quadruped robots in unstructured environments.",
        institution: "RoboTech Institute",
        field: "Robotics",
        requiredSkills: ["C++", "ROS", "Control Theory"],
        duration: "1 year",
        isRemote: false
      },
       {
        professorId: 5,
        title: "Sustainable Energy Materials",
        description: "Synthesis and characterization of new perovskite materials for solar cells.",
        institution: "Green Energy Lab",
        field: "Materials Science",
        requiredSkills: ["Lab Experience", "Chemistry", "Data Analysis"],
        duration: "4 months",
        isRemote: false
      },
      {
        professorId: 6,
        title: "Data Science Intern",
        description: "Analyzing large-scale urban mobility datasets to optimize public transport routes.",
        institution: "City Planning Dept",
        field: "Data Science",
        requiredSkills: ["SQL", "Python", "GIS"],
        duration: "3 months",
        isRemote: true
      },
      {
        professorId: 7,
        title: "Neural Interface Research",
        description: "Signal processing for non-invasive BCI devices. Experience with EEG data preferred.",
        institution: "NeuroTech Corp",
        field: "Neuroscience",
        requiredSkills: ["Signal Processing", "Matlab/Python", "Neuroscience"],
        duration: "6 months",
        isRemote: false
      },
      {
        professorId: 8,
        title: "Climate Modeling Assistant",
        description: "Running and validating atmospheric models on HPC clusters.",
        institution: "Climate Institute",
        field: "Earth Science",
        requiredSkills: ["Fortran", "Linux", "HPC"],
        duration: "1 year",
        isRemote: true
      },
      {
        professorId: 9,
        title: "Historical Archiving",
        description: "Digitizing and classifying colonial-era manuscripts using OCR and manual review.",
        institution: "National Archives",
        field: "History",
        requiredSkills: ["History", "Archival Science", "Attention to Detail"],
        duration: "Summer 2024",
        isRemote: false
      },
      {
        professorId: 10,
        title: "Psychology Study Coordinator",
        description: "Managing participant recruitment and data collection for a large-scale behavioral study.",
        institution: "Psych Dept",
        field: "Psychology",
        requiredSkills: ["Organization", "Communication", "Ethics"],
        duration: "1 year",
        isRemote: true
      }
    ];

    opportunitiesData.forEach(op => this.createOpportunity(op));

    // Community Posts
    const postsData = [
      {
        authorId: 1,
        domain: "Artificial Intelligence",
        title: "Future of Agents?",
        content: "What do you think about the latest agentic frameworks like AutoGen and LangGraph? Are they ready for production?",
        tags: ["AI", "Agents", "Production"],
        likes: 42
      },
      {
        authorId: 2,
        domain: "Computer Science",
        title: "Best resources for Distributed Systems?",
        content: "I'm looking for advanced resources (books/papers/courses) on designing large-scale distributed systems. DDIA is great, but what next?",
        tags: ["System Design", "Learning"],
        likes: 15
      },
      {
        authorId: 3,
        domain: "Mathematics",
        title: "Understanding Geometric Unity",
        content: "Can someone explain the intuition behind E8 lie groups in simple terms? I'm struggling with the visualization.",
        tags: ["Geometry", "Physics"],
        likes: 8
      },
      {
        authorId: 4,
        domain: "Biology",
        title: "CRISPR vs Prime Editing",
        content: "Has anyone here worked with Prime Editing in mammalian cells? How does the efficiency compare to standard CRISPR-Cas9 in your experience?",
        tags: ["Biotech", "Lab Work"],
        likes: 27
      },
      {
        authorId: 5,
        domain: "Artificial Intelligence",
        title: "Paper Club: Attention is All You Need",
        content: "We are hosting a reading group this Friday to revisit the Transformer paper. Beginners welcome! Join the voice channel.",
        tags: ["Reading Group", "Deep Learning"],
        likes: 56
      },
      {
        authorId: 6,
        domain: "Computer Science",
        title: "Help with LaTeX logic proof",
        content: "I'm trying to typeset a sequent calculus proof tree but the alignment is broken. Is bussproofs still the standard package?",
        tags: ["LaTeX", "Help"],
        likes: 3
      },
      {
        authorId: 7,
        domain: "Academic Advice",
        title: "Conference recommendations for junior grads?",
        content: "What are some good tier-2 conferences in computer vision that give good feedback? NeurIPS/CVPR feel too crowded.",
        tags: ["Career", "Advice"],
        likes: 19
      },
      {
        authorId: 8,
        domain: "Physics",
        title: "Grant writing tips for NSF",
        content: "Anyone willing to share a successful proposal format for the GRFP? I'm struggling with the broader impacts section.",
        tags: ["Grants", "Funding"],
        likes: 12
      },
      {
        authorId: 9,
        domain: "Data Science",
        title: "Python vs Julia for Simulation",
        content: "I'm starting a heavy simulation project. Julia promises speed, but Python has the ecosystem. Is the switch worth it?",
        tags: ["Programming", "Debate"],
        likes: 34
      }
    ];

    postsData.forEach(post => {
      // We manually create/set them to include likes for the mock data
      const id = this.postId++;
      const now = new Date();
      const newPost: Post = {
        ...post,
        id,
        createdAt: now,
        tags: post.tags || []
      };
      this.posts.set(id, newPost);
    });
  }
}

export const storage = new MemStorage();
