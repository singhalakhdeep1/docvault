import { Module } from "@nestjs/common";
import { FoldersService } from "./folders.service";
import { FoldersController } from "./folders.controller";
import { WorkspacesModule } from "../workspaces/workspaces.module";

@Module({
    imports: [WorkspacesModule],
    controllers: [FoldersController],
    providers: [FoldersService],
    exports: [FoldersService],
})
export class FoldersModule { }
