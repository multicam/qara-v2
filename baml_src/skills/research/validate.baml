// Research Skill - Scope Validation
// Quick validation to prevent wasted effort from ambiguous queries

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
  client CustomHaiku
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
    
    Be concise. This is a quick validation step.
    
    {{ ctx.output_format }}
  "#
}

test ValidateSimple {
  functions [ValidateResearchScope]
  args {
    req {
      query "Research AI safety developments"
      context null
    }
  }
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
