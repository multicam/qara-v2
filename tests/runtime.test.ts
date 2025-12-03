/**
 * Runtime Tests
 * 
 * Note: Research skills now use real BAML functions.
 * Tests for non-research skills use the stub.
 */

import { describe, test, expect } from 'bun:test';
import { QaraRuntime, getRuntime } from '../src/runtime/qara';

describe('QaraRuntime', () => {
  // Async tests first (these work)
  test('execute throws for unknown input', async () => {
    const runtime = new QaraRuntime();
    await expect(runtime.execute('xyzzy foobar baz')).rejects.toThrow('No skill found');
  });

  test('non-research skill uses stub', async () => {
    const runtime = new QaraRuntime();
    const result = await runtime.execute('write blog about cats');

    expect(result.success).toBe(true);
    expect(result.metadata.skill).toBe('blog-write');
    expect(result.data).toHaveProperty('status', 'stub');
  });

  // Sync tests - make them async to avoid timeout issues
  test('singleton pattern works', async () => {
    const runtime1 = getRuntime();
    const runtime2 = getRuntime();
    expect(runtime1).toBe(runtime2);
  });

  test('routes to correct skill', async () => {
    const runtime = new QaraRuntime();
    const router = runtime.getRouter();
    
    const researchRoute = router.route('research AI safety');
    expect(researchRoute).not.toBeNull();
    expect(researchRoute!.skill.id).toBe('research-standard');
    
    const deepRoute = router.route('deep research quantum');
    expect(deepRoute).not.toBeNull();
    expect(deepRoute!.skill.id).toBe('research-deep');
  });

  test('listSkills returns all skills', async () => {
    const runtime = new QaraRuntime();
    const skills = runtime.listSkills();

    expect(skills.length).toBeGreaterThan(0);
    expect(skills.some(s => s.id === 'research-standard')).toBe(true);
    expect(skills.some(s => s.id === 'help')).toBe(true);
  });
});
