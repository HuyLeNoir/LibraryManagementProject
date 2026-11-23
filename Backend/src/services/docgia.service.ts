import { DocGiaModel, IDocGia } from "../models/docgia.model.js";
import { CreateDocGiaPayload, UpdateDocGiaPayload } from "../types/dto.types.js";
import { AppError } from "../utils/appError.js";
import { DocGia } from "../types/types.js";
import { PaginatedData } from "../types/api.types.js";
import { escapeRegex } from "../utils/utils.js";
export interface DanhSachDocGia {
    DS_DocGia: DocGia[];
    pagination: PaginatedData;
}
export class DocGiaService {
    private static toDocGia(doc: IDocGia & { _id?: unknown; __v?: unknown }): DocGia {
        return {
            MADOCGIA: doc.MADOCGIA,
            HOLOT: doc.HOLOT,
            TEN: doc.TEN,
            NGAYSINH: doc.NGAYSINH,
            PHAI: doc.PHAI,
            DIACHI: doc.DIACHI,
            DIENTHOAI: doc.DIENTHOAI,
        };
    }
    private static toDocGiaList(docs: IDocGia[]): DocGia[] {
        return docs.map((doc) => this.toDocGia(doc));
    }
    static async generateMaDocGia(): Promise<string> {
        const latest = await DocGiaModel.findOne({ MADOCGIA: /^DG\d+$/ })
            .sort({ MADOCGIA: -1 })
            .select("MADOCGIA")
            .lean();

        let nextNumber = 1;
        if (latest?.MADOCGIA) {
            const currentNum = parseInt(latest.MADOCGIA.replace(/^DG/, ""), 10);
            if (!Number.isNaN(currentNum)) {
                nextNumber = currentNum + 1;
            }
        }

        return `DG${String(nextNumber).padStart(4, "0")}`; // VD: DG0001, DG0002...
    }
    // GET ALL + Pagination
    static async getAll(page = 1, limit = 10, keyword: string): Promise<DanhSachDocGia> {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(100, Math.max(1, limit));
        const conditions: Record<string, unknown>[] = [];
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length > 0) {
            const regex = new RegExp(escapeRegex(trimmedKeyword), "i");
            conditions.push({
                $or: [{ MADOCGIA: trimmedKeyword }, { TEN: regex }],
            });
        }

        const filter: Record<string, unknown> = conditions.length > 0 ? { $and: conditions } : {};
        const skip = (safePage - 1) * safeLimit;
        const [rawDocs, total] = await Promise.all([
            DocGiaModel.find(filter)
                .skip(skip)
                .limit(safeLimit)
                .sort({ createdAt: -1 })
                .lean<IDocGia[]>(),
            DocGiaModel.countDocuments(filter),
        ]);
        return {
            DS_DocGia: this.toDocGiaList(rawDocs),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // GET BY ID
    static async getById(MaDocGia: string): Promise<DocGia> {
        if (!MaDocGia?.trim()) {
            throw new AppError("Mã độc giả không hợp lệ", 400);
        }
        const docgia = await DocGiaModel.findOne({ MADOCGIA: MaDocGia }).lean<IDocGia>();
        if (!docgia) {
            throw new AppError("Độc giả không tồn tại", 404);
        }
        return this.toDocGia(docgia);
    }

    // CREATE
    static async create(data: Omit<CreateDocGiaPayload, "MADOCGIA">): Promise<DocGia> {
        if (!data || Object.keys(data).length === 0) {
            throw new AppError("Không có dữ liệu để tạo", 404);
        }
        const MADOCGIA = await this.generateMaDocGia();
        const createdDocGia = await DocGiaModel.create({ ...data, MADOCGIA });
        return this.toDocGia(createdDocGia);
    }

    // UPDATE
    static async update(MADOCGIA: string, data: UpdateDocGiaPayload): Promise<DocGia | null> {
        if (!MADOCGIA?.trim()) {
            throw new AppError("Mã độc giả không hợp lệ", 400);
        }
        if (!data || Object.keys(data).length === 0) {
            throw new AppError("Không có dữ liệu để cập nhật", 400);
        }
        const updatedDocGia = await DocGiaModel.findOneAndUpdate({ MADOCGIA }, data, {
            returnDocument: "after", // Trả về document sau khi đã update
            runValidators: true, // Kiểm tra validate schema khi update
        }).lean<IDocGia>();
        if (!updatedDocGia) {
            throw new AppError(`Không tìm thấy độc giả có mã ${MADOCGIA}`, 404);
        }
        return this.toDocGia(updatedDocGia);
    }

    // DELETE
    static async delete(MADOCGIA: string): Promise<DocGia> {
        if (!MADOCGIA?.trim()) {
            throw new AppError("Mã độc giả không hợp lệ", 400);
        }
        const deletedDocGia = await DocGiaModel.findOneAndDelete({ MADOCGIA }).lean<IDocGia>();
        if (!deletedDocGia) {
            throw new AppError("Độc giả không tồn tại", 404);
        }
        return this.toDocGia(deletedDocGia);
    }
}
