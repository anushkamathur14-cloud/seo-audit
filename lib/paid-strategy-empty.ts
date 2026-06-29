import type { PaidStrategy } from "./types";

export function emptyPaidStrategy(): PaidStrategy {
  return {
    included: false,
    summary: "",
    businessTypeGuess: "",
    keywords: [],
    channels: [],
    quickWins: [],
    budgetGuidance: "",
    launchTimeline: [],
    aiGenerated: false,
  };
}
