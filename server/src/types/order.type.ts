import { Document, Types } from 'mongoose';
import { IAddress } from './user.type';

export interface IOrderItem {
    seller: Types.ObjectId;
    product: Types.ObjectId;
    quantity: number;
    priceAtPurchase: number; // Snapshot of price
}

export interface IOrder extends Document {
    buyer: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    shippingAddress: IAddress;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: string;
    trackingId?: string;
    createdAt: Date;
    updatedAt: Date;
}