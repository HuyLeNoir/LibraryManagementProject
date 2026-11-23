import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    price: number;
    category: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: [true, "Tên sản phẩm là bắt buộc"], trim: true },
        price: { type: Number, required: [true, "Giá là bắt buộc"], min: [0, "Giá không được âm"] },
        category: { type: String, required: true, trim: true },
        stock: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true },
);

export const ProductModel = model<IProduct>("Product", productSchema);
