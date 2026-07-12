import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@docsvault/database';
import PDFDocument from 'pdfkit';
import { Document as DocxDocument, Paragraph, TextRun, Packer } from 'docx';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportToPDF(documentId: string): Promise<Buffer> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    doc.fontSize(20).text(document.title, 50, 50);
    doc.fontSize(12).text(`Created: ${document.createdAt.toLocaleDateString()}`, 50, 80);
    doc.fontSize(12).text(`Last Updated: ${document.updatedAt.toLocaleDateString()}`, 50, 100);

    let y = 140;
    this.renderContentToPDF(doc, document.content, y);

    doc.end();

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async exportToWord(documentId: string): Promise<Buffer> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');

    const children = this.renderContentToWord(document.content);

    const doc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: document.title,
              heading: 'Heading1',
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Created: ${document.createdAt.toLocaleDateString()}`,
                  size: 20,
                }),
              ],
            }),
            ...children,
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  async exportToMarkdown(documentId: string): Promise<string> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');

    let markdown = `# ${document.title}\n\n`;
    markdown += `Created: ${document.createdAt.toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;
    markdown += this.renderContentToMarkdown(document.content);

    return markdown;
  }

  private renderContentToPDF(doc: any, content: any, y: number): number {
    if (typeof content === 'string') {
      doc.text(content, 50, y);
      return y + 20;
    }

    if (Array.isArray(content)) {
      for (const item of content) {
        y = this.renderContentToPDF(doc, item, y);
      }
      return y;
    }

    if (content && typeof content === 'object') {
      if (content.type === 'heading') {
        doc.fontSize(16).text(content.content || '', 50, y);
        return y + 30;
      }
      if (content.type === 'paragraph') {
        doc.fontSize(12).text(content.content || '', 50, y);
        return y + 25;
      }
      if (content.type === 'list') {
        for (const item of content.items || []) {
          doc.text(`• ${item}`, 70, y);
          y += 20;
        }
        return y + 10;
      }
      if (content.content) {
        return this.renderContentToPDF(doc, content.content, y);
      }
    }

    return y;
  }

  private renderContentToWord(content: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (typeof content === 'string') {
      paragraphs.push(new Paragraph(content));
      return paragraphs;
    }

    if (Array.isArray(content)) {
      for (const item of content) {
        paragraphs.push(...this.renderContentToWord(item));
      }
      return paragraphs;
    }

    if (content && typeof content === 'object') {
      if (content.type === 'heading') {
        paragraphs.push(
          new Paragraph({
            text: content.content || '',
            heading: 'Heading2',
          }),
        );
        return paragraphs;
      }
      if (content.type === 'paragraph') {
        paragraphs.push(new Paragraph(content.content || ''));
        return paragraphs;
      }
      if (content.content) {
        return this.renderContentToWord(content.content);
      }
    }

    return paragraphs;
  }

  private renderContentToMarkdown(content: any): string {
    if (typeof content === 'string') {
      return content + '\n\n';
    }

    if (Array.isArray(content)) {
      return content.map(item => this.renderContentToMarkdown(item)).join('');
    }

    if (content && typeof content === 'object') {
      if (content.type === 'heading') {
        return `## ${content.content || ''}\n\n`;
      }
      if (content.type === 'paragraph') {
        return `${content.content || ''}\n\n`;
      }
      if (content.type === 'list') {
        return (content.items || [])
          .map((item: string) => `- ${item}\n`)
          .join('') + '\n';
      }
      if (content.content) {
        return this.renderContentToMarkdown(content.content);
      }
    }

    return '';
  }
}
