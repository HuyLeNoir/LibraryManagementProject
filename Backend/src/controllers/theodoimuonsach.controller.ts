import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/api.types.js";
import { AppError } from "../utils/appError.js";
import {
    TheoDoiMuonSachService,
    TheoDoiMuonSachChiTiet,
} from "../services/theodoimuonsach.service.js";
import { CreateMuonSachPayload, UpdateMuonSachPayload } from "../types/dto.types.js";
import { TheoDoiMuonSach } from "../types/types.js";

export class TheoDoiMuonSachController {
    // GET /api/nhanvien/theo-doi-muon-sach
    static async GetAll(
        req: Request<{}, {}, {}, { page?: string; limit?: string; keyword?: string }>,
        res: Response<ApiResponse<TheoDoiMuonSachChiTiet[]>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;

            const result = await TheoDoiMuonSachService.getAll(page, limit, keyword);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách theo dõi mượn sách thành công",
                data: result.DS_Muon,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/nhanvien/theo-doi-muon-sach/expired
    static async GetExpired(
        req: Request<{}, {}, {}, { page?: string; limit?: string; keyword?: string }>,
        res: Response<ApiResponse<TheoDoiMuonSachChiTiet[]>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;

            const result = await TheoDoiMuonSachService.getExpired(page, limit, keyword);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách mượn sách trễ hạn thành công",
                data: result?.DS_Muon ?? [],
                pagination: result?.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/docgia/:maDocGia/danhsachmuon
    static async GetByMaDocGia(
        req: Request<
            { maDocGia: string },
            {},
            {},
            { tinhTrang?: string; page?: string; limit?: string }
        >,
        res: Response<ApiResponse<TheoDoiMuonSachChiTiet[]>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { maDocGia } = req.params;
            const tinhTrang =
                typeof req.query.tinhTrang === "string" && req.query.tinhTrang.trim().length > 0
                    ? req.query.tinhTrang.trim()
                    : null;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;

            const result = await TheoDoiMuonSachService.getByMaDocGia(
                maDocGia,
                tinhTrang,
                page,
                limit,
            );

            res.status(200).json({
                success: true,
                message: `Lấy danh sách mượn sách của độc giả ${maDocGia} thành công`,
                data: result?.DS_Muon ?? [],
                pagination: result?.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/muon-sach/:maDocGia/:maSach
    static async GetById(
        req: Request<{ maDocGia: string; maSach: string }>,
        res: Response<ApiResponse<TheoDoiMuonSach | null>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { maDocGia, maSach } = req.params;
            const result = await TheoDoiMuonSachService.getById(maDocGia, maSach);

            res.status(200).json({
                success: true,
                message: `Lấy thông tin phiếu mượn (${maDocGia}, ${maSach}) thành công`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/muon-sach
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = this.parseToCreateMuonSachPayload(req.body);
            const created = await TheoDoiMuonSachService.create(data);

            res.status(201).json({
                success: true,
                message: "Tạo phiếu mượn sách thành công",
                data: created,
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/muon-sach/:maDocGia/:maSach
    static async update(
        req: Request<{ maDocGia: string; maSach: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { maDocGia, maSach } = req.params;
            const data = this.parseToUpdateMuonSachPayload(req.body);
            const updated = await TheoDoiMuonSachService.update(maDocGia, maSach, data);

            res.status(200).json({
                success: true,
                message: "Cập nhật phiếu mượn sách thành công",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/muon-sach/:maDocGia/:maSach
    static async delete(
        req: Request<{ maDocGia: string; maSach: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { maDocGia, maSach } = req.params;
            // Lưu ý thứ tự tham số ở service hiện tại là (MASACH, MADOCGIA)
            const deleted = await TheoDoiMuonSachService.delete(maSach, maDocGia);

            res.status(200).json({
                success: true,
                message: "Xóa phiếu mượn sách thành công",
                data: deleted,
            });
        } catch (error) {
            next(error);
        }
    }

    private static parseToCreateMuonSachPayload(body: unknown): CreateMuonSachPayload {
        if (!body || typeof body !== "object") {
            throw new AppError("Dữ liệu tạo phiếu mượn không hợp lệ", 400);
        }
        return body as CreateMuonSachPayload;
    }

    private static parseToUpdateMuonSachPayload(body: unknown): UpdateMuonSachPayload {
        if (!body || typeof body !== "object") {
            throw new AppError("Dữ liệu cập nhật phiếu mượn không hợp lệ", 400);
        }
        return body as UpdateMuonSachPayload;
    }
}
