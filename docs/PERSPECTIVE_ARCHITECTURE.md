# Perspective Architecture: Resolution × Class

## The Two Dimensions

### Resolution (Zoom Level)
How granular is the perspective's lens? The "Scientist" is actually a family:

```
                    SCIENTIST (archetype)
                         │
         ┌───────────────┼───────────────┐
         │               │               │
      Chemist        Biologist       Physicist
         │               │               │
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │         │     │         │     │         │
  Organic  Polymer  Molecular  Cell   Quantum  Materials
  Chemist  Chemist  Biologist  Bio    Physics  Science
```

**Why this matters:** A Polymer Chemist would read Langer's work completely differently than a Cell Biologist. The Polymer Chemist sees the materials innovation; the Cell Biologist sees whether the released proteins retain function. Same evidence, different salience.

### Class (Social Role)
What institutional position does the perspective occupy?

```
KNOWLEDGE WORKERS          CAPITAL ALLOCATORS         GOVERNANCE
─────────────────          ──────────────────         ──────────
Scientist                  Investor (VC)              Regulator (FDA)
Engineer                   Investor (Angel)           Senator
Entrepreneur               Accountant                 Lawyer
                          Foundation (HHMI)           Ethicist

MAKERS                     TRANSLATORS                USERS
──────                     ───────────                ─────
Sculptor                   Journalist                 Patient
Architect                  Educator                   Clinician
Craftsman                  Curator                    Caregiver
```

**Why this matters:** An FDA Regulator reading about Langer's polymer systems asks "what's the safety profile? what's the approval pathway?" An Investor asks "what's the market size? who's the competition?" Same innovation, completely different frame.

---

## The Rock-Paper-Scissors Web

With more perspectives, we need a richer critique topology. Some possibilities:

### Option 1: Directed Tension Graph

```
                    Regulator
                   ╱         ╲
                  ╱           ╲
                 ▼             ▲
            Entrepreneur ────▶ Scientist
                 ▲             │
                  ╲           ╱
                   ╲         ▼
                    Investor
```

Each arrow means "naturally critiques" (source is skeptical of target):
- Regulator → Entrepreneur: "Where's your safety data?"
- Entrepreneur → Scientist: "You're too slow and cautious"
- Scientist → Investor: "You're chasing hype, not evidence"
- Investor → Regulator: "You're blocking innovation"

### Option 2: Tension Axes

Instead of pairwise relationships, define axes of tension:

```
RIGOR ◄─────────────────────────────────► SPEED
   Scientist, Regulator          Entrepreneur, Investor

THEORY ◄────────────────────────────────► PRACTICE
   Physicist, Philosopher         Engineer, Clinician

INDIVIDUAL ◄────────────────────────────► SYSTEM
   Patient, Artist                Senator, Economist

CAUTION ◄───────────────────────────────► RISK
   Lawyer, Accountant             Founder, Sculptor
```

Perspectives at opposite ends of an axis are natural critics of each other.

### Option 3: Emergent Critique Selection

Don't predefine tensions. Instead, after each thesis:
1. All other perspectives read the thesis
2. Each rates "how much do I want to critique this?" (0-10)
3. Highest-rated perspective delivers antithesis
4. This creates *emergent* rock-paper-scissors based on actual content

### Option 4: Desire-Path Tension Discovery (PREFERRED)

Don't prescribe axes OR pairwise tensions. Instead:

1. **Run dialogues** with perspectives choosing freely who to critique
2. **Observers log** which perspectives actually clashed, on what grounds
3. **Axes emerge** from accumulated observations

```yaml
# tension_log.yaml (accumulated over sessions)

observed_tensions:
  - session: "folkman-years-2024-01-17"
    clash:
      attacker: "Scientist"
      defender: "Entrepreneur"
      axis_claimed: "evidence_quality"
      specific_point: "survivorship bias in contrarian narrative"

  - session: "folkman-years-2024-01-17"
    clash:
      attacker: "Engineer"
      defender: "Scientist"
      axis_claimed: "theory_vs_practice"
      specific_point: "mechanism understanding not required for working system"

  - session: "folkman-years-2024-01-17"
    clash:
      attacker: "Entrepreneur"
      defender: "Engineer"
      axis_claimed: "vision_vs_incrementalism"
      specific_point: "parameter exploration vs paradigm revelation"

# After N sessions, analyze:
emergent_axes:
  - name: "evidence_quality"
    frequent_attackers: ["Scientist", "Regulator"]
    frequent_defenders: ["Entrepreneur", "Investor"]

  - name: "theory_vs_practice"
    frequent_attackers: ["Engineer", "Clinician"]
    frequent_defenders: ["Scientist", "Theorist"]
```

The axes become **discovered through use** rather than prescribed. This is more honest - we're not claiming to know the topology in advance, we're letting it reveal itself through actual intellectual combat.

---

## Memory File Format

Each perspective maintains a memory file that persists across sessions:

```yaml
# perspectives/scientist/memory.yaml

identity:
  name: "The Scientist"
  created: "2024-01-17"
  sessions: 3

core_beliefs:
  - "Evidence quality determines claim strength"
  - "Reproducibility is essential"
  - "Mechanism matters"

updated_beliefs:
  - belief: "Building working systems is itself knowledge creation"
    learned_from: "Engineer critique, Folkman Years session"
    date: "2024-01-17"
    confidence: 0.8

blind_spots_discovered:
  - "Treating demonstration as lesser than explanation"
  - "Implicit hierarchy placing theory over practice"

effective_critiques_received:
  - from: "Engineer"
    point: "Aspirin worked before we knew the mechanism"
    response: "Conceded - phenomenological success is valid"

effective_critiques_delivered:
  - to: "Entrepreneur"
    point: "Survivorship bias in contrarian bet framing"
    response: "Partially accepted - modified to 'increases surface area for luck'"

topics_analyzed:
  - topic: "Folkman Years"
    date: "2024-01-17"
    key_claims:
      - "1976 papers were proof-of-concept, not mechanistic explanation"
      - "Folkman provided theoretical framework, Langer provided engineering"
    confidence_levels:
      attribution_clarity: 0.6
      scientific_significance: 0.9

unresolved_questions:
  - "How do we distinguish paradigm shifts from lucky parameter exploration?"
  - "What's the right attribution model for mega-lab discoveries?"
```

### Memory Operations

```typescript
// Load perspective with memory
const scientist = await Perspective.load('scientist');

// After a session, update memory
scientist.memory.addUpdatedBelief({
  belief: "Building is knowledge creation",
  learnedFrom: "Engineer critique",
  confidence: 0.8
});

// Memory influences future outputs
// When writing thesis, perspective references prior learnings
const thesis = await scientist.writeThesis(topic, {
  incorporatePriorLearnings: true
});
```

---

## Bluesky Dialogue Protocol

The vision: **Turn-based argumentation with reactions**

### Phase 1: Opening Statements (Thesis Posts)

```
@scientist.bsky.social [1/3]
On the Folkman Years: The 1976 papers demonstrated that
macromolecule delivery through polymers was possible—contradicting
the theoretical consensus. But "possible" ≠ "understood."
The mechanism remained opaque for years.

@engineer.bsky.social [1/3]
On the Folkman Years: Langer's insight was reframing the problem.
Everyone asked "how do molecules diffuse through dense polymer?"
He asked "what if the polymer weren't dense?" Constraint as
design parameter. That's engineering thinking.

@entrepreneur.bsky.social [1/3]
On the Folkman Years: Twenty oil company rejections. Joins a
surgeon whose cancer hypothesis the establishment rejected.
This is contrarian conviction. The upside of being right:
transforming medicine. Asymmetric bet.
```

### Phase 2: Reactions (Quote-Post Critiques)

```
@scientist.bsky.social [quoting @entrepreneur]
"Contrarian conviction" or survivorship bias? For every
Langer who bet on Folkman, how many bet on rejected
visionaries who were just *wrong*? We don't know their names.
Source needed: base rate of contrarian-joins-rejected-lab outcomes.

@engineer.bsky.social [quoting @scientist]
"Mechanism remained opaque" — so what? Aspirin worked for
millennia before prostaglandin pathway was understood.
The question isn't "do we understand it?" but "does it work?"
Engineering delivers. Analysis is commentary.

@entrepreneur.bsky.social [quoting @engineer]
"Constraint as design parameter" — you're describing
exploration in a known space. Langer revealed the SPACE EXISTS.
That's not optimization. That's paradigm creation.
Different category of contribution.
```

### Phase 3: Source Fights (The Good Stuff)

```
@scientist.bsky.social [replying to @entrepreneur]
You claim "paradigm creation" — cite your source for Langer
having that intent in 1974. The papers suggest he was
trying to solve a specific problem, not create a platform.
Post-hoc rationalization ≠ original vision.

@entrepreneur.bsky.social [replying to @scientist]
Intent ≠ outcome. Whether he *intended* platform is irrelevant.
He *created* platform. The "vision" is in the structure of
what was built, not the psychology of the builder.
See: Emergent vs. Designed platforms (cite: Parker & Van Alstyne)

@engineer.bsky.social [replying to both]
You're both missing the point. The question isn't intent OR
outcome. It's: was this *reproducible*? Can someone else
follow this path? That's what matters for learning from it.
```

### Phase 4: Synthesis Threads

After N rounds of reactions, each perspective synthesizes:

```
@scientist.bsky.social [synthesis thread 1/4]
What I learned from this exchange:

1. @engineer is right that "mechanism first" is a bias,
not a requirement. Phenomenological success is valid knowledge.

2. But @entrepreneur's "platform intent" claim remains
unsourced. Modified position: Langer created platform
*capabilities*, whether or not that was the intent.

[2/4] What survives critique...
[3/4] What I now believe...
[4/4] Open questions remaining...
```

### Implementation Structure

```typescript
interface BlueskyDialogue {
  topic: string;
  perspectives: Perspective[];
  phases: {
    opening: Post[];           // Each perspective's thesis
    reactions: QuotePost[];    // Cross-perspective critiques
    sourceFights: Thread[];    // Demand for evidence, rebuttals
    synthesis: Thread[];       // Final position after exchange
  };
  rules: {
    maxPostsPerPhase: number;
    requireSourcesAfterRound: number;  // After round N, must cite
    synthesisRequired: boolean;
  };
}

// The dialogue loop
async function runDialogue(topic: string, perspectives: Perspective[]) {
  // Phase 1: Everyone posts thesis
  const theses = await Promise.all(
    perspectives.map(p => p.postThesis(topic))
  );

  // Phase 2: Each reacts to their natural counter
  for (const perspective of perspectives) {
    const target = perspective.getNaturalCounter(perspectives);
    const targetThesis = theses.find(t => t.author === target.name);
    await perspective.postCritique(targetThesis);
  }

  // Phase 3: Source fights (reactive, based on what's posted)
  // This is where it gets interesting - perspectives respond to
  // challenges by finding/citing sources

  // Phase 4: Synthesis
  const syntheses = await Promise.all(
    perspectives.map(p => p.synthesize())
  );

  // Update memory files with learnings
  await Promise.all(
    perspectives.map(p => p.updateMemory())
  );
}
```

---

## Next Steps to Implement

### 1. Define Initial Perspective Set
Start with a manageable web (maybe 5-6 perspectives):
- Scientist (resolution: general)
- Engineer
- Entrepreneur
- Regulator
- Investor
- Patient/Clinician

Define the tension graph between them.

### 2. Create Memory Schema
Implement the YAML memory format and load/save operations.

### 3. Build Dialogue Loop
- Thesis posting
- Reaction selection (who critiques whom)
- Quote-post mechanics
- Source citation requirements
- Synthesis generation

### 4. Test Locally First
Mock Bluesky server to test the full dialogue flow before going live.

### 5. First Live Dialogue
Pick a focused topic (e.g., "Should Langer have joined Folkman?") and run a real dialogue on Bluesky.

---

## Open Design Questions

1. **How many perspectives before it becomes noise?** 3 feels focused, 9 might be too many voices.

2. **Should resolution and class be combined?** "Polymer Chemist who is also an Investor" — or keep dimensions separate?

3. **How do we handle agreement?** If Scientist and Engineer actually agree on something, is that signal or collapse of useful tension?

4. **When does a perspective "win"?** Can we score whose synthesis is most compelling? Or is that against the spirit?

5. **Can perspectives die?** If a perspective is consistently outargued, should it update so much it becomes a different perspective?
