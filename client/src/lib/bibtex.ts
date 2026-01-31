import { Paper } from "./types";

export function generateBibTeX(paper: Paper): string {
  // Extract year from publishedDate or use current year as fallback
  const year = new Date(paper.publishedDate).getFullYear() || new Date().getFullYear();
  
  // Create a valid BibTeX citation key (AuthorYearTitle)
  const firstAuthor = paper.authors[0]?.split(' ').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'unknown';
  const titleWord = paper.title.split(' ')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'paper';
  const citationKey = `${firstAuthor}${year}${titleWord}`;

  return `@article{${citationKey},
  title={${paper.title}},
  author={${paper.authors.join(' and ')}},
  journal={${paper.platform}},
  year={${year}},
  url={${paper.url}}
}`;
}
