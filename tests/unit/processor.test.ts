import { beforeEach, describe, expect, it, vi } from "vitest";
import { pool } from "../../src/db/index.js";
import { dispatchNotification } from "../../src/worker/notifier.js";

// Mock ioredis first (before bullmq)
vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    quit: vi.fn().mockResolvedValue("OK"),
    disconnect: vi.fn(),
    on: vi.fn(),
  })),
}));

// Mock everything
vi.mock("../../src/db/index.js", () => ({
  pool: { query: vi.fn() },
}));

vi.mock("../../src/envio/client.js", () => ({
  EnvioClient: vi.fn().mockImplementation(() => ({
    fetchState: vi.fn(),
    fetchEvents: vi.fn(),
  })),
}));

// Mock the evaluator to return triggered=true
vi.mock("../../src/engine/condition.js", () => ({
  SignalEvaluator: vi.fn().mockImplementation(() => ({
    evaluate: vi.fn().mockResolvedValue({ triggered: true, timestamp: Date.now() }),
  })),
}));

vi.mock("../../src/worker/notifier.js", () => ({
  dispatchNotification: vi.fn().mockResolvedValue({ success: true, status: 200, durationMs: 100 }),
}));

// We mock BullMQ to capture the worker handler
let capturedHandler: any;
vi.mock("bullmq", () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
  })),
  Worker: vi.fn().mockImplementation((name, handler) => {
    capturedHandler = handler;
    return { on: vi.fn(), close: vi.fn() };
  }),
}));

describe("Processor Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates a signal and dispatches notification", async () => {
    const { setupWorker } = await import("../../src/worker/processor.js");
    setupWorker();

    // 1. Mock DB returning a simple signal
    (pool.query as any)
      .mockResolvedValueOnce({
        rows: [
          {
            id: "sig-123",
            name: "Simple Alert",
            is_active: true,
            webhook_url: "https://test.com",
            cooldown_minutes: 5,
            last_triggered_at: null,
            definition: {
              chains: [1],
              window: { duration: "1h" },
              condition: {
                type: "condition",
                operator: "gt",
                left: { type: "constant", value: 100 },
                right: { type: "constant", value: 50 },
              },
            },
          },
        ],
      })
      .mockResolvedValue({ rows: [] }); // For subsequent UPDATE queries

    // 2. Execute the worker handler
    await capturedHandler({ data: { signalId: "sig-123" } });

    // 3. Verify notification was sent (because evaluator returns triggered=true)
    expect(dispatchNotification).toHaveBeenCalledWith(
      "https://test.com",
      expect.objectContaining({ signal_id: "sig-123" }),
    );

    // 4. Verify DB was updated
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE signals SET last_triggered_at"),
      ["sig-123"],
    );
  });
});
