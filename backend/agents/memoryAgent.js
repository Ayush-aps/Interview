import {
  advanceAgentState,
  createInitialAgentState,
  extractResumeFacts,
  summarizePlannerContext,
} from "../services/interviewPolicy.js";

export const buildInterviewMemory = ({ interview, user, resume = null, resumeData = null }) => {
  const initialState = createInitialAgentState({ interview, user, resume: resume || (resumeData ? { parsedData: { candidateSummary: resumeData } } : null) });

  return {
    ...initialState,
    interviewId: interview?._id?.toString() || null,
    topic: interview?.topic || "",
    type: interview?.type || "text",
    difficulty: interview?.difficulty || "medium",
    status: interview?.status || "ongoing",
    totalScore: interview?.totalScore || 0,
    currentStep: interview?.questionFeedbacks?.length || 0,
    weakTopics: initialState.weakTopics || [],
    strongTopics: initialState.strongTopics || [],
    hintsUsed: [],
    codingScore: 0,
    timeTaken: interview?.duration || null,
    followUpHistory: [],
    messages: interview?.messages || [],
    questionFeedbacks: interview?.questionFeedbacks || [],
    candidateProfile: {
      name: user?.name || "",
      targetRole: user?.targetRole || "fullstack",
      experience: user?.experience || "",
      techStack: user?.techStack || [],
      totalInterviews: user?.totalInterviews || 0,
      totalScore: user?.totalScore || 0,
    },
    resumeContext: extractResumeFacts(resume || null),
  };
};

export const summarizeMemory = (memory) => ({
  roleFamily: memory?.roleFamily || "general",
  roleLabel: memory?.roleLabel || "",
  topic: memory?.topic || "",
  currentTopic: memory?.currentTopic || memory?.topic || "",
  phase: memory?.phase || "opening",
  turnNumber: memory?.turnNumber || 0,
  elapsedMinutes: memory?.elapsedMinutes || 0,
  remainingMinutes: memory?.remainingMinutes || 0,
  resumeDiscussed: !!memory?.resumeDiscussed,
  codingQuestionsUsed: memory?.codingQuestionsUsed || 0,
  codingBudgetTurns: memory?.codingBudgetTurns || 0,
  behavioralQuestionsUsed: memory?.behavioralQuestionsUsed || 0,
  debugBudgetTurns: memory?.debugBudgetTurns || 0,
  systemDesignBudgetTurns: memory?.systemDesignBudgetTurns || 0,
  resumeBudgetTurns: memory?.resumeBudgetTurns || 0,
  strongTopics: memory?.strongTopics || [],
  weakTopics: memory?.weakTopics || [],
  averageResponseQuality: memory?.averageResponseQuality || 0,
  confidence: memory?.confidence || 0,
  followUpCountByTopic: memory?.followUpCountByTopic || {},
  followUpStreak: memory?.followUpStreak || 0,
  maxFollowUpsPerTopic: memory?.maxFollowUpsPerTopic || 0,
  recentQuestions: (memory?.questionHistory || []).slice(-5),
  recentScores: (memory?.answerHistory || []).slice(-5),
  roleCoveragePlan: (memory?.roleCoveragePlan || []).slice(0, 10),
  resumeFacts: {
    hasResume: !!memory?.resumeFacts?.hasResume,
    skills: (memory?.resumeFacts?.skills || []).slice(0, 8),
    projects: (memory?.resumeFacts?.projects || []).slice(0, 4),
    experience: (memory?.resumeFacts?.experience || []).slice(0, 4),
    roleMatch: memory?.resumeFacts?.roleMatch || "",
    candidateSummary: memory?.resumeFacts?.candidateSummary || "",
  },
});

export const updateMemoryAfterEvaluation = (memory, evaluation, payload = {}) => advanceAgentState({
  state: memory,
  question: payload.question || "",
  answer: payload.answer || "",
  evaluation,
  plannerDecision: payload.plannerDecision || {},
  nextQuestion: payload.nextQuestion || "",
  nextAction: payload.nextAction || payload.plannerDecision?.nextAction || "",
  topic: payload.topic || memory?.currentTopic || memory?.topic || "",
  actionTopic: payload.topic || memory?.currentTopic || memory?.topic || "",
});