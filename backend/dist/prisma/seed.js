"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando Seed de ControlTotal...');
    const tenant = await prisma.tenant.upsert({
        where: { domain: 'master' },
        update: {},
        create: {
            name: 'ControlTotal HQ',
            domain: 'master',
        },
    });
    const admin = await prisma.user.upsert({
        where: { email: 'admin@controltotal.com' },
        update: {},
        create: {
            tenantId: tenant.id,
            name: 'Super Admin',
            email: 'admin@controltotal.com',
            passwordHash: await bcrypt.hash('admin123', 12),
            role: 'ADMIN',
        },
    });
    const usd = await prisma.currency.upsert({
        where: { code_tenantId: { code: 'USD', tenantId: tenant.id } },
        update: {},
        create: {
            tenantId: tenant.id,
            code: 'USD',
            exchangeRate: 1.0,
            isBaseCurrency: true,
        },
    });
    const ves = await prisma.currency.upsert({
        where: { code_tenantId: { code: 'VES', tenantId: tenant.id } },
        update: { exchangeRate: 481.21 },
        create: {
            tenantId: tenant.id,
            code: 'VES',
            exchangeRate: 481.21,
            isBaseCurrency: false,
        },
    });
    const categoryMeats = await prisma.category.create({
        data: {
            tenantId: tenant.id,
            name: 'Carnes y Aves',
            type: 'RAW_MATERIAL',
        },
    });
    const categoryVeg = await prisma.category.create({
        data: {
            tenantId: tenant.id,
            name: 'Vegetales y Frutas',
            type: 'RAW_MATERIAL',
        },
    });
    const categoryDairy = await prisma.category.create({
        data: {
            tenantId: tenant.id,
            name: 'Lácteos y Quesos',
            type: 'RAW_MATERIAL',
        },
    });
    const materials = [
        {
            tenantId: tenant.id,
            name: 'Carne Ganzo (Lomo)',
            unit: 'KG',
            currentStock: 50,
            minStockAlert: 10,
            baseCost: 6.5,
            replacementCost: 7.0,
            yieldPercentage: 85,
            shrinkagePercentage: 15,
            categoryId: categoryMeats.id,
        },
        {
            tenantId: tenant.id,
            name: 'Pechuga de Pollo',
            unit: 'KG',
            currentStock: 30,
            minStockAlert: 15,
            baseCost: 4.0,
            replacementCost: 4.2,
            yieldPercentage: 90,
            shrinkagePercentage: 10,
            categoryId: categoryMeats.id,
        },
        {
            tenantId: tenant.id,
            name: 'Cebolla Blanca',
            unit: 'KG',
            currentStock: 20,
            minStockAlert: 5,
            baseCost: 1.2,
            replacementCost: 1.5,
            yieldPercentage: 80,
            shrinkagePercentage: 20,
            categoryId: categoryVeg.id,
        },
        {
            tenantId: tenant.id,
            name: 'Tomate Perita',
            unit: 'KG',
            currentStock: 25,
            minStockAlert: 8,
            baseCost: 0.8,
            replacementCost: 1.0,
            yieldPercentage: 95,
            shrinkagePercentage: 5,
            categoryId: categoryVeg.id,
        },
        {
            tenantId: tenant.id,
            name: 'Queso Mozzarella',
            unit: 'KG',
            currentStock: 15,
            minStockAlert: 5,
            baseCost: 5.5,
            replacementCost: 5.8,
            yieldPercentage: 100,
            shrinkagePercentage: 0,
            categoryId: categoryDairy.id,
        },
    ];
    for (const mat of materials) {
        await prisma.rawMaterial.create({
            data: mat,
        });
    }
    console.log('✅ Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map