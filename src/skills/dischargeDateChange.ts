import { createDateChangeSkill } from "./dateChangeSkill.js";

export const dischargeDateChangeSkill = createDateChangeSkill({
  usageKey: "discharge_date_change",
  column: "discharge_date",
  paramName: "sys_date",
  label: "전역일",
  exampleUtterance: "오늘 전역",
});
