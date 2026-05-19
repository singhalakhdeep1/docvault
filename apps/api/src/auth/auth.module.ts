import { Global, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { APP_GUARD } from "@nestjs/core";

@Global()
@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtAuthGuard,
        // Apply JwtAuthGuard globally
        {
            provide: APP_GUARD,
            useExisting: JwtAuthGuard,
        },
    ],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule { }
