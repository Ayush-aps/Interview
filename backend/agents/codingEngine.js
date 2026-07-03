import callAI from "../utils/callAI.js";
import { parseJsonSafe } from "../utils/parseJson.js";
import { buildCodingPrompt } from "../services/aiPrompts.js";
import { getRoleDomain, normalizeRole, roleForTopic } from "./interviewDomains.js";

const codingFallbacks = {
  frontend: (topic, difficulty) => ({
    question: `Build a small UI utility around ${topic}. Explain how you would structure the component, handle events, and keep it accessible.`,
    topic,
    difficulty,
    constraints: ["Keep the solution component-based", "Explain trade-offs", "Consider accessibility"],
    hints: ["Think about state flow", "Keep rendering efficient", "Discuss edge cases"],
    followUps: ["How would you optimize rerenders?", "How would you test it?"],
    questionType: "coding",
  }),
  backend: (topic, difficulty) => ({
    question: `Design a backend feature around ${topic}. Outline the API, data model, and failure handling.`,
    topic,
    difficulty,
    constraints: ["Include validation", "Discuss auth or permissions where relevant", "Explain scaling concerns"],
    hints: ["Think about request flow", "Think about persistence", "Mention error handling"],
    followUps: ["How would you rate-limit it?", "How would you observe it in production?"],
    questionType: "coding",
  }),
  java: (topic, difficulty) => ({
    question: `Write or describe a Java solution around ${topic} and explain the design choices you would defend.`,
    topic,
    difficulty,
    constraints: ["Use clear object design", "Discuss complexity", "Consider thread safety if relevant"],
    hints: ["Start with the data structures", "Think about encapsulation", "Mention edge cases"],
    followUps: ["How would you improve readability?", "How would you make it safer under concurrency?"],
    questionType: "coding",
  }),
  python: (topic, difficulty) => ({
    question: `Solve a Python problem around ${topic} and explain how you would keep the code maintainable and testable.`,
    topic,
    difficulty,
    constraints: ["Write idiomatic Python", "Discuss testing", "Mention time and space complexity"],
    hints: ["Use Python strengths where helpful", "Think about readability", "Cover corner cases"],
    followUps: ["How would you package this for reuse?", "How would you test it?"],
    questionType: "coding",
  }),
  sql: (topic, difficulty) => ({
    question: `Write a SQL solution involving ${topic} and explain why the query is correct and efficient.`,
    topic,
    difficulty,
    constraints: ["Use correct joins or grouping", "Discuss indexes if relevant", "Explain correctness"],
    hints: ["Think about row cardinality", "Consider duplicates", "Check edge cases"],
    followUps: ["How would you optimize this query?", "How would you make it robust to dirty data?"],
    questionType: "sql_query",
  }),
  "machine-learning": (topic, difficulty) => ({
    question: `Walk me through how you would build or evaluate an ML solution around ${topic}.`,
    topic,
    difficulty,
    constraints: ["Explain the modeling choice", "Discuss evaluation", "Mention data quality"],
    hints: ["Start with the objective", "Think about leakage", "Talk about monitoring"],
    followUps: ["How would you handle drift?", "How would you measure success?"],
    questionType: "coding",
  }),
  "data-science": (topic, difficulty) => ({
    question: `Describe how you would analyze a data science problem around ${topic}.`,
    topic,
    difficulty,
    constraints: ["Explain the analysis steps", "Discuss assumptions", "Mention validation"],
    hints: ["Think about exploration first", "Discuss data cleaning", "Explain the metric choice"],
    followUps: ["How would you validate the insight?", "What would you do if the dataset were biased?"],
    questionType: "coding",
  }),
  general: (topic, difficulty) => ({
    question: `Work through a practical problem around ${topic} and explain your approach.`,
    topic,
    difficulty,
    constraints: ["Explain the approach clearly", "Discuss complexity", "Cover edge cases"],
    hints: ["Start simple", "Explain your assumptions", "Call out trade-offs"],
    followUps: ["How would you optimize it?", "How would you test it?"],
    questionType: "coding",
  }),
};

export const generateCodingQuestion = async ({ topic, difficulty, weakTopics = [], resumeSkills = [], personality = "Friendly", role = "general", interviewState = {}, plannerDecision = {} }) => {
  const normalizedRole = normalizeRole(role || roleForTopic(topic));
  const prompt = buildCodingPrompt({ topic, difficulty, weakTopics, resumeSkills, personality, role: normalizedRole, interviewState, plannerDecision });

  try {
    const response = await callAI(prompt);
    return parseJsonSafe(response, codingFallbacks[normalizedRole]?.(topic, difficulty) || codingFallbacks.general(topic, difficulty));
  } catch (error) {
    return codingFallbacks[normalizedRole]?.(topic, difficulty) || codingFallbacks.general(topic, difficulty);
  }
};