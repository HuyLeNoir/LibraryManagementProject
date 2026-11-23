import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/api.types.js";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
): void => {
    console.error(`💥 [${req.method} ${req.originalUrl}] Error:`, err);

    // 1. Sai định dạng ObjectId của Mongoose
    if (err.name === "CastError") {
        res.status(400).json({
            success: false,
            message: "Định dạng ID không hợp lệ",
        });
        return;
    }

    // 2. Lỗi validate dữ liệu theo Mongoose Schema
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors || {})
            .map((item: any) => item.message)
            .filter(Boolean);

        res.status(400).json({
            success: false,
            message: messages.length > 0 ? messages.join(", ") : "Dữ liệu không hợp lệ",
        });
        return;
    }

    // 3. Lỗi trùng dữ liệu (unique index) trong MongoDB
    if (err.code === 11000) {
        const duplicateFields = Object.keys(err.keyPattern || {}).join(", ");
        res.status(409).json({
            success: false,
            message: duplicateFields
                ? `Giá trị bị trùng lặp ở trường: ${duplicateFields}`
                : "Dữ liệu đã tồn tại trên hệ thống",
        });
        return;
    }

    const statusCode: number = err.statusCode || 500;
    const message: string = err.message || "Lỗi máy chủ nội bộ";
    res.status(statusCode).json({
        success: false,
        message,
    });
};
