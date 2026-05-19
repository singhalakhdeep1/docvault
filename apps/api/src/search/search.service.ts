import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import MeiliSearch from "meilisearch";

@Injectable()
export class SearchService {
    private readonly client: InstanceType<typeof MeiliSearch>;
    private readonly INDEX = "documents";

    constructor(private readonly config: ConfigService) {
        this.client = new MeiliSearch({
            host: this.config.get("app.meilisearchHost") as string,
            apiKey: this.config.get("app.meilisearchApiKey") as string,
        });
        this.ensureIndex().catch(() => null);
    }

    private async ensureIndex() {
        const idx = this.client.index(this.INDEX);
        await idx.updateFilterableAttributes(["workspaceId"]);
        await idx.updateSearchableAttributes(["title", "textContent"]);
        await idx.updateDisplayedAttributes(["id", "title", "emoji", "workspaceId", "folderId", "updatedAt"]);
    }

    async indexDocument(
        id: string,
        data: { title: string; textContent: string; workspaceId: string; folderId?: string; emoji?: string; updatedAt?: Date },
    ) {
        const idx = this.client.index(this.INDEX);
        await idx.addDocuments([{ id, ...data }]);
    }

    async search(query: string, workspaceId: string, limit = 20) {
        const idx = this.client.index(this.INDEX);
        const result = await idx.search(query, {
            limit,
            filter: `workspaceId = "${workspaceId}"`,
        });
        return result.hits;
    }

    async removeDocument(id: string) {
        const idx = this.client.index(this.INDEX);
        await idx.deleteDocument(id);
    }
}
