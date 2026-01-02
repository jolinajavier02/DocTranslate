// Initialize Lucide icons
lucide.createIcons();

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM Elements
const modeBtns = document.querySelectorAll('.mode-btn');
const textInputWrapper = document.getElementById('textInputWrapper');
const textInput = document.getElementById('textInput');
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
const uploadHint = document.getElementById('uploadHint');

let currentFile = null;
let extractedText = "";
let currentMode = "text"; // Default mode

// Mode Switching
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        updateUIForMode();
        lucide.createIcons();
    });
});

function updateUIForMode() {
    resetUpload();
    textInput.value = "";

    if (currentMode === 'text') {
        textInputWrapper.classList.remove('hidden');
        dropZone.classList.add('hidden');
        translateBtn.disabled = true;
    } else {
        textInputWrapper.classList.add('hidden');
        dropZone.classList.remove('hidden');
        translateBtn.disabled = true;

        if (currentMode === 'image') {
            uploadHint.textContent = "JPG, PNG, or WEBP (Max 10MB)";
            fileInput.accept = ".jpg,.jpeg,.png,.webp";
        } else {
            uploadHint.textContent = "PDF or TXT (Max 10MB)";
            fileInput.accept = ".pdf,.txt";
        }
    }
}

textInput.addEventListener('input', () => {
    translateBtn.disabled = textInput.value.trim().length === 0;
});

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
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isTxt = file.type === 'text/plain';

    if (currentMode === 'image' && !isImage) {
        alert('Please upload an image file (JPG, PNG, etc.)');
        return;
    }
    if (currentMode === 'files' && !isPdf && !isTxt) {
        alert('Please upload a PDF or TXT file.');
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

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const resultCanvas = document.getElementById('resultCanvas');
const canvasLoader = document.getElementById('canvasLoader');
const downloadVisualBtn = document.getElementById('downloadVisual');

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        tabContents.forEach(content => {
            if (content.id === `${target}Tab`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    });
});

async function startTranslation() {
    if (currentMode !== 'text' && !currentFile) return;
    if (currentMode === 'text' && !textInput.value.trim()) return;

    translateBtn.disabled = true;
    progressContainer.classList.remove('hidden');
    resultSection.classList.add('hidden');
    updateProgress(10, 'Processing input...');

    try {
        let ocrResult = null;

        if (currentMode === 'text') {
            extractedText = textInput.value;
        } else if (currentFile.type === 'application/pdf') {
            extractedText = await readPdf(currentFile);
            // For visual PDF, we'll render the first page as an image
            ocrResult = await performOCR(await pdfPageToImage(currentFile));
        } else if (currentMode === 'image' || currentFile.type.startsWith('image/')) {
            ocrResult = await performOCR(currentFile);
            extractedText = ocrResult.data.text;
        } else {
            extractedText = await readText(currentFile);
        }

        if (!extractedText.trim()) {
            throw new Error('No text could be extracted or found.');
        }

        updateProgress(40, 'Translating...');
        originalTextEl.innerText = extractedText;

        const translatedText = await translateText(extractedText, sourceLanguage.value, targetLanguage.value);
        translatedTextEl.innerText = translatedText;

        // Visual Translation Rendering
        if (currentMode !== 'text' && ocrResult) {
            updateProgress(80, 'Rendering visual translation...');
            await renderVisualTranslation(ocrResult);
        }

        updateProgress(100, 'Done!');

        // Show/Hide tabs based on mode
        if (currentMode === 'text') {
            document.querySelector('.tab-btn[data-tab="visual"]').classList.add('hidden');
            document.querySelector('.tab-btn[data-tab="text"]').click();
        } else {
            document.querySelector('.tab-btn[data-tab="visual"]').classList.remove('hidden');
            document.querySelector('.tab-btn[data-tab="visual"]').click();
        }

        setTimeout(() => {
            progressContainer.classList.add('hidden');
            resultSection.classList.remove('hidden');
            translateBtn.disabled = false;
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);

    } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
        updateProgress(0, 'Error occurred');
        translateBtn.disabled = false;
    }
}

async function performOCR(fileOrBlob) {
    updateProgress(20, 'Analyzing document layout...');
    return await Tesseract.recognize(fileOrBlob, 'eng+jpn+spa+fra', {
        logger: m => {
            if (m.status === 'recognizing text') {
                updateProgress(20 + (m.progress * 20), `OCR: ${Math.round(m.progress * 100)}%`);
            }
        }
    });
}

async function renderVisualTranslation(ocrResult) {
    const canvas = resultCanvas;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve) => {
        img.onload = async () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const blocks = ocrResult.data.blocks;
            const totalBlocks = blocks.length;

            // Temporary canvas for sampling background
            const sampleCanvas = document.createElement('canvas');
            const sampleCtx = sampleCanvas.getContext('2d');
            sampleCanvas.width = img.width;
            sampleCanvas.height = img.height;
            sampleCtx.drawImage(img, 0, 0);

            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                const { x0, y0, x1, y1 } = block.bbox;
                const width = x1 - x0;
                const height = y1 - y0;

                const originalBlockText = block.text.trim();
                if (!originalBlockText || originalBlockText.length < 2) continue;

                updateProgress(80 + (i / totalBlocks * 15), `Rendering: ${Math.round(i / totalBlocks * 100)}%`);

                try {
                    // 1. Sample background color (take average of corners)
                    const p1 = sampleCtx.getImageData(x0, y0, 1, 1).data;
                    const p2 = sampleCtx.getImageData(x1 - 1, y0, 1, 1).data;
                    const p3 = sampleCtx.getImageData(x0, y1 - 1, 1, 1).data;
                    const bgColor = `rgb(${Math.round((p1[0] + p2[0] + p3[0]) / 3)}, ${Math.round((p1[1] + p2[1] + p3[1]) / 3)}, ${Math.round((p1[2] + p2[2] + p3[2]) / 3)})`;

                    // 2. Translate
                    const translatedBlockText = await translateText(originalBlockText, sourceLanguage.value, targetLanguage.value);

                    // 3. Clean the area (Fill with sampled background color)
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(x0 - 2, y0 - 2, width + 4, height + 4);

                    // 4. Draw translated text
                    ctx.fillStyle = '#000000'; // Default to black for documents

                    // Calculate font size to fit the box
                    let fontSize = Math.max(10, height * 0.7);
                    ctx.font = `${fontSize}px "Outfit", sans-serif`;

                    // Simple text wrapping/fitting
                    const words = translatedBlockText.split(' ');
                    if (ctx.measureText(translatedBlockText).width > width && words.length > 1) {
                        fontSize = Math.max(8, fontSize * 0.8);
                        ctx.font = `${fontSize}px "Outfit", sans-serif`;
                    }

                    ctx.textBaseline = 'top';
                    ctx.fillText(translatedBlockText, x0, y0 + (height - fontSize) / 2);
                } catch (err) {
                    console.warn("Failed to render block:", err);
                }
            }
            resolve();
        };

        if (currentFile && currentFile.type.startsWith('image/')) {
            img.src = URL.createObjectURL(currentFile);
        } else if (ocrResult.image) {
            img.src = ocrResult.image;
        } else {
            // Fallback for PDF preview
            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            // This part is tricky if we don't have the blob, but startTranslation handles it
        }
    });
}

async function pdfPageToImage(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 }); // High res for better OCR
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

downloadVisualBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `translated_${currentFile ? currentFile.name.split('.')[0] : 'result'}.png`;
    link.href = resultCanvas.toDataURL('image/png', 1.0);
    link.click();
});

// Keep existing helper functions (readText, readPdf, translateText, splitText, downloadAsPdf)
async function readText(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
    });
}

async function readPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ') + "\n\n";
    }
    return fullText;
}

async function translateText(text, from, to) {
    if (!text.trim() || text.length < 2) return text;
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.responseData.translatedText || text;
    } catch (e) {
        return text;
    }
}

function updateProgress(percent, status) {
    progressBarFill.style.width = percent + '%';
    progressStatus.textContent = status;
}
