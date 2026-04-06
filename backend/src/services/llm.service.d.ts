/**
 * LLM Service — Gemini AI Skill Extractor
 * Uses Gemini v1 REST API directly (bypasses SDK's v1beta limitation).
 * Includes a keyword-based fallback so empty extraction never happens on clear resumes.
 */
/**
 * Keyword-based fallback: scans raw resume text for known technical skills.
 * Used when Gemini is unavailable or returns empty results.
 */
export declare const extractSkillsFromKeywords: (text: string) => string[];
/**
 * Gemini-based extraction using direct v1 REST API call (no SDK, no v1beta).
 */
export declare const extractSkillsFromText: (resumeText: string) => Promise<{
    skills: string[];
    usedFallback: boolean;
}>;
//# sourceMappingURL=llm.service.d.ts.map