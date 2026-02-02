export type FilterOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface Filter {
  field: string;
  op: FilterOp;
  value: string | number | boolean | string[];
}

export interface EventRef {
  type: 'event';
  event_type: string;
  filters: Filter[];
  field: string;
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max';
}

export interface StateRef {
  type: 'state';
  entity_type: string;
  filters: Filter[];
  field: string;
  snapshot?: 'current' | 'window_start';
}

export type MathOp = 'add' | 'sub' | 'mul' | 'div';

export interface BinaryExpression {
  type: 'expression';
  operator: MathOp;
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface Constant {
  type: 'constant';
  value: number;
}

export type ExpressionNode = EventRef | StateRef | BinaryExpression | Constant;

export type ComparisonOp = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';

export interface Condition {
  type: 'condition';
  left: ExpressionNode;
  operator: ComparisonOp;
  right: ExpressionNode;
}

export interface SignalScope {
  chains: number[];
}

export interface Signal {
  id: string;
  name: string;
  description?: string;
  chains: number[];
  window: {
    duration: string;
  };
  condition: Condition;
  webhook_url: string;
  cooldown_minutes: number;
  is_active: boolean;
  last_triggered_at?: string | Date;
  last_evaluated_at?: string | Date;
}

export interface WebhookPayload {
  signal_id: string;
  signal_name: string;
  triggered_at: string;
  scope: number[];
  conditions_met: any[];
  context: any;
}
