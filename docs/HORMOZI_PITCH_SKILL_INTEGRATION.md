# Qara v2: Alex Hormozi Pitch Skill Integration

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Future Integration (Phase 5+)  
**Priority:** Medium

---

## Overview

The **Hormozi Pitch Skill** generates compelling offers and pitches using Alex Hormozi's frameworks from "$100M Offers" and "$100M Leads". This skill transforms product/service descriptions into high-converting copy.

### Core Frameworks

| Framework | Source | Purpose |
|-----------|--------|---------|
| **Value Equation** | $100M Offers | Dream Outcome × Perceived Likelihood / Time × Effort |
| **Grand Slam Offer** | $100M Offers | Irresistible offer construction |
| **Stack Building** | $100M Offers | Bonus stacking for perceived value |
| **Lead Magnet** | $100M Leads | High-value free offers |
| **Core Four** | $100M Leads | Warm outreach, cold outreach, content, paid ads |

---

## BAML Fit Analysis

### Why This Fits BAML Well

| Aspect | Assessment |
|--------|------------|
| **Structured Frameworks** | ✅ Hormozi's frameworks are highly structured |
| **Repeatable Patterns** | ✅ Same formula, different inputs |
| **Measurable Components** | ✅ Value equation has clear variables |
| **Multiple Output Types** | ✅ Headlines, bullets, full copy |

### Verdict: **Excellent fit - frameworks are inherently structured**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Hormozi Pitch Skill                                        │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Value Equation  │  │ Grand Slam Offer│                  │
│  │ Calculator      │  │ Builder         │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Stack Builder   │  │ Lead Magnet     │                  │
│  │ (bonuses)       │  │ Generator       │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  HormoziOrchestrator                                    ││
│  │  - Full pitch generation                                ││
│  │  - Component assembly                                   ││
│  │  - Copy variations                                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## BAML Types

```baml
// baml_src/skills/hormozi/types.baml

// Input: What you're selling
class OfferInput {
  product_name string
  product_description string
  target_audience string
  price float
  current_pain_points string[]
  desired_outcomes string[]
  competitors string[]?
  unique_mechanism string? @description("What makes your solution different")
}

// Value Equation Components
class ValueEquation {
  dream_outcome string @description("The ideal end state")
  dream_outcome_score int @description("1-10: How desirable")
  perceived_likelihood string @description("Why they'll believe it works")
  likelihood_score int @description("1-10: How believable")
  time_delay string @description("How long to see results")
  time_score int @description("1-10: 10=instant, 1=years")
  effort_sacrifice string @description("What they have to do/give up")
  effort_score int @description("1-10: 10=effortless, 1=hard")
  total_value_score float @description("(dream×likelihood)/(time×effort)")
}

// Grand Slam Offer Structure
class GrandSlamOffer {
  headline string @description("Main attention-grabbing headline")
  subheadline string @description("Clarifying statement")
  dream_outcome string
  unique_mechanism string @description("How/why it works")
  proof_elements string[] @description("Testimonials, data, credentials")
  risk_reversal string @description("Guarantee or risk removal")
  urgency string @description("Why act now")
  scarcity string @description("Limited availability")
  call_to_action string
}

// Bonus Stack
class BonusStack {
  core_offer string
  bonuses Bonus[]
  total_value float
  price float
  value_to_price_ratio float
}

class Bonus {
  name string
  description string
  perceived_value float
  why_valuable string @description("Why this bonus matters")
  delivery_method string
}

// Lead Magnet
class LeadMagnet {
  title string
  hook string @description("Why they should get it")
  format string @description("PDF, video, tool, etc.")
  promise string @description("What they'll learn/get")
  contents string[] @description("What's included")
  call_to_action string
  follow_up_sequence string[] @description("What happens after")
}

// Full Pitch Output
class HormoziPitch {
  value_equation ValueEquation
  offer GrandSlamOffer
  bonus_stack BonusStack
  lead_magnet LeadMagnet?
  sales_page_copy SalesPageCopy
  email_sequence string[]?
  ad_copy AdCopy?
}

// Sales Page Sections
class SalesPageCopy {
  headline string
  subheadline string
  opening_hook string @description("Pattern interrupt or story")
  problem_agitation string @description("Twist the knife on pain")
  solution_introduction string
  mechanism_explanation string
  social_proof string
  offer_presentation string
  bonus_stack_presentation string
  guarantee string
  faq FaqItem[]
  final_cta string
}

class FaqItem {
  question string
  answer string
}

// Ad Copy Variations
class AdCopy {
  facebook_primary string
  facebook_variations string[]
  google_headlines string[]
  google_descriptions string[]
}
```

---

## BAML Functions

```baml
// baml_src/skills/hormozi/functions.baml

// Calculate Value Equation
function CalculateValueEquation(input: OfferInput) -> ValueEquation {
  client GPT4o
  prompt #"
    # IDENTITY
    You are Alex Hormozi analyzing an offer using the Value Equation.
    
    # VALUE EQUATION
    Value = (Dream Outcome × Perceived Likelihood of Achievement) / 
            (Time Delay × Effort & Sacrifice)
    
    # OFFER TO ANALYZE
    Product: {{ input.product_name }}
    Description: {{ input.product_description }}
    Target: {{ input.target_audience }}
    Price: ${{ input.price }}
    
    Pain Points:
    {% for pain in input.pain_points %}
    - {{ pain }}
    {% endfor %}
    
    Desired Outcomes:
    {% for outcome in input.desired_outcomes %}
    - {{ outcome }}
    {% endfor %}
    
    # TASK
    1. Define the dream outcome (make it vivid and specific)
    2. Assess perceived likelihood (what proof/mechanism increases belief)
    3. Evaluate time delay (how fast do they see results)
    4. Assess effort required (what do they have to do)
    5. Score each component 1-10
    6. Calculate total value score
    
    # SCORING GUIDE
    - Dream Outcome: 10 = life-changing, 1 = minor improvement
    - Likelihood: 10 = guaranteed, 1 = seems impossible
    - Time: 10 = instant results, 1 = takes years
    - Effort: 10 = done for you, 1 = massive effort required
    
    {{ ctx.output_format }}
  "#
}

// Build Grand Slam Offer
function BuildGrandSlamOffer(
  input: OfferInput,
  value_equation: ValueEquation
) -> GrandSlamOffer {
  client GPT4o
  prompt #"
    # IDENTITY
    You are Alex Hormozi creating a Grand Slam Offer.
    
    # GRAND SLAM OFFER CRITERIA
    A Grand Slam Offer is so good people feel stupid saying no.
    
    # PRODUCT
    {{ input.product_name }}: {{ input.product_description }}
    Target: {{ input.target_audience }}
    Price: ${{ input.price }}
    
    # VALUE EQUATION ANALYSIS
    Dream Outcome: {{ value_equation.dream_outcome }}
    Unique Mechanism: {{ input.unique_mechanism }}
    
    # TASK
    Create a Grand Slam Offer with:
    1. Headline that stops them in their tracks
    2. Subheadline that clarifies and hooks
    3. Clear dream outcome statement
    4. Unique mechanism (why YOUR solution works)
    5. Proof elements (what builds credibility)
    6. Risk reversal (guarantee that removes all risk)
    7. Urgency (why they must act NOW)
    8. Scarcity (why they might miss out)
    9. Clear call to action
    
    # HEADLINE FORMULAS
    - "How to [Dream Outcome] in [Time] without [Pain Point]"
    - "The [Unique Mechanism] that [Dream Outcome]"
    - "[Number] [Target Audience] are now [Dream Outcome]"
    
    {{ ctx.output_format }}
  "#
}

// Build Bonus Stack
function BuildBonusStack(
  input: OfferInput,
  offer: GrandSlamOffer
) -> BonusStack {
  client GPT4o
  prompt #"
    # IDENTITY
    You are Alex Hormozi building a bonus stack.
    
    # BONUS STACK PRINCIPLES
    - Each bonus should solve a related problem
    - Bonuses should have high perceived value
    - Total stack value should be 10x+ the price
    - Bonuses should be easy to deliver (low cost)
    
    # CORE OFFER
    {{ input.product_name }} at ${{ input.price }}
    {{ offer.headline }}
    
    # TARGET AUDIENCE
    {{ input.target_audience }}
    
    # TASK
    Create 3-5 bonuses that:
    1. Address objections before they arise
    2. Speed up results (reduce time delay)
    3. Reduce effort required
    4. Increase perceived likelihood of success
    5. Have high perceived value but low delivery cost
    
    # BONUS IDEAS
    - Templates/swipe files
    - Checklists/cheat sheets
    - Video training
    - Community access
    - 1-on-1 calls
    - Software/tools
    - Done-for-you elements
    
    {{ ctx.output_format }}
  "#
}

// Generate Lead Magnet
function GenerateLeadMagnet(input: OfferInput) -> LeadMagnet {
  client GPT4o
  prompt #"
    # IDENTITY
    You are Alex Hormozi creating a lead magnet.
    
    # LEAD MAGNET PRINCIPLES
    - Solve a narrow problem completely
    - Deliver immediate value
    - Create desire for the main offer
    - Be consumable in < 10 minutes
    
    # PRODUCT CONTEXT
    Main Offer: {{ input.product_name }}
    Target: {{ input.target_audience }}
    
    Pain Points:
    {% for pain in input.pain_points %}
    - {{ pain }}
    {% endfor %}
    
    # TASK
    Create a lead magnet that:
    1. Solves ONE specific pain point
    2. Delivers a quick win
    3. Positions the main offer as the next step
    4. Has an irresistible title
    
    # LEAD MAGNET FORMATS
    - Checklist
    - Template
    - Calculator/tool
    - Mini-course
    - Case study
    - Cheat sheet
    
    {{ ctx.output_format }}
  "#
}

// Generate Full Sales Page Copy
function GenerateSalesPageCopy(
  input: OfferInput,
  offer: GrandSlamOffer,
  stack: BonusStack
) -> SalesPageCopy {
  client GPT4o
  prompt #"
    # IDENTITY
    You are a world-class copywriter using Alex Hormozi's frameworks.
    
    # OFFER
    {{ offer.headline }}
    {{ offer.subheadline }}
    
    Product: {{ input.product_name }}
    Price: ${{ input.price }}
    
    # BONUS STACK
    {% for bonus in stack.bonuses %}
    - {{ bonus.name }} (${{ bonus.perceived_value }} value)
    {% endfor %}
    Total Value: ${{ stack.total_value }}
    
    # TASK
    Write sales page copy with:
    
    1. HEADLINE: Already provided
    2. OPENING HOOK: Pattern interrupt or relatable story
    3. PROBLEM AGITATION: Make them feel the pain deeply
    4. SOLUTION: Introduce your unique mechanism
    5. SOCIAL PROOF: Testimonials, results, credentials
    6. OFFER: Present the Grand Slam Offer
    7. BONUSES: Stack presentation with values
    8. GUARANTEE: {{ offer.risk_reversal }}
    9. FAQ: Address top objections
    10. FINAL CTA: Urgency + scarcity + action
    
    {{ ctx.output_format }}
  "#
}

// Full Pitch Generation
function GenerateHormoziPitch(input: OfferInput) -> HormoziPitch {
  client GPT4o
  prompt #"
    # IDENTITY
    You are Alex Hormozi creating a complete pitch.
    
    # INPUT
    Product: {{ input.product_name }}
    Description: {{ input.product_description }}
    Target: {{ input.target_audience }}
    Price: ${{ input.price }}
    
    Pain Points:
    {% for pain in input.pain_points %}
    - {{ pain }}
    {% endfor %}
    
    Desired Outcomes:
    {% for outcome in input.desired_outcomes %}
    - {{ outcome }}
    {% endfor %}
    
    {% if input.unique_mechanism %}
    Unique Mechanism: {{ input.unique_mechanism }}
    {% endif %}
    
    # TASK
    Generate a complete Hormozi-style pitch including:
    1. Value Equation analysis
    2. Grand Slam Offer
    3. Bonus Stack (3-5 bonuses)
    4. Lead Magnet
    5. Sales Page Copy
    
    {{ ctx.output_format }}
  "#
}
```

---

## TypeScript Orchestrator

```typescript
// src/skills/hormozi/orchestrator.ts

import { b } from '../../baml_client';
import type {
  OfferInput,
  ValueEquation,
  GrandSlamOffer,
  BonusStack,
  LeadMagnet,
  HormoziPitch,
  SalesPageCopy
} from '../../baml_client/types';

export interface HormoziOptions {
  includeLeadMagnet?: boolean;
  includeEmailSequence?: boolean;
  includeAdCopy?: boolean;
  verbose?: boolean;
}

export class HormoziOrchestrator {

  /**
   * Generate complete pitch (step by step for better quality)
   */
  async generatePitch(
    input: OfferInput,
    options: HormoziOptions = {}
  ): Promise<HormoziPitch> {
    if (options.verbose) {
      console.log('[hormozi] Calculating value equation...');
    }
    
    // Step 1: Value Equation
    const valueEquation = await b.CalculateValueEquation(input);
    
    if (options.verbose) {
      console.log(`[hormozi] Value score: ${valueEquation.total_value_score}`);
      console.log('[hormozi] Building Grand Slam Offer...');
    }
    
    // Step 2: Grand Slam Offer
    const offer = await b.BuildGrandSlamOffer(input, valueEquation);
    
    if (options.verbose) {
      console.log('[hormozi] Building bonus stack...');
    }
    
    // Step 3: Bonus Stack
    const stack = await b.BuildBonusStack(input, offer);
    
    // Step 4: Lead Magnet (optional)
    let leadMagnet: LeadMagnet | undefined;
    if (options.includeLeadMagnet) {
      if (options.verbose) {
        console.log('[hormozi] Generating lead magnet...');
      }
      leadMagnet = await b.GenerateLeadMagnet(input);
    }
    
    if (options.verbose) {
      console.log('[hormozi] Writing sales copy...');
    }
    
    // Step 5: Sales Page Copy
    const salesPageCopy = await b.GenerateSalesPageCopy(input, offer, stack);
    
    return {
      value_equation: valueEquation,
      offer,
      bonus_stack: stack,
      lead_magnet: leadMagnet,
      sales_page_copy: salesPageCopy
    };
  }

  /**
   * Quick value equation analysis
   */
  async analyzeValue(input: OfferInput): Promise<ValueEquation> {
    return b.CalculateValueEquation(input);
  }

  /**
   * Just the offer, no full pitch
   */
  async buildOffer(input: OfferInput): Promise<GrandSlamOffer> {
    const valueEquation = await b.CalculateValueEquation(input);
    return b.BuildGrandSlamOffer(input, valueEquation);
  }

  /**
   * Generate lead magnet only
   */
  async createLeadMagnet(input: OfferInput): Promise<LeadMagnet> {
    return b.GenerateLeadMagnet(input);
  }
}

export function createHormoziOrchestrator(): HormoziOrchestrator {
  return new HormoziOrchestrator();
}
```

---

## Skill Registry

```typescript
// Add to src/skills/registry.ts

{
  id: 'hormozi-pitch',
  name: 'Hormozi Pitch Generator',
  description: 'Generate Alex Hormozi-style offers and pitches',
  triggers: [
    'hormozi pitch', 'grand slam offer', 'create offer',
    'sales pitch', 'value equation', 'hormozi'
  ],
  bamlFunction: 'GenerateHormoziPitch'
},
{
  id: 'hormozi-value',
  name: 'Value Equation Calculator',
  description: 'Analyze offer using Hormozi Value Equation',
  triggers: ['value equation', 'analyze offer value', 'offer value'],
  bamlFunction: 'CalculateValueEquation'
},
{
  id: 'hormozi-leadmagnet',
  name: 'Lead Magnet Generator',
  description: 'Create Hormozi-style lead magnets',
  triggers: ['lead magnet', 'create lead magnet', 'free offer'],
  bamlFunction: 'GenerateLeadMagnet'
}
```

---

## Usage Examples

```bash
# Full pitch generation
qara "hormozi pitch" --input="product: SaaS analytics, target: e-commerce, price: 297"

# Value equation analysis
qara "value equation for my coaching program"

# Lead magnet
qara "create lead magnet for fitness coaches"
```

---

## File Structure

```
baml_src/skills/hormozi/
├── types.baml           # OfferInput, ValueEquation, GrandSlamOffer, etc.
└── functions.baml       # All generation functions

src/skills/hormozi/
└── orchestrator.ts      # HormoziOrchestrator
```

---

## Implementation Checklist

- [ ] Create `baml_src/skills/hormozi/types.baml`
- [ ] Create `baml_src/skills/hormozi/functions.baml`
- [ ] Run `baml-cli generate`
- [ ] Create `src/skills/hormozi/orchestrator.ts`
- [ ] Add to skill registry
- [ ] Test value equation
- [ ] Test full pitch generation
- [ ] Test lead magnet generation

**Estimated Time:** 3-4 hours

---

**Document Version:** 1.0  
**Created:** December 3, 2025
