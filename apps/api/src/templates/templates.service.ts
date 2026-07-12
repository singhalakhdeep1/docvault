import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@docsvault/database';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async createTemplate(userId: string, createTemplateDto: {
    name: string;
    description?: string;
    content: any;
    category?: string;
    isPublic?: boolean;
  }) {
    return this.prisma.documentTemplate.create({
      data: {
        ...createTemplateDto,
        createdBy: userId,
      },
    });
  }

  async getTemplates(userId: string, filters?: {
    category?: string;
    isPublic?: boolean;
  }) {
    return this.prisma.documentTemplate.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { isPublic: true },
        ],
        ...(filters?.category && { category: filters.category }),
        ...(filters?.isPublic !== undefined && { isPublic: filters.isPublic }),
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getTemplate(id: string) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updateTemplate(id: string, userId: string, updateDto: any) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id },
    });

    if (!template) throw new NotFoundException('Template not found');
    if (template.createdBy !== userId) {
      throw new Error('You can only update your own templates');
    }

    return this.prisma.documentTemplate.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteTemplate(id: string, userId: string) {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id },
    });

    if (!template) throw new NotFoundException('Template not found');
    if (template.createdBy !== userId) {
      throw new Error('You can only delete your own templates');
    }

    return this.prisma.documentTemplate.delete({
      where: { id },
    });
  }

  async useTemplate(templateId: string, workspaceId: string, userId: string) {
    const template = await this.getTemplate(templateId);

    // Create a new document from the template
    return this.prisma.document.create({
      data: {
        title: `${template.name} - Copy`,
        content: template.content,
        workspaceId,
        createdBy: userId,
      },
    });
  }

  async getTemplateCategories() {
    const templates = await this.prisma.documentTemplate.findMany({
      select: { category: true },
      where: { category: { not: null } },
    });

    const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
    return categories;
  }
}
