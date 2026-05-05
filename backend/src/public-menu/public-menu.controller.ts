import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { Public } from '../auth/public.decorator';

interface PublicMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  prices: {
    USD: number;
    VES: number;
    USDT: number;
    EUR: number;
  };
}

interface PublicMenuCategory {
  name: string;
  items: PublicMenuItem[];
}

@Public()
@Controller('public-menu')
export class PublicMenuController {
  constructor(
    private prisma: PrismaService,
    private currenciesService: CurrenciesService,
  ) {}

  @Get(':slug')
  async getMenuBySlug(@Param('slug') slug: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
    });

    if (!tenant) throw new NotFoundException('Restaurante no encontrado.');

    // Get exchange rates for multi-currency display
    const rates = await this.currenciesService.getRates(tenant.id);

    const menuItems = await this.prisma.menuItem.findMany({
      where: { tenantId: tenant.id, isAvailable: true },
      include: {
        recipe: {
          select: {
            name: true,
            description: true,
            nutritionalInfo: true,
          },
        },
        category: {
          select: { name: true },
        },
        currency: {
          select: { code: true },
        },
      },
    });

    // Group by category with multi-currency prices
    const categoriesMap: Record<string, PublicMenuItem[]> = {};
    menuItems.forEach((item) => {
      const catName = item.category.name;
      if (!categoriesMap[catName]) categoriesMap[catName] = [];
      categoriesMap[catName].push({
        id: item.id,
        name: item.recipe.name,
        description: item.recipe.description,
        price: item.price,
        currency: item.currency.code,
        prices: this.currenciesService.convertToAll(item.price, rates),
      });
    });

    const menu: PublicMenuCategory[] = Object.entries(categoriesMap).map(
      ([name, items]) => ({ name, items }),
    );

    return {
      restaurantName: tenant.name,
      tenantId: tenant.id,
      slug: tenant.slug,
      logo: tenant.logo,
      coverImage: tenant.coverImage,
      address: tenant.address,
      phone: tenant.phone,
      instagram: tenant.instagram,
      whatsapp: tenant.whatsapp,
      rates,
      menu,
    };
  }
}
