const stripCodeFences = (value) => value.replace(/```json/g, "").replace(/```/g, "").trim();

export const parseJsonSafe = (value, fallback = {}) => {
  if (!value || typeof value !== "string") return fallback;

  const cleaned = stripCodeFences(value);

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return fallback;
      }
    }

    return fallback;
  }
};