import { model, Schema, Document } from "mongoose";
import { NhanVien } from "../types/types.js";

export interface INhanVienDocument extends Omit<NhanVien, "_id">, Document {
    Password: string;
}

const nhanvienSchema = new Schema<INhanVienDocument>(
    {
        MSNV: { type: String, required: true, unique: true, trim: true },
        HoTenNV: { type: String, required: true, trim: true },
        ChucVu: { type: String, required: true, trim: true },
        DiaChi: { type: String, required: true, trim: true },
        SoDienThoai: { type: String, required: true, trim: true },
        Password: { type: String, required: true, trim: true, select: false },
    },
    { timestamps: true },
);

export const NhanVienModel = model<INhanVienDocument>("NhanVien", nhanvienSchema);
