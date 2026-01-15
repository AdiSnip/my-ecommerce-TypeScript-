import { Document, Types } from 'mongoose';
import { IProduct } from './product.type';
import { ISku } from './sku.type';
import { IUser } from './user.type';


export interface ICartItem {
    product: Types.ObjectId | IProduct;
    sku: Types.ObjectId | ISku;
    quantity: number;
    attributesSnapshot: string; // e.g., "Color: Red, Size: M"
}

export interface ICart extends Document {
    user: Types.ObjectId | IUser;
    items: ICartItem[];
    billDetails: {
        itemsTotal: number;
        tax: number;
        discount: number;
        shippingFee: number;
        grandTotal: number;
    };
    createdAt: Date;
    updatedAt: Date;
}