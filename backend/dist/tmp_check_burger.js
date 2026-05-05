"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=tmp_check_burger.js.map