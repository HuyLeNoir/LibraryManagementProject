import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/api.types.js";
import { SachService } from "../services/sach.service.js";
import { CreateSachPayload, UpdateSachPayload } from "../types/dto.types.js";
import { Sach } from "../types/types.js";
export class NhaXuatBanController {
    // GET /api/sach
    static async GetAll(
        req: Request<{}, {}, {}, { page: string; limit: string; keyword: string }>,
        res: Response<ApiResponse<Sach[]>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const { DS_Sach, pagination } = await SachService.getAll(page, limit, keyword);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin nhà xuất bản thành công",
                data: DS_Sach,
                pagination: pagination,
            });
        } catch (error) {
            next(error);
        }
    }
    // GET /api/sach/:masach
    static async GetById(
        req: Request<{ manxb: string }>,
        res: Response<ApiResponse<Sach>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { manxb } = req.params;
            const result = await SachService.getById(manxb);
            res.status(200).json({
                success: true,
                message: `Lấy thông tin NXB với manxb=${manxb} thành công`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/sach
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as CreateSachPayload;
            const newNXB = await SachService.create(data);

            res.status(201).json({
                success: true,
                message: "Thêm sách thành công",
                data: newNXB,
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/sach/:masach
    static async update(
        req: Request<{ manxb: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { manxb } = req.params;
            const data = req.body as UpdateSachPayload;

            const updatedNXB = await SachService.update(manxb, data);

            res.status(200).json({
                success: true,
                message: "Cập nhật sách thành công",
                data: updatedNXB,
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/sach/:masach
    static async delete(
        req: Request<{ manxb: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { manxb } = req.params;

            const deletedNXB = await SachService.delete(manxb);

            res.status(200).json({
                success: true,
                message: "Xóa sách thành công",
                data: deletedNXB,
            });
        } catch (error) {
            next(error);
        }
    }
}
