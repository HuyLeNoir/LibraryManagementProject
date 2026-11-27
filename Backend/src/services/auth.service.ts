import jwt, { type SignOptions } from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { NhanVienModel } from "../models/nhanvien.model.js";
import { CreateDocGiaPayload } from "../types/dto.types.js";
import { LoginResult, JwtPayloadData, NhanVien, DocGia } from "../types/types.js";
import { DocGiaModel } from "../models/docgia.model.js";
import { verify } from "node:crypto";
import { hashPassword, verifyPassword } from "../utils/utils.js";
import { DocGiaService } from "./docgia.service.js";
import {
    createDocGiaSchema,
    loginDocGiaSchema,
    loginNhanVienSchema,
    parsePayload,
} from "../validators/schemas.js";
const JWT_SECRET = process.env.JWT_SECRET || "skibidi";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"];

export class AuthService {
    static async LoginNhanVien(MSNV: string, Password: string): Promise<LoginResult<NhanVien>> {
        const parsed = parsePayload(loginNhanVienSchema, { MSNV, Password });

        const nhanvien = await NhanVienModel.findOne({ MSNV: parsed.MSNV }).select("+Password");
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
        const parsed = parsePayload(loginDocGiaSchema, { MADOCGIA, Password });

        const docgia = await DocGiaModel.findOne({ MADOCGIA: parsed.MADOCGIA }).select("+PASSWORD");
        if (!docgia) {
            throw new AppError("Không tồn tại đọc giả", 401);
        }

        const isPasswordValid = verifyPassword(Password, docgia.PASSWORD);
        if (!isPasswordValid) {
            throw new AppError("Mật khẩu sai", 401);
        }

        const payload: JwtPayloadData = {
            MADG: docgia.MADOCGIA,
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
        const parsed = parsePayload(createDocGiaSchema, Payload);
        parsed.PASSWORD = hashPassword(parsed.PASSWORD);
        const MADOCGIA = await DocGiaService.generateMaDocGia();
        const docgia = await DocGiaModel.create({ ...parsed, MADOCGIA });
        const payload: JwtPayloadData = {
            MADG: MADOCGIA,
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
