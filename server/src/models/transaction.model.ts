import { Schema, model } from 'mongoose';
import { ITransaction } from '../types/transaction.type';

const transactionSchema = new Schema<ITransaction>({
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    gateway: { type: String, enum: ['stripe', 'paypal', 'razorpay'], required: true },
    gatewayTransactionId: { type: String, required: true }, // The ID from Stripe
    
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    
    type: { type: String, enum: ['payment', 'refund'], default: 'payment' },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    
    metadata: { type: Map, of: String } // Any extra JSON from the gateway
}, { timestamps: true });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);