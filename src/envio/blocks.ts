import axios from 'axios';
import { config } from '../config/index.js';

export async function resolveBlockByTimestamp(chainId: number, timestampMs: number): Promise<number> {
  // block times in ms
  const blockTimes: Record<number, number> = {
    1: 12000,    // Ethereum
    8453: 2000,  // Base
  };

  const blockTime = blockTimes[chainId] || 12000;
  
  // simple linear estimate for now (assuming block 0 at unix 0 for baseline)
  return Math.floor(timestampMs / blockTime); 
}
