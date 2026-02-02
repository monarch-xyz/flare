import { GraphQLClient } from 'graphql-request';
import { config } from '../config/index.js';
import { EventRef, StateRef, Filter } from '../types/index.js';
import pino from 'pino';

const pinoFactory = (pino as any).default || pino;
const logger = pinoFactory();

export class EnvioClient {
  private client: GraphQLClient;

  constructor(endpoint: string = config.envio.endpoint) {
    if (!endpoint) {
      throw new Error('Envio endpoint not configured');
    }
    this.client = new GraphQLClient(endpoint);
  }

  private translateFilters(filters: Filter[]): Record<string, any> {
    const where: Record<string, any> = {};
    for (const filter of filters) {
      const opMap: Record<string, string> = {
        eq: '_eq',
        neq: '_neq',
        gt: '_gt',
        gte: '_gte',
        lt: '_lt',
        lte: '_lte',
        in: '_in',
        contains: '_ilike',
      };
      const gqlOp = opMap[filter.op] || '_eq';
      where[filter.field] = { [gqlOp]: filter.value };
    }
    return where;
  }

  async fetchState(ref: StateRef, blockNumber?: number): Promise<number> {
    const where = this.translateFilters(ref.filters);
    const blockFilter = blockNumber ? `(block: { number: ${blockNumber} })` : '';
    
    const query = `
      query GetState($where: ${ref.entity_type}_bool_exp!) {
        ${ref.entity_type}${blockFilter}(where: $where, limit: 1) {
          ${ref.field}
        }
      }
    `;

    try {
      const data: any = await this.client.request(query, { where });
      const entity = data[ref.entity_type]?.[0];
      return entity ? Number(entity[ref.field]) : 0;
    } catch (error: any) {
      logger.error({ error: error.message, ref }, 'Envio state fetch failed');
      return 0;
    }
  }

  async fetchEvents(ref: EventRef, startTimeMs: number, endTimeMs: number): Promise<number> {
    const where = this.translateFilters(ref.filters);
    const entityName = ref.event_type.startsWith('Morpho_') ? ref.event_type : `Morpho_${ref.event_type}`;
    
    where['timestamp'] = { _gte: Math.floor(startTimeMs / 1000), _lte: Math.floor(endTimeMs / 1000) };

    const query = `
      query GetEvents($where: ${entityName}_bool_exp!) {
        ${entityName}_aggregate(where: $where) {
          aggregate {
            ${ref.aggregation} {
              ${ref.field}
            }
          }
        }
      }
    `;

    try {
      const data: any = await this.client.request(query, { where });
      const val = data[`${entityName}_aggregate`]?.aggregate?.[ref.aggregation]?.[ref.field];
      return val ? Number(val) : 0;
    } catch (error: any) {
      logger.error({ error: error.message, ref }, 'Envio event fetch failed');
      return 0;
    }
  }
}
