import { TransactionType } from '@prisma/client';
export declare class RecordTransactionDto {
    rawMaterialId: string;
    type: TransactionType;
    quantityChanged: number;
    referenceId?: string;
}
