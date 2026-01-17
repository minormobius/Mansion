/**
 * Agent configuration loader
 * Loads agent personalities from YAML files and credentials from environment
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type { AgentConfig, AgentPersonality, AgentCredentials } from '../types/index.js';

const AGENTS_DIR = './agents';

/** Load a single agent personality from YAML file */
export function loadPersonality(filePath: string): AgentPersonality {
  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseYaml(content);

  // Validate required fields
  if (!parsed.name || !parsed.handle || !parsed.bio) {
    throw new Error(`Invalid personality file ${filePath}: missing required fields`);
  }

  return {
    name: parsed.name,
    handle: parsed.handle,
    bio: parsed.bio,
    traits: parsed.traits || [],
    voice: {
      tone: parsed.voice?.tone || 'neutral',
      style: parsed.voice?.style || 'conversational',
      quirks: parsed.voice?.quirks,
    },
    interests: parsed.interests || [],
    researchFocus: parsed.researchFocus,
  };
}

/** Load credentials for an agent from environment variables */
export function loadCredentials(agentName: string): AgentCredentials {
  // Environment variables should be named like:
  // AGENT_CURATOR_IDENTIFIER, AGENT_CURATOR_PASSWORD
  const envPrefix = `AGENT_${agentName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;

  const identifier = process.env[`${envPrefix}_IDENTIFIER`];
  const password = process.env[`${envPrefix}_PASSWORD`];

  if (!identifier || !password) {
    throw new Error(
      `Missing credentials for agent "${agentName}". ` +
        `Set ${envPrefix}_IDENTIFIER and ${envPrefix}_PASSWORD environment variables.`
    );
  }

  return { identifier, password };
}

/** Load a complete agent configuration */
export function loadAgentConfig(personalityFile: string): AgentConfig {
  const personality = loadPersonality(personalityFile);
  const credentials = loadCredentials(personality.name);

  return { personality, credentials };
}

/** Discover all agent configuration files */
export function discoverAgents(directory = AGENTS_DIR): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  const files = readdirSync(directory);
  return files
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => join(directory, f));
}

/** Load all agents from the agents directory */
export function loadAllAgents(directory = AGENTS_DIR): AgentConfig[] {
  const files = discoverAgents(directory);
  return files.map(loadAgentConfig);
}

/** Create a sample agent personality file */
export function createSamplePersonality(name: string, outputPath: string): void {
  const sample: AgentPersonality = {
    name,
    handle: `${name.toLowerCase()}.bsky.social`,
    bio: `A curious research agent exploring the world of ideas.`,
    traits: ['curious', 'analytical', 'friendly'],
    voice: {
      tone: 'enthusiastic',
      style: 'conversational but informative',
      quirks: ['uses analogies', 'asks rhetorical questions'],
    },
    interests: ['technology', 'science', 'culture'],
    researchFocus: undefined,
  };

  const yaml = `# Agent personality configuration
name: "${sample.name}"
handle: "${sample.handle}"
bio: "${sample.bio}"

traits:
${sample.traits.map((t) => `  - ${t}`).join('\n')}

voice:
  tone: "${sample.voice.tone}"
  style: "${sample.voice.style}"
  quirks:
${sample.voice.quirks?.map((q) => `    - "${q}"`).join('\n')}

interests:
${sample.interests.map((i) => `  - ${i}`).join('\n')}

# Optional: specific research focus
# researchFocus: "emerging technology trends"
`;

  writeFileSync(outputPath, yaml);
}
