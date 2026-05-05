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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordTransaction(tenantId, data, tx) {
        const execute = async (client) => {
            const material = await client.rawMaterial.findFirst({
                where: { id: data.rawMaterialId, tenantId },
            });
            if (!material) {
                throw new common_1.NotFoundException('Raw Material not found');
            }
            let effectiveQuantity = data.quantityChanged;
            if (data.type === 'SALE' || data.type === 'SHRINKAGE') {
                const yieldFactor = material.yieldPercentage / 100;
                effectiveQuantity = (Math.abs(data.quantityChanged) / yieldFactor) * -1;
            }
            const newStock = material.currentStock + effectiveQuantity;
            if (newStock < 0) {
                throw new common_1.BadRequestException(`Stock insuficiente para ${material.name}. Requerido: ${Math.abs(effectiveQuantity).toFixed(2)}, Disponible: ${material.currentStock.toFixed(2)}`);
            }
            const transaction = await client.inventoryTransaction.create({
                data: {
                    tenantId,
                    rawMaterialId: data.rawMaterialId,
                    type: data.type,
                    quantityChanged: effectiveQuantity,
                    costAtTransaction: material.baseCost,
                    referenceId: data.referenceId,
                },
            });
            const updatedMaterial = await client.rawMaterial.update({
                where: { id: material.id },
                data: { currentStock: Math.round(newStock * 100) / 100 },
            });
            return { transaction, updatedMaterial };
        };
        if (tx) {
            return execute(tx);
        }
        else {
            return this.prisma.$transaction(async (innerTx) => execute(innerTx));
        }
    }
    async getCriticalStock(tenantId) {
        const materials = await this.prisma.rawMaterial.findMany({
            where: { tenantId },
        });
        return materials.filter((m) => m.currentStock <= m.minStockAlert);
    }
    async getTransactionHistory(tenantId, rawMaterialId) {
        return this.prisma.inventoryTransaction.findMany({
            where: {
                tenantId,
                ...(rawMaterialId && { rawMaterialId }),
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map