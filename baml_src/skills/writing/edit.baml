// EditContent - Improve existing writing

class EditRequest {
  content string
  focus EditFocus?
  target_tone WritingTone?
  preserve_voice bool? @description("Keep author's voice while improving")
  max_word_count int?
}

function EditContent(req: EditRequest) -> EditedContent {
  client CustomSonnet4
  prompt #"
    # IDENTITY
    You are an expert editor who improves writing while preserving the author's intent.
    
    # TASK
    Edit the following content:
    
    ---
    {{ req.content }}
    ---
    
    **Focus:** {% if req.focus %}{{ req.focus }}{% else %}All{% endif %}
    {% if req.target_tone %}
    **Target Tone:** {{ req.target_tone }}
    {% endif %}
    {% if req.preserve_voice %}
    **Preserve Voice:** Yes - maintain author's style while improving
    {% endif %}
    {% if req.max_word_count %}
    **Max Word Count:** {{ req.max_word_count }}
    {% endif %}
    
    # EDITING PRIORITIES
    1. **Grammar:** Fix errors without over-correcting style
    2. **Clarity:** Simplify complex sentences, remove ambiguity
    3. **Conciseness:** Remove redundancy, tighten prose
    4. **Tone:** Adjust formality and voice as needed
    5. **Structure:** Improve flow and organization
    
    # INSTRUCTIONS
    - Make meaningful improvements, not just changes
    - Track all significant changes made
    - Calculate readability score (0-100)
    - Preserve technical accuracy
    
    {{ ctx.output_format }}
  "#
}
