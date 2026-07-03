import callAI from "../utils/callAI.js";
import { parseJsonSafe } from "../utils/parseJson.js";
import { buildReportPrompt } from "../services/aiPrompts.js";

const fallbackReport = ({ topic, totalScore, questionFeedbacks, plannerSummary = {}, roleCoverageSummary = {} }) => {
  const weakTopics = questionFeedbacks.filter((item) => (item.score || 0) < 6).map((item) => item.topic || item.question).filter(Boolean).slice(0, 5);
  const strongTopics = questionFeedbacks.filter((item) => (item.score || 0) >= 6).map((item) => item.topic || item.question).filter(Boolean).slice(0, 5);
  const nextInterviewTopic = weakTopics[0] || roleCoverageSummary.nextTopic || topic || "core fundamentals";

  return {
    overallScore: totalScore || 0,
    performanceSummary: `The candidate completed the interview with a score of ${totalScore}/100.`,
    toneFeedback: "Conversation flow was evaluated using a deterministic fallback because the AI service was unavailable.",
    strongTopics,
    weakTopics,
    missedConcepts: weakTopics,
    studyPlan: [
      {
        topic: nextInterviewTopic,
        whatToStudy: `Review ${nextInterviewTopic} and practice explaining it with examples.`,
        priority: "high",
      },
    ],
    nextInterviewTopic,
    nextRoadmap: [nextInterviewTopic],
    estimatedReadiness: totalScore >= 75 ? "Ready for advanced rounds" : totalScore >= 60 ? "Close to ready" : "Needs more preparation",
    estimatedInterviewLevel: totalScore >= 75 ? "senior" : totalScore >= 60 ? "mid" : "junior",
    topicWiseScore: {
      conceptual: Math.min(10, Math.max(1, Math.round(totalScore / 12))),
      coding: Math.min(10, Math.max(1, Math.round(totalScore / 12))),
      communication: Math.min(10, Math.max(1, Math.round(totalScore / 14))),
      complexity: Math.min(10, Math.max(1, Math.round(totalScore / 13))),
      confidence: Math.min(10, Math.max(1, Math.round(totalScore / 14))),
      problemSolving: Math.min(10, Math.max(1, Math.round(totalScore / 12))),
    },
    codingScore: Math.min(10, Math.max(1, Math.round(totalScore / 12))),
    communicationScore: Math.min(10, Math.max(1, Math.round(totalScore / 14))),
  };
};

export const generateInterviewReport = async ({ topic, difficulty, totalScore, conversation, questionFeedbacks, candidateProfile, memorySummary, personality = "Friendly", plannerSummary = {}, roleCoverageSummary = {} }) => {
  const prompt = buildReportPrompt({ topic, difficulty, totalScore, conversation, questionFeedbacks, candidateProfile, memorySummary, personality, plannerSummary, roleCoverageSummary });
  try {
    const response = await callAI(prompt);
    return parseJsonSafe(response, fallbackReport({ topic, totalScore, questionFeedbacks, plannerSummary, roleCoverageSummary }));
  } catch (error) {
    return fallbackReport({ topic, totalScore, questionFeedbacks, plannerSummary, roleCoverageSummary });
  }
};