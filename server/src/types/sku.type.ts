import { Document, Types } from 'mongoose';
import { IBusiness } from './business.type';
import { IProduct } from './product.type';

export interface ISku extends Document {
    product: Types.ObjectId | IProduct;
    seller: Types.ObjectId | IBusiness;
    skuCode: string; // Unique (e.g., NIKE-RED-XL)
    price: number;
    salePrice?: number;
    attributes: { key: string; value: string }[]; // e.g., Color: Red, Size: XL
    image?: string;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}