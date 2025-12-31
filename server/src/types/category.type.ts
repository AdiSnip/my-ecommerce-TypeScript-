import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    // We use a Union type here: it's either an ID or the fully populated Category object
    parentCategory: Types.ObjectId | ICategory | null; 
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}