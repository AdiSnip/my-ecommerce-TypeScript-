import { Schema, model, Document, Types } from 'mongoose';
import { IBusiness } from '../types/businessSchema.type';

const businessSchema = new Schema<IBusiness>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true, trim: true },
  legalEntityName: { type: String, required: true },
  taxId: { type: String, required: true, unique: true },
  
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    routingNumber: String,
    bankName: String
  },

  analytics: {
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalVisitors: { type: Number, default: 0 },
    marketingSpend: { type: Number, default: 0 }
  },

  status: { 
    type: String, 
    enum: ['active', 'suspended', 'under_review'], 
    default: 'under_review' 
  },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

businessSchema.methods.getConversionRate = function() {
    return (this.analytics.totalOrders / (this.analytics.totalVisitors || 1)) * 100;
};

export const Business = model<IBusiness>('Business', businessSchema);