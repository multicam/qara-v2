# Qara v2 - Implementation Index

**Date:** December 3, 2025  
**Status:** Planning Complete → Ready for Implementation

---

## ⚠️ Critical Review Notes

> **Anti-Yes-Man Review Completed:** December 3, 2025

### Key Risks Identified

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Documentation > Code** | HIGH | 6,500 lines docs, ~30 lines code. Start building before documenting more. |
| **Scope Creep** | HIGH | 5+ skills planned before core works. Cut to true MVP. |
| **Cost Controls Missing** | MEDIUM | No LLM cost tracking. Depth=4 research = 16+ API calls. |
| **Error Handling Undefined** | MEDIUM | No strategy for API failures, timeouts, malformed responses. |

### True MVP (Recommended)

Before Phase 2, prove this works end-to-end:
```
MVP Scope (10 hours):
├── Router + types
├── Research skill (depth=1 ONLY, no fact-check)
├── CLI that invokes it
└── One successful research query
```

### Questions to Answer Before Proceeding

- [ ] Who is the primary user? (You? Developers? Broader?)
- [ ] What's the cost budget per query?
- [ ] How do skills compose? (Research → Pitch?)
- [ ] What's the error handling strategy?
- [ ] Is <1ms routing valuable when LLM calls take 1-30s?

### Deferred Until Proven Needed

| Feature | Reason to Defer |
|---------|-----------------|
| Qara View Dashboard | Build observability into code first (console.log) |
| CLI Integrations | One integration first, not four |
| Coding Workflow Skill | Already exists as Claude commands |
| Phase 5 Skills | Prove core works first |

---

## Document Overview

| Document | Lines | Purpose | Phase |
|----------|-------|---------|-------|
| `ROUTER_CLI_IMPLEMENTATION.md` | ~600 | Router, runtime, CLI | **Phase 1** |
| `RESEARCH_SKILL_OVERVIEW.md` | ~230 | Research architecture | **Phase 2** |
| `RESEARCH_SKILL_BAML.md` | ~350 | BAML types & functions | **Phase 2** |
| `RESEARCH_SKILL_TYPESCRIPT.md` | ~350 | Orchestrator code | **Phase 2** |
| `CLI_INTEGRATION_GUIDE.md` | ~880 | External CLI integrations | **Phase 3** |
| `QARA_VIEW_REFERENCE.md` | ~875 | Observability dashboard | **Phase 4** |
| `FABRIC_SKILL_INTEGRATION.md` | ~450 | Fabric pattern integration | **Phase 5** |
| `PROMPTING_SKILL_INTEGRATION.md` | ~400 | Prompt engineering skill | **Phase 5+** |
| `HORMOZI_PITCH_SKILL_INTEGRATION.md` | ~500 | Sales pitch generation | **Phase 5+** |
| `FRONTEND_DESIGN_SKILL_INTEGRATION.md` | ~550 | UI/UX design & code gen | **Phase 5+** |
| `CODING_WORKFLOW_SKILL_INTEGRATION.md` | ~1200 | Full dev workflow (research→plan→implement→validate) | **Phase 5+** |
| `SATELLITE_SKILLS.md` | ~90 | Future skill ideas | **Reference** |

**Total Documentation:** ~6,475 lines

---

## Implementation Phases

### Phase 1: Core Infrastructure ✅ COMPLETE

**Goal:** Working router + runtime + basic CLI

**Documents:** `ROUTER_CLI_IMPLEMENTATION.md`

**Deliverables:**
```
src/
├── router/
│   ├── types.ts                 # SkillFunction, RouteMatch, RouteNode
│   ├── router.ts                # QaraRouter (trie-based)
│   └── index.ts                 # Module exports
├── skills/
│   ├── registry.ts              # SKILLS array
│   └── index.ts                 # Module exports
├── runtime/
│   ├── qara.ts                  # QaraRuntime, getRuntime()
│   ├── baml-stub.ts             # Mock BAML client for testing
│   └── index.ts                 # Module exports
└── cli/
    └── index.ts                 # CLI entry point
```

**Tasks:**
- [x] 1.1 Create `src/router/types.ts`
- [x] 1.2 Create `src/router/router.ts`
- [x] 1.3 Create `src/skills/registry.ts` (with placeholder skills)
- [x] 1.4 Create `src/runtime/qara.ts`
- [x] 1.5 Create `src/cli/index.ts`
- [x] 1.6 Update `package.json` scripts
- [x] 1.7 Test: `bun run src/cli/index.ts list`
- [x] 1.8 Test: `bun run src/cli/index.ts "research AI safety"` (routes correctly)
- [x] 1.9 All 23 tests passing (`bun test`)

**Completed:** December 3, 2025
**Actual Time:** ~30 minutes

---

### Phase 2: Research Skill 🔬

**Goal:** Full research capability with BAML

**Documents:** 
- `RESEARCH_SKILL_OVERVIEW.md` (architecture)
- `RESEARCH_SKILL_BAML.md` (BAML code)
- `RESEARCH_SKILL_TYPESCRIPT.md` (orchestrator)

**Deliverables:**
```
baml_src/
└── skills/
    └── research/
        ├── types.baml           # Source, Finding, ResearchResult, etc.
        ├── validate.baml        # ValidateResearchScope
        ├── decompose.baml       # DecomposeQuery
        ├── research.baml        # ResearchTopic
        ├── factcheck.baml       # FactCheckClaims
        └── synthesize.baml      # SynthesizeFindings

src/
└── skills/
    └── research/
        ├── orchestrator.ts      # ResearchOrchestrator
        └── stream.ts            # streamResearch generator
```

**Tasks:**
- [ ] 2.1 Create `baml_src/skills/research/types.baml`
- [ ] 2.2 Create `baml_src/skills/research/validate.baml`
- [ ] 2.3 Create `baml_src/skills/research/decompose.baml`
- [ ] 2.4 Create `baml_src/skills/research/research.baml`
- [ ] 2.5 Create `baml_src/skills/research/factcheck.baml`
- [ ] 2.6 Create `baml_src/skills/research/synthesize.baml`
- [ ] 2.7 Run `baml-cli generate`
- [ ] 2.8 Create `src/skills/research/orchestrator.ts`
- [ ] 2.9 Create `src/skills/research/stream.ts`
- [ ] 2.10 Update `src/skills/registry.ts` with research skills
- [ ] 2.11 Update `src/runtime/qara.ts` to handle research
- [ ] 2.12 Test: `bun run src/cli/index.ts "research AI safety"`

**Estimated Time:** 4-6 hours

**Dependencies:** Phase 1 complete

---

### Phase 3: CLI Integrations 🔌

**Goal:** Qara accessible from Claude CLI, Codex, etc.

**Document:** `CLI_INTEGRATION_GUIDE.md`

**Deliverables:**
```
src/
├── server/
│   ├── index.ts                 # HTTP server (:3939)
│   └── schema.ts                # Tool schemas
└── integrations/
    ├── claude-mcp/
    │   └── server.ts            # MCP server
    ├── codex/
    │   ├── functions.ts
    │   └── plugin.ts
    ├── gemini/
    │   ├── declarations.ts
    │   └── handler.ts
    ├── droid/
    │   └── index.ts
    └── http-client/
        └── index.ts
```

**Tasks:**
- [ ] 3.1 Create `src/server/schema.ts`
- [ ] 3.2 Create `src/server/index.ts`
- [ ] 3.3 Test HTTP endpoints with cURL
- [ ] 3.4 Install `@modelcontextprotocol/sdk`
- [ ] 3.5 Create `src/integrations/claude-mcp/server.ts`
- [ ] 3.6 Test with Claude CLI
- [ ] 3.7 Create `src/integrations/http-client/index.ts`
- [ ] 3.8 (Optional) Codex/Gemini integrations

**Estimated Time:** 3-4 hours

**Dependencies:** Phase 2 complete

---

### Phase 4: Qara View Dashboard 📊

**Goal:** Real-time observability UI

**Document:** `QARA_VIEW_REFERENCE.md`

**Deliverables:**
```
src/
└── observability/
    ├── types.ts                 # Event types
    ├── emitter.ts               # ObservabilityEmitter
    └── server.ts                # WebSocket server (:3940)

qara-v2-dashboard/              # Separate SvelteKit project
├── src/
│   ├── lib/
│   │   ├── stores/
│   │   │   ├── events.ts
│   │   │   └── ui.ts
│   │   ├── components/
│   │   │   ├── Toolbar.svelte
│   │   │   ├── SwimLanes.svelte
│   │   │   └── EventList.svelte
│   │   ├── websocket.ts
│   │   └── types.ts
│   └── routes/
│       └── +page.svelte
├── tailwind.config.js
└── package.json
```

**Tasks:**
- [ ] 4.1 Create `src/observability/types.ts`
- [ ] 4.2 Create `src/observability/emitter.ts`
- [ ] 4.3 Create `src/observability/server.ts`
- [ ] 4.4 Instrument router with events
- [ ] 4.5 Instrument research orchestrator with events
- [ ] 4.6 Create SvelteKit project: `bun create svelte qara-v2-dashboard`
- [ ] 4.7 Install Tailwind, Chart.js
- [ ] 4.8 Create Svelte stores
- [ ] 4.9 Create WebSocket client
- [ ] 4.10 Create Toolbar component
- [ ] 4.11 Create SwimLanes component
- [ ] 4.12 Create EventList component
- [ ] 4.13 Test end-to-end with research query

**Estimated Time:** 6-8 hours

**Dependencies:** Phase 2 complete (for testing)

---

### Phase 5: Additional Skills 🧩

**Goal:** Expand skill library with high-value capabilities

**Documents:**
- `FABRIC_SKILL_INTEGRATION.md` - Fabric patterns
- `PROMPTING_SKILL_INTEGRATION.md` - Prompt engineering
- `HORMOZI_PITCH_SKILL_INTEGRATION.md` - Sales pitches
- `FRONTEND_DESIGN_SKILL_INTEGRATION.md` - UI/UX design
- `CODING_WORKFLOW_SKILL_INTEGRATION.md` - Full dev workflow ⭐

**Deliverables:**
```
baml_src/skills/
├── fabric/
│   ├── types.baml
│   ├── patterns.baml
│   └── dynamic.baml
├── prompting/
│   ├── types.baml
│   └── functions.baml
├── hormozi/
│   ├── types.baml
│   └── functions.baml
├── frontend/
│   ├── types.baml
│   └── functions.baml
└── coding/
    ├── types.baml
    ├── research.baml
    ├── planning.baml
    ├── implementation.baml
    ├── validation.baml
    └── knowledge.baml

src/skills/
├── fabric/orchestrator.ts
├── prompting/orchestrator.ts
├── hormozi/orchestrator.ts
├── frontend/orchestrator.ts
└── coding/
    ├── research-orchestrator.ts
    ├── planning-orchestrator.ts
    ├── implementation-orchestrator.ts
    ├── validation-orchestrator.ts
    └── knowledge-orchestrator.ts
```

#### 5a: Fabric Skill
- [ ] Install Fabric CLI
- [ ] Create BAML types and patterns
- [ ] Create orchestrator with stitching
- [ ] Test: `qara "summarize" < article.txt`

#### 5b: Prompting Skill
- [ ] Create BAML types (PromptQuality, EnhancedPrompt)
- [ ] Create functions (Analyze, Enhance, Generate)
- [ ] Create orchestrator with iterative refinement
- [ ] Test: `qara "enhance prompt: write a blog"`

#### 5c: Hormozi Pitch Skill
- [ ] Create BAML types (ValueEquation, GrandSlamOffer)
- [ ] Create functions (Value, Offer, Stack, LeadMagnet)
- [ ] Create orchestrator
- [ ] Test: `qara "hormozi pitch for SaaS product"`

#### 5d: Frontend Design Skill
- [ ] Create BAML types (ComponentSpec, PageLayout, DesignSystem)
- [ ] Create functions (Design, Generate, Copy)
- [ ] Create orchestrator with framework support
- [ ] Test: `qara "design react button component"`

#### 5e: Coding Workflow Skill ⭐ (Critical)
- [ ] Create `baml_src/skills/coding/types.baml` (all workflow types)
- [ ] Create `baml_src/skills/coding/research.baml` (LocateCode, AnalyzeCode, FindPatterns)
- [ ] Create `baml_src/skills/coding/planning.baml` (AnalyzeContext, DesignOptions, WriteImplementationPlan)
- [ ] Create `baml_src/skills/coding/implementation.baml` (ParsePlan, GenerateCode, DetectMismatch)
- [ ] Create `baml_src/skills/coding/validation.baml` (ComparePlanToCode, GenerateValidationReport)
- [ ] Create `baml_src/skills/coding/knowledge.baml` (CreateHandoff, CaptureLearning)
- [ ] Create all 5 orchestrators in `src/skills/coding/`
- [ ] Test full workflow: research → plan → implement → validate → handoff

**Estimated Time:** 18-22 hours total (3-4h each skill, 15-20h for coding workflow)

**Dependencies:** Phase 2 complete

---

## Dependency Graph

```
Phase 1: Core Infrastructure
    │
    ├──→ Phase 2: Research Skill
    │        │
    │        ├──→ Phase 3: CLI Integrations
    │        │
    │        ├──→ Phase 4: Qara View
    │        │
    │        └──→ Phase 5: Additional Skills
    │             ├─ 5a: Fabric
    │             ├─ 5b: Prompting
    │             ├─ 5c: Hormozi Pitch
    │             ├─ 5d: Frontend Design
    │             └─ 5e: Coding Workflow ⭐
    │
    └──→ (More skills can be added in parallel)
```

---

## File Creation Order

### Day 1: Core (Phase 1)
```bash
# 1. Router types and implementation
touch src/router/types.ts
touch src/router/router.ts

# 2. Skill registry
touch src/skills/registry.ts

# 3. Runtime
touch src/runtime/qara.ts

# 4. CLI
touch src/cli/index.ts
```

### Day 2: Research BAML (Phase 2a)
```bash
# BAML files
mkdir -p baml_src/skills/research
touch baml_src/skills/research/types.baml
touch baml_src/skills/research/validate.baml
touch baml_src/skills/research/decompose.baml
touch baml_src/skills/research/research.baml
touch baml_src/skills/research/factcheck.baml
touch baml_src/skills/research/synthesize.baml

# Generate TypeScript
baml-cli generate
```

### Day 3: Research TypeScript (Phase 2b)
```bash
# Orchestrator
mkdir -p src/skills/research
touch src/skills/research/orchestrator.ts
touch src/skills/research/stream.ts
```

### Day 4: Server & Integrations (Phase 3)
```bash
# HTTP Server
mkdir -p src/server
touch src/server/index.ts
touch src/server/schema.ts

# Claude MCP
mkdir -p src/integrations/claude-mcp
touch src/integrations/claude-mcp/server.ts
```

### Day 5+: Dashboard (Phase 4)
```bash
# Agent-side observability
mkdir -p src/observability
touch src/observability/types.ts
touch src/observability/emitter.ts
touch src/observability/server.ts

# Dashboard (separate project)
bun create svelte@latest qara-v2-dashboard
cd qara-v2-dashboard
bun add -D tailwindcss postcss autoprefixer
bun add chart.js
```

---

## Quick Reference

### Commands

```bash
# Development
bun run src/cli/index.ts "research AI safety"
bun run src/server/index.ts                    # HTTP server
bun run src/integrations/claude-mcp/server.ts  # MCP server

# BAML
baml-cli generate                              # Generate TypeScript
baml-cli test                                  # Run BAML tests

# Dashboard
cd qara-v2-dashboard && bun run dev            # Start dashboard

# Testing
bun test                                       # Run all tests
```

### Ports

| Service | Port | Purpose |
|---------|------|---------|
| HTTP Server | 3939 | REST API |
| WebSocket | 3940 | Qara View events |
| Dashboard | 5173 | Svelte dev server |

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional
QARA_PORT=3939
QARA_WS_PORT=3940
GOOGLE_API_KEY=...
```

---

## Success Criteria

### Phase 1 Complete When: ✅
- [x] `bun run src/cli/index.ts list` shows skills
- [x] `bun run src/cli/index.ts "research test"` routes correctly
- [x] Router benchmarks <1ms (achieved: 0.0012ms average)

### Phase 2 Complete When:
- [ ] `baml-cli test` passes all research tests
- [ ] `bun run src/cli/index.ts "research AI safety"` returns results
- [ ] Quick research <30s, Standard <60s

### Phase 3 Complete When:
- [ ] `curl localhost:3939/health` returns OK
- [ ] Claude CLI can call `qara_research`
- [ ] Results display correctly

### Phase 4 Complete When:
- [ ] Dashboard shows live events
- [ ] Swim lanes visualize research phases
- [ ] Event list expands with details

---

## Notes

- **Start with Phase 1** - Everything depends on router/runtime
- **BAML first in Phase 2** - TypeScript depends on generated types
- **Test incrementally** - Each phase should be testable standalone
- **Dashboard is optional** - Can be deferred if time-constrained

---

## What Remains

### Next: Phase 2 - Research Skill
1. Create BAML types and functions in `baml_src/skills/research/`
2. Run `baml-cli generate` to create TypeScript client
3. Replace `src/runtime/baml-stub.ts` with real BAML client import
4. Create orchestrator in `src/skills/research/`
5. Test end-to-end research queries

### Future Phases
- **Phase 3:** CLI Integrations (MCP server, HTTP API)
- **Phase 4:** Qara View Dashboard (observability)
- **Phase 5:** Additional Skills (Fabric, Prompting, Hormozi, Frontend, Coding)

---

**Phase 1 Complete. Ready to begin Phase 2?**
