/**
 * Research Skill Orchestrator
 * 
 * Coordinates the multi-phase research workflow:
 * 1. Validate scope
 * 2. Decompose query
 * 3. Parallel research
 * 4. Fact-check (optional)
 * 5. Synthesize results
 */

import { b } from '../../../baml_client';
import type {
  ValidationResult,
  DecompositionResult,
  ResearchResult,
  FactCheckResponse,
  SynthesisResult,
  SubQuery,
} from '../../../baml_client/types';
import { emitter } from '../../observability';

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
    const skillId = `research-${Date.now()}`;
    this.log(options, 'start', `Starting ${this.depthName(options.depth)} research`);

    emitter.emit({
      type: 'skill.start',
      lane: 'orchestrator',
      data: {
        skillId,
        skillName: `${this.depthName(options.depth)} research`,
        input: query,
        params: { depth: options.depth, outputFormat: options.outputFormat },
      },
    });

    try {
      // Phase 1: Validation
      let validation: ValidationResult;
      if (!options.skipValidation) {
        this.log(options, 'validate', 'Validating scope...');
        emitter.emit({
          type: 'skill.progress',
          lane: 'orchestrator',
          data: { skillId, phase: 'validate', progress: 0.1, message: 'Validating scope...' },
        });
        
        validation = await b.ValidateResearchScope({ query });

        emitter.emit({
          type: 'research.validate',
          lane: 'research',
          data: {
            query,
            isClear: validation.is_clear,
            topics: validation.topics,
            clarificationNeeded: validation.clarification_needed ?? undefined,
          },
        });

        if (validation.clarification_needed?.length) {
          this.log(options, 'validate', `Clarification needed: ${validation.clarification_needed.join(', ')}`);
        }
      } else {
        validation = this.defaultValidation(query);
      }

      // Phase 2: Decomposition
      this.log(options, 'decompose', 'Decomposing query...');
      emitter.emit({
        type: 'skill.progress',
        lane: 'orchestrator',
        data: { skillId, phase: 'decompose', progress: 0.2, message: 'Decomposing query...' },
      });
      
      const decomposition = await b.DecomposeQuery({
        query,
        depth: options.depth,
        validation,
      });
      
      const queryCount = this.countQueries(decomposition);
      const allQueries = [
        ...decomposition.primary_queries,
        ...decomposition.validation_queries,
        ...(decomposition.edge_queries ?? []),
      ];
      
      emitter.emit({
        type: 'research.decompose',
        lane: 'research',
        data: {
          queryCount,
          queries: allQueries.map((q, i) => ({ id: `q-${i}`, focus: q.focus, priority: q.priority })),
        },
      });
      
      this.log(options, 'decompose', `Generated ${queryCount} sub-queries`);

      // Phase 3: Parallel Research
      this.log(options, 'research', 'Executing parallel research...');
      emitter.emit({
        type: 'skill.progress',
        lane: 'orchestrator',
        data: { skillId, phase: 'research', progress: 0.4, message: 'Executing parallel research...' },
      });
      
      const researchResults = await this.executeParallel(decomposition, options);
      this.log(options, 'research', `Completed ${researchResults.length} streams`);

      // Phase 4: Fact-Checking (skip for quick research)
      let factCheck: FactCheckResponse | undefined;
      if (!options.skipFactCheck && options.depth >= 2) {
        this.log(options, 'factcheck', 'Fact-checking claims...');
        emitter.emit({
          type: 'skill.progress',
          lane: 'orchestrator',
          data: { skillId, phase: 'factcheck', progress: 0.7, message: 'Fact-checking claims...' },
        });
        
        const claims = this.extractClaims(researchResults);
        if (claims.length > 0) {
          factCheck = await b.FactCheckClaims({ claims, context: query });
          
          emitter.emit({
            type: 'research.factcheck',
            lane: 'research',
            data: {
              claimsChecked: claims.length,
              verified: factCheck.results.filter(r => r.verdict === 'VERIFIED').length,
              flagged: factCheck.results.filter(r => r.verdict === 'DISPUTED' || r.verdict === 'UNVERIFIABLE').length,
            },
          });
          
          this.log(options, 'factcheck', `Verified ${factCheck.results.length} claims`);
        }
      }

      // Phase 5: Synthesis
      this.log(options, 'synthesize', 'Synthesizing results...');
      emitter.emit({
        type: 'skill.progress',
        lane: 'orchestrator',
        data: { skillId, phase: 'synthesize', progress: 0.85, message: 'Synthesizing results...' },
      });
      
      const synthesis = await b.SynthesizeFindings({
        original_query: query,
        research_results: researchResults,
        fact_check: factCheck ?? null,
        output_format: options.outputFormat,
      });
      
      emitter.emit({
        type: 'research.synthesize',
        lane: 'research',
        data: {
          sourcesUsed: researchResults.length,
          outputLength: synthesis.detailed_analysis.length + synthesis.source_appendix.length,
        },
      });

      const duration = performance.now() - startTime;
      this.log(options, 'complete', `Done in ${(duration / 1000).toFixed(1)}s`);
      
      emitter.emit({
        type: 'skill.complete',
        lane: 'orchestrator',
        data: { skillId, durationMs: duration, success: true },
      });

      return synthesis;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      emitter.emit({
        type: 'skill.error',
        lane: 'orchestrator',
        data: {
          skillId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
      
      emitter.emit({
        type: 'skill.complete',
        lane: 'orchestrator',
        data: { skillId, durationMs: duration, success: false },
      });
      
      throw error;
    }
  }

  private async executeParallel(
    decomposition: DecompositionResult,
    options: ResearchOptions
  ): Promise<ResearchResult[]> {
    const allQueries: SubQuery[] = [
      ...decomposition.primary_queries,
      ...decomposition.validation_queries,
      ...(decomposition.edge_queries ?? []),
    ];

    // Sort by priority (1 = highest)
    allQueries.sort((a, b) => a.priority - b.priority);

    const promises = allQueries.map(async (subQuery, index) => {
      const queryId = `q-${index}`;
      this.log(options, 'research', `[${index + 1}/${allQueries.length}] ${subQuery.focus}`);

      emitter.emit({
        type: 'research.query.start',
        lane: 'research',
        data: { queryId, focus: subQuery.focus, status: 'running' },
      });

      const startTime = performance.now();
      try {
        const result = await b.ResearchTopic({
          query: subQuery.query,
          focus: subQuery.focus,
          boundary: subQuery.boundary,
          depth: options.depth,
        });
        
        emitter.emit({
          type: 'research.query.complete',
          lane: 'research',
          data: {
            queryId,
            focus: subQuery.focus,
            status: 'complete',
            durationMs: performance.now() - startTime,
            findingsCount: result?.key_findings?.length ?? 0,
          },
        });
        
        return result;
      } catch (error) {
        emitter.emit({
          type: 'research.query.complete',
          lane: 'research',
          data: {
            queryId,
            focus: subQuery.focus,
            status: 'error',
            durationMs: performance.now() - startTime,
            findingsCount: 0,
          },
        });
        
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
        // Only fact-check non-HIGH confidence claims
        if (finding.confidence !== 'HIGH') {
          claims.push(finding.claim);
        }
      }
    }
    // Limit to 10 claims to avoid excessive API calls
    return claims.slice(0, 10);
  }

  private countQueries(decomposition: DecompositionResult): number {
    return (
      decomposition.primary_queries.length +
      decomposition.validation_queries.length +
      (decomposition.edge_queries?.length ?? 0)
    );
  }

  private depthName(depth: number): string {
    const names = ['', 'quick', 'standard', 'deep', 'extensive'];
    return names[depth] ?? 'standard';
  }

  private defaultValidation(query: string): ValidationResult {
    return {
      is_clear: true,
      topics: [query],
      relationship: 'single',
      time_period: 'unspecified',
      primary_sources: [],
      recommended_structure: 'standard',
    };
  }
}

export function createResearchOrchestrator(): ResearchOrchestrator {
  return new ResearchOrchestrator();
}
