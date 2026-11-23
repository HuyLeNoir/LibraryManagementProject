import { AppError } from "../utils/appError.js";
import { PaginatedData } from "../types/api.types.js";
import { NhaXuatBanModel, INhaXuatBanDocument } from "../models/nhaxuatban.model.js";
import { CreateNhaXuatBanPayload, UpdateNhaXuatBanPayload } from "../types/dto.types.js";
import { NhaXuatBan } from "../types/types.js";
import { escapeRegex } from "../utils/utils.js";
interface DanhSachNhaXuatBan {
    DS_NXB: NhaXuatBan[];
    pagination: PaginatedData;
}
export class NhaXuatBanService {
    private static toNhaXuatBan(
        doc: INhaXuatBanDocument & { _id?: unknown; __v?: unknown },
    ): NhaXuatBan {
        return {
            MANXB: doc.MANXB,
            TENNXB: doc.TENNXB,
            DIACHI: doc.DIACHI,
        };
    }
    private static toNhaXuatBanList(docs: INhaXuatBanDocument[]): NhaXuatBan[] {
        return docs.map((doc) => this.toNhaXuatBan(doc));
    }
    // GET ALL
    static async getAll(page = 1, limit = 10, keyword: string): Promise<DanhSachNhaXuatBan> {
        const skip = (page - 1) * limit;
        const conditions: Record<string, unknown>[] = [];
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length > 0) {
            const regex = new RegExp(escapeRegex(trimmedKeyword), "i");
            conditions.push({
                $or: [{ MANXB: trimmedKeyword }, { TENNXB: regex }],
            });
        }

        const filter: Record<string, unknown> = conditions.length > 0 ? { $and: conditions } : {};
        const [rawDocs, total] = await Promise.all([
            NhaXuatBanModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            NhaXuatBanModel.countDocuments(filter),
        ]);

        return {
            DS_NXB: this.toNhaXuatBanList(rawDocs),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // GET BY ID
    static async getById(MANXB: string): Promise<NhaXuatBan> {
        if (!MANXB) {
            throw new AppError("Không nhận được MANXB", 404);
        }
        const NXB = await NhaXuatBanModel.findOne({ MANXB });
        if (!NXB) {
            throw new AppError("NXB không tồn tại", 404);
        }
        return this.toNhaXuatBan(NXB);
    }

    // CREATE
    static async create(data: CreateNhaXuatBanPayload): Promise<NhaXuatBan> {
        if (!data || Object.keys(data).length === 0) {
            throw new AppError("Không có dữ liệu để cập nhật", 404);
        }
        return this.toNhaXuatBan(await NhaXuatBanModel.create(data));
    }

    // UPDATE
    static async update(MANXB: string, data: UpdateNhaXuatBanPayload): Promise<NhaXuatBan | null> {
        const updatedNXB = await NhaXuatBanModel.findOneAndUpdate({ MANXB }, data, {
            returnDocument: "after", // Trả về document sau khi đã update
            runValidators: true, // Kiểm tra validate schema khi update
        });
        if (!updatedNXB) {
            throw new AppError("Không tìm thấy NXB để cập nhật", 404);
        }
        return this.toNhaXuatBan(updatedNXB);
    }

    // DELETE
    static async delete(MANXB: string): Promise<NhaXuatBan> {
        const deletedNxb = await NhaXuatBanModel.findOneAndDelete({ MANXB });
        if (!deletedNxb) {
            throw new AppError("Nhà xuất bản không tồn tại", 404);
        }
        return this.toNhaXuatBan(deletedNxb);
    }
}
