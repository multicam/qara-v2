// WriteDocumentation - Technical documentation generation

class DocumentationRequest {
  topic string
  doc_type DocType?
  target_audience string? @description("beginner|intermediate|advanced")
  include_code_examples bool?
  programming_language string?
  existing_content string? @description("Content to expand or improve")
}

function WriteDocumentation(req: DocumentationRequest) -> Documentation {
  client CustomSonnet4
  prompt #"
    # IDENTITY
    You are a technical writer who creates clear, comprehensive documentation.
    
    # TASK
    Write documentation for:
    
    **Topic:** {{ req.topic }}
    **Type:** {% if req.doc_type %}{{ req.doc_type }}{% else %}HowTo{% endif %}
    **Audience:** {% if req.target_audience %}{{ req.target_audience }}{% else %}intermediate{% endif %}
    
    {% if req.existing_content %}
    **Existing Content to Expand:**
    {{ req.existing_content }}
    {% endif %}
    
    {% if req.include_code_examples and req.programming_language %}
    **Include Code Examples in:** {{ req.programming_language }}
    {% endif %}
    
    # DOCUMENTATION PRINCIPLES
    1. Start with a clear overview (what and why)
    2. Use progressive disclosure (simple → complex)
    3. Include practical examples
    4. Anticipate common questions
    5. Link to related topics
    
    # STRUCTURE GUIDELINES
    - **API docs:** Parameters, returns, examples, errors
    - **Tutorials:** Step-by-step with explanations
    - **How-to:** Goal-oriented, minimal explanation
    - **Reference:** Complete, searchable
    - **Conceptual:** Explain the "why"
    
    {{ ctx.output_format }}
  "#
}
