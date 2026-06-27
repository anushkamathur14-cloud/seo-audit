import OpenAI from "openai";
import type { Issue, Recommendation } from "./types";
import { buildFallbackRecommendations } from "./aggregator";

interface AiInput {
  url: string;
  totalPages: number;
  issues: Issue[];
  lighthouseSummary?: {
    avgPerformance?: number;
    avgSeo?: number;
  };
}

export async function generateRecommendations(
  input: AiInput,
  apiKey?: string,
  model = "gpt-4o-mini",
): Promise<{ recommendations: Recommendation[]; aiGenerated: boolean }> {
  if (!apiKey) {
    return {
      recommendations: buildFallbackRecommendations(input.issues),
      aiGenerated: false,
    };
  }

  const topIssues = input.issues.slice(0, 30).map((issue) => ({
    severity: issue.severity,
    category: issue.category,
    title: issue.title,
    description: issue.description,
    pageUrl: issue.pageUrl,
  }));

  const prompt = `You are an expert SEO consultant. Analyze this website audit and provide actionable recommendations.

Website: ${input.url}
Pages crawled: ${input.totalPages}
Average Lighthouse performance: ${input.lighthouseSummary?.avgPerformance ?? "N/A"}
Average Lighthouse SEO: ${input.lighthouseSummary?.avgSeo ?? "N/A"}

Top issues found:
${JSON.stringify(topIssues, null, 2)}

Respond with ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "severity": "critical|high|medium|low",
      "title": "Short title",
      "description": "What the issue is and why it matters",
      "fixInstructions": "Specific step-by-step fix instructions",
      "impact": "quick-win|long-term",
      "estimatedSeoImpact": "Brief impact assessment",
      "affectedPages": ["url1", "url2"]
    }
  ]
}

Provide 5-10 prioritized recommendations. Group related issues when possible. Be specific, not generic.`;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content) as {
      recommendations: Array<Omit<Recommendation, "id">>;
    };

    const recommendations: Recommendation[] = parsed.recommendations.map(
      (rec, index) => ({
        id: `ai-${index}`,
        severity: rec.severity,
        title: rec.title,
        description: rec.description,
        fixInstructions: rec.fixInstructions,
        impact: rec.impact,
        estimatedSeoImpact: rec.estimatedSeoImpact,
        affectedPages: rec.affectedPages,
      }),
    );

    return { recommendations, aiGenerated: true };
  } catch (error) {
    console.error("AI recommendation failed:", error);
    return {
      recommendations: buildFallbackRecommendations(input.issues),
      aiGenerated: false,
    };
  }
}
