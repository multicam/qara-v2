/**
 * Qara View - Observability Emitter
 * 
 * Central event emitter for the observability system.
 * Supports hierarchical event scoping with automatic parent tracking.
 */

import type { QaraEvent, LaneType, EventType, EventData } from './types';

type EventListener = (event: QaraEvent) => void;

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

class ObservabilityEmitter {
  private listeners: Set<EventListener> = new Set();
  private sessionId: string | null = null;
  private eventStack: string[] = [];
  private enabled: boolean = true;

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  startSession(input: string): string {
    this.sessionId = generateId();
    this.eventStack = [];
    this.emit({
      type: 'session.start',
      lane: 'system',
      data: { sessionId: this.sessionId, input, timestamp: Date.now() }
    } as Omit<QaraEvent, 'id' | 'timestamp' | 'parentId'>);
    return this.sessionId;
  }

  endSession(success: boolean, durationMs: number): void {
    if (!this.sessionId) return;
    this.emit({
      type: 'session.end',
      lane: 'system',
      data: { sessionId: this.sessionId, durationMs, success }
    } as Omit<QaraEvent, 'id' | 'timestamp' | 'parentId'>);
    this.sessionId = null;
    this.eventStack = [];
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  emit<T extends EventType>(
    event: { type: T; lane: LaneType; data: EventData<T> }
  ): string {
    if (!this.enabled) return '';
    
    const id = generateId();
    const fullEvent: QaraEvent = {
      ...event,
      id,
      timestamp: Date.now(),
      parentId: this.eventStack[this.eventStack.length - 1]
    } as QaraEvent;

    this.listeners.forEach(listener => {
      try {
        listener(fullEvent);
      } catch (err) {
        console.error('[observability] Listener error:', err);
      }
    });
    return id;
  }

  scope<T, E extends EventType>(
    event: { type: E; lane: LaneType; data: EventData<E> },
    fn: () => T
  ): T {
    const id = this.emit(event);
    this.eventStack.push(id);
    try {
      return fn();
    } finally {
      this.eventStack.pop();
    }
  }

  async scopeAsync<T, E extends EventType>(
    event: { type: E; lane: LaneType; data: EventData<E> },
    fn: () => Promise<T>
  ): Promise<T> {
    const id = this.emit(event);
    this.eventStack.push(id);
    try {
      return await fn();
    } finally {
      this.eventStack.pop();
    }
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clearListeners(): void {
    this.listeners.clear();
  }

  getListenerCount(): number {
    return this.listeners.size;
  }
}

export const emitter = new ObservabilityEmitter();

export function consoleLogger(event: QaraEvent): void {
  const prefix = event.parentId ? '  └─' : '●';
  console.log(
    `${prefix} [${event.lane}] ${event.type}`,
    JSON.stringify(event.data)
  );
}

export function jsonLogger(event: QaraEvent): void {
  console.log(JSON.stringify(event));
}
