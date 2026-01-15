import { Schema, model } from 'mongoose';
import { IOrder } from '../types/order.type';


const orderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // SNAPSHOT: Store the address exactly as it was when the user clicked "Buy"
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        phone: String
    },

    // SNAPSHOT: Store product details so they never change in history
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        sku: { type: Schema.Types.ObjectId, ref: 'Sku' }, // Link to specific variant
        seller: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
        
        // Critical: Snapshot details in case the Product is deleted later
        productName: String, 
        productImage: String,
        skuAttributes: { type: Map, of: String }, // e.g., { size: "M", color: "Red" }
        
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true }, // The price they actually paid
        discountApplied: { type: Number, default: 0 }
    }],

    paymentInfo: {
        method: { type: String, default: 'card' },
        transactionId: { type: String }, // Link to Stripe/PayPal ID
        status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' }
    },

    // Financials
    totalItemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    orderStatus: { 
        type: String, 
        enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'], 
        default: 'processing' 
    }
}, { timestamps: true });

export const Order = model<IOrder>('Order', orderSchema);