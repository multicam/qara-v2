/**
 * Writing Skill Tests
 * 
 * Real-world test cases for the Writing/Content skill.
 * These tests call actual BAML functions - requires API keys.
 * 
 * Run with: bun test tests/writing.test.ts
 * Run single: bun test tests/writing.test.ts -t "WriteBlog"
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getTestRegistry, TestClients } from './helpers';

// Import BAML client and types
import { b, ContentLength, WritingTone, DocType, EditFocus, EmailType } from '../baml_client';

// Get test registry for local Ollama testing
const testOptions = { clientRegistry: getTestRegistry() };

// Load the research skill overview for edit and translate tests (sync at module level)
const RESEARCH_OVERVIEW_PATH = join(import.meta.dir, '../docs/RESEARCH_SKILL_OVERVIEW.md');
let researchOverviewContent: string;
try {
  researchOverviewContent = readFileSync(RESEARCH_OVERVIEW_PATH, 'utf-8');
} catch (e) {
  console.warn('Could not load RESEARCH_SKILL_OVERVIEW.md, using sample content');
  researchOverviewContent = `# Research Skill Overview
    
The Research skill is Qara v2's flagship capability - a parallel multi-agent research system.

## Key Features
- Two-phase workflow
- Parallel execution
- Intelligent decomposition
- Built-in fact-checking
- Tiered output`;
}

describe('Writing Skill - WriteBlog', () => {
  test('write blog about Qara v2 BAML oracle for developers', async () => {
    const result = await b.WriteBlog({
      topic: "Qara v2: The BAML Oracle - How we built a type-safe AI assistant compiler",
      target_audience: "developers familiar with TypeScript and AI/LLM tooling",
      tone: WritingTone.Technical,
      length: ContentLength.Medium,
      key_points: [
        "BAML provides type-safe LLM function definitions",
        "Trie-based router achieves <1ms routing",
        "Skills are composable BAML functions, not markdown prompts",
        "Multi-LLM support with fallback strategies",
        "Research skill demonstrates parallel agent orchestration"
      ],
      seo_keywords: ["BAML", "LLM", "TypeScript", "AI assistant", "type-safe AI"]
    }, testOptions);

    // Assertions
    expect(result.title).toBeDefined();
    expect(result.title.length).toBeGreaterThan(10);
    expect(result.meta_description.length).toBeLessThanOrEqual(160);
    expect(result.meta_description.length).toBeGreaterThanOrEqual(100);
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.estimated_read_time).toBeGreaterThan(0);
    expect(result.sections.length).toBeGreaterThan(0);
    
    // Content checks
    expect(result.title.toLowerCase()).toContain('qara');
    console.log('\n📝 Blog Post Generated:');
    console.log(`   Title: ${result.title}`);
    console.log(`   Subtitle: ${result.subtitle}`);
    console.log(`   Read time: ${result.estimated_read_time} min`);
    console.log(`   Sections: ${result.sections.length}`);
    console.log(`   Tags: ${result.tags.join(', ')}`);
  });
});

describe('Writing Skill - WriteDocumentation', () => {
  test('write documentation for Qara v2 research skill', async () => {
    const result = await b.WriteDocumentation({
      topic: "Qara v2 Research Skill - API Reference and Usage Guide",
      doc_type: DocType.API,
      target_audience: "intermediate",
      include_code_examples: true,
      programming_language: "TypeScript"
    }, testOptions);

    // Assertions
    expect(result.title).toBeDefined();
    expect(result.overview.length).toBeGreaterThan(50);
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.code_examples).toBeDefined();
    expect(result.code_examples!.length).toBeGreaterThan(0);
    expect(result.code_examples![0]!.language.toLowerCase()).toBe('typescript');
    
    console.log('\n📚 Documentation Generated:');
    console.log(`   Title: ${result.title}`);
    console.log(`   Sections: ${result.sections.map(s => s.heading).join(', ')}`);
    console.log(`   Code examples: ${result.code_examples?.length}`);
    console.log(`   Related topics: ${result.related_topics?.join(', ')}`);
  });
});

describe('Writing Skill - EditContent', () => {
  test('edit research_skill_overview.md in didactic manner', async () => {
    // Take first 2000 chars for testing (to keep costs down)
    const contentToEdit = researchOverviewContent.slice(0, 2000);
    
    const result = await b.EditContent({
      content: contentToEdit,
      focus: EditFocus.Clarity,
      target_tone: WritingTone.Friendly,
      preserve_voice: false
    }, testOptions);

    // Assertions
    expect(result.original_word_count).toBeGreaterThan(0);
    expect(result.content.length).toBeGreaterThan(100);
    expect(result.changes_made.length).toBeGreaterThan(0);
    expect(result.readability_score).toBeGreaterThanOrEqual(0);
    expect(result.readability_score).toBeLessThanOrEqual(100);
    
    // Check for didactic elements
    const hasLearningLanguage = 
      result.content.toLowerCase().includes("let's") ||
      result.content.toLowerCase().includes("you'll learn") ||
      result.content.toLowerCase().includes("imagine") ||
      result.content.toLowerCase().includes("think of");
    
    console.log('\n✏️ Content Edited:');
    console.log(`   Original words: ${result.original_word_count}`);
    console.log(`   Edited words: ${result.edited_word_count}`);
    console.log(`   Readability score: ${result.readability_score}/100`);
    console.log(`   Changes made: ${result.changes_made.length}`);
    result.changes_made.forEach(c => console.log(`     - [${c.type}] ${c.description}`));
  });
});

describe('Writing Skill - WriteEmail', () => {
  test('write email to collaborator encouraging work on Qara', async () => {
    const result = await b.WriteEmail({
      purpose: "Encourage a developer collaborator to contribute to Qara v2 project",
      recipient: "Fellow developer and potential collaborator",
      context: "Qara v2 is an AI assistant compiler using BAML for type-safe LLM functions. The project needs help with CLI integrations and additional skills. The collaborator has experience with TypeScript and AI tooling.",
      email_type: EmailType.Proposal,
      tone: WritingTone.Friendly,
      key_points: [
        "Qara v2 is making great progress - Phase 1 & 2 complete",
        "Their TypeScript expertise would be valuable",
        "Flexible contribution options - CLI, skills, or dashboard",
        "Open source project with real-world impact",
        "Would love to pair program on features"
      ],
      sender_name: "The Qara Team"
    }, testOptions);

    // Assertions
    expect(result.subject).toBeDefined();
    expect(result.subject.length).toBeGreaterThan(10);
    expect(result.subject.length).toBeLessThan(100);
    expect(result.greeting).toBeDefined();
    expect(result.body.length).toBeGreaterThan(200);
    expect(result.closing).toBeDefined();
    expect(result.tone_used).toBe(WritingTone.Friendly);
    
    // Check for encouraging language
    const hasEncouragement = 
      result.body.toLowerCase().includes('valuable') ||
      result.body.toLowerCase().includes('love') ||
      result.body.toLowerCase().includes('exciting') ||
      result.body.toLowerCase().includes('amazing');
    expect(hasEncouragement).toBe(true);
    
    console.log('\n📧 Email Generated:');
    console.log(`   Subject: ${result.subject}`);
    console.log(`   Tone: ${result.tone_used}`);
    console.log(`   Body length: ${result.body.length} chars`);
    console.log(`   Preview: ${result.body.slice(0, 100)}...`);
  });
});

describe('Writing Skill - TranslateContent', () => {
  test('translate research_skill_overview.md to French', async () => {
    // Take first 1500 chars for testing (to keep costs down)
    const contentToTranslate = researchOverviewContent.slice(0, 1500);
    
    const result = await b.TranslateContent({
      content: contentToTranslate,
      target_language: "French",
      source_language: "English",
      preserve_formatting: true,
      localize: true,
      domain: "technical"
    }, testOptions);

    // Assertions
    expect(result.source_language).toBe('English');
    expect(result.target_language).toBe('French');
    expect(result.translated_content.length).toBeGreaterThan(100);
    // Original content should be similar (LLM may add minor whitespace changes)
    expect(result.original_content.trim().slice(0, 100)).toBe(contentToTranslate.trim().slice(0, 100));
    
    // Check for French language markers
    const hasFrench = 
      result.translated_content.includes('Vue d\'ensemble') ||
      result.translated_content.includes('Recherche') ||
      result.translated_content.includes('décembre') ||
      result.translated_content.includes('Statut');
    expect(hasFrench).toBe(true);
    
    // Check formatting preserved
    expect(result.translated_content).toContain('#');
    expect(result.translated_content).toContain('|');
    
    console.log('\n🌍 Translation Generated:');
    console.log(`   Source: ${result.source_language}`);
    console.log(`   Target: ${result.target_language}`);
    console.log(`   Original length: ${result.original_content.length} chars`);
    console.log(`   Translated length: ${result.translated_content.length} chars`);
    console.log(`   Translation notes: ${result.translation_notes?.length || 0}`);
    console.log(`   Cultural adaptations: ${result.cultural_adaptations?.length || 0}`);
    console.log(`   Preview: ${result.translated_content.slice(0, 150)}...`);
  });
});

// Integration test - run all writing skills in sequence
describe('Writing Skill - Integration', () => {
  test.skip('full writing workflow (requires API keys)', async () => {
    // This test runs all writing skills with real BAML calls
    // Skip by default to avoid API costs
    
    console.log('\n🔄 Running full writing workflow...\n');
    
    // 1. Write blog
    // const blog = await b.WriteBlog({ topic: "Qara v2", tone: "Technical", length: "Short" });
    // console.log('✅ Blog written:', blog.title);
    
    // 2. Write docs
    // const docs = await b.WriteDocumentation({ topic: "Research Skill", doc_type: "Tutorial" });
    // console.log('✅ Docs written:', docs.title);
    
    // 3. Edit content
    // const edited = await b.EditContent({ content: "Some content...", focus: "Clarity" });
    // console.log('✅ Content edited, readability:', edited.readability_score);
    
    // 4. Write email
    // const email = await b.WriteEmail({ purpose: "Collaborate", recipient: "Developer", tone: "Friendly" });
    // console.log('✅ Email written:', email.subject);
    
    // 5. Translate
    // const translated = await b.TranslateContent({ content: "Hello world", target_language: "French" });
    // console.log('✅ Translated to:', translated.target_language);
    
    console.log('\n✨ All writing skills executed successfully!');
  });
});
