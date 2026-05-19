import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { WorkspacesModule } from "../workspaces/workspaces.module";
import { SearchModule } from "../search/search.module";

@Module({
    imports: [WorkspacesModule, SearchModule],
    controllers: [DocumentsController],
    providers: [DocumentsService],
    exports: [DocumentsService],
})
export class DocumentsModule { }
