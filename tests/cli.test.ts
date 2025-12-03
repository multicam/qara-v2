/**
 * CLI Tests
 */

import { describe, test, expect } from 'bun:test';
import { $ } from 'bun';

describe('CLI', () => {
  const cli = 'bun run src/cli/index.ts';

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

  test('routes research query', async () => {
    const result = await $`bun run src/cli/index.ts "research AI safety"`.cwd(import.meta.dir + '/..').text();
    expect(result).toContain('stub');
    expect(result).toContain('ai safety'); // lowercase due to query extraction
  });

  test('routes with verbose flag', async () => {
    const result = await $`bun run src/cli/index.ts "research test" --verbose`.cwd(import.meta.dir + '/..').text();
    expect(result).toContain('Matched:');
    expect(result).toContain('research-standard');
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
