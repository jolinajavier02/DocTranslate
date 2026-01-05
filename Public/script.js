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
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const originalCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const canvasLoader = document.getElementById('canvasLoader');
const downloadVisualBtn = document.getElementById('downloadVisual');

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
        checkTranslateButtonState();
    } else {
        textInputWrapper.classList.add('hidden');
        dropZone.classList.remove('hidden');
        checkTranslateButtonState();

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
    checkTranslateButtonState();
});

// Listen for target language changes
targetLanguage.addEventListener('change', () => {
    checkTranslateButtonState();
});

// Function to check if translate button should be enabled
function checkTranslateButtonState() {
    const hasTargetLanguage = targetLanguage.value !== '';

    if (currentMode === 'text') {
        translateBtn.disabled = !hasTargetLanguage || textInput.value.trim().length === 0;
    } else {
        translateBtn.disabled = !hasTargetLanguage || !currentFile;
    }
}

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
    checkTranslateButtonState();
}

function resetUpload() {
    currentFile = null;
    fileInput.value = '';
    filePreview.classList.add('hidden');
    dropZone.querySelector('.upload-content').classList.remove('hidden');
    checkTranslateButtonState();
    resultSection.classList.add('hidden');
    progressContainer.classList.add('hidden');
}

async function startTranslation() {
    if (currentMode !== 'text' && !currentFile) return;
    if (currentMode === 'text' && !textInput.value.trim()) return;
    if (!targetLanguage.value) {
        alert('Please select a target language first.');
        return;
    }

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

        let translatedText;
        if (currentMode === 'text') {
            // Preserve paragraph structure for text mode
            translatedText = await translateWithParagraphs(extractedText, sourceLanguage.value, targetLanguage.value);
        } else {
            translatedText = await translateWithParagraphs(extractedText, sourceLanguage.value, targetLanguage.value);
        }
        translatedTextEl.innerText = translatedText;

        if (currentMode !== 'text' && ocrResult) {
            updateProgress(80, 'Rendering visual translation...');
            const visualSource = currentFile.type === 'application/pdf' ? await pdfPageToImage(currentFile) : currentFile;
            await renderVisualTranslation(ocrResult, visualSource);
        }

        updateProgress(100, 'Done!');

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

async function renderVisualTranslation(ocrResult, imageSource) {
    const canvas = resultCanvas;
    const ctx = canvas.getContext('2d');
    const origCtx = originalCanvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve, reject) => {
        img.onload = async () => {
            try {
                canvas.width = img.width;
                canvas.height = img.height;
                originalCanvas.width = img.width;
                originalCanvas.height = img.height;

                origCtx.drawImage(img, 0, 0);
                ctx.drawImage(img, 0, 0);

                // Show result section immediately so user sees the original image
                resultSection.classList.remove('hidden');
                resultSection.scrollIntoView({ behavior: 'smooth' });

                const blocks = ocrResult.data.blocks.filter(b => b.text.trim().length > 1);
                const totalBlocks = blocks.length;

                if (totalBlocks === 0) {
                    resolve();
                    return;
                }

                // Parallel translation for "Google-like" speed
                const allTexts = blocks.map(b => b.text.trim());
                updateProgress(60, 'Translating document content...');

                // We'll translate in parallel but in small batches to respect API limits
                const translatedTexts = [];
                const batchSize = 3; // Small batches to avoid rate limiting
                for (let i = 0; i < allTexts.length; i += batchSize) {
                    const batch = allTexts.slice(i, i + batchSize);
                    const results = await Promise.all(batch.map(text => translateText(text, sourceLanguage.value, targetLanguage.value)));
                    translatedTexts.push(...results);
                    updateProgress(60 + (i / allTexts.length * 20), `Translating: ${Math.round(i / allTexts.length * 100)}%`);
                }

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
                    const translatedText = (translatedTexts[i] || blocks[i].text).trim();

                    if (!translatedText || width < 10 || height < 5) continue;

                    // 1. Enhanced background sampling - multiple points for accuracy
                    const samplePoints = [
                        sampleCtx.getImageData(Math.max(0, x0), Math.max(0, y0), 1, 1).data,
                        sampleCtx.getImageData(Math.min(img.width - 1, x1 - 1), Math.max(0, y0), 1, 1).data,
                        sampleCtx.getImageData(Math.max(0, x0), Math.min(img.height - 1, y1 - 1), 1, 1).data,
                        sampleCtx.getImageData(Math.min(img.width - 1, x1 - 1), Math.min(img.height - 1, y1 - 1), 1, 1).data
                    ];

                    const avgR = Math.round(samplePoints.reduce((sum, p) => sum + p[0], 0) / 4);
                    const avgG = Math.round(samplePoints.reduce((sum, p) => sum + p[1], 0) / 4);
                    const avgB = Math.round(samplePoints.reduce((sum, p) => sum + p[2], 0) / 4);
                    const bgColor = `rgb(${avgR}, ${avgG}, ${avgB})`;

                    // 2. Clean the area precisely
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(x0, y0, width, height);

                    // 3. Enhanced contrast detection
                    const brightness = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
                    ctx.fillStyle = brightness > 128 ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)';

                    // 4. Smart font sizing
                    let fontSize = Math.max(7, Math.min(height * 0.75, 48));
                    ctx.font = `600 ${fontSize}px "Outfit", sans-serif`;

                    // 5. Intelligent text wrapping
                    const words = translatedText.split(/\s+/);
                    let lines = [];
                    let currentLine = '';

                    for (const word of words) {
                        const testLine = currentLine ? currentLine + ' ' + word : word;
                        const metrics = ctx.measureText(testLine);

                        if (metrics.width > width - 4 && currentLine) {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            currentLine = testLine;
                        }
                    }
                    if (currentLine) lines.push(currentLine);

                    // 6. Adjust font to fit height
                    const lineHeight = fontSize * 1.15;
                    let totalTextHeight = lines.length * lineHeight;

                    while (totalTextHeight > height && fontSize > 7) {
                        fontSize -= 0.5;
                        ctx.font = `600 ${fontSize}px "Outfit", sans-serif`;

                        lines = [];
                        currentLine = '';
                        for (const word of words) {
                            const testLine = currentLine ? currentLine + ' ' + word : word;
                            const metrics = ctx.measureText(testLine);

                            if (metrics.width > width - 4 && currentLine) {
                                lines.push(currentLine);
                                currentLine = word;
                            } else {
                                currentLine = testLine;
                            }
                        }
                        if (currentLine) lines.push(currentLine);
                        totalTextHeight = lines.length * fontSize * 1.15;
                    }

                    // 7. Detect alignment from block position
                    const blockCenterX = (x0 + x1) / 2;
                    const imageCenterX = img.width / 2;
                    const isLeftSide = blockCenterX < imageCenterX * 0.7;
                    const isRightSide = blockCenterX > imageCenterX * 1.3;

                    let textAlign = 'left';
                    let textX = x0 + 2;

                    if (isRightSide) {
                        textAlign = 'right';
                        textX = x1 - 2;
                    } else if (!isLeftSide) {
                        textAlign = 'center';
                        textX = (x0 + x1) / 2;
                    }

                    ctx.textAlign = textAlign;
                    ctx.textBaseline = 'top';

                    // 8. Subtle shadow for depth
                    ctx.shadowBlur = 0.5;
                    ctx.shadowColor = brightness > 128 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

                    // 9. Draw lines with proper spacing
                    const finalLineHeight = fontSize * 1.15;
                    const startY = y0 + Math.max(0, (height - totalTextHeight) / 2);

                    lines.forEach((line, index) => {
                        ctx.fillText(line, textX, startY + index * finalLineHeight);
                    });

                    ctx.shadowBlur = 0;
                }
                resolve();
            } catch (err) {
                console.error("Visual render error:", err);
                reject(err);
            }
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(imageSource);
    });
}

async function pdfPageToImage(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

downloadVisualBtn.addEventListener('click', () => {
    // Create a combined canvas for side-by-side download
    const combinedCanvas = document.createElement('canvas');
    const combinedCtx = combinedCanvas.getContext('2d');

    combinedCanvas.width = originalCanvas.width + resultCanvas.width + 20; // 20px gap
    combinedCanvas.height = Math.max(originalCanvas.height, resultCanvas.height) + 60; // Extra space for labels

    // Fill background
    combinedCtx.fillStyle = '#ffffff';
    combinedCtx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

    // Draw labels
    combinedCtx.fillStyle = '#000000';
    combinedCtx.font = 'bold 24px sans-serif';
    combinedCtx.fillText('Original', 10, 30);
    combinedCtx.fillText('Translated', originalCanvas.width + 30, 30);

    // Draw canvases
    combinedCtx.drawImage(originalCanvas, 10, 50);
    combinedCtx.drawImage(resultCanvas, originalCanvas.width + 30, 50);

    const link = document.createElement('a');
    link.download = `comparison_${currentFile ? currentFile.name.split('.')[0] : 'result'}.png`;
    link.href = combinedCanvas.toDataURL('image/png', 1.0);
    link.click();
});

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

async function translateWordByWord(text, from, to) {
    if (!text.trim()) return text;

    // Split text into words while preserving punctuation and spacing
    const words = text.match(/\S+|\s+/g) || [];
    const translatedWords = [];

    // Translate in batches of 10 words for efficiency
    const batchSize = 10;
    for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        const wordPromises = batch.map(async (word) => {
            // Skip whitespace and punctuation-only strings
            if (/^\s+$/.test(word) || /^[^\w]+$/.test(word)) {
                return word;
            }

            try {
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${from}|${to}`;
                const response = await fetch(url);
                const data = await response.json();
                return data.responseData.translatedText || word;
            } catch (e) {
                return word;
            }
        });

        const translatedBatch = await Promise.all(wordPromises);
        translatedWords.push(...translatedBatch);

        // Update progress
        const progress = 40 + (i / words.length * 40);
        updateProgress(progress, `Translating: ${Math.round((i / words.length) * 100)}%`);
    }

    return translatedWords.join('');
}

async function translateText(text, from, to) {
    if (!text.trim() || text.length < 2) return text;
    const chunks = splitText(text, 500);

    // Parallel translation for speed - translate all chunks at once
    const translationPromises = chunks.map(async (chunk) => {
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.responseData.translatedText || chunk;
        } catch (e) {
            return chunk;
        }
    });

    const translatedChunks = await Promise.all(translationPromises);
    return translatedChunks.join(' ');
}

// New function to translate while preserving paragraph structure
async function translateWithParagraphs(text, from, to) {
    if (!text.trim()) return text;

    // Split by double line breaks (paragraphs) or single line breaks
    const paragraphs = text.split(/\n\n+/);
    const translatedParagraphs = [];

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim();
        if (!paragraph) {
            translatedParagraphs.push('');
            continue;
        }

        // Translate the paragraph
        const translatedParagraph = await translateText(paragraph, from, to);
        translatedParagraphs.push(translatedParagraph);

        // Update progress
        const progress = 40 + (i / paragraphs.length * 40);
        updateProgress(progress, `Translating: ${Math.round((i / paragraphs.length) * 100)}%`);
    }

    // Join paragraphs back with double line breaks
    return translatedParagraphs.join('\n\n');
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

function downloadAsPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = translatedTextEl.innerText;
    const splitText = doc.splitTextToSize(text, 180);
    doc.setFontSize(16);
    doc.text("Translated Document", 10, 20);
    doc.setFontSize(12);
    doc.text(splitText, 10, 30);
    doc.save(`translated_${currentFile ? currentFile.name.split('.')[0] : 'document'}.pdf`);
}

function updateProgress(percent, status) {
    progressBarFill.style.width = percent + '%';
    progressStatus.textContent = status;
}
