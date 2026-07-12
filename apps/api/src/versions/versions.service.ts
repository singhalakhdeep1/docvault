import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@docsvault/database';
import { diffLines, diffWords } from 'diff';

@Injectable()
export class VersionsService {
  constructor(private prisma: PrismaService) {}

  async createVersion(documentId: string, content: any, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');

    // Get current version number
    const latestVersion = await this.prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    return this.prisma.documentVersion.create({
      data: {
        documentId,
        version: newVersion,
        content,
        createdBy: userId,
      },
    });
  }

  async getVersions(documentId: string) {
    return this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'desc' },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getVersion(documentId: string, version: number) {
    const docVersion = await this.prisma.documentVersion.findUnique({
      where: {
        documentId_version: {
          documentId,
          version,
        },
      },
    });

    if (!docVersion) throw new NotFoundException('Version not found');
    return docVersion;
  }

  async compareVersions(documentId: string, version1: number, version2: number) {
    const [v1, v2] = await Promise.all([
      this.getVersion(documentId, version1),
      this.getVersion(documentId, version2),
    ]);

    const content1 = JSON.stringify(v1.content);
    const content2 = JSON.stringify(v2.content);

    const diff = diffLines(content1, content2);

    return {
      version1: {
        version: v1.version,
        createdAt: v1.createdAt,
        content: v1.content,
      },
      version2: {
        version: v2.version,
        createdAt: v2.createdAt,
        content: v2.content,
      },
      diff: diff.map((part) => ({
        added: part.added,
        removed: part.removed,
        value: part.value,
      })),
    };
  }

  async restoreVersion(documentId: string, version: number, userId: string) {
    const docVersion = await this.getVersion(documentId, version);

    // Update the document with the version content
    const document = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        content: docVersion.content,
        updatedBy: userId,
      },
    });

    // Create a new version for the restore action
    await this.createVersion(documentId, docVersion.content, userId);

    return document;
  }

  async deleteVersion(documentId: string, version: number, userId: string) {
    const docVersion = await this.getVersion(documentId, version);

    // Check if user has permission
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (document.createdBy !== userId) {
      throw new Error('You can only delete versions from your own documents');
    }

    return this.prisma.documentVersion.delete({
      where: {
        documentId_version: {
          documentId,
          version,
        },
      },
    });
  }
}
