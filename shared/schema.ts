import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define domains/categories for research papers
export const DOMAINS = [
  "Artificial Intelligence",
  "Medicine",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Mathematics",
  "Engineering",
  "Economics",
  "Psychology",
  "Social Sciences",
  "Environmental Science",
  "Materials Science",
  "Astronomy",
  "Other"
] as const;

// Define platforms/sources for research papers
export const PLATFORMS = [
  "ArXiv",
  "IEEE Xplore",
  "Springer",
  "PubMed",
  "ScienceDirect",
  "Other"
] as const;

// Base user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Research papers table
export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").array().notNull(),
  abstract: text("abstract").notNull(),
  doi: text("doi"),
  url: text("url").notNull(),
  pdfUrl: text("pdf_url"),
  platform: text("platform").notNull(),
  domain: text("domain").notNull(),
  journal: text("journal"),
  publishedDate: timestamp("published_date").notNull(),
  pageCount: integer("page_count"),
  viewCount: integer("view_count").default(0),
  citation_count: integer("citation_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved papers table (relation between users and papers)
export const savedPapers = pgTable("saved_papers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  paperId: integer("paper_id").notNull().references(() => papers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Summaries table for each paper
export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id, { onDelete: "cascade" }),
  shortSummary: text("short_summary"),
  mediumSummary: text("medium_summary"),
  detailedSummary: text("detailed_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recent searches table
export const recentSearches = pgTable("recent_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  query: text("query").notNull(),
  filters: json("filters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertPaperSchema = createInsertSchema(papers).omit({
  id: true,
  createdAt: true,
});

export const insertSavedPaperSchema = createInsertSchema(savedPapers).pick({
  userId: true,
  paperId: true,
});

export const insertSummarySchema = createInsertSchema(summaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecentSearchSchema = createInsertSchema(recentSearches).omit({
  id: true,
  createdAt: true,
});

// Search and filter schema for paper queries
export const searchFilterSchema = z.object({
  query: z.string().optional(),
  platform: z.string().optional(),
  domain: z.string().optional(),
  author: z.string().optional(),
  journal: z.string().optional(),
  dateRange: z.enum(['24h', '7d', '1m', 'custom']).optional(),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
  sortBy: z.enum(['relevance', 'citations', 'date_desc', 'date_asc']).default('relevance'),
  page: z.number().default(1),
  limit: z.number().default(10),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Paper = typeof papers.$inferSelect;
export type InsertPaper = z.infer<typeof insertPaperSchema>;

export type SavedPaper = typeof savedPapers.$inferSelect;
export type InsertSavedPaper = z.infer<typeof insertSavedPaperSchema>;

export type Summary = typeof summaries.$inferSelect;
export type InsertSummary = z.infer<typeof insertSummarySchema>;

export type RecentSearch = typeof recentSearches.$inferSelect;
export type InsertRecentSearch = z.infer<typeof insertRecentSearchSchema>;

export type SearchFilter = z.infer<typeof searchFilterSchema>;
