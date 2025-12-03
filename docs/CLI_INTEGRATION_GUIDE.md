# Qara v2: CLI Integration Guide

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation

---

## ⚠️ Critical Review Notes

### Scope Warning: Four Integrations is Too Many

**Current plan:** Claude CLI, Codex CLI, Gemini CLI, Droid CLI

**Recommendation:** Pick ONE and make it work perfectly.

| Integration | Recommendation | Reason |
|-------------|----------------|--------|
| **Claude CLI (MCP)** | ✅ Do first | You use Claude, MCP is standard |
| Codex CLI | ❌ Defer | Different ecosystem |
| Gemini CLI | ❌ Defer | Different ecosystem |
| Droid CLI | ❌ Defer | Custom, lowest priority |

### Missing: Authentication & Security

The HTTP server has no:
- API key authentication
- Rate limiting
- CORS configuration (for browser clients)
- Request validation

**Risk:** Anyone on localhost can execute skills and burn API credits.

### Missing: Cost Controls

No mechanism to:
- Track cost per request
- Set spending limits
- Alert on high usage

### Simpler Alternative

Before building an HTTP server, consider:
```bash
# Direct CLI invocation (no server needed)
qara "research AI safety" | claude-cli --tool-result
```

This avoids the server entirely for single-user scenarios.

---

## Overview

This document details how to integrate Qara v2 as a skill/tool provider for various AI CLI tools:

| CLI | Provider | Integration Method |
|-----|----------|-------------------|
| **claude-cli** | Anthropic | MCP Server / Tool Use |
| **codex-cli** | OpenAI | Function Calling |
| **gemini-cli** | Google | Function Declarations |
| **droid-cli** | Custom | Direct Integration |

Qara v2 exposes its skills as callable tools, enabling any AI CLI to leverage deterministic routing and BAML-powered skill execution.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI CLI (claude/codex/gemini)             │
│                                                             │
│  User: "Research AI safety developments in 2025"           │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tool Call: qara_execute                             │   │
│  │  Args: { query: "AI safety...", skill: "research" } │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Qara v2 Server                           │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Router    │→ │  Executor   │→ │  BAML Functions     │ │
│  │  (<1ms)     │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  Returns: Structured result (JSON)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Qara v2 Server

### 1.1 HTTP Server (`src/server/index.ts`)

```typescript
import { getRuntime } from '../runtime/qara';
import type { ExecuteOptions } from '../runtime/qara';

const runtime = getRuntime();

const server = Bun.serve({
  port: process.env.QARA_PORT || 3939,
  
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', version: '2.0.0' });
    }
    
    // List skills
    if (url.pathname === '/skills' && req.method === 'GET') {
      const skills = runtime.listSkills().map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        triggers: s.triggers
      }));
      return Response.json({ skills });
    }
    
    // Execute skill
    if (url.pathname === '/execute' && req.method === 'POST') {
      try {
        const body = await req.json() as {
          query: string;
          skill?: string;
          options?: ExecuteOptions;
        };
        
        const result = await runtime.execute(body.query, body.options);
        return Response.json(result);
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 400 }
        );
      }
    }
    
    // Stream execution
    if (url.pathname === '/stream' && req.method === 'POST') {
      const body = await req.json() as { query: string; options?: ExecuteOptions };
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of runtime.stream(body.query, body.options)) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
              );
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
});

console.log(`Qara v2 server running on http://localhost:${server.port}`);
```

### 1.2 Tool Schema Definition

```typescript
// src/server/schema.ts

export const QARA_TOOL_SCHEMA = {
  name: 'qara_execute',
  description: 'Execute a Qara skill for research, analysis, code generation, and more. Qara provides deterministic routing to specialized AI skills with structured outputs.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language query or command to execute'
      },
      skill: {
        type: 'string',
        enum: ['research-quick', 'research-standard', 'research-deep', 'research-extensive', 'blog-write', 'code-generate'],
        description: 'Optional: Force a specific skill (otherwise auto-routed)'
      },
      depth: {
        type: 'integer',
        enum: [1, 2, 3, 4],
        description: 'Research depth: 1=quick, 2=standard, 3=deep, 4=extensive'
      },
      outputFormat: {
        type: 'string',
        enum: ['executive', 'full', 'bullets', 'table'],
        description: 'Output format preference'
      }
    },
    required: ['query']
  }
};

export const QARA_RESEARCH_SCHEMA = {
  name: 'qara_research',
  description: 'Conduct comprehensive research on any topic with parallel multi-agent execution, fact-checking, and tiered output (executive brief, detailed analysis, sources).',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Research question or topic'
      },
      depth: {
        type: 'integer',
        enum: [1, 2, 3, 4],
        default: 2,
        description: '1=quick (15-30s), 2=standard (30-60s), 3=deep (1-2min), 4=extensive (2-5min)'
      },
      outputFormat: {
        type: 'string',
        enum: ['executive', 'full'],
        default: 'executive',
        description: 'executive=500 word brief, full=complete analysis'
      },
      skipFactCheck: {
        type: 'boolean',
        default: false,
        description: 'Skip fact-checking phase (faster but less verified)'
      }
    },
    required: ['query']
  }
};
```

---

## Part 2: Claude CLI Integration (MCP)

### 2.1 MCP Server Implementation

Claude CLI supports the Model Context Protocol (MCP) for tool integration.

```typescript
// src/integrations/claude-mcp/server.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getRuntime } from '../../runtime/qara';

const runtime = getRuntime();

const server = new Server(
  { name: 'qara-v2', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'qara_execute',
      description: 'Execute any Qara skill with automatic routing',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Natural language query' },
          skill: { type: 'string', description: 'Optional skill ID' },
          depth: { type: 'number', description: 'Research depth 1-4' },
          outputFormat: { type: 'string', enum: ['executive', 'full', 'bullets'] }
        },
        required: ['query']
      }
    },
    {
      name: 'qara_research',
      description: 'Comprehensive research with fact-checking and tiered output',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Research topic' },
          depth: { type: 'number', default: 2 },
          outputFormat: { type: 'string', default: 'executive' }
        },
        required: ['query']
      }
    },
    {
      name: 'qara_list_skills',
      description: 'List all available Qara skills',
      inputSchema: { type: 'object', properties: {} }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'qara_execute': {
        const result = await runtime.execute(args.query as string, {
          outputFormat: args.outputFormat as any,
          verbose: false
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'qara_research': {
        const { ResearchOrchestrator } = await import('../../skills/research/orchestrator');
        const orchestrator = new ResearchOrchestrator();
        const result = await orchestrator.execute(args.query as string, {
          depth: (args.depth as 1 | 2 | 3 | 4) || 2,
          outputFormat: (args.outputFormat as any) || 'executive'
        });
        
        // Return executive brief for concise response
        return {
          content: [{
            type: 'text',
            text: formatResearchResult(result)
          }]
        };
      }

      case 'qara_list_skills': {
        const skills = runtime.listSkills();
        return {
          content: [{
            type: 'text',
            text: skills.map(s => `- **${s.name}** (${s.id}): ${s.description}`).join('\n')
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown'}` }],
      isError: true
    };
  }
});

function formatResearchResult(result: any): string {
  const brief = result.executive_brief;
  return `# ${brief.title}

**Research Question:** ${brief.research_question}
**Read Time:** ${brief.read_time}

## Key Findings
${brief.key_findings.map((f: any) => `- ${f.confidence === 'HIGH' ? '✅' : f.confidence === 'MEDIUM' ? '⚠️' : '❓'} ${f.claim}`).join('\n')}

## Critical Distinctions
${brief.critical_distinctions.map((d: string) => `- ${d}`).join('\n')}

## Strategic Implications
${brief.strategic_implications.map((i: string) => `- ${i}`).join('\n')}

## Recommended Actions
${brief.recommended_actions.map((a: string) => `- ${a}`).join('\n')}

---
Quality: ${result.quality.overall_grade} (Coverage: ${result.quality.coverage_score}, Confidence: ${result.quality.confidence_score})`;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Qara MCP server running');
}

main().catch(console.error);
```

### 2.2 Claude CLI Configuration

Add to `~/.claude/config.json`:

```json
{
  "mcpServers": {
    "qara": {
      "command": "bun",
      "args": ["run", "/path/to/qara-v2/src/integrations/claude-mcp/server.ts"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}",
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### 2.3 Usage in Claude CLI

```bash
# Claude CLI will automatically have access to Qara tools
claude

> Use qara to research the latest developments in AI safety

# Claude will call qara_research tool and present results
```

---

## Part 3: Codex CLI Integration (OpenAI)

### 3.1 Function Calling Setup

```typescript
// src/integrations/codex/functions.ts

import { getRuntime } from '../../runtime/qara';
import { ResearchOrchestrator } from '../../skills/research/orchestrator';

export const CODEX_FUNCTIONS = [
  {
    name: 'qara_execute',
    description: 'Execute a Qara skill for research, analysis, or content generation',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language query' },
        skill: { type: 'string', description: 'Optional skill ID to force' },
        outputFormat: { type: 'string', enum: ['executive', 'full', 'bullets'] }
      },
      required: ['query']
    }
  },
  {
    name: 'qara_research',
    description: 'Comprehensive multi-agent research with fact-checking',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Research topic or question' },
        depth: { type: 'integer', enum: [1, 2, 3, 4], description: 'Research depth' },
        outputFormat: { type: 'string', enum: ['executive', 'full'] }
      },
      required: ['query']
    }
  }
];

export async function handleCodexFunction(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  const runtime = getRuntime();

  switch (name) {
    case 'qara_execute': {
      const result = await runtime.execute(args.query as string, {
        outputFormat: args.outputFormat as any
      });
      return JSON.stringify(result, null, 2);
    }

    case 'qara_research': {
      const orchestrator = new ResearchOrchestrator();
      const result = await orchestrator.execute(args.query as string, {
        depth: (args.depth as 1 | 2 | 3 | 4) || 2,
        outputFormat: (args.outputFormat as any) || 'executive'
      });
      return JSON.stringify(result.executive_brief, null, 2);
    }

    default:
      throw new Error(`Unknown function: ${name}`);
  }
}
```

### 3.2 Codex CLI Plugin

```typescript
// src/integrations/codex/plugin.ts

import { CODEX_FUNCTIONS, handleCodexFunction } from './functions';

export const qaraPlugin = {
  name: 'qara',
  version: '2.0.0',
  
  // Register functions with Codex
  functions: CODEX_FUNCTIONS,
  
  // Handle function calls
  async onFunctionCall(name: string, args: Record<string, unknown>) {
    return await handleCodexFunction(name, args);
  },
  
  // System prompt addition
  systemPrompt: `You have access to Qara, a powerful research and skill execution system.

Available Qara tools:
- qara_execute: Run any Qara skill with automatic routing
- qara_research: Comprehensive research with parallel agents and fact-checking

Use qara_research for any research tasks. It provides:
- Parallel multi-agent research (5-10x faster)
- Built-in fact-checking
- Tiered output (executive brief + detailed analysis)
- Quality metrics and confidence scores

Research depths:
- 1 (quick): 15-30 seconds, fast overview
- 2 (standard): 30-60 seconds, comprehensive
- 3 (deep): 1-2 minutes, thorough analysis
- 4 (extensive): 2-5 minutes, exhaustive investigation`
};
```

### 3.3 Codex CLI Configuration

```yaml
# ~/.codex/config.yaml
plugins:
  - name: qara
    path: /path/to/qara-v2/src/integrations/codex/plugin.ts
    enabled: true

# Or via environment
# CODEX_PLUGINS=/path/to/qara-v2/src/integrations/codex/plugin.ts
```

---

## Part 4: Gemini CLI Integration

### 4.1 Function Declarations

```typescript
// src/integrations/gemini/declarations.ts

import { FunctionDeclaration } from '@google/generative-ai';

export const GEMINI_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'qara_execute',
    description: 'Execute a Qara skill with automatic routing',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query or command'
        },
        skill: {
          type: 'string',
          description: 'Optional: specific skill ID'
        },
        outputFormat: {
          type: 'string',
          enum: ['executive', 'full', 'bullets', 'table']
        }
      },
      required: ['query']
    }
  },
  {
    name: 'qara_research',
    description: 'Comprehensive research with multi-agent execution and fact-checking',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Research topic or question'
        },
        depth: {
          type: 'integer',
          description: '1=quick, 2=standard, 3=deep, 4=extensive'
        },
        outputFormat: {
          type: 'string',
          enum: ['executive', 'full']
        }
      },
      required: ['query']
    }
  }
];
```

### 4.2 Gemini CLI Handler

```typescript
// src/integrations/gemini/handler.ts

import { getRuntime } from '../../runtime/qara';
import { ResearchOrchestrator } from '../../skills/research/orchestrator';

export async function handleGeminiFunction(
  functionCall: { name: string; args: Record<string, unknown> }
): Promise<{ response: string }> {
  const { name, args } = functionCall;
  const runtime = getRuntime();

  switch (name) {
    case 'qara_execute': {
      const result = await runtime.execute(args.query as string, {
        outputFormat: args.outputFormat as any
      });
      return { response: JSON.stringify(result) };
    }

    case 'qara_research': {
      const orchestrator = new ResearchOrchestrator();
      const result = await orchestrator.execute(args.query as string, {
        depth: (args.depth as 1 | 2 | 3 | 4) || 2,
        outputFormat: (args.outputFormat as any) || 'executive'
      });
      return { response: JSON.stringify(result.executive_brief) };
    }

    default:
      return { response: `Unknown function: ${name}` };
  }
}
```

### 4.3 Gemini CLI Configuration

```typescript
// gemini-cli config
import { GEMINI_FUNCTION_DECLARATIONS } from './qara-v2/src/integrations/gemini/declarations';
import { handleGeminiFunction } from './qara-v2/src/integrations/gemini/handler';

const model = genAI.getGenerativeModel({
  model: 'gemini-pro',
  tools: [{ functionDeclarations: GEMINI_FUNCTION_DECLARATIONS }]
});

// In chat loop, handle function calls
if (response.functionCalls) {
  for (const call of response.functionCalls) {
    const result = await handleGeminiFunction(call);
    // Send result back to model
  }
}
```

---

## Part 5: Droid CLI Integration (Optional)

### 5.1 Direct Integration

For custom CLI tools, integrate Qara directly:

```typescript
// src/integrations/droid/index.ts

import { getRuntime } from '../../runtime/qara';
import { ResearchOrchestrator } from '../../skills/research/orchestrator';

export class QaraIntegration {
  private runtime = getRuntime();
  private researchOrchestrator = new ResearchOrchestrator();

  /**
   * Execute any Qara skill
   */
  async execute(query: string, options?: {
    outputFormat?: 'executive' | 'full' | 'bullets';
    verbose?: boolean;
  }) {
    return this.runtime.execute(query, options);
  }

  /**
   * Research with full control
   */
  async research(query: string, options?: {
    depth?: 1 | 2 | 3 | 4;
    outputFormat?: 'executive' | 'full';
    skipFactCheck?: boolean;
    onProgress?: (phase: string, message: string) => void;
  }) {
    return this.researchOrchestrator.execute(query, {
      depth: options?.depth || 2,
      outputFormat: options?.outputFormat || 'executive',
      skipFactCheck: options?.skipFactCheck,
      onProgress: options?.onProgress
    });
  }

  /**
   * List available skills
   */
  listSkills() {
    return this.runtime.listSkills();
  }

  /**
   * Stream research progress
   */
  async *streamResearch(query: string, depth: 1 | 2 | 3 | 4 = 2) {
    const { streamResearch } = await import('../../skills/research/stream');
    yield* streamResearch(query, { depth, outputFormat: 'executive' });
  }
}

// Export singleton
export const qara = new QaraIntegration();
```

### 5.2 Droid CLI Usage

```typescript
// In droid-cli
import { qara } from './integrations/qara';

// Simple execution
const result = await qara.execute('research AI safety');

// Research with progress
const research = await qara.research('quantum computing advances', {
  depth: 3,
  onProgress: (phase, msg) => console.log(`[${phase}] ${msg}`)
});

// Streaming
for await (const progress of qara.streamResearch('cryptocurrency regulation')) {
  console.log(`${progress.progress}% - ${progress.message}`);
}
```

---

## Part 6: Universal HTTP Client

For any CLI that supports HTTP:

### 6.1 Client Library

```typescript
// src/integrations/http-client/index.ts

export class QaraClient {
  constructor(private baseUrl = 'http://localhost:3939') {}

  async execute(query: string, options?: {
    skill?: string;
    outputFormat?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, options })
    });
    return response.json();
  }

  async research(query: string, depth = 2) {
    return this.execute(query, { skill: `research-${['quick', 'standard', 'deep', 'extensive'][depth - 1]}` });
  }

  async *stream(query: string) {
    const response = await fetch(`${this.baseUrl}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value);
      const lines = text.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        yield JSON.parse(line.slice(6));
      }
    }
  }

  async listSkills() {
    const response = await fetch(`${this.baseUrl}/skills`);
    return response.json();
  }
}
```

### 6.2 cURL Examples

```bash
# Execute skill
curl -X POST http://localhost:3939/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "research AI safety", "options": {"outputFormat": "executive"}}'

# List skills
curl http://localhost:3939/skills

# Stream research
curl -N -X POST http://localhost:3939/stream \
  -H "Content-Type: application/json" \
  -d '{"query": "deep research quantum computing"}'
```

---

## File Structure

```
qara-v2/src/
├── server/
│   ├── index.ts              # HTTP server
│   └── schema.ts             # Tool schemas
├── integrations/
│   ├── claude-mcp/
│   │   └── server.ts         # MCP server for Claude
│   ├── codex/
│   │   ├── functions.ts      # Function definitions
│   │   └── plugin.ts         # Codex plugin
│   ├── gemini/
│   │   ├── declarations.ts   # Function declarations
│   │   └── handler.ts        # Function handler
│   ├── droid/
│   │   └── index.ts          # Direct integration
│   └── http-client/
│       └── index.ts          # Universal HTTP client
└── ...
```

---

## Quick Start

### 1. Start Qara Server

```bash
cd qara-v2
bun run src/server/index.ts
# Server running on http://localhost:3939
```

### 2. Configure Your CLI

**Claude CLI:**
```bash
# Add MCP server to ~/.claude/config.json
claude  # Qara tools available automatically
```

**Codex CLI:**
```bash
# Add plugin to config
codex  # Use qara_research function
```

**Gemini CLI:**
```bash
# Import function declarations
gemini  # Qara functions available
```

**Any CLI (HTTP):**
```bash
# Use HTTP endpoints directly
curl http://localhost:3939/execute -d '{"query": "research topic"}'
```

---

## Summary

| Integration | Method | Setup Complexity | Features |
|-------------|--------|------------------|----------|
| Claude CLI | MCP Server | Low | Full tool support, streaming |
| Codex CLI | Function Calling | Low | Function calling, plugins |
| Gemini CLI | Function Declarations | Medium | Function calling |
| Droid CLI | Direct Import | Very Low | Full API access |
| Any CLI | HTTP API | Very Low | Universal compatibility |

All integrations provide access to:
- ✅ Automatic skill routing
- ✅ Research with fact-checking
- ✅ Tiered output (executive/full)
- ✅ Quality metrics
- ✅ Streaming support

---

**Related Documents:**
- [ROUTER_CLI_IMPLEMENTATION.md](./ROUTER_CLI_IMPLEMENTATION.md)
- [RESEARCH_SKILL_OVERVIEW.md](./RESEARCH_SKILL_OVERVIEW.md)

**Document Version:** 1.0  
**Created:** December 3, 2025
