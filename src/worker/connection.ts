/**
 * Shared Redis connection for BullMQ
 */

import { Redis } from "ioredis";
import { config } from "../config/index.js";

// Create shared Redis connection for BullMQ
// BullMQ requires IORedis instance, not a URL string
export const connection = new Redis(config.redis.url, {
  maxRetriesPerRequest: null, // Required for BullMQ
});

// Export for graceful shutdown
export const closeConnection = async () => {
  await connection.quit();
};
