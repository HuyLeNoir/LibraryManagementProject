import { AppError } from "../utils/appError.js";
import { PaginatedData } from "../types/api.types.js";
import { NhanVienModel, INhanVienDocument } from "../models/nhanvien.model.js";
import { CreateNhanVienPayload, UpdateNhanVienPayload } from "../types/dto.types.js";
import { NhanVien } from "../types/types.js";
import { escapeRegex, hashPassword } from "../utils/utils.js";

interface DanhSachNhanVien {
    DS_NhanVien: NhanVien[];
    pagination: PaginatedData;
}
export class NhanVienService {
    private static toNhanVien(doc: INhanVienDocument): NhanVien {
        return {
            MSNV: doc.MSNV,
            HoTenNV: doc.HoTenNV,
            ChucVu: doc.ChucVu,
            DiaChi: doc.DiaChi,
            SoDienThoai: doc.SoDienThoai,
        };
    }
    private static toNhanVienList(docs: INhanVienDocument[]): NhanVien[] {
        return docs.map((doc) => this.toNhanVien(doc));
    }
    static async getAll(page = 1, limit = 10, keyword: string): Promise<DanhSachNhanVien> {
        const skip = (page - 1) * limit;
        const conditions: Record<string, unknown>[] = [];
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length > 0) {
            const regex = new RegExp(escapeRegex(trimmedKeyword), "i");
            conditions.push({
                $or: [{ MSNV: trimmedKeyword }, { HoTenNV: regex }],
            });
        }

        const filter: Record<string, unknown> = conditions.length > 0 ? { $and: conditions } : {};
        const [rawDocs, total] = await Promise.all([
            NhanVienModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            NhanVienModel.countDocuments(filter),
        ]);

        return {
            DS_NhanVien: this.toNhanVienList(rawDocs),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // GET BY ID
    static async getById(MSNV: string): Promise<NhanVien> {
        if (!MSNV.trim()) {
            throw new AppError("Không nhận được Mã số nhân viên", 400);
        }
        const nhanvien = await NhanVienModel.findOne({ MSNV });
        if (!nhanvien) {
            throw new AppError("Nhân viên không tồn tại", 404);
        }
        return this.toNhanVien(nhanvien);
    }

    // CREATE
    static async create(data: CreateNhanVienPayload): Promise<INhanVienDocument> {
        if (!data || Object.keys(data).length === 0) {
            throw new AppError("Không có dữ liệu để cập nhật", 404);
        }
        if (data.Password) {
            data.Password = hashPassword(data.Password);
        }
        return await NhanVienModel.create(data);
    }

    // UPDATE
    static async update(
        MSNV: string,
        data: UpdateNhanVienPayload,
    ): Promise<INhanVienDocument | null> {
        const updatedNhanVien = await NhanVienModel.findOneAndUpdate(
            { MSNV },
            { $set: data },
            {
                returnDocument: "after", // Trả về document sau khi đã update
                runValidators: true, // Kiểm tra validate schema khi update
            },
        ).lean();
        if (!updatedNhanVien) {
            throw new AppError("Không cập nhật được nhân viên", 404);
        }
        return updatedNhanVien;
    }

    // DELETE
    static async delete(MSNV: string): Promise<INhanVienDocument> {
        const deletedNhanVien = await NhanVienModel.findOneAndDelete({ MSNV });
        if (!deletedNhanVien) {
            throw new AppError("Nhân viên không tồn tại", 404);
        }
        return deletedNhanVien;
    }
}
