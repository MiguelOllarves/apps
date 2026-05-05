
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const pan = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Pan', mode: 'insensitive' } }
  });
  console.log('--- Pan Materials ---');
  console.log(JSON.stringify(pan, null, 2));

  // Correct Mayonesa cost to something reasonable if it's crazy
  const mayo = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Mayo', mode: 'insensitive' } }
  });

  if (mayo && (mayo.baseCost === 58 || mayo.baseCost === 0.3)) {
    console.log('Correcting Mayonesa cost to $0.0058 per gram...');
    await prisma.rawMaterial.update({
      where: { id: mayo.id },
      data: { baseCost: 0.0058, replacementCost: 0.0058 }
    });
  }

  await prisma.$disconnect();
}

main();
