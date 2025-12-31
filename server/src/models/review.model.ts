import { Schema, model } from 'mongoose';
import { IReview } from '../types/review.type';
import { Product } from './product.model';

const reviewSchema = new Schema<IReview>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    isVerifiedPurchase: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent a user from leaving multiple reviews for the same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(productId) {
    const stats = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: stats[0].avgRating,
            totalReviews: stats[0].nRating
        });
    }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
    (this.constructor as any).calculateAverageRating(this.product);
});

export const Review = model<IReview>('Review', reviewSchema);