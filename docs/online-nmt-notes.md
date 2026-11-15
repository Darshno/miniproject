# Online NMT provider note

TuluTalk now calls the live Google Translate web translation endpoint from the browser using `en`, `kn`, and Tulu's ISO 639-3 code `tcy`. The request is keyless and the app falls back to the local phrase dictionary if the online request fails.

This is intentionally the public web endpoint rather than Google Cloud Translation. Google's current Cloud Translation NMT language list includes English and Kannada but does not list Tulu, while the live Translate web UI currently exposes Tulu. The web endpoint is not a contractual public API, so it may change or rate-limit requests; a future production deployment should replace it with a supported backend provider or a self-hosted Tulu model.

## Tulu script rendering

The supplied `Pingara_Tulu_Font_V5.otf` uses legacy ASCII code points rather than Unicode Tulu characters. TuluTalk keeps the online response in Kannada-script Unicode for speech and API requests, converts it to Pingara glyph encoding for visual output, and copies the Pingara-encoded text when the user copies a Tulu result. The conversion follows the open Kannada-to-Tulu converter maintained at `chandukaup/convert2tulu`.

## Alphabet chart scope

The Tulu chart is a practical base-letter reference using the supplied Pingara font. The Kodava chart is intentionally labeled as a Kannada-script reference: Kodava Takk is commonly written in Kannada, while dedicated Kodava scripts are not yet a settled Unicode system.

Sources:

- https://translate.google.com/
- https://docs.cloud.google.com/translate/docs/languages
- https://arxiv.org/html/2403.19142v1
- https://github.com/manunarayanan/Tulu-NMT
- https://github.com/chandukaup/convert2tulu
- https://jaitulunad.in/tulu-lipi-chart/
- https://www.alphabetsymbol.com/tulu-alphabet/
- https://www.kodavatakk.org/about
- https://en.wikipedia.org/wiki/Kodava_language
