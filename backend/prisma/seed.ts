import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed de ControlTotal...');

  // 1. Create a Master Tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'master' },
    update: {},
    create: {
      name: 'ControlTotal HQ',
      domain: 'master',
    },
  });

  // 2. Create Master User
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

  // 3. Create Currencies (USD as base, VES as local)
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
    update: { exchangeRate: 481.21 }, // Update rate if needed
    create: {
      tenantId: tenant.id,
      code: 'VES',
      exchangeRate: 481.21, // example rate
      isBaseCurrency: false,
    },
  });

  // 4. Create Categories
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

  // 5. Create 5 sample materials with realistic shrinkage
  const materials = [
    {
      tenantId: tenant.id,
      name: 'Carne Ganzo (Lomo)',
      unit: 'KG',
      currentStock: 50,
      minStockAlert: 10,
      baseCost: 6.5, // 6.5 USD per KG
      replacementCost: 7.0,
      yieldPercentage: 85, // 15% shrinkage typical for trimming
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
      yieldPercentage: 90, // 10% shrinkage for bones/fat
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
      yieldPercentage: 80, // 20% shrinkage (peeling, roots)
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
      yieldPercentage: 95, // 5% shrinkage typical
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
      yieldPercentage: 100, // No shrinkage
      shrinkagePercentage: 0,
      categoryId: categoryDairy.id,
    },
  ];

  for (const mat of materials) {
    // using ts-ignore for enums generated at runtime vs ts build
    await prisma.rawMaterial.create({
      data: mat as any,
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
