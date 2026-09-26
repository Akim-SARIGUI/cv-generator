import { BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

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
    throw new BadRequestException('Fichier manquant');
  }
  if (file.size > MAX_BYTES) {
    throw new BadRequestException('Fichier trop volumineux (max 8 Mo)');
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
      throw new BadRequestException(
        'Format .doc non supporté. Enregistrez en PDF ou DOCX.',
      );
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

  throw new BadRequestException(
    'Format non supporté. Utilisez un PDF, DOCX ou TXT.',
  );
}
