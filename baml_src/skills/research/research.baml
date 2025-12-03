// Research Skill - Core Research Function
// Executes individual research queries with source attribution

class ResearchRequest {
  query string @description("The specific research query")
  focus string @description("What aspect to focus on")
  boundary string @description("What NOT to include")
  depth int @description("1-4 depth level")
  existing_knowledge string? @description("What we already know")
}

function ResearchTopic(req: ResearchRequest) -> ResearchResult {
  client CustomSonnet4
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
    
    Source Authority Scoring:
    - 0.9-1.0: Government/regulatory, peer-reviewed journals
    - 0.7-0.9: Major news outlets, industry publications
    - 0.5-0.7: Industry blogs, analyst reports
    - 0.3-0.5: Social media, forums
    - 0.0-0.3: Anonymous sources, speculation
    
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
      depth 2
      existing_knowledge null
    }
  }
}
