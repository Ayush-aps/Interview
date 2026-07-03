import axios from "axios";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import { extractText } from "unpdf";
import { buildInterviewMemory, summarizeMemory, updateMemoryAfterEvaluation } from "../agents/memoryEngine.js";
import { planNextStep } from "../agents/plannerBrain.js";
import { generateQuestion } from "../agents/questionOrchestrator.js";
import { evaluateAnswer } from "../agents/evaluationEngine.js";
import { generateCodingQuestion } from "../agents/codingEngine.js";
import { generateInterviewReport } from "../agents/reportEngine.js";
import { getRoleDomain, getRoleTopicPool, normalizeRole, chooseNextTopic, getInterviewSchedule } from "../agents/interviewDomains.js";
import cloudinary from "../utils/cloudinary.js";

const defaultRoadmap = (topic = "general") => getRoleTopicPool(normalizeRole(topic)).slice(0, 8);

const extractResumeText = async (resumeUrl) => {
  if (!resumeUrl) return "";

  try {
    const response = await axios.get(resumeUrl, { responseType: "arraybuffer" });
    const buffer = new Uint8Array(response.data);
    const parsedData = await extractText(buffer);

    if (typeof parsedData === "string") return parsedData;
    if (parsedData && typeof parsedData.text === "string") return parsedData.text;
    if (parsedData && Array.isArray(parsedData.text)) return parsedData.text.join(" ");
    return String(parsedData || "");
  } catch (error) {
    console.error("[Agent Service] Could not parse resume PDF:", error.message);
    return "";
  }
};

const evaluateInterviewScore = (questionFeedbacks) => {
  if (!questionFeedbacks.length) return 0;

  return Math.round(
    (questionFeedbacks.reduce((sum, feedback) => sum + (feedback.score || 0), 0) / (questionFeedbacks.length * 10)) * 100
  );
};

const interviewPersonality = (user) => {
  const role = (user?.targetRole || "").toLowerCase();
  if (role.includes("backend")) return "Microsoft";
  if (role.includes("frontend")) return "Google";
  if (role.includes("data")) return "Friendly";
  return "Meta";
};

const fallbackRoadmapQuestion = (topic, difficulty, previousAnswer = "", role = "general") => {
  const baseTopic = (topic || "the topic").toString();
  const answerHint = previousAnswer.trim().length < 60 ? " Can you be more specific?" : "";
  const domain = getRoleDomain(role);

  if (difficulty === "hard") {
    return `Explain a hard ${domain.displayName.toLowerCase()} concept around ${baseTopic} and how you would apply it in a real system.${answerHint}`;
  }

  if (difficulty === "easy") {
    return `Can you explain ${baseTopic} in simple terms and give one practical example from ${domain.displayName.toLowerCase()}?${answerHint}`;
  }

  return `How would you approach ${baseTopic}, and what trade-offs would you consider in this ${domain.displayName.toLowerCase()} interview?${answerHint}`;
};

const buildOpeningMessage = ({ user, topic, difficulty, firstQuestion }) => {
  const name = user?.name ? `, ${user.name}` : "";
  const role = topic || user?.targetRole || "this role";
  const level = (difficulty || "medium").toLowerCase();

  return [
    `Hi${name}. I'm your interviewer today.`,
    `We'll keep this focused on ${role} and I'll adapt the difficulty as we go.`,
    `To start on a ${level} level, ${firstQuestion}`,
  ].join(" ");
};

const buildOpeningQuestion = ({ role, topic, resumeSkills = [], roadmap = [] }) => {
  const normalizedRole = normalizeRole(role || topic || "general");
  const roadmapFocus = roadmap[0] || topic || "the basics";
  const topSkill = Array.isArray(resumeSkills) && resumeSkills.length ? resumeSkills[0] : "your recent work";

  if (normalizedRole === "backend") {
    return `can you walk me through a backend API or Node.js project you built, and explain one design trade-off you made?`;
  }

  if (normalizedRole === "frontend") {
    return `can you walk me through how you would structure a simple page using ${roadmapFocus} and what you would think about first?`;
  }

  if (normalizedRole === "fullstack") {
    return `can you walk me through a fullstack project you built end-to-end, including one frontend decision and one backend trade-off you made?`;
  }

  if (normalizedRole === "java") {
    return `can you walk me through a Java project you built and the design choices you had to make?`;
  }

  if (normalizedRole === "python") {
    return `can you walk me through a Python project you built and how you kept it maintainable?`;
  }

  if (normalizedRole === "sql") {
    return `can you walk me through a project where SQL was important and how you used it to solve the problem?`;
  }

  if (normalizedRole === "machine-learning") {
    return `can you walk me through an ML project you worked on and how you evaluated it?`;
  }

  if (normalizedRole === "data-science") {
    return `can you walk me through a data science project you worked on and how you validated the result?`;
  }

  return `can you walk me through a project where you used ${topSkill} and what you learned from it?`;
};

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
    timeComplexity: codeSubmitted.trim() ? "O(n)" : "",
    spaceComplexity: codeSubmitted.trim() ? "O(1)" : "",
  };
};

const fallbackPlan = ({ topic, difficulty, interviewType, state, role = "general" }) => {
  const schedule = getInterviewSchedule(state?.duration || 30);
  const coveredTopics = state?.topicHistory || [];
  const weakTopics = state?.weakTopics || [];
  const strongTopics = state?.strongTopics || [];
  const nextTopic = chooseNextTopic({ role: role || state?.role || topic, weakTopics, strongTopics, coveredTopics, preferredTopics: defaultRoadmap(topic) });

  if ((interviewType || "text") === "coding" || (interviewType === "mixed" && (state?.questionsAsked || 0) >= Math.max(3, Math.floor((schedule.conceptual || 6) / 2)))) {
    return {
      nextAction: "ask_coding_question",
      topic: nextTopic,
      difficulty,
      reason: "offline fallback planning for coding coverage",
      shouldUseCoding: true,
      focusArea: nextTopic,
      followUpRequired: false,
      questionType: "coding",
    };
  }

  if (weakTopics[0]) {
    return {
      nextAction: "ask_follow_up",
      topic: weakTopics[0],
      difficulty: difficulty === "hard" ? "medium" : difficulty,
      reason: "offline fallback follow-up on weak topic",
      shouldUseCoding: false,
      focusArea: weakTopics[0],
      followUpRequired: true,
      questionType: "follow_up",
    };
  }

  return {
    nextAction: "ask_conceptual_question",
    topic: nextTopic,
    difficulty,
    reason: "offline fallback roadmap step",
    shouldUseCoding: false,
    focusArea: nextTopic,
    followUpRequired: false,
    questionType: "conceptual",
  };
};

const fallbackReport = ({ topic, totalScore, questionFeedbacks }) => {
  const weakTopics = questionFeedbacks.filter((item) => item.score < 6).map((item) => item.question).slice(0, 5);
  const strongTopics = questionFeedbacks.filter((item) => item.score >= 6).map((item) => item.question).slice(0, 5);
  const nextInterviewTopic = weakTopics[0] || topic || "core fundamentals";

  return {
    performanceSummary: `Offline fallback report for ${topic}. The candidate completed the session with a score of ${totalScore}/100.`,
    toneFeedback: "Communication was evaluated with a deterministic fallback because the AI service was rate-limited.",
    strongTopics,
    weakTopics,
    studyPlan: [
      {
        topic: nextInterviewTopic,
        whatToStudy: `Review ${nextInterviewTopic} and practice explaining it with examples.`,
        priority: "high",
      },
    ],
    nextInterviewTopic,
    estimatedReadiness: totalScore >= 75 ? "Ready for advanced rounds" : totalScore >= 60 ? "Close to ready" : "Needs more preparation",
    topicWiseScore: {
      conceptual: Math.min(10, Math.max(1, Math.round(totalScore / 12))),
      coding: Math.min(10, Math.max(1, Math.round(totalScore / 12))),
      communication: Math.min(10, Math.max(1, Math.round(totalScore / 14))),
      complexity: Math.min(10, Math.max(1, Math.round(totalScore / 13))),
      confidence: Math.min(10, Math.max(1, Math.round(totalScore / 14))),
    },
  };
};

export const startAgenticInterview = async ({ userId, topic, roleCategory, selectedRole, difficulty, type, resumeUrl, duration }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const resumeText = await extractResumeText(resumeUrl);
  const candidateProfile = {
    name: user.name,
    targetRole: user.targetRole,
    experience: user.experience,
    techStack: user.techStack,
    targetCompanies: user.targetCompanies,
  };

  const interviewRole = normalizeRole(roleCategory || selectedRole || user.targetRole || topic);
  const interviewTopic = topic || interviewRole;

  const roadmap = defaultRoadmap(interviewRole);
  const memory = buildInterviewMemory({
    interview: { topic: interviewTopic, type, difficulty, duration, status: "ongoing", messages: [], questionFeedbacks: [], agentState: { role: interviewRole } },
    user,
    resumeData: resumeText,
  });

  const personality = interviewPersonality(user);
  let plan;
  let questionPayload;

  try {
    plan = await planNextStep({
      interviewType: type || "text",
      difficulty: difficulty || "medium",
      candidateProfile,
      resumeContext: { resumeText, resumeUrl },
      roadmap,
      state: { ...memory, role: interviewRole, topic: interviewTopic },
    });

    const shouldCode = (type === "coding") || plan.nextAction === "ask_coding_question" || plan.nextAction === "start_coding_round";
    questionPayload = shouldCode
      ? await generateCodingQuestion({ topic: plan.focusArea || interviewTopic, difficulty: plan.difficulty || difficulty || "medium", weakTopics: memory.weakTopics, resumeSkills: user.techStack, personality, role: interviewRole, interviewState: memory, plannerDecision: plan })
      : await generateQuestion({ topic: plan.focusArea || interviewTopic, difficulty: plan.difficulty || difficulty || "medium", previousAnswer: "", weakTopics: memory.weakTopics, resumeSkills: user.techStack, roadmap, personality, questionType: plan.questionType || "opening", role: interviewRole, interviewState: memory, lastQuestion: "", topicPool: getRoleTopicPool(interviewRole) });
  } catch (error) {
    plan = fallbackPlan({ topic: interviewTopic, difficulty: difficulty || "medium", interviewType: type || "text", state: memory, role: interviewRole });
    questionPayload = {
      question: fallbackRoadmapQuestion(plan.focusArea || interviewTopic, plan.difficulty || difficulty || "medium", "", interviewRole),
      topic: plan.focusArea || interviewTopic,
      difficulty: plan.difficulty || difficulty || "medium",
      questionType: plan.questionType || (plan.nextAction === "ask_followup_question" ? "follow_up" : "conceptual"),
      expectedSignals: [],
      shouldRemember: [],
    };
  }

  const openingQuestion = buildOpeningQuestion({
    role: interviewRole,
    topic: interviewTopic,
    resumeSkills: user.techStack,
    roadmap,
  });
  const firstMessage = buildOpeningMessage({
    user,
    topic: interviewRole,
    difficulty: plan.difficulty || difficulty || "medium",
    firstQuestion: openingQuestion,
  });

  const interview = await Interview.create({
    userId,
    topic,
    type: type || "text",
    difficulty: difficulty || "medium",
    duration: duration || 30,
    status: "ongoing",
    messages: [{ role: "ai", content: firstMessage }],
    questionFeedbacks: [],
    agentState: memory,
  });

  return {
    interview,
    aiMessage: firstMessage,
    plan,
    memory,
    personality,
  };
};

export const processAgenticAnswer = async ({ interviewId, userId, userMessage, codeSubmitted = "", languageUsed = "javascript" }) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  if (interview.userId.toString() !== userId) {
    const error = new Error("Not allowed");
    error.statusCode = 403;
    throw error;
  }

  if (interview.status !== "ongoing") {
    const error = new Error("Interview is already completed or abandoned");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  const question = interview.messages[interview.messages.length - 1]?.content || "";
  const answerText = userMessage || "";

  interview.messages.push({
    role: "user",
    content: codeSubmitted ? `${answerText}\n\n[CANDIDATE CODE - ${languageUsed}]:\n${codeSubmitted}` : answerText,
  });

  const candidateProfile = {
    name: user?.name || "",
    targetRole: user?.targetRole || "fullstack",
    experience: user?.experience || "",
    techStack: user?.techStack || [],
  };

  const answeredTopic = interview.agentState?.lastPlannedTopic || interview.topic;

  let evaluation;
  let plannerDecision;
  let nextQuestionPayload;

  try {
    evaluation = await evaluateAnswer({
      topic: interview.topic,
      question,
      answer: answerText,
      codeSubmitted,
      languageUsed,
      candidateProfile,
      rubric: {
        correctness: "0-4",
        depth: "0-3",
        communication: "0-2",
        confidence: "0-1",
      },
      personality: interviewPersonality(user),
      plannerDecision: {},
      interviewState: buildInterviewMemory({ interview, user }),
    });

    const memory = updateMemoryAfterEvaluation(buildInterviewMemory({ interview, user }), evaluation, {
      question,
      answer: answerText,
      hintsUsed: evaluation.missingConcepts || [],
      questionType: interview.agentState?.lastQuestionType || (evaluation.followUpRequired ? "follow_up" : interview.type === "coding" ? "coding" : "conceptual"),
      plannerAction: interview.agentState?.lastPlannerAction || (evaluation.followUpRequired ? "ask_follow_up" : "continue_current_topic"),
      topic: answeredTopic,
      difficulty: plannerDecision?.difficulty || interview.difficulty,
    });

    interview.agentState = memory;

    plannerDecision = await planNextStep({
      interviewType: interview.type,
      difficulty: evaluation.nextDifficulty || interview.difficulty,
      candidateProfile,
      resumeContext: { resumeSkills: user?.techStack || [] },
      roadmap: defaultRoadmap(interview.topic),
      state: memory,
    });

    nextQuestionPayload = plannerDecision.nextAction === "ask_coding_question" || plannerDecision.nextAction === "start_coding_round"
      ? await generateCodingQuestion({ topic: plannerDecision.focusArea || interview.topic, difficulty: plannerDecision.difficulty || interview.difficulty, weakTopics: memory.weakTopics, resumeSkills: user?.techStack || [], personality: interviewPersonality(user), role: user?.targetRole || interview.topic, interviewState: memory, plannerDecision })
      : await generateQuestion({
          topic: plannerDecision.focusArea || interview.topic,
          difficulty: plannerDecision.difficulty || interview.difficulty,
          previousAnswer: answerText,
          weakTopics: memory.weakTopics,
          resumeSkills: user?.techStack || [],
          roadmap: defaultRoadmap(interview.topic),
          personality: interviewPersonality(user),
        questionType: plannerDecision.questionType || (plannerDecision.nextAction === "ask_followup_question" ? "follow_up" : plannerDecision.nextAction === "ask_behavioural_question" ? "behavioral" : "conceptual"),
        role: user?.targetRole || interview.topic,
        interviewState: memory,
        lastQuestion: question,
        topicPool: getRoleTopicPool(normalizeRole(user?.targetRole || interview.topic)),
        });

          memory.lastPlannerAction = plannerDecision.nextAction || memory.lastPlannerAction;
          memory.lastQuestionType = nextQuestionPayload.questionType || memory.lastQuestionType;
  } catch (error) {
    evaluation = fallbackEvaluation({
      topic: interview.topic,
      answer: answerText,
      codeSubmitted,
      languageUsed,
    });

    const memory = updateMemoryAfterEvaluation(buildInterviewMemory({ interview, user }), evaluation, {
      question,
      answer: answerText,
      hintsUsed: evaluation.missingConcepts || [],
      questionType: interview.agentState?.lastQuestionType || (evaluation.followUpRequired ? "follow_up" : interview.type === "coding" ? "coding" : "conceptual"),
      plannerAction: interview.agentState?.lastPlannerAction || (evaluation.followUpRequired ? "ask_follow_up" : "continue_current_topic"),
      topic: answeredTopic,
      difficulty: plannerDecision?.difficulty || interview.difficulty,
    });

    interview.agentState = memory;

    plannerDecision = fallbackPlan({
      topic: interview.topic,
      difficulty: evaluation.nextDifficulty || interview.difficulty,
      interviewType: interview.type,
      state: memory,
    });

    nextQuestionPayload = {
      question: fallbackRoadmapQuestion(plannerDecision.focusArea || interview.topic, plannerDecision.difficulty || interview.difficulty, answerText, user?.targetRole || interview.topic),
      topic: plannerDecision.focusArea || interview.topic,
      difficulty: plannerDecision.difficulty || interview.difficulty,
      questionType: plannerDecision.questionType || (plannerDecision.nextAction === "ask_followup_question" ? "follow_up" : "conceptual"),
      expectedSignals: [],
      shouldRemember: [],
    };

    memory.lastPlannerAction = plannerDecision.nextAction || memory.lastPlannerAction;
    memory.lastQuestionType = nextQuestionPayload.questionType || memory.lastQuestionType;
    memory.lastPlannedTopic = nextQuestionPayload.topic || plannerDecision.focusArea || interview.topic;
    memory.lastPlannedTopic = nextQuestionPayload.topic || plannerDecision.focusArea || interview.topic;
  }

  const aiResponse = nextQuestionPayload.question || "Can you elaborate a bit more?";

  interview.questionFeedbacks.push({
    question,
    topic: answeredTopic,
    questionType: interview.agentState?.lastQuestionType || plannerDecision.questionType || nextQuestionPayload.questionType || "conceptual",
    plannerAction: interview.agentState?.lastPlannerAction || plannerDecision.nextAction || "ask_conceptual_question",
    difficultyBefore: interview.difficulty,
    difficultyAfter: evaluation.nextDifficulty || interview.difficulty,
    userAnswer: answerText,
    codeSubmitted: codeSubmitted || "",
    languageUsed: languageUsed || "javascript",
    timeComplexity: evaluation.timeComplexity || "",
    spaceComplexity: evaluation.spaceComplexity || "",
    aiFeedback: evaluation.correctness || "",
    score: evaluation.score || 0,
  });

  interview.messages.push({
    role: "ai",
    content: aiResponse,
  });

  await interview.save();

  return {
    interview,
    aiMessage: aiResponse,
    evaluation,
    plannerDecision,
  };
};

export const finalizeAgenticInterview = async ({ interviewId, userId }) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  if (interview.userId.toString() !== userId) {
    const error = new Error("Not allowed");
    error.statusCode = 403;
    throw error;
  }

  const user = await User.findById(userId);
  const totalScore = evaluateInterviewScore(interview.questionFeedbacks);
  const memory = buildInterviewMemory({ interview, user });
  const conversation = interview.messages
    .map((msg) => `${msg.role === "ai" ? "Interviewer" : "Candidate"}: ${msg.content}`)
    .join("\n\n");

  let report;
  try {
    report = await generateInterviewReport({
      topic: interview.topic,
      difficulty: interview.difficulty,
      totalScore,
      conversation,
      questionFeedbacks: interview.questionFeedbacks,
      candidateProfile: memory.candidateProfile,
      memorySummary: summarizeMemory(memory),
      personality: interviewPersonality(user),
      plannerSummary: summarizeMemory(memory),
      roleCoverageSummary: {
        role: memory.role,
        questionsAsked: memory.questionsAsked,
        followUpCount: memory.followUpCount,
        topicHistory: memory.topicHistory,
        topicCoverage: memory.topicCoverage,
        strongTopics: memory.strongTopics,
        weakTopics: memory.weakTopics,
        resumeDiscussed: memory.resumeDiscussed,
        codingAsked: memory.codingAsked,
        behavioralAsked: memory.behavioralAsked,
        debuggingAsked: memory.debuggingAsked,
        systemDesignAsked: memory.systemDesignAsked,
      },
    });
  } catch (error) {
    report = fallbackReport({
      topic: interview.topic,
      totalScore,
      questionFeedbacks: interview.questionFeedbacks,
    });
  }

  interview.status = "completed";
  interview.totalScore = totalScore;
  interview.completedAt = new Date();
  interview.messages.push({
    role: "ai",
    content: report.performanceSummary || "Interview completed successfully.",
  });

  await interview.save();

  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalInterviews: 1,
      totalScore,
    },
    lastActiveDate: new Date(),
  });

  return {
    interview,
    totalScore,
    report,
  };
};

export const compileWithJdoodle = async ({ sourceCode, languageId, jdoodleClientId, jdoodleClientSecret }) => {
  const languageMap = {
    63: { language: "nodejs", versionIndex: "4" },
    71: { language: "python3", versionIndex: "4" },
    62: { language: "java", versionIndex: "4" },
    54: { language: "cpp", versionIndex: "5" },
  };

  const numericId = parseInt(languageId) || 63;
  const selectedLang = languageMap[numericId] || languageMap[63];

  const response = await axios.post("https://api.jdoodle.com/v1/execute", {
    clientId: jdoodleClientId,
    clientSecret: jdoodleClientSecret,
    script: sourceCode || "",
    language: selectedLang.language,
    versionIndex: selectedLang.versionIndex,
  });

  return response.data.output || "Execution completed with no output.";
};