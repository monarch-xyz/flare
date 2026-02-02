import { z } from 'zod';

export const FilterOpSchema = z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains']);

export const FilterSchema = z.object({
  field: z.string(),
  op: FilterOpSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

export const EventRefSchema = z.object({
  type: z.literal('event'),
  event_type: z.string(),
  filters: z.array(FilterSchema),
  field: z.string(),
  aggregation: z.enum(['sum', 'count', 'avg', 'min', 'max']),
});

export const StateRefSchema = z.object({
  type: z.literal('state'),
  entity_type: z.string(),
  filters: z.array(FilterSchema),
  field: z.string(),
  snapshot: z.enum(['current', 'window_start']).optional(),
});

export const ConstantSchema = z.object({
  type: z.literal('constant'),
  value: z.number(),
});

export type ExpressionNodeSchemaType = z.ZodType<any>; // For recursion

export const MathOpSchema = z.enum(['add', 'sub', 'mul', 'div']);

export const BinaryExpressionSchema: ExpressionNodeSchemaType = z.lazy(() => z.object({
  type: z.literal('expression'),
  operator: MathOpSchema,
  left: ExpressionNodeSchema,
  right: ExpressionNodeSchema,
}));

export const ExpressionNodeSchema = z.union([
  EventRefSchema,
  StateRefSchema,
  ConstantSchema,
  BinaryExpressionSchema,
]);

export const ComparisonOpSchema = z.enum(['gt', 'gte', 'lt', 'lte', 'eq', 'neq']);

export const ConditionSchema = z.object({
  type: z.literal('condition'),
  left: ExpressionNodeSchema,
  operator: ComparisonOpSchema,
  right: ExpressionNodeSchema,
});

export const SignalDefinitionSchema = z.object({
  chains: z.array(z.number()),
  window: z.object({
    duration: z.string(),
  }),
  condition: ConditionSchema,
});

export const CreateSignalSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  definition: SignalDefinitionSchema,
  webhook_url: z.string().url(),
  cooldown_minutes: z.number().int().min(0).default(5),
});
