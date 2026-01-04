import { Schema, model } from 'mongoose';
import { IOrder } from '../types/order.type';

const orderSchema = new Schema<IOrder>({
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        seller: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true } // Price lock
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: { street: String, city: String, country: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
}, { timestamps: true });

export const Order = model('Order', orderSchema);