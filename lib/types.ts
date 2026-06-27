export type Severity = "critical" | "high" | "medium" | "low";
export type AuditPhase =
  | "crawling"
  | "analyzing"
  | "lighthouse"
  | "ai"
  | "complete";
export type JobStatus = "running" | "complete" | "error";

export interface Issue {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  pageUrl?: string;
  recommendation?: string;
}

export interface PageSignals {
  url: string;
  statusCode: number;
  title?: string;
  titleLength?: number;
  metaDescription?: string;
  metaDescriptionLength?: number;
  h1Count: number;
  h1Texts: string[];
  headingHierarchyIssues: string[];
  imagesMissingAlt: number;
  imagesTotal: number;
  canonical?: string;
  hasOgTags: boolean;
  hasTwitterTags: boolean;
  hasStructuredData: boolean;
  robotsMeta?: string;
  hasViewport: boolean;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  responseTimeMs?: number;
  contentLength?: number;
}

export interface PageAudit extends PageSignals {
  issues: Issue[];
  inboundLinkCount: number;
}

export interface LighthouseMetrics {
  url: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp?: number;
  cls?: number;
  inp?: number;
  tbt?: number;
  renderBlockingResources?: number;
  totalByteWeight?: number;
}

export interface SiteAudit {
  robotsTxt: {
    found: boolean;
    sitemapUrls: string[];
    disallowRules: string[];
  };
  sitemap: {
    found: boolean;
    urlCount?: number;
    error?: string;
  };
  httpsUsed: boolean;
  mixedContentWarnings: number;
  urlConsistencyIssues: string[];
}

export interface Recommendation {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  fixInstructions: string;
  impact: "quick-win" | "long-term";
  estimatedSeoImpact: string;
  affectedPages?: string[];
}

export interface AuditScores {
  ruleBased: number;
  lighthouseSeo: number;
  overall: number;
}

export interface AuditSummary {
  totalPages: number;
  totalIssues: number;
  issuesBySeverity: Record<Severity, number>;
  avgLighthousePerformance?: number;
  avgLighthouseSeo?: number;
}

export interface AuditResult {
  url: string;
  auditedAt: string;
  pages: PageAudit[];
  site: SiteAudit;
  lighthouse: LighthouseMetrics[];
  issues: Issue[];
  recommendations: Recommendation[];
  paidStrategy: PaidStrategy;
  scores: AuditScores;
  summary: AuditSummary;
  aiGenerated: boolean;
}

export interface AuditProgress {
  pagesCrawled: number;
  totalEstimate: number;
  phase: AuditPhase;
  message?: string;
}

export interface AuditJob {
  id: string;
  url: string;
  status: JobStatus;
  progress: AuditProgress;
  result?: AuditResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrawledPage {
  url: string;
  html: string;
  statusCode: number;
  internalLinks: string[];
  externalLinks: string[];
  responseTimeMs: number;
  contentLength: number;
}

export interface CrawlOptions {
  maxPages: number;
  maxDepth: number;
  rateLimitMs: number;
  onProgress?: (pagesCrawled: number) => void;
}

export type KeywordIntent =
  | "informational"
  | "navigational"
  | "commercial"
  | "transactional";

export type KeywordMatchType = "exact" | "phrase" | "broad";

export type PaidChannelId =
  | "google-search"
  | "google-display"
  | "google-shopping"
  | "meta-facebook"
  | "meta-instagram"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "microsoft-ads"
  | "retargeting";

export interface KeywordTarget {
  id: string;
  keyword: string;
  intent: KeywordIntent;
  matchType: KeywordMatchType;
  rationale: string;
  suggestedLandingPage?: string;
  priority: "high" | "medium" | "low";
}

export interface ChannelRecommendation {
  id: string;
  channel: PaidChannelId;
  channelLabel: string;
  priority: "primary" | "secondary" | "test";
  rationale: string;
  estimatedBudgetRange: string;
  bestFor: string;
  tactics: string[];
}

export interface PaidStrategy {
  summary: string;
  businessTypeGuess: string;
  keywords: KeywordTarget[];
  channels: ChannelRecommendation[];
  quickWins: string[];
  budgetGuidance: string;
  aiGenerated: boolean;
}
