import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength, IsOptional, IsIn } from "class-validator";
import { DocumentsService } from "./documents.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

class CreateDocumentDto {
    @IsString() @MinLength(1) @MaxLength(200) title!: string;
    @IsString() @IsOptional() folderId?: string;
    @IsString() @MaxLength(10) @IsOptional() emoji?: string;
}

class UpdateDocumentDto {
    @IsString() @MinLength(1) @MaxLength(200) @IsOptional() title?: string;
    @IsString() @MaxLength(10) @IsOptional() emoji?: string;
    @IsString() @IsOptional() folderId?: string;
    @IsIn(["ACTIVE", "ARCHIVED", "TRASHED"]) @IsOptional() status?: string;
}

@ApiTags("documents")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "documents", version: "1" })
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post()
    @ApiOperation({ summary: "Create a new document" })
    create(
        @CurrentUser() user: { sub: string },
        @Query("workspaceId") workspaceId: string,
        @Body() dto: CreateDocumentDto,
    ) {
        return this.documentsService.create(user.sub, workspaceId, dto);
    }

    @Get()
    @ApiOperation({ summary: "List documents in a workspace" })
    findAll(
        @CurrentUser() user: { sub: string },
        @Query("workspaceId") workspaceId: string,
        @Query("folderId") folderId?: string,
    ) {
        return this.documentsService.findAllInWorkspace(user.sub, workspaceId, folderId);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a document by ID" })
    findOne(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
        return this.documentsService.findOne(user.sub, id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update document metadata (title, emoji, folder)" })
    update(
        @CurrentUser() user: { sub: string },
        @Param("id") id: string,
        @Body() dto: UpdateDocumentDto,
    ) {
        return this.documentsService.update(user.sub, id, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Trash a document" })
    delete(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
        return this.documentsService.delete(user.sub, id);
    }

    @Post(":id/restore")
    @ApiOperation({ summary: "Restore a trashed document" })
    restore(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
        return this.documentsService.restore(user.sub, id);
    }

    @Get(":id/versions")
    @ApiOperation({ summary: "List document version history" })
    listVersions(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
        return this.documentsService.listVersions(user.sub, id);
    }
}
