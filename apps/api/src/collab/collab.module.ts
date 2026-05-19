import { Module } from "@nestjs/common";
import { CollabGateway } from "./collab.gateway";
import { DocumentsModule } from "../documents/documents.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [DocumentsModule, AuthModule],
    providers: [CollabGateway],
})
export class CollabModule { }
