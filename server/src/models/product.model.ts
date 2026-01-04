import { Schema, model } from 'mongoose';
import { IProduct } from '../types/product.type';

const productSchema = new Schema<IProduct>({
    seller: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }], // Cloudinary URLs
    stock: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

// Check if item is in stock
productSchema.methods.isInStock = function () {
    return this.stock > 0;
};

export const Product = model('Product', productSchema);