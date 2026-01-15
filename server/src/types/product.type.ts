import { Document, Types } from 'mongoose';
import { IBusiness } from './business.type';

export interface IProduct extends Document {
    seller: Types.ObjectId | IBusiness;
    name: string;
    slug: string;
    description: string;
    category: Types.ObjectId;
    brand?: string;
    tags: string[];
    images: string[];
    specifications: { key: string; value: string }[];
    hasVariants: boolean;
    minPrice: number;
    maxPrice: number;
    averageRating: number;
    totalReviews: number;
    isPublished: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}