// Research Skill - Shared Types
// These types are used across all research functions

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
