/**
 * Qara v2 Trie-based Router
 * 
 * O(k) deterministic routing where k = input tokens.
 * Target: <1ms routing latency.
 */

import type { SkillFunction, RouteMatch, RouteNode } from './types';
import { emitter } from '../observability';

export class QaraRouter {
  private trie: RouteNode;
  private skillMap: Map<string, SkillFunction>;
  private fuzzyThreshold: number;

  constructor(skills: SkillFunction[], options: { fuzzyThreshold?: number } = {}) {
    this.skillMap = new Map(skills.map(s => [s.id, s]));
    this.trie = this.buildTrie(skills);
    this.fuzzyThreshold = options.fuzzyThreshold ?? 0.3;
  }

  /**
   * Route input to a skill function.
   * Returns skill function reference + confidence, or null if no match.
   */
  route(input: string): RouteMatch | null {
    const startTime = performance.now();
    const tokens = this.tokenize(input);
    let node = this.trie;
    let bestMatch: SkillFunction | null = null;
    let matchDepth = 0;
    let matchType: 'exact' | 'prefix' | 'fuzzy' = 'fuzzy';

    // Walk trie for exact/prefix matches
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;
      if (!node.children.has(token)) break;

      node = node.children.get(token)!;

      if (node.isTerminal && node.skills.length > 0) {
        bestMatch = node.skills[0]!;
        matchDepth = i + 1;
        matchType = matchDepth === tokens.length ? 'exact' : 'prefix';
      }
    }

    if (bestMatch) {
      const confidence = matchDepth / Math.max(tokens.length, 1);
      const routingTimeMs = performance.now() - startTime;
      
      emitter.emit({
        type: 'skill.route',
        lane: 'router',
        data: {
          input,
          matchedSkill: bestMatch.id,
          confidence: Math.min(confidence, 1),
          matchType,
          routingTimeMs,
        },
      });
      
      return {
        skill: bestMatch,
        confidence: Math.min(confidence, 1),
        tokens,
        matchType,
      };
    }

    // Fallback to fuzzy matching
    const fuzzyResult = this.fuzzyMatch(tokens);
    const routingTimeMs = performance.now() - startTime;
    
    if (fuzzyResult) {
      emitter.emit({
        type: 'skill.route',
        lane: 'router',
        data: {
          input,
          matchedSkill: fuzzyResult.skill.id,
          confidence: fuzzyResult.confidence,
          matchType: 'fuzzy',
          routingTimeMs,
        },
      });
    }
    
    return fuzzyResult;
  }

  /**
   * Build trie from skill triggers.
   */
  private buildTrie(skills: SkillFunction[]): RouteNode {
    const root: RouteNode = {
      skills: [],
      children: new Map(),
      isTerminal: false,
    };

    for (const skill of skills) {
      for (const trigger of skill.triggers) {
        const tokens = this.tokenize(trigger);
        let node = root;

        for (const token of tokens) {
          if (!node.children.has(token)) {
            node.children.set(token, {
              skills: [],
              children: new Map(),
              isTerminal: false,
            });
          }
          node = node.children.get(token)!;
        }

        node.isTerminal = true;
        node.skills.push(skill);
      }
    }

    return root;
  }

  /**
   * Tokenize input for matching.
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  }

  /**
   * Fuzzy matching fallback using keyword overlap.
   */
  private fuzzyMatch(inputTokens: string[]): RouteMatch | null {
    const inputSet = new Set(inputTokens);
    let bestSkill: SkillFunction | null = null;
    let bestScore = 0;

    for (const skill of this.skillMap.values()) {
      for (const trigger of skill.triggers) {
        const triggerTokens = new Set(this.tokenize(trigger));
        const overlap = [...inputSet].filter(t => triggerTokens.has(t)).length;
        const score = overlap / Math.max(inputSet.size, triggerTokens.size);

        if (score > bestScore) {
          bestScore = score;
          bestSkill = skill;
        }
      }
    }

    if (bestSkill && bestScore >= this.fuzzyThreshold) {
      return {
        skill: bestSkill,
        confidence: bestScore,
        tokens: inputTokens,
        matchType: 'fuzzy',
      };
    }

    return null;
  }

  /**
   * Get all registered skills.
   */
  getSkills(): SkillFunction[] {
    return Array.from(this.skillMap.values());
  }

  /**
   * Get skill by ID.
   */
  getSkill(id: string): SkillFunction | undefined {
    return this.skillMap.get(id);
  }

  /**
   * Debug: Print trie structure.
   */
  debugTrie(node: RouteNode = this.trie, prefix = ''): void {
    for (const [token, child] of node.children) {
      const marker = child.isTerminal ? ' [*]' : '';
      const skills = child.skills.map(s => s.id).join(', ');
      console.log(`${prefix}${token}${marker}${skills ? ` -> ${skills}` : ''}`);
      this.debugTrie(child, prefix + '  ');
    }
  }
}
