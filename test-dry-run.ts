/**
 * Dry-run test - tests research and blog publishing without Bluesky
 */

import { ResearchEngine } from './src/research/index.js';
import { BlogPublisher } from './src/blog/index.js';
import { loadPersonality } from './src/agents/loader.js';
import type { Discovery, ResearchTask } from './src/types/index.js';

async function main() {
  console.log('🏠 Mansion Dry-Run Test\n');

  // Load a personality
  console.log('1. Loading Curator personality...');
  const personality = loadPersonality('./agents/curator.yaml');
  console.log(`   ✓ Loaded: ${personality.name} (@${personality.handle})`);
  console.log(`   Bio: ${personality.bio}\n`);

  // Create research engine
  console.log('2. Testing research engine...');
  const engine = new ResearchEngine();

  const task: ResearchTask = {
    id: 'test-1',
    topic: 'bioluminescence in deep sea creatures',
    description: 'Explore fascinating facts about how deep sea creatures produce light',
    depth: 'shallow',
    maxIterations: 2, // Keep it short for testing
  };

  console.log(`   Task: "${task.topic}"`);
  console.log(`   Depth: ${task.depth}, Max iterations: ${task.maxIterations}\n`);

  const discoveries: Discovery[] = [];

  const results = await engine.research(task, personality, (discovery) => {
    discoveries.push(discovery);
    console.log(`   📍 [${discovery.significance}] ${discovery.topic}`);
    console.log(`      ${discovery.content.slice(0, 100)}...`);
  });

  console.log(`\n   ✓ Research complete: ${results.length} discoveries\n`);

  // Generate a post
  if (results.length > 0) {
    console.log('3. Generating sample Bluesky post...');
    const post = await engine.generatePost(results[0], personality);
    console.log(`   ✓ Generated post (${post.length} chars):`);
    console.log(`   "${post}"\n`);
  }

  // Test blog publishing
  console.log('4. Testing blog publisher...');
  const publisher = new BlogPublisher('./docs');

  if (results.length > 0) {
    const synthesis = await engine.synthesizeFindings(results, personality);

    await publisher.publish({
      slug: 'test-bioluminescence',
      title: 'Deep Sea Bioluminescence: A Test Research',
      date: new Date(),
      author: personality.name,
      tags: ['bioluminescence', 'deep-sea', 'test'],
      summary: 'A test research post about deep sea light production',
      content: synthesis,
      discoveries: results,
    });

    console.log('   ✓ Blog post written to ./docs/posts/\n');
  }

  // Generate site config
  await publisher.generateSiteConfig();
  console.log('   ✓ Site config generated\n');

  console.log('🎉 Dry-run test complete!');
  console.log('\nTo test with Bluesky, create a .env file with:');
  console.log('  ANTHROPIC_API_KEY=<your-key>');
  console.log('  AGENT_CURATOR_IDENTIFIER=your-handle.bsky.social');
  console.log('  AGENT_CURATOR_PASSWORD=xxxx-xxxx-xxxx-xxxx');
}

main().catch(console.error);
