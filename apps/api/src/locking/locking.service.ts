import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@docsvault/database';

@Injectable()
export class LockingService {
  constructor(private prisma: PrismaService) {}

  async acquireLock(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');

    // Check if already locked
    const existingLock = await this.prisma.documentLock.findFirst({
      where: {
        documentId,
        releasedAt: null,
      },
    });

    if (existingLock) {
      if (existingLock.lockedBy === userId) {
        // User already has the lock
        return existingLock;
      }
      throw new BadRequestException('Document is already locked by another user');
    }

    return this.prisma.documentLock.create({
      data: {
        documentId,
        lockedBy: userId,
        acquiredAt: new Date(),
      },
    });
  }

  async releaseLock(documentId: string, userId: string) {
    const lock = await this.prisma.documentLock.findFirst({
      where: {
        documentId,
        releasedAt: null,
      },
    });

    if (!lock) throw new NotFoundException('No active lock found');
    if (lock.lockedBy !== userId) {
      throw new BadRequestException('You can only release your own locks');
    }

    return this.prisma.documentLock.update({
      where: { id: lock.id },
      data: { releasedAt: new Date() },
    });
  }

  async getLock(documentId: string) {
    const lock = await this.prisma.documentLock.findFirst({
      where: {
        documentId,
        releasedAt: null,
      },
      include: {
        lockedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return lock;
  }

  async refreshLock(documentId: string, userId: string) {
    const lock = await this.prisma.documentLock.findFirst({
      where: {
        documentId,
        releasedAt: null,
      },
    });

    if (!lock) throw new NotFoundException('No active lock found');
    if (lock.lockedBy !== userId) {
      throw new BadRequestException('You can only refresh your own locks');
    }

    return this.prisma.documentLock.update({
      where: { id: lock.id },
      data: { acquiredAt: new Date() },
    });
  }

  async releaseExpiredLocks() {
    const expiredTime = new Date();
    expiredTime.setMinutes(expiredTime.getMinutes() - 30); // 30 minute timeout

    const expiredLocks = await this.prisma.documentLock.findMany({
      where: {
        releasedAt: null,
        acquiredAt: { lt: expiredTime },
      },
    });

    for (const lock of expiredLocks) {
      await this.prisma.documentLock.update({
        where: { id: lock.id },
        data: { releasedAt: new Date() },
      });
    }

    return { released: expiredLocks.length };
  }

  async getLockHistory(documentId: string) {
    return this.prisma.documentLock.findMany({
      where: { documentId },
      orderBy: { acquiredAt: 'desc' },
      include: {
        lockedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async forceReleaseLock(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');
    if (document.createdBy !== userId) {
      throw new BadRequestException('Only document owner can force release locks');
    }

    const lock = await this.prisma.documentLock.findFirst({
      where: {
        documentId,
        releasedAt: null,
      },
    });

    if (!lock) throw new NotFoundException('No active lock found');

    return this.prisma.documentLock.update({
      where: { id: lock.id },
      data: { releasedAt: new Date() },
    });
  }
}
