import { Document, Types } from 'mongoose';

export interface IAddress {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}


export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    contactNumber?: string;
    address?: IAddress;
    profilePicture?: string;
    refreshToken?: string;
    role: 'user' | 'admin';
    isVerified: boolean;
    interaction: {
        category: Types.ObjectId[];
        subcategory: Types.ObjectId[];
    };

    createdAt: Date;
    updatedAt: Date;

    // Method signatures for instance methods
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}