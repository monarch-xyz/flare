import { evaluateCondition, EvalContext } from './evaluator.js';
import { Signal, Condition } from '../types/index.js';
import { EnvioClient } from '../envio/client.js';
import { resolveBlockByTimestamp } from '../envio/blocks.js';

export interface SignalEvaluationResult {
  signalId: string;
  triggered: boolean;
  timestamp: number;
}

export class SignalEvaluator {
  private envio: EnvioClient;

  constructor(envio: EnvioClient) {
    this.envio = envio;
  }

  async evaluate(signal: Signal): Promise<SignalEvaluationResult> {
    const now = Date.now();
    const durationMs = this.parseDuration(signal.window.duration);
    const windowStart = now - durationMs;

    const windowStartBlock = await resolveBlockByTimestamp(signal.chains[0] || 1, windowStart);

    const context: EvalContext = {
      chainId: signal.chains[0] || 1,
      windowDuration: signal.window.duration,
      now,
      windowStart,
      fetchState: (ref, ts) => this.envio.fetchState(ref, ts === windowStart ? windowStartBlock : undefined),
      fetchEvents: (ref, start, end) => this.envio.fetchEvents(ref, start, end),
    };

    const triggered = await evaluateCondition(
      signal.condition.left,
      signal.condition.operator,
      signal.condition.right,
      context
    );

    return {
      signalId: signal.id,
      triggered,
      timestamp: now,
    };
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 3600000; // default 1h

    const value = parseInt(match[1]!, 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60000;
      case 'h': return value * 3600000;
      case 'd': return value * 86400000;
      default: return 3600000;
    }
  }
}
