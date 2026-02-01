/**
 * Mansion - A Social Media Agent Swarm for Bluesky
 *
 * This library provides tools for creating and orchestrating multiple AI agents
 * that can research topics, post discoveries to Bluesky, and publish findings
 * to a static blog.
 */

// Core types
export * from './types/index.js';

// Agent system
export { Agent, type AgentEvents } from './agents/agent.js';
export {
  loadPersonality,
  loadCredentials,
  loadAgentConfig,
  discoverAgents,
  loadAllAgents,
  createSamplePersonality,
} from './agents/loader.js';

// Bluesky integration
export { BlueskyClient } from './bluesky/client.js';

// Research engine
export { ResearchEngine } from './research/engine.js';

// Swarm orchestration
export { Swarm, type SwarmOptions } from './orchestrator/swarm.js';

// Blog publishing
export { BlogPublisher } from './blog/publisher.js';
