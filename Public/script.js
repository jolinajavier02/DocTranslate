// Initialize Lucide icons
lucide.createIcons();

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');
const translateBtn = document.getElementById('translateBtn');
const sourceLanguage = document.getElementById('sourceLanguage');
const targetLanguage = document.getElementById('targetLanguage');
const swapLanguages = document.getElementById('swapLanguages');
const progressContainer = document.getElementById('progressContainer');
const progressBarFill = document.getElementById('progressBarFill');
const progressStatus = document.getElementById('progressStatus');
const resultSection = document.getElementById('resultSection');
const originalTextEl = document.getElementById('originalText');
const translatedTextEl = document.getElementById('translatedText');
const downloadPdfBtn = document.getElementById('downloadPdf');

let currentFile = null;
let extractedText = "";

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

removeFile.addEventListener('click', (e) => {
    e.stopPropagation();
    resetUpload();
});

swapLanguages.addEventListener('click', () => {
    const temp = sourceLanguage.value;
    if (temp !== 'auto') {
        sourceLanguage.value = targetLanguage.value;
        targetLanguage.value = temp;
    }
});

translateBtn.addEventListener('click', startTranslation);

downloadPdfBtn.addEventListener('click', downloadAsPdf);

// Copy functionality
document.querySelectorAll('.btn-icon[title="Copy"]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.closest('.result-box').querySelector('.text-content').id;
        const text = document.getElementById(targetId).innerText;
        navigator.clipboard.writeText(text).then(() => {
            const icon = btn.querySelector('i');
            const originalIcon = icon.getAttribute('data-lucide');
            icon.setAttribute('data-lucide', 'check');
            lucide.createIcons();
            setTimeout(() => {
                icon.setAttribute('data-lucide', originalIcon);
                lucide.createIcons();
            }, 2000);
        });
    });
});

// Functions
function handleFile(file) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF, Image, or Text file.');
        return;
    }

    currentFile = file;
    fileName.textContent = file.name;
    filePreview.classList.remove('hidden');
    dropZone.querySelector('.upload-content').classList.add('hidden');
    translateBtn.disabled = false;
}

function resetUpload() {
    currentFile = null;
    fileInput.value = '';
    filePreview.classList.add('hidden');
    dropZone.querySelector('.upload-content').classList.remove('hidden');
    translateBtn.disabled = true;
    resultSection.classList.add('hidden');
    progressContainer.classList.add('hidden');
}

async function startTranslation() {
    if (!currentFile) return;

    translateBtn.disabled = true;
    progressContainer.classList.remove('hidden');
    resultSection.classList.add('hidden');
    updateProgress(10, 'Reading file...');

    try {
        if (currentFile.type === 'application/pdf') {
            extractedText = await readPdf(currentFile);
        } else if (currentFile.type.startsWith('image/')) {
            extractedText = await readImage(currentFile);
        } else {
            extractedText = await readText(currentFile);
        }

        if (!extractedText.trim()) {
            throw new Error('No text could be extracted from this file.');
        }

        updateProgress(40, 'Translating...');
        originalTextEl.innerText = extractedText;

        const translatedText = await translateText(extractedText, sourceLanguage.value, targetLanguage.value);
        translatedTextEl.innerText = translatedText;

        updateProgress(100, 'Done!');
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            resultSection.classList.remove('hidden');
            translateBtn.disabled = false;
            // Scroll to results
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);

    } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
        updateProgress(0, 'Error occurred');
        translateBtn.disabled = false;
    }
}

function updateProgress(percent, status) {
    progressBarFill.style.width = percent + '%';
    progressStatus.textContent = status;
}

// File Reading Logic
async function readText(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
    });
}

async function readImage(file) {
    updateProgress(20, 'Performing OCR (Image to Text)...');
    const result = await Tesseract.recognize(file, 'eng+jpn+spa+fra', {
        logger: m => {
            if (m.status === 'recognizing text') {
                updateProgress(20 + (m.progress * 20), `OCR: ${Math.round(m.progress * 100)}%`);
            }
        }
    });
    return result.data.text;
}

async function readPdf(file) {
    updateProgress(20, 'Parsing PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + "\n\n";
        updateProgress(20 + (i / pdf.numPages * 20), `Reading Page ${i}/${pdf.numPages}...`);
    }

    return fullText;
}

// Translation Logic
async function translateText(text, from, to) {
    // Using MyMemory API (Free, no key required for basic usage)
    // Note: For large texts, we should split it into chunks
    const chunks = splitText(text, 500); // MyMemory limit is ~500 chars per request for free tier
    let translatedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
        updateProgress(40 + (i / chunks.length * 50), `Translating chunk ${i + 1}/${chunks.length}...`);
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunks[i])}&langpair=${from}|${to}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.responseStatus === 200) {
            translatedChunks.push(data.responseData.translatedText);
        } else {
            translatedChunks.push("[Translation Error]");
        }
    }

    return translatedChunks.join(' ');
}

function splitText(text, maxLength) {
    const chunks = [];
    let currentChunk = "";
    const sentences = text.split(/[.!?]\s/);

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length < maxLength) {
            currentChunk += sentence + ". ";
        } else {
            chunks.push(currentChunk.trim());
            currentChunk = sentence + ". ";
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
}

// PDF Generation
function downloadAsPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const text = translatedTextEl.innerText;
    const splitText = doc.splitTextToSize(text, 180);

    doc.setFontSize(16);
    doc.text("Translated Document", 10, 20);
    doc.setFontSize(12);
    doc.text(splitText, 10, 30);

    doc.save(`translated_${currentFile ? currentFile.name : 'document'}.pdf`);
}
