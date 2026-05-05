import { Module } from '@nestjs/common';
import { PublicMenuController } from './public-menu.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CurrenciesModule } from '../currencies/currencies.module';

@Module({
  imports: [PrismaModule, CurrenciesModule],
  controllers: [PublicMenuController],
})
export class PublicMenuModule {}
