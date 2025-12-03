/**
 * BAML Client Stub
 * 
 * Mock implementation for testing router/CLI before BAML functions are implemented.
 * Replace with actual BAML client import once Phase 2 is complete.
 */

export interface BamlContext {
  query: string;
  depth?: number;
  output_format?: string;
  [key: string]: unknown;
}

export interface BamlStub {
  [functionName: string]: (context: BamlContext) => Promise<unknown>;
  stream?: {
    [functionName: string]: (context: BamlContext) => AsyncIterableIterator<unknown>;
  };
}

/**
 * Mock BAML client that returns placeholder responses.
 * Each function simulates what the real BAML function would return.
 */
export const b: BamlStub = {
  ResearchTopic: async (ctx: BamlContext) => ({
    query: ctx.query,
    depth: ctx.depth ?? 2,
    status: 'stub',
    message: `[STUB] Research would be performed on: "${ctx.query}" at depth ${ctx.depth ?? 2}`,
    note: 'Implement baml_src/skills/research/*.baml and run baml-cli generate',
  }),

  WriteBlog: async (ctx: BamlContext) => ({
    query: ctx.query,
    status: 'stub',
    message: `[STUB] Blog post would be written about: "${ctx.query}"`,
    note: 'Implement baml_src/skills/blog/*.baml and run baml-cli generate',
  }),

  GenerateCode: async (ctx: BamlContext) => ({
    query: ctx.query,
    status: 'stub',
    message: `[STUB] Code would be generated for: "${ctx.query}"`,
    note: 'Implement baml_src/skills/code/*.baml and run baml-cli generate',
  }),

  ShowHelp: async (_ctx: BamlContext) => ({
    status: 'stub',
    message: 'Use "qara list" to see available skills, or "qara --help" for usage.',
  }),

  stream: {
    async *ResearchTopic(ctx: BamlContext) {
      yield { phase: 'starting', query: ctx.query };
      yield { phase: 'researching', progress: 50 };
      yield { phase: 'complete', message: `[STUB] Streamed research for: "${ctx.query}"` };
    },
  },
};
