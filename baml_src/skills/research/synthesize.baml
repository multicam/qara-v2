// Research Skill - Synthesis
// Combine results into tiered output

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
  read_time string
}

class SynthesisResult {
  executive_brief ExecutiveBrief @description("Tier 1: 500 words max")
  detailed_analysis string @description("Tier 2: Full markdown analysis")
  source_appendix string @description("Tier 3: Complete sources list")
  quality QualityMetrics
}

function SynthesizeFindings(req: SynthesisRequest) -> SynthesisResult {
  client CustomGPT5
  prompt #"
    Synthesize research results into tiered output.
    
    Original Query: {{ req.original_query }}
    Output Format: {{ req.output_format }}
    
    Research Results:
    {% for result in req.research_results %}
    --- Research Stream {{ loop.index }} ---
    Summary: {{ result.summary }}
    Findings: 
    {% for f in result.key_findings %}
    - {{ f.claim }} [{{ f.confidence }}]
    {% endfor %}
    Quality: {{ result.quality.overall_grade }}
    {% endfor %}
    
    {% if req.fact_check %}
    Fact-Check Results (Accuracy: {{ req.fact_check.overall_accuracy }}):
    {% for r in req.fact_check.results %}
    - {{ r.claim }}: {{ r.verdict }}
    {% endfor %}
    {% if req.fact_check.red_flags %}
    Red Flags: {{ req.fact_check.red_flags }}
    {% endif %}
    {% endif %}
    
    Create THREE-TIER output:
    
    TIER 1 - EXECUTIVE BRIEF (500 words max):
    - Clear title and date
    - Research question restated
    - Top 3-5 findings with confidence indicators (✅ HIGH, ⚠️ MEDIUM, ❓ LOW)
    - What IS true vs what is NOT true
    - Strategic implications
    - Recommended actions
    - Estimated read time
    
    TIER 2 - DETAILED ANALYSIS:
    - Comprehensive coverage by topic
    - All findings with supporting evidence
    - Methodology description
    - Risks and limitations
    - Formatted as clean markdown
    
    TIER 3 - SOURCE APPENDIX:
    - Complete list of sources with URLs
    - Authority scores for each
    - Full citations
    
    {{ ctx.output_format }}
  "#
}

test SynthesizeSimple {
  functions [SynthesizeFindings]
  args {
    req {
      original_query "AI safety developments"
      research_results [{
        summary "AI safety research has accelerated in 2025"
        key_findings [{
          claim "Anthropic released new interpretability tools"
          confidence "HIGH"
          sources []
          contradictions null
        }]
        sources []
        gaps []
        follow_ups []
        quality {
          coverage_score 75
          confidence_score 80
          depth_score 70
          overall_grade "B"
        }
        methodology "Web research and paper analysis"
      }]
      fact_check null
      output_format "executive"
    }
  }
}
