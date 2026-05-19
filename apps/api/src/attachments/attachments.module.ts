import { Module } from "@nestjs/common";
import { AttachmentsService } from "./attachments.service";
import { AttachmentsController } from "./attachments.controller";
import { WorkspacesModule } from "../workspaces/workspaces.module";

@Module({
    imports: [WorkspacesModule],
    controllers: [AttachmentsController],
    providers: [AttachmentsService],
})
export class AttachmentsModule { }
