import { Document, Types } from 'mongoose';

export interface IReview extends Document {
    user: Types.ObjectId;    // Who wrote it
    product: Types.ObjectId; // Which product
    business: Types.ObjectId;// Which seller (helpful for seller ratings)
    rating: number;          // 1 to 5
    comment?: string;
    isVerifiedPurchase: boolean; 
    createdAt: Date;
    updatedAt: Date;
}