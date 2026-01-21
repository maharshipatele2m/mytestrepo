// Polyfill for pdf-parse in Node.js environment
if (typeof globalThis !== 'undefined') {
    (globalThis as any).DOMMatrix = (globalThis as any).DOMMatrix || class { };
    (globalThis as any).ImageData = (globalThis as any).ImageData || class { };
    (globalThis as any).Path2D = (globalThis as any).Path2D || class { };
    (globalThis as any).Canvas = (globalThis as any).Canvas || class { };
}

import mammoth from 'mammoth';

const pdf = require('pdf-parse');

export async function parseDocument(buffer: Buffer, mimeType: string): Promise<string> {
    try {
        if (mimeType === 'application/pdf') {
            console.log('Parsing PDF...');
            const data = await pdf(buffer);
            return data.text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            console.log('Parsing DOCX...');
            const res = await mammoth.extractRawText({ buffer });
            return res.value;
        } else if (mimeType === 'text/plain') {
            return buffer.toString('utf-8');
        } else {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }
    } catch (err: any) {
        console.error('Error in parseDocument:', err);
        throw new Error(`Parsing failed: ${err.message}`);
    }
}

export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
    if (!text || text.trim().length === 0) return ["(Empty Document)"];

    // Safety check: chunkSize must be greater than overlap
    const actualChunkSize = Math.max(chunkSize, 201);
    const actualOverlap = Math.min(overlap, actualChunkSize - 100);

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + actualChunkSize, text.length);
        chunks.push(text.slice(start, end));
        if (end === text.length) break;
        start += (actualChunkSize - actualOverlap);
    }

    return chunks;
}
