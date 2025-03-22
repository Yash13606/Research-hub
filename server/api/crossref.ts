import { InsertPaper } from "@shared/schema";

/**
 * Lookup a paper by its DOI via CrossRef API
 */
export async function lookupDOI(doi: string): Promise<InsertPaper | null> {
  try {
    const baseUrl = "https://api.crossref.org/works/";
    // CrossRef recommends using a mailto parameter with your email to get better service
    const mailto = process.env.CONTACT_EMAIL ? `?mailto=${process.env.CONTACT_EMAIL}` : "";
    
    const url = `${baseUrl}${encodeURIComponent(doi)}${mailto}`;
    
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`DOI not found: ${doi}`);
        return null;
      }
      throw new Error(`CrossRef API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const work = data.message;
    
    if (!work) {
      return null;
    }
    
    // Extract authors
    const authors = (work.author || []).map((author: any) => {
      const given = author.given || "";
      const family = author.family || "";
      return `${given}${given && family ? " " : ""}${family}`.trim();
    }).filter(Boolean);
    
    // Extract publication date
    let publishedDate = new Date();
    if (work.published) {
      const date = work.published["date-parts"]?.[0];
      if (date && date.length > 0) {
        const [year, month = 1, day = 1] = date;
        publishedDate = new Date(year, month - 1, day);
      }
    }
    
    // Extract abstract
    let abstract = "";
    if (work.abstract) {
      // CrossRef abstracts can contain HTML, try to strip tags
      abstract = work.abstract.replace(/<\/?[^>]+(>|$)/g, "");
    }
    
    // Determine platform based on publisher
    const publisher = work.publisher || "";
    let platform = "Other";
    if (publisher.includes("Elsevier")) {
      platform = "ScienceDirect";
    } else if (publisher.includes("IEEE")) {
      platform = "IEEE Xplore";
    } else if (publisher.includes("Springer")) {
      platform = "Springer";
    } else if (publisher.includes("PubMed") || publisher.includes("NCBI")) {
      platform = "PubMed";
    } else if (publisher.includes("arXiv")) {
      platform = "ArXiv";
    }
    
    // Determine domain based on subject
    const subjects = work.subject || [];
    const domain = determineDomainFromSubjects(subjects);
    
    // Create the paper
    const paper: InsertPaper = {
      title: work.title?.[0] || "Untitled",
      authors,
      abstract,
      doi,
      url: work.URL || `https://doi.org/${doi}`,
      pdfUrl: work.link?.find((link: any) => link.content_type === "application/pdf")?.URL || "",
      platform,
      domain,
      journal: work["container-title"]?.[0] || work["journal-title"]?.[0] || "",
      publishedDate,
      pageCount: work.page ? calculatePageCount(work.page) : 0,
      viewCount: 0, // CrossRef doesn't provide view counts
      citation_count: work["is-referenced-by-count"] || 0,
    };
    
    return paper;
  } catch (error) {
    console.error("Error looking up DOI:", error);
    return null;
  }
}

/**
 * Helper function to determine domain from CrossRef subjects
 */
function determineDomainFromSubjects(subjects: string[]): string {
  // Define mappings from common subject terms to our domains
  const subjectToDomain: Record<string, string> = {
    // Computer Science related
    "computer science": "Computer Science",
    "artificial intelligence": "Artificial Intelligence",
    "machine learning": "Artificial Intelligence",
    "deep learning": "Artificial Intelligence",
    "neural networks": "Artificial Intelligence",
    "data science": "Computer Science",
    
    // Medicine related
    "medicine": "Medicine",
    "medical": "Medicine",
    "clinical": "Medicine",
    "healthcare": "Medicine",
    "nursing": "Medicine",
    "pharmacy": "Medicine",
    
    // Physics related
    "physics": "Physics",
    "quantum": "Physics",
    "astrophysics": "Physics",
    "mechanics": "Physics",
    
    // Chemistry related
    "chemistry": "Chemistry",
    "biochemistry": "Chemistry",
    "chemical": "Chemistry",
    "molecular": "Chemistry",
    
    // Biology related
    "biology": "Biology",
    "genetics": "Biology",
    "microbiology": "Biology",
    "ecology": "Biology",
    
    // Mathematics related
    "mathematics": "Mathematics",
    "statistics": "Mathematics",
    "algebra": "Mathematics",
    "geometry": "Mathematics",
    
    // Engineering related
    "engineering": "Engineering",
    "mechanical": "Engineering",
    "electrical": "Engineering",
    "civil engineering": "Engineering",
    
    // Psychology related
    "psychology": "Psychology",
    "cognitive": "Psychology",
    "behavioral": "Psychology",
    
    // Economics related
    "economics": "Economics",
    "finance": "Economics",
    "business": "Economics",
    
    // Social Sciences related
    "sociology": "Social Sciences",
    "anthropology": "Social Sciences",
    "political science": "Social Sciences",
    "social sciences": "Social Sciences",
    
    // Environmental Science related
    "environmental": "Environmental Science",
    "sustainability": "Environmental Science",
    "ecology": "Environmental Science",
    "climate": "Environmental Science",
    
    // Materials Science related
    "materials": "Materials Science",
    "metallurgy": "Materials Science",
    "polymer": "Materials Science",
    
    // Astronomy related
    "astronomy": "Astronomy",
    "astrophysics": "Astronomy",
    "cosmology": "Astronomy",
  };
  
  // Convert subjects to lowercase for matching
  const lowerSubjects = subjects.map(s => s.toLowerCase());
  
  // Check each subject against our mappings
  for (const subject of lowerSubjects) {
    for (const [keyword, domain] of Object.entries(subjectToDomain)) {
      if (subject.includes(keyword)) {
        return domain;
      }
    }
  }
  
  // Default to "Other" if no match found
  return "Other";
}

/**
 * Helper function to calculate page count from page range
 */
function calculatePageCount(pageRange: string): number {
  // Handle cases like "123-145" or "e123-e145"
  const match = pageRange.match(/(?:[eE])?(\d+)-(?:[eE])?(\d+)/);
  if (match && match.length >= 3) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    return Math.max(1, end - start + 1);
  }
  
  // Handle single page cases
  const singlePage = pageRange.match(/(?:[eE])?(\d+)/);
  if (singlePage) {
    return 1;
  }
  
  return 0;
}
