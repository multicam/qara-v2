/**
 * Skill Registry
 * 
 * Central registry of all available skills.
 * Each skill maps triggers to BAML functions.
 */

import type { SkillFunction } from '../router/types';

export const SKILLS: SkillFunction[] = [
  // Research Skills
  {
    id: 'research-quick',
    name: 'Quick Research',
    description: 'Fast research overview (15-30 seconds)',
    triggers: [
      'quick research',
      'briefly research',
      'quick look at',
      'fast research',
      'quick search',
    ],
    bamlFunction: 'ResearchTopic',
    params: { depth: 1 },
  },
  {
    id: 'research-standard',
    name: 'Standard Research',
    description: 'Comprehensive research (30-60 seconds)',
    triggers: [
      'research',
      'investigate',
      'look into',
      'find out about',
      'what is',
      'tell me about',
      'learn about',
    ],
    bamlFunction: 'ResearchTopic',
    params: { depth: 2 },
  },
  {
    id: 'research-deep',
    name: 'Deep Research',
    description: 'Thorough analysis (1-2 minutes)',
    triggers: [
      'deep research',
      'deep dive',
      'thorough research',
      'comprehensive analysis',
      'detailed research',
      'analyze deeply',
    ],
    bamlFunction: 'ResearchTopic',
    params: { depth: 3 },
  },
  {
    id: 'research-extensive',
    name: 'Extensive Research',
    description: 'Exhaustive investigation (2-5 minutes)',
    triggers: [
      'extensive research',
      'exhaustive research',
      'complete analysis',
      'full investigation',
      'research everything about',
    ],
    bamlFunction: 'ResearchTopic',
    params: { depth: 4 },
  },

  // Placeholder skills for testing router
  {
    id: 'blog-write',
    name: 'Write Blog Post',
    description: 'Create a new blog post from a topic',
    triggers: [
      'write blog',
      'create post',
      'draft article',
      'new blog post',
      'write article',
    ],
    bamlFunction: 'WriteBlog',
  },
  {
    id: 'code-generate',
    name: 'Generate Code',
    description: 'Write code based on specifications',
    triggers: [
      'write code',
      'generate code',
      'implement function',
      'create class',
      'code this',
    ],
    bamlFunction: 'GenerateCode',
  },

  // Fallback/Help skill
  {
    id: 'help',
    name: 'Help',
    description: 'Show available commands and usage',
    triggers: [
      'help',
      'what can you do',
      'show commands',
      'list skills',
    ],
    bamlFunction: 'ShowHelp',
  },
];

/**
 * Get skills by category prefix.
 */
export function getSkillsByCategory(category: string): SkillFunction[] {
  return SKILLS.filter(s => s.id.startsWith(category));
}

/**
 * Get all skill IDs.
 */
export function getSkillIds(): string[] {
  return SKILLS.map(s => s.id);
}
