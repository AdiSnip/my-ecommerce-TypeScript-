import { Schema, model } from 'mongoose';
import { IProduct } from '../types/product.type';

const productSchema = new Schema<IProduct>({
    seller: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, unique: true, lowercase: true }, // SEO Friendly URL
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    
    brand: { type: String },
    tags: [{ type: String }],
    
    // Marketing Images (The "Face" of the product)
    images: [{ type: String }], 
    
    // Base specs common to all variants (e.g., Material is Cotton for all sizes)
    specifications: [{
        key: String,
        value: String
    }],

    // Aggregate data for sorting/filtering
    hasVariants: { type: Boolean, default: false },
    minPrice: { type: Number, default: 0 }, // For "From $10" display
    maxPrice: { type: Number, default: 0 },
    
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Product = model<IProduct>('Product', productSchema);