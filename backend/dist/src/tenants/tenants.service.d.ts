import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    updateSettings(tenantId: string, data: {
        name?: string;
        address?: string;
        logo?: string;
        bannerImage?: string;
        primaryColor?: string;
        slug?: string;
    }): Promise<{
        id: string;
        slug: string | null;
        domain: string | null;
        name: string;
        logo: string | null;
        rif: string | null;
        address: string | null;
        phone: string | null;
        instagram: string | null;
        facebook: string | null;
        whatsapp: string | null;
        coverImage: string | null;
        primaryColor: string | null;
        bannerImage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSettings(tenantId: string): Promise<{
        id: string;
        slug: string | null;
        domain: string | null;
        name: string;
        logo: string | null;
        rif: string | null;
        address: string | null;
        phone: string | null;
        instagram: string | null;
        facebook: string | null;
        whatsapp: string | null;
        coverImage: string | null;
        primaryColor: string | null;
        bannerImage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
