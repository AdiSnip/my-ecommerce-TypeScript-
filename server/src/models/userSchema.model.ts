import { model, Schema } from 'mongoose';
import { IUser } from '../types/userSchema.type';

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    contactNumber: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
    },
    profilePicture: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    interaction: {
        category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        subcategory: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }],
    },
    history: {
        buy: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        return: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        cancel: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    },
    cart: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 }
    }]
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
