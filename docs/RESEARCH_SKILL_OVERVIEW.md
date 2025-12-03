# Qara v2: Research Skill - Overview & Architecture

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation

---

## ⚠️ Critical Review Notes

### Complexity Warning

The 5-phase workflow is ambitious. Consider starting with **depth=1 only**:

| Phase | MVP? | Reason |
|-------|------|--------|
| 1. Validate | ✅ Yes | Simple, fast |
| 2. Decompose | ❌ Skip for MVP | Just use original query |
| 3. Research | ✅ Yes (single query) | Core value |
| 4. Fact-check | ❌ Skip for MVP | Add after basic works |
| 5. Synthesize | ✅ Simplified | Just format findings |

### Unaddressed Failure Modes

- What if validation says "ambiguous" but user wants to proceed?
- What if parallel queries return conflicting information?
- What if fact-checking contradicts research findings?
- Timeout strategy? (Identified as problem in original Qara post-mortem)
- Partial failures? (3 of 5 queries succeed - what then?)

### Cost Implications

| Depth | Queries | Est. LLM Calls | Est. Cost |
|-------|---------|----------------|-----------|
| 1 (Quick) | 2 | 4-5 | $0.05-0.10 |
| 2 (Standard) | 4-6 | 8-12 | $0.10-0.25 |
| 3 (Deep) | 8-10 | 15-20 | $0.25-0.50 |
| 4 (Extensive) | 12-16 | 25-35 | $0.50-1.00 |

**Recommendation:** Add cost tracking from day 1.

---

## Overview

The Research skill is Qara v2's flagship capability - a parallel multi-agent research system that delivers comprehensive, fact-checked results with tiered output for optimal time-to-insight.

### Key Features

- **Two-phase workflow** - Validate scope before deep research (prevents pivots)
- **Parallel execution** - 5-10x faster than sequential research
- **Intelligent decomposition** - Queries split into non-overlapping sub-queries
- **Built-in fact-checking** - Claims verified before synthesis
- **Tiered output** - Executive brief (3 min read) → Full analysis → Sources
- **Quality metrics** - Coverage, confidence, depth scoring

### Research Modes

| Mode | Depth | Time | Queries | Use Case |
|------|-------|------|---------|----------|
| Quick | 1 | 15-30s | 2 | Fast overview |
| Standard | 2 | 30-60s | 4-6 | General research |
| Deep | 3 | 1-2min | 8-10 | Thorough analysis |
| Extensive | 4 | 2-5min | 12-16 | Exhaustive investigation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  RESEARCH WORKFLOW                                          │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │ 1. Validate │ → │ 2. Decompose│ → │ 3. Research │       │
│  │    Scope    │   │    Query    │   │   (Parallel)│       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│         │                                    │              │
│         ▼                                    ▼              │
│  ┌─────────────┐                     ┌─────────────┐       │
│  │ Clarify if  │                     │ 4. Fact     │       │
│  │ Ambiguous   │                     │    Check    │       │
│  └─────────────┘                     └─────────────┘       │
│                                              │              │
│                                              ▼              │
│                                      ┌─────────────┐       │
│                                      │ 5. Synthesize│       │
│                                      │    Results   │       │
│                                      └─────────────┘       │
│                                              │              │
│                    ┌─────────────────────────┼──────────┐  │
│                    ▼                         ▼          ▼  │
│             ┌───────────┐           ┌───────────┐ ┌──────┐ │
│             │ Executive │           │ Detailed  │ │Source│ │
│             │ Brief     │           │ Analysis  │ │Append│ │
│             │ (Tier 1)  │           │ (Tier 2)  │ │(T3)  │ │
│             └───────────┘           └───────────┘ └──────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflow Phases

### Phase 1: Scope Validation (2-5 seconds)

**Purpose:** Prevent wasted effort from ambiguous queries

**Function:** `ValidateResearchScope`  
**Model:** ClaudeHaiku (fast, cheap)

**Checks:**
- Is query unambiguous?
- How many distinct topics?
- Are topics related or separate?
- Time period specified?
- What primary sources to check?

**Output:** `ValidationResult` with clarification questions if needed

---

### Phase 2: Query Decomposition (3-5 seconds)

**Purpose:** Split query into parallel, non-overlapping sub-queries

**Function:** `DecomposeQuery`  
**Model:** GPT4oMini (good at structured decomposition)

**Generates:**
- Primary queries (core research)
- Validation queries (fact-checking focus)
- Edge queries (controversies, edge cases)

**Key Innovation:** Each sub-query has explicit INCLUDE/EXCLUDE boundaries to prevent agent overlap

---

### Phase 3: Parallel Research (10-60 seconds)

**Purpose:** Execute all sub-queries simultaneously

**Function:** `ResearchTopic`  
**Model:** Production (failover: GPT4o → Claude → Gemini)

**Per Query:**
- Focus on assigned aspect only
- Respect boundary constraints
- Rate confidence per finding
- Identify gaps and follow-ups

**Parallelism:** All queries execute via `Promise.allSettled()`

---

### Phase 4: Fact-Checking (5-15 seconds)

**Purpose:** Verify non-HIGH confidence claims

**Function:** `FactCheckClaims`  
**Model:** Claude (best for nuanced verification)

**Verdicts:**
- `VERIFIED` - Multiple authoritative sources confirm
- `PARTIALLY_TRUE` - True but missing context
- `MISLEADING` - Technically true but misleading
- `FALSE` - Contradicted by sources
- `UNVERIFIABLE` - Cannot verify

**Skipped for:** Quick mode (depth=1) or when `skipFactCheck=true`

---

### Phase 5: Synthesis (5-10 seconds)

**Purpose:** Combine results into tiered output

**Function:** `SynthesizeFindings`  
**Model:** GPT4o (best for synthesis and writing)

**Output Tiers:**

| Tier | Content | Length | Read Time |
|------|---------|--------|-----------|
| 1 | Executive Brief | 500 words | 2-3 min |
| 2 | Detailed Analysis | 2,000-5,000 words | 15-30 min |
| 3 | Source Appendix | Variable | Reference |

---

## File Structure

```
qara-v2/
├── baml_src/
│   └── skills/
│       └── research/
│           ├── types.baml          # Shared types
│           ├── validate.baml       # Scope validation
│           ├── decompose.baml      # Query decomposition
│           ├── research.baml       # Core research
│           ├── factcheck.baml      # Fact-checking
│           └── synthesize.baml     # Result synthesis
├── src/
│   └── skills/
│       └── research/
│           ├── orchestrator.ts     # Main orchestrator
│           └── stream.ts           # Streaming support
└── docs/
    ├── RESEARCH_SKILL_OVERVIEW.md  # This file
    ├── RESEARCH_SKILL_BAML.md      # BAML definitions
    └── RESEARCH_SKILL_TYPESCRIPT.md # TypeScript code
```

---

## Quality Metrics

### Scoring System

| Metric | Description | Range |
|--------|-------------|-------|
| Coverage | Breadth and depth of topic coverage | 0-100 |
| Confidence | Source reliability and validation | 0-100 |
| Depth | Analysis depth achieved | 0-100 |

### Overall Grade

| Grade | Criteria |
|-------|----------|
| A | All scores ≥80 |
| B | All scores ≥60, average ≥70 |
| C | All scores ≥40, average ≥50 |
| D | Any score <40 |

---

## Source Authority Guidelines

| Score | Source Type |
|-------|-------------|
| 0.9-1.0 | Official government/regulatory, peer-reviewed journals |
| 0.7-0.9 | Major news outlets, established industry publications |
| 0.5-0.7 | Industry blogs, analyst reports |
| 0.3-0.5 | Social media, forums, unverified sources |
| 0.0-0.3 | Anonymous sources, speculation |

---

## Implementation Checklist

### Phase 1: BAML Types & Functions (Day 1-2)
- [ ] Create `baml_src/skills/research/types.baml`
- [ ] Create `baml_src/skills/research/validate.baml`
- [ ] Create `baml_src/skills/research/decompose.baml`
- [ ] Create `baml_src/skills/research/research.baml`
- [ ] Create `baml_src/skills/research/factcheck.baml`
- [ ] Create `baml_src/skills/research/synthesize.baml`
- [ ] Run `baml-cli generate`

### Phase 2: TypeScript Orchestrator (Day 3-4)
- [ ] Create `src/skills/research/orchestrator.ts`
- [ ] Create `src/skills/research/stream.ts`
- [ ] Add research skills to registry
- [ ] Integrate with router

### Phase 3: Testing (Day 5)
- [ ] Unit tests for each BAML function
- [ ] Integration tests for orchestrator
- [ ] Performance benchmarks
- [ ] End-to-end CLI tests

---

## Performance Targets

| Metric | Quick | Standard | Deep | Extensive |
|--------|-------|----------|------|-----------|
| Total Time | <30s | <60s | <120s | <300s |
| Sub-queries | 2 | 4-6 | 8-10 | 12-16 |
| Quality Grade | C+ | B | B+ | A |

---

## Related Documents

- [RESEARCH_SKILL_BAML.md](./RESEARCH_SKILL_BAML.md) - BAML type and function definitions
- [RESEARCH_SKILL_TYPESCRIPT.md](./RESEARCH_SKILL_TYPESCRIPT.md) - TypeScript orchestrator code
- [ROUTER_CLI_IMPLEMENTATION.md](./ROUTER_CLI_IMPLEMENTATION.md) - Router and CLI integration

---

**Document Version:** 1.0  
**Created:** December 3, 2025  
**Status:** Ready for Implementation
