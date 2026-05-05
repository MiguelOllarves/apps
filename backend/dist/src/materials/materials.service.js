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
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let MaterialsService = class MaterialsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(tenantId, data) {
        let categoryId = data.categoryId;
        if (!categoryId || categoryId === '') {
            const defaultCategory = (await this.prisma.category.findFirst({
                where: { tenantId, type: 'RAW_MATERIAL', name: 'Insumos Generales' },
            })) ||
                (await this.prisma.category.create({
                    data: { tenantId, name: 'Insumos Generales', type: 'RAW_MATERIAL' },
                }));
            categoryId = defaultCategory.id;
        }
        return this.prisma.rawMaterial.create({
            data: {
                ...data,
                categoryId,
                tenantId,
            },
        });
    }
    async findAll(tenantId, categoryId) {
        return this.prisma.rawMaterial.findMany({
            where: {
                tenantId,
                ...(categoryId && { categoryId }),
            },
            include: {
                category: true,
            },
        });
    }
    async findOne(tenantId, id) {
        const material = await this.prisma.rawMaterial.findFirst({
            where: { id, tenantId },
            include: { category: true },
        });
        if (!material)
            throw new common_1.NotFoundException('Material not found');
        return material;
    }
    async update(tenantId, id, data, userId) {
        const oldMaterial = await this.findOne(tenantId, id);
        const isPriceChanged = (data.baseCost !== undefined && data.baseCost !== oldMaterial.baseCost) ||
            (data.replacementCost !== undefined && data.replacementCost !== oldMaterial.replacementCost);
        const result = await this.prisma.rawMaterial.update({
            where: { id },
            data,
        });
        if (isPriceChanged) {
            await this.audit.log(tenantId, userId || null, 'PRICE_CHANGE', 'RawMaterial', id, { baseCost: oldMaterial.baseCost, replacementCost: oldMaterial.replacementCost }, { baseCost: result.baseCost, replacementCost: result.replacementCost });
        }
        return result;
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.rawMaterial.delete({
            where: { id },
        });
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map