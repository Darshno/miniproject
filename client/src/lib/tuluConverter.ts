/*
 * Kannada -> legacy ASCII glyph conversion adapted from:
 * https://github.com/chandukaup/convert2tulu/tree/master/js/baravu
 *
 * The converter is intentionally kept separate from translation state. It accepts
 * Kannada-script Unicode and returns Pingara/Baravu-compatible ASCII glyph text.
 */

const CHARACTER_SETS = {
  consonants: "ಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹಳೞಱ",
  vowelSigns: "ಾಿೀುೂೃೄೆೇೊೋೌೈ್",
  viramaMarkers: "್ä",
};

const INDEPENDENT_VOWELS: Record<string, string> = {
  "ಅ": "XAA", "ಆ": "XAa", "ಇ": "XAi", "ಈ": "XAI", "ಉ": "XAu", "ಊ": "XAU", "ಋ": "XAR", "ೠ": "XARR",
  "ಎ": "eA", "ಏ": "EA", "ಐ": "eeA", "ಒ": "eAa", "ಓ": "FAa", "ಔ": "XAY",
};

const CONSONANTS: Record<string, string> = {
  "ಕ": "k", "ಖ": "K", "ಗ": "g", "ಘ": "G", "ಙ": "Z", "ಚ": "c", "ಛ": "C", "ಜ": "j", "ಝ": "J", "ಞ": "z",
  "ಟ": "q", "ಠ": "Q", "ಡ": "w", "ಢ": "W", "ಣ": "N", "ತ": "t", "ಥ": "T", "ದ": "d", "ಧ": "D", "ನ": "n",
  "ಪ": "p", "ಫ": "P", "ಬ": "b", "ಭ": "B", "ಮ": "m", "ಯ": "y", "ರ": "r", "ಲ": "l", "ವ": "v", "ಶ": "S",
  "ಷ": "x", "ಸ": "s", "ಹ": "h", "ಳ": "L",
};

const DEPENDENT_VOWELS: Record<string, string> = {
  "್": "A", "ಾ": "a", "ು": "u", "ೂ": "U", "ೌ": "Y", "ಿ": "i", "ೀ": "I", "ೃ": "R", "ೄ": "RR",
};

const SIGNS: Record<string, string> = { "ಂ": "M", "ಃ": "H", "‌": "X", "‍": "" };
const PREDEFINED_PHRASES: Record<string, string> = { "ಶ್ರೀ": "SArXI", "ಓಂ": "FAamXA" };
const PREPOSITIONED_VOWELS: Record<string, string> = { "ೖ": "ee", "ೆ": "e", "ೇ": "E", "ೈ": "ee", "ೊ": "e", "ೋ": "F" };
const COMPOSITE_SUFFIXES: Record<string, string> = { "ೊ": "a", "ೋ": "a" };

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function handleSpecialCharacterMarkers(text: string) {
  const clusterPattern = `(?:[${CHARACTER_SETS.consonants}](?:[${CHARACTER_SETS.vowelSigns}])?)(?:[${CHARACTER_SETS.viramaMarkers}][${CHARACTER_SETS.consonants}])*`;
  let value = text;
  value = value.replace(/ಎ‍/g, "oA").replace(/ಏ‍/g, "OA").replace(/ಉ‍/g, "XAuAX");
  value = value.replace(/ು‍/g, "uAX").replace(/ುಂ‍/g, "uAXM");
  value = value.replace(new RegExp(`(${clusterPattern})(ೆ‍)`, "g"), "o$1");
  value = value.replace(new RegExp(`(${clusterPattern})(ೇ‍)`, "g"), "O$1");
  return value.replace(/‍/g, "");
}

function preprocessText(text: string) {
  let value = text;
  Object.entries(PREDEFINED_PHRASES).forEach(([source, target]) => {
    value = value.replace(new RegExp(escapeRegex(source), "g"), target);
  });
  return value.replace(/್‍/g, "ä").replace(/‍/g, "");
}

function repositionPrePositionedVowels(text: string) {
  const clusterPattern = `(?:[${CHARACTER_SETS.consonants}](?:[${CHARACTER_SETS.vowelSigns}])?)(?:[${CHARACTER_SETS.viramaMarkers}][${CHARACTER_SETS.consonants}])*`;
  let value = text;
  Object.entries(PREPOSITIONED_VOWELS).forEach(([mark, prefix]) => {
    const suffix = COMPOSITE_SUFFIXES[mark] ?? "";
    value = value.replace(new RegExp(`(${clusterPattern})${escapeRegex(mark)}`, "g"), `${prefix}$1${suffix}`);
  });
  return value;
}

function processConsonantClusters(text: string) {
  const consonants = CHARACTER_SETS.consonants;
  return text
    .replace(new RegExp(`ರ್(?!ರ)([${consonants}])`, "g"), "$1f")
    .replace(/ರ್/g, "rA");
}

function convertCharacters(text: string) {
  let value = text;
  const mappings = { ...INDEPENDENT_VOWELS, ...CONSONANTS, ...DEPENDENT_VOWELS, ...SIGNS };
  Object.entries(mappings).forEach(([source, target]) => {
    value = value.replace(new RegExp(escapeRegex(source), "g"), target);
  });
  return value;
}

/** Converts Kannada-script Unicode to the legacy Pingara/Baravu glyph encoding. */
export function convertKannadaToPingara(text: string) {
  let value = handleSpecialCharacterMarkers(text);
  value = preprocessText(value);
  value = repositionPrePositionedVowels(value);
  value = processConsonantClusters(value);
  value = convertCharacters(value);
  return value
    .replace(/fA([kKgGZcCjJzqQwWNtTdDnpPbBmyrlvSxshL])/g, "fXA$1")
    .replace(/ee+/g, "ee");
}

/** True only for source text that still contains Kannada-script Unicode. */
export function containsKannadaUnicode(text: string) {
  return /[\u0C80-\u0CFF]/u.test(text);
}
