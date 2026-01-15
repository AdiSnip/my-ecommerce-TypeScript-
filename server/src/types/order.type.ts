import { Document, Types } from 'mongoose';
import { IAddress } from './user.type';
import { IUser } from './user.type';

export interface IOrderItem {
    product: Types.ObjectId;
    sku: Types.ObjectId;
    seller: Types.ObjectId;
    productName: string;      // Snapshot
    productImage: string;     // Snapshot
    skuAttributes: Record<string, string>; // Snapshot
    quantity: number;
    priceAtPurchase: number;  // Price Lock
    discountApplied: number;
}

export interface IOrder extends Document {
    user: Types.ObjectId | IUser;
    shippingAddress: IAddress; // Address Snapshot
    items: IOrderItem[];
    paymentInfo: {
        method: string;
        transactionId?: string;
        status: 'pending' | 'paid' | 'failed' | 'refunded';
    };
    totalItemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalAmount: number;
    orderStatus: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    createdAt: Date;
    updatedAt: Date;
}