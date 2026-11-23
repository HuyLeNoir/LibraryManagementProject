import { DocGiaService } from "../services/docgia.service.js";
import { DocGia } from "../types/types.js";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/api.types.js";
import { DanhSachDocGia } from "../services/docgia.service.js";
import { CreateDocGiaPayload, UpdateDocGiaPayload } from "../types/dto.types.js";
interface DocGiaQuery {
    page?: string;
    limit?: string;
    keyword?: string;
}
export class DocGiaController {
    // GET /api/docgia
    static async GetDocGiaAll(
        req: Request<{}, {}, {}, DocGiaQuery>,
        res: Response<ApiResponse<DocGia[]>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const { DS_DocGia, pagination } = await DocGiaService.getAll(page, limit, keyword);

            res.status(200).json({
                success: true,
                message: "Đăng nhập thành công",
                data: DS_DocGia,
                pagination: pagination,
            });
        } catch (error) {
            next(error);
        }
    }
    // GET /api/docgia/:maDocGia
    static async GetDocGiaByMaDocGia(
        req: Request<{ maDocGia: string }>,
        res: Response<ApiResponse<DocGia>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { maDocGia } = req.params;
            const result = await DocGiaService.getById(maDocGia);
            res.status(200).json({
                success: true,
                message: `Lấy thông tin người dùng với maDocGia=${maDocGia} thành công`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/docgia
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as Omit<CreateDocGiaPayload, "MADOCGIA">;
            const newDocGia = await DocGiaService.create(data);

            res.status(201).json({
                success: true,
                message: "Thêm độc giả thành công",
                data: newDocGia,
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/docgia/:maDocGia
    static async update(
        req: Request<{ maDocGia: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { maDocGia } = req.params;
            const data = req.body as UpdateDocGiaPayload;

            const updatedDocGia = await DocGiaService.update(maDocGia, data);

            res.status(200).json({
                success: true,
                message: "Cập nhật độc giả thành công",
                data: updatedDocGia,
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/docgia/:maDocGia
    static async delete(
        req: Request<{ maDocGia: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { maDocGia } = req.params;

            const deletedDocGia = await DocGiaService.delete(maDocGia);

            res.status(200).json({
                success: true,
                message: "Xóa độc giả thành công",
                data: deletedDocGia,
            });
        } catch (error) {
            next(error);
        }
    }
}
