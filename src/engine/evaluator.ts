import { ExpressionNode, StateRef, EventRef } from '../types/index.js';

export interface EvalContext {
  chainId: number;
  windowDuration: string;
  now: number;
  windowStart: number;
  // Methods to be implemented for data fetching
  fetchState: (ref: StateRef, timestamp?: number) => Promise<number>;
  fetchEvents: (ref: EventRef, start: number, end: number) => Promise<number>;
}

export async function evaluateNode(node: ExpressionNode, context: EvalContext): Promise<number> {
  switch (node.type) {
    case 'constant':
      return node.value;
    case 'state':
      const ts = node.snapshot === 'window_start' ? context.windowStart : undefined;
      return context.fetchState(node, ts);
    case 'event':
      return context.fetchEvents(node, context.windowStart, context.now);
    case 'expression':
      const left = await evaluateNode(node.left, context);
      const right = await evaluateNode(node.right, context);
      switch (node.operator) {
        case 'add': return left + right;
        case 'sub': return left - right;
        case 'mul': return left * right;
        case 'div': return right === 0 ? 0 : left / right;
      }
  }
}
