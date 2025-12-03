# Qara v2: Research Skill - TypeScript Implementation

**Date:** December 3, 2025  
**Version:** 1.0  
**Related:** [RESEARCH_SKILL_OVERVIEW.md](./RESEARCH_SKILL_OVERVIEW.md)

---

## Research Orchestrator

### Main Orchestrator (`src/skills/research/orchestrator.ts`)

```typescript
import { b } from '../../baml_client';
import type {
  ValidationRequest,
  ValidationResult,
  DecompositionRequest,
  DecompositionResult,
  ResearchRequest,
  ResearchResult,
  FactCheckRequest,
  FactCheckResponse,
  SynthesisRequest,
  SynthesisResult,
  SubQuery
} from '../../baml_client/types';

export interface ResearchOptions {
  depth: 1 | 2 | 3 | 4;
  outputFormat: 'executive' | 'full' | 'bullets' | 'table';
  skipValidation?: boolean;
  skipFactCheck?: boolean;
  verbose?: boolean;
  onProgress?: (phase: string, message: string) => void;
}

export class ResearchOrchestrator {
  private log(options: ResearchOptions, phase: string, message: string): void {
    if (options.verbose) {
      console.log(`[research:${phase}] ${message}`);
    }
    options.onProgress?.(phase, message);
  }

  async execute(query: string, options: ResearchOptions): Promise<SynthesisResult> {
    const startTime = performance.now();
    this.log(options, 'start', `Starting ${this.depthName(options.depth)} research`);

    // Phase 1: Validation
    let validation: ValidationResult;
    if (!options.skipValidation) {
      this.log(options, 'validate', 'Validating scope...');
      validation = await b.ValidateResearchScope({ query });
      
      if (validation.clarification_needed?.length) {
        this.log(options, 'validate', `Clarification: ${validation.clarification_needed.join(', ')}`);
      }
    } else {
      validation = this.defaultValidation(query);
    }

    // Phase 2: Decomposition
    this.log(options, 'decompose', 'Decomposing query...');
    const decomposition = await b.DecomposeQuery({
      query,
      depth: options.depth,
      validation
    });
    this.log(options, 'decompose', `Generated ${this.countQueries(decomposition)} sub-queries`);

    // Phase 3: Parallel Research
    this.log(options, 'research', 'Executing parallel research...');
    const researchResults = await this.executeParallel(decomposition, options);
    this.log(options, 'research', `Completed ${researchResults.length} streams`);

    // Phase 4: Fact-Checking
    let factCheck: FactCheckResponse | undefined;
    if (!options.skipFactCheck && options.depth >= 2) {
      this.log(options, 'factcheck', 'Fact-checking claims...');
      const claims = this.extractClaims(researchResults);
      if (claims.length > 0) {
        factCheck = await b.FactCheckClaims({ claims, context: query });
        this.log(options, 'factcheck', `Verified ${factCheck.results.length} claims`);
      }
    }

    // Phase 5: Synthesis
    this.log(options, 'synthesize', 'Synthesizing results...');
    const synthesis = await b.SynthesizeFindings({
      original_query: query,
      research_results: researchResults,
      fact_check: factCheck,
      output_format: options.outputFormat
    });

    const duration = performance.now() - startTime;
    this.log(options, 'complete', `Done in ${(duration / 1000).toFixed(1)}s`);

    return synthesis;
  }

  private async executeParallel(
    decomposition: DecompositionResult,
    options: ResearchOptions
  ): Promise<ResearchResult[]> {
    const allQueries: SubQuery[] = [
      ...decomposition.primary_queries,
      ...decomposition.validation_queries,
      ...(decomposition.edge_queries || [])
    ];

    allQueries.sort((a, b) => a.priority - b.priority);

    const promises = allQueries.map(async (subQuery, index) => {
      this.log(options, 'research', `[${index + 1}/${allQueries.length}] ${subQuery.focus}`);

      try {
        return await b.ResearchTopic({
          query: subQuery.query,
          focus: subQuery.focus,
          boundary: subQuery.boundary,
          depth: options.depth
        });
      } catch (error) {
        console.error(`Research failed for "${subQuery.focus}":`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(promises);

    return results
      .filter((r): r is PromiseFulfilledResult<ResearchResult | null> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter((r): r is ResearchResult => r !== null);
  }

  private extractClaims(results: ResearchResult[]): string[] {
    const claims: string[] = [];
    for (const result of results) {
      for (const finding of result.key_findings) {
        if (finding.confidence !== 'HIGH') {
          claims.push(finding.claim);
        }
      }
    }
    return claims.slice(0, 10);
  }

  private countQueries(decomposition: DecompositionResult): number {
    return (
      decomposition.primary_queries.length +
      decomposition.validation_queries.length +
      (decomposition.edge_queries?.length || 0)
    );
  }

  private depthName(depth: number): string {
    return ['', 'quick', 'standard', 'deep', 'extensive'][depth] || 'standard';
  }

  private defaultValidation(query: string): ValidationResult {
    return {
      is_clear: true,
      topics: [query],
      relationship: 'single',
      time_period: 'unspecified',
      primary_sources: [],
      recommended_structure: 'standard'
    };
  }
}

export function createResearchOrchestrator(): ResearchOrchestrator {
  return new ResearchOrchestrator();
}
```

---

## Streaming Support (`src/skills/research/stream.ts`)

```typescript
import { b } from '../../baml_client';
import type { ResearchOptions } from './orchestrator';

export interface ResearchProgress {
  phase: 'validate' | 'decompose' | 'research' | 'factcheck' | 'synthesize' | 'complete';
  progress: number;
  message: string;
  partial?: unknown;
}

export async function* streamResearch(
  query: string,
  options: ResearchOptions
): AsyncGenerator<ResearchProgress> {
  yield { phase: 'validate', progress: 0, message: 'Starting...' };

  // Phase 1
  yield { phase: 'validate', progress: 5, message: 'Validating scope...' };
  const validation = await b.ValidateResearchScope({ query });
  yield { phase: 'validate', progress: 10, message: 'Scope validated' };

  // Phase 2
  yield { phase: 'decompose', progress: 15, message: 'Decomposing query...' };
  const decomposition = await b.DecomposeQuery({
    query,
    depth: options.depth,
    validation
  });
  yield { phase: 'decompose', progress: 20, message: `${decomposition.primary_queries.length} queries` };

  // Phase 3
  const allQueries = [...decomposition.primary_queries, ...decomposition.validation_queries];
  const results: unknown[] = [];

  for (let i = 0; i < allQueries.length; i++) {
    const subQuery = allQueries[i];
    const progress = 20 + Math.floor((i / allQueries.length) * 50);
    yield { phase: 'research', progress, message: `Researching: ${subQuery.focus}` };

    const result = await b.ResearchTopic({
      query: subQuery.query,
      focus: subQuery.focus,
      boundary: subQuery.boundary,
      depth: options.depth
    });
    results.push(result);
  }

  yield { phase: 'research', progress: 70, message: 'Research complete' };

  // Phase 4
  if (!options.skipFactCheck && options.depth >= 2) {
    yield { phase: 'factcheck', progress: 75, message: 'Fact-checking...' };
    yield { phase: 'factcheck', progress: 85, message: 'Fact-check complete' };
  }

  // Phase 5
  yield { phase: 'synthesize', progress: 90, message: 'Synthesizing...' };
  const synthesis = await b.SynthesizeFindings({
    original_query: query,
    research_results: results as any,
    output_format: options.outputFormat
  });

  yield { phase: 'complete', progress: 100, message: 'Complete', partial: synthesis };
}
```

---

## Skill Registry Integration

Add to `src/skills/registry.ts`:

```typescript
import type { SkillFunction } from '../router/types';

export const RESEARCH_SKILLS: SkillFunction[] = [
  {
    id: 'research-quick',
    name: 'Quick Research',
    description: 'Fast research overview (15-30 seconds)',
    triggers: ['quick research', 'briefly research', 'quick look at', 'fast research'],
    bamlFunction: 'ResearchTopic',
    params: { depth: 1 }
  },
  {
    id: 'research-standard',
    name: 'Standard Research',
    description: 'Comprehensive research (30-60 seconds)',
    triggers: ['research', 'investigate', 'look into', 'find out about', 'what is', 'tell me about'],
    bamlFunction: 'ResearchTopic',
    params: { depth: 2 }
  },
  {
    id: 'research-deep',
    name: 'Deep Research',
    description: 'Thorough analysis (1-2 minutes)',
    triggers: ['deep research', 'deep dive', 'thorough research', 'comprehensive analysis'],
    bamlFunction: 'ResearchTopic',
    params: { depth: 3 }
  },
  {
    id: 'research-extensive',
    name: 'Extensive Research',
    description: 'Exhaustive investigation (2-5 minutes)',
    triggers: ['extensive research', 'exhaustive research', 'complete analysis', 'full investigation'],
    bamlFunction: 'ResearchTopic',
    params: { depth: 4 }
  }
];
```

---

## Runtime Integration

Update `src/runtime/qara.ts`:

```typescript
import { ResearchOrchestrator } from '../skills/research/orchestrator';

export class QaraRuntime {
  private researchOrchestrator: ResearchOrchestrator;

  constructor() {
    this.router = new QaraRouter(SKILLS);
    this.researchOrchestrator = new ResearchOrchestrator();
  }

  async execute(input: string, options: ExecuteOptions = {}): Promise<ExecuteResult> {
    const route = this.router.route(input);
    if (!route) throw new Error(`No skill found for: "${input}"`);

    // Special handling for research skills
    if (route.skill.id.startsWith('research-')) {
      const result = await this.researchOrchestrator.execute(input, {
        depth: (route.skill.params?.depth as 1 | 2 | 3 | 4) || 2,
        outputFormat: options.outputFormat || 'executive',
        verbose: options.verbose
      });

      return {
        success: true,
        data: result,
        metadata: {
          skill: route.skill.id,
          confidence: route.confidence,
          matchType: route.matchType,
          duration: 0,
          timestamp: new Date()
        }
      };
    }

    // Standard BAML execution for other skills
    return this.executeBamlFunction(route, input, options);
  }
}
```

---

## Tests (`tests/research.test.ts`)

```typescript
import { describe, test, expect } from 'bun:test';
import { ResearchOrchestrator } from '../src/skills/research/orchestrator';

describe('ResearchOrchestrator', () => {
  const orchestrator = new ResearchOrchestrator();

  test('quick research completes in <30s', async () => {
    const start = Date.now();
    const result = await orchestrator.execute('What is BAML?', {
      depth: 1,
      outputFormat: 'executive'
    });
    
    expect(Date.now() - start).toBeLessThan(30000);
    expect(result.executive_brief).toBeDefined();
    expect(result.executive_brief.key_findings.length).toBeGreaterThan(0);
  }, 60000);

  test('standard research has quality metrics', async () => {
    const result = await orchestrator.execute('AI safety 2025', {
      depth: 2,
      outputFormat: 'full'
    });
    
    expect(result.quality.coverage_score).toBeGreaterThan(50);
    expect(['A', 'B', 'C', 'D']).toContain(result.quality.overall_grade);
  }, 120000);

  test('fact-checking identifies claims', async () => {
    const result = await orchestrator.execute('XRP regulatory status', {
      depth: 3,
      outputFormat: 'executive'
    });
    
    expect(result.executive_brief.critical_distinctions.length).toBeGreaterThan(0);
  }, 180000);

  test('skips validation when requested', async () => {
    const result = await orchestrator.execute('Test query', {
      depth: 1,
      outputFormat: 'executive',
      skipValidation: true
    });
    
    expect(result).toBeDefined();
  }, 60000);
});
```

---

## CLI Integration

Add research commands to CLI:

```typescript
// In src/cli/index.ts

if (options.stream && route.skill.id.startsWith('research-')) {
  const { streamResearch } = await import('../skills/research/stream');
  
  for await (const progress of streamResearch(input, {
    depth: options.depth as 1 | 2 | 3 | 4,
    outputFormat: options.format as any
  })) {
    console.log(`[${progress.progress}%] ${progress.phase}: ${progress.message}`);
    
    if (progress.phase === 'complete' && progress.partial) {
      console.log('\n--- Results ---\n');
      console.log(formatOutput(progress.partial, options.format));
    }
  }
  return;
}
```

---

## Usage Examples

```bash
# Quick research
qara "quick research BAML"

# Standard research with verbose output
qara "research AI safety developments" --verbose

# Deep research with full output
qara "deep research quantum computing" --format=full

# Extensive research with streaming
qara "extensive research cryptocurrency regulation" --stream

# Research with specific depth
qara "research XRP" --depth=3
```

---

## File Structure Summary

```
src/
├── skills/
│   ├── registry.ts              # Add RESEARCH_SKILLS
│   └── research/
│       ├── orchestrator.ts      # Main orchestrator
│       └── stream.ts            # Streaming support
├── runtime/
│   └── qara.ts                  # Add research handling
└── cli/
    └── index.ts                 # Add research CLI options
```

---

**Previous:** [RESEARCH_SKILL_BAML.md](./RESEARCH_SKILL_BAML.md) - BAML definitions  
**Related:** [ROUTER_CLI_IMPLEMENTATION.md](./ROUTER_CLI_IMPLEMENTATION.md) - Router and CLI
