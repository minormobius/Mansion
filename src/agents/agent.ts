/**
 * Base Agent class - combines personality, Bluesky posting, and research
 */

import { EventEmitter } from 'events';
import type {
  AgentConfig,
  AgentPersonality,
  Discovery,
  ResearchTask,
  PostResult,
  SwarmMessage,
} from '../types/index.js';
import { BlueskyClient } from '../bluesky/index.js';
import { ResearchEngine } from '../research/index.js';

export interface AgentEvents {
  'discovery': (discovery: Discovery) => void;
  'post': (result: PostResult) => void;
  'message': (message: SwarmMessage) => void;
  'error': (error: Error) => void;
  'status': (status: string) => void;
}

export class Agent extends EventEmitter {
  readonly personality: AgentPersonality;
  private bluesky: BlueskyClient;
  private researchEngine: ResearchEngine;
  private discoveries: Discovery[] = [];
  private running = false;

  constructor(config: AgentConfig) {
    super();
    this.personality = config.personality;
    this.bluesky = new BlueskyClient(config.credentials);
    this.researchEngine = new ResearchEngine();
  }

  /** Get agent's name */
  get name(): string {
    return this.personality.name;
  }

  /** Get agent's Bluesky handle */
  get handle(): string {
    return this.personality.handle;
  }

  /** Check if agent is currently running */
  get isRunning(): boolean {
    return this.running;
  }

  /** Get all discoveries made by this agent */
  getDiscoveries(): Discovery[] {
    return [...this.discoveries];
  }

  /** Initialize the agent (login to Bluesky) */
  async initialize(): Promise<void> {
    this.emit('status', `${this.name} initializing...`);
    await this.bluesky.login();
    this.emit('status', `${this.name} logged in to Bluesky as @${this.handle}`);
  }

  /** Start researching a task */
  async research(task: ResearchTask): Promise<Discovery[]> {
    this.running = true;
    this.emit('status', `${this.name} starting research: ${task.topic}`);

    try {
      const discoveries = await this.researchEngine.research(
        task,
        this.personality,
        (discovery) => {
          this.discoveries.push(discovery);
          this.emit('discovery', discovery);
        }
      );

      this.emit('status', `${this.name} completed research with ${discoveries.length} discoveries`);
      return discoveries;
    } finally {
      this.running = false;
    }
  }

  /** Post a discovery to Bluesky */
  async postDiscovery(discovery: Discovery): Promise<PostResult> {
    const postText = await this.researchEngine.generatePost(discovery, this.personality);

    this.emit('status', `${this.name} posting: "${postText.slice(0, 50)}..."`);

    const result = await this.bluesky.post({ text: postText });
    this.emit('post', result);

    return result;
  }

  /** Post a custom message to Bluesky */
  async post(text: string): Promise<PostResult> {
    const result = await this.bluesky.post({ text });
    this.emit('post', result);
    return result;
  }

  /** Reply to a post */
  async reply(text: string, uri: string, cid: string): Promise<PostResult> {
    const result = await this.bluesky.reply(text, uri, cid);
    this.emit('post', result);
    return result;
  }

  /** Generate and post research as a thread */
  async postResearchThread(discoveries: Discovery[]): Promise<PostResult[]> {
    const results: PostResult[] = [];

    // Sort by significance (most significant first)
    const sorted = [...discoveries].sort((a, b) => {
      const order = { breakthrough: 0, major: 1, notable: 2, minor: 3 };
      return order[a.significance] - order[b.significance];
    });

    // Post most significant as main post
    const mainDiscovery = sorted[0];
    const mainResult = await this.postDiscovery(mainDiscovery);
    results.push(mainResult);

    // Post others as replies (limit to top 5)
    if (mainResult.success) {
      for (const discovery of sorted.slice(1, 5)) {
        const postText = await this.researchEngine.generatePost(discovery, this.personality);
        const replyResult = await this.bluesky.reply(
          postText,
          mainResult.uri,
          mainResult.cid
        );
        results.push(replyResult);

        // Small delay to avoid rate limits
        await this.delay(1000);
      }
    }

    return results;
  }

  /** Get notifications and find relevant mentions */
  async checkMentions(): Promise<unknown[]> {
    const notifications = await this.bluesky.getNotifications();
    return notifications.filter((n: unknown) => {
      const notif = n as { reason?: string };
      return notif.reason === 'mention' || notif.reason === 'reply';
    });
  }

  /** Send a message to another agent in the swarm */
  sendMessage(to: string, type: SwarmMessage['type'], content: string): SwarmMessage {
    const message: SwarmMessage = {
      id: crypto.randomUUID(),
      from: this.name,
      to,
      type,
      content,
      timestamp: new Date(),
    };
    this.emit('message', message);
    return message;
  }

  /** Respond to a swarm message */
  async respondToMessage(message: SwarmMessage): Promise<string> {
    // Use Claude to generate a response in character
    const engine = new ResearchEngine();

    // This is a simplified response - in practice you'd want more context
    const response = await engine.generatePost(
      {
        id: message.id,
        agentName: message.from,
        timestamp: message.timestamp,
        topic: message.type,
        content: message.content,
        sources: [],
        significance: 'minor',
      },
      this.personality
    );

    return response;
  }

  /** Synthesize all discoveries into a blog post */
  async synthesizeForBlog(): Promise<string> {
    if (this.discoveries.length === 0) {
      throw new Error('No discoveries to synthesize');
    }

    return this.researchEngine.synthesizeFindings(this.discoveries, this.personality);
  }

  /** Helper to add delays */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
