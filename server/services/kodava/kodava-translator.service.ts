import { lookupEnglishPhrase, lookupEnglishWord, type DictionaryEntry } from "./dictionary.service";
import { getRelevantGrammarRules } from "./grammar.service";
import { translateWithGemini, type KodavaModelResponse } from "./gemini.service";

export type KodavaTranslationResult = {
  sourceText: string;
  translatedText: string;
  sourceLanguage: "English";
  targetLanguage: "Kodava";
  method: "gemini";
  matchedDictionaryEntries: DictionaryEntry[];
  unknownWords: string[];
  grammarRulesUsed: Awaited<ReturnType<typeof getRelevantGrammarRules>>;
  wordAnalysis: KodavaModelResponse["wordAnalysis"];
  confidenceLabel: "Strong dictionary support" | "Partial dictionary support" | "AI-generated suggestion" | "Unverified";
  warnings: string[];
};

const STOP_WORDS = new Set(["a", "an", "the", "and", "or", "to", "of", "in", "on", "is", "are", "i", "you"]);

export async function translateEnglishToKodava(sourceText: string): Promise<KodavaTranslationResult> {
  const text = sourceText.trim().replace(/\s+/g, " ");
  if (!text) throw new Error("Translation text cannot be empty");
  if (text.length > 500) throw new Error("Translation text must be 500 characters or fewer");

  const words = text.toLocaleLowerCase("en-US").match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  const matched = new Map<string, DictionaryEntry>();
  const phrases = [...new Set(words.flatMap((_, index) =>
    [3, 2].map((size) => words.slice(index, index + size).join(" ")).filter((phrase) => phrase.split(" ").length > 1),
  ))];
  for (const phrase of phrases) {
    for (const entry of await lookupEnglishPhrase(phrase)) matched.set(entry.wordId, entry);
  }
  for (const word of words) {
    for (const entry of await lookupEnglishWord(word)) matched.set(entry.wordId, entry);
  }

  const matchedMeanings = new Set(
    [...matched.values()].flatMap((entry) => entry.englishMeaning.toLocaleLowerCase("en-US").split(/[;,/]/).map((value) => value.trim())),
  );
  const unknownWords = [...new Set(words.filter((word) => !STOP_WORDS.has(word) && !matchedMeanings.has(word)))];
  const grammarRules = await getRelevantGrammarRules(["syntax", "verb", "noun", "pronoun"]);
  const warnings = ["Historical grammar evidence comes from an 1867 source and is not modern verified guidance."];

  let model: KodavaModelResponse;
  try {
    model = await translateWithGemini(text, [...matched.values()].slice(0, 40), grammarRules, unknownWords);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown Gemini error";
    throw new Error(`Kodava translation unavailable: ${reason}`);
  }

  const confidenceLabel = model.uncertainWords.length === 0 && unknownWords.length === 0
    ? "Strong dictionary support"
    : matched.size > 0
      ? "Partial dictionary support"
      : "AI-generated suggestion";

  return {
    sourceText: text,
    translatedText: model.translatedText,
    sourceLanguage: "English",
    targetLanguage: "Kodava",
    method: "gemini",
    matchedDictionaryEntries: [...matched.values()],
    unknownWords,
    grammarRulesUsed: grammarRules,
    wordAnalysis: model.wordAnalysis,
    confidenceLabel,
    warnings: [...warnings, ...model.warnings],
  };
}
