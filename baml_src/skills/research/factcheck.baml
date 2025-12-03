// Research Skill - Fact Checking
// Verify claims before synthesis

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
  client CustomSonnet4
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
       - PARTIALLY_TRUE: True but missing important context
       - MISLEADING: Technically true but misleading
       - FALSE: Contradicted by authoritative sources
       - UNVERIFIABLE: Cannot verify with available information
    3. Explain your reasoning
    4. Note any nuance or caveats
    5. Cite sources with authority scores
    
    Be rigorous. Say UNVERIFIABLE rather than guessing.
    
    Red flags to watch for:
    - Single anonymous sources
    - Conflation of separate events
    - Outdated information presented as current
    - Speculation presented as fact
    
    {{ ctx.output_format }}
  "#
}

test FactCheckCrypto {
  functions [FactCheckClaims]
  args {
    req {
      claims [
        "OpenAI released GPT-5 in 2025",
        "Claude 4 outperforms GPT-5 on reasoning benchmarks"
      ]
      context "AI model releases in 2025"
    }
  }
}
