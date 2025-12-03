/**
 * Qara View - Observability Event Types
 * 
 * Defines all event types for the observability system.
 * Events are categorized by swim lanes for visualization.
 */

export type EventType = 
  | 'session.start'
  | 'session.end'
  | 'skill.route'
  | 'skill.start'
  | 'skill.progress'
  | 'skill.complete'
  | 'skill.error'
  | 'research.validate'
  | 'research.decompose'
  | 'research.query.start'
  | 'research.query.complete'
  | 'research.factcheck'
  | 'research.synthesize'
  | 'llm.request'
  | 'llm.response'
  | 'llm.stream';

export type LaneType = 'router' | 'orchestrator' | 'research' | 'llm' | 'system';
export type EventStatus = 'pending' | 'running' | 'complete' | 'error';

export interface BaseEvent {
  id: string;
  timestamp: number;
  type: EventType;
  lane: LaneType;
  parentId?: string;
}

export interface SessionStartEvent extends BaseEvent {
  type: 'session.start';
  lane: 'system';
  data: {
    sessionId: string;
    input: string;
    timestamp: number;
  };
}

export interface SessionEndEvent extends BaseEvent {
  type: 'session.end';
  lane: 'system';
  data: {
    sessionId: string;
    durationMs: number;
    success: boolean;
  };
}

export interface SkillRouteEvent extends BaseEvent {
  type: 'skill.route';
  lane: 'router';
  data: {
    input: string;
    matchedSkill: string;
    confidence: number;
    matchType: 'exact' | 'prefix' | 'fuzzy';
    routingTimeMs: number;
  };
}

export interface SkillStartEvent extends BaseEvent {
  type: 'skill.start';
  lane: 'orchestrator';
  data: {
    skillId: string;
    skillName: string;
    input: string;
    params: Record<string, unknown>;
  };
}

export interface SkillProgressEvent extends BaseEvent {
  type: 'skill.progress';
  lane: 'orchestrator';
  data: {
    skillId: string;
    phase: string;
    progress: number;
    message: string;
  };
}

export interface SkillCompleteEvent extends BaseEvent {
  type: 'skill.complete';
  lane: 'orchestrator';
  data: {
    skillId: string;
    durationMs: number;
    success: boolean;
    result?: unknown;
  };
}

export interface SkillErrorEvent extends BaseEvent {
  type: 'skill.error';
  lane: 'orchestrator';
  data: {
    skillId: string;
    error: string;
    stack?: string;
  };
}

export interface ResearchValidateEvent extends BaseEvent {
  type: 'research.validate';
  lane: 'research';
  data: {
    query: string;
    isClear: boolean;
    topics: string[];
    clarificationNeeded?: string[];
  };
}

export interface ResearchDecomposeEvent extends BaseEvent {
  type: 'research.decompose';
  lane: 'research';
  data: {
    queryCount: number;
    queries: Array<{ id: string; focus: string; priority: number }>;
  };
}

export interface ResearchQueryStartEvent extends BaseEvent {
  type: 'research.query.start';
  lane: 'research';
  data: {
    queryId: string;
    focus: string;
    status: EventStatus;
  };
}

export interface ResearchQueryCompleteEvent extends BaseEvent {
  type: 'research.query.complete';
  lane: 'research';
  data: {
    queryId: string;
    focus: string;
    status: EventStatus;
    durationMs: number;
    findingsCount: number;
  };
}

export interface ResearchFactcheckEvent extends BaseEvent {
  type: 'research.factcheck';
  lane: 'research';
  data: {
    claimsChecked: number;
    verified: number;
    flagged: number;
  };
}

export interface ResearchSynthesizeEvent extends BaseEvent {
  type: 'research.synthesize';
  lane: 'research';
  data: {
    sourcesUsed: number;
    outputLength: number;
  };
}

export interface LLMRequestEvent extends BaseEvent {
  type: 'llm.request';
  lane: 'llm';
  data: {
    requestId: string;
    client: string;
    function: string;
    inputTokens?: number;
  };
}

export interface LLMResponseEvent extends BaseEvent {
  type: 'llm.response';
  lane: 'llm';
  data: {
    requestId: string;
    client: string;
    durationMs: number;
    outputTokens?: number;
    totalTokens?: number;
    success: boolean;
    error?: string;
  };
}

export interface LLMStreamEvent extends BaseEvent {
  type: 'llm.stream';
  lane: 'llm';
  data: {
    requestId: string;
    chunk: string;
    tokenCount?: number;
  };
}

export type QaraEvent = 
  | SessionStartEvent
  | SessionEndEvent
  | SkillRouteEvent
  | SkillStartEvent
  | SkillProgressEvent
  | SkillCompleteEvent
  | SkillErrorEvent
  | ResearchValidateEvent
  | ResearchDecomposeEvent
  | ResearchQueryStartEvent
  | ResearchQueryCompleteEvent
  | ResearchFactcheckEvent
  | ResearchSynthesizeEvent
  | LLMRequestEvent
  | LLMResponseEvent
  | LLMStreamEvent;

export type EventData<T extends EventType> = Extract<QaraEvent, { type: T }>['data'];
