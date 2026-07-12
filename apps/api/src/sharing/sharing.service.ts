import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@docsvault/database';
import { randomBytes } from 'crypto';

@Injectable()
export class SharingService {
  constructor(private prisma: PrismaService) {}

  async generateShareLink(documentId: string, userId: string, options: {
    expiresAt?: Date;
    password?: string;
    allowDownload?: boolean;
    allowComments?: boolean;
  }) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');
    if (document.createdBy !== userId) {
      throw new BadRequestException('You can only share your own documents');
    }

    const token = randomBytes(32).toString('hex');

    return this.prisma.sharedDocument.create({
      data: {
        documentId,
        token,
        expiresAt: options.expiresAt,
        password: options.password,
        allowDownload: options.allowDownload ?? true,
        allowComments: options.allowComments ?? true,
        createdBy: userId,
      },
    });
  }

  async getSharedDocument(token: string, password?: string) {
    const shared = await this.prisma.sharedDocument.findUnique({
      where: { token },
      include: {
        document: {
          include: {
            createdByUser: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!shared) throw new NotFoundException('Shared document not found');

    // Check expiration
    if (shared.expiresAt && shared.expiresAt < new Date()) {
      throw new BadRequestException('Shared link has expired');
    }

    // Check password
    if (shared.password && shared.password !== password) {
      throw new BadRequestException('Invalid password');
    }

    return shared;
  }

  async getSharedLinks(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');
    if (document.createdBy !== userId) {
      throw new BadRequestException('You can only view shares for your own documents');
    }

    return this.prisma.sharedDocument.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeShareLink(shareId: string, userId: string) {
    const shared = await this.prisma.sharedDocument.findUnique({
      where: { id: shareId },
      include: { document: true },
    });

    if (!shared) throw new NotFoundException('Share link not found');
    if (shared.document.createdBy !== userId) {
      throw new BadRequestException('You can only revoke shares for your own documents');
    }

    return this.prisma.sharedDocument.delete({
      where: { id: shareId },
    });
  }

  async updateShareLink(shareId: string, userId: string, updates: {
    expiresAt?: Date;
    allowDownload?: boolean;
    allowComments?: boolean;
  }) {
    const shared = await this.prisma.sharedDocument.findUnique({
      where: { id: shareId },
      include: { document: true },
    });

    if (!shared) throw new NotFoundException('Share link not found');
    if (shared.document.createdBy !== userId) {
      throw new BadRequestException('You can only update shares for your own documents');
    }

    return this.prisma.sharedDocument.update({
      where: { id: shareId },
      data: updates,
    });
  }

  async recordShareAccess(shareId: string, visitorInfo: {
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.sharedDocumentAccess.create({
      data: {
        sharedDocumentId: shareId,
        ipAddress: visitorInfo.ipAddress,
        userAgent: visitorInfo.userAgent,
      },
    });
  }

  async getShareAnalytics(shareId: string, userId: string) {
    const shared = await this.prisma.sharedDocument.findUnique({
      where: { id: shareId },
      include: { document: true },
    });

    if (!shared) throw new NotFoundException('Share link not found');
    if (shared.document.createdBy !== userId) {
      throw new BadRequestException('You can only view analytics for your own documents');
    }

    const accesses = await this.prisma.sharedDocumentAccess.findMany({
      where: { sharedDocumentId: shareId },
      orderBy: { accessedAt: 'desc' },
    });

    return {
      totalViews: accesses.length,
      uniqueVisitors: new Set(accesses.map(a => a.ipAddress)).size,
      accesses,
    };
  }
}
