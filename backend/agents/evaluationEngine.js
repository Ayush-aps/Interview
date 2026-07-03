import callAI from "../utils/callAI.js";
import { parseJsonSafe } from "../utils/parseJson.js";
import { buildEvaluationPrompt } from "../services/aiPrompts.js";

const fallbackEvaluation = ({ topic, answer = "", codeSubmitted = "", languageUsed = "javascript" }) => {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const codeBonus = codeSubmitted.trim() ? 2 : 0;
  const lengthScore = Math.min(6, Math.floor(wordCount / 12));
  const score = Math.max(1, Math.min(10, 2 + lengthScore + codeBonus));

  return {
    score,
    correctness: codeSubmitted.trim() ? "Code submitted; basic offline evaluation used." : "Answer reviewed with offline fallback evaluation.",
    missingConcepts: wordCount < 20 ? [topic || "core concept"] : [],
    strengths: wordCount >= 20 ? ["clear communication"] : ["attempted the answer"],
    weaknesses: wordCount < 20 ? ["needs more depth"] : [],
    idealAnswer: `A strong answer should explain ${topic || "the concept"} clearly and include a concrete example.`,
    nextDifficulty: score >= 8 ? "hard" : score >= 5 ? "medium" : "easy",
    nextTopicSuggestion: topic || "core topic",
    followUpRequired: wordCount < 20,
    confidence: 60,
    codingScore: codeSubmitted.trim() ? score : 0,
    communicationScore: Math.min(10, Math.max(2, Math.floor(wordCount / 10) + 2)),
    conceptScore: Math.min(10, Math.max(2, Math.floor(score / 2) + 2)),
    depthScore: Math.min(10, Math.max(1, Math.floor(wordCount / 15) + 1)),
    complexityScore: codeSubmitted.trim() ? 5 : 0,
    optimizationScore: codeSubmitted.trim() ? 5 : 0,
    problemSolvingScore: Math.min(10, Math.max(1, score)),
    recommendedAction: wordCount < 20 ? "ask_follow_up" : "continue_current_topic",
    timeComplexity: codeSubmitted.trim() ? "O(n)" : "",
    spaceComplexity: codeSubmitted.trim() ? "O(1)" : "",
  };
};

export const evaluateAnswer = async ({ topic, question, answer, codeSubmitted = "", languageUsed = "javascript", candidateProfile = {}, rubric = {}, personality = "Friendly", plannerDecision = {}, interviewState = {} }) => {
  const prompt = buildEvaluationPrompt({ topic, question, answer, codeSubmitted, languageUsed, candidateProfile, rubric, personality, plannerDecision, interviewState });
  try {
    const response = await callAI(prompt);
    return parseJsonSafe(response, fallbackEvaluation({ topic, answer, codeSubmitted, languageUsed }));
  } catch (error) {
    return fallbackEvaluation({ topic, answer, codeSubmitted, languageUsed });
  }
};