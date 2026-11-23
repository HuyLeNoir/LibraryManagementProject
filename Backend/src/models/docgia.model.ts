import { Schema, model, Document } from "mongoose";
import { DocGia } from "../types/types.js";
export interface IDocGia extends Omit<DocGia, "_id">, Document {}

const docgiaSchema = new Schema<IDocGia>(
    {
        MADOCGIA: { type: String, required: true, unique: true, trim: true },
        HOLOT: { type: String, required: true, trim: true },
        TEN: { type: String, required: true, trim: true },
        NGAYSINH: { type: Date, required: true },
        PHAI: { type: String, required: true, trim: true },
        DIACHI: { type: String, trim: true },
        DIENTHOAI: { type: String, trim: true },
    },
    { timestamps: true },
);

export const DocGiaModel = model<IDocGia>("DocGia", docgiaSchema);
