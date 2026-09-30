// The checker's diagnosis codes, as skills.
//
// ai-service/skills.py holds the same table, because the planner needs it
// there. This copy exists so the web core can record evidence without a round
// trip just to translate a string. If one changes, change both; the mapping is
// small and stable by design.
export const DIAGNOSIS_TO_SKILL: Record<string, string> = {
  missing_green_flag: "events",
  missing_move: "motion",
  missing_loop: "loops",
  missing_conditional: "conditionals",
  missing_variable: "variables",
};

// The skill a lesson is really about, used as the planner's target. Falls back
// to whatever the checker last complained about.
export const LESSON_TARGET_SKILLS: Record<string, string[]> = {
  "loops-1": ["loops"],
  "conditionals-1": ["conditionals"],
  "variables-1": ["variables"],
};

export function skillForDiagnosis(diagnosis: string | null | undefined) {
  if (!diagnosis) return null;
  // Proactive nudges say a child went quiet, not that they got something
  // wrong, so they map to no skill and contribute no evidence.
  return DIAGNOSIS_TO_SKILL[diagnosis] ?? null;
}

export function targetSkillsFor(lessonId: string) {
  return LESSON_TARGET_SKILLS[lessonId] ?? [];
}
