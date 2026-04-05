import fs from 'fs';
import pdfParse from 'pdf-parse';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        
        const text = data.text.trim();
        
        if (!text || text.length < 50) {
           throw new Error('This PDF could not be read as text. Please upload a text-based PDF resume.');
        }
        
        return text;
    } catch (error: any) {
        if (error.message.includes('PDF could not be read')) throw error;
        throw new Error('Failed to parse PDF file. Ensure it is a valid PDF document.');
    }
};
