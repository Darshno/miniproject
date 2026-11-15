# TuluTalk Translator

## Build the responsive translator workspace
- [x] The product lets users enter Kannada, English, or Tulu text with clearly labeled source and target language selectors.
- [x] The experience is responsive, keyboard-accessible on mobile and desktop, and includes clear focus states and appropriate labels.
- [x] The visual treatment uses warm sunny colors, rounded pills, layered hand-painted shapes, expressive typography, and gentle motion inspired by the supplied Meadowbell reference.

## Deliver the online translation flow
- [x] Translation first uses the online Google Translate web NMT endpoint with English (`en`), Kannada (`kn`), and Tulu (`tcy`) language codes.
- [x] A prominent Translate action provides loading/interaction feedback and a clear result area.
- [x] A one-tap source and target language swap preserves the current translation context.
- [x] If online NMT is unavailable, the app falls back to the curated in-app phrase dictionary and shows helpful retry guidance.
- [x] Tulu outputs render with the supplied Pingara Tulu font after Kannada-to-Tulu glyph conversion, while keeping the Unicode response available for speech and online requests.

## Preserve Unicode and Pingara representations
- [x] Raw Kannada-script Unicode remains the translation result used by API requests, dictionary lookups, speech synthesis, and LLM-facing data.
- [x] The existing convert2tulu-derived converter runs only for Tulu visual rendering and Pingara-formatted copying, with a guard that leaves already encoded text unchanged.
- [x] Separate Copy Unicode and Copy Pingara actions return the correct representation, with temporary debug output showing both values.

## Add the alphabet charts tab
- [x] A separate top-level Alphabet charts tab is available alongside the Translator tab.
- [x] The Tulu chart shows Pingara-rendered vowels and consonants with Roman labels.
- [x] The Kodava Takk chart shows a practical Kannada-script reference with vowels, core consonants, Roman labels, and a script note.

## Add result utilities and examples
- [x] Users can copy translated text to the clipboard with accessible success feedback.
- [x] Users can listen to the translated result through available browser speech synthesis, with graceful handling when a voice is unavailable.
- [x] Browsable example phrases populate the translator for quick trials.

## Refine the product interface
- [x] The translator is the visual focus with a specific headline, larger workspace, stronger CTA, and clearer grouping.
- [x] Filler badges, redundant panel labels, decorative grain, and random italics are removed or reduced.
- [x] Shared design tokens now control color, accent, radius, contrast, spacing, and tabular numerals.
- [x] Loading, copy-success, and translated-result feedback use purposeful states and motion.
