import { Injectable, UnauthorizedException, ExecutionContext, CanActivate } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth.service";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => (target: any, key?: any, descriptor?: any) => {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor?.value ?? target);
    return descriptor ?? target;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: any }>();
        const auth = request.headers["authorization"];
        if (!auth?.startsWith("Bearer ")) throw new UnauthorizedException("Missing bearer token");

        const token = auth.slice(7);
        const payload = this.authService.verifyToken(token);
        request.user = payload;
        return true;
    }
}
