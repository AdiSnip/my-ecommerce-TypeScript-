import { Schema, model } from 'mongoose';
import { ICategory } from '../types/category.type';

const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true }, // for SEO: /category/electronics
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null }, // for sub-categories
    image: String
});

export const Category = model('Category', categorySchema);