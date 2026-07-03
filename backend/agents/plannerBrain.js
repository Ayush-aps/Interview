import { buildInterviewState, summarizeInterviewState } from "./interviewState.js";
import { chooseNextTopic, getInterviewSchedule, getRoleDomain, getRoleProjectPrompts, getRoleTopicPool, isProjectTopic, normalizeRole, roleForTopic, createTopicKey } from "./interviewDomains.js";

const hasResumeSignal = (resumeContext = {}, candidateProfile = {}) => Boolean(resumeContext?.resumeText || resumeContext?.resumeUrl || (candidateProfile?.experience && String(candidateProfile.experience).trim()) || (candidateProfile?.techStack || []).length);

const inferResumeTopic = (resumeContext = {}, candidateProfile = {}) => {
  const blob = `${resumeContext?.resumeText || ""} ${candidateProfile?.techStack?.join(" ") || ""} ${candidateProfile?.experience || ""}`.toLowerCase();
  if (/(react|frontend|ui|css|html|browser|accessibility)/.test(blob)) return "frontend";
  if (/(node|express|api|backend|rest|jwt|mongo|redis|queue)/.test(blob)) return "backend";
  if (/(java|spring|hibernate|jvm|thread|concurr)/.test(blob)) return "java";
  if (/(python|pandas|numpy|async|decorator|generator)/.test(blob)) return "python";
  if (/(sql|query|joins|database|index|warehouse)/.test(blob)) return "sql";
  if (/(ml|machine learning|model|classification|regression|transformer|embedding)/.test(blob)) return "machine-learning";
  if (/(data science|statistics|probability|eda|feature engineering|visualization)/.test(blob)) return "data-science";
  return "general";
};

const decideFollowUp = (state, schedule) => {
  const lastEvaluation = state.lastEvaluation || {};
  const lowScore = (lastEvaluation.score || state.averageScore || 0) < 6;
  const recentWeakness = (lastEvaluation.followUpRequired || false) || lowScore;
  return recentWeakness && (state.followUpCount || 0) < (schedule.maxFollowUps || 2);
};

const deriveCodingNeeded = (state, schedule, interviewType) => {
  if (interviewType === "coding") return true;
  if (interviewType === "mixed" && !state.codingAsked && state.questionsAsked >= Math.max(3, Math.floor((schedule.conceptual || 6) / 2))) return true;
  if (!state.codingAsked && state.questionsAsked >= (schedule.conceptual || 6)) return true;
  return false;
};

const deriveSystemDesignNeeded = (state, schedule, interviewType) => {
  if (state.systemDesignAsked) return false;
  if ((interviewType || "text") === "coding") return false;
  return (schedule.systemDesign || 0) > 0 && state.questionsAsked >= Math.max(6, (schedule.conceptual || 6));
};

const deriveDebuggingNeeded = (state, schedule) => {
  if (state.debuggingAsked) return false;
  return (schedule.debugging || 0) > 0 && (state.weakTopics || []).length > 0 && state.questionsAsked >= 4;
};

const deriveBehavioralNeeded = (state, schedule) => {
  if (state.behavioralAsked) return false;
  return (schedule.behavioral || 0) > 0 && state.questionsAsked >= Math.max(2, Math.floor((schedule.conceptual || 6) / 2));
};

const buildPlannerDecision = ({ state, interviewType, difficulty, candidateProfile, resumeContext, roadmap }) => {
  const role = normalizeRole(candidateProfile?.targetRole || state.role || state.topic || interviewType || "general");
  const schedule = getInterviewSchedule(state.duration || 30);
  const resumeAvailable = hasResumeSignal(resumeContext, candidateProfile);
  const resumeTopic = inferResumeTopic(resumeContext, candidateProfile);
  const questionsAsked = state.questionsAsked || 0;
  const topicHistory = state.topicHistory || [];
  const coveredTopics = topicHistory.map((topic) => topic || state.topic || "");
  const weakTopics = state.weakTopics || [];
  const strongTopics = state.strongTopics || [];
  const remainingMinutes = state.remainingMinutes ?? Math.max(0, (state.duration || 30) - (state.elapsedMinutes || 0));
  const followUpCount = state.followUpCount || 0;
  const lastEvaluation = state.lastEvaluation || {};
  const maxFollowUps = schedule.maxFollowUps || 2;
  const topicPool = getRoleTopicPool(role);
  const targetQuestions = Math.max(4, schedule.resume + schedule.conceptual + schedule.coding + schedule.debugging + schedule.systemDesign + schedule.behavioral);

  if (questionsAsked >= targetQuestions || (remainingMinutes <= 1 && questionsAsked > 0)) {
    return {
      nextAction: "finish_interview",
      topic: state.topic || candidateProfile?.targetRole || "general",
      difficulty,
      reason: "Question budget or time budget has been reached.",
      shouldUseCoding: false,
      focusArea: state.topic || candidateProfile?.targetRole || "general",
      followUpRequired: false,
      questionType: "follow_up",
    };
  }

  if ((state.averageScore || 0) >= 8 && remainingMinutes <= 3) {
    return {
      nextAction: "finish_interview",
      topic: state.topic || candidateProfile?.targetRole || "general",
      difficulty,
      reason: "Candidate is strong and time is nearly up.",
      shouldUseCoding: false,
      focusArea: state.topic || candidateProfile?.targetRole || "general",
      followUpRequired: false,
      questionType: "follow_up",
    };
  }

  if (resumeAvailable && !state.resumeDiscussed && questionsAsked < 3) {
    return {
      nextAction: "ask_resume_question",
      topic: resumeTopic || role,
      difficulty,
      reason: "Resume exists and should be discussed early.",
      shouldUseCoding: false,
      focusArea: resumeTopic || role,
      followUpRequired: false,
      questionType: "resume",
    };
  }

  if (decideFollowUp(state, schedule) && questionsAsked > 0) {
    const followTopic = weakTopics[0] || state.topic || roadmap?.[0] || chooseNextTopic({ role, weakTopics, strongTopics, coveredTopics, preferredTopics: roadmap });
    return {
      nextAction: "ask_follow_up",
      topic: followTopic,
      difficulty: lastEvaluation.nextDifficulty || difficulty,
      reason: "Candidate needs one focused follow-up before moving on.",
      shouldUseCoding: false,
      focusArea: followTopic,
      followUpRequired: true,
      questionType: "follow_up",
    };
  }

  if (deriveCodingNeeded(state, schedule, interviewType)) {
    const codingTopic = chooseNextTopic({ role, weakTopics, strongTopics, coveredTopics, preferredTopics: roadmap.length ? roadmap : topicPool });
    return {
      nextAction: "ask_coding_question",
      topic: codingTopic,
      difficulty: state.averageScore >= 8 ? "hard" : difficulty,
      reason: "Coding coverage is due based on the interview plan.",
      shouldUseCoding: true,
      focusArea: codingTopic,
      followUpRequired: false,
      questionType: "coding",
    };
  }

  if (deriveSystemDesignNeeded(state, schedule, interviewType)) {
    const designTopic = role === "backend" ? "System Design" : role === "frontend" ? "Frontend Architecture" : "System Design";
    return {
      nextAction: "ask_system_design",
      topic: designTopic,
      difficulty: "hard",
      reason: "System design coverage is due for this interview length.",
      shouldUseCoding: false,
      focusArea: designTopic,
      followUpRequired: false,
      questionType: "system_design",
    };
  }

  if (deriveDebuggingNeeded(state, schedule)) {
    const debugTopic = weakTopics[0] || chooseNextTopic({ role, weakTopics, strongTopics, coveredTopics, preferredTopics: roadmap });
    return {
      nextAction: "ask_debugging_question",
      topic: debugTopic,
      difficulty: difficulty === "easy" ? "medium" : difficulty,
      reason: "A debugging-style check helps validate weak areas.",
      shouldUseCoding: true,
      focusArea: debugTopic,
      followUpRequired: false,
      questionType: "debugging",
    };
  }

  if (deriveBehavioralNeeded(state, schedule)) {
    return {
      nextAction: "ask_behavioral",
      topic: "behavioral",
      difficulty,
      reason: "Behavioral coverage should be included in a balanced interview.",
      shouldUseCoding: false,
      focusArea: "behavioral",
      followUpRequired: false,
      questionType: "behavioral",
    };
  }

  const nextTopic = chooseNextTopic({ role, weakTopics, strongTopics, coveredTopics, resumeTopics: resumeAvailable ? [resumeTopic] : [], preferredTopics: roadmap.length ? roadmap : topicPool });
  const nextRole = roleForTopic(nextTopic);
  const normalizedNextRole = normalizeRole(nextRole);
  const questionType = normalizedNextRole === "sql" ? "sql_query" : "conceptual";
  const shouldUseCoding = interviewType === "coding" || (interviewType === "mixed" && questionsAsked >= Math.max(4, (schedule.conceptual || 6) - 1));

  return {
    nextAction: shouldUseCoding ? "ask_coding_question" : (normalizedNextRole === "sql" ? "ask_sql_query" : "ask_conceptual_question"),
    topic: nextTopic,
    difficulty: lastEvaluation.nextDifficulty || difficulty,
    reason: "Advance to the next uncovered role-relevant topic.",
    shouldUseCoding,
    focusArea: nextTopic,
    followUpRequired: false,
    questionType,
  };
};

export const planNextStep = ({ interviewType = "text", difficulty = "medium", candidateProfile = {}, resumeContext = {}, roadmap = [], state = {} }) => {
  const normalizedState = state?.questionsAsked !== undefined ? state : buildInterviewState({
    interview: { topic: state.topic || candidateProfile?.targetRole || "general", type: interviewType, difficulty, duration: state.duration || 30, messages: [], questionFeedbacks: [] },
    user: candidateProfile,
    resumeText: resumeContext?.resumeText || "",
  });

  const plannerDecision = buildPlannerDecision({
    state: normalizedState,
    interviewType,
    difficulty,
    candidateProfile,
    resumeContext,
    roadmap,
  });

  return {
    ...plannerDecision,
    plannerState: summarizeInterviewState(normalizedState),
  };
};