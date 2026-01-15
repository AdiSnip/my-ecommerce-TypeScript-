import { Document, Types } from 'mongoose';
import { ISku } from './sku.type';

export interface IInventory extends Document {
    sku: Types.ObjectId | ISku;
    quantity: number;      // Total stock in warehouse
    reserved: number;      // Stock held in carts/checkout
    lowStockThreshold: number;
    warehouseLocation?: string;
    sellable: number;      // Virtual: quantity - reserved
    createdAt: Date;
    updatedAt: Date;
}