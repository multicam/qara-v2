/**
 * CLI Tests
 * 
 * Note: Research skills now use real BAML functions (slow).
 * These tests focus on CLI functionality, not research execution.
 */

import { describe, test, expect } from 'bun:test';
import { $ } from 'bun';

describe('CLI', () => {
  test('shows help', async () => {
    const result = await $`bun run src/cli/index.ts --help`.cwd(import.meta.dir + '/..').text();
    expect(result).toContain('Qara v');
    expect(result).toContain('Usage:');
  });

  test('shows version', async () => {
    const result = await $`bun run src/cli/index.ts --version`.cwd(import.meta.dir + '/..').text();
    expect(result).toContain('Qara v');
  });

  test('lists skills', async () => {
    const result = await $`bun run src/cli/index.ts list`.cwd(import.meta.dir + '/..').text();
    expect(result).toContain('research-standard');
    expect(result).toContain('Available Skills');
  });

  test('routes write blog command (uses stub)', async () => {
    const result = await $`bun run src/cli/index.ts "write blog about testing"`.cwd(import.meta.dir + '/..').text();
    expect(result).toContain('stub');
    expect(result).toContain('Blog');
  });

  test('errors on empty input', async () => {
    const proc = Bun.spawn(['bun', 'run', 'src/cli/index.ts'], {
      cwd: import.meta.dir + '/..',
      stderr: 'pipe',
    });
    const stderr = await new Response(proc.stderr).text();
    expect(stderr).toContain('No input provided');
  });
});
