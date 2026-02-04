import { beforeEach, describe, expect, it, vi } from "vitest";
import { pool } from "../../src/db/index.js";

// Mock ioredis first (before bullmq)
vi.mock("ioredis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    quit: vi.fn().mockResolvedValue("OK"),
    disconnect: vi.fn(),
    on: vi.fn(),
  })),
}));

// Mock BullMQ
const mockQueueAdd = vi.fn().mockResolvedValue({ id: "job-id" });
const mockGetRepeatableJobs = vi.fn().mockResolvedValue([]);
const mockRemoveRepeatableByKey = vi.fn().mockResolvedValue(true);

vi.mock("bullmq", () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: mockQueueAdd,
    getRepeatableJobs: mockGetRepeatableJobs,
    removeRepeatableByKey: mockRemoveRepeatableByKey,
  })),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock("../../src/db/index.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe("Scheduler Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queueActiveSignals adds active signals to the evaluation queue", async () => {
    // 1. Mock DB response with 2 active signals
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [{ id: "signal-1" }, { id: "signal-2" }],
    });

    // 2. Import and call queueActiveSignals
    const { queueActiveSignals } = await import("../../src/worker/scheduler.js");
    const count = await queueActiveSignals();

    // 3. Verify
    expect(count).toBe(2);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("WHERE is_active = true"));
    expect(mockQueueAdd).toHaveBeenCalledTimes(2);
    expect(mockQueueAdd).toHaveBeenCalledWith(
      "evaluate",
      { signalId: "signal-1" },
      expect.anything(),
    );
    expect(mockQueueAdd).toHaveBeenCalledWith(
      "evaluate",
      { signalId: "signal-2" },
      expect.anything(),
    );
  });

  it("startScheduler registers a repeatable job", async () => {
    const { startScheduler } = await import("../../src/worker/scheduler.js");
    await startScheduler();

    // Should check for existing jobs
    expect(mockGetRepeatableJobs).toHaveBeenCalled();

    // Should add repeatable job
    expect(mockQueueAdd).toHaveBeenCalledWith(
      "check-signals",
      {},
      expect.objectContaining({
        repeat: expect.objectContaining({
          every: 30000, // 30 seconds default
        }),
      }),
    );
  });
});
