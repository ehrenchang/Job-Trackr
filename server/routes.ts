import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProspectSchema, STATUSES, INTEREST_LEVELS } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/prospects", async (_req, res) => {
    const prospects = await storage.getAllProspects();
    res.json(prospects);
  });

  app.post("/api/prospects", async (req, res) => {
    const parsed = insertProspectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map((e) => e.message).join(", ") });
    }
    const prospect = await storage.createProspect(parsed.data);
    res.status(201).json(prospect);
  });

  app.patch("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const existing = await storage.getProspect(id);
    if (!existing) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    const body = req.body;

    const partialSchema = insertProspectSchema.partial();
    const parsed = partialSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map((e) => e.message).join(", ") });
    }

    const validated = parsed.data;
    const updates: Record<string, unknown> = {};

    if (validated.companyName !== undefined) updates.companyName = validated.companyName;
    if (validated.roleTitle !== undefined) updates.roleTitle = validated.roleTitle;
    if (validated.jobUrl !== undefined) updates.jobUrl = validated.jobUrl;
    if ("salary" in body) updates.salary = validated.salary ?? null;
    if ("applicationDeadline" in body) updates.applicationDeadline = validated.applicationDeadline ?? null;
    if (validated.notes !== undefined) updates.notes = validated.notes;
    if (validated.status !== undefined) updates.status = validated.status;
    if (validated.interestLevel !== undefined) updates.interestLevel = validated.interestLevel;

    const updated = await storage.updateProspect(id, updates);
    res.json(updated);
  });

  app.delete("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const deleted = await storage.deleteProspect(id);
    if (!deleted) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    res.status(204).send();
  });

  return httpServer;
}
