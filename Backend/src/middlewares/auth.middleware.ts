import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../types/types.js";
import { AppError } from "../utils/appError.js";
import type { JwtPayloadData } from "../types/types.js";

const JWT_SECRET = process.env.JWT_SECRET || "skibidi";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Bạn chưa đăng nhập hoặc thiếu token", 401);
        }
        const token = authHeader.split(" ")[1]?.trim();
        if (!token) {
            throw new AppError("Token không hợp lệ", 401);
        }
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadData;

        if (!decoded?.role) {
            throw new AppError("Payload trong token không hợp lệ", 401);
        }
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            next(new AppError("Token không hợp lệ hoặc đã hết hạn", 401));
            return;
        }
        next(error);
    }
};

export const authorize = (roles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const userRole = req.user?.role;
            if (!req.user || !userRole) {
                throw new AppError("Bạn chưa đăng nhập", 401);
            }
            if (!roles.includes(userRole)) {
                throw new AppError("Bạn không có quyền thực hiện thao tác này", 403);
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
