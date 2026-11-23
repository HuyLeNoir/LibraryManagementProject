import { ProductModel, IProduct } from "../models/product.model.js";

export class ProductService {
    // GET ALL + Pagination
    static async getAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            ProductModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
            ProductModel.countDocuments(),
        ]);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // GET BY ID
    static async getById(id: string): Promise<IProduct | null> {
        return await ProductModel.findById(id);
    }

    // CREATE
    static async create(data: Partial<IProduct>): Promise<IProduct> {
        return await ProductModel.create(data);
    }

    // UPDATE
    static async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        return await ProductModel.findByIdAndUpdate(id, data, {
            new: true, // Trả về document sau khi đã update
            runValidators: true, // Kiểm tra validate schema khi update
        });
    }

    // DELETE
    static async delete(id: string): Promise<IProduct | null> {
        return await ProductModel.findByIdAndDelete(id);
    }
}
