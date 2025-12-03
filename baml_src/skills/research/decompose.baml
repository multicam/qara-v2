// Research Skill - Query Decomposition
// Split query into parallel, non-overlapping sub-queries

class DecompositionRequest {
  query string
  depth int @description("1=quick, 2=standard, 3=deep, 4=extensive")
  validation ValidationResult @description("From validation phase")
}

class SubQuery {
  query string @description("Specific sub-query to research")
  focus string @description("What aspect this covers")
  priority int @description("1=essential, 2=important, 3=supplementary")
  boundary string @description("What NOT to include (prevents overlap)")
}

class DecompositionResult {
  primary_queries SubQuery[] @description("Core research queries")
  validation_queries SubQuery[] @description("Fact-checking queries")
  edge_queries SubQuery[]? @description("Edge cases and controversies")
}

function DecomposeQuery(req: DecompositionRequest) -> DecompositionResult {
  client CustomGPT5Mini
  prompt #"
    Decompose this research query into parallel sub-queries.
    
    Main Query: {{ req.query }}
    Depth Level: {{ req.depth }} (1=quick/2 queries, 2=standard/4-6, 3=deep/8-10, 4=extensive/12-16)
    
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
    5. Match depth level (generate appropriate number of queries)
    
    For each query specify:
    - Specific question to answer
    - What aspect it covers
    - Priority (1=must have, 2=important, 3=nice to have)
    - Boundary (what to exclude to prevent overlap)
    
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
        clarification_needed null
      }
    }
  }
}
