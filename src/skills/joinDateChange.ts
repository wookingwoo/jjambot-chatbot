import { createDateChangeSkill } from "./dateChangeSkill.js";

export const joinDateChangeSkill = createDateChangeSkill({
  usageKey: "join_date_change",
  column: "date_to_join_the_army",
  paramName: "sys_date",
  label: "입대일",
});
