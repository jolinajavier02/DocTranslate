const form = document.getElementById('upload-form');
const originalText = document.getElementById('original-text');
const translatedText = document.getElementById('translated-text');
const downloadBtn = document.getElementById('download-btn');
const libreAPI = 'https://libretranslate.de/translate';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = document.getElementById('doc-upload').files[0];
  const targetLang = document.getElementById('lang-select').value;

  if (!file) {
    alert('Please upload a file.');
    return;
  }

  let textContent = '';

  if (file.type === 'application/pdf') {
    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContentObj = await page.getTextContent();
      const pageText = textContentObj.items.map(item => item.str).join(' ');
      textContent += pageText + '\n\n';
    }
  } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    // Read text file
    textContent = await file.text();
  } else {
    alert('Unsupported file type. Please upload a PDF or TXT file.');
    return;
  }

  originalText.textContent = textContent;
  translatedText.textContent = 'Translating...';

  // Call LibreTranslate API
  try {
    const response = await fetch(libreAPI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: textContent,
        source: 'auto',
        target: targetLang,
        format: 'text'
      }),
    });

    const data = await response.json();
    translatedText.textContent = data.translatedText || 'No translation available.';
  } catch (error) {
    translatedText.textContent = 'Translation failed. Please try again later.';
    console.error(error);
  }
});

// Download translated text as .txt file
downloadBtn.addEventListener('click', () => {
  if (!translatedText.textContent.trim()) {
    alert('No translated text available to download.');
    return;
  }

  const blob = new Blob([translatedText.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'translated.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
