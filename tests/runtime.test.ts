/**
 * Runtime Tests
 */

import { describe, test, expect } from 'bun:test';
import { QaraRuntime, getRuntime } from '../src/runtime/qara';

describe('QaraRuntime', () => {
  test('singleton pattern works', () => {
    const runtime1 = getRuntime();
    const runtime2 = getRuntime();
    expect(runtime1).toBe(runtime2);
  });

  test('execute returns result with metadata', async () => {
    const runtime = new QaraRuntime();
    const result = await runtime.execute('research AI safety');

    expect(result.success).toBe(true);
    expect(result.metadata.skill).toBe('research-standard');
    expect(result.metadata.confidence).toBeGreaterThan(0);
    expect(result.metadata.duration).toBeGreaterThan(0);
  });

  test('execute extracts query correctly', async () => {
    const runtime = new QaraRuntime();
    const result = await runtime.execute('research quantum computing');

    expect(result.data).toHaveProperty('query');
    expect((result.data as any).query).toBe('quantum computing');
  });

  test('execute throws for unknown input', async () => {
    const runtime = new QaraRuntime();

    await expect(runtime.execute('xyzzy foobar baz')).rejects.toThrow('No skill found');
  });

  test('listSkills returns all skills', () => {
    const runtime = new QaraRuntime();
    const skills = runtime.listSkills();

    expect(skills.length).toBeGreaterThan(0);
    expect(skills.some(s => s.id === 'research-standard')).toBe(true);
  });

  test('verbose option logs to console', async () => {
    const runtime = new QaraRuntime();
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    await runtime.execute('research test', { verbose: true });

    console.log = originalLog;
    expect(logs.some(l => l.includes('[router]'))).toBe(true);
  });
});
