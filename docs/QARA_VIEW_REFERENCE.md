# Qara View - Observability Dashboard Reference

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Architecture Defined

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
┌─────────────────────────────────────────────────────────────┐
│  TOOLBAR                                                     │
│  [● Live] [⏸ Pause] [🔍 Filter] [Clear] [Export] [⚙]       │
│  Session: abc123 | Events: 47 | Duration: 12.3s             │
├─────────────────────────────────────────────────────────────┤
│  SWIM LANES (40% height)                                     │
│  ROUTER      ■ route                                         │
│  ORCH        ████████████████████████████████ research      │
│  RESEARCH    ■ validate ■ decompose ████ q1 q2 q3           │
│  LLM         ■■■ ████ ████ ████ ████ ████                   │
├─────────────────────────────────────────────────────────────┤
│  EVENT LIST (60% height, expandable)                         │
│  ▶ 12:34:56  skill.route      router   research-deep       │
│  ▼ 12:34:56  research.validate research ✓ Clear            │
│    { query: "AI safety...", topics: [...] }                 │
└─────────────────────────────────────────────────────────────┘
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

### Emitter

```typescript
// src/observability/emitter.ts
class ObservabilityEmitter {
  emit(event) { /* broadcast to listeners */ }
  scope(event, fn) { /* hierarchical tracking */ }
  subscribe(fn) { /* add listener */ }
}
export const emitter = new ObservabilityEmitter();
```

### WebSocket Server

```typescript
// src/observability/server.ts
export function startObservabilityServer(port = 3940) {
  Bun.serve({
    port,
    websocket: { open(ws), close(ws) }
  });
  emitter.subscribe(event => broadcast(event));
}
```

---

## Svelte Stores

```typescript
// events.ts
export const events = writable<QaraEvent[]>([]);
export const eventsByLane = derived(events, ...);
export const timeline = derived(events, ...);

// ui.ts
export const selectedEventId = writable<string | null>(null);
export const isPaused = writable(false);
export const visibleLanes = writable(new Set([...]));
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
