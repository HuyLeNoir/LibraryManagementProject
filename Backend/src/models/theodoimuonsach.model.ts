import { Schema, model, Document } from "mongoose";
import { TheoDoiMuonSach } from "../types/types.js";

export interface ITheoDoiMuonSachDocument extends Omit<TheoDoiMuonSach, "_id">, Document {}

const theodoimuonsachSchema = new Schema<ITheoDoiMuonSachDocument>(
    {
        MADOCGIA: { type: String, required: true, trim: true },
        MASACH: { type: String, required: true, trim: true },
        NGAYMUON: { type: Date, required: true },
        NGAYTRA: { type: Date, required: false },
        NGAYDUKIENTRA: { type: Date },
        TINHTRANG: { type: String, required: true },
    },
    { timestamps: true },
);

export const TheoDoiMuonSachModel = model<ITheoDoiMuonSachDocument>(
    "TheoDoiMuonSach",
    theodoimuonsachSchema,
);
