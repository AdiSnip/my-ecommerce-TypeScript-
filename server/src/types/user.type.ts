import { Document, Types } from 'mongoose';

export interface IAddress {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
}

// --- 1. User Interface ---

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    contactNumber?: string;
    address?: IAddress;
    profilePicture?: string;
    refreshToken?: string;
    role: 'user' | 'seller' | 'admin';
    isVerified: boolean;
    interaction: {
        category: Types.ObjectId;
        viewCount: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}