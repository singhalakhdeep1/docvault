import { Module } from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { ActivityController } from "./activity.controller";
import { WorkspacesModule } from "../workspaces/workspaces.module";

@Module({
    imports: [WorkspacesModule],
    controllers: [ActivityController],
    providers: [ActivityService],
    exports: [ActivityService],
})
export class ActivityModule { }
