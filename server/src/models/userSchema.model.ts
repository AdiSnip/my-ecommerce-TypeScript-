import { model, Schema } from 'mongoose';
import { IUser } from '../types/userSchema.type';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    refreshToken: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    interaction: {
        category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        subcategory: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }],
    },
    history: {
        buy: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        return: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        cancel: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    },
    cart: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 0, min: 0 }
    }]
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;

    this.password = await bcrypt.hash(this.password, 10)
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "", { expiresIn: "30d" });
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "", { expiresIn: "1d" });
}

export default model<IUser>('User', userSchema);



//create jwt token generation
