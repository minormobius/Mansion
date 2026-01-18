# Mansion Agent Swarm Architecture

## Overview

Mansion is a social media agent swarm that maintains **living research portfolios**. Articles are not static publications—they're continuously updated documents governed by agents that monitor sources, identify gaps, and inject new information while maintaining sourcing standards.

## The Digestion Loop

```
PORTFOLIO ──────────────────────────────────────────┐
    │                                                │
    │ Generates:                                     │
    │ • Open questions                               │
    │ • Extension opportunities                      │
    │ • Stale claims needing verification            │
    │ • Cross-article synthesis opportunities        │
    │                                                │
    ▼                                                │
SOURCE SCOUTS (directed search)                      │
    │                                                │
    │ Monitors:                                      │
    │ • arXiv (cs.AI, q-bio, cs.SE)                 │
    │ • Substacks (Simon Willison, Addy Osmani...)  │
    │ • Bluesky firehose (filtered)                 │
    │ • SEC EDGAR (funding rounds)                  │
    │ • PubMed / bioRxiv                            │
    │ • Company blogs (Anthropic, OpenAI, etc)      │
    │                                                │
    ▼                                                │
RELEVANCE FILTER + SYNTHESIS                         │
    │                                                │
    │ • Matches sources to portfolio questions       │
    │ • Identifies cross-article patterns            │
    │ • Flags contradictions with existing claims    │
    │                                                │
    ▼                                                │
UPDATER AGENTS                                       │
    │                                                │
    │ • Injects new data maintaining dialect style   │
    │ • Preserves inline sourcing standards          │
    │ • Updates "last modified" + changelog          │
    │ • May spawn new deep dives if warranted        │
    │                                                │
    └───────────────────────────────────────────────┘
```

## Portfolios

### 1. Biotech Portfolio

**Articles:**
- `biotech-funding.html` - 30 discoveries, funding mechanisms
- `upenn-gene-therapy.html` - Penn's gene therapy empire
- `carl-june.html` - CAR-T pioneer biography

**Open Questions:**
- What's the current state of CAR-T pricing post-Novartis renegotiation?
- Have any of the 20 FDA 510(k) devices we listed had adverse event reports?
- Is the "valley of death" funding gap narrowing or widening?
- What happened to the Gelsinger family's advocacy work?
- Are there new CRISPR therapeutics approaching approval?

**Extension Opportunities:**
- Jennifer Doudna / CRISPR deep dive (natural pair with June)
- Moderna's pivot post-COVID
- The biotech VC shakeout of 2025
- FDA AI/ML device guidance evolution

**Stale Risk:**
- FDA 510(k) list will age quickly
- Funding round data from late 2025

**Source Scouts Should Monitor:**
- FDA 510(k) database weekly
- SEC EDGAR for biotech S-1s and funding rounds
- STAT News, Endpoints News RSS
- bioRxiv gene therapy preprints
- ClinicalTrials.gov CAR-T registrations

---

### 2. Agents Portfolio

**Articles:**
- `coding-agents.html` - The Coding Agent Wars
- `benchmark-problem.html` - AI benchmark limitations

**Open Questions:**
- What happens to the junior developer pipeline? (flagged in synthesis)
- Has anyone replicated or refuted the METR 19% slowdown finding?
- What's Cursor's enterprise retention looking like?
- Is MCP actually becoming a standard or just Anthropic's thing?
- How are security teams responding to 42% AI-generated code?

**Extension Opportunities:**
- The orchestration framework wars (LangChain vs CrewAI vs AutoGen)
- MCP deep dive - the protocol layer
- "Vibe coding" one year later - what actually happened?
- The junior developer crisis (if employment data confirms trend)
- AI coding security incidents (when they start happening)

**Stale Risk:**
- Benchmark numbers (weeks, not months)
- Valuation figures (funding rounds)
- Model capabilities (Opus 4.5 already outdated some claims)

**Source Scouts Should Monitor:**
- Anthropic, OpenAI, Cursor engineering blogs
- Simon Willison's blog (near real-time LLM coverage)
- Substack: Addy Osmani, Swyx, Lenny's Newsletter
- arXiv cs.SE, cs.AI for benchmark papers
- Hacker News front page (community signal)
- GitHub trending (tool adoption signals)
- METR publications

---

## Article Freshness Protocol

Each article maintains:

```html
<meta name="mansion:last-updated" content="2026-01-18">
<meta name="mansion:portfolio" content="agents">
<meta name="mansion:staleness-risk" content="high">
```

Changelog in footer:
```html
<details class="changelog">
  <summary>Version History</summary>
  <ul>
    <li><strong>Jan 18, 2026:</strong> Added Moving Target section, updated to Opus 4.5 benchmarks</li>
    <li><strong>Jan 17, 2026:</strong> Initial publication</li>
  </ul>
</details>
```

## Bluesky Integration

The swarm publishes to Bluesky when:
1. New deep dive created
2. Significant update to existing article (not typo fixes)
3. Cross-portfolio synthesis discovered

Post format:
```
New finding in [Portfolio]: [One-line summary]

[Key stat or quote]

Deep dive: [link]

Sources: [primary source links]
```

## Implementation Status

- [x] Manual article creation with dialectical methodology
- [x] Inline sourcing protocol
- [x] Portfolio definition (this document)
- [ ] Source scout automation
- [ ] Relevance filtering
- [ ] Automated freshness tracking
- [ ] Bluesky posting integration
- [ ] Changelog generation

## Running the Loop (Manual Mode)

Until automation is built, the loop runs manually:

1. **Review portfolio questions** (this document)
2. **Scout sources** (web search for each question)
3. **Filter for relevance** (does this answer a question or extend the work?)
4. **Update articles** (maintain sourcing standards)
5. **Update this document** (new questions, completed extensions)
6. **Commit + push**

The human operator acts as the orchestration layer until agents take over.
