import { Document, Types } from 'mongoose';

export interface IAddress {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    contactNumber?: string;
    address?: IAddress;
    profilePicture?: string;
    role: 'user' | 'admin';
    isVerified: boolean;

    history: {
        buy: Types.ObjectId[];
        return: Types.ObjectId[];
        cancel: Types.ObjectId[];
    };

    cart: ICartItem[];

    interaction: {
        category: Types.ObjectId[];
        subcategory: Types.ObjectId[];
    };

    createdAt: Date;
    updatedAt: Date;
}