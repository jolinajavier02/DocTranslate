const fileInput = document.getElementById('fileInput');
const translateBtn = document.getElementById('translateBtn');
const originalTextEl = document.getElementById('originalText');
const translatedTextEl = document.getElementById('translatedText');
const languageSelect = document.getElementById('languageSelect');

async function translateText(text, targetLang) {
  const res = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    body: JSON.stringify({ q: text, source: 'auto', target: targetLang, format: 'text' }),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  return data.translatedText;
}

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

function extractTextFromImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      Tesseract.recognize(reader.result, 'eng', {
        logger: m => console.log(m)
      }).then(({ data: { text } }) => resolve(text));
    };
    reader.readAsDataURL(file);
  });
}

translateBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return alert('Please upload a document.');

  let extractedText = '';
  const fileType = file.type;

  if (fileType === 'application/pdf') {
    extractedText = await extractTextFromPDF(file);
  } else if (fileType.startsWith('image/')) {
    extractedText = await extractTextFromImage(file);
  } else if (fileType === 'text/plain') {
    extractedText = await file.text();
  } else {
    return alert('Unsupported file type.');
  }

  originalTextEl.textContent = extractedText;
  const translated = await translateText(extractedText, languageSelect.value);
  translatedTextEl.textContent = translated;
});