// Platform options for the research papers
export const PLATFORMS = [
  "ArXiv",
  "IEEE Xplore",
  "Springer",
  "PubMed",
  "ScienceDirect",
  "Other"
];

// Domain options for the research papers
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
];

// Date range options for filtering
export const DATE_RANGES = [
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last Month", value: "1m" },
  { label: "Custom Range", value: "custom" }
];

// Sorting options for papers
export const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Citation Count", value: "citations" },
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" }
];
