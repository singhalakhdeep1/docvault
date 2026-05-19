import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./auth/auth.module";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { FoldersModule } from "./folders/folders.module";
import { DocumentsModule } from "./documents/documents.module";
import { CollabModule } from "./collab/collab.module";
import { AttachmentsModule } from "./attachments/attachments.module";
import { SearchModule } from "./search/search.module";
import { ActivityModule } from "./activity/activity.module";
import { CommentsModule } from "./comments/comments.module";
import { HealthModule } from "./health/health.module";
import appConfig from "./config/app.config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
            envFilePath: ["../../.env.local", "../../.env"],
        }),

        ThrottlerModule.forRoot([{ name: "global", ttl: 60_000, limit: 100 }]),

        // Infrastructure
        DatabaseModule,
        RedisModule,

        // Feature modules
        AuthModule,
        WorkspacesModule,
        FoldersModule,
        DocumentsModule,
        CollabModule,
        AttachmentsModule,
        SearchModule,
        ActivityModule,
        CommentsModule,
        HealthModule,
    ],
})
export class AppModule { }
