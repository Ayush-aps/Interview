import callAI from "../utils/callAI.js";
import { parseJsonSafe } from "../utils/parseJson.js";
import { buildPlannerPrompt } from "../services/promptTemplates.js";
import { normalizePlannerDecision, selectInitialDecision, summarizePlannerContext } from "../services/interviewPolicy.js";

export const planNextStep = async ({ state, candidateProfile, resumeContext, roleFamily, roleLabel, coveragePlan, budgets }) => {
  const plannerContext = summarizePlannerContext(state);
  const prompt = buildPlannerPrompt({
    state: plannerContext,
    candidateProfile,
    resumeContext,
    roleFamily,
    roleLabel,
    coveragePlan,
    budgets,
  });

  try {
    const response = await callAI(prompt);
    const parsed = parseJsonSafe(response, selectInitialDecision(state));
    return normalizePlannerDecision(parsed, state);
  } catch (error) {
    return normalizePlannerDecision(selectInitialDecision(state), state);
  }
};