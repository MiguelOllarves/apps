import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { CategoryType } from '@prisma/client';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(tenantId: string, dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }>;
    findAll(tenantId: string, type?: CategoryType): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }>;
    update(tenantId: string, id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.CategoryType;
    }>;
}
