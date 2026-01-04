import { Schema, model } from 'mongoose';
import { ICart } from '../types/cart.type';

const cartSchema = new Schema<ICart>({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true // One user, one cart
    },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, min: 1 },
        selectedSize: String, // Example of why a separate model is good
        selectedColor: String
    }],
    billDetails: {
        itemsTotal: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        shippingFee: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 }
    }
}, { timestamps: true });

export const Cart = model('Cart', cartSchema);