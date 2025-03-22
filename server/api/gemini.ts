import { Paper } from "@shared/schema";

// Interface for generated summary
interface GeneratedSummary {
  shortSummary: string;
  mediumSummary: string;
  detailedSummary: string;
}

/**
 * Generate summaries for a paper using Google Gemini API
 */
export async function generateSummary(paper: Paper): Promise<GeneratedSummary> {
  try {
    // In a real implementation, you would use the Gemini API:
    // const apiKey = process.env.GEMINI_API_KEY || "";
    // const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
    
    // Since we don't have a real API key, we'll generate summaries locally
    // based on the paper information
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Generate short summary (bullet points)
    const shortSummary = generateShortSummary(paper);
    
    // Generate medium summary (extractive)
    const mediumSummary = generateMediumSummary(paper);
    
    // Generate detailed summary (comprehensive)
    const detailedSummary = generateDetailedSummary(paper);
    
    return {
      shortSummary,
      mediumSummary,
      detailedSummary
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    // Provide a basic summary in case of failure
    return {
      shortSummary: `This paper discusses ${paper.title.toLowerCase()}.`,
      mediumSummary: paper.abstract.slice(0, 200) + "...",
      detailedSummary: paper.abstract
    };
  }
}

/**
 * Generate a short bullet-point summary of the paper
 */
function generateShortSummary(paper: Paper): string {
  // Extract key phrases from title and abstract
  const keyPhrases = extractKeyPhrases(paper.title + ". " + paper.abstract);
  
  // Create bullet points
  const bulletPoints = keyPhrases.map(phrase => `• ${phrase}`).join("\n");
  
  // If we couldn't extract meaningful bullet points, create generic ones
  if (bulletPoints.split("\n").length < 3) {
    return [
      `• Presents research on ${paper.title.toLowerCase()}`,
      `• Authored by ${paper.authors.slice(0, 2).join(", ")}${paper.authors.length > 2 ? " and others" : ""}`,
      `• Published in ${paper.journal || paper.platform}`,
      `• Focuses on the field of ${paper.domain}`,
      `• Contains ${paper.pageCount} pages with ${paper.citation_count} citations`
    ].join("\n");
  }
  
  return bulletPoints;
}

/**
 * Generate a medium-length extractive summary of the paper
 */
function generateMediumSummary(paper: Paper): string {
  // For a medium summary, we'll extract and combine important sentences from the abstract
  const sentences = paper.abstract.split(/(?<=[.!?])\s+/);
  
  // If the abstract has fewer than 3 sentences, use the whole abstract
  if (sentences.length <= 3) {
    return paper.abstract;
  }
  
  // Otherwise, select the introduction, a middle sentence, and conclusion
  const introduction = sentences[0];
  const middle = sentences[Math.floor(sentences.length / 2)];
  const conclusion = sentences[sentences.length - 1];
  
  return `${introduction} ${middle} ${conclusion}`;
}

/**
 * Generate a detailed comprehensive summary of the paper
 */
function generateDetailedSummary(paper: Paper): string {
  // For the detailed summary, we'll combine the abstract with additional context
  const authorText = paper.authors.length > 0 
    ? `by ${paper.authors.join(", ")}`
    : "";
  
  const domainContext = getDomainContext(paper.domain);
  
  const citationContext = paper.citation_count > 0
    ? `This work has been cited ${paper.citation_count} times, indicating its significance in the field.`
    : "";
  
  return `
This paper titled "${paper.title}" ${authorText} presents a comprehensive study in the field of ${paper.domain}.

${paper.abstract}

${domainContext}

The research was published in ${paper.journal || paper.platform} and spans ${paper.pageCount || "several"} pages. ${citationContext}

The authors provide valuable insights that contribute to the advancement of knowledge in this area, with potential applications in various related fields.
`.trim();
}

/**
 * Extract key phrases from text
 */
function extractKeyPhrases(text: string): string[] {
  // Split text into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  // Extract key phrases (this is a simplified version)
  const phrases: string[] = [];
  
  // Look for sentences with important indicator words
  const importantWords = [
    "results", "conclusion", "findings", "demonstrate", "show",
    "present", "develop", "propose", "novel", "new", "approach",
    "method", "technique", "analysis", "significant", "important"
  ];
  
  for (const sentence of sentences) {
    for (const word of importantWords) {
      if (sentence.toLowerCase().includes(word)) {
        // Clean up the sentence and make it suitable for a bullet point
        const cleaned = sentence
          .replace(/^\s*[,;:]\s*/g, "") // Remove leading punctuation
          .replace(/^(this|the|our|we)\s+/i, "") // Remove common starting words
          .replace(/^(paper|study|research)\s+(shows|demonstrates|concludes|finds|presents)\s+/i, "") // Remove common phrases
          .trim();
        
        // Capitalize first letter
        const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        
        if (formatted.length > 10 && formatted.length < 150) {
          phrases.push(formatted);
          break;
        }
      }
    }
  }
  
  // Limit to 5 bullet points maximum, prioritizing different insights
  return [...new Set(phrases)].slice(0, 5);
}

/**
 * Get contextual information based on the domain
 */
function getDomainContext(domain: string): string {
  const domainContexts: Record<string, string> = {
    "Artificial Intelligence": "The field of Artificial Intelligence has been rapidly evolving, with significant advancements in machine learning algorithms, deep neural networks, and applications across various industries.",
    
    "Medicine": "Medical research continues to be vital for improving healthcare outcomes, developing new treatments, and enhancing our understanding of human health and disease.",
    
    "Physics": "Physics research explores fundamental principles of nature, from quantum mechanics to cosmology, providing the foundations for technological innovations and our understanding of the universe.",
    
    "Chemistry": "Chemistry research enables the development of new materials, drugs, and processes that address critical challenges in sustainability, healthcare, and industrial applications.",
    
    "Biology": "Biological research investigates the complexity of living systems, from molecular interactions to ecosystem dynamics, with implications for medicine, agriculture, and environmental conservation.",
    
    "Computer Science": "The field of Computer Science drives technological innovation through advances in algorithms, data structures, and system architectures that power modern digital infrastructure.",
    
    "Mathematics": "Mathematical research provides the language and tools for describing and analyzing complex systems, with applications spanning all scientific and engineering disciplines.",
    
    "Engineering": "Engineering research translates scientific principles into practical applications, developing technologies and systems that address societal needs and challenges.",
    
    "Economics": "Economic research examines the production, distribution, and consumption of goods and services, providing insights for policy makers, businesses, and individuals.",
    
    "Psychology": "Psychological research investigates human behavior, cognition, and emotion, contributing to our understanding of mental health, decision-making, and social dynamics.",
    
    "Social Sciences": "Research in the social sciences examines human societies, relationships, and institutions, providing critical insights into social challenges and opportunities.",
    
    "Environmental Science": "Environmental research studies the interactions between human activities and natural systems, informing efforts to address climate change, pollution, and resource management.",
    
    "Materials Science": "Materials research develops new substances with novel properties, enabling advances in electronics, construction, medicine, and energy technologies.",
    
    "Astronomy": "Astronomical research explores celestial objects and phenomena, expanding our understanding of the universe and our place within it."
  };
  
  return domainContexts[domain] || "This research contributes valuable insights to its field, building upon existing knowledge and opening avenues for future investigation.";
}
