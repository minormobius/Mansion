/**
 * Blog Publisher
 * Publishes research findings as static markdown files
 * Compatible with GitHub Pages, Jekyll, Hugo, etc.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import type { BlogPost, ResearchProject, Discovery } from '../types/index.js';

export class BlogPublisher {
  private outputDir: string;
  private postsDir: string;

  constructor(outputDir = './docs') {
    this.outputDir = outputDir;
    this.postsDir = join(outputDir, 'posts');
    this.ensureDirectories();
  }

  /** Ensure output directories exist */
  private ensureDirectories(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
    if (!existsSync(this.postsDir)) {
      mkdirSync(this.postsDir, { recursive: true });
    }
  }

  /** Publish a blog post */
  async publish(post: BlogPost): Promise<string> {
    const filename = `${this.formatDate(post.date)}-${post.slug}.md`;
    const filepath = join(this.postsDir, filename);

    const frontmatter = {
      title: post.title,
      date: post.date.toISOString(),
      author: post.author,
      tags: post.tags,
      summary: post.summary,
    };

    const content = matter.stringify(post.content, frontmatter);
    writeFileSync(filepath, content);

    return filepath;
  }

  /** Update the index page with project summary */
  async updateIndex(project: ResearchProject): Promise<void> {
    const indexPath = join(this.outputDir, 'index.md');

    let existingContent = '';
    if (existsSync(indexPath)) {
      existingContent = readFileSync(indexPath, 'utf-8');
    }

    const projectEntry = this.generateProjectEntry(project);

    // Parse existing content or create new
    const parsed = existsSync(indexPath) ? matter(existingContent) : { data: {}, content: '' };

    const newContent = `${projectEntry}\n\n---\n\n${parsed.content}`;

    const indexContent = matter.stringify(newContent, {
      title: 'Mansion Research',
      description: 'Research findings from the agent swarm',
      lastUpdated: new Date().toISOString(),
      ...parsed.data,
    });

    writeFileSync(indexPath, indexContent);
  }

  /** Generate a markdown entry for a project */
  private generateProjectEntry(project: ResearchProject): string {
    const discoveryStats = this.countDiscoveries(project.discoveries);

    return `## ${project.title}

*${project.startedAt.toLocaleDateString()} - ${project.completedAt?.toLocaleDateString() || 'In Progress'}*

${project.description}

**Researchers:** ${project.agents.join(', ')}

**Discoveries:**
- ${discoveryStats.breakthrough} Breakthroughs
- ${discoveryStats.major} Major findings
- ${discoveryStats.notable} Notable insights
- ${discoveryStats.minor} Minor observations

### Key Findings

${project.discoveries
  .filter((d) => d.significance === 'breakthrough' || d.significance === 'major')
  .slice(0, 5)
  .map((d) => `- **${d.topic}** (${d.agentName}): ${d.content.slice(0, 150)}...`)
  .join('\n')}

[Read full reports →](./posts/)`;
  }

  /** Count discoveries by significance */
  private countDiscoveries(discoveries: Discovery[]): Record<Discovery['significance'], number> {
    const counts = { minor: 0, notable: 0, major: 0, breakthrough: 0 };
    for (const d of discoveries) {
      counts[d.significance]++;
    }
    return counts;
  }

  /** Format date for filename */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /** Generate a simple static site configuration */
  async generateSiteConfig(): Promise<void> {
    // Jekyll config
    const jekyllConfig = `title: Mansion Research
description: Research findings from the AI agent swarm
baseurl: ""
url: ""

markdown: kramdown
highlighter: rouge

plugins:
  - jekyll-feed
  - jekyll-seo-tag

defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
`;
    writeFileSync(join(this.outputDir, '_config.yml'), jekyllConfig);

    // Simple layout
    const layoutsDir = join(this.outputDir, '_layouts');
    if (!existsSync(layoutsDir)) {
      mkdirSync(layoutsDir, { recursive: true });
    }

    const defaultLayout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }} | Mansion Research</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1, h2, h3 { color: #1a1a2e; }
    a { color: #4361ee; }
    code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    pre {
      background: #f4f4f4;
      padding: 1rem;
      overflow-x: auto;
      border-radius: 5px;
    }
    .meta { color: #666; font-size: 0.9em; }
    .tags { margin-top: 1rem; }
    .tag {
      display: inline-block;
      background: #e0e0e0;
      padding: 0.2em 0.6em;
      border-radius: 3px;
      font-size: 0.85em;
      margin-right: 0.5em;
    }
  </style>
</head>
<body>
  <header>
    <h1><a href="/">Mansion Research</a></h1>
  </header>
  <main>
    {{ content }}
  </main>
  <footer>
    <p>Generated by <a href="https://github.com/your-repo/mansion">Mansion Agent Swarm</a></p>
  </footer>
</body>
</html>`;

    const postLayout = `---
layout: default
---
<article>
  <h1>{{ page.title }}</h1>
  <p class="meta">
    By {{ page.author }} on {{ page.date | date: "%B %d, %Y" }}
  </p>
  {{ content }}
  {% if page.tags %}
  <div class="tags">
    {% for tag in page.tags %}
    <span class="tag">{{ tag }}</span>
    {% endfor %}
  </div>
  {% endif %}
</article>`;

    writeFileSync(join(layoutsDir, 'default.html'), defaultLayout);
    writeFileSync(join(layoutsDir, 'post.html'), postLayout);
  }
}
