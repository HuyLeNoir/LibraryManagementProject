import { Schema, model, Document } from "mongoose";
import { Sach } from "../types/types.js";
export interface ISachDocument extends Omit<Sach, "_id">, Document {}

const sachSchema = new Schema<ISachDocument>(
    {
        MASACH: { type: String, required: true, unique: true, trim: true },
        TENSACH: { type: String, required: true, trim: true },
        DONGIA: { type: Number, required: true, min: 0 },
        SOQUYEN: { type: Number, required: true, min: 0, default: 0 },
        MANXB: { type: String, required: true, trim: true },
        NGUONGOCTACGIA: { type: String, trim: true },
    },
    { timestamps: true },
);

export const SachModel = model<ISachDocument>("Sach", sachSchema);
