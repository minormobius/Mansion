#!/usr/bin/env node
/**
 * Mansion CLI
 * Command-line interface for the agent swarm
 */

import { Command } from 'commander';
import { config } from 'dotenv';
import { Agent, loadAgentConfig, discoverAgents, createSamplePersonality } from './agents/index.js';
import { Swarm } from './orchestrator/index.js';
import { BlogPublisher } from './blog/index.js';

// Load environment variables
config();

const program = new Command();

program
  .name('mansion')
  .description('A social media agent swarm for Bluesky')
  .version('0.1.0');

// Run a single agent
program
  .command('agent <config-file>')
  .description('Run a single agent with a research task')
  .option('-t, --topic <topic>', 'Research topic', 'emerging technology trends')
  .option('-d, --depth <depth>', 'Research depth (shallow|medium|deep)', 'medium')
  .option('-i, --iterations <n>', 'Maximum research iterations', '5')
  .option('--no-post', 'Disable posting to Bluesky')
  .action(async (configFile, options) => {
    try {
      console.log(`🏠 Starting Mansion agent from ${configFile}`);

      const agentConfig = loadAgentConfig(configFile);
      const agent = new Agent(agentConfig);

      // Set up event handlers
      agent.on('status', (status) => console.log(`  ${status}`));
      agent.on('discovery', (d) => {
        console.log(`\n  📍 Discovery [${d.significance}]: ${d.topic}`);
        console.log(`     ${d.content.slice(0, 100)}...`);
      });
      agent.on('post', (result) => {
        if (result.success) {
          console.log(`  📤 Posted: ${result.uri}`);
        } else {
          console.log(`  ❌ Post failed: ${result.error}`);
        }
      });

      await agent.initialize();

      const discoveries = await agent.research({
        id: 'cli-task',
        topic: options.topic,
        description: `Research "${options.topic}" and share interesting findings`,
        depth: options.depth as 'shallow' | 'medium' | 'deep',
        maxIterations: parseInt(options.iterations),
      });

      console.log(`\n✅ Research complete: ${discoveries.length} discoveries`);

      if (options.post !== false && discoveries.length > 0) {
        console.log('\n📱 Posting to Bluesky...');
        await agent.postResearchThread(discoveries);
      }

      // Generate blog post
      if (discoveries.length > 0) {
        console.log('\n📝 Synthesizing blog post...');
        const blogContent = await agent.synthesizeForBlog();
        const publisher = new BlogPublisher();
        await publisher.publish({
          slug: options.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: `Research: ${options.topic}`,
          date: new Date(),
          author: agent.name,
          tags: [options.topic],
          summary: `Research findings on "${options.topic}"`,
          content: blogContent,
          discoveries,
        });
        console.log('  Blog post created in ./docs/posts/');
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Run the full swarm
program
  .command('swarm')
  .description('Run the full agent swarm')
  .option('-p, --project <title>', 'Project title', 'Research Project')
  .option('-t, --topics <topics...>', 'Research topics', ['technology', 'science'])
  .option('-d, --depth <depth>', 'Research depth', 'medium')
  .option('-i, --iterations <n>', 'Max iterations per task', '5')
  .option('--no-auto-post', 'Disable auto-posting')
  .action(async (options) => {
    try {
      console.log('🏠 Starting Mansion swarm...\n');

      const agentFiles = discoverAgents();
      if (agentFiles.length === 0) {
        console.error('No agent configuration files found in ./agents/');
        console.log('Create agent configs with: mansion init <name>');
        process.exit(1);
      }

      const swarm = new Swarm({
        autoPost: options.autoPost !== false,
        minPostSignificance: 'notable',
      });

      // Set up event handlers
      swarm.on('status', (status) => console.log(status));
      swarm.on('swarm-event', (event) => {
        switch (event.type) {
          case 'agent:started':
            console.log(`  🤖 Agent started: ${event.agent}`);
            break;
          case 'discovery:new':
            console.log(`  📍 [${event.discovery.significance}] ${event.discovery.agentName}: ${event.discovery.topic}`);
            break;
          case 'post:created':
            if (event.post.success) {
              console.log(`  📤 ${event.agent} posted: ${event.post.uri}`);
            }
            break;
          case 'blog:published':
            console.log(`  📝 Blog post published: ${event.post.title}`);
            break;
          case 'project:completed':
            console.log(`\n✅ Project completed: ${event.project.discoveries.length} total discoveries`);
            break;
        }
      });

      // Load and add all agents
      console.log(`Loading ${agentFiles.length} agents...`);
      for (const file of agentFiles) {
        const config = loadAgentConfig(file);
        await swarm.addAgent(config);
      }

      // Create tasks from topics
      const tasks = options.topics.map((topic: string) => ({
        topic,
        description: `Research and discover interesting findings about ${topic}`,
        depth: options.depth as 'shallow' | 'medium' | 'deep',
        maxIterations: parseInt(options.iterations),
      }));

      console.log(`\nStarting project "${options.project}" with ${tasks.length} tasks...\n`);

      await swarm.startProject(
        options.project,
        `Investigating: ${options.topics.join(', ')}`,
        tasks
      );

      console.log('\n🏠 Swarm research complete!');
      console.log('Check ./docs/ for published research.');
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Initialize a new agent
program
  .command('init <name>')
  .description('Create a new agent configuration file')
  .option('-o, --output <dir>', 'Output directory', './agents')
  .action((name, options) => {
    const { mkdirSync, existsSync } = require('fs');
    const { join } = require('path');

    if (!existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true });
    }

    const outputPath = join(options.output, `${name.toLowerCase()}.yaml`);
    createSamplePersonality(name, outputPath);

    console.log(`✅ Created agent configuration: ${outputPath}`);
    console.log(`\nNext steps:`);
    console.log(`1. Edit ${outputPath} to customize the personality`);
    console.log(`2. Set environment variables:`);
    console.log(`   AGENT_${name.toUpperCase()}_IDENTIFIER=your-handle.bsky.social`);
    console.log(`   AGENT_${name.toUpperCase()}_PASSWORD=your-app-password`);
    console.log(`3. Run: npm run agent ${outputPath}`);
  });

// Publish command
program
  .command('publish')
  .description('Generate/update the static blog site')
  .option('-o, --output <dir>', 'Output directory', './docs')
  .action(async (options) => {
    const publisher = new BlogPublisher(options.output);
    await publisher.generateSiteConfig();
    console.log(`✅ Blog site configuration generated in ${options.output}`);
    console.log('\nTo serve locally: npx serve docs');
    console.log('Or deploy to GitHub Pages from the docs/ folder');
  });

// List discovered agents
program
  .command('list')
  .description('List all discovered agent configurations')
  .action(() => {
    const agents = discoverAgents();
    if (agents.length === 0) {
      console.log('No agents found. Create one with: mansion init <name>');
      return;
    }

    console.log('Discovered agents:');
    for (const file of agents) {
      try {
        const { loadPersonality } = require('./agents/loader.js');
        const personality = loadPersonality(file);
        console.log(`  🤖 ${personality.name} (@${personality.handle})`);
        console.log(`     ${personality.bio}`);
        console.log(`     File: ${file}\n`);
      } catch {
        console.log(`  ❓ ${file} (invalid configuration)`);
      }
    }
  });

program.parse();
