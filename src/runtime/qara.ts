/**
 * Qara v2 Runtime
 * 
 * Main runtime that routes natural language input to skill functions.
 */

import { QaraRouter } from '../router/router';
import { SKILLS } from '../skills/registry';
import { b } from './baml-stub';
import type { SkillFunction, RouteMatch } from '../router/types';

export interface ExecuteOptions {
  model?: string;
  outputFormat?: 'executive' | 'full' | 'bullets' | 'table';
  stream?: boolean;
  verbose?: boolean;
}

export interface ExecuteResult {
  success: boolean;
  data: unknown;
  metadata: {
    skill: string;
    confidence: number;
    matchType: string;
    duration: number;
    timestamp: Date;
  };
}

export class QaraRuntime {
  private router: QaraRouter;

  constructor() {
    this.router = new QaraRouter(SKILLS);
  }

  /**
   * Execute natural language input.
   */
  async execute(input: string, options: ExecuteOptions = {}): Promise<ExecuteResult> {
    const startTime = performance.now();

    // 1. Route input to skill (<1ms)
    const route = this.router.route(input);
    if (!route) {
      throw new Error(`No skill found for: "${input}". Try "qara list" to see available skills.`);
    }

    if (options.verbose) {
      console.log(`[router] Matched: ${route.skill.name} (${(route.confidence * 100).toFixed(0)}% ${route.matchType})`);
    }

    // 2. Execute BAML function
    const result = await this.executeBamlFunction(route, input, options);

    // 3. Build response
    const duration = performance.now() - startTime;

    if (options.verbose) {
      console.log(`[qara] Completed in ${duration.toFixed(0)}ms`);
    }

    return {
      success: true,
      data: result,
      metadata: {
        skill: route.skill.id,
        confidence: route.confidence,
        matchType: route.matchType,
        duration,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Stream execution with real-time results.
   */
  async *stream(input: string, options: ExecuteOptions = {}): AsyncIterableIterator<unknown> {
    const route = this.router.route(input);
    if (!route) {
      throw new Error(`No skill found for: "${input}"`);
    }

    const funcName = route.skill.bamlFunction;
    const streamFunc = b.stream?.[funcName];

    if (!streamFunc) {
      // Fallback to non-streaming
      const result = await this.execute(input, options);
      yield result.data;
      return;
    }

    const context = this.buildContext(route, input, options);

    for await (const chunk of streamFunc(context)) {
      yield chunk;
    }
  }

  /**
   * Execute BAML function.
   */
  private async executeBamlFunction(
    route: RouteMatch,
    input: string,
    options: ExecuteOptions
  ): Promise<unknown> {
    const funcName = route.skill.bamlFunction;
    const func = b[funcName];

    if (!func || typeof func !== 'function') {
      throw new Error(`BAML function not found: ${funcName}`);
    }

    const context = this.buildContext(route, input, options);
    return await func(context);
  }

  /**
   * Build context for BAML function.
   */
  private buildContext(
    route: RouteMatch,
    input: string,
    options: ExecuteOptions
  ): Record<string, unknown> {
    const query = this.extractQuery(input, route.skill.triggers);

    const context: Record<string, unknown> = {
      query,
      ...route.skill.params,
    };

    if (options.outputFormat) {
      context.output_format = options.outputFormat;
    }

    return context;
  }

  /**
   * Extract query by removing trigger words.
   */
  private extractQuery(input: string, triggers: string[]): string {
    let query = input.toLowerCase();

    // Sort triggers by length (longest first) to avoid partial matches
    const sortedTriggers = [...triggers].sort((a, b) => b.length - a.length);

    for (const trigger of sortedTriggers) {
      if (query.startsWith(trigger)) {
        query = query.slice(trigger.length).trim();
        break;
      }
    }

    return query || input;
  }

  /**
   * Get router for direct access.
   */
  getRouter(): QaraRouter {
    return this.router;
  }

  /**
   * List all available skills.
   */
  listSkills(): SkillFunction[] {
    return this.router.getSkills();
  }
}

// Singleton instance
let instance: QaraRuntime | null = null;

export function getRuntime(): QaraRuntime {
  if (!instance) {
    instance = new QaraRuntime();
  }
  return instance;
}
