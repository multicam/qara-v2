/**
 * Router Tests
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { QaraRouter } from '../src/router/router';
import { SKILLS } from '../src/skills/registry';

describe('QaraRouter', () => {
  let router: QaraRouter;

  beforeAll(() => {
    router = new QaraRouter(SKILLS);
  });

  describe('exact matching', () => {
    test('matches exact trigger', () => {
      const result = router.route('research');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-standard');
      expect(result!.matchType).toBe('exact');
    });

    test('matches multi-word trigger', () => {
      const result = router.route('deep research');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-deep');
    });

    test('matches quick research', () => {
      const result = router.route('quick research');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-quick');
    });
  });

  describe('prefix matching', () => {
    test('matches trigger as prefix', () => {
      const result = router.route('research AI safety developments');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-standard');
      expect(result!.matchType).toBe('prefix');
    });

    test('matches deep research with topic', () => {
      const result = router.route('deep research quantum computing');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-deep');
      expect(result!.matchType).toBe('prefix');
    });
  });

  describe('fuzzy matching', () => {
    test('matches with keyword overlap', () => {
      // "investigate" is a trigger for research-standard
      const result = router.route('investigate this topic deeply');
      expect(result).not.toBeNull();
      expect(result!.skill.id).toBe('research-standard');
      expect(result!.matchType).toBe('prefix');
    });

    test('returns null for no match', () => {
      const result = router.route('xyzzy foobar baz');
      expect(result).toBeNull();
    });
  });

  describe('skill retrieval', () => {
    test('getSkills returns all skills', () => {
      const skills = router.getSkills();
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.some(s => s.id === 'research-standard')).toBe(true);
    });

    test('getSkill returns specific skill', () => {
      const skill = router.getSkill('research-deep');
      expect(skill).not.toBeUndefined();
      expect(skill!.name).toBe('Deep Research');
    });

    test('getSkill returns undefined for unknown', () => {
      const skill = router.getSkill('unknown-skill');
      expect(skill).toBeUndefined();
    });
  });

  describe('performance', () => {
    test('routes in <1ms', () => {
      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        router.route('deep research AI safety');
      }

      const duration = performance.now() - start;
      const avgMs = duration / iterations;

      expect(avgMs).toBeLessThan(1);
      console.log(`Average routing time: ${avgMs.toFixed(4)}ms`);
    });
  });
});
