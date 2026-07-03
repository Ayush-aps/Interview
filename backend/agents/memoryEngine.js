import { buildInterviewState, summarizeInterviewState, updateInterviewState } from "./interviewState.js";

export const buildInterviewMemory = ({ interview, user, resumeData = "" }) => {
	const derivedState = buildInterviewState({ interview, user, resumeText: resumeData });
	return {
		...derivedState,
		...(interview?.agentState || {}),
	};
};

export const summarizeMemory = (memory) => summarizeInterviewState(memory);

export const updateMemoryAfterEvaluation = (memory, evaluation, turnContext = {}) => updateInterviewState(memory, evaluation, turnContext);