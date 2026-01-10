import { Types, Document } from "mongoose";

export interface Iotp extends Document {
    email: string;
    otp: number;
    lastSentAt : Date;
    count: number;
    createdAt: Date;
}