import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { MaterialsModule } from './materials/materials.module';
import { InventoryModule } from './inventory/inventory.module';
import { RecipesModule } from './recipes/recipes.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AuthModule } from './auth/auth.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuditModule } from './audit/audit.module';
import { PublicMenuModule } from './public-menu/public-menu.module';
import { TenantsModule } from './tenants/tenants.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TenantGuard } from './auth/tenant.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    MaterialsModule,
    InventoryModule,
    RecipesModule,
    OrdersModule,
    CustomersModule,
    WhatsappModule,
    AuthModule,
    CurrenciesModule,
    DashboardModule,
    UploadsModule,
    AuditModule,
    PublicMenuModule,
    TenantsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
