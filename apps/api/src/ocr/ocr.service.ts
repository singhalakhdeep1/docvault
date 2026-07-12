import { Injectable } from '@nestjs/common';
import { PrismaService } from '@docsvault/database';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  constructor(private prisma: PrismaService) {}

  async processImage(attachmentId: string): Promise<string> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) throw new Error('Attachment not found');

    // Perform OCR using Tesseract.js
    const result = await Tesseract.recognize(
      attachment.url,
      'eng',
      {
        logger: (m) => console.log(m),
      },
    );

    const extractedText = result.data.text;

    // Store the extracted text
    await this.prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        ocrText: extractedText,
        ocrProcessedAt: new Date(),
      },
    });

    return extractedText;
  }

  async processImageBatch(attachmentIds: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const attachmentId of attachmentIds) {
      try {
        const text = await this.processImage(attachmentId);
        results.set(attachmentId, text);
      } catch (error) {
        console.error(`Failed to process ${attachmentId}:`, error);
        results.set(attachmentId, '');
      }
    }

    return results;
  }

  async searchByOcrText(searchTerm: string, workspaceId: string) {
    const attachments = await this.prisma.attachment.findMany({
      where: {
        workspaceId,
        ocrText: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    });

    return attachments;
  }

  async getOcrStatus(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        ocrProcessedAt: true,
        ocrText: true,
      },
    });

    if (!attachment) throw new Error('Attachment not found');

    return {
      id: attachment.id,
      processed: !!attachment.ocrProcessedAt,
      processedAt: attachment.ocrProcessedAt,
      hasText: !!attachment.ocrText,
      textLength: attachment.ocrText?.length || 0,
    };
  }
}
