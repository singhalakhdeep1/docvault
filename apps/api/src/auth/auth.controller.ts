import { Controller, Post, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from "class-validator";
import { AuthService } from "./auth.service";
import { JwtAuthGuard, Public } from "./guards/jwt.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

export class RegisterDto {
    @IsString() @MinLength(2) @MaxLength(100) fullName!: string;
    @IsEmail() email!: string;
    @IsString() @MinLength(8) @MaxLength(128) password!: string;
}

export class LoginDto {
    @IsEmail() email!: string;
    @IsString() password!: string;
}

export class UpdateProfileDto {
    @IsString() @MinLength(2) @MaxLength(100) @IsOptional() fullName?: string;
    @IsString() @IsOptional() avatarUrl?: string;
}

@ApiTags("auth")
@Controller({ path: "auth", version: "1" })
@UseGuards(JwtAuthGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post("register")
    @ApiOperation({ summary: "Register a new user" })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post("login")
    @ApiOperation({ summary: "Login and receive JWT" })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get("me")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get current user profile" })
    getProfile(@CurrentUser() user: { sub: string }) {
        return this.authService.getProfile(user.sub);
    }

    @Patch("me")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update current user profile" })
    updateProfile(@CurrentUser() user: { sub: string }, @Body() dto: UpdateProfileDto) {
        return this.authService.updateProfile(user.sub, dto);
    }
}
