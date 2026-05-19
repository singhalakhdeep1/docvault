import { Injectable, UnauthorizedException, ConflictException, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@docsvault/database";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { PRISMA_TOKEN } from "../database/database.module";
import type { RegisterDto, LoginDto } from "@docsvault/shared";

@Injectable()
export class AuthService {
    private readonly jwtSecret: string;
    private readonly jwtExpiresIn: string;

    constructor(
        @Inject(PRISMA_TOKEN) private readonly prisma: PrismaClient,
        private readonly config: ConfigService,
    ) {
        this.jwtSecret = this.config.get("app.jwtSecret") as string;
        this.jwtExpiresIn = this.config.get("app.jwtExpiresIn") as string;
    }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException("Email already registered");

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                fullName: dto.fullName,
                passwordHash,
            },
            select: { id: true, email: true, fullName: true, avatarUrl: true, createdAt: true },
        });

        const token = this.signToken({ sub: user.id, email: user.email });
        return { user, token };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException("Invalid credentials");

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) throw new UnauthorizedException("Invalid credentials");

        const token = this.signToken({ sub: user.id, email: user.email });
        return {
            user: { id: user.id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl },
            token,
        };
    }

    async getProfile(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, fullName: true, avatarUrl: true, createdAt: true },
        });
    }

    async updateProfile(userId: string, data: { fullName?: string; avatarUrl?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, email: true, fullName: true, avatarUrl: true, createdAt: true },
        });
    }

    private signToken(payload: { sub: string; email: string }) {
        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn } as any);
    }

    verifyToken(token: string): { sub: string; email: string } {
        return jwt.verify(token, this.jwtSecret) as any;
    }
}
