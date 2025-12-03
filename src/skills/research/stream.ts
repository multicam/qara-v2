/**
 * Research Skill - Streaming Support
 * 
 * Provides progress updates during research execution.
 */

import { b } from '../../../baml_client';
import type { ResearchOptions } from './orchestrator';
import type { ResearchResult, SynthesisResult } from '../../../baml_client/types';

export interface ResearchProgress {
  phase: 'validate' | 'decompose' | 'research' | 'factcheck' | 'synthesize' | 'complete';
  progress: number;
  message: string;
  partial?: SynthesisResult;
}

export async function* streamResearch(
  query: string,
  options: ResearchOptions
): AsyncGenerator<ResearchProgress> {
  yield { phase: 'validate', progress: 0, message: 'Starting...' };

  // Phase 1: Validation
  yield { phase: 'validate', progress: 5, message: 'Validating scope...' };
  const validation = await b.ValidateResearchScope({ query });
  yield { phase: 'validate', progress: 10, message: 'Scope validated' };

  // Phase 2: Decomposition
  yield { phase: 'decompose', progress: 15, message: 'Decomposing query...' };
  const decomposition = await b.DecomposeQuery({
    query,
    depth: options.depth,
    validation,
  });
  const queryCount = decomposition.primary_queries.length + decomposition.validation_queries.length;
  yield { phase: 'decompose', progress: 20, message: `Generated ${queryCount} sub-queries` };

  // Phase 3: Parallel Research
  const allQueries = [
    ...decomposition.primary_queries,
    ...decomposition.validation_queries,
    ...(decomposition.edge_queries ?? []),
  ];
  const results: ResearchResult[] = [];

  for (let i = 0; i < allQueries.length; i++) {
    const subQuery = allQueries[i]!;
    const progress = 20 + Math.floor((i / allQueries.length) * 50);
    yield { phase: 'research', progress, message: `Researching: ${subQuery.focus}` };

    try {
      const result = await b.ResearchTopic({
        query: subQuery.query,
        focus: subQuery.focus,
        boundary: subQuery.boundary,
        depth: options.depth,
      });
      results.push(result);
    } catch (error) {
      console.error(`Research failed for "${subQuery.focus}":`, error);
    }
  }

  yield { phase: 'research', progress: 70, message: 'Research complete' };

  // Phase 4: Fact-checking
  let factCheck = null;
  if (!options.skipFactCheck && options.depth >= 2) {
    yield { phase: 'factcheck', progress: 75, message: 'Fact-checking claims...' };
    
    const claims = results
      .flatMap(r => r.key_findings)
      .filter(f => f.confidence !== 'HIGH')
      .map(f => f.claim)
      .slice(0, 10);

    if (claims.length > 0) {
      factCheck = await b.FactCheckClaims({ claims, context: query });
    }
    yield { phase: 'factcheck', progress: 85, message: 'Fact-check complete' };
  }

  // Phase 5: Synthesis
  yield { phase: 'synthesize', progress: 90, message: 'Synthesizing results...' };
  const synthesis = await b.SynthesizeFindings({
    original_query: query,
    research_results: results,
    fact_check: factCheck,
    output_format: options.outputFormat,
  });

  yield { phase: 'complete', progress: 100, message: 'Complete', partial: synthesis };
}
