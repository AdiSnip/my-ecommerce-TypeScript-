import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { ICategory } from '../types/category.type';

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: [true, "Category name is required"],
        // Important: name is no longer global unique because 
        // "Sale" can exist under "Men" and "Women"
        trim: true
    },
    slug: {
        type: String,
        unique: true, // The full path MUST be unique
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [500, "Description cannot exceed 500 characters"]
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    image: {
        type: String,
        default: "https://via.placeholder.com/150"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// --- MIDDLEWARE ---

/**
 * 1. PRE-SAVE: Generate the nested slug path
 */
categorySchema.pre('save', async function () {
    // Only generate if name or parent changed
    if (this.isModified('name') || this.isModified('parentCategory')) {
        const selfSlug = slugify(this.name, { lower: true, strict: true });

        if (this.parentCategory) {
            // Fetch parent to get its slug
            const parent = await model('Category').findById(this.parentCategory);
            if (parent) {
                this.slug = `${parent.slug}/${selfSlug}`;
            } else {
                this.slug = selfSlug;
            }
        } else {
            this.slug = selfSlug;
        }
    }
});

/**
 * 2. POST-SAVE: Cascade updates to all children
 * If "Electronics" changes to "Tech", this ensures "Electronics/Laptops" 
 * automatically becomes "Tech/Laptops"
 */
categorySchema.post('save', async function (doc) {
    const children = await model('Category').find({ parentCategory: doc._id });

    for (const child of children) {
        // Saving the child triggers its own pre-save hook to re-calculate slug
        await child.save();
    }
});

export const Category = model<ICategory>('Category', categorySchema);