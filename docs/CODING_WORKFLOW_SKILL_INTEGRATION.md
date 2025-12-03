# Qara v2: Coding Workflow Skill Integration

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Future Integration (Phase 5+)  
**Priority:** Critical - Core Developer Workflow

---

## Overview

The **Coding Workflow Skills** implement a complete software development lifecycle within Qara, inspired by battle-tested Claude commands. This is not a single skill but an **orchestrated workflow** of interconnected skills that mirror professional engineering practices.

### The Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CODING WORKFLOW                                  │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   RESEARCH   │───▶│    PLAN      │───▶│  IMPLEMENT   │              │
│  │   Codebase   │    │   Create     │    │    Plan      │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                   │                   │                       │
│         │                   │                   ▼                       │
│         │                   │           ┌──────────────┐               │
│         │                   │           │   VALIDATE   │               │
│         │                   │           │     Plan     │               │
│         │                   │           └──────────────┘               │
│         │                   │                   │                       │
│         ▼                   ▼                   ▼                       │
│  ┌──────────────────────────────────────────────────────┐              │
│  │                    HANDOFF                            │              │
│  │            (Session Transfer Document)                │              │
│  └──────────────────────────────────────────────────────┘              │
│                              │                                          │
│                              ▼                                          │
│  ┌──────────────────────────────────────────────────────┐              │
│  │                 CAPTURE LEARNING                      │              │
│  │            (Knowledge Preservation)                   │              │
│  └──────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Source Commands Analyzed

| Command | Purpose | Key Patterns |
|---------|---------|--------------|
| `research_codebase.md` | Document codebase as-is | Parallel sub-agents, synthesis, no critique |
| `create_plan.md` | Create implementation plans | Interactive iteration, skeptical questioning |
| `implement_plan.md` | Execute plans with verification | Phase-by-phase, automated + manual checks |
| `validate_plan.md` | Verify implementation correctness | Systematic validation, deviation detection |
| `create_handoff.md` | Transfer work between sessions | Context compression, artifact tracking |
| `capture-learning.md` | Preserve problem-solving narratives | Before/after, journey documentation |

---

## BAML Fit Analysis

### Why This Fits BAML

| Aspect | Assessment |
|--------|------------|
| **Structured Outputs** | ✅ Plans, reports, handoffs have clear structure |
| **Multi-Phase Workflows** | ✅ BAML orchestration handles phases |
| **Quality Metrics** | ✅ Validation criteria are enumerable |
| **Code Generation** | ✅ Can output code blocks with context |

### Considerations

| Challenge | Mitigation |
|-----------|------------|
| Codebase access | Integrate with file system tools |
| Git operations | Shell command execution |
| Interactive iteration | Multi-turn conversation state |
| Sub-agent spawning | Parallel BAML function calls |

### Verdict: **Excellent fit - structured workflows are BAML's strength**

---

## Architecture

### Skill Decomposition

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Coding Workflow Skills                                                 │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  RESEARCH SKILLS                                                    ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│  │  │  Codebase   │ │  Pattern    │ │  Thoughts   │ │  Synthesize │   ││
│  │  │  Locator    │ │  Finder     │ │  Analyzer   │ │  Findings   │   ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  PLANNING SKILLS                                                    ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│  │  │  Analyze    │ │  Design     │ │  Structure  │ │  Write      │   ││
│  │  │  Context    │ │  Options    │ │  Phases     │ │  Plan       │   ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  IMPLEMENTATION SKILLS                                              ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│  │  │  Parse      │ │  Generate   │ │  Verify     │ │  Report     │   ││
│  │  │  Plan       │ │  Code       │ │  Phase      │ │  Progress   │   ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  VALIDATION SKILLS                                                  ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ││
│  │  │  Compare    │ │  Run        │ │  Detect     │ │  Generate   │   ││
│  │  │  Plan/Code  │ │  Checks     │ │  Deviations │ │  Report     │   ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  KNOWLEDGE SKILLS                                                   ││
│  │  ┌─────────────┐ ┌─────────────┐                                   ││
│  │  │  Create     │ │  Capture    │                                   ││
│  │  │  Handoff    │ │  Learning   │                                   ││
│  │  └─────────────┘ └─────────────┘                                   ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## BAML Types

### Core Types (`baml_src/skills/coding/types.baml`)

```baml
// ============================================================================
// RESEARCH TYPES
// ============================================================================

class CodebaseResearchQuery {
  question string @description("The research question to answer")
  focus_areas string[]? @description("Specific directories or components to focus on")
  exclude_areas string[]? @description("Areas to exclude from research")
  include_historical bool @description("Whether to include thoughts/docs analysis")
}

class CodeLocation {
  file_path string
  start_line int
  end_line int?
  description string
  relevance string @description("HIGH|MEDIUM|LOW")
}

class CodePattern {
  name string
  description string
  locations CodeLocation[]
  usage_example string?
}

class ResearchFinding {
  area string @description("Component or area researched")
  summary string
  details string
  code_references CodeLocation[]
  patterns_found CodePattern[]
  connections string[] @description("How this connects to other components")
}

class CodebaseResearchResult {
  question string
  summary string
  findings ResearchFinding[]
  architecture_notes string[]
  open_questions string[]
  related_documents string[] @description("Paths to related docs")
}

// ============================================================================
// PLANNING TYPES
// ============================================================================

class PlanContext {
  task_description string
  ticket_reference string?
  existing_code_analysis string
  constraints string[]
  related_research string[]
}

class DesignOption {
  name string
  description string
  pros string[]
  cons string[]
  effort_estimate string @description("LOW|MEDIUM|HIGH")
  risk_level string @description("LOW|MEDIUM|HIGH")
  recommended bool
}

class PhaseChange {
  file_path string
  change_type string @description("CREATE|MODIFY|DELETE")
  description string
  code_snippet string? @description("Actual code to add/modify")
  dependencies string[] @description("Other changes this depends on")
}

class VerificationStep {
  description string
  command string? @description("Command to run, if automated")
  is_automated bool
  expected_outcome string
}

class ImplementationPhase {
  number int
  name string
  overview string
  changes PhaseChange[]
  automated_verification VerificationStep[]
  manual_verification VerificationStep[]
  success_criteria string[]
  estimated_time string
}

class ImplementationPlan {
  title string
  overview string
  current_state_analysis string
  desired_end_state string
  out_of_scope string[]
  approach string
  phases ImplementationPhase[]
  testing_strategy TestingStrategy
  migration_notes string?
  references PlanReference[]
}

class TestingStrategy {
  unit_tests string[]
  integration_tests string[]
  manual_test_steps string[]
  edge_cases string[]
}

class PlanReference {
  type string @description("ticket|research|implementation|code")
  path string
  description string
}

// ============================================================================
// IMPLEMENTATION TYPES
// ============================================================================

class PhaseStatus {
  phase_number int
  phase_name string
  status string @description("NOT_STARTED|IN_PROGRESS|COMPLETED|BLOCKED")
  completed_changes string[]
  pending_changes string[]
  blockers string[]?
}

class ImplementationProgress {
  plan_title string
  current_phase int
  total_phases int
  phase_statuses PhaseStatus[]
  overall_status string @description("NOT_STARTED|IN_PROGRESS|COMPLETED|BLOCKED")
  next_action string
}

class CodeGenerationRequest {
  description string
  file_path string
  language string
  context string @description("Surrounding code or requirements")
  patterns_to_follow string[]
  constraints string[]
}

class GeneratedCode {
  file_path string
  code string
  imports string[]
  explanation string
  tests_to_add string[]
}

class PhaseMismatch {
  phase_number int
  expected string
  found string
  severity string @description("BLOCKING|WARNING|INFO")
  suggested_resolution string
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

class ValidationContext {
  plan_path string
  implementation_commits string[]?
  focus_phases int[]? @description("Specific phases to validate, or all if empty")
}

class AutomatedCheckResult {
  check_name string
  command string
  passed bool
  output string?
  error string?
}

class CodeReviewFinding {
  category string @description("MATCHES_PLAN|DEVIATION|IMPROVEMENT|ISSUE")
  description string
  location CodeLocation?
  severity string @description("HIGH|MEDIUM|LOW")
  recommendation string?
}

class ValidationReport {
  plan_title string
  validation_date string
  phases_validated PhaseValidation[]
  automated_results AutomatedCheckResult[]
  code_review_findings CodeReviewFinding[]
  manual_testing_required string[]
  overall_status string @description("PASS|PASS_WITH_WARNINGS|FAIL")
  recommendations string[]
}

class PhaseValidation {
  phase_number int
  phase_name string
  status string @description("FULLY_IMPLEMENTED|PARTIALLY_IMPLEMENTED|NOT_IMPLEMENTED")
  matches_plan string[]
  deviations string[]
  issues string[]
}

// ============================================================================
// HANDOFF TYPES
// ============================================================================

class HandoffContext {
  ticket_reference string?
  plan_reference string?
  current_phase int?
  session_summary string
}

class RecentChange {
  file_path string
  line_range string?
  description string
  change_type string @description("ADDED|MODIFIED|DELETED")
}

class Handoff {
  title string
  date string
  tasks TaskStatus[]
  critical_references string[]
  recent_changes RecentChange[]
  learnings string[]
  artifacts string[]
  next_steps string[]
  other_notes string?
}

class TaskStatus {
  description string
  status string @description("COMPLETED|IN_PROGRESS|PLANNED")
  details string?
}

// ============================================================================
// LEARNING TYPES
// ============================================================================

class LearningCapture {
  problem string
  initial_assumption string
  actual_reality string
  troubleshooting_steps string[]
  solution string
  key_takeaway string
  related_files string[]
  tags string[]
}

class CapturedLearning {
  title string
  date string
  narrative LearningNarrative
  technical_details string[]
  actionable_takeaways string[]
  related_documentation string[]
}

class LearningNarrative {
  problem_encountered string
  what_we_thought string
  what_we_discovered string
  the_journey string[]
  the_solution string
  the_lesson string
}
```

---

## BAML Functions

### Research Functions (`baml_src/skills/coding/research.baml`)

```baml
// Locate relevant code in codebase
function LocateCode(
  query: string,
  focus_directories: string[]?,
  file_patterns: string[]?
) -> CodeLocation[] {
  client Claude
  prompt #"
    # IDENTITY
    You are a codebase navigator. Your job is to find WHERE code lives.
    
    # TASK
    Find code locations relevant to: {{ query }}
    
    {% if focus_directories %}
    Focus on directories: {{ focus_directories }}
    {% endif %}
    
    {% if file_patterns %}
    File patterns: {{ file_patterns }}
    {% endif %}
    
    # CRITICAL RULES
    - Only report locations that EXIST
    - Include file path, line numbers, and relevance
    - Be specific about what's at each location
    - Do NOT suggest improvements or changes
    
    {{ ctx.output_format }}
  "#
}

// Analyze how specific code works
function AnalyzeCode(
  code_locations: CodeLocation[],
  analysis_focus: string
) -> ResearchFinding {
  client Claude
  prompt #"
    # IDENTITY
    You are a code analyst. Your job is to explain HOW code works.
    
    # CODE LOCATIONS
    {% for loc in code_locations %}
    - {{ loc.file_path }}:{{ loc.start_line }}-{{ loc.end_line }}: {{ loc.description }}
    {% endfor %}
    
    # ANALYSIS FOCUS
    {{ analysis_focus }}
    
    # CRITICAL RULES
    - Describe what EXISTS, not what SHOULD exist
    - Explain data flow and interactions
    - Note patterns and conventions used
    - Do NOT critique or suggest improvements
    - Include specific file:line references
    
    {{ ctx.output_format }}
  "#
}

// Find patterns in codebase
function FindPatterns(
  pattern_type: string,
  search_directories: string[]
) -> CodePattern[] {
  client GPT4o
  prompt #"
    # IDENTITY
    You are a pattern finder. Your job is to find EXISTING patterns.
    
    # TASK
    Find examples of: {{ pattern_type }}
    
    # SEARCH IN
    {{ search_directories }}
    
    # OUTPUT
    For each pattern found:
    - Name and description
    - All locations where it's used
    - Example usage
    
    # CRITICAL
    - Only report patterns that EXIST
    - Do NOT evaluate if patterns are good or bad
    - Just document what IS
    
    {{ ctx.output_format }}
  "#
}

// Synthesize research findings
function SynthesizeResearch(
  question: string,
  findings: ResearchFinding[]
) -> CodebaseResearchResult {
  client Claude
  prompt #"
    # IDENTITY
    You are a research synthesizer creating technical documentation.
    
    # RESEARCH QUESTION
    {{ question }}
    
    # FINDINGS
    {% for finding in findings %}
    ## {{ finding.area }}
    {{ finding.summary }}
    {{ finding.details }}
    {% endfor %}
    
    # TASK
    Synthesize these findings into a coherent answer that:
    1. Directly answers the research question
    2. Documents the current state of the codebase
    3. Highlights connections between components
    4. Notes any gaps in understanding
    
    # CRITICAL
    - This is DOCUMENTATION, not evaluation
    - Describe what IS, not what SHOULD BE
    - Include all relevant file:line references
    
    {{ ctx.output_format }}
  "#
}
```

### Planning Functions (`baml_src/skills/coding/planning.baml`)

```baml
// Analyze context for planning
function AnalyzePlanContext(
  task_description: string,
  code_findings: ResearchFinding[],
  constraints: string[]?
) -> PlanContext {
  client Claude
  prompt #"
    # IDENTITY
    You are a technical analyst preparing context for implementation planning.
    
    # TASK
    {{ task_description }}
    
    # CODE FINDINGS
    {% for finding in code_findings %}
    ## {{ finding.area }}
    {{ finding.summary }}
    References: {{ finding.code_references }}
    {% endfor %}
    
    {% if constraints %}
    # CONSTRAINTS
    {{ constraints }}
    {% endif %}
    
    # OUTPUT
    Provide structured context including:
    - Clear task understanding
    - Relevant existing code analysis
    - Identified constraints
    - Questions that need answers before planning
    
    {{ ctx.output_format }}
  "#
}

// Generate design options
function GenerateDesignOptions(
  context: PlanContext,
  num_options: int
) -> DesignOption[] {
  client Claude
  prompt #"
    # IDENTITY
    You are a senior engineer proposing design options.
    
    # CONTEXT
    Task: {{ context.task_description }}
    Existing Code: {{ context.existing_code_analysis }}
    Constraints: {{ context.constraints }}
    
    # TASK
    Generate {{ num_options }} distinct design options.
    
    For each option:
    - Clear name and description
    - Specific pros and cons
    - Effort and risk assessment
    - Whether you recommend it
    
    # GUIDELINES
    - Options should be meaningfully different
    - Consider existing patterns in the codebase
    - Be realistic about effort and risk
    - One option should be recommended
    
    {{ ctx.output_format }}
  "#
}

// Structure implementation phases
function StructurePhases(
  context: PlanContext,
  chosen_approach: DesignOption
) -> ImplementationPhase[] {
  client Claude
  prompt #"
    # IDENTITY
    You are a technical lead structuring implementation work.
    
    # CONTEXT
    Task: {{ context.task_description }}
    Approach: {{ chosen_approach.name }} - {{ chosen_approach.description }}
    
    # TASK
    Break this into implementation phases.
    
    Each phase should:
    - Be independently testable
    - Have clear success criteria
    - Include both automated AND manual verification
    - List specific file changes with code snippets
    - Estimate time
    
    # PHASE STRUCTURE
    - Phase 1: Foundation/setup
    - Phase 2-N: Feature implementation
    - Final Phase: Integration/cleanup
    
    # VERIFICATION RULES
    - Automated: Commands that can be run (make test, npm run lint)
    - Manual: Human verification steps (UI testing, edge cases)
    - ALWAYS include both types
    
    {{ ctx.output_format }}
  "#
}

// Write complete implementation plan
function WriteImplementationPlan(
  context: PlanContext,
  approach: DesignOption,
  phases: ImplementationPhase[]
) -> ImplementationPlan {
  client Claude
  prompt #"
    # IDENTITY
    You are a technical writer creating implementation documentation.
    
    # INPUTS
    Context: {{ context }}
    Approach: {{ approach }}
    Phases: {{ phases }}
    
    # TASK
    Write a complete implementation plan document.
    
    # REQUIRED SECTIONS
    1. Title and Overview
    2. Current State Analysis
    3. Desired End State (how to verify success)
    4. What We're NOT Doing (explicit scope limits)
    5. Implementation Approach
    6. Phases (with full detail)
    7. Testing Strategy
    8. Migration Notes (if applicable)
    9. References
    
    # QUALITY REQUIREMENTS
    - Every phase has automated AND manual verification
    - Code snippets are complete and correct
    - File paths are specific
    - Success criteria are measurable
    - No open questions remain
    
    {{ ctx.output_format }}
  "#
}
```

### Implementation Functions (`baml_src/skills/coding/implementation.baml`)

```baml
// Parse plan into executable structure
function ParsePlan(plan_content: string) -> ImplementationPlan {
  client GPT4o
  prompt #"
    # IDENTITY
    You are a plan parser extracting structured data from markdown plans.
    
    # PLAN CONTENT
    {{ plan_content }}
    
    # TASK
    Parse this plan into a structured format with:
    - All phases and their changes
    - All verification steps (automated and manual)
    - All success criteria
    - All references
    
    # RULES
    - Preserve all detail from the original
    - Mark which items are already checked (completed)
    - Identify the current phase based on checkmarks
    
    {{ ctx.output_format }}
  "#
}

// Generate code for a specific change
function GenerateCode(request: CodeGenerationRequest) -> GeneratedCode {
  client Claude
  prompt #"
    # IDENTITY
    You are a senior developer writing production code.
    
    # REQUEST
    Description: {{ request.description }}
    File: {{ request.file_path }}
    Language: {{ request.language }}
    
    # CONTEXT
    {{ request.context }}
    
    # PATTERNS TO FOLLOW
    {% for pattern in request.patterns_to_follow %}
    - {{ pattern }}
    {% endfor %}
    
    # CONSTRAINTS
    {% for constraint in request.constraints %}
    - {{ constraint }}
    {% endfor %}
    
    # TASK
    Generate the code that:
    - Follows existing patterns exactly
    - Is complete and runnable
    - Includes necessary imports
    - Has appropriate error handling
    
    # OUTPUT
    - Complete code
    - Required imports
    - Explanation of key decisions
    - Tests that should be added
    
    {{ ctx.output_format }}
  "#
}

// Report implementation progress
function ReportProgress(
  plan: ImplementationPlan,
  completed_phases: int[],
  current_phase: int,
  blockers: string[]?
) -> ImplementationProgress {
  client GPT4oMini
  prompt #"
    # IDENTITY
    You are a progress reporter summarizing implementation status.
    
    # PLAN
    {{ plan.title }}
    Total Phases: {{ plan.phases | length }}
    
    # STATUS
    Completed: {{ completed_phases }}
    Current: {{ current_phase }}
    {% if blockers %}
    Blockers: {{ blockers }}
    {% endif %}
    
    # TASK
    Generate a progress report with:
    - Status of each phase
    - Overall completion percentage
    - Next action to take
    - Any blockers or concerns
    
    {{ ctx.output_format }}
  "#
}

// Detect mismatches between plan and reality
function DetectMismatch(
  plan_phase: ImplementationPhase,
  actual_code: string,
  actual_files: string[]
) -> PhaseMismatch[] {
  client Claude
  prompt #"
    # IDENTITY
    You are a code auditor comparing plans to reality.
    
    # PLANNED PHASE
    {{ plan_phase }}
    
    # ACTUAL CODE
    {{ actual_code }}
    
    # ACTUAL FILES
    {{ actual_files }}
    
    # TASK
    Identify any mismatches between plan and implementation:
    - Missing changes
    - Different implementations
    - Extra changes not in plan
    - Blocking issues
    
    For each mismatch:
    - What was expected
    - What was found
    - Severity (BLOCKING, WARNING, INFO)
    - Suggested resolution
    
    {{ ctx.output_format }}
  "#
}
```

### Validation Functions (`baml_src/skills/coding/validation.baml`)

```baml
// Compare plan to implementation
function ComparePlanToCode(
  plan: ImplementationPlan,
  code_changes: RecentChange[]
) -> PhaseValidation[] {
  client Claude
  prompt #"
    # IDENTITY
    You are a technical auditor validating implementation against plan.
    
    # PLAN
    {{ plan }}
    
    # CODE CHANGES
    {% for change in code_changes %}
    - {{ change.file_path }}: {{ change.description }} ({{ change.change_type }})
    {% endfor %}
    
    # TASK
    For each phase in the plan:
    1. Check if all planned changes were made
    2. Identify any deviations from plan
    3. Note any issues or concerns
    4. Determine implementation status
    
    # STATUS OPTIONS
    - FULLY_IMPLEMENTED: All changes match plan
    - PARTIALLY_IMPLEMENTED: Some changes made, some missing
    - NOT_IMPLEMENTED: No changes for this phase
    
    {{ ctx.output_format }}
  "#
}

// Generate validation report
function GenerateValidationReport(
  plan: ImplementationPlan,
  phase_validations: PhaseValidation[],
  automated_results: AutomatedCheckResult[],
  code_findings: CodeReviewFinding[]
) -> ValidationReport {
  client Claude
  prompt #"
    # IDENTITY
    You are a QA lead generating a validation report.
    
    # PLAN
    {{ plan.title }}
    
    # PHASE VALIDATIONS
    {{ phase_validations }}
    
    # AUTOMATED RESULTS
    {{ automated_results }}
    
    # CODE REVIEW FINDINGS
    {{ code_findings }}
    
    # TASK
    Generate a comprehensive validation report:
    
    1. Implementation Status Summary
       - Which phases are complete
       - Which have issues
    
    2. Automated Check Results
       - Pass/fail for each check
       - Any errors or warnings
    
    3. Code Review Findings
       - What matches plan
       - Deviations (good and bad)
       - Issues to address
    
    4. Manual Testing Required
       - List all manual verification steps
    
    5. Overall Assessment
       - PASS, PASS_WITH_WARNINGS, or FAIL
       - Key recommendations
    
    {{ ctx.output_format }}
  "#
}
```

### Knowledge Functions (`baml_src/skills/coding/knowledge.baml`)

```baml
// Create handoff document
function CreateHandoff(
  context: HandoffContext,
  changes: RecentChange[],
  learnings: string[],
  artifacts: string[]
) -> Handoff {
  client Claude
  prompt #"
    # IDENTITY
    You are creating a handoff document for session transfer.
    
    # CONTEXT
    {% if context.ticket_reference %}
    Ticket: {{ context.ticket_reference }}
    {% endif %}
    {% if context.plan_reference %}
    Plan: {{ context.plan_reference }}
    {% endif %}
    {% if context.current_phase %}
    Current Phase: {{ context.current_phase }}
    {% endif %}
    
    Session Summary: {{ context.session_summary }}
    
    # CHANGES MADE
    {% for change in changes %}
    - {{ change.file_path }}:{{ change.line_range }}: {{ change.description }}
    {% endfor %}
    
    # LEARNINGS
    {{ learnings }}
    
    # ARTIFACTS
    {{ artifacts }}
    
    # TASK
    Create a concise but thorough handoff document:
    
    1. Tasks with status (completed, in progress, planned)
    2. Critical references (2-3 most important)
    3. Recent changes with file:line references
    4. Key learnings for the next session
    5. Artifacts produced
    6. Clear next steps
    
    # GUIDELINES
    - Be thorough but concise
    - Use file:line references, not code blocks
    - Focus on what the next agent needs to know
    - Include both high-level and low-level details
    
    {{ ctx.output_format }}
  "#
}

// Capture learning narrative
function CaptureLearning(input: LearningCapture) -> CapturedLearning {
  client Claude
  prompt #"
    # IDENTITY
    You are documenting a problem-solving journey.
    
    # THE STORY
    Problem: {{ input.problem }}
    Initial Assumption: {{ input.initial_assumption }}
    Actual Reality: {{ input.actual_reality }}
    Troubleshooting Steps: {{ input.troubleshooting_steps }}
    Solution: {{ input.solution }}
    Key Takeaway: {{ input.key_takeaway }}
    
    # TASK
    Create a learning document that tells the full story:
    
    1. The Problem We Encountered
    2. What We Initially Thought
    3. What We Discovered Was Actually True
    4. The Journey (troubleshooting steps)
    5. The Solution That Worked
    6. The Lesson Learned ("So now we know...")
    
    Also include:
    - Technical details and commands used
    - Actionable takeaways
    - Related documentation to update
    
    # PURPOSE
    This narrative helps us:
    - Remember the journey, not just the destination
    - Understand WHY the solution works
    - Recognize similar patterns in future
    - Update mental models and documentation
    
    {{ ctx.output_format }}
  "#
}
```

---

## TypeScript Orchestrators

### Research Orchestrator (`src/skills/coding/research-orchestrator.ts`)

```typescript
import { b } from '../../baml_client';
import type {
  CodebaseResearchQuery,
  CodebaseResearchResult,
  ResearchFinding,
  CodeLocation,
  CodePattern
} from '../../baml_client/types';

export interface ResearchOptions {
  includeHistorical?: boolean;
  maxDepth?: number;
  verbose?: boolean;
}

export class CodebaseResearchOrchestrator {
  
  /**
   * Research codebase to answer a question
   * CRITICAL: Documents what IS, not what SHOULD BE
   */
  async research(
    query: CodebaseResearchQuery,
    options: ResearchOptions = {}
  ): Promise<CodebaseResearchResult> {
    
    if (options.verbose) {
      console.log(`[research] Starting: ${query.question}`);
    }

    // Phase 1: Locate relevant code (parallel)
    const locationPromises = (query.focus_areas || ['.']).map(area =>
      b.LocateCode(query.question, [area], null)
    );
    
    const locationResults = await Promise.all(locationPromises);
    const allLocations = locationResults.flat();
    
    if (options.verbose) {
      console.log(`[research] Found ${allLocations.length} relevant locations`);
    }

    // Phase 2: Analyze code at locations (parallel)
    const analysisPromises = this.groupLocationsByArea(allLocations).map(
      ([area, locs]) => b.AnalyzeCode(locs, query.question)
    );
    
    const findings = await Promise.all(analysisPromises);
    
    // Phase 3: Find patterns if relevant
    const patterns = await b.FindPatterns(
      query.question,
      query.focus_areas || ['.']
    );
    
    // Phase 4: Synthesize all findings
    const result = await b.SynthesizeResearch(query.question, findings);
    
    return result;
  }

  private groupLocationsByArea(
    locations: CodeLocation[]
  ): [string, CodeLocation[]][] {
    const groups = new Map<string, CodeLocation[]>();
    
    for (const loc of locations) {
      const area = loc.file_path.split('/').slice(0, 2).join('/');
      if (!groups.has(area)) {
        groups.set(area, []);
      }
      groups.get(area)!.push(loc);
    }
    
    return Array.from(groups.entries());
  }
}
```

### Planning Orchestrator (`src/skills/coding/planning-orchestrator.ts`)

```typescript
import { b } from '../../baml_client';
import type {
  PlanContext,
  DesignOption,
  ImplementationPhase,
  ImplementationPlan,
  ResearchFinding
} from '../../baml_client/types';
import { CodebaseResearchOrchestrator } from './research-orchestrator';

export interface PlanningOptions {
  interactive?: boolean;
  numDesignOptions?: number;
  verbose?: boolean;
}

export class PlanningOrchestrator {
  private research = new CodebaseResearchOrchestrator();

  /**
   * Create implementation plan through iterative process
   */
  async createPlan(
    taskDescription: string,
    ticketReference?: string,
    options: PlanningOptions = {}
  ): Promise<ImplementationPlan> {
    
    const numOptions = options.numDesignOptions || 3;
    
    // Step 1: Research codebase for context
    if (options.verbose) {
      console.log('[planning] Researching codebase...');
    }
    
    const researchResult = await this.research.research({
      question: `How does the codebase currently handle: ${taskDescription}`,
      include_historical: true
    });
    
    // Step 2: Analyze context
    if (options.verbose) {
      console.log('[planning] Analyzing context...');
    }
    
    const context = await b.AnalyzePlanContext(
      taskDescription,
      researchResult.findings,
      null
    );
    
    // Step 3: Generate design options
    if (options.verbose) {
      console.log(`[planning] Generating ${numOptions} design options...`);
    }
    
    const designOptions = await b.GenerateDesignOptions(context, numOptions);
    
    // Step 4: Select recommended option (or interactive selection)
    const chosenOption = designOptions.find(o => o.recommended) || designOptions[0];
    
    if (options.verbose) {
      console.log(`[planning] Selected approach: ${chosenOption.name}`);
    }
    
    // Step 5: Structure phases
    if (options.verbose) {
      console.log('[planning] Structuring implementation phases...');
    }
    
    const phases = await b.StructurePhases(context, chosenOption);
    
    // Step 6: Write complete plan
    if (options.verbose) {
      console.log('[planning] Writing implementation plan...');
    }
    
    const plan = await b.WriteImplementationPlan(context, chosenOption, phases);
    
    return plan;
  }

  /**
   * Get design options for user selection
   */
  async getDesignOptions(
    taskDescription: string,
    numOptions: number = 3
  ): Promise<DesignOption[]> {
    const researchResult = await this.research.research({
      question: taskDescription,
      include_historical: false
    });
    
    const context = await b.AnalyzePlanContext(
      taskDescription,
      researchResult.findings,
      null
    );
    
    return b.GenerateDesignOptions(context, numOptions);
  }
}
```

### Implementation Orchestrator (`src/skills/coding/implementation-orchestrator.ts`)

```typescript
import { b } from '../../baml_client';
import type {
  ImplementationPlan,
  ImplementationPhase,
  ImplementationProgress,
  GeneratedCode,
  PhaseMismatch
} from '../../baml_client/types';

export interface ImplementationOptions {
  startPhase?: number;
  endPhase?: number;
  pauseForManual?: boolean;
  verbose?: boolean;
}

export class ImplementationOrchestrator {

  /**
   * Execute implementation plan
   */
  async implement(
    planContent: string,
    options: ImplementationOptions = {}
  ): Promise<ImplementationProgress> {
    
    // Parse plan
    const plan = await b.ParsePlan(planContent);
    
    const startPhase = options.startPhase || 1;
    const endPhase = options.endPhase || plan.phases.length;
    const pauseForManual = options.pauseForManual !== false;
    
    const completedPhases: number[] = [];
    let currentPhase = startPhase;
    
    for (let i = startPhase; i <= endPhase; i++) {
      const phase = plan.phases[i - 1];
      
      if (options.verbose) {
        console.log(`[implement] Phase ${i}: ${phase.name}`);
      }
      
      // Generate code for each change
      for (const change of phase.changes) {
        if (change.change_type === 'CREATE' || change.change_type === 'MODIFY') {
          const code = await b.GenerateCode({
            description: change.description,
            file_path: change.file_path,
            language: this.detectLanguage(change.file_path),
            context: change.code_snippet || '',
            patterns_to_follow: [],
            constraints: change.dependencies
          });
          
          // Here you would actually write the code to the file
          if (options.verbose) {
            console.log(`[implement] Generated: ${change.file_path}`);
          }
        }
      }
      
      // Run automated verification
      for (const check of phase.automated_verification) {
        if (options.verbose) {
          console.log(`[implement] Running: ${check.command}`);
        }
        // Execute check.command
      }
      
      completedPhases.push(i);
      currentPhase = i + 1;
      
      // Pause for manual verification if needed
      if (pauseForManual && phase.manual_verification.length > 0) {
        if (options.verbose) {
          console.log(`[implement] Phase ${i} ready for manual verification`);
          console.log('Manual steps:', phase.manual_verification.map(v => v.description));
        }
        break; // Pause here for human
      }
    }
    
    return b.ReportProgress(plan, completedPhases, currentPhase, null);
  }

  /**
   * Detect mismatch between plan and current state
   */
  async detectMismatches(
    phase: ImplementationPhase,
    actualCode: string,
    actualFiles: string[]
  ): Promise<PhaseMismatch[]> {
    return b.DetectMismatch(phase, actualCode, actualFiles);
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust',
      'svelte': 'svelte'
    };
    return langMap[ext || ''] || 'text';
  }
}
```

### Validation Orchestrator (`src/skills/coding/validation-orchestrator.ts`)

```typescript
import { b } from '../../baml_client';
import type {
  ImplementationPlan,
  ValidationReport,
  PhaseValidation,
  AutomatedCheckResult,
  CodeReviewFinding,
  RecentChange
} from '../../baml_client/types';

export interface ValidationOptions {
  focusPhases?: number[];
  runAutomatedChecks?: boolean;
  verbose?: boolean;
}

export class ValidationOrchestrator {

  /**
   * Validate implementation against plan
   */
  async validate(
    planContent: string,
    codeChanges: RecentChange[],
    options: ValidationOptions = {}
  ): Promise<ValidationReport> {
    
    // Parse plan
    const plan = await b.ParsePlan(planContent);
    
    if (options.verbose) {
      console.log(`[validate] Validating: ${plan.title}`);
    }
    
    // Compare plan to code
    const phaseValidations = await b.ComparePlanToCode(plan, codeChanges);
    
    // Run automated checks if requested
    const automatedResults: AutomatedCheckResult[] = [];
    if (options.runAutomatedChecks !== false) {
      for (const phase of plan.phases) {
        for (const check of phase.automated_verification) {
          if (check.command) {
            // Execute command and capture result
            automatedResults.push({
              check_name: check.description,
              command: check.command,
              passed: true, // Would be actual result
              output: null,
              error: null
            });
          }
        }
      }
    }
    
    // Code review findings (would analyze actual code)
    const codeFindings: CodeReviewFinding[] = [];
    
    // Generate report
    return b.GenerateValidationReport(
      plan,
      phaseValidations,
      automatedResults,
      codeFindings
    );
  }
}
```

### Knowledge Orchestrator (`src/skills/coding/knowledge-orchestrator.ts`)

```typescript
import { b } from '../../baml_client';
import type {
  Handoff,
  HandoffContext,
  RecentChange,
  CapturedLearning,
  LearningCapture
} from '../../baml_client/types';

export class KnowledgeOrchestrator {

  /**
   * Create handoff document for session transfer
   */
  async createHandoff(
    context: HandoffContext,
    changes: RecentChange[],
    learnings: string[],
    artifacts: string[]
  ): Promise<Handoff> {
    return b.CreateHandoff(context, changes, learnings, artifacts);
  }

  /**
   * Capture learning narrative
   */
  async captureLearning(input: LearningCapture): Promise<CapturedLearning> {
    return b.CaptureLearning(input);
  }
}
```

---

## Skill Registry

```typescript
// Add to src/skills/registry.ts

// Research Skills
{
  id: 'code-research',
  name: 'Research Codebase',
  description: 'Document and explain codebase as-is without critique',
  triggers: [
    'research codebase', 'explain code', 'how does this work',
    'document code', 'find code', 'locate code'
  ],
  bamlFunction: 'SynthesizeResearch'
},

// Planning Skills
{
  id: 'code-plan',
  name: 'Create Implementation Plan',
  description: 'Create detailed implementation plans through iterative research',
  triggers: [
    'create plan', 'implementation plan', 'plan feature',
    'design implementation', 'plan changes'
  ],
  bamlFunction: 'WriteImplementationPlan'
},

// Implementation Skills
{
  id: 'code-implement',
  name: 'Implement Plan',
  description: 'Execute implementation plans with verification',
  triggers: [
    'implement plan', 'execute plan', 'build feature',
    'implement changes'
  ],
  bamlFunction: 'GenerateCode'
},

// Validation Skills
{
  id: 'code-validate',
  name: 'Validate Implementation',
  description: 'Verify implementation against plan, identify deviations',
  triggers: [
    'validate plan', 'verify implementation', 'check implementation',
    'review changes'
  ],
  bamlFunction: 'GenerateValidationReport'
},

// Knowledge Skills
{
  id: 'code-handoff',
  name: 'Create Handoff',
  description: 'Create handoff document for session transfer',
  triggers: [
    'create handoff', 'handoff', 'transfer session',
    'save progress'
  ],
  bamlFunction: 'CreateHandoff'
},
{
  id: 'code-learning',
  name: 'Capture Learning',
  description: 'Document problem-solving journey and lessons learned',
  triggers: [
    'capture learning', 'document learning', 'save learning',
    'log this', 'that worked'
  ],
  bamlFunction: 'CaptureLearning'
}
```

---

## Usage Examples

### Research Codebase

```bash
# Document how authentication works
qara "research codebase: how does authentication work in this project"

# Find where API routes are defined
qara "locate code: API route definitions"

# Explain a specific component
qara "explain code: src/auth/middleware.ts"
```

### Create Plan

```bash
# Create implementation plan for a feature
qara "create plan: add user profile editing"

# Plan with ticket reference
qara "create plan for ENG-1234"

# Get design options first
qara "design options for: adding real-time notifications"
```

### Implement Plan

```bash
# Execute a plan
qara "implement plan: thoughts/shared/plans/2025-01-08-user-profiles.md"

# Implement specific phases
qara "implement phases 1-2 of user-profiles plan"

# Generate code for a change
qara "generate code: user profile update endpoint"
```

### Validate Implementation

```bash
# Validate against plan
qara "validate plan: thoughts/shared/plans/2025-01-08-user-profiles.md"

# Check specific phases
qara "validate phases 1-3"

# Full validation with automated checks
qara "validate implementation with tests"
```

### Knowledge Management

```bash
# Create handoff
qara "create handoff for ENG-1234"

# Capture learning
qara "capture learning: fixed the auth bug"

# Quick learning capture
qara "log this: the issue was missing middleware"
```

---

## File Structure

```
baml_src/skills/coding/
├── types.baml           # All type definitions
├── research.baml        # Research functions
├── planning.baml        # Planning functions
├── implementation.baml  # Implementation functions
├── validation.baml      # Validation functions
└── knowledge.baml       # Handoff and learning functions

src/skills/coding/
├── research-orchestrator.ts
├── planning-orchestrator.ts
├── implementation-orchestrator.ts
├── validation-orchestrator.ts
└── knowledge-orchestrator.ts
```

---

## Implementation Checklist

### Phase 1: Types and Research
- [ ] Create `baml_src/skills/coding/types.baml`
- [ ] Create `baml_src/skills/coding/research.baml`
- [ ] Run `baml-cli generate`
- [ ] Create `src/skills/coding/research-orchestrator.ts`
- [ ] Test: `qara "research codebase: how does X work"`

### Phase 2: Planning
- [ ] Create `baml_src/skills/coding/planning.baml`
- [ ] Run `baml-cli generate`
- [ ] Create `src/skills/coding/planning-orchestrator.ts`
- [ ] Test: `qara "create plan: add feature Y"`

### Phase 3: Implementation
- [ ] Create `baml_src/skills/coding/implementation.baml`
- [ ] Run `baml-cli generate`
- [ ] Create `src/skills/coding/implementation-orchestrator.ts`
- [ ] Test: `qara "implement plan: path/to/plan.md"`

### Phase 4: Validation
- [ ] Create `baml_src/skills/coding/validation.baml`
- [ ] Run `baml-cli generate`
- [ ] Create `src/skills/coding/validation-orchestrator.ts`
- [ ] Test: `qara "validate plan: path/to/plan.md"`

### Phase 5: Knowledge
- [ ] Create `baml_src/skills/coding/knowledge.baml`
- [ ] Run `baml-cli generate`
- [ ] Create `src/skills/coding/knowledge-orchestrator.ts`
- [ ] Test: `qara "create handoff"` and `qara "capture learning"`

### Phase 6: Integration
- [ ] Add all skills to registry
- [ ] Create unified `CodingWorkflowOrchestrator`
- [ ] Add CLI commands for workflow
- [ ] Integration tests for full workflow

**Estimated Time:** 15-20 hours total

---

## Key Design Principles (from Source Commands)

### From `research_codebase.md`
- **Document what IS, not what SHOULD BE**
- Use parallel sub-agents for efficiency
- Synthesize findings with file:line references
- Never critique or suggest improvements

### From `create_plan.md`
- **Be skeptical** - question vague requirements
- **Be interactive** - don't write full plan in one shot
- **Be thorough** - read all files completely
- **No open questions** in final plan

### From `implement_plan.md`
- Follow plan's intent while adapting to reality
- Implement each phase fully before moving on
- **Pause for manual verification** after automated checks
- Update checkboxes as you complete sections

### From `validate_plan.md`
- Systematic validation of each phase
- Run ALL automated checks
- Document both successes and issues
- Think critically about edge cases

### From `create_handoff.md`
- **Thorough but concise**
- Use file:line references, not code blocks
- Include both high-level and low-level details
- Clear next steps for resumption

### From `capture-learning.md`
- Document the **journey**, not just the destination
- Capture before/after mental models
- Make learnings actionable
- Enable pattern recognition for future

---

## Related Documents

- [IMPLEMENTATION_INDEX.md](./IMPLEMENTATION_INDEX.md) - Master implementation guide
- [RESEARCH_SKILL_OVERVIEW.md](./RESEARCH_SKILL_OVERVIEW.md) - Similar parallel research pattern
- [FABRIC_SKILL_INTEGRATION.md](./FABRIC_SKILL_INTEGRATION.md) - Pattern for orchestrators

---

**Document Version:** 1.0  
**Created:** December 3, 2025  
**Source:** Analyzed from `/Users/jmbook/qara/.claude/commands/`
