# Source Linking Protocol

## The Problem

Current state: Sources are listed as text strings
```html
<div class="sources">Sources: MIT Technology Licensing Office, Harvard Stem Cell Institute, NIH Reporter</div>
```

Required state: Sources are hyperlinked and verifiable
```html
<p>Moderna was founded in 2010 based on mRNA research from
<a href="https://hsci.harvard.edu/people/derrick-rossi-phd">Derrick Rossi's lab at Harvard</a>
and technology <a href="https://tlo.mit.edu/technologies/mrna-therapeutics">licensed from MIT</a>.
The foundational IP came from work funded by
<a href="https://reporter.nih.gov/search/...">NIH grants on modified mRNA</a>.</p>
```

## Source Types & Where to Find Them

### Academic/Institutional
| Source Type | Where to Link |
|-------------|---------------|
| NIH grants | reporter.nih.gov/search |
| NSF grants | nsf.gov/awardsearch |
| University tech transfer | [university].edu/technology-licensing |
| Lab pages | [university].edu/[department]/[pi-name] |
| HHMI investigators | hhmi.org/scientists |

### Publications
| Source Type | Where to Link |
|-------------|---------------|
| Journal papers | doi.org/[DOI] |
| PubMed | pubmed.ncbi.nlm.nih.gov/[PMID] |
| Preprints | biorxiv.org, arxiv.org |

### Companies & Financials
| Source Type | Where to Link |
|-------------|---------------|
| SEC filings | sec.gov/cgi-bin/browse-edgar |
| Company history | [company].com/about |
| Crunchbase | crunchbase.com/organization/[company] |
| PitchBook | pitchbook.com (paywalled) |

### Patents
| Source Type | Where to Link |
|-------------|---------------|
| US Patents | patents.google.com, uspto.gov |
| Patent families | lens.org |

### News & Analysis
| Source Type | Where to Link |
|-------------|---------------|
| BioCentury | biocentury.com (paywalled) |
| STAT News | statnews.com |
| Endpoints News | endpts.com |
| FierceBiotech | fiercebiotech.com |

---

## Discovery Schema with Sources

Updated schema for discoveries:

```json
{
  "id": 1,
  "topic": "Moderna's MIT Origins",
  "content": "Moderna was founded in 2010 based on mRNA research from Derrick Rossi's lab at Harvard and technology licensed from MIT.",
  "content_with_links": "Moderna was founded in 2010 based on mRNA research from <a href='https://hsci.harvard.edu/people/derrick-rossi-phd'>Derrick Rossi's lab</a> at Harvard and technology <a href='https://tlo.mit.edu/technologies/mrna-therapeutics'>licensed from MIT</a>.",
  "sources": [
    {
      "name": "Derrick Rossi, Harvard Stem Cell Institute",
      "url": "https://hsci.harvard.edu/people/derrick-rossi-phd",
      "type": "institutional",
      "accessed": "2024-01-17",
      "archived": "https://web.archive.org/web/..."
    },
    {
      "name": "MIT Technology Licensing Office - mRNA",
      "url": "https://tlo.mit.edu/technologies/mrna-therapeutics",
      "type": "institutional",
      "accessed": "2024-01-17"
    },
    {
      "name": "NIH Grant R01GM123456",
      "url": "https://reporter.nih.gov/search/...",
      "type": "grant",
      "accessed": "2024-01-17"
    }
  ],
  "claims": [
    {
      "claim": "Founded in 2010",
      "supported_by": ["SEC S-1 filing"],
      "confidence": "high"
    },
    {
      "claim": "mRNA research from Rossi lab",
      "supported_by": ["Rossi publications", "Moderna founding documents"],
      "confidence": "high"
    }
  ],
  "significance": "breakthrough",
  "post": "Moderna's origin story..."
}
```

---

## Inline Citation Format

For the HTML output, use superscript links:

```html
<p>Moderna was founded in 2010<sup><a href="#src-1">[1]</a></sup> based on mRNA research
from Derrick Rossi's lab<sup><a href="#src-2">[2]</a></sup> at Harvard...</p>

<!-- At bottom of article -->
<h3>Sources</h3>
<ol class="sources">
  <li id="src-1"><a href="https://www.sec.gov/...">Moderna S-1 Filing</a>, SEC, 2018</li>
  <li id="src-2"><a href="https://hsci.harvard.edu/...">Derrick Rossi</a>, Harvard Stem Cell Institute</li>
</ol>
```

---

## Source Verification Workflow

When generating content:

1. **Claim identification**: What specific claims are being made?
2. **Source search**: For each claim, find primary source
3. **URL capture**: Get permanent/stable URLs (prefer DOIs, .gov, .edu)
4. **Archive**: Submit to Internet Archive for permanence
5. **Inline linking**: Insert links at point of claim
6. **Footnote collection**: Aggregate at article end

For Bluesky posts (300 char limit):
- Link to the full article with sources
- Or use link cards with source preview

---

## Priority Sources to Add

For the existing Langer/Folkman content:

### Must have (verifiable claims):
1. Langer's 1976 Science paper: `doi.org/10.1126/science.1005582`
2. Langer's 1976 Nature paper: `doi.org/10.1038/263797a0`
3. MIT Langer Lab page: `langerlab.mit.edu`
4. Moderna S-1 filing: SEC EDGAR
5. Folkman's angiogenesis papers: PubMed

### Should have (context):
1. Langer patent portfolio: Google Patents search
2. NIH grant history: NIH Reporter
3. Company acquisitions: Crunchbase/press releases
4. Award citations: Lemelson-MIT, National Medals

### Nice to have (depth):
1. Oral histories: Science History Institute
2. Interviews: Academy of Achievement
3. Biographical profiles: MIT News, Forbes

---

## Implementation Plan

1. **Create source database** (`sources.json`) with verified URLs
2. **Map claims to sources** in discoveries.json
3. **Generate linked HTML** from enriched data
4. **Add footnote sections** to all articles
5. **For Bluesky**: Include source links in reply threads
