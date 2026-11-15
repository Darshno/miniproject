import { readFile } from "node:fs/promises";
import path from "node:path";

type GrammarNode = Record<string, unknown>;

export type GrammarEvidence = {
  category: string;
  rule: string;
  examples: unknown[];
  confidence?: string;
};

let grammarPromise: Promise<GrammarNode> | undefined;

function getGrammarPath() {
  return path.resolve(process.cwd(), "server/data/kodava/grammar.json");
}

function collectEvidence(value: unknown, category = "general", output: GrammarEvidence[] = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectEvidence(item, category, output));
    return output;
  }
  if (!value || typeof value !== "object") return output;

  const node = value as GrammarNode;
  const nextCategory = typeof node.category === "string" ? node.category : category;
  if (typeof node.rule === "string") {
    output.push({
      category: nextCategory,
      rule: node.rule,
      examples: Array.isArray(node.examples) ? node.examples : [],
      confidence: typeof node.confidence === "string" ? node.confidence : undefined,
    });
  }
  Object.entries(node).forEach(([key, child]) => {
    if (key !== "examples") collectEvidence(child, key, output);
  });
  return output;
}

export function loadGrammar(): Promise<GrammarNode> {
  grammarPromise ??= readFile(getGrammarPath(), "utf8").then((content) => {
    const parsed: unknown = JSON.parse(content);
    if (!parsed || typeof parsed !== "object") throw new Error("Kodava grammar must be a JSON object");
    return parsed as GrammarNode;
  });
  return grammarPromise;
}

export async function getRelevantGrammarRules(categories: string[] = [], limit = 8) {
  const grammar = await loadGrammar();
  const evidence = collectEvidence(grammar);
  if (categories.length === 0) return evidence.slice(0, limit);
  const requested = new Set(categories.map((category) => category.toLocaleLowerCase("en-US")));
  return evidence
    .filter((item) => requested.has(item.category.toLocaleLowerCase("en-US")) || requested.has("general"))
    .slice(0, limit);
}

export async function getGrammarExamples(limit = 8) {
  const grammar = await loadGrammar();
  return collectEvidence(grammar)
    .flatMap((item) => item.examples)
    .slice(0, limit);
}

export function resetGrammarCacheForTests() {
  grammarPromise = undefined;
}
