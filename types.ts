export interface PlagiarizedSentence {
  sentence: string;
  source: string;
  sourceType: 'WEB' | 'AI';
}

/**
 * Represents the direct output from the Gemini API analysis.
 * It only contains the identified sentences without a score or summary.
 */
export interface PlagiarismAnalysis {
    plagiarizedSentences: PlagiarizedSentence[];
}

/**
 * Represents the final, processed result displayed to the user,
 * including the client-side calculated score and summary.
 */
export interface PlagiarismResult {
  plagiarismScore: number;
  summary: string;
  plagiarizedSentences: PlagiarizedSentence[];
}

// FIX: Make `uri` and `title` optional to match the `GroundingChunk` type from the Gemini API.
export interface GroundingSource {
  web?: {
    uri?: string;
    title?: string;
  };
}
