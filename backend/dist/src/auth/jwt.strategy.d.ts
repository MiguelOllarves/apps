import { AuthService, JwtPayload } from './auth.service';
declare const JwtStrategy_base: new (...args: unknown[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        tenantId: string;
        name: string;
    }>;
}
export {};
