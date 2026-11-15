import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  BookOpen,
  Check,
  ChevronDown,
  Clipboard,
  Info,
  Leaf,
  Lightbulb,
  Languages,
  RotateCcw,
  Send,
  Sun,
  Volume2,
} from "lucide-react";
import { containsKannadaUnicode, convertKannadaToPingara } from "../lib/tuluConverter";

type Language = "English" | "Kannada" | "Tulu";
type CopyKind = "unicode" | "pingara" | null;

type Phrase = {
  english: string;
  kannada: string;
  tulu: string;
  note: string;
};

const LANGUAGES: Language[] = ["English", "Kannada", "Tulu"];

const LANGUAGE_CODES: Record<Language, string> = {
  English: "en",
  Kannada: "kn",
  Tulu: "tcy",
};

const PHRASES: Phrase[] = [
  {
    english: "Hello, how are you?",
    kannada: "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?",
    tulu: "ನಮಸ್ಕಾರ, ಎಂಚ ಉಲ್ಲರ್?",
    note: "A warm everyday greeting",
  },
  {
    english: "Good morning",
    kannada: "ಶುಭೋದಯ",
    tulu: "ಬೊಕ್ಕ ಬಯಲಾದ್",
    note: "A bright start to the day",
  },
  {
    english: "Thank you very much",
    kannada: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
    tulu: "ತುಂಬ ಧನ್ಯವಾದ",
    note: "A little extra gratitude",
  },
  {
    english: "Where is the market?",
    kannada: "ಮಾರುಕಟ್ಟೆ ಎಲ್ಲಿದೆ?",
    tulu: "ಅಂಗಡಿ ಎಲ್ಲಿ ಉಂಡು?",
    note: "Useful when exploring town",
  },
  {
    english: "I am learning Tulu",
    kannada: "ನಾನು ತುಳು ಕಲಿಯುತ್ತಿದ್ದೇನೆ",
    tulu: "ಯಾನ್ ತುಳು ಕಲ್ಪುನಿ",
    note: "A proud learner's phrase",
  },
  {
    english: "See you tomorrow",
    kannada: "ನಾಳೆ ಭೇಟಿಯಾಗೋಣ",
    tulu: "ನಾಳೆ ಸಿಕ್ಕೊಡು",
    note: "A friendly sign-off",
  },
];

const getPhraseValue = (phrase: Phrase, language: Language) => {
  if (language === "Kannada") return phrase.kannada;
  if (language === "Tulu") return phrase.tulu;
  return phrase.english;
};

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

function findPhrase(value: string, source: Language) {
  const normalized = normalize(value);
  return PHRASES.find((phrase) => normalize(getPhraseValue(phrase, source)) === normalized);
}

function selectLabel(language: Language) {
  if (language === "Kannada") return "ಕನ್ನಡ";
  if (language === "Tulu") return "ತುಳು";
  return "English";
}

function displayText(text: string, language: Language) {
  return language === "Tulu" && containsKannadaUnicode(text) ? convertKannadaToPingara(text) : text;
}

type AlphabetLetter = { glyph: string; roman: string; sound?: string };

const TULU_VOWELS: AlphabetLetter[] = [
  { glyph: "ಅ", roman: "a", sound: "as in about" }, { glyph: "ಆ", roman: "ā", sound: "long a" },
  { glyph: "ಇ", roman: "i", sound: "as in sit" }, { glyph: "ಈ", roman: "ī", sound: "long i" },
  { glyph: "ಉ", roman: "u", sound: "as in put" }, { glyph: "ಊ", roman: "ū", sound: "long u" },
  { glyph: "ಋ", roman: "ṛ", sound: "vocalic r" }, { glyph: "ೠ", roman: "ṝ", sound: "long vocalic r" },
  { glyph: "ಎ", roman: "e", sound: "short e" }, { glyph: "ಏ", roman: "ē", sound: "long e" },
  { glyph: "ಐ", roman: "ai", sound: "as in aisle" }, { glyph: "ಒ", roman: "o", sound: "short o" },
  { glyph: "ಓ", roman: "ō", sound: "long o" }, { glyph: "ಔ", roman: "au", sound: "as in out" },
];

const TULU_CONSONANTS: AlphabetLetter[] = [
  { glyph: "ಕ", roman: "ka" }, { glyph: "ಖ", roman: "kha" }, { glyph: "ಗ", roman: "ga" }, { glyph: "ಘ", roman: "gha" }, { glyph: "ಙ", roman: "ṅa" },
  { glyph: "ಚ", roman: "ca" }, { glyph: "ಛ", roman: "cha" }, { glyph: "ಜ", roman: "ja" }, { glyph: "ಝ", roman: "jha" }, { glyph: "ಞ", roman: "ña" },
  { glyph: "ಟ", roman: "ṭa" }, { glyph: "ಠ", roman: "ṭha" }, { glyph: "ಡ", roman: "ḍa" }, { glyph: "ಢ", roman: "ḍha" }, { glyph: "ಣ", roman: "ṇa" },
  { glyph: "ತ", roman: "ta" }, { glyph: "ಥ", roman: "tha" }, { glyph: "ದ", roman: "da" }, { glyph: "ಧ", roman: "dha" }, { glyph: "ನ", roman: "na" },
  { glyph: "ಪ", roman: "pa" }, { glyph: "ಫ", roman: "pha" }, { glyph: "ಬ", roman: "ba" }, { glyph: "ಭ", roman: "bha" }, { glyph: "ಮ", roman: "ma" },
  { glyph: "ಯ", roman: "ya" }, { glyph: "ರ", roman: "ra" }, { glyph: "ಲ", roman: "la" }, { glyph: "ವ", roman: "va" }, { glyph: "ಶ", roman: "śa" },
  { glyph: "ಷ", roman: "ṣa" }, { glyph: "ಸ", roman: "sa" }, { glyph: "ಹ", roman: "ha" }, { glyph: "ಳ", roman: "ḷa" },
];

const KODAVA_VOWELS: AlphabetLetter[] = [
  { glyph: "ಅ", roman: "a", sound: "short open vowel" }, { glyph: "ಆ", roman: "ā", sound: "long a" },
  { glyph: "ಇ", roman: "i", sound: "short i" }, { glyph: "ಈ", roman: "ī", sound: "long i" },
  { glyph: "ಉ", roman: "u", sound: "short u" }, { glyph: "ಊ", roman: "ū", sound: "long u" },
  { glyph: "ಎ", roman: "e", sound: "short e" }, { glyph: "ಏ", roman: "ē", sound: "long e" },
  { glyph: "ಐ", roman: "ai", sound: "diphthong" }, { glyph: "ಒ", roman: "o", sound: "short o" },
  { glyph: "ಓ", roman: "ō", sound: "long o" }, { glyph: "ಔ", roman: "au", sound: "diphthong" },
  { glyph: "ಅಂ", roman: "aṁ", sound: "anusvara" }, { glyph: "ಅಃ", roman: "aḥ", sound: "visarga" },
];

const KODAVA_CONSONANTS: AlphabetLetter[] = [
  { glyph: "ಕ", roman: "ka" }, { glyph: "ಖ", roman: "kha" }, { glyph: "ಗ", roman: "ga" }, { glyph: "ಘ", roman: "gha" }, { glyph: "ಙ", roman: "ṅa" },
  { glyph: "ಚ", roman: "ca" }, { glyph: "ಛ", roman: "cha" }, { glyph: "ಜ", roman: "ja" }, { glyph: "ಝ", roman: "jha" }, { glyph: "ಞ", roman: "ña" },
  { glyph: "ಟ", roman: "ṭa" }, { glyph: "ಠ", roman: "ṭha" }, { glyph: "ಡ", roman: "ḍa" }, { glyph: "ಢ", roman: "ḍha" }, { glyph: "ಣ", roman: "ṇa" },
  { glyph: "ತ", roman: "ta" }, { glyph: "ಥ", roman: "tha" }, { glyph: "ದ", roman: "da" }, { glyph: "ಧ", roman: "dha" }, { glyph: "ನ", roman: "na" },
  { glyph: "ಪ", roman: "pa" }, { glyph: "ಫ", roman: "pha" }, { glyph: "ಬ", roman: "ba" }, { glyph: "ಭ", roman: "bha" }, { glyph: "ಮ", roman: "ma" },
  { glyph: "ಯ", roman: "ya" }, { glyph: "ರ", roman: "ra" }, { glyph: "ಲ", roman: "la" }, { glyph: "ವ", roman: "va" }, { glyph: "ಶ", roman: "śa" },
  { glyph: "ಷ", roman: "ṣa" }, { glyph: "ಸ", roman: "sa" }, { glyph: "ಹ", roman: "ha" }, { glyph: "ಳ", roman: "ḷa" },
];

function AlphabetGrid({ letters, tulu }: { letters: AlphabetLetter[]; tulu?: boolean }) {
  return <div className="alphabet-grid">{letters.map((letter) => <div className="alphabet-cell" key={`${letter.glyph}-${letter.roman}`}><span className={`alphabet-glyph ${tulu ? "tulu-script" : ""}`}>{tulu ? convertKannadaToPingara(letter.glyph) : letter.glyph}</span><span className="alphabet-roman">{letter.roman}</span>{letter.sound && <span className="alphabet-sound">{letter.sound}</span>}</div>)}</div>;
}

function AlphabetCharts() {
  const [chart, setChart] = useState<"tulu" | "kodava">("tulu");
  const isTulu = chart === "tulu";

  return <section className="alphabet-page" aria-labelledby="alphabet-title">
    <div className="alphabet-hero">
      <div className="eyebrow"><span className="eyebrow-dot" /> Learn the shapes behind the words</div>
      <h1 id="alphabet-title">Learn the <span>letters</span>.</h1>
      <p>Explore a quick visual reference for Tulu and Kodava Takk. Tulu uses the supplied Pingara script font here; Kodava is shown in its commonly used Kannada-script form.</p>
    </div>
    <div className="chart-tabs" role="tablist" aria-label="Alphabet chart language">
      <button type="button" role="tab" aria-selected={isTulu} className={isTulu ? "active" : ""} onClick={() => setChart("tulu")}><span className="chart-tab-mark"><Leaf size={17} /></span><span><strong>Tulu</strong><small>Tulu Lipi · Pingara</small></span></button>
      <button type="button" role="tab" aria-selected={!isTulu} className={!isTulu ? "active" : ""} onClick={() => setChart("kodava")}><span className="chart-tab-mark kodava-mark"><Languages size={17} /></span><span><strong>Kodava Takk</strong><small>ಕನ್ನಡ script reference</small></span></button>
    </div>
    <div className="alphabet-card" role="tabpanel">
      <div className="alphabet-card-heading"><div><p className="section-kicker">{isTulu ? "TULU LIPI" : "KODAVA TAKK"}</p><h2>{isTulu ? "Tulu alphabet" : "Kodava alphabet reference"}</h2></div><span className="alphabet-count">{isTulu ? "14 vowels · 34 consonants" : "14 vowels · 34 consonants"}</span></div>
      <div className="alphabet-section"><div className="alphabet-section-title"><h3>Vowels</h3><span>{isTulu ? "Svara" : "Svara · vowel forms"}</span></div><AlphabetGrid letters={isTulu ? TULU_VOWELS : KODAVA_VOWELS} tulu={isTulu} /></div>
      <div className="alphabet-section"><div className="alphabet-section-title"><h3>Consonants</h3><span>{isTulu ? "Vyañjana" : "Vyañjana · core set"}</span></div><AlphabetGrid letters={isTulu ? TULU_CONSONANTS : KODAVA_CONSONANTS} tulu={isTulu} /></div>
      <div className="chart-note"><Info size={17} /><p>{isTulu ? "Tulu is commonly written in Kannada today, while the traditional Tulu-Tigalari script is also available in Unicode. This view uses your Pingara font for the Tulu glyphs." : "Kodava Takk is mostly written in Kannada script. Dedicated Kodava scripts exist, but they are not yet a settled Unicode writing system, so this chart is a practical Kannada-script reference."}</p></div>
    </div>
  </section>;
}

async function translateOnline(text: string, source: Language, target: Language) {
  if (source === target) return text;

  const params = new URLSearchParams({
    client: "gtx",
    sl: LANGUAGE_CODES[source],
    tl: LANGUAGE_CODES[target],
    dt: "t",
    q: text,
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) throw new Error(`Online translation failed with ${response.status}`);

  const payload = await response.json() as unknown;
  const segments = Array.isArray(payload) && Array.isArray(payload[0]) ? payload[0] : [];
  const translation = segments
    .filter((segment): segment is unknown[] => Array.isArray(segment) && typeof segment[0] === "string")
    .map((segment) => segment[0] as string)
    .join("")
    .trim();

  if (!translation) throw new Error("Online translation returned no text");
  return translation;
}

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState<Language>("English");
  const [targetLanguage, setTargetLanguage] = useState<Language>("Tulu");
  const [sourceText, setSourceText] = useState("Hello, how are you?");
  const [result, setResult] = useState("ನಮಸ್ಕಾರ, ಎಂಚ ಉಲ್ಲರ್?");
  const [status, setStatus] = useState<"idle" | "translating" | "translated" | "fallback">("translated");
  const [copiedKind, setCopiedKind] = useState<CopyKind>(null);
  const [isListening, setIsListening] = useState(false);
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [activeTab, setActiveTab] = useState<"translate" | "alphabets">("translate");

  const activePhrase = useMemo(() => findPhrase(sourceText, sourceLanguage), [sourceText, sourceLanguage]);
  const visibleExamples = showAllExamples ? PHRASES : PHRASES.slice(0, 3);

  const translate = async () => {
    if (!sourceText.trim()) {
      setResult("Type a phrase above and TuluTalk will find the closest match.");
      setStatus("fallback");
      return;
    }

    setStatus("translating");
    setCopiedKind(null);
    try {
      const onlineTranslation = await translateOnline(sourceText.trim(), sourceLanguage, targetLanguage);
      setResult(onlineTranslation);
      setStatus("translated");
    } catch {
      const phrase = findPhrase(sourceText, sourceLanguage);
      if (phrase) {
        setResult(getPhraseValue(phrase, targetLanguage));
        setStatus("translated");
      } else {
        setResult("The online translator is unavailable right now. Try again in a moment, or choose one of the example phrases below.");
        setStatus("fallback");
      }
    }
  };

  const swapLanguages = () => {
    const nextSource = targetLanguage;
    const nextTarget = sourceLanguage;
    setSourceLanguage(nextSource);
    setTargetLanguage(nextTarget);
    setSourceText(result);
    setResult(sourceText);
    setStatus("translated");
    setCopiedKind(null);
  };

  const copyResult = async (kind: Exclude<CopyKind, null>) => {
    if (!result || status === "fallback") return;
    if (kind === "pingara" && targetLanguage !== "Tulu") return;
    const value = kind === "unicode" ? result : displayText(result, targetLanguage);
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKind(kind);
      window.setTimeout(() => setCopiedKind(null), 1800);
    } catch {
      setCopiedKind(null);
    }
  };

  const listen = () => {
    if (!("speechSynthesis" in window) || !result || status === "fallback") {
      setStatus("fallback");
      setResult("Your browser does not have speech playback available for this phrase yet.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result);
    utterance.lang = targetLanguage === "Kannada" ? "kn-IN" : targetLanguage === "Tulu" ? "tcy-IN" : "en-IN";
    utterance.rate = 0.85;
    utterance.onstart = () => setIsListening(true);
    utterance.onend = () => setIsListening(false);
    utterance.onerror = () => setIsListening(false);
    window.speechSynthesis.speak(utterance);
  };

  const useExample = (phrase: Phrase) => {
    setSourceText(getPhraseValue(phrase, sourceLanguage));
    setResult(getPhraseValue(phrase, targetLanguage));
    setStatus("translated");
    setCopiedKind(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <div className="sky-wash sky-wash-left" aria-hidden="true" />
      <div className="sky-wash sky-wash-right" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="site-header page-width">
        <a href="#top" className="brand" aria-label="TuluTalk home">
          <span className="brand-mark"><Leaf size={19} strokeWidth={2.7} /></span>
          <span className="brand-name">TuluTalk</span>
        </a>
        <nav className="top-nav" aria-label="Main navigation">
          <button type="button" onClick={() => setActiveTab("translate")}>Translator</button>
          <button type="button" onClick={() => setActiveTab("alphabets")}>Alphabet charts</button>
          <a href="#about">About Tulu</a>
        </nav>
        <button className="round-icon-button theme-button" type="button" aria-label="Switch theme">
          <Sun size={18} />
        </button>
      </header>

      <main id="top" className="page-width">
        <div className="app-tabs" role="tablist" aria-label="TuluTalk sections">
          <button type="button" role="tab" aria-selected={activeTab === "translate"} className={activeTab === "translate" ? "active" : ""} onClick={() => setActiveTab("translate")}><Send size={15} /> Translator</button>
          <button type="button" role="tab" aria-selected={activeTab === "alphabets"} className={activeTab === "alphabets" ? "active" : ""} onClick={() => setActiveTab("alphabets")}><BookOpen size={15} /> Alphabet charts</button>
        </div>
        {activeTab === "translate" ? <>
        <section className="hero-copy" aria-labelledby="page-title">
          <h1 id="page-title">Translate Tulu.<br />Keep the <span>meaning.</span></h1>
          <p className="hero-subtitle">Translate everyday phrases between English, Kannada, and Tulu. See Tulu in Pingara script while the original Unicode stays ready to copy, speak, and reuse.</p>
        </section>

        <section id="translator" className="translator-card" aria-label="Translator">
          <div className="card-topline">
            <div>
              <h2 className="translator-title">Your translation workspace</h2>
              <p className="section-description">Write a phrase, choose the languages, and translate.</p>
            </div>
            <button type="button" className="translate-button top-translate-button" onClick={translate} disabled={status === "translating"}><Send size={17} /> {status === "translating" ? "Translating…" : "Translate phrase"}</button>
          </div>

          <div className="language-bar">
            <label className="language-control">
              <span>From</span>
              <div className="select-wrap">
                <select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value as Language)} aria-label="Source language">
                  {LANGUAGES.map((language) => <option key={language} value={language}>{selectLabel(language)}</option>)}
                </select>
                <ChevronDown size={17} aria-hidden="true" />
              </div>
            </label>
            <button className="swap-button" type="button" onClick={swapLanguages} aria-label={`Swap ${sourceLanguage} and ${targetLanguage}`} title="Swap languages"><ArrowDownUp size={18} /></button>
            <label className="language-control">
              <span>To</span>
              <div className="select-wrap">
                <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value as Language)} aria-label="Target language">
                  {LANGUAGES.map((language) => <option key={language} value={language}>{selectLabel(language)}</option>)}
                </select>
                <ChevronDown size={17} aria-hidden="true" />
              </div>
            </label>
          </div>

          <div className="translation-grid">
            <div className="language-panel input-panel">
              <div className="panel-heading"><span className="panel-language">{sourceLanguage}</span></div>
              <textarea value={sourceText} onChange={(event) => { setSourceText(event.target.value); setStatus("idle"); }} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") translate(); }} placeholder="Type something to translate..." aria-label={`Text in ${sourceLanguage}`} />
              <div className="input-footer"><span>{sourceText.length}/500</span><button type="button" className="mini-action" onClick={() => { setSourceText(""); setResult(""); setStatus("idle"); }} aria-label="Clear input"><RotateCcw size={14} /> Clear</button></div>
            </div>

            <div className="language-panel output-panel">
              <div className="panel-heading"><span className="panel-language output-tag">{targetLanguage}</span></div>
              <div className={`translation-result status-${status} ${status === "fallback" ? "is-fallback" : ""} ${targetLanguage === "Tulu" && status !== "fallback" ? "tulu-script" : ""}`} aria-live="polite">{status === "translating" ? <span className="loading-line"><span /><span /><span /></span> : result ? displayText(result, targetLanguage) : "Your translation will appear here."}</div>
              <div className="result-footer">
                <span className="result-note">{status === "fallback" ? <><Lightbulb size={14} /> Try a phrase from the garden below</> : activePhrase?.note ?? "A clear, simple translation"}</span>
                <div className="result-actions">
                  <button type="button" className={`icon-action ${isListening ? "is-active" : ""}`} onClick={listen} aria-label="Listen to translation" title="Listen"><Volume2 size={17} /></button>
                  <button type="button" className={`copy-action ${copiedKind === "unicode" ? "is-active" : ""}`} onClick={() => copyResult("unicode")} disabled={!result || status === "fallback"} aria-label="Copy Unicode translation" title="Copy original Unicode translation">{copiedKind === "unicode" ? <Check size={14} /> : <Clipboard size={14} />} Unicode</button>
                  <button type="button" className={`copy-action ${copiedKind === "pingara" ? "is-active" : ""}`} onClick={() => copyResult("pingara")} disabled={targetLanguage !== "Tulu" || !result || status === "fallback"} aria-label="Copy Pingara-formatted translation" title="Copy Pingara-formatted text">{copiedKind === "pingara" ? <Check size={14} /> : <Clipboard size={14} />} Pingara</button>
                </div>
              </div>
              <details className="debug-panel">
                <summary>Temporary debug output</summary>
                <div className="debug-row"><span>Raw Unicode</span><code>{result || "—"}</code></div>
                <div className="debug-row"><span>Pingara output</span><code>{result && targetLanguage === "Tulu" ? displayText(result, targetLanguage) : "—"}</code></div>
              </details>
            </div>
          </div>

          <div className="translate-row">
            <span className="shortcut-hint"><kbd>⌘</kbd><kbd>Enter</kbd> to translate</span>
            <span className="translate-status">Online translation with local phrase fallback</span>
          </div>
        </section>

        <section id="phrases" className="phrase-section" aria-labelledby="phrases-title">
          <div className="section-heading-row"><div><h2 id="phrases-title">Try a common phrase</h2><p className="section-description">Start with one of these examples.</p></div><button type="button" className="text-button" onClick={() => setShowAllExamples(!showAllExamples)}>{showAllExamples ? "Show less" : "Show all"} <ChevronDown size={16} className={showAllExamples ? "rotate-chevron" : ""} /></button></div>
          <div className="phrase-grid">
            {visibleExamples.map((phrase, index) => <button key={phrase.english} type="button" className={`phrase-card phrase-card-${index + 1}`} onClick={() => useExample(phrase)}><span className="phrase-number">0{index + 1}</span><span className={`phrase-main ${sourceLanguage === "Tulu" ? "tulu-script" : ""}`}>{displayText(getPhraseValue(phrase, sourceLanguage), sourceLanguage)}</span><span className="phrase-arrow">↗</span><span className="phrase-note">{phrase.note}</span></button>)}
          </div>
        </section>

        <section id="about" className="about-strip" aria-label="About this translator">
          <div className="about-copy"><p className="section-kicker">ABOUT TULUTALK</p><h2>Built for everyday language exchange.</h2><p>TuluTalk translates English, Kannada, and Tulu online, with a local phrase fallback when the network is unavailable.</p></div>
          <div className="about-stat"><span className="stat-number">03</span><span>languages<br />supported</span></div>
        </section>
        </> : <AlphabetCharts />}

        <footer className="site-footer"><div className="footer-brand"><span className="brand-mark"><Leaf size={16} /></span> TuluTalk</div><span>Made for curious conversations · 2026</span><a href="#top">Back to top ↑</a></footer>
      </main>
    </div>
  );
}
