import { InsertPaper, type SearchFilter } from "@shared/schema";

/**
 * Fetch papers from ArXiv API based on search parameters
 */
export async function fetchArxivPapers(filter: SearchFilter): Promise<InsertPaper[]> {
  try {
    // ArXiv API URL
    let baseUrl = "http://export.arxiv.org/api/query?";
    
    // Build query parameters
    const params = new URLSearchParams();
    
    // Handle search query term
    if (filter.query) {
      params.append("search_query", `all:${filter.query}`);
    }
    
    // Handle domain/category mapping (convert our domains to ArXiv categories)
    if (filter.domain) {
      // Map our domain names to ArXiv categories
      const domainToCategory: Record<string, string> = {
        "Artificial Intelligence": "cs.AI",
        "Computer Science": "cs",
        "Physics": "physics",
        "Mathematics": "math",
        "Biology": "q-bio",
        "Engineering": "cs.SE OR eess",
        "Economics": "econ",
        "Medicine": "q-bio.TO",
        "Psychology": "q-bio.NC",
        "Chemistry": "chem-ph",
        "Social Sciences": "econ OR q-bio.PE",
        "Environmental Science": "physics.ao-ph",
        "Materials Science": "cond-mat.mtrl-sci",
        "Astronomy": "astro-ph",
      };
      
      const category = domainToCategory[filter.domain];
      if (category) {
        if (filter.query) {
          params.append("cat", category);
        } else {
          // Otherwise use the category as the main search query
          params.append("search_query", `cat:${category}`);
        }
      }
    }
    
    // Handle paper sorting
    let sortBy = "relevance";
    switch (filter.sortBy) {
      case "date_desc":
        sortBy = "submittedDate";
        break;
      case "date_asc":
        sortBy = "submittedDate";
        params.append("sortOrder", "ascending");
        break;
      case "citations":
      case "relevance":
      default:
        sortBy = "relevance";
    }
    params.append("sortBy", sortBy);
    
    // Handle pagination
    const start = (filter.page - 1) * filter.limit;
    params.append("start", start.toString());
    params.append("max_results", filter.limit.toString());
    
    // Construct the final URL
    const url = baseUrl + params.toString();
    
    // Make the request
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ArXiv API request failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse XML response
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Extract entries
    const entries = Array.from(xmlDoc.getElementsByTagName("entry"));
    
    // Map entries to our paper format
    const papers: InsertPaper[] = entries.map(entry => {
      // Extract authors
      const authorNodes = entry.getElementsByTagName("author");
      const authors = Array.from(authorNodes).map(author => {
        const nameNode = author.getElementsByTagName("name")[0];
        return nameNode ? nameNode.textContent || "" : "";
      }).filter(Boolean);
      
      // Extract publication date and format it
      const published = entry.getElementsByTagName("published")[0]?.textContent || "";
      const publishedDate = published ? new Date(published) : new Date();
      
      // Extract DOI if present
      let doi = "";
      const links = Array.from(entry.getElementsByTagName("link"));
      for (const link of links) {
        const rel = link.getAttribute("rel");
        const href = link.getAttribute("href") || "";
        if (rel === "related" && href.includes("doi.org")) {
          doi = href.replace("http://dx.doi.org/", "").replace("https://doi.org/", "");
          break;
        }
      }
      
      // Extract PDF URL
      let pdfUrl = "";
      for (const link of links) {
        const title = link.getAttribute("title");
        const href = link.getAttribute("href") || "";
        if (title === "pdf") {
          pdfUrl = href;
          break;
        }
      }
      
      // Map to our paper schema
      return {
        title: entry.getElementsByTagName("title")[0]?.textContent?.trim() || "Untitled",
        authors,
        abstract: entry.getElementsByTagName("summary")[0]?.textContent?.trim() || "",
        doi,
        url: entry.getElementsByTagName("id")[0]?.textContent || "",
        pdfUrl,
        platform: "ArXiv",
        domain: mapArxivCategoryToDomain(entry.getElementsByTagName("category")[0]?.getAttribute("term") || ""),
        journal: "ArXiv",
        publishedDate,
        pageCount: 0, // ArXiv doesn't provide page count info
        viewCount: 0, // ArXiv doesn't provide view count info
        citation_count: 0, // ArXiv doesn't provide citation count
      };
    });
    
    return papers;
  } catch (error) {
    console.error("Error fetching ArXiv papers:", error);
    return [];
  }
}

/**
 * Helper function to map ArXiv categories to our domain names
 */
function mapArxivCategoryToDomain(category: string): string {
  // Map ArXiv category prefixes to our domain names
  const categoryToDomain: Record<string, string> = {
    "cs.AI": "Artificial Intelligence",
    "cs.CL": "Artificial Intelligence",
    "cs.CV": "Artificial Intelligence",
    "cs.LG": "Artificial Intelligence",
    "cs.NE": "Artificial Intelligence",
    "cs": "Computer Science",
    "physics": "Physics",
    "math": "Mathematics",
    "q-bio": "Biology",
    "stat": "Mathematics",
    "econ": "Economics",
    "astro-ph": "Astronomy",
    "cond-mat": "Physics",
    "eess": "Engineering",
    "quant-ph": "Physics",
  };
  
  // Check for direct matches
  if (categoryToDomain[category]) {
    return categoryToDomain[category];
  }
  
  // Check for prefix matches
  for (const prefix in categoryToDomain) {
    if (category.startsWith(prefix)) {
      return categoryToDomain[prefix];
    }
  }
  
  // Default to "Other" if no match found
  return "Other";
}
