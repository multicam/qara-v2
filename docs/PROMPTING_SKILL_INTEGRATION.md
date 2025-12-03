# Qara v2: Prompting Skill Integration

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Future Integration (Phase 5+)  
**Priority:** High

---

## ⚠️ Critical Review Notes

### Meta-Skill Consideration

This is a **skill for improving prompts** - a meta-skill. Consider:

1. **Who needs this?** Users who write prompts frequently
2. **When is it useful?** When crafting prompts for other systems
3. **Is it core to Qara?** No - it's a utility skill

### Simpler Alternative

Before building a full skill, consider:
```bash
# Use Claude directly
echo "Improve this prompt: [your prompt]" | claude
```

### When to Build

**Build when:** You're using Qara to generate prompts for other systems regularly.

**Don't build when:** You occasionally want prompt feedback (just ask Claude).

### Iterative Refinement Complexity

The `refineUntilGood` function loops until quality threshold met. Risks:
- Infinite loops if threshold never reached
- Cost accumulation (each iteration = LLM call)
- Diminishing returns after 2-3 iterations

**Recommendation:** Cap at 3 iterations, log cost per refinement.

---

## Overview

The **Prompting Skill** helps users craft better prompts for LLMs. This is a meta-skill - using AI to improve how users interact with AI. It's particularly valuable because prompt quality directly impacts output quality.

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Prompt Enhancement** | Improve a basic prompt |
| **Prompt Generation** | Create prompt from goal description |
| **Prompt Analysis** | Evaluate prompt quality, identify issues |
| **Prompt Templates** | Generate reusable templates |
| **System Prompt Design** | Create system prompts for agents |

---

## BAML Fit Analysis

### Why This Fits BAML Well

| Aspect | Assessment |
|--------|------------|
| **Structured Output** | ✅ Prompts have clear structure |
| **Quality Metrics** | ✅ Can score clarity, specificity, etc. |
| **Iterative Refinement** | ✅ Multi-step improvement |
| **Templates** | ✅ Reusable patterns |

### Verdict: **Excellent fit for BAML**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Prompting Skill                                            │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Prompt Enhancer │  │ Prompt Generator│                  │
│  │ (improve)       │  │ (create new)    │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Prompt Analyzer │  │ Template Builder│                  │
│  │ (evaluate)      │  │ (reusable)      │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  PromptingOrchestrator                                  ││
│  │  - Mode selection                                       ││
│  │  - Iterative refinement                                 ││
│  │  - Quality scoring                                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## BAML Types

```baml
// baml_src/skills/prompting/types.baml

// Quality assessment for prompts
class PromptQuality {
  clarity_score int @description("0-100: How clear and unambiguous")
  specificity_score int @description("0-100: How specific vs vague")
  structure_score int @description("0-100: How well organized")
  completeness_score int @description("0-100: Has all needed context")
  overall_score int @description("0-100: Overall quality")
  grade string @description("A|B|C|D|F")
}

// Issues found in a prompt
class PromptIssue {
  issue string @description("Description of the issue")
  severity string @description("HIGH|MEDIUM|LOW")
  location string @description("Which part of prompt")
  suggestion string @description("How to fix it")
}

// Analysis result
class PromptAnalysis {
  quality PromptQuality
  issues PromptIssue[]
  strengths string[]
  model_fit string @description("Which models this prompt works best with")
}

// Enhanced prompt result
class EnhancedPrompt {
  original string
  enhanced string
  changes_made string[] @description("List of improvements")
  quality_before PromptQuality
  quality_after PromptQuality
  explanation string @description("Why these changes help")
}

// Generated prompt
class GeneratedPrompt {
  prompt string
  system_prompt string? @description("If applicable")
  user_prompt string? @description("If separate from system")
  variables string[] @description("Placeholders like {{topic}}")
  quality PromptQuality
  usage_tips string[]
}

// Prompt template
class PromptTemplate {
  name string
  description string
  category string @description("research|creative|analysis|coding|etc")
  system_prompt string
  user_prompt_template string
  variables TemplateVariable[]
  examples TemplateExample[]
}

class TemplateVariable {
  name string
  description string
  required bool
  default_value string?
  example_values string[]
}

class TemplateExample {
  inputs map<string, string>
  expected_output_description string
}
```

---

## BAML Functions

```baml
// baml_src/skills/prompting/functions.baml

// Analyze prompt quality
function AnalyzePrompt(prompt: string) -> PromptAnalysis {
  client Claude
  prompt #"
    # IDENTITY
    You are an expert prompt engineer who analyzes prompts for LLMs.
    
    # TASK
    Analyze this prompt for quality, issues, and model fit.
    
    # PROMPT TO ANALYZE
    {{ prompt }}
    
    # SCORING CRITERIA
    - Clarity (0-100): Is it unambiguous? Clear instructions?
    - Specificity (0-100): Concrete vs vague? Measurable outcomes?
    - Structure (0-100): Well organized? Logical flow?
    - Completeness (0-100): Has context? Examples? Constraints?
    
    # ISSUES TO CHECK
    - Ambiguous language
    - Missing context
    - Unclear output format
    - Too broad/narrow scope
    - Missing constraints
    - Poor structure
    
    {{ ctx.output_format }}
  "#
}

// Enhance an existing prompt
function EnhancePrompt(
  prompt: string,
  goal: string?,
  target_model: string?
) -> EnhancedPrompt {
  client GPT4o
  prompt #"
    # IDENTITY
    You are an expert prompt engineer who improves prompts.
    
    # TASK
    Enhance this prompt while preserving its intent.
    
    # ORIGINAL PROMPT
    {{ prompt }}
    
    {% if goal %}
    # STATED GOAL
    {{ goal }}
    {% endif %}
    
    {% if target_model %}
    # TARGET MODEL
    Optimize for: {{ target_model }}
    {% endif %}
    
    # ENHANCEMENT PRINCIPLES
    1. Add clarity without verbosity
    2. Include output format specification
    3. Add relevant constraints
    4. Use structured sections if helpful
    5. Add examples if beneficial
    6. Preserve original intent
    
    # OUTPUT
    Provide the enhanced prompt and explain changes.
    
    {{ ctx.output_format }}
  "#
}

// Generate a new prompt from description
function GeneratePrompt(
  goal: string,
  context: string?,
  output_type: string?,
  target_model: string?
) -> GeneratedPrompt {
  client GPT4o
  prompt #"
    # IDENTITY
    You are an expert prompt engineer who creates effective prompts.
    
    # TASK
    Create a prompt to achieve this goal:
    {{ goal }}
    
    {% if context %}
    # CONTEXT
    {{ context }}
    {% endif %}
    
    {% if output_type %}
    # DESIRED OUTPUT TYPE
    {{ output_type }}
    {% endif %}
    
    {% if target_model %}
    # TARGET MODEL
    {{ target_model }}
    {% endif %}
    
    # PROMPT STRUCTURE
    Include as appropriate:
    - Clear identity/role for the AI
    - Specific task description
    - Input format specification
    - Output format specification
    - Constraints and guidelines
    - Examples if helpful
    
    # OUTPUT
    Generate the prompt with quality assessment.
    
    {{ ctx.output_format }}
  "#
}

// Create reusable template
function CreatePromptTemplate(
  purpose: string,
  category: string,
  example_use_case: string
) -> PromptTemplate {
  client GPT4o
  prompt #"
    # IDENTITY
    You are an expert at creating reusable prompt templates.
    
    # TASK
    Create a template for: {{ purpose }}
    Category: {{ category }}
    
    # EXAMPLE USE CASE
    {{ example_use_case }}
    
    # TEMPLATE REQUIREMENTS
    1. Use {{variable_name}} for placeholders
    2. Include clear variable descriptions
    3. Provide 2-3 example usages
    4. Make it flexible but structured
    5. Include system prompt if beneficial
    
    {{ ctx.output_format }}
  "#
}

// Iterative refinement
function RefinePrompt(
  prompt: string,
  feedback: string,
  iteration: int
) -> EnhancedPrompt {
  client GPT4o
  prompt #"
    # IDENTITY
    You are refining a prompt based on feedback.
    
    # CURRENT PROMPT (Iteration {{ iteration }})
    {{ prompt }}
    
    # FEEDBACK
    {{ feedback }}
    
    # TASK
    Refine the prompt to address the feedback while maintaining strengths.
    
    {{ ctx.output_format }}
  "#
}
```

---

## TypeScript Orchestrator

```typescript
// src/skills/prompting/orchestrator.ts

import { b } from '../../baml_client';
import type {
  PromptAnalysis,
  EnhancedPrompt,
  GeneratedPrompt,
  PromptTemplate
} from '../../baml_client/types';

export interface PromptingOptions {
  targetModel?: string;
  maxIterations?: number;
  qualityThreshold?: number;
  verbose?: boolean;
}

export class PromptingOrchestrator {

  /**
   * Analyze a prompt's quality
   */
  async analyze(prompt: string): Promise<PromptAnalysis> {
    return b.AnalyzePrompt(prompt);
  }

  /**
   * Enhance a prompt
   */
  async enhance(
    prompt: string,
    goal?: string,
    options?: PromptingOptions
  ): Promise<EnhancedPrompt> {
    return b.EnhancePrompt(prompt, goal, options?.targetModel);
  }

  /**
   * Generate a new prompt from goal
   */
  async generate(
    goal: string,
    context?: string,
    outputType?: string,
    options?: PromptingOptions
  ): Promise<GeneratedPrompt> {
    return b.GeneratePrompt(goal, context, outputType, options?.targetModel);
  }

  /**
   * Create a reusable template
   */
  async createTemplate(
    purpose: string,
    category: string,
    exampleUseCase: string
  ): Promise<PromptTemplate> {
    return b.CreatePromptTemplate(purpose, category, exampleUseCase);
  }

  /**
   * Iteratively refine until quality threshold met
   */
  async refineUntilGood(
    prompt: string,
    options: PromptingOptions = {}
  ): Promise<EnhancedPrompt> {
    const maxIterations = options.maxIterations || 3;
    const threshold = options.qualityThreshold || 80;
    
    let current = prompt;
    let result: EnhancedPrompt | null = null;
    
    for (let i = 0; i < maxIterations; i++) {
      // Analyze current
      const analysis = await this.analyze(current);
      
      if (analysis.quality.overall_score >= threshold) {
        if (options.verbose) {
          console.log(`[prompting] Quality ${analysis.quality.overall_score} meets threshold`);
        }
        break;
      }
      
      // Generate feedback from issues
      const feedback = analysis.issues
        .map(issue => `${issue.severity}: ${issue.issue} - ${issue.suggestion}`)
        .join('\n');
      
      // Refine
      result = await b.RefinePrompt(current, feedback, i + 1);
      current = result.enhanced;
      
      if (options.verbose) {
        console.log(`[prompting] Iteration ${i + 1}: ${result.quality_after.overall_score}`);
      }
    }
    
    return result || await this.enhance(prompt);
  }
}

export function createPromptingOrchestrator(): PromptingOrchestrator {
  return new PromptingOrchestrator();
}
```

---

## Skill Registry

```typescript
// Add to src/skills/registry.ts

{
  id: 'prompt-analyze',
  name: 'Analyze Prompt',
  description: 'Evaluate prompt quality and identify issues',
  triggers: ['analyze prompt', 'check prompt', 'prompt quality'],
  bamlFunction: 'AnalyzePrompt'
},
{
  id: 'prompt-enhance',
  name: 'Enhance Prompt',
  description: 'Improve an existing prompt',
  triggers: ['enhance prompt', 'improve prompt', 'better prompt', 'fix prompt'],
  bamlFunction: 'EnhancePrompt'
},
{
  id: 'prompt-generate',
  name: 'Generate Prompt',
  description: 'Create a new prompt from a goal description',
  triggers: ['generate prompt', 'create prompt', 'write prompt', 'make prompt'],
  bamlFunction: 'GeneratePrompt'
},
{
  id: 'prompt-template',
  name: 'Create Prompt Template',
  description: 'Create a reusable prompt template',
  triggers: ['prompt template', 'create template', 'reusable prompt'],
  bamlFunction: 'CreatePromptTemplate'
}
```

---

## Usage Examples

```bash
# Analyze a prompt
qara "analyze prompt: Write me a blog post about AI"

# Enhance a prompt
qara "enhance prompt: Summarize this article" --goal="Get key points"

# Generate from goal
qara "generate prompt for: extracting action items from meeting notes"

# Create template
qara "create prompt template for: weekly status reports"
```

---

## File Structure

```
baml_src/skills/prompting/
├── types.baml           # Quality, Analysis, Template types
└── functions.baml       # Analyze, Enhance, Generate, Template

src/skills/prompting/
└── orchestrator.ts      # PromptingOrchestrator
```

---

## Implementation Checklist

- [ ] Create `baml_src/skills/prompting/types.baml`
- [ ] Create `baml_src/skills/prompting/functions.baml`
- [ ] Run `baml-cli generate`
- [ ] Create `src/skills/prompting/orchestrator.ts`
- [ ] Add to skill registry
- [ ] Test analyze, enhance, generate functions
- [ ] Test iterative refinement

**Estimated Time:** 2-3 hours

---

**Document Version:** 1.0  
**Created:** December 3, 2025
