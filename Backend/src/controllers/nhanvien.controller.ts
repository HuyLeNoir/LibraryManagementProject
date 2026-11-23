import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/api.types.js";
import { NhanVien } from "../types/types.js";
import { NhanVienService } from "../services/nhanvien.service.js";
import { CreateNhanVienPayload, UpdateNhanVienPayload } from "../types/dto.types.js";
import { AppError } from "../utils/appError.js";
export class NhanVienControler {
    //best practice
    static parseToCreateNhanVienPayload(body: Record<string, unknown>): CreateNhanVienPayload {
        if (typeof body !== "object" || body === null || Array.isArray(body)) {
            throw new AppError("Dữ liệu gửi lên không hợp lệ", 400);
        }
        const PASSWORD_REGEX = /^(?=.*[A-Za-zÀ-ỹ])(?=.*\d).{8,}$/u;
        const MSNV = typeof body.MSNV === "string" ? body.MSNV.trim() : "";
        const HoTenNV = typeof body.HoTenNV === "string" ? body.HoTenNV.trim() : "";
        const ChucVu = typeof body.ChucVu === "string" ? body.ChucVu.trim() : "";
        const Password = typeof body.Password === "string" ? body.Password.trim() : "";
        const DiaChi = typeof body.DiaChi === "string" ? body.DiaChi.trim() : "";
        const SoDienThoai = typeof body.SoDienThoai === "string" ? body.SoDienThoai.trim() : "";
        if (!MSNV) throw new AppError("Trường MSNV không được rỗng", 400);
        if (!HoTenNV) throw new AppError("Trường HoTenNV không được rỗng", 400);
        if (!ChucVu) throw new AppError("Trường ChucVu không được rỗng", 400);
        if (!Password) throw new AppError("Trường Password không được rỗng", 400);
        if (!PASSWORD_REGEX.test(Password)) {
            throw new AppError("Mật khẩu phải có ít nhất 8 ký tự và chứa cả chữ lẫn chữ số", 400);
        }
        if (!DiaChi) throw new AppError("Trường DiaChi không được rỗng", 400);
        if (!SoDienThoai) throw new AppError("Trường SoDienThoai không được rỗng", 400);
        return {
            MSNV: MSNV,
            HoTenNV: HoTenNV,
            Password: Password,
            ChucVu: ChucVu,
            DiaChi: DiaChi,
            SoDienThoai: SoDienThoai,
        };
    }
    static parseToUpdateNhanVienPayload(body: Record<string, unknown>): UpdateNhanVienPayload {
        if (typeof body !== "object" || body === null || Array.isArray(body)) {
            throw new AppError("Dữ liệu gửi lên không hợp lệ", 400);
        }
        const payload: UpdateNhanVienPayload = {};
        if (typeof body.HoTenNV === "string" && body.HoTenNV.trim() !== "") {
            payload.HoTenNV = body.HoTenNV.trim();
        }
        if (typeof body.ChucVu === "string" && body.ChucVu.trim() !== "") {
            payload.ChucVu = body.ChucVu.trim();
        }

        if (typeof body.DiaChi === "string" && body.DiaChi.trim() !== "") {
            payload.DiaChi = body.DiaChi.trim();
        }

        if (typeof body.SoDienThoai === "string" && body.SoDienThoai.trim() !== "") {
            payload.SoDienThoai = body.SoDienThoai.trim();
        }

        if (typeof body.Password === "string" && body.Password.trim() !== "") {
            payload.Password = body.Password.trim();
        }

        if (Object.keys(payload).length === 0) {
            throw new AppError("Không có dữ liệu hợp lệ nào để cập nhật", 400);
        }

        return payload;
    }
    // GET /api/nhanvien
    static async GetAll(
        req: Request<{}, {}, {}, { page: string; limit: string; keyword: string }>,
        res: Response<ApiResponse<NhanVien[]>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const { DS_NhanVien, pagination } = await NhanVienService.getAll(page, limit, keyword);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách nhân viên thành công",
                data: DS_NhanVien,
                pagination: pagination,
            });
        } catch (error) {
            next(error);
        }
    }
    // GET /api/nhanvien/:MSNV
    static async GetById(
        req: Request<{ msnv: string }>,
        res: Response<ApiResponse<NhanVien>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { msnv } = req.params;
            const result = await NhanVienService.getById(msnv);
            res.status(200).json({
                success: true,
                message: `Lấy thông tin nhân viên với msnv=${msnv} thành công`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/nhanvien
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = this.parseToCreateNhanVienPayload(req.body);
            const newNXB = await NhanVienService.create(data);

            res.status(201).json({
                success: true,
                message: "Thêm nhân viên thành công",
                data: newNXB,
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/nhanvien/:msnv
    static async update(
        req: Request<{ msnv: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { msnv } = req.params;
            const data = this.parseToUpdateNhanVienPayload(req.body);
            const updatedNXB = await NhanVienService.update(msnv, data);
            res.status(200).json({
                success: true,
                message: "Cập nhật nhân viên thành công",
                data: updatedNXB,
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/nhanvien/:msnv
    static async delete(
        req: Request<{ msnv: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { msnv } = req.params;
            const deletedNXB = await NhanVienService.delete(msnv);
            res.status(200).json({
                success: true,
                message: "Xóa nhân viên thành công",
                data: deletedNXB,
            });
        } catch (error) {
            next(error);
        }
    }
}
