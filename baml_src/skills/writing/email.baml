// WriteEmail - Professional email generation

class EmailRequest {
  purpose string
  recipient string @description("Who is receiving this email")
  context string? @description("Background information")
  email_type EmailType?
  tone WritingTone?
  key_points string[]?
  sender_name string?
  sender_title string?
}

function WriteEmail(req: EmailRequest) -> Email {
  client CustomHaiku
  prompt #"
    # IDENTITY
    You are an expert professional communicator who writes clear, effective emails.
    
    # TASK
    Write an email for the following purpose:
    
    **Purpose:** {{ req.purpose }}
    **Recipient:** {{ req.recipient }}
    **Type:** {{ req.email_type ?? "Request" }}
    **Tone:** {{ req.tone ?? "Professional" }}
    
    {% if req.context %}
    **Context:** {{ req.context }}
    {% endif %}
    
    {% if req.key_points %}
    **Key Points to Include:**
    {% for point in req.key_points %}
    - {{ point }}
    {% endfor %}
    {% endif %}
    
    {% if req.sender_name %}
    **From:** {{ req.sender_name }}{% if req.sender_title %}, {{ req.sender_title }}{% endif %}
    {% endif %}
    
    # INSTRUCTIONS
    1. Write a clear, action-oriented subject line
    2. Use appropriate greeting for the relationship
    3. Get to the point quickly (first 2 sentences)
    4. Include all key points naturally
    5. End with clear next steps or call-to-action
    6. Use appropriate closing
    
    # EMAIL BEST PRACTICES
    - Keep paragraphs short (2-3 sentences max)
    - Use bullet points for multiple items
    - Be concise but complete
    - Match formality to relationship
    
    {{ ctx.output_format }}
  "#
}
