// Writing Skill Types
// Shared types for all writing functions

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

enum DocType {
  API
  Tutorial
  HowTo
  Reference
  Conceptual
  Troubleshooting
  Changelog
}

enum EditFocus {
  Grammar
  Clarity
  Conciseness
  Tone
  Structure
  All
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
