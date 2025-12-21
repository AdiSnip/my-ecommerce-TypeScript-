import { Schema, model, Document, Types } from 'mongoose';

// Interface for the Address sub-document
interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Main Business Interface
export interface IBusiness extends Document {
  owner: Types.ObjectId; // Reference to User
  businessName: string;
  legalEntityName: string;
  taxId: string;
  businessAddress: IAddress;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  analytics: {
    totalSales: number;
    totalOrders: number;
    totalVisitors: number; // Needed for Conversion Rate
    marketingSpend: number; // Needed for CAC
  };
  status: 'active' | 'suspended' | 'under_review';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}