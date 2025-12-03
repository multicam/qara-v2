// TranslateContent - Multi-language translation

class TranslateRequest {
  content string
  target_language string
  source_language string? @description("Auto-detect if not provided")
  preserve_formatting bool?
  localize bool? @description("Adapt cultural references")
  domain string? @description("technical|legal|medical|general")
}

function TranslateContent(req: TranslateRequest) -> TranslatedContent {
  client CustomSonnet4
  prompt #"
    # IDENTITY
    You are an expert translator who produces natural, accurate translations.
    
    # TASK
    Translate the following content:
    
    ---
    {{ req.content }}
    ---
    
    **Target Language:** {{ req.target_language }}
    {% if req.source_language %}
    **Source Language:** {{ req.source_language }}
    {% else %}
    **Source Language:** Auto-detect
    {% endif %}
    
    **Domain:** {{ req.domain ?? "general" }}
    {% if req.localize %}
    **Localization:** Yes - adapt cultural references for target audience
    {% endif %}
    {% if req.preserve_formatting %}
    **Preserve Formatting:** Yes - maintain markdown, code blocks, etc.
    {% endif %}
    
    # TRANSLATION PRINCIPLES
    1. Prioritize meaning over literal translation
    2. Use natural phrasing in target language
    3. Preserve tone and register
    4. Maintain technical accuracy for domain terms
    5. Note any untranslatable concepts
    
    # INSTRUCTIONS
    - Detect source language if not provided
    - Note any cultural adaptations made
    - Flag terms that may need review
    - Preserve any code or technical syntax
    
    {{ ctx.output_format }}
  "#
}
