import { Schema, model } from 'mongoose';
import { IInventory } from '../types/inventory.type';

const inventorySchema = new Schema<IInventory>({
    sku: { type: Schema.Types.ObjectId, ref: 'Sku', required: true, unique: true },
    
    // Total physical stock
    quantity: { type: Number, required: true, min: 0 },
    
    // Stock currently sitting in unpaid carts (prevents overselling)
    reserved: { type: Number, default: 0, min: 0 }, 
    
    // When to warn the admin to buy more
    lowStockThreshold: { type: Number, default: 5 },
    
    // Location (Optional: If you have multiple warehouses, remove unique: true on sku and add warehouseId)
    warehouseLocation: { type: String, default: 'Default Warehouse' }
}, { timestamps: true });

// Helper to check available sellable stock
inventorySchema.virtual('sellable').get(function() {
    return this.quantity - this.reserved;
});

export const Inventory = model<IInventory>('Inventory', inventorySchema);