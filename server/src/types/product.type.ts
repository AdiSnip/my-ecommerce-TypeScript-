import { Document, Types } from 'mongoose';

export interface IProduct extends Document {
    seller: Types.ObjectId; // Refers to Business
    name: string;
    description: string;
    price: number;
    category: Types.ObjectId; // Refers to Category
    subcategory?: Types.ObjectId;
    images: string[];
    stock: number;
    isPublished: boolean;
    averageRating: number;
    attributes: Array<{ key: string; value: string }>; // e.g., Color, Size
    createdAt: Date;
    updatedAt: Date;
}