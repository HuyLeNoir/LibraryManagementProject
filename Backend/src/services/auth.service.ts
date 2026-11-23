import jwt, { type SignOptions } from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { NhanVienModel } from "../models/nhanvien.model.js";
import { CreateDocGiaPayload } from "../types/dto.types.js";
import { LoginResult, JwtPayloadData, NhanVien, DocGia } from "../types/types.js";
import { DocGiaModel } from "../models/docgia.model.js";
import { verify } from "node:crypto";
import { hashPassword, verifyPassword } from "../utils/utils.js";
import { DocGiaService } from "./docgia.service.js";
const JWT_SECRET = process.env.JWT_SECRET || "skibidi";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"];

export class AuthService {
    static async LoginNhanVien(MSNV: string, Password: string): Promise<LoginResult<NhanVien>> {
        if (!MSNV || !Password) {
            throw new AppError("Vui lòng nhập mã số nhân viên và mật khẩu", 400);
        }

        const nhanvien = await NhanVienModel.findOne({ MSNV: MSNV.trim() }).select("+Password");
        if (!nhanvien) {
            throw new AppError("Mã số nhân viên hoặc mật khẩu không đúng", 401);
        }

        const isPasswordValid = verifyPassword(Password, nhanvien.Password);
        if (!isPasswordValid) {
            throw new AppError("Mã số nhân viên hoặc mật khẩu không đúng", 401);
        }

        const payload: JwtPayloadData = {
            MSNV: nhanvien.MSNV,
            role: "nhanvien",
            chucVu: nhanvien.ChucVu || "NhanVien",
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        return {
            user: {
                MSNV: nhanvien.MSNV,
                HoTenNV: nhanvien.HoTenNV,
                ChucVu: nhanvien.ChucVu,
                DiaChi: nhanvien.DiaChi,
                SoDienThoai: nhanvien.SoDienThoai,
            },
            role: "nhanvien",
            token,
        };
    }
    static async LoginDocGia(MADOCGIA: string, Password: string): Promise<LoginResult<DocGia>> {
        if (!MADOCGIA) {
            throw new AppError("Vui lòng nhập mã đọc giả", 400);
        }

        const docgia = await DocGiaModel.findOne({ MADOCGIA }).select("+PASSWORD");
        if (!docgia) {
            throw new AppError("Không tồn tại đọc giả", 401);
        }

        const isPasswordValid = verifyPassword(Password, docgia.PASSWORD);
        if (!isPasswordValid) {
            throw new AppError("Mật khẩu sai", 401);
        }

        const payload: JwtPayloadData = {
            role: "docgia",
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        return {
            user: {
                MADOCGIA: docgia.MADOCGIA,
                HOLOT: docgia.HOLOT,
                TEN: docgia.TEN,
                NGAYSINH: docgia.NGAYSINH,
                PHAI: docgia.PHAI,
                DIACHI: docgia.DIACHI,
                DIENTHOAI: docgia.DIENTHOAI,
            },
            role: "docgia",
            token,
        };
    }
    static async RegisterDocGia(Payload: CreateDocGiaPayload): Promise<LoginResult<DocGia>> {
        if (!Payload) {
            throw new AppError("Vui Không có payload", 400);
        }
        Payload.PASSWORD = hashPassword(Payload.PASSWORD);
        const MADOCGIA = await DocGiaService.generateMaDocGia();
        const docgia = await DocGiaModel.create({ ...Payload, MADOCGIA });
        const payload: JwtPayloadData = {
            role: "docgia",
        };
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
        return {
            user: {
                MADOCGIA: docgia.MADOCGIA,
                HOLOT: docgia.HOLOT,
                TEN: docgia.TEN,
                NGAYSINH: docgia.NGAYSINH,
                PHAI: docgia.PHAI,
                DIACHI: docgia.DIACHI,
                DIENTHOAI: docgia.DIENTHOAI,
            },
            role: "docgia",
            token,
        };
    }
}
