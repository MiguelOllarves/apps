import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { RecipesModule } from '../recipes/recipes.module';

@Module({
  imports: [WhatsappModule, RecipesModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
