import callAI from "../utils/callAI.js";
import { parseJsonSafe } from "../utils/parseJson.js";
import { buildEvaluationPrompt } from "../services/promptTemplates.js";

export const evaluateAnswer = async ({ topic, question, answer, codeSubmitted = "", languageUsed = "javascript", candidateProfile = {}, rubric = {}, personality = "Friendly", state = {}, plannerDecision = {} }) => {
  const prompt = buildEvaluationPrompt({ topic, question, answer, codeSubmitted, languageUsed, candidateProfile, rubric, personality, state, plannerDecision });
  const response = await callAI(prompt);

  return parseJsonSafe(response, {
    score: 0,
    conceptScore: 0,
    correctness: "",
    missingConcepts: [],
    strengths: [],
    weaknesses: [],
    idealAnswer: "",
    nextDifficulty: "medium",
    nextTopicSuggestion: topic,
    followUpRequired: false,
    confidence: 0,
    codingScore: 0,
    communicationScore: 0,
    problemSolvingScore: 0,
    complexityScore: 0,
    optimizationScore: 0,
    shouldSwitchTopic: false,
  });
};