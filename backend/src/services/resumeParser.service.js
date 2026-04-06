import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
/**
 * Extracts raw text from a text-based PDF using pdfjs-dist (Mozilla PDF.js).
 * Worker is pointed at the bundled worker file so Node.js can spin it up.
 */
export const extractTextFromPDF = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Resume file not found on server at path: ${filePath}`);
    }
    // Dynamically import pdfjs-dist (full ESM, no createRequire needed)
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    // Point to the bundled worker file using an absolute file:// URL
    // process.cwd() is reliably the backend/ directory when running via npm run dev
    const workerPath = path.resolve(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();
    const data = new Uint8Array(fs.readFileSync(filePath));
    let pdfDoc;
    try {
        pdfDoc = await pdfjs.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
        }).promise;
    }
    catch (err) {
        throw new Error(`Could not open PDF: ${err.message}`);
    }
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .filter((item) => 'str' in item)
            .map((item) => item.str)
            .join(' ');
        fullText += pageText + '\n';
    }
    const text = fullText.trim();
    if (!text || text.length < 50) {
        throw new Error('This PDF could not be read as text. Please upload a text-based PDF (not a scanned image).');
    }
    return text;
};
//# sourceMappingURL=resumeParser.service.js.map