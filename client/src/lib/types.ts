// Main application types

// Paper model
export interface Paper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  doi?: string;
  url: string;
  pdfUrl?: string;
  platform: string;
  domain: string;
  journal?: string;
  publishedDate: string | Date;
  pageCount?: number;
  viewCount: number;
  citation_count: number;
  createdAt: string | Date;
}

// Summary model
export interface Summary {
  id: number;
  paperId: number;
  shortSummary?: string;
  mediumSummary?: string;
  detailedSummary?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Search filters
export interface SearchFilter {
  query?: string;
  platform?: string;
  domain?: string;
  author?: string;
  journal?: string;
  dateRange?: string;
  customStartDate?: string;
  customEndDate?: string;
  sortBy?: 'relevance' | 'citations' | 'date_desc' | 'date_asc';
  page: number;
  limit: number;
}

// API response for papers
export interface PapersResponse {
  papers: Paper[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  source?: string;
  error?: string;
}

// Saved paper model
export interface SavedPaper {
  id: number;
  userId: number;
  paperId: number;
  createdAt: string | Date;
}

// Recent search model
export interface RecentSearch {
  id: number;
  userId: number;
  query: string;
  filters?: Record<string, any>;
  createdAt: string | Date;
}

// User model
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string | Date;
}
