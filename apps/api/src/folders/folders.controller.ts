import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength, IsOptional, IsNumber, Min } from "class-validator";
import { FoldersService } from "./folders.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

class CreateFolderDto {
    @IsString() @MinLength(1) @MaxLength(100) name!: string;
    @IsString() @IsOptional() parentFolderId?: string;
    @IsString() @MaxLength(10) @IsOptional() emoji?: string;
}

class UpdateFolderDto {
    @IsString() @MinLength(1) @MaxLength(100) @IsOptional() name?: string;
    @IsString() @MaxLength(10) @IsOptional() emoji?: string;
    @IsNumber() @Min(0) @IsOptional() position?: number;
}

@ApiTags("folders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "folders", version: "1" })
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) { }

    @Post()
    @ApiOperation({ summary: "Create a folder in a workspace" })
    create(
        @CurrentUser() user: { sub: string },
        @Query("workspaceId") workspaceId: string,
        @Body() dto: CreateFolderDto,
    ) {
        return this.foldersService.create(user.sub, workspaceId, dto);
    }

    @Get()
    @ApiOperation({ summary: "List folders in a workspace" })
    findAll(@CurrentUser() user: { sub: string }, @Query("workspaceId") workspaceId: string) {
        return this.foldersService.findAllInWorkspace(user.sub, workspaceId);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a folder" })
    update(
        @CurrentUser() user: { sub: string },
        @Param("id") id: string,
        @Body() dto: UpdateFolderDto,
    ) {
        return this.foldersService.update(user.sub, id, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete a folder and trash its documents" })
    delete(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
        return this.foldersService.delete(user.sub, id);
    }
}
