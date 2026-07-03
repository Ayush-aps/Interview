import callAI from "../utils/callAI.js";
import { parseJsonSafe } from "../utils/parseJson.js";
import { buildQuestionPrompt } from "../services/aiPrompts.js";
import { getRoleDomain, getRoleTopicPool, normalizeRole, roleForTopic } from "./interviewDomains.js";

const topicFallbacks = {
  frontend: {
    conceptual: (topic) => `How would you explain ${topic} to another engineer, and what trade-offs would you highlight?`,
    resume: () => `Tell me about a frontend project you shipped and walk me through the decisions you made.`,
    follow_up: (topic) => `Can you go one layer deeper on ${topic} and explain the decision you would defend in an interview?`,
    debugging: (topic) => `A UI bug appears only in production for ${topic}. How would you isolate it?`,
    system_design: (topic) => `How would you design a frontend architecture around ${topic} at scale?`,
    behavioral: () => `Tell me about a time you had to influence a design direction with limited information.`,
    sql_query: () => `How would you use SQL to analyze product usage in a frontend analytics workflow?`,
  },
  backend: {
    conceptual: (topic) => `How would you explain ${topic} in a backend system and what failure modes would you consider?`,
    resume: () => `Tell me about a backend service you built and how you designed it to be reliable.`,
    follow_up: (topic) => `What would you change in your approach to ${topic} if traffic doubled tomorrow?`,
    debugging: (topic) => `A production incident is affecting ${topic}. How would you debug it?`,
    system_design: (topic) => `How would you design ${topic} for reliability, scale, and maintainability?`,
    behavioral: () => `Tell me about a time you handled an incident or a difficult production issue.`,
    sql_query: () => `How would you reason about data consistency in a backend workflow backed by SQL?`,
  },
  java: {
    conceptual: (topic) => `Can you explain ${topic} and how it affects a production Java system?`,
    resume: () => `Tell me about a Java project you worked on and how you made the design choices.`,
    follow_up: (topic) => `Can you go deeper on ${topic} and describe a trade-off you would defend?`,
    debugging: (topic) => `If ${topic} were causing a bug in production, how would you trace it?`,
    system_design: (topic) => `How would you design a Java service around ${topic} and keep it maintainable?`,
    behavioral: () => `Tell me about a time you improved a codebase or design through collaboration.`,
    sql_query: () => `How would you use SQL alongside a Java backend to keep the data model clean?`,
  },
  python: {
    conceptual: (topic) => `Can you explain ${topic} in Python and where you would use it?`,
    resume: () => `Tell me about a Python project you built and what you learned from it.`,
    follow_up: (topic) => `Can you go deeper on ${topic} and explain a subtle edge case?`,
    debugging: (topic) => `If a Python implementation of ${topic} misbehaved, how would you isolate the issue?`,
    system_design: (topic) => `How would you design a Python workflow around ${topic} for robustness?`,
    behavioral: () => `Tell me about a time you balanced speed and correctness in a Python project.`,
    sql_query: () => `How would you combine Python and SQL to inspect a dataset or validate results?`,
  },
  sql: {
    conceptual: (topic) => `How would you reason about ${topic} in a real database workload?`,
    resume: () => `Tell me about a project where SQL played an important role and how you used it.`,
    follow_up: (topic) => `Can you make the ${topic} example more specific and explain the trade-off?`,
    debugging: (topic) => `A query involving ${topic} is slow. How would you debug and optimize it?`,
    system_design: (topic) => `How would you design a data model where ${topic} stays efficient and maintainable?`,
    behavioral: () => `Tell me about a time you had to explain a data issue to a non-technical stakeholder.`,
    sql_query: (topic) => `Write or explain a query pattern that uses ${topic} effectively in a production report.`,
  },
  "machine-learning": {
    conceptual: (topic) => `How would you explain ${topic} to a teammate, and what makes it useful?`,
    resume: () => `Tell me about an ML project you worked on and how you evaluated it.`,
    follow_up: (topic) => `Can you go deeper on ${topic} and explain how you would validate it?`,
    debugging: (topic) => `If an ML system around ${topic} regressed in production, how would you debug it?`,
    system_design: (topic) => `How would you design a machine learning pipeline around ${topic}?`,
    behavioral: () => `Tell me about a time you had to communicate uncertainty in an ML project.`,
    sql_query: () => `How would you use SQL to prepare or validate data for an ML pipeline?`,
  },
  "data-science": {
    conceptual: (topic) => `How would you explain ${topic} in the context of a data science workflow?`,
    resume: () => `Tell me about a data science project you worked on and how you presented the findings.`,
    follow_up: (topic) => `Can you go deeper on ${topic} and describe the assumptions you would check?`,
    debugging: (topic) => `If a data science workflow around ${topic} looked wrong, how would you debug it?`,
    system_design: (topic) => `How would you design an analytics or experimentation workflow around ${topic}?`,
    behavioral: () => `Tell me about a time you had to convince others with data instead of intuition.`,
    sql_query: () => `How would you use SQL to support exploration or reporting for ${topic}?`,
  },
  general: {
    conceptual: (topic) => `How would you think about ${topic} in an interview setting?`,
    resume: () => `Tell me about a project you are proud of and the trade-offs you made.`,
    follow_up: (topic) => `Can you go a little deeper on ${topic} and explain the trade-off?`,
    debugging: (topic) => `How would you debug an issue related to ${topic}?`,
    system_design: (topic) => `How would you design around ${topic} if this were a production system?`,
    behavioral: () => `Tell me about a time you had to learn something quickly under pressure.`,
    sql_query: () => `How would you write a query or reason about data quality for this problem?`,
  },
  fullstack: {
    conceptual: (topic) => `How would you explain ${topic} across the frontend and backend boundaries?`,
    resume: () => `Tell me about a fullstack project you built end-to-end and how you balanced the frontend and backend pieces.`,
    follow_up: (topic) => `Can you go one layer deeper on ${topic} and explain the trade-off you would make in a real product?`,
    debugging: (topic) => `If ${topic} was causing issues in a fullstack app, how would you isolate the problem?`,
    system_design: (topic) => `How would you design a fullstack system around ${topic} and keep the boundaries clean?`,
    behavioral: () => `Tell me about a time you had to align frontend and backend work under pressure.`,
    sql_query: () => `How would you use SQL in a fullstack product workflow to support the application?`,
  },
};

const cleanText = (value = "") => String(value || "").trim();

const buildFallbackQuestion = ({ role, topic, questionType, previousAnswer, interviewState }) => {
  const normalizedRole = normalizeRole(role || roleForTopic(topic));
  const templates = topicFallbacks[normalizedRole] || topicFallbacks.general;
  const generator = templates[questionType] || templates.conceptual;
  const baseTopic = cleanText(topic || getRoleTopicPool(normalizedRole)[0] || "the topic");
  const suffix = previousAnswer && previousAnswer.trim().length < 45 ? " Can you be more specific?" : "";
  return `${generator(baseTopic, interviewState)}${suffix}`;
};

export const generateQuestion = async ({ topic, difficulty, previousAnswer = "", weakTopics = [], resumeSkills = [], roadmap = [], personality = "Friendly", questionType = "conceptual", interviewState = {}, role = "general", lastQuestion = "", topicPool = [] }) => {
  const prompt = buildQuestionPrompt({ topic, difficulty, previousAnswer, weakTopics, resumeSkills, roadmap, personality, questionType, interviewState, role, lastQuestion, topicPool });
  try {
    const response = await callAI(prompt);
    return parseJsonSafe(response, {
      question: buildFallbackQuestion({ role, topic, questionType, previousAnswer, interviewState }),
      topic,
      difficulty,
      questionType,
      expectedSignals: [],
      shouldRemember: [],
      secondaryTopic: "",
    });
  } catch (error) {
    return {
      question: buildFallbackQuestion({ role, topic, questionType, previousAnswer, interviewState }),
      topic,
      difficulty,
      questionType,
      expectedSignals: [],
      shouldRemember: [],
      secondaryTopic: "",
    };
  }
};