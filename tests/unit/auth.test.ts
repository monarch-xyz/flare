import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

type MockRequest = Partial<Request> & {
  path: string;
  header: (name: string) => string | undefined;
};

type MockResponse = Partial<Response> & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const loadAuthMiddleware = async (apiKey: string) => {
  vi.resetModules();
  vi.doMock("../../src/config/index.js", () => ({
    config: {
      api: {
        apiKey,
      },
    },
  }));
  const { authMiddleware } = await import("../../src/api/middleware/auth.js");
  return authMiddleware;
};

const makeRes = (): MockResponse => {
  const res: MockResponse = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe("auth middleware", () => {
  it("Should allow requests when API_KEY is not set (dev mode)", async () => {
    const authMiddleware = await loadAuthMiddleware("");
    const req: MockRequest = { path: "/api/v1/foo", header: vi.fn() };
    const res = makeRes();
    const next: NextFunction = vi.fn();

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("Should allow requests with valid x-api-key header", async () => {
    const authMiddleware = await loadAuthMiddleware("secret");
    const req: MockRequest = {
      path: "/api/v1/foo",
      header: vi.fn((name: string) => (name === "x-api-key" ? "secret" : undefined)),
    };
    const res = makeRes();
    const next: NextFunction = vi.fn();

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("Should return 401 when x-api-key is missing and API_KEY is set", async () => {
    const authMiddleware = await loadAuthMiddleware("secret");
    const req: MockRequest = { path: "/api/v1/foo", header: vi.fn(() => undefined) };
    const res = makeRes();
    const next: NextFunction = vi.fn();

    authMiddleware(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("Should return 401 when x-api-key is invalid", async () => {
    const authMiddleware = await loadAuthMiddleware("secret");
    const req: MockRequest = {
      path: "/api/v1/foo",
      header: vi.fn((name: string) => (name === "x-api-key" ? "wrong" : undefined)),
    };
    const res = makeRes();
    const next: NextFunction = vi.fn();

    authMiddleware(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("Should always allow /health endpoint regardless of auth", async () => {
    const authMiddleware = await loadAuthMiddleware("secret");
    const req: MockRequest = { path: "/health", header: vi.fn(() => undefined) };
    const res = makeRes();
    const next: NextFunction = vi.fn();

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
