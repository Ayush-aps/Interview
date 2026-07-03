const ROLE_LIBRARY = {
  frontend: {
    label: "Frontend",
    forbiddenTopics: ["Node", "Express", "MongoDB", "Redis", "Hibernate", "Spring Boot", "GIL", "JOIN", "Regression", "Classification"],
    coreTopics: ["HTML", "CSS", "Flexbox", "Grid", "JavaScript", "ES6", "Closures", "Event Loop"],
    advancedTopics: ["React", "Hooks", "Context API", "Redux", "Performance", "Browser Rendering", "Accessibility"],
    codingTopics: ["DOM Manipulation", "State Management", "Data Transformation", "Async UI Flow"],
    debuggingTopics: ["Rendering Bug", "State Bug", "Performance Regression"],
    designTopics: ["Component Design", "Frontend Architecture"],
    behavioralTopics: ["Ownership", "Collaboration"],
    resumeTopics: ["Projects", "React Project", "UI Delivery"],
  },
  backend: {
    label: "Backend",
    forbiddenTopics: ["React", "Hooks", "Context API", "Redux", "Browser Rendering", "Flexbox", "Grid"],
    coreTopics: ["Node.js", "Express", "REST", "Authentication", "JWT", "Cookies", "MongoDB", "SQL"],
    advancedTopics: ["Caching", "Redis", "Queues", "Rate Limiting", "Security", "Transactions"],
    codingTopics: ["API Design", "Data Modeling", "Concurrency", "Error Handling"],
    debuggingTopics: ["Latency Bug", "Auth Bug", "DB Bug"],
    designTopics: ["System Design", "Scalability", "Service Boundaries"],
    behavioralTopics: ["Ownership", "Incident Handling"],
    resumeTopics: ["Projects", "API Design", "Authentication"],
  },
  java: {
    label: "Java",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering"],
    coreTopics: ["OOP", "Collections", "Streams", "Threads", "Synchronization", "JVM", "Garbage Collection"],
    advancedTopics: ["Spring Boot", "Hibernate", "Design Patterns", "Concurrency", "Memory Management"],
    codingTopics: ["Collections Problem", "Thread Safety", "OOD", "Algorithmic Implementation"],
    debuggingTopics: ["Deadlock", "Race Condition", "GC Pressure"],
    designTopics: ["System Design", "Service Design"],
    behavioralTopics: ["Ownership", "Code Quality"],
    resumeTopics: ["Projects", "Java Service", "Backend Work"],
  },
  python: {
    label: "Python",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering"],
    coreTopics: ["Data Structures", "Generators", "Decorators", "Async", "GIL", "OOP", "Packages", "Virtual Environments"],
    advancedTopics: ["Testing", "Concurrency", "Profiling", "Performance"],
    codingTopics: ["Python Problem", "Data Processing", "Async Task", "API Script"],
    debuggingTopics: ["Async Bug", "Packaging Bug", "Performance Bug"],
    designTopics: ["System Design", "Service Design"],
    behavioralTopics: ["Ownership", "Learning Agility"],
    resumeTopics: ["Projects", "Python Project", "Automation"],
  },
  sql: {
    label: "SQL",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering"],
    coreTopics: ["SELECT", "GROUP BY", "HAVING", "JOINs", "Indexes", "Transactions", "Isolation Levels", "Window Functions"],
    advancedTopics: ["Recursive Queries", "Query Optimization", "Execution Plans", "Normalization"],
    codingTopics: ["Query Writing", "Schema Design", "Optimization Exercise", "Analytical Query"],
    debuggingTopics: ["Slow Query", "Incorrect Join", "Index Miss"],
    designTopics: ["Data Model", "Warehouse Design"],
    behavioralTopics: ["Ownership", "Data Integrity"],
    resumeTopics: ["Projects", "SQL Project", "Analytics Work"],
  },
  machineLearning: {
    label: "Machine Learning",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering"],
    coreTopics: ["Regression", "Classification", "Bias Variance", "Cross Validation", "Feature Engineering", "Metrics"],
    advancedTopics: ["Random Forest", "XGBoost", "CNN", "RNN", "Transformers", "LLM", "Embeddings", "Vector Databases"],
    codingTopics: ["Modeling Problem", "Feature Pipeline", "Evaluation Exercise", "Python ML Task"],
    debuggingTopics: ["Overfitting", "Data Leakage", "Training Instability"],
    designTopics: ["ML System Design", "Model Serving"],
    behavioralTopics: ["Ownership", "Experiment Discipline"],
    resumeTopics: ["Projects", "ML Project", "Experimentation"],
  },
  dataScience: {
    label: "Data Science",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering"],
    coreTopics: ["Statistics", "Probability", "Pandas", "NumPy", "Visualization", "Feature Engineering", "EDA", "Data Cleaning"],
    advancedTopics: ["A/B Testing", "Inference", "Forecasting", "Experiment Design"],
    codingTopics: ["Data Analysis Task", "SQL + Python Task", "Notebook Exercise"],
    debuggingTopics: ["Data Quality Bug", "Leakage Bug", "Metric Bug"],
    designTopics: ["Analytics Pipeline", "Experiment Framework"],
    behavioralTopics: ["Ownership", "Decision Making"],
    resumeTopics: ["Projects", "Analytics Project", "Data Project"],
  },
  fullstack: {
    label: "Fullstack",
    forbiddenTopics: ["GIL", "Hibernate"],
    coreTopics: ["HTML", "CSS", "JavaScript", "Node.js", "REST", "Authentication", "MongoDB", "SQL"],
    advancedTopics: ["React", "Hooks", "Performance", "Caching", "Redis", "Queues", "System Design"],
    codingTopics: ["API + UI Flow", "State + Backend Integration", "Data Modeling", "Performance Tradeoff"],
    debuggingTopics: ["Frontend Bug", "Backend Bug", "Latency Bug"],
    designTopics: ["System Design", "Frontend Architecture", "Backend Architecture"],
    behavioralTopics: ["Ownership", "Cross Functional Collaboration"],
    resumeTopics: ["Projects", "End to End Project", "Architecture"],
  },
  general: {
    label: "General",
    forbiddenTopics: [],
    coreTopics: ["Problem Solving", "Communication", "Core Fundamentals"],
    advancedTopics: ["Tradeoffs", "Optimization", "Design Thinking"],
    codingTopics: ["Implementation Task"],
    debuggingTopics: ["Bug Investigation"],
    designTopics: ["System Thinking"],
    behavioralTopics: ["Ownership", "Collaboration"],
    resumeTopics: ["Projects"],
  },
};

const ACTIONS = [
  "ask_resume_question",
  "ask_conceptual_question",
  "ask_coding_question",
  "ask_debugging_question",
  "ask_output_prediction",
  "ask_system_design",
  "ask_behavioral",
  "ask_sql_query",
  "ask_follow_up",
  "switch_topic",
  "finish_interview",
];

export const normalizeRoleFamily = ({ targetRole = "", topic = "", roleMatch = "" } = {}) => {
  const value = `${targetRole} ${topic} ${roleMatch}`.toLowerCase();

  if (value.includes("fullstack") || (value.includes("front") && value.includes("back"))) return "fullstack";
  if (value.includes("frontend") || value.includes("react") || value.includes("ui")) return "frontend";
  if (value.includes("backend") || value.includes("server") || value.includes("api")) return "backend";
  if (value.includes("java")) return "java";
  if (value.includes("python")) return "python";
  if (value.includes("sql") || value.includes("database")) return "sql";
  if (value.includes("machine learning") || value.includes("ml") || value.includes("ai")) return "machineLearning";
  if (value.includes("data science") || value.includes("analytics") || value.includes("data")) return "dataScience";

  return "general";
};

export const getRoleLibrary = (roleFamily) => ROLE_LIBRARY[roleFamily] || ROLE_LIBRARY.general;

export const getRoleTopicPool = (roleFamily) => {
  const role = getRoleLibrary(roleFamily);
  return [
    ...role.coreTopics,
    ...role.advancedTopics,
    ...role.codingTopics,
    ...role.debuggingTopics,
    ...role.designTopics,
    ...role.behavioralTopics,
    ...role.resumeTopics,
  ];
};

export const buildBudgetPlan = ({ duration = 30, interviewType = "text", roleFamily = "general" } = {}) => {
  const time = Number(duration) || 30;
  const role = getRoleLibrary(roleFamily);
  const codingQuestions = time <= 15 ? 1 : time <= 30 ? 2 : time <= 45 ? 3 : 3;
  const debuggingQuestions = time <= 15 ? 0 : 1;
  const systemDesignQuestions = time <= 30 ? 0 : time <= 45 ? 1 : 2;
  const behavioralQuestions = 1;
  const resumeQuestions = time <= 15 ? 1 : 2;
  const maxFollowUpsPerTopic = time <= 15 ? 1 : time <= 30 ? 2 : 3;
  const maxConsecutiveFollowUps = time <= 15 ? 1 : 2;

  return {
    duration: time,
    interviewType,
    roleFamily,
    codingQuestions: interviewType === "text" && time < 20 ? Math.min(1, codingQuestions) : codingQuestions,
    debuggingQuestions,
    systemDesignQuestions,
    behavioralQuestions,
    resumeQuestions,
    maxFollowUpsPerTopic,
    maxConsecutiveFollowUps,
    introQuestions: 1,
    primaryTopicsTarget: time <= 15 ? 4 : time <= 30 ? 6 : time <= 45 ? 7 : 8,
    roleLabel: role.label,
  };
};

export const extractResumeFacts = (resume = null) => {
  const parsed = resume?.parsedData || {};
  return {
    hasResume: !!resume,
    skills: parsed.skills || [],
    projects: parsed.projects || [],
    experience: parsed.experience || [],
    education: parsed.education || {},
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    roleMatch: parsed.roleMatch || "",
    predictedQuestions: parsed.predictedQuestions || [],
    candidateSummary: parsed.candidateSummary || "",
    atsScore: parsed.atsScore || 0,
  };
};

export const buildRoleCoveragePlan = ({ roleFamily, interviewType = "text", duration = 30, resumeFacts = {}, topic = "" } = {}) => {
  const role = getRoleLibrary(roleFamily);
  const budget = buildBudgetPlan({ duration, interviewType, roleFamily });
  const plan = [];
  const addItems = (items, action, category) => {
    items.forEach((item, index) => {
      plan.push({
        topic: item,
        action,
        category,
        priority: plan.length + 1,
        required: true,
        resumeLinked: category === "resume" || category === "coding" ? true : false,
        avoidRepeating: true,
      });
    });
  };

  addItems(role.coreTopics, "ask_conceptual_question", "core");

  if (budget.resumeQuestions > 0 && resumeFacts.hasResume) {
    plan.push({
      topic: topic || role.resumeTopics[0] || role.coreTopics[0],
      action: "ask_resume_question",
      category: "resume",
      priority: plan.length + 1,
      required: false,
      resumeLinked: true,
      avoidRepeating: true,
    });
  }

  addItems(role.advancedTopics, "ask_conceptual_question", "advanced");

  role.codingTopics.slice(0, budget.codingQuestions).forEach((item) => {
    plan.push({
      topic: item,
      action: "ask_coding_question",
      category: "coding",
      priority: plan.length + 1,
      required: true,
      resumeLinked: false,
      avoidRepeating: true,
    });
  });

  role.debuggingTopics.slice(0, budget.debuggingQuestions).forEach((item) => {
    plan.push({
      topic: item,
      action: "ask_debugging_question",
      category: "debugging",
      priority: plan.length + 1,
      required: false,
      resumeLinked: false,
      avoidRepeating: true,
    });
  });

  role.designTopics.slice(0, budget.systemDesignQuestions).forEach((item) => {
    plan.push({
      topic: item,
      action: "ask_system_design",
      category: "design",
      priority: plan.length + 1,
      required: false,
      resumeLinked: false,
      avoidRepeating: true,
    });
  });

  role.behavioralTopics.slice(0, budget.behavioralQuestions).forEach((item) => {
    plan.push({
      topic: item,
      action: "ask_behavioral",
      category: "behavioral",
      priority: plan.length + 1,
      required: false,
      resumeLinked: false,
      avoidRepeating: true,
    });
  });

  return plan.slice(0, budget.primaryTopicsTarget + 4);
};

export const createInitialAgentState = ({ interview, user, resume }) => {
  const roleFamily = normalizeRoleFamily({
    targetRole: user?.targetRole || interview?.topic || "",
    topic: interview?.topic || "",
    roleMatch: resume?.parsedData?.roleMatch || "",
  });
  const resumeFacts = extractResumeFacts(resume);
  const budgets = buildBudgetPlan({ duration: interview?.duration || 30, interviewType: interview?.type || "text", roleFamily });
  const coveragePlan = buildRoleCoveragePlan({ roleFamily, interviewType: interview?.type || "text", duration: interview?.duration || 30, resumeFacts, topic: interview?.topic || "" });

  return {
    version: 1,
    phase: "opening",
    startedAt: interview?.startedAt || new Date(),
    interviewId: interview?._id?.toString() || null,
    interviewType: interview?.type || "text",
    roleFamily,
    roleLabel: budgets.roleLabel,
    targetRole: user?.targetRole || interview?.topic || "",
    topic: interview?.topic || "",
    currentTopic: interview?.topic || coveragePlan[0]?.topic || "",
    difficulty: interview?.difficulty || "medium",
    duration: interview?.duration || 30,
    elapsedMinutes: 0,
    remainingMinutes: interview?.duration || 30,
    turnNumber: 0,
    totalQuestionsAsked: interview?.questionFeedbacks?.length || 0,
    questionHistory: [],
    answerHistory: [],
    topicHistory: [],
    topicCoverage: coveragePlan.map((item) => ({
      topic: item.topic,
      askedCount: 0,
      averageScore: 0,
      strongCount: 0,
      weakCount: 0,
      lastAction: item.action,
      lastAskedAt: null,
      mastered: false,
    })),
    roleCoveragePlan: coveragePlan,
    resumeFacts,
    resumeDiscussed: false,
    resumeQuestionsUsed: 0,
    behavioralQuestionsUsed: 0,
    codingQuestionsUsed: 0,
    debuggingQuestionsUsed: 0,
    systemDesignQuestionsUsed: 0,
    followUpCountByTopic: {},
    followUpStreak: 0,
    maxFollowUpsPerTopic: budgets.maxFollowUpsPerTopic,
    maxConsecutiveFollowUps: budgets.maxConsecutiveFollowUps,
    codingBudgetTurns: budgets.codingQuestions,
    codingTurnsUsed: 0,
    behavioralBudgetTurns: budgets.behavioralQuestions,
    debugBudgetTurns: budgets.debuggingQuestions,
    systemDesignBudgetTurns: budgets.systemDesignQuestions,
    resumeBudgetTurns: budgets.resumeQuestions,
    topicsCovered: [],
    strongTopics: [],
    weakTopics: [],
    confidence: 50,
    averageResponseQuality: 0,
    lastPlannerDecision: null,
    lastAction: "opening",
    lastQuestionType: "opening",
    lastAskedQuestion: "",
    lastAskedTopic: coveragePlan[0]?.topic || interview?.topic || "",
    endReason: "",
    completed: false,
    budgets,
  };
};

export const getTopicCoverageEntry = (state, topic) => (state?.topicCoverage || []).find((item) => item.topic?.toLowerCase() === (topic || "").toLowerCase());

export const isTopicAllowed = (topic, roleFamily) => {
  const role = getRoleLibrary(roleFamily);
  const value = (topic || "").toLowerCase();
  if (!value) return false;
  return !role.forbiddenTopics.some((forbidden) => value.includes(forbidden.toLowerCase()));
};

export const getRelevantResumeTopic = (state) => {
  const facts = state?.resumeFacts || {};
  const roleFamily = state?.roleFamily || "general";
  const projects = facts.projects || [];
  const skills = facts.skills || [];

  const pickProject = (predicate) => projects.find((project) => predicate(`${project.name || ""} ${project.description || ""} ${(project.techStack || []).join(" ")}`.toLowerCase()));

  if (roleFamily === "frontend" || roleFamily === "fullstack") {
    const project = pickProject((text) => text.includes("react") || text.includes("frontend") || text.includes("ui") || text.includes("css") || text.includes("javascript")) || projects[0];
    if (project) return { topic: project.name || "your project", focus: "project", detail: project.description || "", project };
  }

  if (roleFamily === "backend") {
    const project = pickProject((text) => text.includes("api") || text.includes("auth") || text.includes("node") || text.includes("express") || text.includes("database")) || projects[0];
    if (project) return { topic: project.name || "your backend project", focus: "project", detail: project.description || "", project };
  }

  if (roleFamily === "java") {
    const project = pickProject((text) => text.includes("java") || text.includes("spring") || text.includes("hibernate")) || projects[0];
    if (project) return { topic: project.name || "your Java project", focus: "project", detail: project.description || "", project };
  }

  if (roleFamily === "python" || roleFamily === "machineLearning" || roleFamily === "dataScience") {
    const project = pickProject((text) => text.includes("python") || text.includes("ml") || text.includes("data") || text.includes("model") || text.includes("analytics")) || projects[0];
    if (project) return { topic: project.name || "your project", focus: "project", detail: project.description || "", project };
  }

  if (skills.length) {
    return { topic: skills[0], focus: "skill", detail: "", project: null };
  }

  return null;
};

export const pickNextPlannedItem = (state) => {
  const plan = state?.roleCoveragePlan || [];
  const coverage = state?.topicCoverage || [];
  const recent = new Set((state?.topicHistory || []).slice(-3).map((item) => (item || "").toLowerCase()));
  const findCoverage = (topic) => coverage.find((item) => item.topic?.toLowerCase() === topic.toLowerCase());

  const byNeed = plan
    .filter((item) => isTopicAllowed(item.topic, state?.roleFamily))
    .map((item) => {
      const coverageEntry = findCoverage(item.topic);
      return {
        ...item,
        askedCount: coverageEntry?.askedCount || 0,
        averageScore: coverageEntry?.averageScore || 0,
        mastered: !!coverageEntry?.mastered,
      };
    })
    .sort((left, right) => {
      if (left.required !== right.required) return left.required ? -1 : 1;
      if ((left.askedCount || 0) !== (right.askedCount || 0)) return (left.askedCount || 0) - (right.askedCount || 0);
      if ((left.averageScore || 0) !== (right.averageScore || 0)) return (left.averageScore || 0) - (right.averageScore || 0);
      return (left.priority || 0) - (right.priority || 0);
    });

  const candidate = byNeed.find((item) => !recent.has((item.topic || "").toLowerCase()) && !item.mastered);
  return candidate || byNeed[0] || null;
};

export const shouldForceTopicShift = (state) => {
  const currentTopic = state?.currentTopic || "";
  const followUpCount = state?.followUpCountByTopic?.[currentTopic] || 0;
  const followUpStreak = state?.followUpStreak || 0;
  return followUpCount >= (state?.maxFollowUpsPerTopic || 2) || followUpStreak >= (state?.maxConsecutiveFollowUps || 2);
};

export const normalizePlannerDecision = (decision = {}, state = {}) => {
  const allowedActions = new Set(ACTIONS);
  const roleFamily = state?.roleFamily || "general";
  const budgets = state?.budgets || buildBudgetPlan({ duration: state?.duration || 30, interviewType: state?.interviewType || "text", roleFamily });
  const fallbackItem = pickNextPlannedItem(state) || { topic: state?.topic || state?.currentTopic || "core fundamentals", action: "ask_conceptual_question" };
  const safeAction = allowedActions.has(decision?.nextAction) ? decision.nextAction : fallbackItem.action || "ask_conceptual_question";
  const safeDifficulty = ["easy", "medium", "hard"].includes(decision?.difficulty) ? decision.difficulty : state?.difficulty || "medium";
  const rawTopic = decision?.topic || decision?.focusArea || fallbackItem.topic || state?.currentTopic || state?.topic || "";

  let nextAction = safeAction;
  let topic = rawTopic;

  if (shouldForceTopicShift(state) && safeAction === "ask_follow_up") {
    nextAction = fallbackItem.action || "switch_topic";
    topic = fallbackItem.topic || topic;
  }

  if (!isTopicAllowed(topic, roleFamily)) {
    const nextAllowed = pickNextPlannedItem({ ...state, currentTopic: state?.currentTopic || topic });
    topic = nextAllowed?.topic || fallbackItem.topic || state?.topic || "general";
  }

  if (nextAction === "finish_interview") {
    return {
      nextAction,
      topic,
      difficulty: safeDifficulty,
      reason: decision?.reason || "planner finished interview",
      shouldUseCoding: false,
      followUpRequired: false,
      resumeFocus: null,
    };
  }

  if (state?.codingQuestionsUsed >= budgets.codingQuestions && nextAction === "ask_coding_question") {
    nextAction = fallbackItem.action || "switch_topic";
  }

  if (state?.resumeDiscussed && nextAction === "ask_resume_question") {
    nextAction = fallbackItem.action || "ask_conceptual_question";
  }

  return {
    nextAction,
    topic,
    difficulty: safeDifficulty,
    reason: decision?.reason || "normalized planner decision",
    shouldUseCoding: nextAction === "ask_coding_question",
    followUpRequired: nextAction === "ask_follow_up",
    resumeFocus: nextAction === "ask_resume_question" ? getRelevantResumeTopic(state) : null,
  };
};

export const summarizePlannerContext = (state = {}) => ({
  roleFamily: state.roleFamily,
  roleLabel: state.roleLabel,
  interviewType: state.interviewType,
  targetRole: state.targetRole,
  topic: state.topic,
  currentTopic: state.currentTopic,
  turnNumber: state.turnNumber,
  elapsedMinutes: state.elapsedMinutes,
  remainingMinutes: state.remainingMinutes,
  resumeDiscussed: state.resumeDiscussed,
  codingQuestionsUsed: state.codingQuestionsUsed,
  codingBudgetTurns: state.codingBudgetTurns,
  behavioralQuestionsUsed: state.behavioralQuestionsUsed,
  debugBudgetTurns: state.debugBudgetTurns,
  systemDesignBudgetTurns: state.systemDesignBudgetTurns,
  resumeBudgetTurns: state.resumeBudgetTurns,
  maxFollowUpsPerTopic: state.maxFollowUpsPerTopic,
  maxConsecutiveFollowUps: state.maxConsecutiveFollowUps,
  topicsCovered: state.topicsCovered,
  strongTopics: state.strongTopics,
  weakTopics: state.weakTopics,
  averageResponseQuality: state.averageResponseQuality,
  confidence: state.confidence,
  lastPlannerDecision: state.lastPlannerDecision,
  roleCoveragePlan: state.roleCoveragePlan,
  recentQuestions: (state.questionHistory || []).slice(-5),
  recentScores: (state.answerHistory || []).slice(-5),
  resumeFacts: {
    hasResume: state.resumeFacts?.hasResume || false,
    skills: (state.resumeFacts?.skills || []).slice(0, 8),
    projects: (state.resumeFacts?.projects || []).slice(0, 4),
    experience: (state.resumeFacts?.experience || []).slice(0, 4),
    roleMatch: state.resumeFacts?.roleMatch || "",
    candidateSummary: state.resumeFacts?.candidateSummary || "",
  },
});

export const selectInitialDecision = (state = {}) => {
  const planned = pickNextPlannedItem(state) || {};
  const resumeFocus = getRelevantResumeTopic(state);

  if (resumeFocus && state.resumeBudgetTurns > 0 && state.totalQuestionsAsked < 2) {
    return {
      nextAction: "ask_resume_question",
      topic: resumeFocus.topic,
      difficulty: state.difficulty || "medium",
      reason: "resume relevant and early in interview",
      shouldUseCoding: false,
      followUpRequired: false,
      resumeFocus,
    };
  }

  return {
    nextAction: planned.action || "ask_conceptual_question",
    topic: planned.topic || state.currentTopic || state.topic || "general",
    difficulty: state.difficulty || "medium",
    reason: "initial role coverage plan",
    shouldUseCoding: planned.action === "ask_coding_question",
    followUpRequired: false,
    resumeFocus: null,
  };
};

export const advanceAgentState = ({ state, question, answer, evaluation = {}, plannerDecision = {}, nextQuestion = "", nextAction = "", topic = "", actionTopic = "" }) => {
  const nextState = { ...(state || {}) };
  const currentTopic = state?.currentTopic || actionTopic || topic || nextState.topic || "";
  const score = Number.isFinite(evaluation?.score) ? evaluation.score : 0;
  const now = new Date();
  const startedAt = state?.startedAt ? new Date(state.startedAt) : now;
  const elapsedMinutes = Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 60000));
  const totalQuestionsAsked = (state?.totalQuestionsAsked || 0) + 1;
  const topicHistory = [...(state?.topicHistory || []), currentTopic].filter(Boolean).slice(-20);
  const questionHistory = [...(state?.questionHistory || []), question].filter(Boolean).slice(-20);
  const answerHistory = [...(state?.answerHistory || []), { question, answer, score, topic: currentTopic, action: plannerDecision?.nextAction || nextAction }].slice(-20);
  const existingCoverage = (state?.topicCoverage || []).map((item) => ({ ...item }));
  const coverageIndex = existingCoverage.findIndex((item) => item.topic?.toLowerCase() === currentTopic.toLowerCase());
  const coverageEntry = coverageIndex >= 0 ? { ...existingCoverage[coverageIndex] } : { topic: currentTopic, askedCount: 0, averageScore: 0, strongCount: 0, weakCount: 0, lastAction: nextAction || plannerDecision?.nextAction || "", lastAskedAt: null, mastered: false };
  const askedCount = (coverageEntry.askedCount || 0) + 1;
  const averageScore = Math.round((((coverageEntry.averageScore || 0) * (coverageEntry.askedCount || 0)) + score) / Math.max(1, askedCount));

  coverageEntry.askedCount = askedCount;
  coverageEntry.averageScore = averageScore;
  coverageEntry.strongCount = (coverageEntry.strongCount || 0) + (score >= 7 ? 1 : 0);
  coverageEntry.weakCount = (coverageEntry.weakCount || 0) + (score <= 4 ? 1 : 0);
  coverageEntry.lastAction = plannerDecision?.nextAction || nextAction || coverageEntry.lastAction;
  coverageEntry.lastAskedAt = now.toISOString();
  coverageEntry.mastered = averageScore >= 8 && coverageEntry.askedCount >= 2;

  if (coverageIndex >= 0) {
    existingCoverage[coverageIndex] = coverageEntry;
  } else {
    existingCoverage.push(coverageEntry);
  }

  const strongTopics = Array.from(new Set([...(state?.strongTopics || []), ...(evaluation?.strengths || [])])).slice(0, 20);
  const weakTopics = Array.from(new Set([...(state?.weakTopics || []), ...(evaluation?.weaknesses || []), ...(evaluation?.missingConcepts || [])])).slice(0, 20);
  const followUpCountByTopic = { ...(state?.followUpCountByTopic || {}) };
  const didFollowUp = plannerDecision?.nextAction === "ask_follow_up";
  followUpCountByTopic[currentTopic] = didFollowUp ? (followUpCountByTopic[currentTopic] || 0) + 1 : 0;

  nextState.turnNumber = (state?.turnNumber || 0) + 1;
  nextState.totalQuestionsAsked = totalQuestionsAsked;
  nextState.elapsedMinutes = elapsedMinutes;
  nextState.remainingMinutes = Math.max((state?.duration || 0) - elapsedMinutes, 0);
  nextState.currentTopic = topic || plannerDecision?.topic || currentTopic;
  nextState.lastAskedTopic = currentTopic;
  nextState.lastAskedQuestion = question || nextQuestion || state?.lastAskedQuestion || "";
  nextState.lastAction = plannerDecision?.nextAction || nextAction || state?.lastAction || "";
  nextState.lastQuestionType = plannerDecision?.nextAction || nextAction || state?.lastQuestionType || "";
  nextState.questionHistory = questionHistory;
  nextState.answerHistory = answerHistory;
  nextState.topicHistory = topicHistory;
  nextState.topicCoverage = existingCoverage;
  nextState.strongTopics = strongTopics;
  nextState.weakTopics = weakTopics;
  nextState.followUpCountByTopic = followUpCountByTopic;
  nextState.followUpStreak = didFollowUp ? (state?.followUpStreak || 0) + 1 : 0;
  nextState.resumeDiscussed = state?.resumeDiscussed || plannerDecision?.nextAction === "ask_resume_question";
  nextState.resumeQuestionsUsed = (state?.resumeQuestionsUsed || 0) + (plannerDecision?.nextAction === "ask_resume_question" ? 1 : 0);
  nextState.behavioralQuestionsUsed = (state?.behavioralQuestionsUsed || 0) + (plannerDecision?.nextAction === "ask_behavioral" ? 1 : 0);
  nextState.codingQuestionsUsed = (state?.codingQuestionsUsed || 0) + (plannerDecision?.nextAction === "ask_coding_question" ? 1 : 0);
  nextState.debuggingQuestionsUsed = (state?.debuggingQuestionsUsed || 0) + (plannerDecision?.nextAction === "ask_debugging_question" ? 1 : 0);
  nextState.systemDesignQuestionsUsed = (state?.systemDesignQuestionsUsed || 0) + (plannerDecision?.nextAction === "ask_system_design" ? 1 : 0);
  nextState.codingTurnsUsed = (state?.codingTurnsUsed || 0) + (plannerDecision?.nextAction === "ask_coding_question" ? 1 : 0);
  nextState.averageResponseQuality = Math.round(((state?.averageResponseQuality || 0) * Math.max(0, totalQuestionsAsked - 1) + score) / totalQuestionsAsked);
  nextState.confidence = Math.max(1, Math.min(100, Math.round((nextState.averageResponseQuality || 0) * 10)));
  nextState.lastPlannerDecision = plannerDecision || null;
  nextState.completed = plannerDecision?.nextAction === "finish_interview" ? true : !!state?.completed;
  nextState.endReason = plannerDecision?.reason || state?.endReason || "";
  nextState.phase = plannerDecision?.nextAction === "ask_coding_question" ? "coding" : plannerDecision?.nextAction === "ask_system_design" ? "design" : plannerDecision?.nextAction === "ask_behavioral" ? "behavioral" : plannerDecision?.nextAction === "ask_resume_question" ? "resume" : plannerDecision?.nextAction === "finish_interview" ? "wrapup" : "conceptual";

  return nextState;
};

export const buildOpeningScript = ({ state, question }) => {
  const name = state?.candidateProfile?.name ? `, ${state.candidateProfile.name}` : "";
  const role = state?.roleLabel || state?.targetRole || state?.topic || "this role";
  const topic = state?.topic || state?.currentTopic || "the role";
  const introQuestion = question || `Let's start with ${topic}. Can you walk me through how you would approach it?`;

  return `Hi${name}. I'm your interviewer today. We'll focus on ${role} and I will adjust based on how you respond. To begin, ${introQuestion}`;
};
