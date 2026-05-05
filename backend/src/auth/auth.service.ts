import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Prisma } from '@prisma/client';

export interface JwtPayload {
  sub: string;       // user ID
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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) { }

  async login(dto: LoginDto): Promise<AuthResponse> {
    console.log(`[AuthService] Intentando login para: ${dto.email}`);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    console.log(`[AuthService] Usuario encontrado: ${!!user}`);


    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.passwordService.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
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

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('El correo ya está registrado.');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Crear Tenant con slug único
      const slug = dto.tenantName
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');

      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          slug: `${slug}-${Date.now().toString(36)}`,
        },
      });

      // 2. Crear Usuario Admin
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          name: dto.userName,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      // 3. Auto-provisioning: Monedas
      await tx.currency.createMany({
        data: [
          { tenantId: tenant.id, code: 'USD', name: 'Dólar Estadounidense', symbol: '$', exchangeRate: 1, isBaseCurrency: true },
          { tenantId: tenant.id, code: 'VES', name: 'Bolívar Digital', symbol: 'Bs.', exchangeRate: 481.21, isBaseCurrency: false },
          { tenantId: tenant.id, code: 'USDT', name: 'Tether (USDT)', symbol: '₮', exchangeRate: 1, isBaseCurrency: false },
          { tenantId: tenant.id, code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, isBaseCurrency: false },
        ],
      });

      // 4. Auto-provisioning: Categorías de Insumos
      await tx.category.createMany({
        data: [
          { tenantId: tenant.id, name: 'Proteínas', type: 'RAW_MATERIAL' },
          { tenantId: tenant.id, name: 'Vegetales y Frutas', type: 'RAW_MATERIAL' },
          { tenantId: tenant.id, name: 'Lácteos y Quesos', type: 'RAW_MATERIAL' },
          { tenantId: tenant.id, name: 'Abarrotes', type: 'RAW_MATERIAL' },
          { tenantId: tenant.id, name: 'Bebidas', type: 'RAW_MATERIAL' },
          { tenantId: tenant.id, name: 'Desechables', type: 'RAW_MATERIAL' },
          { tenantId: tenant.id, name: 'Insumos Generales', type: 'RAW_MATERIAL' },
          // Categorías de Menú
          { tenantId: tenant.id, name: 'Platos Principales', type: 'MENU_ITEM' },
          { tenantId: tenant.id, name: 'Entradas', type: 'MENU_ITEM' },
          { tenantId: tenant.id, name: 'Postres', type: 'MENU_ITEM' },
          { tenantId: tenant.id, name: 'Bebidas', type: 'MENU_ITEM' },
          { tenantId: tenant.id, name: 'Combos', type: 'MENU_ITEM' },
        ],
      });

      return { user, tenant };
    });

    // Generate JWT for immediate login after registration
    const payload: JwtPayload = {
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

  async validateUser(payload: JwtPayload) {
    return this.prisma.user.findFirst({
      where: { id: payload.sub, tenantId: payload.tenantId },
    });
  }
}
