import { describe, expect, it } from "vitest";
import {
  getDictionaryStats,
  lookupEnglishPhrase,
  lookupEnglishWord,
  lookupKodavaWord,
} from "./dictionary.service";
import { getGrammarExamples, getRelevantGrammarRules, loadGrammar } from "./grammar.service";

describe("Kodava dictionary", () => {
  it("loads the UTF-8 dictionary and exposes statistics", async () => {
    const stats = await getDictionaryStats();
    expect(stats.entries).toBeGreaterThan(3000);
    expect(stats.partsOfSpeech.length).toBeGreaterThan(0);
  });

  it("looks up English meanings case-insensitively and preserves Unicode", async () => {
    const entries = await lookupEnglishWord("father");
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((entry) => entry.kodavaWord === "ಅಪ್ಪೊ")).toBe(true);
  });

  it("supports phrase and Kodava-script lookups", async () => {
    expect(await lookupEnglishPhrase("family name")).toEqual(
      expect.arrayContaining([expect.objectContaining({ kodavaWord: "ಒಕ್ಕಪೆದ" })]),
    );
    expect(await lookupKodavaWord("ಅಪ್ಪೊ")).toEqual(
      expect.arrayContaining([expect.objectContaining({ englishMeaning: "Father" })]),
    );
  });
});

describe("Kodava grammar", () => {
  it("loads historical grammar metadata and retrieves bounded evidence", async () => {
    const grammar = await loadGrammar();
    expect(grammar.metadata).toBeDefined();
    expect((await getRelevantGrammarRules([], 3)).length).toBeLessThanOrEqual(3);
    expect(Array.isArray(await getGrammarExamples(3))).toBe(true);
  });
});
