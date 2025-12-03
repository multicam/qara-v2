/**
 * Test Helpers
 *
 * Utilities for running tests with different LLM clients.
 */

import { ClientRegistry } from '@boundaryml/baml';

/**
 * Get a ClientRegistry configured for local testing with Ollama.
 * Use this to override the default client in BAML function calls.
 *
 * @example
 * const result = await b.WriteBlog(req, { clientRegistry: getTestRegistry() });
 */
export function getTestRegistry(): ClientRegistry {
  const registry = new ClientRegistry();
  registry.setPrimary('CustomGPT4Mini'); // Fast GPT for testing
  return registry;
}

/**
 * Get a ClientRegistry for a specific client by name.
 *
 * @param clientName - Name of the client from clients.baml
 * @example
 * const result = await b.WriteBlog(req, { clientRegistry: getClientRegistry('CustomHaiku') });
 */
export function getClientRegistry(clientName: string): ClientRegistry {
  const registry = new ClientRegistry();
  registry.setPrimary(clientName);
  return registry;
}

/**
 * Available test clients (must match clients.baml)
 */
export const TestClients = {
  OLLAMA: 'CustomOllama',      // Local deepseek-r1
  HAIKU: 'CustomHaiku',        // Fast, cheap
  SONNET: 'CustomSonnet4',     // Balanced
  GPT4: 'CustomGPT4o',         // OpenAI
  FAST: 'CustomFast',          // Round-robin
} as const;
