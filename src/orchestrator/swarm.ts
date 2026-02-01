/**
 * Swarm Orchestrator
 * Coordinates multiple agents working on research projects
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import type {
  AgentConfig,
  Discovery,
  ResearchProject,
  ResearchTask,
  SwarmMessage,
  SwarmState,
  SwarmEvent,
  BlogPost,
} from '../types/index.js';
import { Agent } from '../agents/index.js';
import { BlogPublisher } from '../blog/publisher.js';

export interface SwarmOptions {
  /** Directory to publish blog posts to */
  blogDir?: string;
  /** Whether to auto-post discoveries to Bluesky */
  autoPost?: boolean;
  /** Minimum significance level to auto-post */
  minPostSignificance?: Discovery['significance'];
  /** Delay between posts (ms) to avoid rate limits */
  postDelay?: number;
}

const DEFAULT_OPTIONS: Required<SwarmOptions> = {
  blogDir: './docs',
  autoPost: true,
  minPostSignificance: 'notable',
  postDelay: 2000,
};

export class Swarm extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private state: SwarmState;
  private options: Required<SwarmOptions>;
  private publisher: BlogPublisher;

  constructor(options: SwarmOptions = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.publisher = new BlogPublisher(this.options.blogDir);
    this.state = {
      activeAgents: [],
      messageQueue: [],
      discoveries: new Map(),
    };
  }

  /** Add an agent to the swarm */
  async addAgent(config: AgentConfig): Promise<Agent> {
    const agent = new Agent(config);

    // Wire up event handlers
    agent.on('discovery', (discovery: Discovery) => this.handleDiscovery(agent, discovery));
    agent.on('message', (message: SwarmMessage) => this.handleMessage(message));
    agent.on('status', (status: string) => this.emit('status', `[${agent.name}] ${status}`));
    agent.on('error', (error: Error) => this.emit('error', error));

    // Initialize the agent
    await agent.initialize();

    this.agents.set(agent.name, agent);
    this.state.activeAgents.push(agent.name);
    this.emitEvent({ type: 'agent:started', agent: agent.name });

    return agent;
  }

  /** Remove an agent from the swarm */
  removeAgent(name: string): boolean {
    const agent = this.agents.get(name);
    if (!agent) return false;

    this.agents.delete(name);
    this.state.activeAgents = this.state.activeAgents.filter((n) => n !== name);
    this.emitEvent({ type: 'agent:stopped', agent: name });

    return true;
  }

  /** Get an agent by name */
  getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  /** Get all agents */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /** Start a research project */
  async startProject(
    title: string,
    description: string,
    tasks: Omit<ResearchTask, 'id'>[]
  ): Promise<ResearchProject> {
    const project: ResearchProject = {
      id: randomUUID(),
      title,
      description,
      agents: this.state.activeAgents,
      tasks: tasks.map((t) => ({ ...t, id: randomUUID() })),
      discoveries: [],
      status: 'planning',
      startedAt: new Date(),
    };

    this.state.currentProject = project;
    this.emitEvent({ type: 'project:started', project });

    // Assign tasks to agents
    await this.assignTasks(project);

    // Start research
    project.status = 'researching';
    await this.executeResearch(project);

    return project;
  }

  /** Assign tasks to agents based on their interests */
  private async assignTasks(project: ResearchProject): Promise<void> {
    const agents = this.getAllAgents();
    const tasks = project.tasks;

    for (let i = 0; i < tasks.length; i++) {
      // Round-robin assignment (could be smarter based on agent interests)
      const agent = agents[i % agents.length];
      tasks[i].assignedAgent = agent.name;
    }
  }

  /** Execute research for all tasks */
  private async executeResearch(project: ResearchProject): Promise<void> {
    const taskPromises = project.tasks.map(async (task) => {
      const agent = this.agents.get(task.assignedAgent!);
      if (!agent) return [];

      const discoveries = await agent.research(task);
      project.discoveries.push(...discoveries);
      return discoveries;
    });

    await Promise.all(taskPromises);

    // Synthesize and publish
    project.status = 'synthesizing';
    await this.publishProjectResults(project);

    project.status = 'complete';
    project.completedAt = new Date();
    this.emitEvent({ type: 'project:completed', project });
  }

  /** Publish project results to blog */
  private async publishProjectResults(project: ResearchProject): Promise<void> {
    if (project.discoveries.length === 0) {
      this.emit('status', 'No discoveries to publish');
      return;
    }

    // Group discoveries by agent
    const byAgent = new Map<string, Discovery[]>();
    for (const discovery of project.discoveries) {
      const existing = byAgent.get(discovery.agentName) || [];
      existing.push(discovery);
      byAgent.set(discovery.agentName, existing);
    }

    // Each agent synthesizes their findings
    for (const [agentName, discoveries] of byAgent) {
      const agent = this.agents.get(agentName);
      if (!agent) continue;

      try {
        const content = await agent.synthesizeForBlog();

        const post: BlogPost = {
          slug: this.slugify(`${project.title}-${agentName}`),
          title: `${project.title}: ${agentName}'s Research`,
          date: new Date(),
          author: agentName,
          tags: discoveries.flatMap((d) => [d.topic]).slice(0, 5),
          summary: `Research findings from ${agentName} on "${project.title}"`,
          content,
          discoveries,
        };

        await this.publisher.publish(post);
        this.emitEvent({ type: 'blog:published', post });
      } catch (error) {
        this.emit('error', error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Also create an index/summary post
    await this.publisher.updateIndex(project);
  }

  /** Handle a new discovery from an agent */
  private async handleDiscovery(agent: Agent, discovery: Discovery): Promise<void> {
    this.state.discoveries.set(discovery.id, discovery);
    this.emitEvent({ type: 'discovery:new', discovery });

    // Auto-post if enabled and significant enough
    if (this.shouldAutoPost(discovery)) {
      await this.delay(this.options.postDelay);
      const result = await agent.postDiscovery(discovery);
      this.emitEvent({ type: 'post:created', agent: agent.name, post: result });
    }

    // Broadcast to other agents
    this.broadcastDiscovery(agent.name, discovery);
  }

  /** Check if a discovery should be auto-posted */
  private shouldAutoPost(discovery: Discovery): boolean {
    if (!this.options.autoPost) return false;

    const levels: Discovery['significance'][] = ['minor', 'notable', 'major', 'breakthrough'];
    const minIndex = levels.indexOf(this.options.minPostSignificance);
    const discoveryIndex = levels.indexOf(discovery.significance);

    return discoveryIndex >= minIndex;
  }

  /** Broadcast a discovery to other agents */
  private broadcastDiscovery(fromAgent: string, discovery: Discovery): void {
    const message: SwarmMessage = {
      id: randomUUID(),
      from: fromAgent,
      to: 'all',
      type: 'discovery',
      content: `New discovery: ${discovery.topic} - ${discovery.content}`,
      timestamp: new Date(),
      referencedDiscovery: discovery.id,
    };

    this.handleMessage(message);
  }

  /** Handle a message between agents */
  private handleMessage(message: SwarmMessage): void {
    this.state.messageQueue.push(message);

    // Deliver to recipient(s)
    if (message.to === 'all') {
      for (const [name, agent] of this.agents) {
        if (name !== message.from) {
          agent.emit('swarm-message', message);
        }
      }
    } else {
      const agent = this.agents.get(message.to);
      if (agent) {
        agent.emit('swarm-message', message);
      }
    }
  }

  /** Emit a typed swarm event */
  private emitEvent(event: SwarmEvent): void {
    this.emit('swarm-event', event);
    this.emit(event.type, event);
  }

  /** Get all discoveries */
  getDiscoveries(): Discovery[] {
    return Array.from(this.state.discoveries.values());
  }

  /** Get current project */
  getCurrentProject(): ResearchProject | undefined {
    return this.state.currentProject;
  }

  /** Create a URL-friendly slug */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /** Helper delay function */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
