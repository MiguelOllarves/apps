import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '@prisma/client';

export class RecordTransactionDto {
  @IsString()
  @IsNotEmpty()
  rawMaterialId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Type(() => Number)
  quantityChanged: number;

  @IsString()
  @IsOptional()
  referenceId?: string;
}
