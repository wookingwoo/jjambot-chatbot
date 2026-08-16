import { Hono } from "hono";
import { requireSkillSecret } from "./middleware/skillAuth.js";
import { pingSkill } from "./skills/ping.js";
import { menuSkill } from "./skills/menu.js";
import { corpsListSkill } from "./skills/corpsList.js";
import { corpsChangeSkill } from "./skills/corpsChange.js";
import { allergyToggleSkill } from "./skills/allergyToggle.js";
import { joinDateChangeSkill } from "./skills/joinDateChange.js";
import { dischargeDateChangeSkill } from "./skills/dischargeDateChange.js";
import { calculateDateSkill } from "./skills/calculateDate.js";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.use("/skill/*", requireSkillSecret);

app.route("/skill/ping", pingSkill);
app.route("/skill/menu", menuSkill);
app.route("/skill/corps/list", corpsListSkill);
app.route("/skill/corps/change", corpsChangeSkill);
app.route("/skill/allergy/toggle", allergyToggleSkill);
app.route("/skill/join-date/change", joinDateChangeSkill);
app.route("/skill/discharge-date/change", dischargeDateChangeSkill);
app.route("/skill/calculate-date", calculateDateSkill);
