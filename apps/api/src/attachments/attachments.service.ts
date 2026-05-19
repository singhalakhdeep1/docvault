import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@docsvault/database";
import { PRISMA_TOKEN } from "../database/database.module";
import { WorkspacesService } from "../workspaces/workspaces.service";
import * as Minio from "minio";
import { v4 as uuid } from "uuid";

@Injectable()
export class AttachmentsService {
    private readonly minio: Minio.Client;
    private readonly bucket: string;
    private readonly publicUrl: string;

    constructor(
        @Inject(PRISMA_TOKEN) private readonly prisma: PrismaClient,
        private readonly config: ConfigService,
        private readonly workspacesService: WorkspacesService,
    ) {
        this.minio = new Minio.Client({
            endPoint: this.config.get("app.minioEndpoint") as string,
            port: this.config.get<number>("app.minioPort"),
            useSSL: false,
            accessKey: this.config.get("app.minioAccessKey") as string,
            secretKey: this.config.get("app.minioSecretKey") as string,
        });
        this.bucket = this.config.get("app.minioBucket") as string;
        this.publicUrl = this.config.get("app.minioPublicUrl") as string;
        this.ensureBucket().catch(() => null);
    }

    private async ensureBucket() {
        const exists = await this.minio.bucketExists(this.bucket);
        if (!exists) {
            await this.minio.makeBucket(this.bucket, "us-east-1");
            await this.minio.setBucketPolicy(
                this.bucket,
                JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [{
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${this.bucket}/*`],
                    }],
                }),
            );
        }
    }

    /**
     * Returns a pre-signed PUT URL so the frontend can upload directly to MinIO.
     */
    async getUploadUrl(
        docId: string,
        userId: string,
        fileName: string,
        mimeType: string,
        fileSize: number,
    ): Promise<{ uploadUrl: string; storageKey: string; attachmentId: string }> {
        const doc = await this.prisma.document.findUnique({ where: { id: docId }, select: { workspaceId: true } });
        if (!doc) throw new Error("Document not found");
        await this.workspacesService.assertRole(doc.workspaceId, userId, ["OWNER", "EDITOR"]);

        const storageKey = `${docId}/${uuid()}-${fileName}`;
        const uploadUrl = await this.minio.presignedPutObject(this.bucket, storageKey, 600);

        const attachment = await this.prisma.attachment.create({
            data: {
                documentId: docId,
                fileName,
                fileSize,
                mimeType,
                storageKey,
                uploadedBy: userId,
            },
        });

        return { uploadUrl, storageKey, attachmentId: attachment.id };
    }

    async confirmUpload(attachmentId: string, userId: string) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: { document: { select: { workspaceId: true } } },
        });
        if (!attachment) throw new Error("Attachment not found");
        await this.workspacesService.assertRole(attachment.document.workspaceId, userId, ["OWNER", "EDITOR"]);

        const url = `${this.publicUrl}/${this.bucket}/${attachment.storageKey}`;
        return this.prisma.attachment.update({
            where: { id: attachmentId },
            data: { url },
        });
    }

    async listForDocument(docId: string, userId: string) {
        const doc = await this.prisma.document.findUnique({ where: { id: docId }, select: { workspaceId: true } });
        if (!doc) throw new Error("Document not found");
        await this.workspacesService.assertMember(doc.workspaceId, userId);
        return this.prisma.attachment.findMany({ where: { documentId: docId }, orderBy: { createdAt: "desc" } });
    }

    async deleteAttachment(attachmentId: string, userId: string) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: { document: { select: { workspaceId: true } } },
        });
        if (!attachment) throw new Error("Attachment not found");
        await this.workspacesService.assertRole(attachment.document.workspaceId, userId, ["OWNER", "EDITOR"]);
        await this.minio.removeObject(this.bucket, attachment.storageKey).catch(() => null);
        await this.prisma.attachment.delete({ where: { id: attachmentId } });
        return { deleted: true };
    }
}
