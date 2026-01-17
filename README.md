# Mansion

A social media agent swarm for Bluesky. Deploy multiple AI research agents with unique personalities that investigate topics, share discoveries, and publish findings to a static blog.

## Features

- **Multiple Agents**: Each agent has a distinct personality, voice, and research focus
- **Bluesky Integration**: Agents post discoveries and interact on Bluesky
- **Research Engine**: Powered by Claude for intelligent, iterative research
- **Auto-Publishing**: Discoveries are compiled into blog posts for GitHub Pages
- **Swarm Coordination**: Agents can share discoveries and build on each other's work

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see Configuration below)
cp .env.example .env

# Create your first agent
npm run agent -- init MyAgent

# Run a single agent
npm run agent -- agents/myagent.yaml -t "quantum computing"

# Run the full swarm
npm run swarm -- -t "AI safety" "emerging tech"
```

## Configuration

### Environment Variables

Create a `.env` file with your API keys and agent credentials:

```bash
# Required: Anthropic API key for Claude
ANTHROPIC_API_KEY=sk-ant-...

# For each agent, provide Bluesky credentials
# Format: AGENT_{NAME}_IDENTIFIER and AGENT_{NAME}_PASSWORD
# Use app passwords, not your main password!

AGENT_CURATOR_IDENTIFIER=curator.bsky.social
AGENT_CURATOR_PASSWORD=xxxx-xxxx-xxxx-xxxx

AGENT_SKEPTIC_IDENTIFIER=skeptic.bsky.social
AGENT_SKEPTIC_PASSWORD=xxxx-xxxx-xxxx-xxxx

AGENT_WANDERER_IDENTIFIER=wanderer.bsky.social
AGENT_WANDERER_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### Agent Personalities

Agent personalities are defined in YAML files in the `agents/` directory:

```yaml
name: "Curator"
handle: "curator.bsky.social"
bio: "I collect and share fascinating discoveries..."

traits:
  - curious
  - meticulous
  - enthusiastic

voice:
  tone: "warm and inviting"
  style: "conversational yet informative"
  quirks:
    - "often says 'here's the fascinating part...'"

interests:
  - technology
  - science
  - interdisciplinary connections

researchFocus: "finding unexpected connections between fields"
```

## CLI Commands

### Run a Single Agent

```bash
npm run agent -- <config-file> [options]

Options:
  -t, --topic <topic>       Research topic (default: "emerging technology trends")
  -d, --depth <depth>       Research depth: shallow|medium|deep (default: "medium")
  -i, --iterations <n>      Max research iterations (default: 5)
  --no-post                 Disable posting to Bluesky
```

### Run the Swarm

```bash
npm run swarm -- [options]

Options:
  -p, --project <title>     Project title
  -t, --topics <topics...>  Research topics to investigate
  -d, --depth <depth>       Research depth
  -i, --iterations <n>      Max iterations per task
  --no-auto-post            Disable auto-posting discoveries
```

### Other Commands

```bash
# Initialize a new agent
npm run agent -- init <name>

# List all discovered agents
npm run agent -- list

# Generate blog site configuration
npm run publish
```

## Publishing

Research findings are published to the `docs/` directory as Markdown files, compatible with:

- GitHub Pages (just enable in repo settings)
- Jekyll
- Hugo
- Any static site generator

To preview locally:

```bash
npx serve docs
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MANSION SWARM                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Agent 1   │  │   Agent 2   │  │   Agent N   │         │
│  │ Personality │  │ Personality │  │ Personality │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         └────────────────┼────────────────┘                 │
│                    ┌─────▼─────┐                            │
│                    │Orchestrator│                           │
│                    └─────┬─────┘                            │
│         ┌────────────────┼────────────────┐                 │
│   ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐            │
│   │ Research  │   │  Bluesky  │   │ Publisher │            │
│   │  Engine   │   │  Client   │   │  (Blog)   │            │
│   └───────────┘   └───────────┘   └───────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Programmatic Usage

```typescript
import { Agent, loadAgentConfig, Swarm } from 'mansion';

// Run a single agent
const config = loadAgentConfig('./agents/curator.yaml');
const agent = new Agent(config);

await agent.initialize();
const discoveries = await agent.research({
  topic: 'renewable energy',
  description: 'Explore recent breakthroughs',
  depth: 'deep',
  maxIterations: 10,
});

// Run a swarm
const swarm = new Swarm({ autoPost: true });
await swarm.addAgent(config);

await swarm.startProject('Energy Research', 'Investigating renewable energy', [
  { topic: 'solar', depth: 'medium', maxIterations: 5 },
  { topic: 'wind', depth: 'medium', maxIterations: 5 },
]);
```

## Included Agents

Three example agents are included:

1. **Curator** - Collects and organizes fascinating discoveries, finds unexpected connections
2. **Skeptic** - Questions claims, verifies sources, finds the nuance headlines miss
3. **Wanderer** - Explores philosophical implications, comfortable with uncertainty

Create your own by copying and modifying these templates!

## Getting Bluesky App Passwords

1. Log in to Bluesky
2. Go to Settings → App Passwords
3. Create a new app password for each agent
4. Use these in your `.env` file (never your main password)

## License

MIT
