import { Document, Types } from 'mongoose';
import { IUser } from './user.type';


export interface IAuditLog extends Document {
    performedBy: Types.ObjectId | IUser;
    action: string; // e.g., "PRICE_UPDATE"
    entityId: Types.ObjectId;
    entityModel: 'Product' | 'User' | 'Order' | 'Business';
    changes: {
        before: any;
        after: any;
    };
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}