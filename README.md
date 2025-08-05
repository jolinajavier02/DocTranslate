# DocTranslate

DocTranslate is a simple web app that allows you to upload PDF or text documents and translate their content using the LibreTranslate API.

## Features

- Upload PDF or TXT files.
- Extract text content from PDFs.
- Translate text to multiple languages.
- Preview original and translated text side-by-side.
- Download the translated text as a `.txt` file.
- Uses LibreTranslate API (free, no API key needed).

## Setup and Deployment

1. Clone this repository.
2. Download and add `pdf.min.js` and `pdf.worker.min.js` to the `libs` folder from the [PDF.js releases](https://github.com/mozilla/pdf.js/releases).
3. Deploy on GitHub Pages, Netlify, or any static hosting service.
4. Open `public/index.html` in a browser to use.

## Notes

- Currently supports PDF and plain text files.
- LibreTranslate API endpoint is `https://libretranslate.de/translate`.
- No API key required for LibreTranslate.

## License

MIT License