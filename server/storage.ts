import { 
  users, type User, type InsertUser,
  papers, type Paper, type InsertPaper,
  savedPapers, type SavedPaper, type InsertSavedPaper,
  summaries, type Summary, type InsertSummary,
  recentSearches, type RecentSearch, type InsertRecentSearch,
  type SearchFilter, PLATFORMS, DOMAINS
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private papers: Map<number, Paper>;
  private savedPapers: Map<number, SavedPaper>;
  private summaries: Map<number, Summary>;
  private recentSearches: Map<number, RecentSearch>;
  
  private userId: number;
  private paperId: number;
  private savedPaperId: number;
  private summaryId: number;
  private searchId: number;
  
  constructor() {
    this.users = new Map();
    this.papers = new Map();
    this.savedPapers = new Map();
    this.summaries = new Map();
    this.recentSearches = new Map();
    
    this.userId = 1;
    this.paperId = 1;
    this.savedPaperId = 1;
    this.summaryId = 1;
    this.searchId = 1;
    
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
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
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
    const paper: Paper = { ...insertPaper, id, createdAt: now };
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
    const summary: Summary = { ...insertSummary, id, createdAt: now, updatedAt: now };
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
    const search: RecentSearch = { ...insertSearch, id, createdAt: now };
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
  }
}

export const storage = new MemStorage();
