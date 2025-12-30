import { Document, Types } from 'mongoose';

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    user: Types.ObjectId;
    items: ICartItem[];
    billDetails: {
        itemsTotal: number;
        tax: number;
        shippingFee: number;
        grandTotal: number;
    };
    createdAt: Date;
    updatedAt: Date;
}