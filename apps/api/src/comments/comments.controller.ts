import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";
import { CommentsService } from "./comments.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

class CreateCommentDto {
    @IsString() @MinLength(1) @MaxLength(2000) content!: string;
}

@ApiTags("comments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "documents/:docId/comments", version: "1" })
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    @ApiOperation({ summary: "Add a comment to a document" })
    create(
        @CurrentUser() user: { sub: string },
        @Param("docId") docId: string,
        @Body() dto: CreateCommentDto,
    ) {
        return this.commentsService.create(user.sub, docId, dto.content);
    }

    @Get()
    @ApiOperation({ summary: "List comments on a document" })
    findAll(@CurrentUser() user: { sub: string }, @Param("docId") docId: string) {
        return this.commentsService.findForDocument(user.sub, docId);
    }

    @Patch(":commentId/resolve")
    @ApiOperation({ summary: "Mark a comment as resolved" })
    resolve(@CurrentUser() user: { sub: string }, @Param("commentId") commentId: string) {
        return this.commentsService.resolve(user.sub, commentId);
    }

    @Delete(":commentId")
    @ApiOperation({ summary: "Delete a comment" })
    delete(@CurrentUser() user: { sub: string }, @Param("commentId") commentId: string) {
        return this.commentsService.delete(user.sub, commentId);
    }
}
