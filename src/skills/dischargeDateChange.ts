import { createDateChangeSkill } from "./dateChangeSkill.js";

export const dischargeDateChangeSkill = createDateChangeSkill({
  usageKey: "discharge_date_change",
  column: "discharge_date",
  paramName: "date",
  label: "전역일",
});
