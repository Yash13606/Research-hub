import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchFilterSchema, insertSavedPaperSchema, insertOpportunitySchema, insertPostSchema } from "@shared/schema";

import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { fetchArxivPapers } from "./api/arxiv";
import { fetchIeeePapers } from "./api/ieee";
import { fetchSpringerPapers } from "./api/springer";
import { fetchPubmedPapers } from "./api/pubmed";
import { fetchScienceDirectPapers } from "./api/sciencedirect";
import { lookupDOI } from "./api/crossref";
import { generateSummary } from "./api/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleValidationError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const readableError = fromZodError(err);
      return res.status(400).json({ message: readableError.message });
    }
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Internal server error" });
  };

  // API route to search papers
  app.get("/api/papers", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string | undefined;
      const platform = req.query.platform as string | undefined;
      const domain = req.query.domain as string | undefined;
      const author = req.query.author as string | undefined;
      const journal = req.query.journal as string | undefined;
      const dateRange = req.query.dateRange as string | undefined;
      const customStartDate = req.query.customStartDate as string | undefined;
      const customEndDate = req.query.customEndDate as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const filter = searchFilterSchema.parse({
        query,
        platform,
        domain,
        author,
        journal,
        dateRange,
        customStartDate,
        customEndDate,
        sortBy,
        page,
        limit
      });

      // First, try to get papers from our database
      const { papers, total } = await storage.searchPapers(filter);

      // If we have enough papers, return them
      if (papers.length >= filter.limit) {
        return res.json({
          papers,
          total,
          page: filter.page,
          limit: filter.limit,
          pages: Math.ceil(total / filter.limit),
          source: "database"
        });
      }

      // If we don't have enough papers, fetch from external APIs
      let externalPapers = [];
      const requestPromises = [];

      // Only fetch from the specified platform, or all platforms if none specified
      if (!filter.platform || filter.platform === "ArXiv") {
        requestPromises.push(fetchArxivPapers(filter));
      }
      if (!filter.platform || filter.platform === "IEEE Xplore") {
        requestPromises.push(fetchIeeePapers(filter));
      }
      if (!filter.platform || filter.platform === "Springer") {
        requestPromises.push(fetchSpringerPapers(filter));
      }
      if (!filter.platform || filter.platform === "PubMed") {
        requestPromises.push(fetchPubmedPapers(filter));
      }
      if (!filter.platform || filter.platform === "ScienceDirect") {
        requestPromises.push(fetchScienceDirectPapers(filter));
      }

      try {
        const results = await Promise.allSettled(requestPromises);
        const successfulResults = results
          .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
          .map(result => result.value)
          .flat();

        externalPapers = successfulResults;

        // Store the newly fetched papers in our database
        for (const paper of externalPapers) {
          // Check if the paper already exists in our database
          if (paper.doi) {
            const existingPaper = await storage.getPaperByDOI(paper.doi);
            if (!existingPaper) {
              await storage.createPaper(paper);
            }
          } else {
            await storage.createPaper(paper);
          }
        }

        // Re-run the search to include the new papers
        const updatedResults = await storage.searchPapers(filter);

        return res.json({
          papers: updatedResults.papers,
          total: updatedResults.total,
          page: filter.page,
          limit: filter.limit,
          pages: Math.ceil(updatedResults.total / filter.limit),
          source: "mixed"
        });
      } catch (error) {
        console.error("Error fetching external papers:", error);
        // Return the original papers from database if external fetching fails
        return res.json({
          papers,
          total,
          page: filter.page,
          limit: filter.limit,
          pages: Math.ceil(total / filter.limit),
          source: "database",
          error: "Failed to fetch additional papers from external sources"
        });
      }
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to get a specific paper
  app.get("/api/papers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const paper = await storage.getPaper(id);

      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      return res.json(paper);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to get a paper by DOI
  app.get("/api/papers/doi/:doi", async (req: Request, res: Response) => {
    try {
      const doi = req.params.doi;
      let paper = await storage.getPaperByDOI(doi);

      if (!paper) {
        // Try to fetch the paper from CrossRef
        try {
          const crossRefPaper = await lookupDOI(doi);
          if (crossRefPaper) {
            paper = await storage.createPaper(crossRefPaper);
          }
        } catch (error) {
          console.error("Error fetching paper from CrossRef:", error);
        }
      }

      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      return res.json(paper);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to get summary for a paper
  app.get("/api/papers/:id/summary", async (req: Request, res: Response) => {
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getPaper(paperId);

      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      let summary = await storage.getSummary(paperId);

      if (!summary) {
        // If no summary exists, generate one
        try {
          // Generate summaries using Gemini API
          const generatedSummary = await generateSummary(paper);
          summary = await storage.createSummary({
            paperId,
            ...generatedSummary
          });
        } catch (error) {
          console.error("Error generating summary:", error);
          return res.status(500).json({ message: "Failed to generate summary" });
        }
      }

      return res.json(summary);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to regenerate summary for a paper
  app.post("/api/papers/:id/regenerate-summary", async (req: Request, res: Response) => {
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getPaper(paperId);

      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      // Generate new summaries using Gemini API
      try {
        const generatedSummary = await generateSummary(paper);
        const summary = await storage.updateSummary({
          paperId,
          ...generatedSummary
        });

        if (!summary) {
          // If update failed, create a new summary
          const newSummary = await storage.createSummary({
            paperId,
            ...generatedSummary
          });
          return res.json(newSummary);
        }

        return res.json(summary);
      } catch (error) {
        console.error("Error regenerating summary:", error);
        return res.status(500).json({ message: "Failed to regenerate summary" });
      }
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to get saved papers for a user
  app.get("/api/users/:userId/saved-papers", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const savedPapers = await storage.getSavedPapers(userId);
      return res.json(savedPapers);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to save a paper for a user
  app.post("/api/users/:userId/saved-papers", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { paperId } = insertSavedPaperSchema.parse({
        ...req.body,
        userId
      });

      const paper = await storage.getPaper(paperId);
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      // Check if already saved
      const isSaved = await storage.isSavedPaper(userId, paperId);
      if (isSaved) {
        return res.status(400).json({ message: "Paper already saved" });
      }

      const savedPaper = await storage.savePaper({ userId, paperId });
      return res.status(201).json(savedPaper);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to remove a saved paper
  app.delete("/api/users/:userId/saved-papers/:paperId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const paperId = parseInt(req.params.paperId);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const paper = await storage.getPaper(paperId);
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      await storage.removeSavedPaper(userId, paperId);
      return res.status(204).send();
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to check if a paper is saved by a user
  app.get("/api/users/:userId/saved-papers/:paperId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const paperId = parseInt(req.params.paperId);

      const isSaved = await storage.isSavedPaper(userId, paperId);
      return res.json({ isSaved });
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to get recent searches for a user
  app.get("/api/users/:userId/recent-searches", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const recentSearches = await storage.getRecentSearches(userId);
      return res.json(recentSearches);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to save a recent search
  app.post("/api/users/:userId/recent-searches", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { query, filters } = req.body;
      const search = await storage.saveRecentSearch({
        userId,
        query,
        filters
      });

      return res.status(201).json(search);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // API route to clear recent searches
  app.delete("/api/users/:userId/recent-searches", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.clearRecentSearches(userId);
      return res.status(204).send();
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // --- COMMUNITY ROUTES ---

  // Get all opportunities
  app.get("/api/opportunities", async (_req: Request, res: Response) => {
    try {
      const opportunities = await storage.getOpportunities();
      return res.json(opportunities);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // Create an opportunity
  app.post("/api/opportunities", async (req: Request, res: Response) => {
    try {
      const opportunity = await storage.createOpportunity(insertOpportunitySchema.parse(req.body));
      return res.status(201).json(opportunity);
    } catch (err) {
      return handleValidationError(err, res);
    }
  });

  // Get specific opportunity
  app.get("/api/opportunities/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const opportunity = await storage.getOpportunity(id);
        if(!opportunity) return res.status(404).json({ message: "Opportunity not found" });
        return res.json(opportunity);
    } catch (err) {
        return handleValidationError(err, res);
    }
  });

  // Apply to an opportunity
  app.post("/api/opportunities/:id/apply", async (req: Request, res: Response) => {
    try {
        const opportunityId = parseInt(req.params.id);
        const { studentId, message } = req.body;
        
        // Basic validation (in a real app, middleware handles auth)
        if (!studentId) return res.status(400).json({ message: "Student ID required" });

        const application = await storage.createApplication({
            opportunityId,
            studentId,
            message: message || "I am interested in this opportunity."
        });
        return res.status(201).json(application);
    } catch (err) {
        return handleValidationError(err, res);
    }
  });

  // Get applications for a specific opportunity (Professor view)
  app.get("/api/opportunities/:id/applications", async (req: Request, res: Response) => {
      try {
          const id = parseInt(req.params.id);
          const applications = await storage.getApplicationsByOpportunity(id);
          return res.json(applications);
      } catch (err) {
          return handleValidationError(err, res);
      }
  });

  // Get applications for a user (Student view)
  app.get("/api/users/:userId/applications", async (req: Request, res: Response) => {
      try {
          const userId = parseInt(req.params.userId);
          const applications = await storage.getApplicationsByUser(userId);
          return res.json(applications);
      } catch (err) {
          return handleValidationError(err, res);
      }
  });

  // Community Posts
  app.get("/api/community/posts", async (_req: Request, res: Response) => {
      try {
          const posts = await storage.getPosts();
          return res.json(posts);
      } catch (err) {
          return handleValidationError(err, res);
      }
  });

  app.post("/api/community/posts", async (req: Request, res: Response) => {
      try {
          const post = await storage.createPost(insertPostSchema.parse(req.body));
          return res.status(201).json(post);
      } catch (err) {
          return handleValidationError(err, res);
      }
  });

  // Update User Profile
  app.patch("/api/users/:id/profile", async (req: Request, res: Response) => {
      try {
          const id = parseInt(req.params.id);
          const updates = req.body; // Expects { role?, profile? }
          const updatedUser = await storage.updateUser(id, updates);
          return res.json(updatedUser);
      } catch (err) {
          return handleValidationError(err, res);
      }
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
