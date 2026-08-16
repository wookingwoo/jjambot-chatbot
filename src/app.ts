import { Hono } from "hono";
import { pingSkill } from "./skills/ping.js";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/skill/ping", pingSkill);
