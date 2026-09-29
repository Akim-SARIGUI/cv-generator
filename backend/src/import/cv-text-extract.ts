import { BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { coded } from '../common/coded-exception';

export type ExtractedSource = {
  text: string;
  sourceType: 'pdf' | 'docx' | 'txt';
  sourceName: string;
};

const MAX_BYTES = 8 * 1024 * 1024;

export async function extractTextFromUpload(
  file: Express.Multer.File,
): Promise<ExtractedSource> {
  if (!file?.buffer?.length) {
    throw coded(BadRequestException, 'FILE_MISSING');
  }
  if (file.size > MAX_BYTES) {
    throw coded(BadRequestException, 'FILE_TOO_LARGE');
  }

  const name = file.originalname || 'cv';
  const mime = (file.mimetype || '').toLowerCase();
  const lower = name.toLowerCase();

  if (
    mime.includes('pdf') ||
    lower.endsWith('.pdf')
  ) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      const text = (result?.text || '').trim();
      return { text, sourceType: 'pdf', sourceName: name };
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  if (
    mime.includes('wordprocessingml') ||
    mime.includes('msword') ||
    lower.endsWith('.docx') ||
    lower.endsWith('.doc')
  ) {
    if (lower.endsWith('.doc') && !lower.endsWith('.docx')) {
      throw coded(BadRequestException, 'DOC_UNSUPPORTED');
    }
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return {
      text: (result.value || '').trim(),
      sourceType: 'docx',
      sourceName: name,
    };
  }

  if (mime.includes('text') || lower.endsWith('.txt')) {
    return {
      text: file.buffer.toString('utf8').trim(),
      sourceType: 'txt',
      sourceName: name,
    };
  }

  throw coded(BadRequestException, 'FORMAT_UNSUPPORTED');
}
