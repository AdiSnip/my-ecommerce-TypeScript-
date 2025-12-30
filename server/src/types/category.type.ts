import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    image?: string;
    parentCategory?: Types.ObjectId; // Null for top-level, ID for sub-categories
}