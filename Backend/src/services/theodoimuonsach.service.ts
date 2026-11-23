import { AppError } from "../utils/appError.js";
import { PaginatedData } from "../types/api.types.js";
import { TheoDoiMuonSachModel, ITheoDoiMuonSachDocument } from "../models/theodoimuonsach.model.js";
import { CreateMuonSachPayload, UpdateMuonSachPayload } from "../types/dto.types.js";
import { TheoDoiMuonSach } from "../types/types.js";
import { PipelineStage } from "mongoose";
import { escapeRegex } from "../utils/utils.js";
interface DanhSachMuon {
    DS_Muon: TheoDoiMuonSachChiTiet[];
    pagination: PaginatedData;
}
export interface TheoDoiMuonSachChiTiet extends TheoDoiMuonSach {
    TENDOCGIA?: string;
    TENSACH?: string;
}
export class TheoDoiMuonSachService {
    static async getAll(page = 1, limit = 10, keyword: string): Promise<DanhSachMuon> {
        const skip = (page - 1) * limit;
        const initialMatch: Record<string, unknown> = {};
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length > 0) {
            initialMatch.$or = [{ MASACH: trimmedKeyword }, { MADOCGIA: trimmedKeyword }];
        }
        const postLookupMatch: Record<string, unknown> = {};
        if (trimmedKeyword.length > 0) {
            const regex = new RegExp(escapeRegex(trimmedKeyword), "i");
            postLookupMatch.$or = [
                { MASACH: trimmedKeyword },
                { MADOCGIA: trimmedKeyword },
                { TENSACH: regex },
                { TENDOCGIA: regex },
            ];
        }
        const pipeline: PipelineStage[] = [
            ...(Object.keys(initialMatch).length > 0 ? [{ $match: initialMatch }] : []),

            {
                $lookup: {
                    from: "Sach",
                    localField: "MASACH",
                    foreignField: "MASACH",
                    as: "SACH_MATCHED",
                },
            },
            {
                $unwind: {
                    path: "$SACH_MATCHED",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "DocGia",
                    localField: "MADOCGIA",
                    foreignField: "MADOCGIA",
                    as: "DOCGIA_MATCHED",
                },
            },
            {
                $unwind: {
                    path: "$DOCGIA_MATCHED",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    MASACH: 1,
                    TENSACH: { $ifNull: ["$SACH_MATCHED.TENSACH", ""] },
                    MADOCGIA: 1,
                    TENDOCGIA: { $ifNull: ["$DOCGIA_MATCHED.TENDOCGIA", ""] },
                    NGAYMUON: 1,
                    NGAYTRA: { $ifNull: ["$NGAYTRA", null] },
                    TINHTRANG: 1,
                },
            },
            ...(Object.keys(postLookupMatch).length > 0 ? [{ $match: postLookupMatch }] : []),
            {
                $facet: {
                    items: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        { $project: { createdAt: 0 } },
                    ],
                    totalCount: [{ $count: "total" }],
                },
            },
        ];
        const [result] = await TheoDoiMuonSachModel.aggregate<{
            items: TheoDoiMuonSachChiTiet[];
            totalCount: { total: number }[];
        }>(pipeline);

        const rawDocs = result?.items ?? [];
        const total = result?.totalCount[0]?.total ?? 0;

        return {
            DS_Muon: rawDocs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // GET BY ID
    static async getById(MADOCGIA: string, MASACH: string): Promise<TheoDoiMuonSach | null> {
        return await TheoDoiMuonSachModel.findOne({ MADOCGIA, MASACH });
    }
    //Độc giả xem danh sách mượn của bản thân
    static async getByMaDocGia(
        MADOCGIA: string,
        TINHTRANG: string | null,
        page = 1,
        limit = 10,
    ): Promise<DanhSachMuon | null> {
        const matchCondition: Record<string, unknown> = { MADOCGIA };
        const skip = (page - 1) * limit;
        if (TINHTRANG !== null) {
            matchCondition.TINHTRANG = TINHTRANG;
        }
        const pipeline: PipelineStage[] = [
            {
                $match: matchCondition,
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "Sach",
                    localField: "MASACH",
                    foreignField: "MASACH",
                    as: "Sach_matched",
                },
            },
            {
                $unwind: {
                    path: "$Sach_matched",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    MADOCGIA: 1,
                    MASACH: 1,
                    NGAYMUON: 1,
                    TINHTRANG: 1,
                    NGAYTRA: { $ifNull: ["$NGAYTRA", null] },
                    TENSACH: { $ifNull: ["$Sach_matched.TENSACH", ""] },
                },
            },
        ];

        const muon = await TheoDoiMuonSachModel.aggregate<TheoDoiMuonSachChiTiet>(pipeline);
        const total = await TheoDoiMuonSachModel.countDocuments(matchCondition);
        if (total == 0) {
            throw new AppError("Khách hàng chưa mượn sách", 400);
        }
        return {
            DS_Muon: muon,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // static async getByMaSach(MASACH: string): Promise<DanhSachMuon | null> {
    //     const muon = await TheoDoiMuonSachModel.find({ MASACH });
    //     return {
    //         DS_Muon: muon,
    //         pagination: {
    //             page: 1,
    //             limit: muon.length,
    //             total: muon.length,
    //             totalPages: 1,
    //         },
    //     };
    // }
    // CREATE
    static async create(data: CreateMuonSachPayload): Promise<ITheoDoiMuonSachDocument> {
        if (!data || Object.keys(data).length === 0) {
            throw new AppError("Không có dữ liệu để cập nhật", 404);
        }
        return await TheoDoiMuonSachModel.create(data);
    }

    static async getExpired(page = 1, limit = 10, keyword: string): Promise<DanhSachMuon | null> {
        const skip = (page - 1) * limit;
        const conditions: Record<string, unknown>[] = [];
        const trimmedKeyword = keyword.trim();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const postLookupMatch: Record<string, unknown> = {};
        if (trimmedKeyword.length > 0) {
            const regex = new RegExp(escapeRegex(trimmedKeyword), "i");
            postLookupMatch.$or = [
                { MASACH: trimmedKeyword },
                { MADOCGIA: trimmedKeyword },
                { TENSACH: regex },
                { TENDOCGIA: regex },
            ];
        }
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    NGAYTRA: { $ne: null },
                    NGAYMUON: { $ne: null },
                    $expr: {
                        $gt: ["$NGAYTRA", { $add: ["$NGAYMUON", SEVEN_DAYS_MS] }],
                    },
                },
            },

            {
                $lookup: {
                    from: "Sach",
                    localField: "MASACH",
                    foreignField: "MASACH",
                    as: "SACH_MATCHED",
                },
            },
            {
                $unwind: {
                    path: "$SACH_MATCHED",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "DocGia",
                    localField: "MADOCGIA",
                    foreignField: "MADOCGIA",
                    as: "DOCGIA_MATCHED",
                },
            },
            {
                $unwind: {
                    path: "$DOCGIA_MATCHED",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    MASACH: 1,
                    TENSACH: { $ifNull: ["$SACH_MATCHED.TENSACH", ""] },
                    MADOCGIA: 1,
                    TENDOCGIA: { $ifNull: ["$DOCGIA_MATCHED.TENDOCGIA", ""] },
                    NGAYMUON: 1,
                    NGAYTRA: { $ifNull: ["$NGAYTRA", null] },
                    TINHTRANG: 1,
                },
            },
            ...(Object.keys(postLookupMatch).length > 0 ? [{ $match: postLookupMatch }] : []),
            {
                $facet: {
                    items: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        { $project: { createdAt: 0 } },
                    ],
                    totalCount: [{ $count: "total" }],
                },
            },
        ];
        const [result] = await TheoDoiMuonSachModel.aggregate<{
            items: TheoDoiMuonSachChiTiet[];
            totalCount: { total: number }[];
        }>(pipeline);

        const muon = result?.items ?? [];
        const total = result?.totalCount[0]?.total ?? 0;
        return {
            DS_Muon: muon,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
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
