import { CategoryType } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    type: CategoryType;
}
export declare class UpdateCategoryDto {
    name?: string;
    type?: CategoryType;
}
