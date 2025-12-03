# Qara v2: Research Skill - BAML Definitions

**Date:** December 3, 2025  
**Version:** 1.0  
**Related:** [RESEARCH_SKILL_OVERVIEW.md](./RESEARCH_SKILL_OVERVIEW.md)

---

## Core Types (`baml_src/skills/research/types.baml`)

```baml
// Core research types - shared across all research functions

class Source {
  url string @description("Source URL")
  title string @description("Page or article title")
  snippet string @description("Relevant excerpt (100-200 words)")
  source_type string @description("primary|secondary|tertiary")
  authority_score float @description("0-1 authority/reliability score")
  recency string @description("Publication date or 'unknown'")
  bias_indicator string? @description("left|center|right|unknown")
}

class Finding {
  claim string @description("The specific claim or finding")
  confidence string @description("HIGH|MEDIUM|LOW|UNVERIFIED")
  sources Source[] @description("Sources supporting this finding")
  contradictions string[]? @description("Any contradicting information found")
}

class ResearchGap {
  topic string @description("What information is missing")
  importance string @description("CRITICAL|IMPORTANT|NICE_TO_HAVE")
  suggested_query string @description("Query to fill this gap")
}

class FollowUpSuggestion {
  query string @description("Suggested follow-up research query")
  rationale string @description("Why this would be valuable")
  estimated_depth string @description("quick|standard|deep")
  priority int @description("1=highest, 3=lowest")
}

class QualityMetrics {
  coverage_score int @description("0-100: breadth and depth of coverage")
  confidence_score int @description("0-100: source reliability and validation")
  depth_score int @description("0-100: analysis depth achieved")
  overall_grade string @description("A|B|C|D based on all scores")
}

class ResearchResult {
  summary string @description("Executive summary (200-500 words)")
  key_findings Finding[] @description("Main findings with confidence levels")
  sources Source[] @description("All sources consulted")
  gaps ResearchGap[] @description("Information gaps identified")
  follow_ups FollowUpSuggestion[] @description("Suggested next research")
  quality QualityMetrics @description("Quality assessment")
  methodology string @description("Brief description of research approach")
}
```

---

## Validation Types & Function (`baml_src/skills/research/validate.baml`)

```baml
class ValidationRequest {
  query string @description("Original user query")
  context string? @description("Any additional context provided")
}

class ValidationResult {
  is_clear bool @description("Is the query unambiguous?")
  topics string[] @description("Distinct topics identified")
  relationship string @description("coordinated|separate|comparison|unclear")
  time_period string @description("Specific dates or 'unspecified'")
  primary_sources string[] @description("Key sources to check first")
  recommended_structure string @description("How to structure the research")
  clarification_needed string[]? @description("Questions to ask user if unclear")
}

function ValidateResearchScope(req: ValidationRequest) -> ValidationResult {
  client ClaudeHaiku
  prompt #"
    You are a research planning assistant. Analyze this research request.
    
    Query: {{ req.query }}
    {% if req.context %}Context: {{ req.context }}{% endif %}
    
    Determine:
    1. Is this query clear and unambiguous?
    2. How many distinct topics are mentioned?
    3. Are topics related/coordinated or separate events?
    4. Is there a specific time period?
    5. What are the primary authoritative sources to check?
    6. How should research be structured?
    7. What clarifying questions would help (if any)?
    
    Be concise. This is a quick validation step (< 30 seconds).
    
    {{ ctx.output_format }}
  "#
}

test ValidateAmbiguous {
  functions [ValidateResearchScope]
  args {
    req {
      query "Research the Vanguard and Singapore announcements about XRP"
      context "Recent news from December 2025"
    }
  }
}
```

---

## Decomposition Types & Function (`baml_src/skills/research/decompose.baml`)

```baml
class DecompositionRequest {
  query string
  depth int @description("1=quick, 2=standard, 3=deep, 4=extensive")
  validation ValidationResult @description("From validation phase")
}

class SubQuery {
  query string @description("Specific sub-query to research")
  focus string @description("What aspect this covers")
  priority int @description("1=essential, 2=important, 3=supplementary")
  recommended_model string @description("Which LLM is best for this query")
  boundary string @description("What NOT to include (prevents overlap)")
}

class DecompositionResult {
  primary_queries SubQuery[] @description("Core research queries")
  validation_queries SubQuery[] @description("Fact-checking queries")
  edge_queries SubQuery[]? @description("Edge cases and controversies")
}

function DecomposeQuery(req: DecompositionRequest) -> DecompositionResult {
  client GPT4oMini
  prompt #"
    Decompose this research query into parallel sub-queries.
    
    Main Query: {{ req.query }}
    Depth Level: {{ req.depth }} (1=quick/2, 2=standard/4-6, 3=deep/8-10, 4=extensive/12-16)
    
    Validated Structure:
    - Topics: {{ req.validation.topics }}
    - Relationship: {{ req.validation.relationship }}
    - Time Period: {{ req.validation.time_period }}
    - Primary Sources: {{ req.validation.primary_sources }}
    
    Generate sub-queries that:
    1. Cover all aspects without overlap
    2. Have clear boundaries (what NOT to research)
    3. Are optimized for parallel execution
    4. Include validation/fact-checking queries
    5. Match depth level
    
    For each query specify:
    - Specific question to answer
    - What aspect it covers
    - Priority (1=must have, 2=important, 3=nice to have)
    - Best model (Claude for analysis, GPT for breadth, Haiku for speed)
    - Boundary (what to exclude)
    
    {{ ctx.output_format }}
  "#
}

test DecomposeStandard {
  functions [DecomposeQuery]
  args {
    req {
      query "Research AI safety developments in 2025"
      depth 2
      validation {
        is_clear true
        topics ["AI safety", "alignment research"]
        relationship "coordinated"
        time_period "2025"
        primary_sources ["arxiv.org", "anthropic.com"]
        recommended_structure "Topic-based parallel research"
      }
    }
  }
}
```

---

## Core Research Function (`baml_src/skills/research/research.baml`)

```baml
class ResearchRequest {
  query string @description("The specific research query")
  focus string @description("What aspect to focus on")
  boundary string @description("What NOT to include")
  depth int @description("1-4 depth level")
  existing_knowledge string? @description("What we already know")
}

function ResearchTopic(req: ResearchRequest) -> ResearchResult {
  client Production
  prompt #"
    You are an expert researcher conducting thorough investigation.
    
    Research Query: {{ req.query }}
    Focus Area: {{ req.focus }}
    Depth Level: {{ req.depth }}
    
    BOUNDARIES (DO NOT research - other agents handle):
    {{ req.boundary }}
    
    {% if req.existing_knowledge %}
    Existing Knowledge: {{ req.existing_knowledge }}
    {% endif %}
    
    Instructions:
    1. Provide clear, factual findings with source attribution
    2. Rate confidence for each finding:
       - HIGH: Multiple authoritative sources agree
       - MEDIUM: Single authoritative source
       - LOW: Limited or conflicting sources
       - UNVERIFIED: Cannot verify
    3. Identify {{ req.depth * 2 }} key findings minimum
    4. Note contradictions or controversies
    5. Identify information gaps
    6. Suggest {{ req.depth }} follow-up directions
    7. Assess quality (coverage, confidence, depth)
    
    Source Authority:
    - 0.9-1.0: Government/regulatory, peer-reviewed
    - 0.7-0.9: Major news, industry publications
    - 0.5-0.7: Blogs, analyst reports
    - 0.3-0.5: Social media, forums
    - 0.0-0.3: Anonymous, speculation
    
    {{ ctx.output_format }}
  "#
}

test ResearchAISafety {
  functions [ResearchTopic]
  args {
    req {
      query "Latest developments in AI alignment research"
      focus "Technical approaches and breakthroughs"
      boundary "Do not cover policy/regulation"
      depth 3
    }
  }
}
```

---

## Fact-Check Function (`baml_src/skills/research/factcheck.baml`)

```baml
class FactCheckRequest {
  claims string[] @description("Claims to verify")
  context string @description("Context around these claims")
}

class FactCheckResult {
  claim string
  verdict string @description("VERIFIED|PARTIALLY_TRUE|MISLEADING|FALSE|UNVERIFIABLE")
  explanation string @description("Why this verdict")
  sources Source[] @description("Sources used for verification")
  nuance string? @description("Important context or caveats")
}

class FactCheckResponse {
  results FactCheckResult[]
  overall_accuracy float @description("0-1 overall accuracy of claims")
  red_flags string[] @description("Major concerns identified")
}

function FactCheckClaims(req: FactCheckRequest) -> FactCheckResponse {
  client Claude
  prompt #"
    You are a rigorous fact-checker. Verify these claims:
    
    {% for claim in req.claims %}
    {{ loop.index }}. {{ claim }}
    {% endfor %}
    
    Context: {{ req.context }}
    
    For each claim:
    1. Search for authoritative sources
    2. Determine verdict:
       - VERIFIED: Multiple authoritative sources confirm
       - PARTIALLY_TRUE: True but missing context
       - MISLEADING: Technically true but misleading
       - FALSE: Contradicted by sources
       - UNVERIFIABLE: Cannot verify
    3. Explain reasoning
    4. Note nuance or caveats
    5. Cite sources with authority scores
    
    Be rigorous. Say UNVERIFIABLE rather than guessing.
    
    Red flags:
    - Single anonymous sources
    - Conflation of separate events
    - Outdated info as current
    - Speculation as fact
    
    {{ ctx.output_format }}
  "#
}

test FactCheckClaims {
  functions [FactCheckClaims]
  args {
    req {
      claims [
        "Vanguard announced direct XRP investment",
        "Singapore granted Ripple a payments license"
      ]
      context "Crypto news December 2025"
    }
  }
}
```

---

## Synthesis Function (`baml_src/skills/research/synthesize.baml`)

```baml
class SynthesisRequest {
  original_query string
  research_results ResearchResult[]
  fact_check FactCheckResponse?
  output_format string @description("executive|full|bullets|table")
}

class ExecutiveBrief {
  title string
  date string
  research_question string
  key_findings Finding[] @description("Top 3-5 findings only")
  critical_distinctions string[] @description("What IS true vs NOT")
  confidence_summary string
  strategic_implications string[]
  recommended_actions string[]
  deep_dive_links string[]
  read_time string
}

class SynthesisResult {
  executive_brief ExecutiveBrief @description("Tier 1: 500 words")
  detailed_analysis string @description("Tier 2: Full markdown")
  source_appendix string @description("Tier 3: Complete sources")
  quality QualityMetrics
}

function SynthesizeFindings(req: SynthesisRequest) -> SynthesisResult {
  client GPT4o
  prompt #"
    Synthesize research results into tiered output.
    
    Original Query: {{ req.original_query }}
    Output Format: {{ req.output_format }}
    
    Research Results:
    {% for result in req.research_results %}
    --- Stream {{ loop.index }} ---
    Summary: {{ result.summary }}
    Findings: 
    {% for f in result.key_findings %}
    - {{ f.claim }} [{{ f.confidence }}]
    {% endfor %}
    {% endfor %}
    
    {% if req.fact_check %}
    Fact-Check: Accuracy {{ req.fact_check.overall_accuracy }}
    {% for r in req.fact_check.results %}
    - {{ r.claim }}: {{ r.verdict }}
    {% endfor %}
    {% endif %}
    
    Create THREE-TIER output:
    
    TIER 1 - EXECUTIVE BRIEF (500 words):
    - Title, date, research question
    - Top 3-5 findings (✅ VERIFIED, ⚠️ MEDIUM, ❓ LOW)
    - What IS true vs NOT true
    - Strategic implications
    - Recommended actions
    
    TIER 2 - DETAILED ANALYSIS (2,000-5,000 words):
    - Comprehensive by topic
    - All findings with evidence
    - Methodology, risks, limitations
    
    TIER 3 - SOURCE APPENDIX:
    - Complete sources with URLs
    - Authority scores
    - Full citations
    
    {{ ctx.output_format }}
  "#
}
```

---

## BAML Client Configuration

Ensure these clients are defined in `baml_src/clients.baml`:

```baml
client<llm> ClaudeHaiku {
  provider anthropic
  options {
    model "claude-3-5-haiku-20241022"
    api_key env.ANTHROPIC_API_KEY
    temperature 0.3
    max_tokens 2048
  }
}

client<llm> GPT4oMini {
  provider openai
  options {
    model "gpt-4o-mini-2024-07-18"
    api_key env.OPENAI_API_KEY
    temperature 0.5
    max_tokens 4096
  }
}

client<llm> GPT4o {
  provider openai
  options {
    model "gpt-4o-2024-11-20"
    api_key env.OPENAI_API_KEY
    temperature 0.7
    max_tokens 8192
  }
}

client<llm> Claude {
  provider anthropic
  options {
    model "claude-3-7-sonnet-20250219"
    api_key env.ANTHROPIC_API_KEY
    temperature 0.5
    max_tokens 8192
  }
}

client<llm> Production {
  provider round_robin
  strategy [GPT4o, Claude]
}
```

---

**Next:** [RESEARCH_SKILL_TYPESCRIPT.md](./RESEARCH_SKILL_TYPESCRIPT.md) - TypeScript orchestrator
