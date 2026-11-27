// 1. AuthController: chỉ lo HTTP
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/api.types.js";
import { LoginResult } from "../types/types.js";
import { AuthService } from "../services/auth.service.js";
import { CreateDocGiaPayload } from "../types/dto.types.js";
export class AuthController {
    //GET /api/login/staff
    static async loginNhanVien(
        req: Request,
        res: Response<ApiResponse<LoginResult>>,
        next: NextFunction,
    ) {
        try {
            const { MSNV, Password } = req.body;
            const result = await AuthService.LoginNhanVien(MSNV, Password);

            res.status(200).json({
                success: true,
                message: "Đăng nhập thành công",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
    //GET /api/login
    static async loginDocGia(
        req: Request,
        res: Response<ApiResponse<LoginResult>>,
        next: NextFunction,
    ) {
        try {
            const { MADOCGIA, Password } = req.body;
            const result = await AuthService.LoginDocGia(MADOCGIA, Password);

            res.status(200).json({
                success: true,
                message: "Đăng nhập thành công",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
    //GET /api/register
    static async registerDocGia(
        req: Request<{}, {}, CreateDocGiaPayload>,
        res: Response<ApiResponse<LoginResult>>,
        next: NextFunction,
    ) {
        const payload = req.body;
        const result = await AuthService.RegisterDocGia(payload);
        res.status(200).json({
            success: true,
            message: "Đăng ký thành công",
            data: result,
        });
        try {
        } catch (error) {
            next(error);
        }
    }
}
