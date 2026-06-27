export const config = {
  maxPages: parseInt(process.env.MAX_PAGES || "50", 10),
  maxDepth: parseInt(process.env.MAX_DEPTH || "3", 10),
  lighthousePages: parseInt(process.env.LIGHTHOUSE_PAGES || "5", 10),
  rateLimitMs: 1000,
  jobTimeoutMs: 5 * 60 * 1000,
  lighthouseTimeoutMs: 90 * 1000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
};
