/**
 * Qara View - WebSocket Server
 * 
 * Broadcasts observability events to connected dashboard clients.
 * Runs on port 3940 by default.
 */

import { emitter } from './emitter';
import type { QaraEvent } from './types';

interface WebSocketClient {
  send(data: string): void;
  readyState: number;
}

const WEBSOCKET_OPEN = 1;
const clients = new Set<WebSocketClient>();
let server: ReturnType<typeof Bun.serve> | null = null;
let unsubscribe: (() => void) | null = null;

export function startObservabilityServer(port = 3940): ReturnType<typeof Bun.serve> {
  if (server) {
    console.log(`[qara-view] Server already running on ws://localhost:${port}`);
    return server;
  }

  server = Bun.serve({
    port,
    fetch(req, server) {
      const url = new URL(req.url);
      
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          clients: clients.size,
          sessionId: emitter.getSessionId()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (server.upgrade(req, { data: {} })) {
        return;
      }
      
      return new Response('Qara View Server - Connect via WebSocket', { status: 200 });
    },
    websocket: {
      open(ws) {
        clients.add(ws as unknown as WebSocketClient);
        console.log(`[qara-view] Client connected (${clients.size} total)`);
        
        ws.send(JSON.stringify({ 
          type: 'connected', 
          sessionId: emitter.getSessionId(),
          timestamp: Date.now()
        }));
      },
      close(ws) {
        clients.delete(ws as unknown as WebSocketClient);
        console.log(`[qara-view] Client disconnected (${clients.size} total)`);
      },
      message(ws, message) {
        try {
          const cmd = JSON.parse(message as string);
          if (cmd.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
        } catch {
          // Ignore invalid messages
        }
      }
    }
  });

  unsubscribe = emitter.subscribe((event: QaraEvent) => {
    const message = JSON.stringify(event);
    clients.forEach(client => {
      if (client.readyState === WEBSOCKET_OPEN) {
        try {
          client.send(message);
        } catch (err) {
          console.error('[qara-view] Failed to send to client:', err);
        }
      }
    });
  });

  console.log(`[qara-view] Server running on ws://localhost:${port}`);
  return server;
}

export function stopObservabilityServer(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  
  if (server) {
    server.stop();
    server = null;
  }
  
  clients.clear();
  console.log('[qara-view] Server stopped');
}

export function getClientCount(): number {
  return clients.size;
}

export function isServerRunning(): boolean {
  return server !== null;
}
