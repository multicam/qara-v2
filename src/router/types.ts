/**
 * Core types for Qara v2 Router
 * 
 * The router provides O(k) deterministic routing where k = input tokens,
 * achieving <1ms latency compared to 1-3s with AI-based routing.
 */

export interface SkillFunction {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  bamlFunction: string;
  params?: Record<string, unknown>;
  requiresContext?: string[];
}

export interface RouteMatch {
  skill: SkillFunction;
  confidence: number;
  tokens: string[];
  matchType: 'exact' | 'prefix' | 'fuzzy';
}

export interface RouteNode {
  skills: SkillFunction[];
  children: Map<string, RouteNode>;
  isTerminal: boolean;
}
