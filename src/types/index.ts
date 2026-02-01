/**
 * Core types for the Mansion agent swarm
 */

/** Agent personality configuration */
export interface AgentPersonality {
  name: string;
  handle: string; // Bluesky handle (without @)
  bio: string;
  traits: string[];
  voice: {
    tone: string;
    style: string;
    quirks?: string[];
  };
  interests: string[];
  researchFocus?: string;
}

/** Agent credentials for Bluesky */
export interface AgentCredentials {
  identifier: string; // Handle or DID
  password: string; // App password
}

/** Full agent configuration (personality + credentials) */
export interface AgentConfig {
  personality: AgentPersonality;
  credentials: AgentCredentials;
}

/** A single discovery made during research */
export interface Discovery {
  id: string;
  agentName: string;
  timestamp: Date;
  topic: string;
  content: string;
  sources: string[];
  significance: 'minor' | 'notable' | 'major' | 'breakthrough';
  relatedDiscoveries?: string[]; // IDs of related discoveries
}

/** A post to be made on Bluesky */
export interface BlueskyPost {
  text: string;
  replyTo?: {
    uri: string;
    cid: string;
  };
  embed?: {
    type: 'link' | 'images';
    url?: string;
    title?: string;
    description?: string;
  };
}

/** Result of posting to Bluesky */
export interface PostResult {
  uri: string;
  cid: string;
  success: boolean;
  error?: string;
}

/** Research task for an agent */
export interface ResearchTask {
  id: string;
  topic: string;
  description: string;
  depth: 'shallow' | 'medium' | 'deep';
  maxIterations: number;
  assignedAgent?: string;
}

/** A complete research project with all discoveries */
export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  agents: string[];
  tasks: ResearchTask[];
  discoveries: Discovery[];
  status: 'planning' | 'researching' | 'synthesizing' | 'complete';
  startedAt: Date;
  completedAt?: Date;
  finalReport?: string;
}

/** Blog post for publishing */
export interface BlogPost {
  slug: string;
  title: string;
  date: Date;
  author: string;
  tags: string[];
  summary: string;
  content: string; // Markdown
  discoveries: Discovery[];
}

/** Message between agents in the swarm */
export interface SwarmMessage {
  id: string;
  from: string;
  to: string | 'all';
  type: 'discovery' | 'question' | 'insight' | 'request' | 'response';
  content: string;
  timestamp: Date;
  referencedDiscovery?: string;
}

/** Orchestrator state */
export interface SwarmState {
  activeAgents: string[];
  currentProject?: ResearchProject;
  messageQueue: SwarmMessage[];
  discoveries: Map<string, Discovery>;
}

/** Event emitted by the swarm */
export type SwarmEvent =
  | { type: 'agent:started'; agent: string }
  | { type: 'agent:stopped'; agent: string }
  | { type: 'discovery:new'; discovery: Discovery }
  | { type: 'post:created'; agent: string; post: PostResult }
  | { type: 'project:started'; project: ResearchProject }
  | { type: 'project:completed'; project: ResearchProject }
  | { type: 'blog:published'; post: BlogPost };
