import { 
  Brain, Heart, Atom, Beaker, Leaf, Code, Calculator, 
  Cog, BrainCircuit, Globe, TrendingUp, Users, Layers, 
  Star, Database 
} from 'lucide-react';

// Platform options for the research papers
export const PLATFORMS = [
  "ArXiv",
  "IEEE Xplore",
  "Springer",
  "PubMed",
  "ScienceDirect",
  "Google Scholar",
  "JSTOR",
  "Nature",
  "ACM Digital Library",
  "bioRxiv",
  "SSRN",
  "Other"
];

// Domain options for the research papers
export const DOMAINS = [
  "Artificial Intelligence",
  "Computer Science",
  "Medicine",
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "Engineering",
  "Neuroscience",
  "Environmental Science",
  "Economics",
  "Psychology",
  "Materials Science",
  "Astronomy",
  "Data Science",
  "Other"
];

// Domain icons mapping
export const DOMAIN_ICONS: Record<string, any> = {
  "Artificial Intelligence": Brain,
  "Computer Science": Code,
  "Medicine": Heart,
  "Physics": Atom,
  "Chemistry": Beaker,
  "Biology": Leaf,
  "Mathematics": Calculator,
  "Engineering": Cog,
  "Neuroscience": BrainCircuit,
  "Environmental Science": Globe,
  "Economics": TrendingUp,
  "Psychology": Users,
  "Materials Science": Layers,
  "Astronomy": Star,
  "Data Science": Database,
};

// Top Research Institutions
export const INSTITUTIONS = [
  "MIT",
  "Stanford University",
  "Harvard University",
  "Oxford University",
  "Cambridge University",
  "Caltech",
  "ETH Zurich",
  "UC Berkeley",
  "Imperial College London",
  "Max Planck Institute",
  "Other"
];

// Date range options for filtering
export const DATE_RANGES = [
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last Month", value: "1m" },
  { label: "Last 6 Months", value: "6m" },
  { label: "Last Year", value: "1y" },
  { label: "Custom Range", value: "custom" }
];

// Sorting options for papers
export const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Citation Count", value: "citations" },
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" }
];

// Results per page options
export const RESULTS_PER_PAGE = [10, 20, 50, 100];

// Export formats
export const EXPORT_FORMATS = [
  { label: "BibTeX", value: "bibtex", extension: ".bib" },
  { label: "RIS", value: "ris", extension: ".ris" },
  { label: "CSV", value: "csv", extension: ".csv" },
  { label: "JSON", value: "json", extension: ".json" }
];
