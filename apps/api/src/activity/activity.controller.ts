import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ActivityService } from "./activity.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { WorkspacesService } from "../workspaces/workspaces.service";

@ApiTags("activity")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "activity", version: "1" })
export class ActivityController {
    constructor(
        private readonly activityService: ActivityService,
        private readonly workspacesService: WorkspacesService,
    ) { }

    @Get("workspace/:workspaceId")
    @ApiOperation({ summary: "Get activity feed for a workspace" })
    async getWorkspaceActivity(
        @CurrentUser() user: { sub: string },
        @Param("workspaceId") workspaceId: string,
        @Query("limit") limit?: number,
    ) {
        await this.workspacesService.assertMember(workspaceId, user.sub);
        return this.activityService.findForWorkspace(workspaceId, limit ? Number(limit) : 50);
    }

    @Get("document/:documentId")
    @ApiOperation({ summary: "Get activity feed for a document" })
    async getDocumentActivity(
        @CurrentUser() user: { sub: string },
        @Param("documentId") documentId: string,
        @Query("limit") limit?: number,
    ) {
        return this.activityService.findForDocument(documentId, limit ? Number(limit) : 50);
    }
}
