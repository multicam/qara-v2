# Qara v2: Router & CLI Implementation Guide

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation

---

## Overview

This document details the implementation of Qara v2's deterministic router and CLI interface. The router provides O(k) routing where k = input tokens, achieving <1ms latency compared to 1-3 seconds with AI-based routing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Interface                             │
│         qara "research AI safety" --depth=3                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Qara Runtime                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Router    │→ │  Executor   │→ │  BAML Client        │  │
│  │  (Trie)     │  │             │  │  (Auto-generated)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Deterministic Router

### 1.1 Core Types

```typescript
// src/router/types.ts

export interface SkillFunction {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  bamlFunction: string;
  params?: Record<string, unknown>;
  requiresContext?: string[];
}

export interface RouteMatch {
  skill: SkillFunction;
  confidence: number;
  tokens: string[];
  matchType: 'exact' | 'prefix' | 'fuzzy';
}

export interface RouteNode {
  skills: SkillFunction[];
  children: Map<string, RouteNode>;
  isTerminal: boolean;
}
```

### 1.2 Router Implementation

```typescript
// src/router/router.ts

import type { SkillFunction, RouteMatch, RouteNode } from './types';

export class QaraRouter {
  private trie: RouteNode;
  private skillMap: Map<string, SkillFunction>;

  constructor(skills: SkillFunction[]) {
    this.skillMap = new Map(skills.map(s => [s.id, s]));
    this.trie = this.buildTrie(skills);
  }

  /**
   * O(k) deterministic routing where k = input tokens
   * Returns skill function reference + confidence
   */
  route(input: string): RouteMatch | null {
    const tokens = this.tokenize(input);
    let node = this.trie;
    let bestMatch: SkillFunction | null = null;
    let matchDepth = 0;
    let matchType: 'exact' | 'prefix' | 'fuzzy' = 'fuzzy';

    // Walk trie for exact/prefix matches
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!node.children.has(token)) break;
      
      node = node.children.get(token)!;
      
      if (node.isTerminal && node.skills.length > 0) {
        bestMatch = node.skills[0];
        matchDepth = i + 1;
        matchType = matchDepth === tokens.length ? 'exact' : 'prefix';
      }
    }

    // Calculate confidence based on match depth
    if (bestMatch) {
      const confidence = matchDepth / Math.max(tokens.length, 1);
      return {
        skill: bestMatch,
        confidence: Math.min(confidence, 1),
        tokens,
        matchType
      };
    }

    // Fallback to fuzzy matching
    return this.fuzzyMatch(input, tokens);
  }

  /**
   * Build trie from skill triggers
   */
  private buildTrie(skills: SkillFunction[]): RouteNode {
    const root: RouteNode = {
      skills: [],
      children: new Map(),
      isTerminal: false
    };

    for (const skill of skills) {
      for (const trigger of skill.triggers) {
        const tokens = this.tokenize(trigger);
        let node = root;

        for (const token of tokens) {
          if (!node.children.has(token)) {
            node.children.set(token, {
              skills: [],
              children: new Map(),
              isTerminal: false
            });
          }
          node = node.children.get(token)!;
        }
        
        node.isTerminal = true;
        node.skills.push(skill);
      }
    }

    return root;
  }

  /**
   * Tokenize input for matching
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  }

  /**
   * Fuzzy matching fallback using keyword overlap
   */
  private fuzzyMatch(input: string, inputTokens: string[]): RouteMatch | null {
    const inputSet = new Set(inputTokens);
    let bestSkill: SkillFunction | null = null;
    let bestScore = 0;

    for (const skill of this.skillMap.values()) {
      for (const trigger of skill.triggers) {
        const triggerTokens = new Set(this.tokenize(trigger));
        const overlap = [...inputSet].filter(t => triggerTokens.has(t)).length;
        const score = overlap / Math.max(inputSet.size, triggerTokens.size);

        if (score > bestScore) {
          bestScore = score;
          bestSkill = skill;
        }
      }
    }

    // Require minimum 30% overlap for fuzzy match
    if (bestSkill && bestScore > 0.3) {
      return {
        skill: bestSkill,
        confidence: bestScore,
        tokens: inputTokens,
        matchType: 'fuzzy'
      };
    }

    return null;
  }

  /**
   * Get all registered skills
   */
  getSkills(): SkillFunction[] {
    return Array.from(this.skillMap.values());
  }

  /**
   * Get skill by ID
   */
  getSkill(id: string): SkillFunction | undefined {
    return this.skillMap.get(id);
  }

  /**
   * Debug: Print trie structure
   */
  debugTrie(node: RouteNode = this.trie, prefix = ''): void {
    for (const [token, child] of node.children) {
      const marker = child.isTerminal ? ' [*]' : '';
      const skills = child.skills.map(s => s.id).join(', ');
      console.log(`${prefix}${token}${marker}${skills ? ` -> ${skills}` : ''}`);
      this.debugTrie(child, prefix + '  ');
    }
  }
}
```

### 1.3 Skill Registry

```typescript
// src/skills/registry.ts

import type { SkillFunction } from '../router/types';

export const SKILLS: SkillFunction[] = [
  // Research Skills
  {
    id: 'research-quick',
    name: 'Quick Research',
    description: 'Fast research overview (15-30 seconds)',
    triggers: [
      'quick research',
      'briefly research',
      'quick look at',
      'fast research',
      'quick search'
    ],
    bamlFunction: 'ResearchTopic',
    params: { depth: 1 }
  },
  {
    id: 'research-standard',
    name: 'Standard Research',
    description: 'Comprehensive research (30-60 seconds)',
    triggers: [
      'research',
      'investigate',
      'look into',
      'find out about',
      'what is',
      'tell me about',
      'learn about'
    ],
    bamlFunction: 'ResearchTopic',
    params: { depth: 2 }
  },
  {
    id: 'research-deep',
    name: 'Deep Research',
    description: 'Thorough analysis (1-2 minutes)',
    triggers: [
      'deep research',
      'deep dive',
      'thorough research',
      'comprehensive analysis',
      'detailed research',
      'analyze deeply'
    ],
    bamlFunction: 'ResearchTopic',
    params: { depth: 3 }
  },
  {
    id: 'research-extensive',
    name: 'Extensive Research',
    description: 'Exhaustive investigation (2-5 minutes)',
    triggers: [
      'extensive research',
      'exhaustive research',
      'complete analysis',
      'full investigation',
      'research everything about'
    ],
    bamlFunction: 'ResearchTopic',
    params: { depth: 4 }
  },

  // Blog Skills (example)
  {
    id: 'blog-write',
    name: 'Write Blog Post',
    description: 'Create a new blog post from a topic',
    triggers: [
      'write blog',
      'create post',
      'draft article',
      'new blog post',
      'write article'
    ],
    bamlFunction: 'WriteBlog'
  },

  // Code Skills (example)
  {
    id: 'code-generate',
    name: 'Generate Code',
    description: 'Write code based on specifications',
    triggers: [
      'write code',
      'generate code',
      'implement function',
      'create class',
      'code this'
    ],
    bamlFunction: 'GenerateCode'
  }
];

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: string): SkillFunction[] {
  return SKILLS.filter(s => s.id.startsWith(category));
}

/**
 * Get all skill IDs
 */
export function getSkillIds(): string[] {
  return SKILLS.map(s => s.id);
}
```

---

## Part 2: Runtime

### 2.1 Main Runtime

```typescript
// src/runtime/qara.ts

import { b } from '../baml_client';
import { QaraRouter } from '../router/router';
import { SKILLS } from '../skills/registry';
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
   * Execute natural language input
   */
  async execute(input: string, options: ExecuteOptions = {}): Promise<ExecuteResult> {
    const startTime = performance.now();

    // 1. Route input to skill (<1ms)
    const route = this.router.route(input);
    if (!route) {
      throw new Error(`No skill found for: "${input}"`);
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
        timestamp: new Date()
      }
    };
  }

  /**
   * Stream execution with real-time results
   */
  async *stream(input: string, options: ExecuteOptions = {}): AsyncIterableIterator<unknown> {
    const route = this.router.route(input);
    if (!route) {
      throw new Error(`No skill found for: "${input}"`);
    }

    // Get streaming function
    const funcName = route.skill.bamlFunction;
    const streamFunc = (b as any).stream?.[funcName];
    
    if (!streamFunc) {
      // Fallback to non-streaming
      const result = await this.execute(input, options);
      yield result.data;
      return;
    }

    // Build context
    const context = this.buildContext(route, input, options);

    // Stream results
    for await (const chunk of streamFunc(context)) {
      yield chunk;
    }
  }

  /**
   * Execute BAML function
   */
  private async executeBamlFunction(
    route: RouteMatch,
    input: string,
    options: ExecuteOptions
  ): Promise<unknown> {
    const funcName = route.skill.bamlFunction;
    const func = (b as any)[funcName];

    if (!func) {
      throw new Error(`BAML function not found: ${funcName}`);
    }

    const context = this.buildContext(route, input, options);
    return await func(context);
  }

  /**
   * Build context for BAML function
   */
  private buildContext(route: RouteMatch, input: string, options: ExecuteOptions): unknown {
    // Extract query from input (remove trigger words)
    const query = this.extractQuery(input, route.skill.triggers);

    // Base context
    const context: Record<string, unknown> = {
      query,
      ...route.skill.params
    };

    // Add options
    if (options.outputFormat) {
      context.output_format = options.outputFormat;
    }

    return context;
  }

  /**
   * Extract query by removing trigger words
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
   * Get router for direct access
   */
  getRouter(): QaraRouter {
    return this.router;
  }

  /**
   * List all available skills
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
```

---

## Part 3: CLI Interface

### 3.1 CLI Implementation

```typescript
// src/cli/index.ts

import { parseArgs } from 'util';
import { getRuntime } from '../runtime/qara';
import type { ExecuteOptions } from '../runtime/qara';

interface CLIOptions {
  help: boolean;
  version: boolean;
  verbose: boolean;
  stream: boolean;
  depth: number;
  format: string;
  list: boolean;
}

const VERSION = '2.0.0';

const HELP_TEXT = `
Qara v${VERSION} - AI-powered skill execution

Usage:
  qara <command> [options]
  qara "natural language input" [options]

Commands:
  list              List all available skills
  help              Show this help message
  version           Show version

Options:
  -h, --help        Show help
  -v, --verbose     Verbose output
  -s, --stream      Stream output (real-time)
  -d, --depth       Research depth (1-4)
  -f, --format      Output format (executive|full|bullets|table)
  --version         Show version

Examples:
  qara "research AI safety"
  qara "deep research quantum computing" --format=full
  qara "quick research BAML" --verbose
  qara list
`;

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
      stream: { type: 'boolean', short: 's', default: false },
      depth: { type: 'string', short: 'd', default: '2' },
      format: { type: 'string', short: 'f', default: 'executive' },
      list: { type: 'boolean', default: false }
    },
    allowPositionals: true
  });

  const options: CLIOptions = {
    help: values.help as boolean,
    version: values.version as boolean,
    verbose: values.verbose as boolean,
    stream: values.stream as boolean,
    depth: parseInt(values.depth as string, 10),
    format: values.format as string,
    list: values.list as boolean
  };

  // Handle special commands
  if (options.help || positionals[0] === 'help') {
    console.log(HELP_TEXT);
    return;
  }

  if (options.version || positionals[0] === 'version') {
    console.log(`Qara v${VERSION}`);
    return;
  }

  if (options.list || positionals[0] === 'list') {
    listSkills();
    return;
  }

  // Get input
  const input = positionals.join(' ').trim();
  if (!input) {
    console.error('Error: No input provided');
    console.log('Run "qara --help" for usage');
    process.exit(1);
  }

  // Execute
  const runtime = getRuntime();
  const execOptions: ExecuteOptions = {
    verbose: options.verbose,
    stream: options.stream,
    outputFormat: options.format as ExecuteOptions['outputFormat']
  };

  try {
    if (options.stream) {
      // Streaming output
      for await (const chunk of runtime.stream(input, execOptions)) {
        process.stdout.write(formatChunk(chunk));
      }
      console.log(); // Final newline
    } else {
      // Standard output
      const result = await runtime.execute(input, execOptions);
      
      if (options.verbose) {
        console.log('\n--- Metadata ---');
        console.log(`Skill: ${result.metadata.skill}`);
        console.log(`Confidence: ${(result.metadata.confidence * 100).toFixed(0)}%`);
        console.log(`Match Type: ${result.metadata.matchType}`);
        console.log(`Duration: ${result.metadata.duration.toFixed(0)}ms`);
        console.log('--- Result ---\n');
      }

      console.log(formatOutput(result.data, options.format));
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function listSkills(): void {
  const runtime = getRuntime();
  const skills = runtime.listSkills();

  console.log('\nAvailable Skills:\n');
  
  // Group by category
  const categories = new Map<string, typeof skills>();
  for (const skill of skills) {
    const category = skill.id.split('-')[0];
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(skill);
  }

  for (const [category, categorySkills] of categories) {
    console.log(`${category.toUpperCase()}`);
    for (const skill of categorySkills) {
      console.log(`  ${skill.id.padEnd(20)} ${skill.description}`);
      console.log(`    Triggers: ${skill.triggers.slice(0, 3).join(', ')}...`);
    }
    console.log();
  }
}

function formatChunk(chunk: unknown): string {
  if (typeof chunk === 'string') return chunk;
  if (typeof chunk === 'object' && chunk !== null) {
    return JSON.stringify(chunk);
  }
  return String(chunk);
}

function formatOutput(data: unknown, format: string): string {
  if (typeof data === 'string') return data;
  
  if (format === 'bullets' && Array.isArray(data)) {
    return data.map(item => `• ${item}`).join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    // Pretty print JSON
    return JSON.stringify(data, null, 2);
  }

  return String(data);
}

// Run CLI
main().catch(console.error);
```

### 3.2 Package.json Scripts

```json
{
  "name": "qara-v2",
  "version": "2.0.0",
  "module": "src/cli/index.ts",
  "type": "module",
  "bin": {
    "qara": "./src/cli/index.ts"
  },
  "scripts": {
    "start": "bun run src/cli/index.ts",
    "dev": "bun --watch run src/cli/index.ts",
    "build": "bun build src/cli/index.ts --outdir=dist --target=bun",
    "test": "bun test",
    "baml:generate": "baml-cli generate",
    "baml:test": "baml-cli test"
  },
  "devDependencies": {
    "@boundaryml/baml": "^0.214.0",
    "@types/bun": "latest"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

### 3.3 Global Installation

```bash
# Link globally for development
bun link

# Now use from anywhere
qara "research AI safety"
qara list
qara --help
```

---

## Part 4: Testing

### 4.1 Router Tests

```typescript
// tests/router.test.ts

import { describe, test, expect, beforeAll } from 'bun:test';
import { QaraRouter } from '../src/router/router';
import { SKILLS } from '../src/skills/registry';

describe('QaraRouter', () => {
  let router: QaraRouter;

  beforeAll(() => {
    router = new QaraRouter(SKILLS);
  });

  describe('exact matching', () => {
    test('matches exact trigger', () => {
      const result = router.route('research');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-standard');
      expect(result!.matchType).toBe('exact');
    });

    test('matches multi-word trigger', () => {
      const result = router.route('deep research');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-deep');
    });
  });

  describe('prefix matching', () => {
    test('matches trigger as prefix', () => {
      const result = router.route('research AI safety developments');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-standard');
      expect(result!.matchType).toBe('prefix');
    });
  });

  describe('fuzzy matching', () => {
    test('matches with keyword overlap', () => {
      const result = router.route('I want to investigate this topic');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-standard');
      expect(result!.matchType).toBe('fuzzy');
    });

    test('returns null for no match', () => {
      const result = router.route('xyzzy foobar baz');
      expect(result).toBeNull();
    });
  });

  describe('performance', () => {
    test('routes in <1ms', () => {
      const iterations = 1000;
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        router.route('deep research AI safety');
      }
      
      const duration = performance.now() - start;
      const avgMs = duration / iterations;
      
      expect(avgMs).toBeLessThan(1);
      console.log(`Average routing time: ${avgMs.toFixed(3)}ms`);
    });
  });
});
```

### 4.2 CLI Tests

```typescript
// tests/cli.test.ts

import { describe, test, expect } from 'bun:test';
import { $ } from 'bun';

describe('CLI', () => {
  test('shows help', async () => {
    const result = await $`bun run src/cli/index.ts --help`.text();
    expect(result).toContain('Qara v');
    expect(result).toContain('Usage:');
  });

  test('shows version', async () => {
    const result = await $`bun run src/cli/index.ts --version`.text();
    expect(result).toContain('Qara v');
  });

  test('lists skills', async () => {
    const result = await $`bun run src/cli/index.ts list`.text();
    expect(result).toContain('research-standard');
    expect(result).toContain('Available Skills');
  });

  test('errors on empty input', async () => {
    try {
      await $`bun run src/cli/index.ts`.text();
      expect(true).toBe(false); // Should not reach here
    } catch (e) {
      expect(String(e)).toContain('No input provided');
    }
  });
});
```

---

## Part 5: File Structure

```
qara-v2/
├── src/
│   ├── router/
│   │   ├── router.ts           # Trie-based router
│   │   └── types.ts            # Router types
│   ├── runtime/
│   │   └── qara.ts             # Main runtime
│   ├── skills/
│   │   └── registry.ts         # Skill definitions
│   ├── cli/
│   │   └── index.ts            # CLI entry point
│   └── baml_client/            # Auto-generated (don't edit)
├── tests/
│   ├── router.test.ts
│   └── cli.test.ts
├── baml_src/
│   ├── clients.baml
│   ├── generators.baml
│   └── skills/
│       └── ...
└── package.json
```

---

## Implementation Checklist

### Phase 1: Router (Day 1)
- [ ] Create `src/router/types.ts`
- [ ] Create `src/router/router.ts`
- [ ] Create `src/skills/registry.ts`
- [ ] Write router tests

### Phase 2: Runtime (Day 2)
- [ ] Create `src/runtime/qara.ts`
- [ ] Integrate with BAML client
- [ ] Add streaming support

### Phase 3: CLI (Day 3)
- [ ] Create `src/cli/index.ts`
- [ ] Update `package.json` scripts
- [ ] Write CLI tests
- [ ] Test global installation

### Phase 4: Integration (Day 4)
- [ ] End-to-end testing
- [ ] Performance benchmarks
- [ ] Documentation updates

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Routing latency | <1ms | 99th percentile |
| CLI startup | <100ms | Cold start |
| Memory usage | <50MB | Idle state |

---

**Document Version:** 1.0  
**Created:** December 3, 2025  
**Status:** Ready for Implementation
