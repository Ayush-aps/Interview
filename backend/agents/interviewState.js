import { createTopicKey, getInterviewSchedule, normalizeRole, roleForTopic } from "./interviewDomains.js";

const countBy = (items = [], selector = (item) => item) =>
  items.reduce((accumulator, item) => {
    const key = selector(item);
    if (!key) return accumulator;
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

const getLastAiMessage = (messages = []) => [...messages].reverse().find((message) => message.role === "ai")?.content || "";
const getLastUserMessage = (messages = []) => [...messages].reverse().find((message) => message.role === "user")?.content || "";

export const buildInterviewState = ({ interview = {}, user = {}, resumeText = "" }) => {
  const messages = interview.messages || [];
  const questionFeedbacks = interview.questionFeedbacks || [];
  const role = normalizeRole(user.targetRole || interview.topic || "general");
  const schedule = getInterviewSchedule(interview.duration || 30);
  const topicHistory = questionFeedbacks.map((feedback) => feedback.topic || feedback.question || "");
  const topicCoverage = countBy(topicHistory, (topic) => createTopicKey(topic));
  const questionTypesUsed = countBy(questionFeedbacks, (feedback) => feedback.questionType || "conceptual");
  const actionHistory = countBy(questionFeedbacks, (feedback) => feedback.plannerAction || "ask_conceptual_question");
  const followUpCount = questionFeedbacks.filter((feedback) => (feedback.questionType || "").includes("follow_up") || feedback.plannerAction === "ask_follow_up").length;
  const codingAsked = questionTypesUsed.coding || actionHistory.ask_coding_question || 0;
  const behavioralAsked = questionTypesUsed.behavioural || questionTypesUsed.behavioral || actionHistory.ask_behavioral || 0;
  const resumeAsked = actionHistory.ask_resume_question || 0;
  const debuggingAsked = actionHistory.ask_debugging_question || 0;
  const systemDesignAsked = actionHistory.ask_system_design || 0;
  const sqlAsked = actionHistory.ask_sql_query || 0;
  const averageScore = questionFeedbacks.length ? Math.round(questionFeedbacks.reduce((sum, item) => sum + (item.score || 0), 0) / questionFeedbacks.length) : 0;
  const elapsedMinutes = interview.startedAt ? Math.max(0, Math.round((Date.now() - new Date(interview.startedAt).getTime()) / 60000)) : 0;
  const remainingMinutes = Math.max(0, (interview.duration || 30) - elapsedMinutes);

  return {
    role,
    roleDomain: roleForTopic(interview.topic || user.targetRole || role),
    interviewType: interview.type || "text",
    topic: interview.topic || user.targetRole || "general",
    difficulty: interview.difficulty || "medium",
    duration: interview.duration || 30,
    schedule,
    elapsedMinutes,
    remainingMinutes,
    questionsAsked: questionFeedbacks.length,
    followUpCount,
    topicHistory,
    topicCoverage,
    questionTypesUsed,
    actionHistory,
    lastQuestion: getLastAiMessage(messages),
    lastAnswer: getLastUserMessage(messages),
    weakTopics: [...new Set(questionFeedbacks.flatMap((item) => item.missingConcepts || []).filter(Boolean))],
    strongTopics: [...new Set(questionFeedbacks.flatMap((item) => item.strengths || []).filter(Boolean))],
    resumeDiscussed: resumeAsked > 0,
    codingAsked: codingAsked > 0,
    behavioralAsked: behavioralAsked > 0,
    debuggingAsked: debuggingAsked > 0,
    systemDesignAsked: systemDesignAsked > 0,
    sqlAsked: sqlAsked > 0,
    averageScore,
    confidence: averageScore >= 8 ? "high" : averageScore >= 5 ? "medium" : "low",
    resumeText,
    candidateProfile: {
      name: user.name || "",
      targetRole: user.targetRole || "",
      experience: user.experience || "",
      techStack: user.techStack || [],
      targetCompanies: user.targetCompanies || [],
    },
    topicsToAvoid: [...new Set(questionFeedbacks.map((item) => item.topic).filter(Boolean))],
  };
};

export const summarizeInterviewState = (state = {}) => ({
  role: state.role,
  topic: state.topic,
  difficulty: state.difficulty,
  questionsAsked: state.questionsAsked || 0,
  followUpCount: state.followUpCount || 0,
  elapsedMinutes: state.elapsedMinutes || 0,
  remainingMinutes: state.remainingMinutes || 0,
  codingAsked: Boolean(state.codingAsked),
  behavioralAsked: Boolean(state.behavioralAsked),
  resumeDiscussed: Boolean(state.resumeDiscussed),
  debuggingAsked: Boolean(state.debuggingAsked),
  systemDesignAsked: Boolean(state.systemDesignAsked),
  strongTopics: state.strongTopics || [],
  weakTopics: state.weakTopics || [],
  questionTypesUsed: state.questionTypesUsed || {},
  topicHistory: state.topicHistory || [],
  averageScore: state.averageScore || 0,
  confidence: state.confidence || "low",
});

export const updateInterviewState = (state = {}, evaluation = {}, turn = {}) => {
  const currentTopic = turn.topic || state.topic || evaluation.nextTopicSuggestion || "";
  const topicHistory = [...(state.topicHistory || []), currentTopic].filter(Boolean);
  const questionTypesUsed = { ...(state.questionTypesUsed || {}) };
  const actionHistory = { ...(state.actionHistory || {}) };
  const topicCoverage = { ...(state.topicCoverage || {}) };
  const topicKey = createTopicKey(currentTopic);

  if (topicKey) {
    topicCoverage[topicKey] = (topicCoverage[topicKey] || 0) + 1;
  }

  if (turn.questionType) {
    questionTypesUsed[turn.questionType] = (questionTypesUsed[turn.questionType] || 0) + 1;
  }

  if (turn.plannerAction) {
    actionHistory[turn.plannerAction] = (actionHistory[turn.plannerAction] || 0) + 1;
  }

  const weakTopics = [...new Set([...(state.weakTopics || []), ...(evaluation.missingConcepts || [])].filter(Boolean))];
  const strongTopics = [...new Set([...(state.strongTopics || []), ...(evaluation.score >= 6 ? [currentTopic] : []), ...((evaluation.strengths || []).slice(0, 3))].filter(Boolean))];
  const followUpCount = (state.followUpCount || 0) + (evaluation.followUpRequired ? 1 : 0);
  const averageScore = state.questionsAsked ? Math.round((((state.averageScore || 0) * state.questionsAsked) + (evaluation.score || 0)) / (state.questionsAsked + 1)) : (evaluation.score || 0);

  return {
    ...state,
    topic: currentTopic,
    difficulty: evaluation.nextDifficulty || turn.difficulty || state.difficulty,
    questionsAsked: (state.questionsAsked || 0) + 1,
    followUpCount,
    topicHistory,
    topicCoverage,
    questionTypesUsed,
    actionHistory,
    weakTopics,
    strongTopics,
    codingAsked: Boolean(state.codingAsked || turn.questionType === "coding" || turn.plannerAction === "ask_coding_question"),
    behavioralAsked: Boolean(state.behavioralAsked || turn.questionType === "behavioral" || turn.plannerAction === "ask_behavioral"),
    resumeDiscussed: Boolean(state.resumeDiscussed || turn.plannerAction === "ask_resume_question"),
    debuggingAsked: Boolean(state.debuggingAsked || turn.plannerAction === "ask_debugging_question"),
    systemDesignAsked: Boolean(state.systemDesignAsked || turn.plannerAction === "ask_system_design"),
    elapsedMinutes: state.elapsedMinutes || 0,
    remainingMinutes: state.remainingMinutes || 0,
    averageScore,
    confidence: averageScore >= 8 ? "high" : averageScore >= 5 ? "medium" : "low",
    lastEvaluation: evaluation,
    lastPlannerAction: turn.plannerAction || state.lastPlannerAction || "ask_conceptual_question",
    lastQuestionType: turn.questionType || state.lastQuestionType || "conceptual",
  };
};