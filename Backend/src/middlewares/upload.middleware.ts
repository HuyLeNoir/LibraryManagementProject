import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request } from "express";

// Thư mục lưu file ở gốc Backend/uploads
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        // Mã hóa tên file thành chuỗi ngẫu nhiên duy nhất (VD: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.jpg)
        const hashedName = `${crypto.randomUUID()}${ext}`;
        cb(null, hashedName);
    },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận file ảnh định dạng .jpg, .png hoặc .webp"));
    }
};

export const uploadBookCover = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Tối đa 5MB
    },
});
