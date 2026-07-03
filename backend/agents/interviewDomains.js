const ROLE_ALIASES = {
  frontend: "frontend",
  front_end: "frontend",
  ui: "frontend",
  backend: "backend",
  back_end: "backend",
  java: "java",
  python: "python",
  sql: "sql",
  database: "sql",
  db: "sql",
  machine_learning: "machine-learning",
  ml: "machine-learning",
  data_science: "data-science",
  data: "data-science",
  fullstack: "fullstack",
};

export const ROLE_DOMAINS = {
  frontend: {
    displayName: "Frontend",
    forbiddenTopics: ["Node", "Express", "Spring", "Hibernate", "React Router deep backend", "JDBC", "Spark"],
    topicPool: ["HTML", "CSS", "Flexbox", "Grid", "JavaScript", "ES6", "Closures", "Event Loop", "React", "Hooks", "Context API", "Redux", "Performance", "Browser Rendering", "Accessibility"],
    projectPrompts: ["Tell me about a frontend project you shipped.", "Walk me through a UI problem you solved and the trade-offs you made."],
  },
  backend: {
    displayName: "Backend",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering", "Flexbox", "Grid"],
    topicPool: ["Node", "Express", "REST", "Authentication", "JWT", "Cookies", "MongoDB", "SQL", "Caching", "Redis", "Queues", "Rate Limiting", "Security", "Transactions", "Observability"],
    projectPrompts: ["Tell me about a backend service you designed.", "How did you design authentication or a data flow in one of your backend projects?"],
  },
  java: {
    displayName: "Java",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering", "Flexbox", "Grid"],
    topicPool: ["OOP", "Collections", "Streams", "Threads", "Synchronization", "JVM", "Garbage Collection", "Spring Boot", "Hibernate", "Design Patterns", "Concurrency", "Testing"],
    projectPrompts: ["Tell me about a Java project where you had to reason about design or concurrency."],
  },
  python: {
    displayName: "Python",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering", "Flexbox", "Grid"],
    topicPool: ["Data Structures", "Generators", "Decorators", "Async", "GIL", "OOP", "Packages", "Virtual Environments", "Testing", "Logging", "Typing", "Scripting"],
    projectPrompts: ["Tell me about a Python project where performance, testing, or automation mattered."],
  },
  sql: {
    displayName: "SQL",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering", "Flexbox", "Grid"],
    topicPool: ["SELECT", "GROUP BY", "HAVING", "Joins", "Indexes", "Transactions", "Isolation", "Window Functions", "Recursive Queries", "Query Optimization", "CTEs", "Normalization"],
    projectPrompts: ["Tell me about a data or reporting problem where SQL was important."],
  },
  "machine-learning": {
    displayName: "Machine Learning",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering", "Flexbox", "Grid"],
    topicPool: ["Regression", "Classification", "Bias Variance", "Cross Validation", "Random Forest", "XGBoost", "CNN", "RNN", "Transformers", "LLM", "Embeddings", "Vector Databases", "Feature Engineering"],
    projectPrompts: ["Tell me about an ML project and how you validated the model."],
  },
  "data-science": {
    displayName: "Data Science",
    forbiddenTopics: ["React", "Hooks", "Redux", "Browser Rendering", "Flexbox", "Grid"],
    topicPool: ["Statistics", "Probability", "Pandas", "NumPy", "Visualization", "Feature Engineering", "EDA", "Data Cleaning", "Experiment Design", "Hypothesis Testing"],
    projectPrompts: ["Tell me about a data science project where your analysis changed the direction of the work."],
  },
  general: {
    displayName: "General",
    forbiddenTopics: [],
    topicPool: ["Problem Solving", "Communication", "System Thinking", "Debugging", "Design Trade-offs"],
    projectPrompts: ["Tell me about a project you are proud of."],
  },
  fullstack: {
    displayName: "Fullstack",
    forbiddenTopics: [],
    topicPool: ["HTML", "CSS", "JavaScript", "React", "Node", "Express", "REST", "Authentication", "Databases", "System Design", "Performance", "Security", "Testing"],
    projectPrompts: ["Tell me about a fullstack project you built end-to-end."],
  },
};

export const normalizeRole = (role = "general") => {
  const normalized = String(role || "general").toLowerCase().replace(/\s+/g, "_");
  return ROLE_ALIASES[normalized] || normalized;
};

export const getRoleDomain = (role = "general") => ROLE_DOMAINS[normalizeRole(role)] || ROLE_DOMAINS.general;

export const roleForTopic = (topic = "") => {
  const text = String(topic || "").toLowerCase();
  if (/(html|css|flexbox|grid|browser|react|frontend|ui|accessibility)/.test(text)) return "frontend";
  if (/(node|express|rest|jwt|cookie|mongo|redis|queue|rate limit|security|backend)/.test(text)) return "backend";
  if (/(java|spring|hibernate|jvm|collections|streams|threads|synchron)/.test(text)) return "java";
  if (/(python|decorator|generator|async|gil|virtual environment|typing|pandas|numpy)/.test(text)) return "python";
  if (/(sql|select|join|group by|having|window|cte|index|transaction|query)/.test(text)) return "sql";
  if (/(ml|machine learning|regression|classification|xgboost|transformer|llm|embedding|vector)/.test(text)) return "machine-learning";
  if (/(data science|statistics|probability|eda|feature engineering|visualization|data cleaning)/.test(text)) return "data-science";
  return "general";
};

export const getRoleTopicPool = (role = "general") => getRoleDomain(role).topicPool;

export const getForbiddenTopics = (role = "general") => getRoleDomain(role).forbiddenTopics;

export const getRoleProjectPrompts = (role = "general") => getRoleDomain(role).projectPrompts;

export const normalizeTopic = (topic = "") => String(topic || "").trim().toLowerCase();

export const isProjectTopic = (topic = "") => /project|portfolio|experience|ship|built|worked on/i.test(String(topic || ""));

export const createTopicKey = (topic = "") => normalizeTopic(topic).replace(/[^a-z0-9]+/g, "");

export const getInterviewSchedule = (duration = 30) => {
  const minutes = Number(duration) || 30;

  if (minutes <= 15) {
    return { intro: 2, resume: 2, conceptual: 5, coding: 1, debugging: 0, systemDesign: 0, behavioral: 1, maxFollowUps: 2, maxProjectTurns: 1 };
  }

  if (minutes <= 30) {
    return { intro: 3, resume: 5, conceptual: 6, coding: 2, debugging: 1, systemDesign: 0, behavioral: 1, maxFollowUps: 2, maxProjectTurns: 1 };
  }

  if (minutes <= 45) {
    return { intro: 3, resume: 5, conceptual: 7, coding: 3, debugging: 1, systemDesign: 1, behavioral: 1, maxFollowUps: 3, maxProjectTurns: 1 };
  }

  return { intro: 3, resume: 6, conceptual: 8, coding: 3, debugging: 1, systemDesign: 1, behavioral: 1, maxFollowUps: 3, maxProjectTurns: 2 };
};

export const chooseNextTopic = ({ role, weakTopics = [], strongTopics = [], coveredTopics = [], resumeTopics = [], preferredTopics = [] }) => {
  const domain = getRoleDomain(role);
  const forbidden = new Set(domain.forbiddenTopics.map(createTopicKey));
  const covered = new Set(coveredTopics.map(createTopicKey));
  const weak = weakTopics.map(createTopicKey).filter(Boolean);
  const strong = new Set(strongTopics.map(createTopicKey));
  const candidates = [...preferredTopics, ...resumeTopics, ...weak.map((item) => item), ...domain.topicPool];

  const pick = candidates.find((topic) => {
    const key = createTopicKey(topic);
    return key && !forbidden.has(key) && !covered.has(key) && !strong.has(key);
  });

  return pick || domain.topicPool.find((topic) => !forbidden.has(createTopicKey(topic))) || domain.topicPool[0] || "the core topic";
};