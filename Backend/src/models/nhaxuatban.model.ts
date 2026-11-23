import { Schema, model, Document } from "mongoose";
import { NhaXuatBan } from "../types/types.js";

export interface INhaXuatBanDocument extends Omit<NhaXuatBan, "_id">, Document {}

const nhaxuatbanSchema = new Schema<INhaXuatBanDocument>(
    {
        MANXB: { type: String, required: true, unique: true, trim: true },
        TENNXB: { type: String, required: true, trim: true },
        DIACHI: { type: String, trim: true },
    },
    { timestamps: true },
);

export const NhaXuatBanModel = model<INhaXuatBanDocument>("NhaXuatBan", nhaxuatbanSchema);
