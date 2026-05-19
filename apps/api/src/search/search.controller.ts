import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "search", version: "1" })
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    @ApiOperation({ summary: "Full-text search documents in a workspace" })
    search(
        @CurrentUser() _user: { sub: string },
        @Query("q") q: string,
        @Query("workspaceId") workspaceId: string,
        @Query("limit") limit?: number,
    ) {
        return this.searchService.search(q ?? "", workspaceId, limit ? Number(limit) : 20);
    }
}
