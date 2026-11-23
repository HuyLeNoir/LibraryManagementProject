import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/api.types.js";
import { NhaXuatBan } from "../types/types.js";
import { NhaXuatBanService } from "../services/nhaxuatban.service.js";
import { CreateNhaXuatBanPayload, UpdateNhaXuatBanPayload } from "../types/dto.types.js";
export class NhaXuatBanController {
    // GET /api/nxb
    static async GetAll(
        req: Request<{}, {}, {}, { page: string; limit: string; keyword: string }>,
        res: Response<ApiResponse<NhaXuatBan[]>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const { DS_NXB, pagination } = await NhaXuatBanService.getAll(page, limit, keyword);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin nhà xuất bản thành công",
                data: DS_NXB,
                pagination: pagination,
            });
        } catch (error) {
            next(error);
        }
    }
    // GET /api/nxb/:manxb
    static async GetById(
        req: Request<{ manxb: string }>,
        res: Response<ApiResponse<NhaXuatBan>>,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { manxb } = req.params;
            const result = await NhaXuatBanService.getById(manxb);
            res.status(200).json({
                success: true,
                message: `Lấy thông tin NXB với manxb=${manxb} thành công`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/nxb
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body as CreateNhaXuatBanPayload;
            const newNXB = await NhaXuatBanService.create(data);

            res.status(201).json({
                success: true,
                message: "Thêm NXB thành công",
                data: newNXB,
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/nxb/:manxb
    static async update(
        req: Request<{ manxb: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { manxb } = req.params;
            const data = req.body as UpdateNhaXuatBanPayload;

            const updatedNXB = await NhaXuatBanService.update(manxb, data);

            res.status(200).json({
                success: true,
                message: "Cập nhật NXB thành công",
                data: updatedNXB,
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/nxb/:manxb
    static async delete(
        req: Request<{ manxb: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { manxb } = req.params;

            const deletedNXB = await NhaXuatBanService.delete(manxb);

            res.status(200).json({
                success: true,
                message: "Xóa NXB thành công",
                data: deletedNXB,
            });
        } catch (error) {
            next(error);
        }
    }
}
