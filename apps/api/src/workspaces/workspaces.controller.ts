import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength, IsOptional, IsEmail, IsIn } from "class-validator";
import { WorkspacesService } from "./workspaces.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

class CreateWorkspaceDto {
    @IsString() @MinLength(1) @MaxLength(100) name!: string;
    @IsString() @MaxLength(500) @IsOptional() description?: string;
}

class UpdateWorkspaceDto {
    @IsString() @MinLength(1) @MaxLength(100) @IsOptional() name?: string;
    @IsString() @MaxLength(500) @IsOptional() description?: string;
    @IsString() @IsOptional() logoUrl?: string;
}

class InviteMemberDto {
    @IsEmail() email!: string;
    @IsIn(["EDITOR", "VIEWER"]) role!: "EDITOR" | "VIEWER";
}

class UpdateMemberRoleDto {
    @IsIn(["EDITOR", "VIEWER"]) role!: "EDITOR" | "VIEWER";
}

@ApiTags("workspaces")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "workspaces", version: "1" })
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) { }

    @Post()
    @ApiOperation({ summary: "Create a new workspace" })
    create(@CurrentUser() user: { sub: string }, @Body() dto: CreateWorkspaceDto) {
        return this.workspacesService.create(user.sub, dto);
    }

    @Get()
    @ApiOperation({ summary: "List all workspaces for the current user" })
    findAll(@CurrentUser() user: { sub: string }) {
        return this.workspacesService.findAllForUser(user.sub);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a workspace by ID (with folders + members)" })
    findOne(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
        return this.workspacesService.findOne(id, user.sub);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update workspace details (owner only)" })
    update(
        @CurrentUser() user: { sub: string },
        @Param("id") id: string,
        @Body() dto: UpdateWorkspaceDto,
    ) {
        return this.workspacesService.update(id, user.sub, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete workspace (owner only)" })
    delete(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
        return this.workspacesService.delete(id, user.sub);
    }

    // Members
    @Post(":id/members")
    @ApiOperation({ summary: "Invite a member to workspace" })
    invite(
        @CurrentUser() user: { sub: string },
        @Param("id") id: string,
        @Body() dto: InviteMemberDto,
    ) {
        return this.workspacesService.inviteMember(id, user.sub, dto.email, dto.role);
    }

    @Patch(":id/members/:userId")
    @ApiOperation({ summary: "Update member role (owner only)" })
    updateMemberRole(
        @CurrentUser() user: { sub: string },
        @Param("id") id: string,
        @Param("userId") userId: string,
        @Body() dto: UpdateMemberRoleDto,
    ) {
        return this.workspacesService.updateMemberRole(id, user.sub, userId, dto.role);
    }

    @Delete(":id/members/:userId")
    @ApiOperation({ summary: "Remove a member from workspace (owner only)" })
    removeMember(
        @CurrentUser() user: { sub: string },
        @Param("id") id: string,
        @Param("userId") userId: string,
    ) {
        return this.workspacesService.removeMember(id, user.sub, userId);
    }
}
