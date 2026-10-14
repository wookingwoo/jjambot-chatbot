import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import { CORPS_LABELS, serviceForCorps } from "../dist/corps.js";

const users = new Map();
const calls = [];
const results = [];
const sample = {
  breakfast: "밥(05)(06),얼큰쇠고기무국,밥싸먹는오리훈제,매콤볼어묵조림,배추김치(다수공급자),우유(백색우유(200ML,연간))(02)",
  lunch: "밥,키조개미역국,타워함박스테이크,샐러드파스타,모듬피클,아이스홍시,깍두기(다수공급자)",
  dinner: "밥,중화식계란탕,마파두부,고추잡채&꽃빵,단무지무침,롯데칠성음료,펩시제로슈거라임향,355mL/캔",
  special_dish: null,
};
let mode = "normal";
let delay = 0;
let childLogs = "";
const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
function dayOffset(offset) {
  const date = new Date(today + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
function reply(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(body === undefined ? undefined : JSON.stringify(body));
}
const backend = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    let raw = "";
    for await (const chunk of request) raw += chunk;
    const body = raw ? JSON.parse(raw) : null;
    calls.push({ method: request.method, path: url.pathname, query: Object.fromEntries(url.searchParams), body });
    assert.equal(request.headers.apikey, "test-service-role-key");
    assert.equal(request.headers.authorization, "Bearer test-service-role-key");
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    const singular = request.headers.accept?.includes("vnd.pgrst.object");
    if (url.pathname === "/rest/v1/users") {
      if (request.method === "POST") {
        assert.equal(url.searchParams.get("on_conflict"), "kakao_user_id");
        assert.match(request.headers.prefer, /resolution=merge-duplicates/);
        assert.deepEqual(Object.keys(body), ["kakao_user_id"]);
        if (!users.has(body.kakao_user_id)) users.set(body.kakao_user_id, {
          id: users.size + 1, kakao_user_id: body.kakao_user_id, alias: "테스트 운영자 별칭",
          corps: null, allergy_show: false, date_to_join_the_army: null, discharge_date: null,
          usage_count: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        });
        const user = users.get(body.kakao_user_id);
        return reply(response, 200, singular ? user : [user]);
      }
      const id = url.searchParams.get("kakao_user_id")?.replace(/^eq\./, "");
      const user = users.get(id);
      assert(user, "user PATCH must target an existing user");
      Object.assign(user, body);
      if (request.headers.prefer?.includes("return=representation")) return reply(response, 200, singular ? user : [user]);
      return reply(response, 204);
    }
    if (url.pathname === "/rest/v1/meals") {
      assert.equal(request.method, "GET");
      const date = url.searchParams.get("meal_date")?.replace(/^eq\./, "");
      const parsed = new Date(date + "T00:00:00Z");
      if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) {
        return reply(response, 400, { code: "22008", message: "date/time field value out of range" });
      }
      if (mode === "error") return reply(response, 503, { code: "RELEASE_TEST_OUTAGE", message: "test backend unavailable" });
      if (mode === "disconnect") return request.socket.destroy();
      let rows = mode === "none" ? [] : CORPS_LABELS.map(label => ({
        ...sample, service: serviceForCorps(label), meal_date: date, weekday: "월",
      }));
      const service = url.searchParams.get("service")?.replace(/^eq\./, "");
      if (service) rows = rows.filter(row => row.service === service);
      if (mode === "empty") rows = rows.map(row => ({ ...row, breakfast: null, lunch: " ", dinner: null, weekday: null }));
      if (mode === "long") rows = rows.map(row => ({ ...row, breakfast: "조식메뉴,".repeat(80), lunch: "중식메뉴,".repeat(80), dinner: "석식메뉴,".repeat(80) }));
      return reply(response, 200, singular ? rows[0] ?? null : rows);
    }
    return reply(response, 404, { message: "unexpected fixture route" });
  } catch (error) { reply(response, 500, { message: String(error) }); }
});
await new Promise(resolve => backend.listen(54321, "127.0.0.1", resolve));
const child = spawn(process.execPath, ["dist/index.js"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: "8000", SUPABASE_URL: "http://127.0.0.1:54321", SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key", SKILL_SECRET: "test-skill-secret" },
});
child.stdout.on("data", chunk => { childLogs += chunk; });
child.stderr.on("data", chunk => { childLogs += chunk; });
function payload(params = {}, user = "release-test-user") {
  return { intent: { id: "test", name: "test" }, userRequest: { utterance: "릴리즈 검증", user: { id: user, type: "botUserKey" } },
    bot: { id: "test" }, action: { id: "test", name: "test", params, detailParams: {} } };
}
async function request(path, params = {}, { user, secret = "test-skill-secret", data } = {}) {
  const start = performance.now();
  const response = await fetch("http://127.0.0.1:8000" + path, { method: "POST",
    headers: { "Content-Type": "application/json", "X-Skill-Secret": secret }, body: JSON.stringify(data ?? payload(params, user)), signal: AbortSignal.timeout(4500) });
  const raw = await response.text();
  let body;
  try { body = JSON.parse(raw); } catch { body = raw; }
  return { status: response.status, body, elapsed: performance.now() - start };
}
function valid(result) {
  assert.equal(result.status, 200);
  assert.equal(result.body.version, "2.0");
  const outputs = result.body.template.outputs;
  assert(outputs.length > 0 && outputs.length <= 3);
  for (const output of outputs) assert(output.simpleText.text.length <= 1000, "Kakao simpleText exceeds 1000 characters");
  assert(result.elapsed < 4500, "skill did not fit the response-time budget");
  return outputs.map(output => output.simpleText.text).join("\n");
}
async function check(name, test) {
  const start = performance.now();
  try { await test(); results.push({ name, passed: true, milliseconds: Math.round(performance.now() - start) }); }
  catch (error) { results.push({ name, passed: false, error: String(error), milliseconds: Math.round(performance.now() - start) }); }
  finally { mode = "normal"; delay = 0; }
}
try {
  for (let attempt = 0; attempt < 30; attempt++) {
    try { if ((await fetch("http://127.0.0.1:8000/health")).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  await check("health without authentication", async () => {
    const count = calls.length;
    const response = await fetch("http://127.0.0.1:8000/health");
    assert.equal(response.status, 200); assert.deepEqual(await response.json(), { status: "ok" }); assert.equal(calls.length, count);
  });
  for (const secret of ["", "wrong", "test-skill-secrex", "test-skill-secret-extra"]) await check("reject credential: " + (secret || "missing"), async () => {
    const count = calls.length; assert.equal((await request("/skill/menu", {}, { secret })).status, 401); assert.equal(calls.length, count);
  });
  await check("invalid payload fails before DB requests", async () => {
    const count = calls.length; assert.equal((await request("/skill/menu", {}, { data: {} })).status, 400); assert.equal(calls.length, count);
  });
  await check("new user is asked to select a corps", async () => assert.match(valid(await request("/skill/menu")), /먼저 부대/));
  for (const corps of ["5322", "7017", "1975", "KIDA"]) {
    await check("save corps " + corps, async () => { assert.match(valid(await request("/skill/corps/change", { corps })), new RegExp(corps)); assert.equal(users.get("release-test-user").corps, corps); });
    await check("query and render corps " + corps, async () => {
      const text = valid(await request("/skill/menu")); assert.match(text, new RegExp(corps + " 식단"));
      assert.equal(calls.filter(call => call.path === "/rest/v1/meals").at(-1).query.service, "eq." + serviceForCorps(corps));
      assert(text.includes("우유(백색우유(200ML,연간))")); assert(!text.includes("(05)"));
      assert.equal(users.get("release-test-user").alias, "테스트 운영자 별칭");
    });
  }
  await check("persist allergy setting and display codes", async () => {
    valid(await request("/skill/allergy/toggle", { toggle_state: "on" }));
    assert(valid(await request("/skill/menu")).includes("밥(05)(06)"));
    valid(await request("/skill/allergy/toggle", { toggle_state: "off" }));
  });
  await check("combined OpenBuilder date and meal selection", async () => {
    const text = valid(await request("/skill/menu", { sys_date: JSON.stringify({ date: dayOffset(1), dateTag: "tomorrow" }), meal_type0: "아침", meal_type1: "저녁" }));
    assert(text.includes(dayOffset(1))); assert(text.includes("[조식]")); assert(text.includes("[석식]")); assert(!text.includes("[중식]"));
  });
  await check("all supported corps fit Kakao output limits", async () => {
    const text = valid(await request("/skill/corps/list")); for (const label of CORPS_LABELS) assert(text.includes(label + ":"));
  });
  for (const days of [182, 183, 184]) await check("lookback boundary " + days, async () => {
    const count = calls.filter(call => call.path === "/rest/v1/meals").length;
    const text = valid(await request("/skill/menu", { sys_date: dayOffset(-days) }));
    const after = calls.filter(call => call.path === "/rest/v1/meals").length;
    if (days > 183) { assert(text.includes("6개월")); assert.equal(after, count); }
    else { assert(text.includes(dayOffset(-days))); assert.equal(after, count + 1); }
  });
  await check("missing meal data returns friendly message", async () => { mode = "none"; assert(valid(await request("/skill/menu")).includes("아직 없어요")); mode = "normal"; });
  await check("empty meal fields return placeholders", async () => { mode = "empty"; assert.equal(valid(await request("/skill/menu")).match(/정보 없음/g).length, 3); mode = "normal"; });
  await check("DB outage returns a friendly response without retries or leaked credentials", async () => {
    const before = calls.filter(call => call.path === "/rest/v1/meals").length;
    mode = "error"; const result = await request("/skill/menu"); assert(valid(result).includes("잠시 후"));
    assert(!JSON.stringify(result.body).includes("test-service-role-key"));
    assert.equal(calls.filter(call => call.path === "/rest/v1/meals").length, before + 1);
    assert(result.elapsed < 2500);
  });
  await check("unresponsive DB requests are aborted within the skill budget", async () => {
    delay = 1700; const result = await request("/skill/menu"); assert(valid(result).includes("잠시 후")); assert(result.elapsed < 2500);
  });
  await check("DB connection loss returns a friendly response without retries", async () => {
    const before = calls.filter(call => call.path === "/rest/v1/meals").length;
    mode = "disconnect"; assert(valid(await request("/skill/menu")).includes("잠시 후"));
    assert.equal(calls.filter(call => call.path === "/rest/v1/meals").length, before + 1);
  });
  await check("three delayed DB requests fit the five-second skill budget", async () => {
    delay = 200; assert(valid(await request("/skill/menu")).includes("[조식]"));
  });
  await check("20 concurrent menu requests succeed", async () => {
    const responses = await Promise.all(Array.from({ length: 20 }, () => request("/skill/menu")));
    for (const response of responses) assert(valid(response).includes("[조식]"));
  });
  await check("long meal data respects Kakao text limits", async () => { mode = "long"; valid(await request("/skill/menu")); mode = "normal"; });
  mode = "normal";
  await check("invalid calendar date is handled without HTTP 500", async () => {
    const before = calls.filter(call => call.path === "/rest/v1/meals").length;
    const result = await request("/skill/menu", { sys_date: "2026-13-01" });
    assert(valid(result).includes("YYYY-MM-DD"));
    assert.equal(calls.filter(call => call.path === "/rest/v1/meals").length, before);
  });
} finally {
  child.kill("SIGTERM");
  await new Promise(resolve => backend.close(resolve));
}
const report = { target: "compiled release server", environment: "local test PostgREST API; no production database", date: today,
  total: results.length, passed: results.filter(result => result.passed).length, failed: results.filter(result => !result.passed).length,
  dbRequests: calls.length, tests: results };
console.log(JSON.stringify(report, null, 2));
if (report.failed) process.exitCode = 1;
