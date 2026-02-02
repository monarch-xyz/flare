import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvioClient } from '../../src/envio/client.js';

// Mock the GraphQL client
const mockRequest = vi.fn();
vi.mock('graphql-request', () => {
  return {
    GraphQLClient: vi.fn().mockImplementation(() => ({
      request: mockRequest,
    })),
    gql: (s: string) => s,
  };
});

describe('EnvioClient', () => {
  let client: EnvioClient;

  beforeEach(() => {
    mockRequest.mockReset();
    client = new EnvioClient('https://mock-envio.endpoint');
  });

  it('translates simple equality filters correctly', async () => {
    mockRequest.mockResolvedValue({
      Position: [{ supply_assets: '1000' }]
    });

    const result = await client.fetchState({
      type: 'state',
      entity_type: 'Position',
      filters: [{ field: 'user', op: 'eq', value: '0x123' }],
      field: 'supply_assets'
    });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('Position'),
      { where: { user: { _eq: '0x123' } } }
    );
    expect(result).toBe(1000);
  });

  it('handles time-travel queries with block height', async () => {
    mockRequest.mockResolvedValue({
      Market: [{ total_supply_assets: '5000' }]
    });

    await client.fetchState({
      type: 'state',
      entity_type: 'Market',
      filters: [{ field: 'id', op: 'eq', value: '0xmarket' }],
      field: 'total_supply_assets'
    }, 12345678);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('(block: { number: 12345678 })'),
      expect.anything()
    );
  });

  it('aggregates events correctly', async () => {
    mockRequest.mockResolvedValue({
      Morpho_Supply_aggregate: {
        aggregate: {
          sum: { assets: '2500' }
        }
      }
    });

    const result = await client.fetchEvents({
      type: 'event',
      event_type: 'Supply',
      filters: [{ field: 'user', op: 'eq', value: '0x123' }],
      field: 'assets',
      aggregation: 'sum'
    }, 1700000000000, 1700003600000);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('Morpho_Supply_aggregate'),
      expect.objectContaining({
        where: expect.objectContaining({
          timestamp: { _gte: 1700000000, _lte: 1700003600 }
        })
      })
    );
    expect(result).toBe(2500);
  });
});
