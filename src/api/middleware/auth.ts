import type { NextFunction, Request, Response } from "express";
import { config } from "../../config/index.js";

const UNAUTHORIZED_RESPONSE = { error: "Unauthorized" };

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") {
    return next();
  }

  if (!config.api.apiKey) {
    return next();
  }

  const apiKey = req.header("x-api-key");
  if (!apiKey || apiKey !== config.api.apiKey) {
    return res.status(401).json(UNAUTHORIZED_RESPONSE);
  }

  return next();
};
