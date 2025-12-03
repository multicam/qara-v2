/**
 * Qara v2 CLI
 *
 * Command-line interface for executing skills via natural language.
 */

import { parseArgs } from 'util';
import { getRuntime } from '../runtime/qara';
import type { ExecuteOptions } from '../runtime/qara';
import { startObservabilityServer, stopObservabilityServer, emitter, consoleLogger } from '../observability';

interface CLIOptions {
  help: boolean;
  version: boolean;
  verbose: boolean;
  stream: boolean;
  depth: number;
  format: string;
  list: boolean;
  observability: boolean;
}

const VERSION = '2.0.0';

const HELP_TEXT = `
Qara v${VERSION} - AI-powered skill execution

Usage:
  qara <command> [options]
  qara "natural language input" [options]

Commands:
  list              List all available skills
  help              Show this help message
  version           Show version

Options:
  -h, --help        Show help
  -v, --verbose     Verbose output
  -s, --stream      Stream output (real-time)
  -d, --depth       Research depth (1-4)
  -f, --format      Output format (executive|full|bullets|table)
  -o, --observability  Enable observability server (ws://localhost:3940)
  --version         Show version

Examples:
  qara "research AI safety"
  qara "deep research quantum computing" --format=full
  qara "quick research BAML | boundaryml.com" --verbose
  qara list
`;

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
      stream: { type: 'boolean', short: 's', default: false },
      depth: { type: 'string', short: 'd', default: '2' },
      format: { type: 'string', short: 'f', default: 'executive' },
      list: { type: 'boolean', default: false },
      observability: { type: 'boolean', short: 'o', default: false },
    },
    allowPositionals: true,
  });

  const options: CLIOptions = {
    help: values.help as boolean,
    version: values.version as boolean,
    verbose: values.verbose as boolean,
    stream: values.stream as boolean,
    depth: parseInt(values.depth as string, 10),
    format: values.format as string,
    list: values.list as boolean,
    observability: values.observability as boolean,
  };

  // Handle special commands
  if (options.help || positionals[0] === 'help') {
    console.log(HELP_TEXT);
    return;
  }

  if (options.version || positionals[0] === 'version') {
    console.log(`Qara v${VERSION}`);
    return;
  }

  if (options.list || positionals[0] === 'list') {
    listSkills();
    return;
  }

  // Start observability server if enabled
  if (options.observability) {
    startObservabilityServer();
    if (options.verbose) {
      emitter.subscribe(consoleLogger);
    }
    // Brief delay to allow dashboard to connect
    await Bun.sleep(100);
  }

  // Get input
  const input = positionals.join(' ').trim();
  if (!input) {
    console.error('Error: No input provided');
    console.log('Run "qara --help" for usage');
    process.exit(1);
  }

  // Execute
  const runtime = getRuntime();
  const execOptions: ExecuteOptions = {
    verbose: options.verbose,
    stream: options.stream,
    outputFormat: options.format as ExecuteOptions['outputFormat'],
  };

  try {
    if (options.stream) {
      for await (const chunk of runtime.stream(input, execOptions)) {
        process.stdout.write(formatChunk(chunk));
      }
      console.log();
    } else {
      const result = await runtime.execute(input, execOptions);

      if (options.verbose) {
        console.log('\n--- Metadata ---');
        console.log(`Skill: ${result.metadata.skill}`);
        console.log(`Confidence: ${(result.metadata.confidence * 100).toFixed(0)}%`);
        console.log(`Match Type: ${result.metadata.matchType}`);
        console.log(`Duration: ${result.metadata.duration.toFixed(0)}ms`);
        console.log('--- Result ---\n');
      }

      console.log(formatOutput(result.data, options.format ?? 'executive'));
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    if (options.observability) {
      stopObservabilityServer();
    }
    process.exit(1);
  }

  // Clean shutdown
  if (options.observability) {
    stopObservabilityServer();
  }
  process.exit(0);
}

function listSkills(): void {
  const runtime = getRuntime();
  const skills = runtime.listSkills();

  console.log('\nAvailable Skills:\n');

  // Group by category
  const categories = new Map<string, typeof skills>();
  for (const skill of skills) {
    const category = skill.id.split('-')[0] ?? skill.id;
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(skill);
  }

  for (const [category, categorySkills] of categories) {
    console.log(`${category.toUpperCase()}`);
    for (const skill of categorySkills) {
      console.log(`  ${skill.id.padEnd(20)} ${skill.description}`);
      console.log(`    Triggers: ${skill.triggers.slice(0, 3).join(', ')}...`);
    }
    console.log();
  }
}

function formatChunk(chunk: unknown): string {
  if (typeof chunk === 'string') return chunk;
  if (typeof chunk === 'object' && chunk !== null) {
    return JSON.stringify(chunk) + '\n';
  }
  return String(chunk);
}

function formatOutput(data: unknown, format: string): string {
  if (typeof data === 'string') return data;

  if (format === 'bullets' && Array.isArray(data)) {
    return data.map(item => `• ${item}`).join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data, null, 2);
  }

  return String(data);
}

main().catch(console.error);
