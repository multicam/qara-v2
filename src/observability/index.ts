/**
 * Qara View - Observability Module
 * 
 * Re-exports all observability components for easy importing.
 */

export * from './types';
export { emitter, consoleLogger, jsonLogger } from './emitter';
export { 
  startObservabilityServer, 
  stopObservabilityServer,
  getClientCount,
  isServerRunning 
} from './server';
