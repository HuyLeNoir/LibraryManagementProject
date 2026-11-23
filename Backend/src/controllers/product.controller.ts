import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service.js";
import { ApiResponse } from "../types/api.types.js";

export class ProductController {
    // GET /api/products
    static async getProducts(req: Request, res: Response<ApiResponse>, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const { products, pagination } = await ProductService.getAll(page, limit);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách sản phẩm thành công",
                data: products,
                pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/products/:id
    static async getProductById(
        req: Request<{ id: string }>,
        res: Response<ApiResponse>,
        next: NextFunction,
    ) {
        try {
            const product = await ProductService.getById(req.params.id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm với ID này",
                });
            }

            res.status(200).json({
                success: true,
                message: "Lấy thông tin sản phẩm thành công",
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/products
    static async createProduct(req: Request, res: Response<ApiResponse>, next: NextFunction) {
        try {
            const newProduct = await ProductService.create(req.body);
            res.status(201).json({
                success: true,
                message: "Tạo sản phẩm mới thành công",
                data: newProduct,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    // PUT /api/products/:id
    static async updateProduct(
        req: Request<{ id: string }>,
        res: Response<ApiResponse>,
        next: NextFunction,
    ) {
        try {
            const updatedProduct = await ProductService.update(req.params.id, req.body);
            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm để cập nhật",
                });
            }

            res.status(200).json({
                success: true,
                message: "Cập nhật sản phẩm thành công",
                data: updatedProduct,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    // DELETE /api/products/:id
    static async deleteProduct(
        req: Request<{ id: string }>,
        res: Response<ApiResponse>,
        next: NextFunction,
    ) {
        try {
            const deletedProduct = await ProductService.delete(req.params.id);
            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm để xóa",
                });
            }

            res.status(200).json({
                success: true,
                message: "Xóa sản phẩm thành công",
            });
        } catch (error) {
            next(error);
        }
    }
}
