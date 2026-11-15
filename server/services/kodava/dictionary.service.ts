import { readFile } from "node:fs/promises";
import path from "node:path";

export type DictionaryEntry = {
  wordId: string;
  sourceWordId: string;
  kodavaWord: string;
  kodavaKannada: string;
  englishMeaning: string;
  partOfSpeech: string;
  source: string;
  sourcePage: string;
  sourceFile: string;
  notes: string;
};

const REQUIRED_COLUMNS = [
  "word_id",
  "source_word_id",
  "kodava_word",
  "kodava_kannada",
  "english_meaning",
  "part_of_speech",
  "source",
  "source_page",
  "source_file",
  "notes",
] as const;

let dictionaryPromise: Promise<DictionaryEntry[]> | undefined;

function parseCsvRow(row: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"') {
      if (quoted && row[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("Invalid dictionary CSV: unterminated quoted field");
  cells.push(cell);
  return cells;
}

function parseCsv(content: string): DictionaryEntry[] {
  const rows: string[] = [];
  let row = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === '"') {
      quoted = !quoted;
      row += character;
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (row) rows.push(row);
      row = "";
      if (character === "\r" && content[index + 1] === "\n") index += 1;
    } else {
      row += character;
    }
  }
  if (row) rows.push(row);

  const header = parseCsvRow(rows.shift()?.replace(/^\uFEFF/, "") ?? "");
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !header.includes(column));
  if (missingColumns.length > 0) {
    throw new Error(`Invalid dictionary CSV: missing columns ${missingColumns.join(", ")}`);
  }

  return rows.filter(Boolean).map((line) => {
    const values = parseCsvRow(line);
    const get = (column: (typeof REQUIRED_COLUMNS)[number]) =>
      (values[header.indexOf(column)] ?? "").trim();

    return {
      wordId: get("word_id"),
      sourceWordId: get("source_word_id"),
      kodavaWord: get("kodava_word"),
      kodavaKannada: get("kodava_kannada"),
      englishMeaning: get("english_meaning"),
      partOfSpeech: get("part_of_speech"),
      source: get("source"),
      sourcePage: get("source_page"),
      sourceFile: get("source_file"),
      notes: get("notes"),
    };
  });
}

function normalizeEnglish(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function getDictionaryPath(): string {
  return path.resolve(process.cwd(), "server/data/kodava/dictionary.csv");
}

export function loadDictionary(): Promise<DictionaryEntry[]> {
  dictionaryPromise ??= readFile(getDictionaryPath(), "utf8")
    .then(parseCsv)
    .then((entries) => {
      if (entries.length === 0) throw new Error("Kodava dictionary is empty");
      return entries;
    });
  return dictionaryPromise;
}

export async function lookupEnglishWord(word: string): Promise<DictionaryEntry[]> {
  const normalized = normalizeEnglish(word);
  if (!normalized) return [];
  const entries = await loadDictionary();
  return entries.filter((entry) =>
    entry.englishMeaning.split(/[;,/]/).some((meaning) => normalizeEnglish(meaning) === normalized)
  );
}

export async function lookupEnglishPhrase(phrase: string): Promise<DictionaryEntry[]> {
  const normalized = normalizeEnglish(phrase);
  if (!normalized) return [];
  const entries = await loadDictionary();
  return entries.filter((entry) =>
    entry.englishMeaning
      .split(/[;,/]/)
      .some((meaning) => normalizeEnglish(meaning) === normalized)
  );
}

export async function lookupKodavaWord(word: string): Promise<DictionaryEntry[]> {
  const normalized = word.trim();
  if (!normalized) return [];
  const entries = await loadDictionary();
  return entries.filter(
    (entry) => entry.kodavaWord === normalized || entry.kodavaKannada === normalized
  );
}

export async function lookupByPartOfSpeech(partOfSpeech: string): Promise<DictionaryEntry[]> {
  const normalized = normalizeEnglish(partOfSpeech);
  const entries = await loadDictionary();
  return entries.filter((entry) => normalizeEnglish(entry.partOfSpeech) === normalized);
}

export async function getDictionaryStats() {
  const entries = await loadDictionary();
  return {
    entries: entries.length,
    entriesWithKannadaScript: entries.filter((entry) => entry.kodavaKannada && entry.kodavaKannada !== "*").length,
    partsOfSpeech: [...new Set(entries.map((entry) => entry.partOfSpeech).filter(Boolean))],
  };
}

export function resetDictionaryCacheForTests() {
  dictionaryPromise = undefined;
}
