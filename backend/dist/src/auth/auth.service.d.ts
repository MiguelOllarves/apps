import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    tenantId: string;
}
export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        tenantId: string;
    };
}
export declare class AuthService {
    private prisma;
    private jwtService;
    private passwordService;
    constructor(prisma: PrismaService, jwtService: JwtService, passwordService: PasswordService);
    login(dto: LoginDto): Promise<AuthResponse>;
    register(dto: RegisterDto): Promise<AuthResponse>;
    validateUser(payload: JwtPayload): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        tenantId: string;
        phone: string | null;
        createdAt: Date;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.Role;
        notes: string | null;
    } | null>;
}
