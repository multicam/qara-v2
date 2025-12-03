// WriteBlog - Full blog post generation

class BlogRequest {
  topic string
  target_audience string?
  tone WritingTone?
  length ContentLength?
  key_points string[]?
  include_examples bool?
  seo_keywords string[]?
}

function WriteBlog(req: BlogRequest) -> BlogPost {
  client CustomSonnet4
  prompt #"
    # IDENTITY
    You are an expert content writer who creates engaging, well-structured blog posts.
    
    # TASK
    Write a blog post on the following topic:
    
    **Topic:** {{ req.topic }}
    
    {% if req.target_audience %}
    **Target Audience:** {{ req.target_audience }}
    {% endif %}
    
    **Tone:** {{ req.tone ?? "Professional" }}
    **Length:** {{ req.length ?? "Medium" }} (aim for appropriate word count)
    
    {% if req.key_points %}
    **Must Include These Points:**
    {% for point in req.key_points %}
    - {{ point }}
    {% endfor %}
    {% endif %}
    
    {% if req.seo_keywords %}
    **SEO Keywords to Include:** {{ req.seo_keywords | join(", ") }}
    {% endif %}
    
    # INSTRUCTIONS
    1. Create a compelling title and subtitle
    2. Write an SEO-optimized meta description (150-160 characters)
    3. Structure content with clear sections and headings
    4. Include actionable takeaways in each section
    5. End with a clear call-to-action
    6. Suggest relevant tags
    
    # OUTPUT
    {{ ctx.output_format }}
  "#
}
