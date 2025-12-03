# Qara View - Observability Dashboard Reference

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Architecture Defined

---

## ⚠️ Critical Review Notes

### Premature Optimization Warning

**Current State:** Qara v2 has ~30 lines of code. Building a dashboard for a system that doesn't exist yet is premature.

### Recommended Approach

| Phase | Observability Strategy |
|-------|------------------------|
| **MVP** | `console.log` with structured JSON |
| **After MVP works** | Log to file, grep-able |
| **After 10+ real uses** | Consider dashboard |

### Why Wait?

1. **You don't know what you need to observe yet**
2. **Dashboard requirements will change** as you use the system
3. **6-8 hours** (your estimate) is significant for a nice-to-have
4. **Svelte/SvelteKit is another dependency** to maintain

### If You Build It Anyway

Minimum viable observability:
```typescript
// This is enough for MVP
function emit(event: string, data: unknown) {
  console.log(JSON.stringify({ 
    ts: Date.now(), 
    event, 
    data 
  }));
}
```

Then pipe to `jq` for analysis: `bun run cli.ts | jq 'select(.event == "llm.request")'`

---

## Overview

**Qara View** is a standalone real-time observability dashboard for monitoring Qara v2 agent activity. It visualizes skill execution, research workflows, LLM calls, and system events through an interactive swim lane timeline.

| Aspect | Description |
|--------|-------------|
| **Type** | Standalone web application |
| **Framework** | Svelte + SvelteKit + Bun |
| **Communication** | WebSocket (real-time) |
| **Ports** | Dashboard: 5173, WebSocket: 3940 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Qara View Dashboard (localhost:5173)                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Svelte Stores ← WebSocket ← Agent Events               ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Toolbar    │ │ Swim Lanes  │ │ Event List  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              ↑ WebSocket
┌─────────────────────────────────────────────────────────────┐
│  Qara v2 Agent                                              │
│  ├─ Observability Emitter (emits events)                    │
│  └─ WebSocket Server (broadcasts to dashboards)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Event Schema

### Base Event

```typescript
interface BaseEvent {
  id: string;           // Unique ID (ULID)
  timestamp: number;    // Unix milliseconds
  type: EventType;      // Event discriminator
  lane: LaneType;       // Swim lane assignment
  parentId?: string;    // Hierarchical parent
}
```

### Event Types

| Type | Lane | Description |
|------|------|-------------|
| `session.start` | system | New execution session |
| `session.end` | system | Session completed |
| `skill.route` | router | Router matched skill |
| `skill.start` | orchestrator | Skill execution began |
| `skill.progress` | orchestrator | Progress update |
| `skill.complete` | orchestrator | Skill finished |
| `skill.error` | orchestrator | Skill failed |
| `research.validate` | research | Scope validation |
| `research.decompose` | research | Query decomposition |
| `research.query.start` | research | Sub-query started |
| `research.query.complete` | research | Sub-query finished |
| `research.factcheck` | research | Fact-checking phase |
| `research.synthesize` | research | Result synthesis |
| `llm.request` | llm | LLM API call started |
| `llm.response` | llm | LLM API call finished |

### Swim Lanes

| Lane | Color | Purpose |
|------|-------|---------|
| `router` | Blue | Routing decisions |
| `orchestrator` | Purple | Skill orchestration |
| `research` | Green | Research-specific |
| `llm` | Orange | LLM API calls |
| `system` | Gray | System events |

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOOLBAR                                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────────────┐ ┌──────┐ ┌──────┐ ┌──────────┐│
│  │ ● Live  │ │ ⏸ Pause │ │ 🔍 Filter...    │ │ Clear│ │Export│ │ ⚙ Settings││
│  └─────────┘ └─────────┘ └─────────────────┘ └──────┘ └──────┘ └──────────┘│
│  Session: abc123 | Events: 47 | Duration: 12.3s | LLM Calls: 8             │
├─────────────────────────────────────────────────────────────────────────────┤
│  SWIM LANES (Timeline View)                                                  │
│                                                                              │
│  Time ──────────────────────────────────────────────────────────────────────│
│  0s        2s        4s        6s        8s        10s       12s            │
│  │         │         │         │         │         │         │              │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼──────────────│
│  │ ROUTER  │                                                                 │
│  │         ■ route (0.8ms)                                                  │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼──────────────│
│  │ ORCH    │                                                                 │
│  │         ████████████████████████████████████████████████████ research    │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼──────────────│
│  │ RESEARCH│                                                                 │
│  │         ■ validate                                                        │
│  │           ■ decompose                                                     │
│  │             ████ query-1 ████                                            │
│  │             ████ query-2 ████████                                        │
│  │             ████ query-3 ██████                                          │
│  │                              ████ factcheck                              │
│  │                                    ██████ synthesize                     │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼──────────────│
│  │ LLM     │                                                                 │
│  │         ■ Haiku (validate)                                               │
│  │           ■ GPT4oMini (decompose)                                        │
│  │             ████ GPT4o (q1) ████                                         │
│  │             ████ Claude (q2) ████████                                    │
│  │             ████ GPT4o (q3) ██████                                       │
│  │                              ████ Claude (factcheck)                     │
│  │                                    ██████ GPT4o (synthesize)             │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴──────────────┘
├─────────────────────────────────────────────────────────────────────────────┤
│  EVENT LIST (Click to expand)                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ ▶ 12:34:56.789  skill.route      router    research-deep (98% exact)    ││
│  │ ▶ 12:34:56.790  skill.start      orch      Deep Research                ││
│  │ ▼ 12:34:56.800  research.validate research  ✓ Clear, 3 topics          ││
│  │   ┌─────────────────────────────────────────────────────────────────┐   ││
│  │   │ query: "AI safety developments 2025"                            │   ││
│  │   │ isClear: true                                                   │   ││
│  │   │ topics: ["alignment", "interpretability", "governance"]         │   ││
│  │   │ duration: 1.2s                                                  │   ││
│  │   └─────────────────────────────────────────────────────────────────┘   ││
│  │ ▶ 12:34:58.000  research.decompose research 6 sub-queries              ││
│  │ ▶ 12:34:58.100  llm.request       llm       GPT4oMini → DecomposeQuery ││
│  │ ▶ 12:34:59.500  llm.response      llm       GPT4oMini ✓ 1.4s 2.1k tok  ││
│  │ ▶ 12:34:59.600  research.query.start research query-1: Technical       ││
│  │ ...                                                                     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
qara-v2-dashboard/
├── src/
│   ├── lib/
│   │   ├── stores/
│   │   │   ├── events.ts        # Event store
│   │   │   └── ui.ts            # UI state
│   │   ├── components/
│   │   │   ├── Toolbar.svelte
│   │   │   ├── SwimLanes.svelte
│   │   │   ├── EventList.svelte
│   │   │   └── EventDetail.svelte
│   │   ├── websocket.ts
│   │   └── types.ts
│   ├── routes/
│   │   └── +page.svelte
│   └── app.html
├── tailwind.config.js
├── svelte.config.js
└── package.json
```

---

## Agent Integration

### Event Types (`src/observability/types.ts`)

```typescript
// Event type discriminators
type EventType = 
  | 'session.start'
  | 'session.end'
  | 'skill.route'
  | 'skill.start'
  | 'skill.progress'
  | 'skill.complete'
  | 'skill.error'
  | 'research.validate'
  | 'research.decompose'
  | 'research.query.start'
  | 'research.query.complete'
  | 'research.factcheck'
  | 'research.synthesize'
  | 'llm.request'
  | 'llm.response'
  | 'llm.stream';

type LaneType = 'router' | 'orchestrator' | 'research' | 'llm' | 'system';
type EventStatus = 'pending' | 'running' | 'complete' | 'error';

// Base event interface
interface BaseEvent {
  id: string;
  timestamp: number;
  type: EventType;
  lane: LaneType;
  parentId?: string;
}

// Specific event interfaces
interface SkillRouteEvent extends BaseEvent {
  type: 'skill.route';
  lane: 'router';
  data: {
    input: string;
    matchedSkill: string;
    confidence: number;
    matchType: 'exact' | 'prefix' | 'fuzzy';
    routingTimeMs: number;
  };
}

interface SkillStartEvent extends BaseEvent {
  type: 'skill.start';
  lane: 'orchestrator';
  data: {
    skillId: string;
    skillName: string;
    input: string;
    params: Record<string, unknown>;
  };
}

interface SkillProgressEvent extends BaseEvent {
  type: 'skill.progress';
  lane: 'orchestrator';
  data: {
    skillId: string;
    phase: string;
    progress: number;
    message: string;
  };
}

interface SkillCompleteEvent extends BaseEvent {
  type: 'skill.complete';
  lane: 'orchestrator';
  data: {
    skillId: string;
    durationMs: number;
    success: boolean;
    result?: unknown;
  };
}

interface ResearchValidateEvent extends BaseEvent {
  type: 'research.validate';
  lane: 'research';
  data: {
    query: string;
    isClear: boolean;
    topics: string[];
    clarificationNeeded?: string[];
  };
}

interface ResearchDecomposeEvent extends BaseEvent {
  type: 'research.decompose';
  lane: 'research';
  data: {
    queryCount: number;
    queries: Array<{ id: string; focus: string; priority: number }>;
  };
}

interface ResearchQueryEvent extends BaseEvent {
  type: 'research.query.start' | 'research.query.complete';
  lane: 'research';
  data: {
    queryId: string;
    focus: string;
    status: EventStatus;
    durationMs?: number;
    findingsCount?: number;
  };
}

interface LLMRequestEvent extends BaseEvent {
  type: 'llm.request';
  lane: 'llm';
  data: {
    requestId: string;
    client: string;
    function: string;
    inputTokens?: number;
  };
}

interface LLMResponseEvent extends BaseEvent {
  type: 'llm.response';
  lane: 'llm';
  data: {
    requestId: string;
    client: string;
    durationMs: number;
    outputTokens?: number;
    totalTokens?: number;
    success: boolean;
    error?: string;
  };
}

// Union type
type QaraEvent = 
  | SkillRouteEvent
  | SkillStartEvent
  | SkillProgressEvent
  | SkillCompleteEvent
  | ResearchValidateEvent
  | ResearchDecomposeEvent
  | ResearchQueryEvent
  | LLMRequestEvent
  | LLMResponseEvent;
```

### Emitter (`src/observability/emitter.ts`)

```typescript
import { ulid } from 'ulid';
import type { QaraEvent, LaneType, EventType } from './types';

type EventListener = (event: QaraEvent) => void;

class ObservabilityEmitter {
  private listeners: Set<EventListener> = new Set();
  private sessionId: string | null = null;
  private eventStack: string[] = [];

  startSession(input: string): string {
    this.sessionId = ulid();
    this.emit({
      type: 'session.start',
      lane: 'system',
      data: { sessionId: this.sessionId, input, timestamp: Date.now() }
    });
    return this.sessionId;
  }

  emit<T extends Omit<QaraEvent, 'id' | 'timestamp' | 'parentId'>>(event: T): string {
    const id = ulid();
    const fullEvent: QaraEvent = {
      ...event,
      id,
      timestamp: Date.now(),
      parentId: this.eventStack[this.eventStack.length - 1]
    } as QaraEvent;

    this.listeners.forEach(listener => listener(fullEvent));
    return id;
  }

  scope<T>(eventPartial: Omit<QaraEvent, 'id' | 'timestamp' | 'parentId'>, fn: () => T): T {
    const id = this.emit(eventPartial);
    this.eventStack.push(id);
    try {
      return fn();
    } finally {
      this.eventStack.pop();
    }
  }

  async scopeAsync<T>(
    eventPartial: Omit<QaraEvent, 'id' | 'timestamp' | 'parentId'>,
    fn: () => Promise<T>
  ): Promise<T> {
    const id = this.emit(eventPartial);
    this.eventStack.push(id);
    try {
      return await fn();
    } finally {
      this.eventStack.pop();
    }
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const emitter = new ObservabilityEmitter();
```

### WebSocket Server (`src/observability/server.ts`)

```typescript
import { emitter } from './emitter';
import type { QaraEvent } from './types';

const clients = new Set<WebSocket>();

export function startObservabilityServer(port = 3940) {
  const server = Bun.serve({
    port,
    fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }
      return new Response('Qara View Server', { status: 200 });
    },
    websocket: {
      open(ws) {
        clients.add(ws);
        console.log(`[qara-view] Client connected (${clients.size} total)`);
      },
      close(ws) {
        clients.delete(ws);
        console.log(`[qara-view] Client disconnected (${clients.size} total)`);
      },
      message(ws, message) {
        const cmd = JSON.parse(message as string);
        if (cmd.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      }
    }
  });

  emitter.subscribe((event: QaraEvent) => {
    const message = JSON.stringify(event);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  console.log(`[qara-view] Server running on ws://localhost:${port}`);
  return server;
}
```

### Instrumentation Example

```typescript
// In router
emitter.emit({
  type: 'skill.route',
  lane: 'router',
  data: {
    input: 'research AI safety',
    matchedSkill: 'research-deep',
    confidence: 0.98,
    matchType: 'exact',
    routingTimeMs: 0.8
  }
});

// In research orchestrator with scoping
await emitter.scopeAsync(
  { type: 'skill.start', lane: 'orchestrator', data: { skillId: 'research-deep', ... } },
  async () => {
    emitter.emit({ type: 'research.validate', lane: 'research', data: { ... } });
    emitter.emit({ type: 'research.decompose', lane: 'research', data: { ... } });
    // Child events automatically get parentId
  }
);
```

---

## Dashboard Implementation

### Svelte Stores (`src/lib/stores/events.ts`)

```typescript
import { writable, derived } from 'svelte/store';
import type { QaraEvent, LaneType } from '$lib/types';

// All events
export const events = writable<QaraEvent[]>([]);

// Derived: events grouped by lane
export const eventsByLane = derived(events, ($events) => {
  const lanes: Record<LaneType, QaraEvent[]> = {
    router: [],
    orchestrator: [],
    research: [],
    llm: [],
    system: []
  };
  
  for (const event of $events) {
    lanes[event.lane].push(event);
  }
  
  return lanes;
});

// Derived: timeline bounds
export const timeline = derived(events, ($events) => {
  if ($events.length === 0) return { start: 0, end: 0, duration: 0 };
  
  const start = Math.min(...$events.map(e => e.timestamp));
  const end = Math.max(...$events.map(e => e.timestamp));
  
  return { start, end, duration: end - start };
});

// Derived: statistics
export const stats = derived(events, ($events) => ({
  total: $events.length,
  llmCalls: $events.filter(e => e.type === 'llm.request').length,
  duration: $events.length > 0 
    ? Math.max(...$events.map(e => e.timestamp)) - Math.min(...$events.map(e => e.timestamp))
    : 0
}));

// Actions
export function addEvent(event: QaraEvent) {
  events.update(e => [...e, event].slice(-1000)); // Keep last 1000
}

export function clearEvents() {
  events.set([]);
}
```

### UI Store (`src/lib/stores/ui.ts`)

```typescript
import { writable } from 'svelte/store';
import type { LaneType } from '$lib/types';

export const selectedEventId = writable<string | null>(null);
export const isPaused = writable(false);
export const visibleLanes = writable<Set<LaneType>>(
  new Set(['router', 'orchestrator', 'research', 'llm'])
);
export const searchQuery = writable('');
export const expandedEvents = writable<Set<string>>(new Set());

// Actions
export function toggleEventExpanded(id: string) {
  expandedEvents.update(set => {
    const newSet = new Set(set);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
}

export function toggleLane(lane: LaneType) {
  visibleLanes.update(set => {
    const newSet = new Set(set);
    if (newSet.has(lane)) {
      newSet.delete(lane);
    } else {
      newSet.add(lane);
    }
    return newSet;
  });
}
```

### WebSocket Client (`src/lib/websocket.ts`)

```typescript
import { addEvent, clearEvents } from './stores/events';
import { isPaused } from './stores/ui';
import { get } from 'svelte/store';

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function connect(url = 'ws://localhost:3940') {
  if (ws?.readyState === WebSocket.OPEN) return;

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('[ws] Connected to Qara View server');
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onmessage = (event) => {
    if (get(isPaused)) return;
    
    try {
      const data = JSON.parse(event.data);
      addEvent(data);
    } catch (e) {
      console.error('[ws] Failed to parse event:', e);
    }
  };

  ws.onclose = () => {
    console.log('[ws] Disconnected, reconnecting in 2s...');
    reconnectTimer = setTimeout(() => connect(url), 2000);
  };

  ws.onerror = (error) => {
    console.error('[ws] Error:', error);
  };
}

export function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  ws?.close();
  ws = null;
}

export function send(message: unknown) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
```

### Main Page (`src/routes/+page.svelte`)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { connect } from '$lib/websocket';
  import { events, eventsByLane, timeline, stats } from '$lib/stores/events';
  import { selectedEventId, isPaused, visibleLanes } from '$lib/stores/ui';
  
  import Toolbar from '$lib/components/Toolbar.svelte';
  import SwimLanes from '$lib/components/SwimLanes.svelte';
  import EventList from '$lib/components/EventList.svelte';

  onMount(() => {
    connect();
  });
</script>

<div class="h-screen flex flex-col bg-gray-900 text-gray-100">
  <Toolbar {stats} />
  
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Swim Lanes: 40% height -->
    <div class="h-2/5 border-b border-gray-700 overflow-auto">
      <SwimLanes 
        events={$eventsByLane} 
        timeline={$timeline}
        {visibleLanes}
        on:select={(e) => $selectedEventId = e.detail}
      />
    </div>
    
    <!-- Event List: 60% height -->
    <div class="h-3/5 overflow-auto">
      <EventList 
        events={$events}
        selectedId={$selectedEventId}
        on:select={(e) => $selectedEventId = e.detail}
      />
    </div>
  </div>
</div>

<style>
  :global(body) {
    @apply bg-gray-900;
  }
</style>
```

### Toolbar Component (`src/lib/components/Toolbar.svelte`)

```svelte
<script lang="ts">
  import { isPaused, visibleLanes } from '$lib/stores/ui';
  import { clearEvents, events } from '$lib/stores/events';
  
  export let stats: { total: number; llmCalls: number; duration: number };
  
  function exportEvents() {
    const data = JSON.stringify($events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qara-events-${Date.now()}.json`;
    a.click();
  }
</script>

<div class="bg-gray-800 border-b border-gray-700 p-3">
  <div class="flex items-center gap-3">
    <!-- Live/Pause -->
    <button
      class="px-3 py-1.5 rounded text-sm font-medium transition-colors"
      class:bg-green-600={!$isPaused}
      class:bg-yellow-600={$isPaused}
      on:click={() => $isPaused = !$isPaused}
    >
      {$isPaused ? '⏸ Paused' : '● Live'}
    </button>
    
    <!-- Clear -->
    <button
      class="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm"
      on:click={clearEvents}
    >
      Clear
    </button>
    
    <!-- Export -->
    <button
      class="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm"
      on:click={exportEvents}
    >
      Export
    </button>
    
    <!-- Spacer -->
    <div class="flex-1" />
    
    <!-- Stats -->
    <div class="text-sm text-gray-400">
      Events: <span class="text-white">{stats.total}</span> |
      LLM Calls: <span class="text-white">{stats.llmCalls}</span> |
      Duration: <span class="text-white">{(stats.duration / 1000).toFixed(1)}s</span>
    </div>
  </div>
</div>
```

### Event List Component (`src/lib/components/EventList.svelte`)

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { expandedEvents, toggleEventExpanded } from '$lib/stores/ui';
  import type { QaraEvent } from '$lib/types';
  
  export let events: QaraEvent[];
  export let selectedId: string | null;
  
  const dispatch = createEventDispatcher();
  
  const laneColors: Record<string, string> = {
    router: 'bg-blue-900/50 text-blue-300',
    orchestrator: 'bg-purple-900/50 text-purple-300',
    research: 'bg-green-900/50 text-green-300',
    llm: 'bg-orange-900/50 text-orange-300',
    system: 'bg-gray-800/50 text-gray-300'
  };
  
  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }
</script>

<div class="divide-y divide-gray-800">
  {#each events as event (event.id)}
    {@const isExpanded = $expandedEvents.has(event.id)}
    {@const isSelected = selectedId === event.id}
    
    <div
      class="hover:bg-gray-800/50 cursor-pointer transition-colors"
      class:bg-gray-800={isSelected}
      on:click={() => dispatch('select', event.id)}
    >
      <!-- Row -->
      <div class="flex items-center gap-3 px-4 py-2 text-sm">
        <button
          class="w-4 text-gray-500"
          on:click|stopPropagation={() => toggleEventExpanded(event.id)}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        
        <span class="text-gray-500 font-mono text-xs">
          {formatTime(event.timestamp)}
        </span>
        
        <span class="font-medium w-40 truncate">
          {event.type}
        </span>
        
        <span class="px-2 py-0.5 rounded text-xs {laneColors[event.lane]}">
          {event.lane}
        </span>
        
        <span class="text-gray-400 truncate flex-1">
          {JSON.stringify(event.data).slice(0, 60)}...
        </span>
      </div>
      
      <!-- Expanded Detail -->
      {#if isExpanded}
        <div class="px-12 pb-3">
          <pre class="bg-gray-950 rounded p-3 text-xs overflow-auto max-h-48">
{JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      {/if}
    </div>
  {/each}
</div>
```

---

## Launch Commands

```bash
# Terminal 1: Agent with observability
bun run src/index.ts --observability

# Terminal 2: Dashboard
cd qara-v2-dashboard && bun run dev
```

---

## Dependencies

```json
{
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "svelte": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "chart.js": "^4.4.0"
  }
}
```

---

## Color Scheme

| Lane | Background | Border |
|------|------------|--------|
| Router | `blue-900/50` | `blue-500` |
| Orchestrator | `purple-900/50` | `purple-500` |
| Research | `green-900/50` | `green-500` |
| LLM | `orange-900/50` | `orange-500` |
| System | `gray-800/50` | `gray-500` |

---

## Related Documents

- [ROUTER_CLI_IMPLEMENTATION.md](./ROUTER_CLI_IMPLEMENTATION.md)
- [RESEARCH_SKILL_OVERVIEW.md](./RESEARCH_SKILL_OVERVIEW.md)
- [CLI_INTEGRATION_GUIDE.md](./CLI_INTEGRATION_GUIDE.md)
