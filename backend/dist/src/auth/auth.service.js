"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const password_service_1 = require("./password.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    passwordService;
    constructor(prisma, jwtService, passwordService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.passwordService = passwordService;
    }
    async login(dto) {
        console.log(`[AuthService] Intentando login para: ${dto.email}`);
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        console.log(`[AuthService] Usuario encontrado: ${!!user}`);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = await this.passwordService.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
            },
        };
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.UnauthorizedException('El correo ya está registrado.');
        }
        const hashedPassword = await this.passwordService.hash(dto.password);
        const result = await this.prisma.$transaction(async (tx) => {
            const slug = dto.tenantName
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.tenantName,
                    slug: `${slug}-${Date.now().toString(36)}`,
                },
            });
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hashedPassword,
                    name: dto.userName,
                    role: 'ADMIN',
                    tenantId: tenant.id,
                },
            });
            await tx.currency.createMany({
                data: [
                    { tenantId: tenant.id, code: 'USD', name: 'Dólar Estadounidense', symbol: '$', exchangeRate: 1, isBaseCurrency: true },
                    { tenantId: tenant.id, code: 'VES', name: 'Bolívar Digital', symbol: 'Bs.', exchangeRate: 481.21, isBaseCurrency: false },
                    { tenantId: tenant.id, code: 'USDT', name: 'Tether (USDT)', symbol: '₮', exchangeRate: 1, isBaseCurrency: false },
                    { tenantId: tenant.id, code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, isBaseCurrency: false },
                ],
            });
            await tx.category.createMany({
                data: [
                    { tenantId: tenant.id, name: 'Proteínas', type: 'RAW_MATERIAL' },
                    { tenantId: tenant.id, name: 'Vegetales y Frutas', type: 'RAW_MATERIAL' },
                    { tenantId: tenant.id, name: 'Lácteos y Quesos', type: 'RAW_MATERIAL' },
                    { tenantId: tenant.id, name: 'Abarrotes', type: 'RAW_MATERIAL' },
                    { tenantId: tenant.id, name: 'Bebidas', type: 'RAW_MATERIAL' },
                    { tenantId: tenant.id, name: 'Desechables', type: 'RAW_MATERIAL' },
                    { tenantId: tenant.id, name: 'Insumos Generales', type: 'RAW_MATERIAL' },
                    { tenantId: tenant.id, name: 'Platos Principales', type: 'MENU_ITEM' },
                    { tenantId: tenant.id, name: 'Entradas', type: 'MENU_ITEM' },
                    { tenantId: tenant.id, name: 'Postres', type: 'MENU_ITEM' },
                    { tenantId: tenant.id, name: 'Bebidas', type: 'MENU_ITEM' },
                    { tenantId: tenant.id, name: 'Combos', type: 'MENU_ITEM' },
                ],
            });
            return { user, tenant };
        });
        const payload = {
            sub: result.user.id,
            email: result.user.email,
            role: result.user.role,
            tenantId: result.tenant.id,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
                tenantId: result.tenant.id,
            },
        };
    }
    async validateUser(payload) {
        return this.prisma.user.findFirst({
            where: { id: payload.sub, tenantId: payload.tenantId },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        password_service_1.PasswordService])
], AuthService);
//# sourceMappingURL=auth.service.js.map