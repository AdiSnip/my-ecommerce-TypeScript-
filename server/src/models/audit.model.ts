import { Schema, model } from 'mongoose';
import { IAuditLog } from '../types/audit.type';

const auditLogSchema = new Schema<IAuditLog>({
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Admin/Seller ID
    action: { type: String, required: true }, // e.g., "UPDATE_PRICE", "BAN_USER"
    entityId: { type: Schema.Types.ObjectId }, // The ID of the Product/User being changed
    entityModel: { type: String }, // "Product", "User", "Order"
    
    changes: {
        before: Schema.Types.Mixed, // Snapshot of data before change
        after: Schema.Types.Mixed   // Snapshot of data after change
    },
    
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } }); // Logs are immutable

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);