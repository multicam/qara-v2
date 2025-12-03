# Qara v2: Writing & Content Skill Integration

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Future Integration (Phase 5)  
**Priority:** Medium

---

## ⚠️ Critical Review Notes

### Claude/ChatGPT Already Do This

**You can write content directly with Claude today:**
```bash
echo "Write a blog post about X" | claude
```

### What Qara Adds

| Feature | Claude Alone | Writing + Qara |
|---------|--------------|----------------|
| Content generation | ✅ | ✅ |
| Typed outputs | ❌ | ✅ (structured metadata) |
| Multi-LLM | ❌ | ✅ (best model per task) |
| Templates | ❌ | ✅ (consistent structure) |
| Integration with research | ❌ | ✅ (research → write) |
| Tone/style presets | ❌ | ✅ |

### When to Build This

**Build when:** You need consistent, structured content with metadata for downstream processing (CMS, publishing pipelines).

**Don't build when:** You just want to write something once (use Claude directly).

---

## Overview

This document defines the Writing & Content skill for Qara v2. It provides structured content generation beyond simple prompting, with typed outputs, tone presets, and integration with other skills (especially Research).

### Skills in This Category

| Skill | Purpose | Output |
|-------|---------|--------|
| `WriteBlog` | Full blog posts with metadata | `BlogPost` |
| `WriteEmail` | Professional emails | `Email` |
| `WriteDocumentation` | Technical documentation | `Documentation` |
| `EditContent` | Improve existing writing | `EditedContent` |
| `TranslateContent` | Multi-language translation | `TranslatedContent` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Writing Skill                                               │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Content Types   │  │ Style Presets   │                  │
│  │                 │  │                 │                  │
│  │ - Blog          │  │ - Professional  │                  │
│  │ - Email         │  │ - Casual        │                  │
│  │ - Documentation │  │ - Technical     │                  │
│  │ - General       │  │ - Persuasive    │                  │
│  └─────────────────┘  └─────────────────┘                  │
│           │                    │                            │
│           └────────┬───────────┘                            │
│                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  WritingOrchestrator                                    ││
│  │  - Content type selection                               ││
│  │  - Style application                                    ││
│  │  - Research integration                                 ││
│  │  - Multi-pass editing                                   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## BAML Types

### Core Types (`baml_src/skills/writing/types.baml`)

```baml
// Tone/style options
enum WritingTone {
  Professional
  Casual
  Technical
  Persuasive
  Academic
  Friendly
}

enum ContentLength {
  Short       // < 500 words
  Medium      // 500-1500 words
  Long        // 1500-3000 words
  Extended    // 3000+ words
}

// Blog post output
class BlogPost {
  title string
  subtitle string?
  meta_description string @description("SEO meta description, 150-160 chars")
  tags string[]
  estimated_read_time int @description("Minutes to read")
  sections BlogSection[]
  call_to_action string?
}

class BlogSection {
  heading string
  content string
  key_points string[]?
}

// Email output
class Email {
  subject string
  greeting string
  body string
  closing string
  signature string?
  tone_used WritingTone
}

// Documentation output
class Documentation {
  title string
  overview string
  sections DocSection[]
  code_examples CodeExample[]?
  related_topics string[]?
  last_updated string
}

class DocSection {
  heading string
  content string
  subsections DocSection[]?
}

class CodeExample {
  language string
  description string
  code string
}

// Edited content output
class EditedContent {
  original_word_count int
  edited_word_count int
  content string
  changes_made Change[]
  readability_score int @description("0-100, higher is more readable")
}

class Change {
  type string @description("grammar|clarity|style|structure|conciseness")
  description string
  before string?
  after string?
}

// Translation output
class TranslatedContent {
  source_language string
  target_language string
  original_content string
  translated_content string
  translation_notes string[]?
  cultural_adaptations string[]?
}
```

---

## BAML Functions

### WriteBlog (`baml_src/skills/writing/blog.baml`)

```baml
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
```

### WriteEmail (`baml_src/skills/writing/email.baml`)

```baml
enum EmailType {
  Introduction
  FollowUp
  Request
  ThankYou
  Apology
  Announcement
  Proposal
  ColdOutreach
}

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
  client CustomSonnet4
  prompt #"
    # IDENTITY
    You are an expert professional communicator who writes clear, effective emails.
    
    # TASK
    Write an email for the following purpose:
    
    **Purpose:** {{ req.purpose }}
    **Recipient:** {{ req.recipient }}
    **Type:** {{ req.email_type ?? "General" }}
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
```

### WriteDocumentation (`baml_src/skills/writing/documentation.baml`)

```baml
enum DocType {
  API
  Tutorial
  HowTo
  Reference
  Conceptual
  Troubleshooting
  Changelog
}

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
    **Type:** {{ req.doc_type ?? "HowTo" }}
    **Audience:** {{ req.target_audience ?? "intermediate" }}
    
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
```

### EditContent (`baml_src/skills/writing/edit.baml`)

```baml
enum EditFocus {
  Grammar
  Clarity
  Conciseness
  Tone
  Structure
  All
}

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
    
    **Focus:** {{ req.focus ?? "All" }}
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
```

### TranslateContent (`baml_src/skills/writing/translate.baml`)

```baml
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
```

---

## TypeScript Orchestrator

### Orchestrator (`src/skills/writing/orchestrator.ts`)

```typescript
import { b } from '../../baml_client';
import type {
  BlogRequest,
  EmailRequest,
  DocumentationRequest,
  EditRequest,
  TranslateRequest,
  BlogPost,
  Email,
  Documentation,
  EditedContent,
  TranslatedContent,
  WritingTone,
  ContentLength,
} from '../../baml_client/types';

export interface WritingOptions {
  verbose?: boolean;
}

export class WritingOrchestrator {
  
  /**
   * Write a blog post
   */
  async writeBlog(
    topic: string,
    options?: {
      targetAudience?: string;
      tone?: WritingTone;
      length?: ContentLength;
      keyPoints?: string[];
      seoKeywords?: string[];
    }
  ): Promise<BlogPost> {
    const req: BlogRequest = {
      topic,
      target_audience: options?.targetAudience,
      tone: options?.tone,
      length: options?.length,
      key_points: options?.keyPoints,
      seo_keywords: options?.seoKeywords,
    };
    
    return b.WriteBlog(req);
  }

  /**
   * Write a professional email
   */
  async writeEmail(
    purpose: string,
    recipient: string,
    options?: {
      context?: string;
      emailType?: EmailType;
      tone?: WritingTone;
      keyPoints?: string[];
      senderName?: string;
      senderTitle?: string;
    }
  ): Promise<Email> {
    const req: EmailRequest = {
      purpose,
      recipient,
      context: options?.context,
      email_type: options?.emailType,
      tone: options?.tone,
      key_points: options?.keyPoints,
      sender_name: options?.senderName,
      sender_title: options?.senderTitle,
    };
    
    return b.WriteEmail(req);
  }

  /**
   * Write technical documentation
   */
  async writeDocumentation(
    topic: string,
    options?: {
      docType?: DocType;
      targetAudience?: string;
      includeCodeExamples?: boolean;
      programmingLanguage?: string;
      existingContent?: string;
    }
  ): Promise<Documentation> {
    const req: DocumentationRequest = {
      topic,
      doc_type: options?.docType,
      target_audience: options?.targetAudience,
      include_code_examples: options?.includeCodeExamples,
      programming_language: options?.programmingLanguage,
      existing_content: options?.existingContent,
    };
    
    return b.WriteDocumentation(req);
  }

  /**
   * Edit and improve existing content
   */
  async editContent(
    content: string,
    options?: {
      focus?: EditFocus;
      targetTone?: WritingTone;
      preserveVoice?: boolean;
      maxWordCount?: number;
    }
  ): Promise<EditedContent> {
    const req: EditRequest = {
      content,
      focus: options?.focus,
      target_tone: options?.targetTone,
      preserve_voice: options?.preserveVoice,
      max_word_count: options?.maxWordCount,
    };
    
    return b.EditContent(req);
  }

  /**
   * Translate content to another language
   */
  async translateContent(
    content: string,
    targetLanguage: string,
    options?: {
      sourceLanguage?: string;
      preserveFormatting?: boolean;
      localize?: boolean;
      domain?: string;
    }
  ): Promise<TranslatedContent> {
    const req: TranslateRequest = {
      content,
      target_language: targetLanguage,
      source_language: options?.sourceLanguage,
      preserve_formatting: options?.preserveFormatting,
      localize: options?.localize,
      domain: options?.domain,
    };
    
    return b.TranslateContent(req);
  }

  /**
   * Research-to-blog pipeline: Research a topic, then write a blog post
   */
  async researchAndWrite(
    topic: string,
    researchOrchestrator: any, // ResearchOrchestrator
    options?: {
      tone?: WritingTone;
      length?: ContentLength;
      targetAudience?: string;
    }
  ): Promise<{ research: any; blog: BlogPost }> {
    // Step 1: Research the topic
    const research = await researchOrchestrator.research(topic);
    
    // Step 2: Extract key points from research
    const keyPoints = research.findings?.map((f: any) => f.summary) || [];
    
    // Step 3: Write blog post using research
    const blog = await this.writeBlog(topic, {
      keyPoints,
      tone: options?.tone,
      length: options?.length,
      targetAudience: options?.targetAudience,
    });
    
    return { research, blog };
  }
}

export function createWritingOrchestrator(): WritingOrchestrator {
  return new WritingOrchestrator();
}
```

---

## Skill Registry

```typescript
// Add to src/skills/registry.ts

// Writing skills
{
  id: 'write-blog',
  name: 'Write Blog Post',
  description: 'Write a full blog post with SEO metadata',
  triggers: ['write blog', 'blog post', 'write article', 'create blog'],
  bamlFunction: 'WriteBlog'
},
{
  id: 'write-email',
  name: 'Write Email',
  description: 'Write professional emails',
  triggers: ['write email', 'draft email', 'compose email', 'email to'],
  bamlFunction: 'WriteEmail'
},
{
  id: 'write-docs',
  name: 'Write Documentation',
  description: 'Write technical documentation',
  triggers: ['write docs', 'write documentation', 'document', 'create docs'],
  bamlFunction: 'WriteDocumentation'
},
{
  id: 'edit-content',
  name: 'Edit Content',
  description: 'Improve existing writing',
  triggers: ['edit', 'improve writing', 'proofread', 'revise', 'polish'],
  bamlFunction: 'EditContent'
},
{
  id: 'translate',
  name: 'Translate Content',
  description: 'Translate content to another language',
  triggers: ['translate', 'translate to', 'in spanish', 'in french', 'in german'],
  bamlFunction: 'TranslateContent'
}
```

---

## Usage Examples

### CLI Usage

```bash
# Write a blog post
qara "write blog post about TypeScript best practices"
qara "write blog about AI in healthcare for developers" --tone=technical --length=long

# Write emails
qara "write email to client about project delay"
qara "write follow-up email to John about the proposal"
qara "write cold outreach email to potential investor"

# Write documentation
qara "write API documentation for the auth module"
qara "write tutorial for setting up the development environment"

# Edit content
cat draft.md | qara "edit for clarity and conciseness"
qara "proofread this" < article.txt
qara "make this more professional" < email.txt

# Translate
qara "translate to Spanish" < content.txt
qara "translate to Japanese with localization" < marketing.txt
```

### Programmatic Usage

```typescript
import { createWritingOrchestrator } from './skills/writing/orchestrator';

const writer = createWritingOrchestrator();

// Write a blog post
const blog = await writer.writeBlog('TypeScript Best Practices', {
  targetAudience: 'intermediate developers',
  tone: 'Technical',
  length: 'Medium',
  seoKeywords: ['typescript', 'best practices', 'coding standards'],
});

console.log(blog.title);
console.log(blog.meta_description);
console.log(`Read time: ${blog.estimated_read_time} minutes`);

// Write an email
const email = await writer.writeEmail(
  'Request meeting to discuss Q1 roadmap',
  'Engineering Team Lead',
  {
    emailType: 'Request',
    tone: 'Professional',
    keyPoints: ['Need 30 minutes', 'Before Friday', 'Will share agenda'],
  }
);

console.log(`Subject: ${email.subject}`);
console.log(email.body);

// Edit content
const edited = await writer.editContent(draftText, {
  focus: 'Conciseness',
  maxWordCount: 500,
});

console.log(`Reduced from ${edited.original_word_count} to ${edited.edited_word_count} words`);
console.log(`Changes: ${edited.changes_made.length}`);

// Translate
const translated = await writer.translateContent(
  'Welcome to our platform!',
  'Spanish',
  { localize: true }
);

console.log(translated.translated_content);
```

---

## File Structure

```
baml_src/
└── skills/
    └── writing/
        ├── types.baml           # Shared types (WritingTone, etc.)
        ├── blog.baml            # WriteBlog function
        ├── email.baml           # WriteEmail function
        ├── documentation.baml   # WriteDocumentation function
        ├── edit.baml            # EditContent function
        └── translate.baml       # TranslateContent function

src/
└── skills/
    └── writing/
        └── orchestrator.ts      # WritingOrchestrator
```

---

## Implementation Checklist

### Prerequisites
- [ ] Phase 1 & 2 complete (router, runtime, BAML setup)
- [ ] Research skill working (for research-to-write pipeline)

### BAML Implementation
- [ ] Create `baml_src/skills/writing/types.baml`
- [ ] Create `baml_src/skills/writing/blog.baml`
- [ ] Create `baml_src/skills/writing/email.baml`
- [ ] Create `baml_src/skills/writing/documentation.baml`
- [ ] Create `baml_src/skills/writing/edit.baml`
- [ ] Create `baml_src/skills/writing/translate.baml`
- [ ] Run `baml-cli generate`
- [ ] Test each function in BAML playground

### TypeScript Implementation
- [ ] Create `src/skills/writing/orchestrator.ts`
- [ ] Add writing skills to registry
- [ ] Test each skill individually
- [ ] Test research-to-write pipeline

### Integration
- [ ] Add CLI support for writing commands
- [ ] Document available options
- [ ] Add to Qara View events (optional)

---

## Considerations

### Pros
- ✅ Structured outputs enable CMS integration
- ✅ Consistent quality with templates
- ✅ Multi-LLM (use best model per task)
- ✅ Integrates with Research skill
- ✅ Typed metadata (SEO, read time, etc.)

### Cons
- ⚠️ May feel over-engineered for simple tasks
- ⚠️ Templates may constrain creativity
- ⚠️ Translation quality varies by language pair

### Mitigations
- Provide "freeform" option that bypasses structure
- Allow template customization
- Flag low-confidence translations

---

## Model Recommendations

| Skill | Recommended Model | Why |
|-------|-------------------|-----|
| WriteBlog | Claude Sonnet 4 | Best long-form quality |
| WriteEmail | Claude Haiku | Fast, good enough |
| WriteDocumentation | Claude Sonnet 4 | Technical accuracy |
| EditContent | Claude Sonnet 4 | Nuanced editing |
| TranslateContent | GPT-5 | Strong multilingual |

---

## Related Documents

- [IMPLEMENTATION_INDEX.md](./IMPLEMENTATION_INDEX.md) - Master implementation guide
- [RESEARCH_SKILL_OVERVIEW.md](./RESEARCH_SKILL_OVERVIEW.md) - Research skill (for pipelines)
- [FABRIC_SKILL_INTEGRATION.md](./FABRIC_SKILL_INTEGRATION.md) - Similar pattern structure

---

**Document Version:** 1.0  
**Created:** December 3, 2025  
**Status:** Future Integration (Phase 5)
