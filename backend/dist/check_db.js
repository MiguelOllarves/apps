"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function check() {
    try {
        console.log('Intentando conectar a la base de datos...');
        const tenants = await prisma.tenant.count();
        console.log(`Conexión exitosa. Número de Tenants: ${tenants}`);
    }
    catch (error) {
        console.error('Error al conectar:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
check();
//# sourceMappingURL=check_db.js.map