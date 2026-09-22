import { Router, type IRouter } from "express";
import { z } from "zod";
import { validAutomationToken } from "../lib/automation-auth";
import { logEvent } from "../utils/eventLog";

const router: IRouter = Router();

router.post("/", (req, res) => {
  if (!validAutomationToken(req.header("authorization"))) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  const parsed = z
    .object({
      type: z.string().trim().min(1).max(32),
      message: z.string().trim().min(1).max(1_000),
      category: z.string().trim().min(1).max(64).optional(),
    })
    .strict()
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Invalid operational event." });
    return;
  }
  logEvent(parsed.data.type, parsed.data.message, parsed.data.category);
  res.status(202).json({ success: true });
});

export default router;