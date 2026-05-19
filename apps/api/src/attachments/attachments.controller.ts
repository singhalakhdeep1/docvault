import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { IsString, IsNumber, Min, Max } from "class-validator";
import { AttachmentsService } from "./attachments.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

class RequestUploadDto {
    @IsString() fileName!: string;
    @IsString() mimeType!: string;
    @IsNumber() @Min(1) @Max(50 * 1024 * 1024) fileSize!: number; // max 50 MB
}

@ApiTags("attachments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "documents/:docId/attachments", version: "1" })
export class AttachmentsController {
    constructor(private readonly attachmentsService: AttachmentsService) { }

    @Post("upload-url")
    @ApiOperation({ summary: "Get a pre-signed PUT URL for direct MinIO upload" })
    requestUpload(
        @CurrentUser() user: { sub: string },
        @Param("docId") docId: string,
        @Body() dto: RequestUploadDto,
    ) {
        return this.attachmentsService.getUploadUrl(docId, user.sub, dto.fileName, dto.mimeType, dto.fileSize);
    }

    @Post(":attachmentId/confirm")
    @ApiOperation({ summary: "Confirm upload completed and set public URL" })
    confirmUpload(
        @CurrentUser() user: { sub: string },
        @Param("attachmentId") attachmentId: string,
    ) {
        return this.attachmentsService.confirmUpload(attachmentId, user.sub);
    }

    @Get()
    @ApiOperation({ summary: "List attachments for a document" })
    list(@CurrentUser() user: { sub: string }, @Param("docId") docId: string) {
        return this.attachmentsService.listForDocument(docId, user.sub);
    }

    @Delete(":attachmentId")
    @ApiOperation({ summary: "Delete an attachment" })
    delete(
        @CurrentUser() user: { sub: string },
        @Param("attachmentId") attachmentId: string,
    ) {
        return this.attachmentsService.deleteAttachment(attachmentId, user.sub);
    }
}
