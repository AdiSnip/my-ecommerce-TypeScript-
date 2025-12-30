import { model, Schema } from 'mongoose';
import { IUser } from '../types/user.type';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * User Schema Definition
 * Defines the structure for user profiles, including authentication, 
 * contact details, history, and shopping cart.
 */
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactNumber: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
    },
    profilePicture: { type: String },
    refreshToken: { type: String }, // Stored for session persistence and token rotation
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    interaction: {
        category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        subcategory: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }],
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

/**
 * Pre-save Middleware
 * Automatically hashes the password before saving to the database if it was modified.
 * Async return signals completion to Mongoose.
 */
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;

    this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Instance Method: comparePassword
 * Compares a plain-text password with the hashed password in the database.
 */
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
}

/**
 * Instance Method: generateAccessToken
 * Creates a short-lived JWT for accessing protected resources.
 */
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.ACCESS_TOKEN_SECRET || "",
        { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY as any) || "1d" }
    );
}

/**
 * Instance Method: generateRefreshToken
 * Creates a long-lived JWT used to obtain new access tokens.
 */
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN_SECRET || "",
        { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY as any) || "30d" }
    );
}

// Export the User model with the IUser interface
export default model<IUser>('User', userSchema);