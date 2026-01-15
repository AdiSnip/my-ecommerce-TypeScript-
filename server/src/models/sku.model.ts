import { Schema, model } from 'mongoose';
import { ISku } from '../types/sku.type';

const skuSchema = new Schema<ISku>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    
    skuCode: { type: String, required: true, unique: true }, // e.g., "NIKE-AIR-RED-09"
    
    // Pricing specific to this variant
    price: { type: Number, required: true },
    salePrice: { type: Number }, // Optional discounted price
    
    // Attributes that define this variant
    attributes: [{
        key: { type: String }, // e.g., "Color"
        value: { type: String } // e.g., "Red"
    }],

    image: { type: String }, // Specific image for this variant (e.g., the Red shirt photo)
    
    // Physical specs for shipping calc
    weight: { type: Number }, // in kg
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index to ensure you don't have two "Size: M, Color: Red" for the same product
skuSchema.index({ product: 1, 'attributes.key': 1, 'attributes.value': 1 });

export const Sku = model<ISku>('Sku', skuSchema);