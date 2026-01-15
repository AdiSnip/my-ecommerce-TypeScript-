import { Document, Types } from 'mongoose';
import { IUser } from '../types/user.type';
import { IOrder } from './order.type';

// --- 8. Transaction Interface ---

export interface ITransaction extends Document {
    order: Types.ObjectId | IOrder; // Kis order ke liye payment hui
    user: Types.ObjectId | IUser;  // Kisne payment ki
    
    // Gateway Details
    gateway: 'stripe' | 'paypal' | 'razorpay' | 'wallet'; 
    gatewayTransactionId: string; // Stripe/PayPal se mili unique ID
    gatewaySubscriptionId?: string; // Agar recurring payment hai toh
    
    // Financial Details
    amount: number;
    currency: string; // e.g., 'USD', 'INR'
    
    // Status Logic
    type: 'payment' | 'refund' | 'payout'; 
    status: 'pending' | 'success' | 'failed' | 'reversed';
    
    // Security & Compliance
    paymentMethodDetails?: {
        cardType?: string; // e.g., 'Visa', 'Mastercard'
        last4?: string;    // Sirf last 4 digits (PCI compliance)
    };
    
    failureMessage?: string; // Agar payment fail hui toh reason kya tha
    metadata?: Record<string, any>; // Gateway se aaya extra raw data

    createdAt: Date;
    updatedAt: Date;
}