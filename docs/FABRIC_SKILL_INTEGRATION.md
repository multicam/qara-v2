# Qara v2: Fabric Skill Integration

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Future Integration (Phase 5)  
**Priority:** Medium

---

## Overview

This document analyzes integrating [Fabric](https://github.com/danielmiessler/fabric) patterns with Qara v2's BAML architecture. Fabric provides well-crafted prompt templates; BAML provides type-safe structured outputs. Combined, they offer the best of both worlds.

### What is Fabric?

Fabric is a framework for augmenting humans with AI, providing:
- **Patterns** - Reusable prompt templates (summarize, extract_wisdom, analyze_claims, etc.)
- **Stitches** - Chained patterns for complex workflows
- **CLI** - `fabric --pattern summarize < input.txt`

### The Integration Opportunity

| Fabric Provides | BAML Provides | Combined Value |
|-----------------|---------------|----------------|
| Expert prompts | Type-safe outputs | Expert prompts → Structured data |
| Text output | JSON/objects | Fabric wisdom + BAML structure |
| CLI-focused | API-focused | Both interfaces |
| Single model | Multi-model | Fabric patterns on any LLM |

---

## Architecture

### Hybrid Approach

```
┌─────────────────────────────────────────────────────────────┐
│  Fabric Skill                                               │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Curated Patterns│  │ Dynamic Patterns│                  │
│  │ (Typed BAML)    │  │ (Generic BAML)  │                  │
│  │                 │  │                 │                  │
│  │ - summarize     │  │ - any pattern   │                  │
│  │ - extract_wisdom│  │ - user patterns │                  │
│  │ - analyze_claims│  │                 │                  │
│  └─────────────────┘  └─────────────────┘                  │
│           │                    │                            │
│           └────────┬───────────┘                            │
│                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  FabricOrchestrator                                     ││
│  │  - Pattern selection                                    ││
│  │  - Output formatting                                    ││
│  │  - Stitching (chained patterns)                        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Strategy

1. **Curate 10-15 high-value patterns** with typed BAML outputs
2. **Support dynamic execution** for the long tail (~100+ patterns)
3. **Add stitching** for complex workflows
4. **Don't type everything** - some patterns are better as raw text

---

## BAML Types

### Core Types (`baml_src/skills/fabric/types.baml`)

```baml
// Generic output for dynamic patterns
class FabricOutput {
  raw_output string @description("Raw pattern output")
  sections map<string, string> @description("Parsed sections if available")
}

// Typed outputs for curated patterns
class Summary {
  one_sentence string
  main_points string[]
  takeaways string[]
}

class WisdomExtraction {
  ideas string[] @description("Key ideas extracted")
  insights string[] @description("Non-obvious insights")
  quotes string[] @description("Notable quotes")
  habits string[] @description("Recommended habits")
  facts string[] @description("Interesting facts")
  recommendations string[] @description("Actionable recommendations")
}

class ClaimAnalysis {
  claims Claim[]
  overall_credibility string @description("HIGH|MEDIUM|LOW|UNVERIFIABLE")
  red_flags string[]
}

class Claim {
  claim string
  evidence_quality string @description("STRONG|MODERATE|WEAK|NONE")
  verdict string @description("SUPPORTED|PARTIALLY_SUPPORTED|UNSUPPORTED|FALSE")
  reasoning string
}

class ContentRating {
  quality_score int @description("0-100")
  novelty_score int @description("0-100")
  actionability_score int @description("0-100")
  recommendation string @description("MUST_READ|WORTH_READING|SKIP")
  one_sentence_review string
}
```

---

## BAML Functions

### Curated Patterns (`baml_src/skills/fabric/patterns.baml`)

```baml
function FabricSummarize(content: string) -> Summary {
  client GPT4o
  prompt #"
    # IDENTITY and PURPOSE
    You are an expert content summarizer. You take content in and output a 
    Markdown formatted summary using the format below.
    
    # STEPS
    1. Take a deep breath and think step by step about how to best accomplish this goal.
    2. Read the entire content carefully.
    3. Identify the single most important theme or idea.
    4. Extract 5-15 main points that support the theme.
    5. Identify 3-5 actionable takeaways.
    
    # OUTPUT INSTRUCTIONS
    - Output in the exact JSON format specified
    - Main points should be concise (under 20 words each)
    - Takeaways should be actionable and specific
    
    # INPUT
    {{ content }}
    
    {{ ctx.output_format }}
  "#
}

function FabricExtractWisdom(content: string) -> WisdomExtraction {
  client GPT4o
  prompt #"
    # IDENTITY and PURPOSE
    You extract surprising, insightful, and interesting information from text content.
    
    # STEPS
    1. Extract all IDEAS presented in the content
    2. Extract all INSIGHTS (non-obvious conclusions)
    3. Extract all memorable QUOTES (verbatim)
    4. Extract all HABITS mentioned or recommended
    5. Extract all FACTS (verifiable claims)
    6. Extract all RECOMMENDATIONS for action
    
    # OUTPUT INSTRUCTIONS
    - Each item should be a complete, standalone statement
    - Quotes must be exact from the source
    - Limit each category to 10 items maximum
    - Prioritize novelty and actionability
    
    # INPUT
    {{ content }}
    
    {{ ctx.output_format }}
  "#
}

function FabricAnalyzeClaims(content: string) -> ClaimAnalysis {
  client Claude
  prompt #"
    # IDENTITY and PURPOSE
    You are an expert fact-checker and critical thinker. You analyze content 
    for claims and assess their validity.
    
    # STEPS
    1. Identify all factual claims made in the content
    2. For each claim, assess the evidence quality
    3. Determine if the claim is supported, partially supported, unsupported, or false
    4. Explain your reasoning
    5. Identify any red flags (logical fallacies, missing context, etc.)
    6. Provide overall credibility assessment
    
    # OUTPUT INSTRUCTIONS
    - Be rigorous but fair
    - Distinguish between facts, opinions, and speculation
    - Note when claims cannot be verified
    
    # INPUT
    {{ content }}
    
    {{ ctx.output_format }}
  "#
}

function FabricRateContent(content: string) -> ContentRating {
  client GPT4oMini
  prompt #"
    # IDENTITY and PURPOSE
    You rate content quality to help people decide what to read.
    
    # SCORING CRITERIA
    - Quality (0-100): Writing quality, depth, accuracy
    - Novelty (0-100): New ideas, unique perspective
    - Actionability (0-100): Practical, implementable advice
    
    # RECOMMENDATION THRESHOLDS
    - MUST_READ: Average score > 80
    - WORTH_READING: Average score 50-80
    - SKIP: Average score < 50
    
    # INPUT
    {{ content }}
    
    {{ ctx.output_format }}
  "#
}
```

### Dynamic Pattern Executor

```baml
class DynamicPatternRequest {
  pattern_name string
  system_prompt string
  content string
}

function FabricExecutePattern(req: DynamicPatternRequest) -> FabricOutput {
  client GPT4o
  prompt #"
    {{ req.system_prompt }}
    
    # INPUT
    {{ req.content }}
    
    Provide your response. If the pattern specifies sections, use markdown headers.
  "#
}
```

---

## TypeScript Orchestrator

### Pattern Loader (`src/skills/fabric/loader.ts`)

```typescript
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const FABRIC_PATH = process.env.FABRIC_PATTERNS_PATH || 
  join(process.env.HOME!, '.config/fabric/patterns');

export function loadPattern(name: string): string {
  const path = join(FABRIC_PATH, name, 'system.md');
  if (!existsSync(path)) {
    throw new Error(`Pattern not found: ${name}`);
  }
  return readFileSync(path, 'utf-8');
}

export function listPatterns(): string[] {
  if (!existsSync(FABRIC_PATH)) return [];
  return readdirSync(FABRIC_PATH).filter(f => 
    existsSync(join(FABRIC_PATH, f, 'system.md'))
  );
}

export function patternExists(name: string): boolean {
  return existsSync(join(FABRIC_PATH, name, 'system.md'));
}
```

### Orchestrator (`src/skills/fabric/orchestrator.ts`)

```typescript
import { b } from '../../baml_client';
import { loadPattern, listPatterns, patternExists } from './loader';

// Patterns with typed BAML outputs
const TYPED_PATTERNS = new Map([
  ['summarize', 'FabricSummarize'],
  ['extract_wisdom', 'FabricExtractWisdom'],
  ['analyze_claims', 'FabricAnalyzeClaims'],
  ['rate_content', 'FabricRateContent'],
]);

export interface FabricOptions {
  verbose?: boolean;
}

export class FabricOrchestrator {
  
  /**
   * Execute a Fabric pattern
   */
  async execute(patternName: string, content: string, options?: FabricOptions): Promise<unknown> {
    if (options?.verbose) {
      console.log(`[fabric] Executing pattern: ${patternName}`);
    }

    // Use typed BAML function if available
    if (TYPED_PATTERNS.has(patternName)) {
      return this.executeTyped(patternName, content);
    }
    
    // Fall back to dynamic execution
    return this.executeDynamic(patternName, content);
  }

  /**
   * Execute typed pattern with structured output
   */
  private async executeTyped(pattern: string, content: string) {
    switch (pattern) {
      case 'summarize':
        return b.FabricSummarize(content);
      case 'extract_wisdom':
        return b.FabricExtractWisdom(content);
      case 'analyze_claims':
        return b.FabricAnalyzeClaims(content);
      case 'rate_content':
        return b.FabricRateContent(content);
      default:
        throw new Error(`Unknown typed pattern: ${pattern}`);
    }
  }

  /**
   * Execute dynamic pattern with generic output
   */
  private async executeDynamic(pattern: string, content: string) {
    const systemPrompt = loadPattern(pattern);
    
    return b.FabricExecutePattern({
      pattern_name: pattern,
      system_prompt: systemPrompt,
      content
    });
  }

  /**
   * Chain multiple patterns (stitching)
   */
  async stitch(patterns: string[], content: string): Promise<unknown[]> {
    const results: unknown[] = [];
    let currentContent = content;

    for (const pattern of patterns) {
      const result = await this.execute(pattern, currentContent);
      results.push(result);
      
      // Use output as input for next pattern
      currentContent = typeof result === 'string' 
        ? result 
        : JSON.stringify(result);
    }

    return results;
  }

  /**
   * List all available patterns
   */
  listPatterns(): { typed: string[]; dynamic: string[] } {
    const allPatterns = listPatterns();
    const typed = [...TYPED_PATTERNS.keys()];
    const dynamic = allPatterns.filter(p => !TYPED_PATTERNS.has(p));
    
    return { typed, dynamic };
  }

  /**
   * Check if pattern exists
   */
  hasPattern(name: string): boolean {
    return TYPED_PATTERNS.has(name) || patternExists(name);
  }
}

export function createFabricOrchestrator(): FabricOrchestrator {
  return new FabricOrchestrator();
}
```

---

## Skill Registry

```typescript
// Add to src/skills/registry.ts

// Fabric patterns as individual skills
{
  id: 'fabric-summarize',
  name: 'Summarize Content',
  description: 'Summarize content using Fabric summarize pattern',
  triggers: ['summarize', 'summary', 'tldr', 'summarize this'],
  bamlFunction: 'FabricSummarize'
},
{
  id: 'fabric-wisdom',
  name: 'Extract Wisdom',
  description: 'Extract ideas, insights, quotes, and recommendations',
  triggers: ['extract wisdom', 'wisdom', 'insights', 'key ideas'],
  bamlFunction: 'FabricExtractWisdom'
},
{
  id: 'fabric-claims',
  name: 'Analyze Claims',
  description: 'Fact-check and analyze claims in content',
  triggers: ['analyze claims', 'fact check', 'verify claims'],
  bamlFunction: 'FabricAnalyzeClaims'
},
{
  id: 'fabric-rate',
  name: 'Rate Content',
  description: 'Rate content quality, novelty, and actionability',
  triggers: ['rate content', 'rate this', 'is this worth reading'],
  bamlFunction: 'FabricRateContent'
},
// Generic fabric pattern executor
{
  id: 'fabric',
  name: 'Fabric Pattern',
  description: 'Execute any Fabric pattern by name',
  triggers: ['fabric', 'use pattern', 'run pattern'],
  bamlFunction: 'FabricExecutePattern'
}
```

---

## Pattern Classification

### Patterns to Type (Structured Output)

| Pattern | Output Type | Why Type It |
|---------|-------------|-------------|
| `summarize` | `Summary` | Universal, clear structure |
| `extract_wisdom` | `WisdomExtraction` | High value, defined sections |
| `analyze_claims` | `ClaimAnalysis` | Structured analysis |
| `rate_content` | `ContentRating` | Numeric scores |
| `create_summary` | `Summary` | Similar to summarize |
| `extract_ideas` | `string[]` | List output |
| `analyze_paper` | `PaperAnalysis` | Academic structure |
| `analyze_threat` | `ThreatAnalysis` | Security structure |

### Patterns to Keep Dynamic (Free-form)

| Pattern | Why Keep Dynamic |
|---------|------------------|
| `write_essay` | Free-form text output |
| `improve_writing` | Text transformation |
| `create_art_prompt` | Creative, unstructured |
| `write_micro_essay` | Short-form text |
| `create_keynote` | Presentation text |
| Custom user patterns | Unknown structure |

---

## Usage Examples

### CLI Usage

```bash
# Typed patterns
qara "summarize this article" < article.txt
qara "extract wisdom from this podcast" < transcript.txt
qara "analyze claims in this report" < report.txt

# Dynamic patterns
qara "fabric create_art_prompt" < description.txt
qara "fabric improve_writing" < draft.txt

# Stitching
qara "fabric stitch summarize,extract_wisdom" < content.txt
```

### Programmatic Usage

```typescript
import { createFabricOrchestrator } from './skills/fabric/orchestrator';

const fabric = createFabricOrchestrator();

// Typed pattern (returns Summary)
const summary = await fabric.execute('summarize', articleText);
console.log(summary.one_sentence);
console.log(summary.main_points);

// Dynamic pattern (returns FabricOutput)
const artPrompt = await fabric.execute('create_art_prompt', description);
console.log(artPrompt.raw_output);

// Stitching
const results = await fabric.stitch(
  ['summarize', 'extract_wisdom', 'rate_content'],
  longArticle
);
```

---

## File Structure

```
baml_src/
└── skills/
    └── fabric/
        ├── types.baml           # Output types
        ├── patterns.baml        # Curated typed patterns
        └── dynamic.baml         # Dynamic executor

src/
└── skills/
    └── fabric/
        ├── loader.ts            # Pattern file loader
        └── orchestrator.ts      # FabricOrchestrator
```

---

## Implementation Checklist

### Prerequisites
- [ ] Fabric installed (`go install github.com/danielmiessler/fabric@latest`)
- [ ] Patterns synced (`fabric --updatepatterns`)
- [ ] Phase 1 & 2 complete (router, runtime, BAML setup)

### BAML Implementation
- [ ] Create `baml_src/skills/fabric/types.baml`
- [ ] Create `baml_src/skills/fabric/patterns.baml`
- [ ] Create `baml_src/skills/fabric/dynamic.baml`
- [ ] Run `baml-cli generate`
- [ ] Test patterns in BAML playground

### TypeScript Implementation
- [ ] Create `src/skills/fabric/loader.ts`
- [ ] Create `src/skills/fabric/orchestrator.ts`
- [ ] Add fabric skills to registry
- [ ] Test typed patterns
- [ ] Test dynamic patterns
- [ ] Test stitching

### Integration
- [ ] Add CLI support for fabric commands
- [ ] Document available patterns
- [ ] Add to Qara View events (optional)

---

## Dependencies

```bash
# Fabric CLI (required for dynamic patterns)
go install github.com/danielmiessler/fabric@latest
fabric --setup

# Sync patterns
fabric --updatepatterns
```

### Environment Variables

```bash
# Optional: Custom patterns path
FABRIC_PATTERNS_PATH=~/.config/fabric/patterns
```

---

## Considerations

### Pros
- ✅ Leverages Fabric's excellent prompt engineering
- ✅ Adds type safety Fabric lacks
- ✅ Multi-LLM support (use Claude for analysis, GPT for creativity)
- ✅ Integrates with Qara ecosystem (routing, observability)
- ✅ Stitching enables complex workflows

### Cons
- ⚠️ Dependency on Fabric installation for dynamic patterns
- ⚠️ Patterns may drift from upstream
- ⚠️ Not all patterns fit structured output
- ⚠️ Additional maintenance burden

### Mitigations
- Curate only high-value patterns for typing
- Use dynamic execution as fallback
- Document which patterns are typed vs dynamic
- Consider pattern version pinning

---

## Future Enhancements

1. **Pattern Compiler** - Auto-generate BAML from Fabric patterns
2. **Pattern Versioning** - Pin specific pattern versions
3. **Custom Patterns** - Support user-defined patterns
4. **Pattern Metrics** - Track usage and quality per pattern
5. **Pattern Recommendations** - Suggest patterns based on content

---

## Related Documents

- [IMPLEMENTATION_INDEX.md](./IMPLEMENTATION_INDEX.md) - Master implementation guide
- [RESEARCH_SKILL_OVERVIEW.md](./RESEARCH_SKILL_OVERVIEW.md) - Similar orchestrator pattern
- [ROUTER_CLI_IMPLEMENTATION.md](./ROUTER_CLI_IMPLEMENTATION.md) - Skill registry integration

---

**Document Version:** 1.0  
**Created:** December 3, 2025  
**Status:** Future Integration (after Phase 2)
