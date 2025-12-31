import Anthropic from "@anthropic-ai/sdk";

export class LLMSummary {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate a summary based on data and context
   */
  async generate(prompt: string, data: any): Promise<string> {
    const message = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nData:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    });

    const content = message.content[0];
    const text = content.type === "text" ? content.text : "";
    // Strip markdown formatting like **text** or *text*
    return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  }

  /**
   * Generate a hero sentence for the dashboard
   */
  async generateHeroSentence(standings: any[], currentGameweek: number): Promise<string> {
    const prompt = `You are analyzing fantasy premier league draft data for a 4-person competition after gameweek ${currentGameweek} (of 38 total).
Write ONE concise sentence (max 25 words) for the top of a dashboard.

Guidelines:
- Find something interesting beyond simple descriptions
- Try to mention all four users: Ryan, Mitchell, Jay, and Kerrod
- Comment on who can still win or who risks last place
- Remember: the loser pays $500 to the joint bank account (mention if relevant/dramatic)
- Focus on the current standings (rank) and total points

Make it punchy, insightful, and dashboard-worthy!`;
    return this.generate(prompt, standings);
  }

  /**
   * Generate a gameweek title
   */
  async generateGameweekTitle(standings: any[], currentGameweek: number): Promise<string> {
    const prompt = `Create a short, catchy title (max 6 words) for gameweek ${currentGameweek} based on these fantasy draft standings. Focus on the most interesting or dramatic aspect - a tight race, a dominant leader, someone pulling away, etc. Make it punchy and attention-grabbing!`;
    return this.generate(prompt, standings);
  }

  /**
   * Generate a chart description
   */
  async generateChartSummary(
    chartType: string,
    data: any[],
    context?: string
  ): Promise<string> {
    const prompt = `Create a brief, insightful sentence (max 25 words) describing the key takeaway from this ${chartType} chart. ${context || ""}`;
    return this.generate(prompt, data);
  }
}
