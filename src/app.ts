import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { simpleText, skillResponse } from "./kakao/builders.js";
import { requireSkillSecret } from "./middleware/skillAuth.js";
import { logSkillRequest } from "./middleware/logSkillRequest.js";
import { pingSkill } from "./skills/ping.js";
import { menuSkill } from "./skills/menu.js";
import { corpsListSkill } from "./skills/corpsList.js";
import { corpsChangeSkill } from "./skills/corpsChange.js";
import { allergyToggleSkill } from "./skills/allergyToggle.js";
import { joinDateChangeSkill } from "./skills/joinDateChange.js";
import { joinDateShowSkill } from "./skills/joinDateShow.js";
import { dischargeDateChangeSkill } from "./skills/dischargeDateChange.js";
import { calculateDateSkill } from "./skills/calculateDate.js";

export const app = new Hono();

app.onError((error, c) => {
  if (error instanceof HTTPException) return error.getResponse();
  console.error("[server] request failed", { path: c.req.path, message: error.message });
  if (c.req.path.startsWith("/skill/")) {
    return c.json(skillResponse([simpleText("지금 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.")]));
  }
  return c.json({ error: "internal_server_error" }, 500);
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.use("/skill/*", requireSkillSecret);
app.use("/skill/*", logSkillRequest);

app.route("/skill/ping", pingSkill);
app.route("/skill/menu", menuSkill);
app.route("/skill/corps/list", corpsListSkill);
app.route("/skill/corps/change", corpsChangeSkill);
app.route("/skill/allergy/toggle", allergyToggleSkill);
app.route("/skill/join-date/change", joinDateChangeSkill);
app.route("/skill/join-date/show", joinDateShowSkill);
app.route("/skill/discharge-date/change", dischargeDateChangeSkill);
app.route("/skill/calculate-date", calculateDateSkill);
