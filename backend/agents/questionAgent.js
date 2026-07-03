import callAI from "../utils/callAI.js";
import { parseJsonSafe } from "../utils/parseJson.js";
import { buildQuestionPrompt } from "../services/promptTemplates.js";
import { getRoleLibrary, isTopicAllowed } from "../services/interviewPolicy.js";

const buildFallbackQuestion = ({ topic, difficulty, questionType, resumeFacts = {}, roleFamily = "general" }) => {
  const role = getRoleLibrary(roleFamily);
  const safeTopic = topic || role.coreTopics[0] || "core fundamentals";

  if (questionType === "resume") {
    const project = resumeFacts?.projects?.[0];
    const projectName = project?.name || safeTopic;
    return `Tell me about ${projectName}. What problem were you solving, and what trade-offs did you make?`;
  }

  if (questionType === "coding") {
    return `Let's do a ${difficulty} coding problem around ${safeTopic}. Can you explain your approach before writing code?`;
  }

  if (questionType === "debugging") {
    return `Suppose a ${safeTopic} flow is failing in production. How would you debug it step by step?`;
  }

  if (questionType === "system_design") {
    return `How would you design a reliable ${safeTopic} system and what trade-offs would you discuss?`;
  }

  if (questionType === "sql_query") {
    return `Write or describe a SQL approach for a ${safeTopic} style data question. What would you optimize first?`;
  }

  if (questionType === "behavioral") {
    return `Tell me about a time you had to make a difficult engineering decision around ${safeTopic}.`;
  }

  if (questionType === "follow_up") {
    return `Can you go one level deeper on ${safeTopic} and explain the key trade-off or edge case?`;
  }

  return `Can you walk me through ${safeTopic} and the main trade-offs you would consider?`;
};

  export { generateQuestion } from "./questionOrchestrator.js";