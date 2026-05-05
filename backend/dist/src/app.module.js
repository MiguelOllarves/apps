"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const categories_module_1 = require("./categories/categories.module");
const materials_module_1 = require("./materials/materials.module");
const inventory_module_1 = require("./inventory/inventory.module");
const recipes_module_1 = require("./recipes/recipes.module");
const orders_module_1 = require("./orders/orders.module");
const customers_module_1 = require("./customers/customers.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const auth_module_1 = require("./auth/auth.module");
const currencies_module_1 = require("./currencies/currencies.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const uploads_module_1 = require("./uploads/uploads.module");
const audit_module_1 = require("./audit/audit.module");
const public_menu_module_1 = require("./public-menu/public-menu.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const tenant_guard_1 = require("./auth/tenant.guard");
const roles_guard_1 = require("./auth/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            categories_module_1.CategoriesModule,
            materials_module_1.MaterialsModule,
            inventory_module_1.InventoryModule,
            recipes_module_1.RecipesModule,
            orders_module_1.OrdersModule,
            customers_module_1.CustomersModule,
            whatsapp_module_1.WhatsappModule,
            auth_module_1.AuthModule,
            currencies_module_1.CurrenciesModule,
            dashboard_module_1.DashboardModule,
            uploads_module_1.UploadsModule,
            audit_module_1.AuditModule,
            public_menu_module_1.PublicMenuModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_guard_1.TenantGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map