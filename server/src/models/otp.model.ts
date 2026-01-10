import { model, Schema } from 'mongoose';
import { Iotp } from '../types/otp.type';

const otpSchema = new Schema<Iotp>({
    email: { type: String, required: true, index: true },
    otp: { type: Number, required: true },
    count: { type: Number, default: 1 },
    lastSentAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now, expires: 300 } 
});

export default model<Iotp>('Otp', otpSchema);