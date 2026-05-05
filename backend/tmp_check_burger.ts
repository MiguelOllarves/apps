
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const materials = await prisma.rawMaterial.findMany({
    where: {
      name: { contains: 'Mayo', mode: 'insensitive' }
    }
  });
  console.log('--- Mayonesa Materials ---');
  console.log(JSON.stringify(materials, null, 2));

  const allMaterials = await prisma.rawMaterial.findMany({
    where: {
      tenantId: '4fd168a1-6b6f-4cb8-b373-7cd520ba79e3'
    }
  });
  console.log('--- All Materials for Tenant ---');
  console.log(JSON.stringify(allMaterials.map(m => ({ name: m.name, cost: m.baseCost, unit: m.unit })), null, 2));

  await prisma.$disconnect();
}

main();
