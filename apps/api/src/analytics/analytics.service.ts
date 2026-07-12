import { Injectable } from '@nestjs/common';
import { PrismaService } from '@docsvault/database';

interface DocumentAnalytics {
  totalViews: number;
  uniqueViewers: number;
  totalEdits: number;
  totalComments: number;
  topViewers: { userId: string; views: number }[];
  activityTimeline: { date: string; views: number; edits: number }[];
}

@Injectable()
export class DocumentAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDocumentAnalytics(documentId: string, startDate?: Date, endDate?: Date): Promise<DocumentAnalytics> {
    const views = await this.prisma.documentView.findMany({
      where: {
        documentId,
        ...(startDate && { viewedAt: { gte: startDate } }),
        ...(endDate && { viewedAt: { lte: endDate } }),
      },
    });

    const edits = await this.prisma.documentVersion.findMany({
      where: {
        documentId,
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
    });

    const comments = await this.prisma.comment.findMany({
      where: {
        documentId,
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
    });

    const uniqueViewers = new Set(views.map(v => v.userId)).size;

    // Top viewers
    const viewerCounts = views.reduce((acc, view) => {
      acc[view.userId] = (acc[view.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topViewers = Object.entries(viewerCounts)
      .map(([userId, views]) => ({ userId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Activity timeline
    const timeline = this.buildActivityTimeline(views, edits, startDate, endDate);

    return {
      totalViews: views.length,
      uniqueViewers,
      totalEdits: edits.length,
      totalComments: comments.length,
      topViewers,
      activityTimeline: timeline,
    };
  }

  async getWorkspaceAnalytics(workspaceId: string, startDate?: Date, endDate?: Date) {
    const documents = await this.prisma.document.findMany({
      where: {
        workspaceId,
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
    });

    const documentIds = documents.map(d => d.id);

    const views = await this.prisma.documentView.findMany({
      where: {
        documentId: { in: documentIds },
      },
    });

    const edits = await this.prisma.documentVersion.findMany({
      where: {
        documentId: { in: documentIds },
      },
    });

    return {
      totalDocuments: documents.length,
      totalViews: views.length,
      totalEdits: edits.length,
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        views: views.filter(v => v.documentId === doc.id).length,
        edits: edits.filter(e => e.documentId === doc.id).length,
      })),
    };
  }

  async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    const views = await this.prisma.documentView.findMany({
      where: {
        userId,
        ...(startDate && { viewedAt: { gte: startDate } }),
        ...(endDate && { viewedAt: { lte: endDate } }),
      },
    });

    const edits = await this.prisma.documentVersion.findMany({
      where: {
        createdBy: userId,
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
    });

    const comments = await this.prisma.comment.findMany({
      where: {
        createdBy: userId,
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
    });

    return {
      totalViews: views.length,
      totalEdits: edits.length,
      totalComments: comments.length,
      mostViewedDocuments: this.getMostViewedDocuments(views),
    };
  }

  private buildActivityTimeline(views: any[], edits: any[], startDate?: Date, endDate?: Date) {
    const timeline: Record<string, { views: number; edits: number }> = {};

    const start = startDate || new Date(0);
    const end = endDate || new Date();

    // Initialize timeline with all dates in range
    const current = new Date(start);
    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      timeline[dateKey] = { views: 0, edits: 0 };
      current.setDate(current.getDate() + 1);
    }

    // Count views per day
    for (const view of views) {
      const dateKey = view.viewedAt.toISOString().split('T')[0];
      if (timeline[dateKey]) {
        timeline[dateKey].views++;
      }
    }

    // Count edits per day
    for (const edit of edits) {
      const dateKey = edit.createdAt.toISOString().split('T')[0];
      if (timeline[dateKey]) {
        timeline[dateKey].edits++;
      }
    }

    return Object.entries(timeline)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getMostViewedDocuments(views: any[]) {
    const docCounts = views.reduce((acc, view) => {
      acc[view.documentId] = (acc[view.documentId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(docCounts)
      .map(([documentId, count]) => ({ documentId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}
