import { AppError } from "../utils/appError.js";
import { PaginatedData } from "../types/api.types.js";
import { TheoDoiMuonSachModel, ITheoDoiMuonSachDocument } from "../models/theodoimuonsach.model.js";
import { CreateMuonSachPayload, UpdateMuonSachPayload } from "../types/dto.types.js";
interface DanhSachMuon {
    DS_Muon: ITheoDoiMuonSachDocument[];
    pagination: PaginatedData;
}
export class TheoDoiMuonSachService {
    static async getAll(page = 1, limit = 10): Promise<DanhSachMuon> {
        const skip = (page - 1) * limit;
        const [DS_Muon, total] = await Promise.all([
            TheoDoiMuonSachModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
            TheoDoiMuonSachModel.countDocuments(),
        ]);

        return {
            DS_Muon,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // GET BY ID
    static async getById(
        MADOCGIA: string,
        MASACH: string,
    ): Promise<ITheoDoiMuonSachDocument | null> {
        return await TheoDoiMuonSachModel.findOne({ MADOCGIA, MASACH });
    }
    static async getByMaDocGia(MADOCGIA: string): Promise<DanhSachMuon | null> {
        const muon = await TheoDoiMuonSachModel.find({ MADOCGIA });
        return {
            DS_Muon: muon,
            pagination: {
                page: 1,
                limit: muon.length,
                total: muon.length,
                totalPages: 1,
            },
        };
    }

    static async getByMaSach(MASACH: string): Promise<DanhSachMuon | null> {
        const muon = await TheoDoiMuonSachModel.find({ MASACH });
        return {
            DS_Muon: muon,
            pagination: {
                page: 1,
                limit: muon.length,
                total: muon.length,
                totalPages: 1,
            },
        };
    }
    // CREATE
    static async create(data: CreateMuonSachPayload): Promise<ITheoDoiMuonSachDocument> {
        if (!data || Object.keys(data).length === 0) {
            throw new AppError("Không có dữ liệu để cập nhật", 404);
        }
        return await TheoDoiMuonSachModel.create(data);
    }

    static async getExpired(): Promise<DanhSachMuon | null> {
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const muon = await TheoDoiMuonSachModel.find({
            NGAYTRA: { $ne: null },
            $expr: {
                $gt: ["$NGAYTRA", { $add: ["$NGAYMUON", SEVEN_DAYS_MS] }],
            },
        });
        if (!muon) {
            return null;
        }
        return {
            DS_Muon: muon,
            pagination: {
                page: 1,
                limit: muon.length,
                total: muon.length,
                totalPages: 1,
            },
        };
    }

    // UPDATE
    static async update(
        MADOCGIA: string,
        MASACH: string,
        data: UpdateMuonSachPayload,
    ): Promise<ITheoDoiMuonSachDocument | null> {
        return await TheoDoiMuonSachModel.findOneAndUpdate({ MADOCGIA, MASACH }, data, {
            new: true, // Trả về document sau khi đã update
            runValidators: true, // Kiểm tra validate schema khi update
        });
    }

    // DELETE
    static async delete(
        MASACH: string,
        MADOCGIA: string,
    ): Promise<ITheoDoiMuonSachDocument | null> {
        return await TheoDoiMuonSachModel.findOneAndDelete({ MADOCGIA, MASACH });
    }
}
