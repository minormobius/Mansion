/**
 * Deep research on biotech funding - academic headwaters focus
 * Target: ~30 high-quality discoveries with sources
 */

import 'dotenv/config';
import { BskyAgent, RichText } from '@atproto/api';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface Discovery {
  topic: string;
  content: string;
  sources: string[];
  significance: 'minor' | 'notable' | 'major' | 'breakthrough';
  tweetText?: string;
}

// Curator personality for this research
const personality = {
  name: 'Curator',
  voice: 'warm, intellectually curious, finds unexpected connections',
  style: 'conversational yet informative, like sharing discoveries with a smart friend',
};

async function research(topic: string, angle: string, iterations: number): Promise<Discovery[]> {
  const discoveries: Discovery[] = [];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are a research analyst investigating: "${topic}"

Specific angle: ${angle}

Generate ${iterations} research discoveries. For each discovery, provide REAL, VERIFIABLE information with actual sources (institutions, papers, companies, people that actually exist).

Focus on:
- University labs that spawned major biotech companies
- NIH/NSF grants that led to commercial applications
- Academic founders and their institutional origins
- Funding patterns (Series A sources, VC firms specializing in academic spinouts)
- Notable tech transfer offices and their track records
- Recent trends in academic biotech entrepreneurship

Return as JSON array:
[{
  "topic": "specific topic",
  "content": "the discovery - 2-3 sentences of substantive insight",
  "sources": ["real institution/paper/company names"],
  "significance": "minor|notable|major|breakthrough"
}]

Be specific. Name real universities, real companies, real people, real funding amounts when known. No generic statements.`
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      discoveries.push(...parsed);
    }
  } catch (e) {
    console.error('Parse error:', e);
  }

  return discoveries;
}

async function generatePost(discovery: Discovery): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are ${personality.name}, with voice: ${personality.voice}

Turn this research finding into a compelling Bluesky post (max 280 chars):

Topic: ${discovery.topic}
Finding: ${discovery.content}
Sources: ${discovery.sources.join(', ')}

Write in first person, be genuinely interested. No hashtags. Include a specific fact or number if possible. Make people want to learn more.`
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return text.slice(0, 300);
}

async function postToBluesky(agent: BskyAgent, text: string, replyTo?: { uri: string; cid: string }) {
  const rt = new RichText({ text });
  await rt.detectFacets(agent);

  const record: Record<string, unknown> = {
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  };

  if (replyTo) {
    record.reply = { root: replyTo, parent: replyTo };
  }

  return agent.post(record);
}

async function main() {
  console.log('🧬 Biotech Funding Research - Academic Headwaters\n');
  console.log('Target: ~30 discoveries on the academic origins of funded biotech\n');

  // Login to Bluesky
  console.log('Logging into Bluesky as aarow.bsky.social...');
  const agent = new BskyAgent({ service: 'https://bsky.social' });

  try {
    await agent.login({
      identifier: process.env.AGENT_CURATOR_IDENTIFIER!,
      password: process.env.AGENT_CURATOR_PASSWORD!,
    });
    console.log('✓ Logged in successfully\n');
  } catch (e) {
    console.error('Login failed:', e);
    return;
  }

  // Research angles to cover
  const researchAngles = [
    { angle: 'University spinouts that became billion-dollar biotech companies - trace their academic origins, founding labs, key professors', iterations: 6 },
    { angle: 'NIH and NSF grant programs that consistently produce commercial biotech applications - R01s, SBIRs, specific institutes', iterations: 5 },
    { angle: 'Top tech transfer offices (Stanford OTL, MIT TLO, etc) and their most successful biotech licensing deals', iterations: 5 },
    { angle: 'VC firms that specialize in academic biotech spinouts - their strategies, portfolio patterns, university relationships', iterations: 5 },
    { angle: 'Recent trends 2022-2024: which universities are producing the most funded biotech startups right now', iterations: 5 },
    { angle: 'The people - academic founders who have started multiple successful biotechs, serial entrepreneur-professors', iterations: 5 },
  ];

  const allDiscoveries: Discovery[] = [];

  for (const { angle, iterations } of researchAngles) {
    console.log(`\n📚 Researching: ${angle.slice(0, 60)}...`);

    const discoveries = await research('Biotech funding environment and academic origins', angle, iterations);
    console.log(`   Found ${discoveries.length} discoveries`);

    for (const d of discoveries) {
      console.log(`   • [${d.significance}] ${d.topic}`);
    }

    allDiscoveries.push(...discoveries);

    // Small delay between research calls
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n\n🎯 Total discoveries: ${allDiscoveries.length}`);
  console.log('\n📱 Generating posts and publishing to Bluesky...\n');

  // Sort by significance
  const sorted = allDiscoveries.sort((a, b) => {
    const order = { breakthrough: 0, major: 1, notable: 2, minor: 3 };
    return order[a.significance] - order[b.significance];
  });

  // Post the top ones
  let posted = 0;
  let mainPost: { uri: string; cid: string } | undefined;

  for (const discovery of sorted.slice(0, 30)) {
    try {
      const postText = await generatePost(discovery);
      discovery.tweetText = postText;

      console.log(`\n[${posted + 1}] ${discovery.significance.toUpperCase()}: ${discovery.topic}`);
      console.log(`    "${postText.slice(0, 100)}..."`);

      // First post is standalone, rest are replies to create a thread
      const result = await postToBluesky(agent, postText, posted > 0 ? mainPost : undefined);

      if (posted === 0) {
        mainPost = { uri: result.uri, cid: result.cid };
        console.log(`    ✓ Posted (thread start): ${result.uri}`);
      } else {
        console.log(`    ✓ Posted (reply ${posted})`);
      }

      posted++;

      // Delay to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));

    } catch (e) {
      console.error(`    ✗ Failed to post:`, e);
    }
  }

  console.log(`\n\n🎉 Complete! Posted ${posted} discoveries to Bluesky`);
  console.log(`Thread starts at: https://bsky.app/profile/aarow.bsky.social`);

  // Save discoveries to file for blog
  const fs = await import('fs');
  fs.writeFileSync('./biotech-discoveries.json', JSON.stringify(sorted, null, 2));
  console.log('\nDiscoveries saved to biotech-discoveries.json');
}

main().catch(console.error);
