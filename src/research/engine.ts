/**
 * Research engine powered by Claude
 * Performs iterative research with web search and analysis
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AgentPersonality, Discovery, ResearchTask } from '../types/index.js';
import { randomUUID } from 'crypto';

interface ResearchContext {
  task: ResearchTask;
  personality: AgentPersonality;
  previousFindings: string[];
  iteration: number;
}

interface ResearchStep {
  thought: string;
  action: 'search' | 'analyze' | 'synthesize' | 'conclude';
  query?: string;
  findings?: string;
  discovery?: Omit<Discovery, 'id' | 'agentName' | 'timestamp'>;
}

export class ResearchEngine {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = new Anthropic();
  }

  /** Perform research on a topic */
  async research(
    task: ResearchTask,
    personality: AgentPersonality,
    onDiscovery?: (discovery: Discovery) => void
  ): Promise<Discovery[]> {
    const discoveries: Discovery[] = [];
    const context: ResearchContext = {
      task,
      personality,
      previousFindings: [],
      iteration: 0,
    };

    while (context.iteration < task.maxIterations) {
      context.iteration++;

      const step = await this.performResearchStep(context);

      if (step.findings) {
        context.previousFindings.push(step.findings);
      }

      if (step.discovery) {
        const discovery: Discovery = {
          id: randomUUID(),
          agentName: personality.name,
          timestamp: new Date(),
          ...step.discovery,
        };
        discoveries.push(discovery);

        if (onDiscovery) {
          onDiscovery(discovery);
        }
      }

      if (step.action === 'conclude') {
        break;
      }
    }

    return discoveries;
  }

  /** Perform a single research step */
  private async performResearchStep(context: ResearchContext): Promise<ResearchStep> {
    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = this.buildUserPrompt(context);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return this.parseResearchResponse(content.text);
  }

  /** Build system prompt incorporating personality */
  private buildSystemPrompt(context: ResearchContext): string {
    const { personality } = context;

    return `You are ${personality.name}, a research agent with the following traits:
- Personality traits: ${personality.traits.join(', ')}
- Communication style: ${personality.voice.tone}, ${personality.voice.style}
${personality.voice.quirks ? `- Quirks: ${personality.voice.quirks.join(', ')}` : ''}
- Research interests: ${personality.interests.join(', ')}
${personality.researchFocus ? `- Primary focus: ${personality.researchFocus}` : ''}

You are conducting research and must think through your process. For each step, respond in this JSON format:
{
  "thought": "Your reasoning about what to do next",
  "action": "search" | "analyze" | "synthesize" | "conclude",
  "query": "Search query if action is search",
  "findings": "Key findings from this step",
  "discovery": {
    "topic": "Specific topic of discovery",
    "content": "The discovery itself - should be interesting and shareable",
    "sources": ["list of sources"],
    "significance": "minor" | "notable" | "major" | "breakthrough"
  } // Include only if you found something worth sharing
}

Guidelines:
- Make discoveries genuinely interesting and worth posting to social media
- Write discoveries in your unique voice and style
- Only mark something as "breakthrough" if it's truly significant
- "minor" discoveries are small interesting facts
- "notable" discoveries connect multiple ideas
- "major" discoveries reveal important patterns or insights
- Use "conclude" when you've explored the topic sufficiently`;
  }

  /** Build the user prompt for this step */
  private buildUserPrompt(context: ResearchContext): string {
    const { task, previousFindings, iteration } = context;

    let prompt = `Research Task: ${task.topic}
Description: ${task.description}
Depth: ${task.depth}
Current iteration: ${iteration} of ${task.maxIterations}

`;

    if (previousFindings.length > 0) {
      prompt += `Previous findings:\n${previousFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n`;
    }

    prompt += `What is your next research step? Remember to respond in the specified JSON format.`;

    return prompt;
  }

  /** Parse the research response into structured data */
  private parseResearchResponse(text: string): ResearchStep {
    try {
      // Extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        thought: parsed.thought || '',
        action: parsed.action || 'analyze',
        query: parsed.query,
        findings: parsed.findings,
        discovery: parsed.discovery,
      };
    } catch {
      // If parsing fails, treat as an analysis step
      return {
        thought: text,
        action: 'analyze',
        findings: text.slice(0, 200),
      };
    }
  }

  /** Generate a summary of discoveries for a blog post */
  async synthesizeFindings(
    discoveries: Discovery[],
    personality: AgentPersonality
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4000,
      system: `You are ${personality.name}. Write in your voice: ${personality.voice.tone}, ${personality.voice.style}.`,
      messages: [
        {
          role: 'user',
          content: `Synthesize these research discoveries into a cohesive blog post (in Markdown format):

${discoveries.map((d, i) => `${i + 1}. [${d.significance}] ${d.topic}: ${d.content}`).join('\n\n')}

Write a compelling narrative that:
- Has an engaging title
- Introduces the research topic
- Presents findings in a logical flow
- Draws meaningful conclusions
- Uses your unique voice and perspective`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return content.text;
  }

  /** Generate a social media post for a discovery */
  async generatePost(
    discovery: Discovery,
    personality: AgentPersonality
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 400,
      system: `You are ${personality.name}. Write social media posts in your voice: ${personality.voice.tone}, ${personality.voice.style}. Keep posts under 280 characters. Be engaging and authentic.`,
      messages: [
        {
          role: 'user',
          content: `Turn this research discovery into a compelling Bluesky post:

Topic: ${discovery.topic}
Finding: ${discovery.content}
Significance: ${discovery.significance}

Write a single post that shares this discovery in an engaging way. No hashtags unless they're genuinely relevant.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Ensure it fits Bluesky's character limit (300 chars)
    return content.text.slice(0, 300);
  }
}
