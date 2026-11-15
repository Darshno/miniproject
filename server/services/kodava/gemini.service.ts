import type { DictionaryEntry } from "./dictionary.service";
import type { GrammarEvidence } from "./grammar.service";

export type KodavaModelResponse = {
  translatedText: string;
  wordAnalysis: Array<{
    english: string;
    kodava: string;
    source: string;
    supported: boolean;
  }>;
  uncertainWords: string[];
  grammarExplanation: string[];
  warnings: string[];
};

function extractText(payload: unknown): string {
  const text = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    .candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!text) throw new Error("Gemini returned no translation content");
  return text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

export function buildGeminiPrompt(
  sourceText: string,
  dictionaryEntries: DictionaryEntry[],
  grammarRules: GrammarEvidence[],
  unknownWords: string[],
): string {
  return [
    "Translate the following English sentence into Kodava only.",
    "Return JSON only with translatedText, wordAnalysis, uncertainWords, grammarExplanation, and warnings.",
    "Use dictionary entries as evidence, not as a word-by-word concatenation engine.",
    "Do not substitute Tulu or invent unsupported Kodava vocabulary. Clearly mark uncertainty.",
    `English sentence: ${sourceText}`,
    `Dictionary evidence: ${JSON.stringify(dictionaryEntries)}`,
    `Historical grammar evidence: ${JSON.stringify(grammarRules)}`,
    `Unknown vocabulary: ${JSON.stringify(unknownWords)}`,
    "The grammar source is historical (1867), so do not present it as modern verified fact.",
  ].join("\n\n");
}

function validateResponse(value: unknown): KodavaModelResponse {
  if (!value || typeof value !== "object") throw new Error("Gemini response is not an object");
  const response = value as Partial<KodavaModelResponse>;
  if (typeof response.translatedText !== "string" || !response.translatedText.trim()) {
    throw new Error("Gemini response is missing translatedText");
  }
  if (!Array.isArray(response.wordAnalysis) || !Array.isArray(response.uncertainWords)) {
    throw new Error("Gemini response has an invalid structured shape");
  }
  return {
    translatedText: response.translatedText.trim(),
    wordAnalysis: response.wordAnalysis.filter(
      (item): item is KodavaModelResponse["wordAnalysis"][number] =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof item.english === "string" &&
        typeof item.kodava === "string" &&
        typeof item.source === "string" &&
        typeof item.supported === "boolean",
    ),
    uncertainWords: response.uncertainWords.filter((word): word is string => typeof word === "string"),
    grammarExplanation: Array.isArray(response.grammarExplanation)
      ? response.grammarExplanation.filter((item): item is string => typeof item === "string")
      : [],
    warnings: Array.isArray(response.warnings)
      ? response.warnings.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export async function translateWithGemini(
  sourceText: string,
  dictionaryEntries: DictionaryEntry[],
  grammarRules: GrammarEvidence[],
  unknownWords: string[],
): Promise<KodavaModelResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const model = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
  const prompt = buildGeminiPrompt(sourceText, dictionaryEntries, grammarRules, unknownWords);
  const models = [...new Set([model, process.env.GEMINI_FALLBACK_MODEL].filter(Boolean))] as string[];
  let lastError = "Gemini request failed";

  for (const currentModel of models) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
            }),
            signal: controller.signal,
          },
        );
        if (response.ok) return validateResponse(JSON.parse(extractText(await response.json())));

        const details = (await response.text()).slice(0, 300);
        lastError = `Gemini request failed with status ${response.status}: ${details}`;
        if (response.status !== 429 && response.status !== 503) break;
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Gemini request failed";
        if (attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  throw new Error(`${lastError}. Gemini may be temporarily overloaded; try again shortly.`);
}
