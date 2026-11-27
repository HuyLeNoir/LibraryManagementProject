import { AppError } from "../utils/appError.js";
import { PaginatedData } from "../types/api.types.js";
import { SachModel, ISachDocument } from "../models/sach.model.js";
import { CreateSachPayload, UpdateSachPayload } from "../types/dto.types.js";
import { Sach } from "../types/types.js";
import fs from "fs";
import path from "path";
import { escapeRegex } from "../utils/utils.js";
import { createSachSchema, parsePayload, updateSachSchema } from "../validators/schemas.js";
export interface SachWithNXB extends Sach {
    TENNXB: string;
}
interface SachAggregatedRow extends ISachDocument {
    nxbInfo?: {
        MANXB: string;
        TENNXB: string;
    };
}
interface DanhSachSach {
    DS_Sach: SachWithNXB[];
    pagination: PaginatedData;
}
function removeLocalFile(filePath?: string) {
    if (!filePath || !filePath.startsWith("/uploads/")) return;
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}
export class SachService {
    private static toSachWithNXB(doc: SachAggregatedRow): SachWithNXB {
        return {
            MASACH: doc.MASACH,
            TENSACH: doc.TENSACH,
            DONGIA: doc.DONGIA,
            SOQUYEN: doc.SOQUYEN,
            NAMXUATBAN: doc.NAMXUATBAN,
            BIASACH: doc.BIASACH,
            MANXB: doc.MANXB,
            NGUONGOCTACGIA: doc.NGUONGOCTACGIA,
            TENNXB: doc.nxbInfo?.TENNXB ?? "",
        };
    }
    private static toSach(doc: ISachDocument): Sach {
        return {
            MASACH: doc.MASACH,
            TENSACH: doc.TENSACH,
            DONGIA: doc.DONGIA,
            SOQUYEN: doc.SOQUYEN,
            BIASACH: doc.BIASACH,
            NAMXUATBAN: doc.NAMXUATBAN,
            MANXB: doc.MANXB,
            NGUONGOCTACGIA: doc.NGUONGOCTACGIA,
        };
    }
    private static buildNxbLookupStages() {
        return [
            {
                $lookup: {
                    from: "nhaxuatbans",
                    localField: "MANXB",
                    foreignField: "MANXB",
                    as: "nxbList",
                },
            },
            {
                $unwind: {
                    path: "$nxbList",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    nxbInfo: "$nxbList",
                },
            },
        ];
    }
    private static toSachWithNXBList(docs: SachAggregatedRow[]): SachWithNXB[] {
        return docs.map((doc) => this.toSachWithNXB(doc));
    }
    static async getAll(page = 1, limit = 10, keyword: string): Promise<DanhSachSach> {
        const skip = (page - 1) * limit;
        const conditions: Record<string, unknown>[] = [];
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length > 0) {
            const regex = new RegExp(escapeRegex(trimmedKeyword), "i");
            conditions.push({
                $or: [{ MASACH: trimmedKeyword }, { TENSACH: regex }, { NGUONGOCTACGIA: regex }],
            });
        }

        const filter: Record<string, unknown> = conditions.length > 0 ? { $and: conditions } : {};
        const [rawDocs, total] = await Promise.all([
            SachModel.aggregate<SachAggregatedRow>([
                { $match: filter },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                ...this.buildNxbLookupStages(),
            ]),
            SachModel.countDocuments(filter),
        ]);
        return {
            DS_Sach: this.toSachWithNXBList(rawDocs),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // GET BY ID
    static async getById(MASACH: string): Promise<Sach> {
        if (!MASACH.trim()) {
            throw new AppError("Mã sách không hợp lệ", 400);
        }

        const rows = await SachModel.aggregate<SachAggregatedRow>([
            { $match: { MASACH } },
            ...this.buildNxbLookupStages(),
            { $limit: 1 },
        ]);

        if (rows.length === 0) {
            throw new AppError("Sách không tồn tại", 404);
        }

        return this.toSachWithNXB(rows[0]);
    }

    // CREATE
    static async create(data: CreateSachPayload): Promise<Sach> {
        const parsed = parsePayload(createSachSchema, data);
        const existing = await SachModel.findOne({ MASACH: data.MASACH });
        if (existing) {
            removeLocalFile(data.BIASACH);
            throw new AppError("Mã sách đã tồn tại", 400);
        }
        const newSach = await SachModel.create(parsed);

        return this.toSach(newSach);
    }

    // UPDATE
    static async update(MASACH: string, data: UpdateSachPayload): Promise<Sach | null> {
        const parsed = parsePayload(updateSachSchema, data);
        const book = await SachModel.findOne({ MASACH: MASACH });
        if (!book) {
            removeLocalFile(parsed.BIASACH);
            throw new AppError("Không tìm thấy sách", 404);
        }

        // Nếu có upload ảnh mới thì xóa ảnh cũ đi
        if (parsed.BIASACH && book.BIASACH && parsed.BIASACH !== book.BIASACH) {
            removeLocalFile(book.BIASACH);
        }

        Object.assign(book, parsed);
        return this.toSach(await book.save());
    }

    // DELETE
    static async delete(MASACH: string): Promise<Sach | null> {
        if (!MASACH) {
            throw new AppError("Không nhận được mã sách để cập nhật", 404);
        }
        const deletedSach = await SachModel.findOneAndDelete({ MASACH });
        if (!deletedSach) {
            throw new AppError("Không xoá được sách", 500);
        }
        removeLocalFile(deletedSach.BIASACH);
        return this.toSach(deletedSach);
    }
}
