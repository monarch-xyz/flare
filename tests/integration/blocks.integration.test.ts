/**
 * Integration test for block resolver - actually calls RPCs
 * 
 * Run with: pnpm test:integration
 * 
 * This test verifies that resolveBlockByTimestamp returns correct blocks
 * for a known date across multiple chains.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  resolveBlockByTimestamp, 
  clearBlockCache,
  CHAIN_CONFIGS,
  addChainConfig
} from '../../src/envio/blocks.js';

// Test date: 2025-12-03 00:00:00 UTC
const TEST_TIMESTAMP_MS = new Date('2025-12-03T00:00:00Z').getTime();

// Expected block numbers for 2025-12-03 00:00:00 UTC
// Fill these in after running the test once!
const EXPECTED_BLOCKS: Record<number, number | null> = {
  1: null,      // Ethereum - fill in after test
  8453: null,   // Base - fill in after test
  137: null,    // Polygon - fill in after test
  42161: null,  // Arbitrum - fill in after test
  10: null,     // Optimism - fill in after test
  43114: null,  // Avalanche - fill in after test
  56: null,     // BSC - fill in after test
};

// Add more chains for testing
beforeAll(() => {
  // Optimism
  addChainConfig(10, {
    name: 'Optimism',
    rpcEndpoints: [
      'https://mainnet.optimism.io',
      'https://rpc.ankr.com/optimism',
      'https://optimism.publicnode.com',
    ],
    genesisTimestamp: 1636665399, // Nov 11, 2021
    avgBlockTimeMs: 2000,
  });

  // Avalanche C-Chain
  addChainConfig(43114, {
    name: 'Avalanche',
    rpcEndpoints: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche',
      'https://avalanche.publicnode.com',
    ],
    genesisTimestamp: 1600811315, // Sept 22, 2020
    avgBlockTimeMs: 2000,
  });

  // BSC
  addChainConfig(56, {
    name: 'BSC',
    rpcEndpoints: [
      'https://bsc-dataseed.binance.org',
      'https://rpc.ankr.com/bsc',
      'https://bsc.publicnode.com',
    ],
    genesisTimestamp: 1598671449, // Aug 29, 2020
    avgBlockTimeMs: 3000,
  });

  // Clear cache before tests
  clearBlockCache();
});

describe('Block Resolver Integration', () => {
  // Increase timeout for real RPC calls
  const TIMEOUT = 30000;

  describe('resolveBlockByTimestamp for 2025-12-03', () => {
    it('Ethereum (chainId: 1)', async () => {
      const blockNumber = await resolveBlockByTimestamp(1, TEST_TIMESTAMP_MS);
      
      console.log(`\n📦 Ethereum block for 2025-12-03: ${blockNumber}`);
      
      expect(blockNumber).toBeGreaterThan(0);
      expect(blockNumber).toBeLessThan(25000000); // Sanity check
      
      if (EXPECTED_BLOCKS[1] !== null) {
        expect(blockNumber).toBe(EXPECTED_BLOCKS[1]);
      }
    }, TIMEOUT);

    it('Base (chainId: 8453)', async () => {
      const blockNumber = await resolveBlockByTimestamp(8453, TEST_TIMESTAMP_MS);
      
      console.log(`\n📦 Base block for 2025-12-03: ${blockNumber}`);
      
      expect(blockNumber).toBeGreaterThan(0);
      
      if (EXPECTED_BLOCKS[8453] !== null) {
        expect(blockNumber).toBe(EXPECTED_BLOCKS[8453]);
      }
    }, TIMEOUT);

    it('Polygon (chainId: 137)', async () => {
      const blockNumber = await resolveBlockByTimestamp(137, TEST_TIMESTAMP_MS);
      
      console.log(`\n📦 Polygon block for 2025-12-03: ${blockNumber}`);
      
      expect(blockNumber).toBeGreaterThan(0);
      
      if (EXPECTED_BLOCKS[137] !== null) {
        expect(blockNumber).toBe(EXPECTED_BLOCKS[137]);
      }
    }, TIMEOUT);

    it('Arbitrum (chainId: 42161)', async () => {
      const blockNumber = await resolveBlockByTimestamp(42161, TEST_TIMESTAMP_MS);
      
      console.log(`\n📦 Arbitrum block for 2025-12-03: ${blockNumber}`);
      
      expect(blockNumber).toBeGreaterThan(0);
      
      if (EXPECTED_BLOCKS[42161] !== null) {
        expect(blockNumber).toBe(EXPECTED_BLOCKS[42161]);
      }
    }, TIMEOUT);

    it('Optimism (chainId: 10)', async () => {
      const blockNumber = await resolveBlockByTimestamp(10, TEST_TIMESTAMP_MS);
      
      console.log(`\n📦 Optimism block for 2025-12-03: ${blockNumber}`);
      
      expect(blockNumber).toBeGreaterThan(0);
      
      if (EXPECTED_BLOCKS[10] !== null) {
        expect(blockNumber).toBe(EXPECTED_BLOCKS[10]);
      }
    }, TIMEOUT);

    it('Avalanche (chainId: 43114)', async () => {
      const blockNumber = await resolveBlockByTimestamp(43114, TEST_TIMESTAMP_MS);
      
      console.log(`\n📦 Avalanche block for 2025-12-03: ${blockNumber}`);
      
      expect(blockNumber).toBeGreaterThan(0);
      
      if (EXPECTED_BLOCKS[43114] !== null) {
        expect(blockNumber).toBe(EXPECTED_BLOCKS[43114]);
      }
    }, TIMEOUT);

    it('BSC (chainId: 56)', async () => {
      const blockNumber = await resolveBlockByTimestamp(56, TEST_TIMESTAMP_MS);
      
      console.log(`\n📦 BSC block for 2025-12-03: ${blockNumber}`);
      
      expect(blockNumber).toBeGreaterThan(0);
      
      if (EXPECTED_BLOCKS[56] !== null) {
        expect(blockNumber).toBe(EXPECTED_BLOCKS[56]);
      }
    }, TIMEOUT);
  });

  describe('Performance check', () => {
    it('should use cache on second call (instant)', async () => {
      // First call (may hit RPC)
      const start1 = Date.now();
      await resolveBlockByTimestamp(1, TEST_TIMESTAMP_MS);
      const time1 = Date.now() - start1;

      // Second call (should hit cache)
      const start2 = Date.now();
      await resolveBlockByTimestamp(1, TEST_TIMESTAMP_MS);
      const time2 = Date.now() - start2;

      console.log(`\n⏱️ First call: ${time1}ms, Cached call: ${time2}ms`);
      
      // Cached call should be < 5ms
      expect(time2).toBeLessThan(5);
    }, TIMEOUT);
  });
});
