import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Extracts raw text from a text-based PDF using pdfjs-dist (Mozilla PDF.js).
 * Worker is pointed at the bundled worker file so Node.js can spin it up.
 */
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
    let data: Uint8Array;

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            data = new Uint8Array(arrayBuffer);
        } catch (error: any) {
             throw new Error(`Failed to download resume from cloud storage at path: ${filePath}. Error: ${error.message}`);
        }
    } else {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Resume file not found on server at path: ${filePath}`);
        }
        data = new Uint8Array(fs.readFileSync(filePath));
    }

    // Dynamically import pdfjs-dist (full ESM, no createRequire needed)
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

    // Point to the bundled worker file using an absolute file:// URL
    // process.cwd() is reliably the backend/ directory when running via npm run dev
    const workerPath = path.resolve(
        process.cwd(),
        'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
    );
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();

    let pdfDoc: any;
    try {
        pdfDoc = await pdfjs.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
        }).promise;
    } catch (err: any) {
        throw new Error(`Could not open PDF: ${err.message}`);
    }

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .filter((item: any) => 'str' in item)
            .map((item: any) => (item as any).str)
            .join(' ');
        fullText += pageText + '\n';
    }

    const text = fullText.trim();

    if (!text || text.length < 50) {
        throw new Error(
            'This PDF could not be read as text. Please upload a text-based PDF (not a scanned image).'
        );
    }

    return text;
};
