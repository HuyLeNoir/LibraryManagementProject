import { AppError } from "../utils/appError.js";
import { PaginatedData } from "../types/api.types.js";
import { TheoDoiMuonSachModel, ITheoDoiMuonSachDocument } from "../models/theodoimuonsach.model.js";
import { CreateMuonSachPayload, UpdateMuonSachPayload } from "../types/dto.types.js";
import { TheoDoiMuonSach, TinhTrangMuonSach } from "../types/types.js";
import mongoose, { PipelineStage } from "mongoose";
import { calculateOverdueFee, escapeRegex } from "../utils/utils.js";
import { SachModel } from "../models/sach.model.js";
import { createMuonSachSchema, parsePayload, updateMuonSachSchema } from "../validators/schemas.js";
interface DanhSachMuon {
    DS_Muon: TheoDoiMuonSachChiTiet[];
    pagination: PaginatedData;
}
export interface TheoDoiMuonSachChiTiet extends TheoDoiMuonSach {
    TENDOCGIA?: string;
    TENSACH?: string;
}
export class TheoDoiMuonSachService {
    static async getAll(
        page = 1,
        limit = 10,
        keyword: string,
        tinhTrangMuonSach: TinhTrangMuonSach | null,
    ): Promise<DanhSachMuon> {
        const skip = (page - 1) * limit;
        const initialMatch: Record<string, unknown> = {};
        if (tinhTrangMuonSach !== null && tinhTrangMuonSach !== undefined) {
            initialMatch.TINHTRANG = tinhTrangMuonSach;
        }
        const postLookupMatch: Record<string, unknown> = {};
        const trimmedKeyword = keyword.trim();
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
                    from: "saches",
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
                    from: "docgias",
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
                    TENDOCGIA: {
                        $trim: {
                            input: {
                                $concat: [
                                    { $ifNull: ["$DOCGIA_MATCHED.HOLOT", ""] },
                                    " ",
                                    { $ifNull: ["$DOCGIA_MATCHED.TEN", ""] },
                                ],
                            },
                        },
                    },
                    NGAYMUON: 1,
                    NGAYTRA: { $ifNull: ["$NGAYTRA", null] },
                    TINHTRANG: 1,
                    createdAt: 1,
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
    static async getById(MADOCGIA: string, MASACH: string): Promise<TheoDoiMuonSachChiTiet | null> {
        if (!MASACH?.trim() || !MADOCGIA?.trim()) {
            throw new AppError("Không có mã sách hoặc mã đọc giả", 400);
        }
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    MADOCGIA,
                    MASACH,
                },
            },
            {
                $lookup: {
                    from: "saches",
                    localField: "MASACH",
                    foreignField: "MASACH",
                    as: "sach_matched",
                },
            },
            {
                $unwind: {
                    path: "$sach_matched",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "docgias",
                    localField: "MADOCGIA",
                    foreignField: "MADOCGIA",
                    as: "docgia_matched",
                },
            },
            {
                $unwind: {
                    path: "$docgia_matched",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    MASACH: 1,
                    TENSACH: { $ifNull: ["$sach_matched.TENSACH", ""] },
                    MADOCGIA: 1,
                    TENDOCGIA: {
                        $trim: {
                            input: {
                                $concat: [
                                    { $ifNull: ["$docgia_matched.HOLOT", ""] },
                                    " ",
                                    { $ifNull: ["$docgia_matched.TEN", ""] },
                                ],
                            },
                        },
                    },
                    NGAYTAOYEUCAU: 1,
                    NGAYMUON: 1,
                    NGAYTRA: { $ifNull: ["$NGAYTRA", null] },
                    TINHTRANG: 1,
                    TIENPHAT: { $ifNull: ["$TIENPHAT", null] },
                },
            },
        ];
        const [result] = await TheoDoiMuonSachModel.aggregate<TheoDoiMuonSachChiTiet>(pipeline);
        return result;
    }
    //Độc giả xem danh sách mượn của bản thân
    static async getByMaDocGia(
        MADOCGIA: string,
        TINHTRANG: TinhTrangMuonSach | null,
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
                    from: "saches",
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
                    NGAYDUKIENTRA: 1,
                    NGAYTRA: { $ifNull: ["$NGAYTRA", null] },
                    TENSACH: { $ifNull: ["$Sach_matched.TENSACH", ""] },
                },
            },
        ];

        const muon = await TheoDoiMuonSachModel.aggregate<TheoDoiMuonSachChiTiet>(pipeline);
        const total = await TheoDoiMuonSachModel.countDocuments(matchCondition);
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
    //transaction
    static async cancelExpired(): Promise<void> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const expiredRecords = await TheoDoiMuonSachModel.find({
                TINHTRANG: TinhTrangMuonSach.ChoNhanSach,
                NGAYDUYET: { $lte: twentyFourHoursAgo },
            }).session(session);
            if (expiredRecords.length === 0) {
                await session.commitTransaction();
            }
            const result = await TheoDoiMuonSachModel.updateMany(
                {
                    TINHTRANG: TinhTrangMuonSach.ChoNhanSach, // Hoặc trạng thái chờ nhận sách
                    NGAYDUYET: { $lte: twentyFourHoursAgo },
                },
                {
                    $set: {
                        TINHTRANG: TinhTrangMuonSach.KhongDenNhanSach,
                    },
                },
            );
            if (!result) {
                throw new AppError(
                    "Phiếu mượn đã thay đổi trạng thái hoặc không thể từ chối duyệt",
                    409,
                );
            }

            const counts = expiredRecords.reduce<Record<string, number>>((acc, r) => {
                acc[r.MASACH] = (acc[r.MASACH] || 0) + 1;
                return acc;
            }, {});

            await SachModel.bulkWrite(
                Object.entries(counts).map(([MASACH, qty]) => ({
                    updateOne: {
                        filter: { MASACH },
                        update: { $inc: { SOQUYEN: qty } },
                    },
                })),
                { session },
            );
            // 4. Neu moi thu thanh cong -> Commit transaction
            await session.commitTransaction();
            if (result.modifiedCount > 0) {
                console.log(
                    `[CronJob] Đã tự động hủy ${result.modifiedCount} phiếu mượn quá hạn 24h.`,
                );
            }
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
    //transaction
    static async setMuonQuaThoiHan(): Promise<void> {
        const now = new Date();
        const result = await TheoDoiMuonSachModel.updateMany(
            {
                TINHTRANG: TinhTrangMuonSach.DangMuon, // Hoặc trạng thái chờ nhận sách
                NGAYDUKIENTRA: { $lt: now },
            },
            {
                $set: {
                    TINHTRANG: TinhTrangMuonSach.DangMuonQuaThoiHan,
                },
            },
        );
        if (result.modifiedCount > 0) {
            console.log(
                `[CronJob] Đã tự động set ${result.modifiedCount} phiếu mượn đang quá hạn trả.`,
            );
        }
    }
    //transaction: done
    static async approve(MADOCGIA: string, MASACH: string) {
        const maDocGia = MADOCGIA?.trim() ?? "";
        const maSach = MASACH?.trim() ?? "";
        // 2. Cap nhat phieu muon sang trang thai ChoNhanSach
        const updatedRequest = await TheoDoiMuonSachModel.findOneAndUpdate(
            {
                MADOCGIA: maDocGia,
                MASACH: maSach,
                TINHTRANG: TinhTrangMuonSach.DangChoDuyet,
            },
            {
                $set: {
                    TINHTRANG: TinhTrangMuonSach.ChoNhanSach,
                    NGAYDUYET: new Date(),
                },
            },
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedRequest) {
            throw new AppError("Phiêu mượn không tồn tại hoặc không ở trạng thái chờ duyệt", 404);
        }
        return updatedRequest;
    }
    static async reject(MADOCGIA: string, MASACH: string) {
        const maDocGia = MADOCGIA?.trim() ?? "";
        const maSach = MASACH?.trim() ?? "";
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const updated = await TheoDoiMuonSachModel.findOneAndUpdate(
                {
                    MADOCGIA: maDocGia,
                    MASACH: maSach,
                    TINHTRANG: TinhTrangMuonSach.DangChoDuyet,
                },
                {
                    $set: {
                        TINHTRANG: TinhTrangMuonSach.TuChoi,
                        NGAYDUYET: new Date(),
                    },
                },
                {
                    new: true,
                    runValidators: true,
                },
            );

            if (!updated) {
                throw new AppError(
                    "Phiếu mượn đã thay đổi trạng thái hoặc không thể từ chối duyệt",
                    409,
                );
            }

            const updatedBook = await SachModel.findOneAndUpdate(
                {
                    MASACH: MASACH,
                },
                {
                    $inc: { SOQUYEN: 1 },
                },
                {
                    new: true,
                    session, // DAT SESSION VAO QUERY
                },
            );

            if (!updatedBook) {
                // Neu sach da het hoac khong tim thay sach, ném loi de nhay vao catch -> Rollback
                throw new AppError("Sách trong kho đã hết hoặc không tìm thấy sách", 400);
            }

            // 4. Neu moi thu thanh cong -> Commit transaction
            await session.commitTransaction();
            return updated;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
    static async receive(MADOCGIA: string, MASACH: string) {
        const maDocGia = MADOCGIA?.trim() ?? "";
        const maSach = MASACH?.trim() ?? "";
        // 2. Cap nhat phieu muon sang trang thai ChoNhanSach
        const now = new Date();
        const updatedRequest = await TheoDoiMuonSachModel.findOneAndUpdate(
            {
                MADOCGIA: maDocGia,
                MASACH: maSach,
                TINHTRANG: TinhTrangMuonSach.ChoNhanSach,
            },
            {
                $set: {
                    TINHTRANG: TinhTrangMuonSach.DangMuon,
                    NGAYMUON: now,
                    NGAYDUKIENTRA: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                },
            },
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedRequest) {
            throw new AppError(
                "Phiêu mượn không tồn tại hoặc không ở trạng thái chờ nhận sách",
                404,
            );
        }
        return updatedRequest;
    }

    //transaction: done
    static async confirmReturnBook(MADOCGIA: string, MASACH: string) {
        const NGAYTRA = new Date();
        const allowedStatuses = [TinhTrangMuonSach.DangMuon, TinhTrangMuonSach.DangMuonQuaThoiHan];

        const current = await TheoDoiMuonSachModel.findOne(
            { MADOCGIA, MASACH, TINHTRANG: { $in: allowedStatuses } },
            { NGAYDUKIENTRA: 1 },
        );
        if (!current) {
            throw new AppError("Không tìm thấy mã đọc giả và mã sách", 404);
        }
        if (!current.NGAYDUKIENTRA) {
            throw new AppError("Phiếu mượn chưa có ngày dự kiến trả", 400);
        }
        const NGAYDUKIENTRA = current.NGAYDUKIENTRA as Date;
        const isQuaHan = NGAYTRA.getTime() > NGAYDUKIENTRA.getTime();
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const updated = await TheoDoiMuonSachModel.findOneAndUpdate(
                {
                    MADOCGIA,
                    MASACH,
                    TINHTRANG: {
                        $in: allowedStatuses,
                    },
                },
                {
                    $set: {
                        TINHTRANG: isQuaHan
                            ? TinhTrangMuonSach.TraQuaThoiHan
                            : TinhTrangMuonSach.DaTra,
                        TIENPHAT: calculateOverdueFee(NGAYDUKIENTRA, NGAYTRA),
                        NGAYTRA,
                    },
                },
                {
                    new: true,
                    runValidators: true,
                    session,
                },
            );

            if (!updated) {
                throw new AppError("Phiếu mượn đã thay đổi trạng thái hoặc không thể duyệt", 409);
            }

            const updatedBook = await SachModel.findOneAndUpdate(
                {
                    MASACH: MASACH,
                },
                {
                    $inc: { SOQUYEN: 1 },
                },
                {
                    new: true,
                    session, // DAT SESSION VAO QUERY
                },
            );

            if (!updatedBook) {
                // Neu sach da het hoac khong tim thay sach, ném loi de nhay vao catch -> Rollback
                throw new AppError("Sách trong kho đã hết hoặc không tìm thấy sách", 400);
            }

            // 4. Neu moi thu thanh cong -> Commit transaction
            await session.commitTransaction();
            return updated;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
    static toTheoDoiMuonSachDTO(doc: ITheoDoiMuonSachDocument): {
        MADOCGIA: string;
        MASACH: string;
        TINHTRANG: TinhTrangMuonSach;
        NGAYTAOYEUCAU: string | Date;
    } {
        return {
            MADOCGIA: doc.MADOCGIA,
            MASACH: doc.MASACH,
            TINHTRANG: doc.TINHTRANG,
            NGAYTAOYEUCAU: doc.NGAYTAOYEUCAU,
        };
    }
    static async create(data: CreateMuonSachPayload): Promise<{
        MADOCGIA: string;
        MASACH: string;
    }> {
        const parsed = parsePayload(createMuonSachSchema, data);
        const MASACH = parsed.MASACH;
        const MADOCGIA = parsed.MADOCGIA;
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const activeStatuses = [
                TinhTrangMuonSach.DangChoDuyet,
                TinhTrangMuonSach.ChoNhanSach,
                TinhTrangMuonSach.DangMuon,
                TinhTrangMuonSach.DangMuonQuaThoiHan,
            ];
            const DangMuon = await TheoDoiMuonSachModel.findOne({
                MADOCGIA,
                MASACH,
                TINHTRANG: { $in: activeStatuses },
            });
            if (DangMuon) {
                throw new AppError("Bạn chưa trả sách!!", 400);
            }
            const updatedBook = await SachModel.findOneAndUpdate(
                { MASACH, SOQUYEN: { $gt: 0 } },
                { $inc: { SOQUYEN: -1 } },
                {
                    new: true,
                    session,
                },
            );
            if (!updatedBook) {
                throw new AppError("Số lượng sách đã hết hoặc không tồn tại mã sách", 400);
            }
            const [created] = await TheoDoiMuonSachModel.create(
                [
                    {
                        MADOCGIA,
                        MASACH,
                        TINHTRANG: TinhTrangMuonSach.DangChoDuyet,
                        NGAYTAOYEUCAU: new Date(),
                    },
                ],
                { session },
            );
            await session.commitTransaction();
            return TheoDoiMuonSachService.toTheoDoiMuonSachDTO(created);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
    //DEPRECATED
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
                    from: "saches",
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
                    from: "docgias",
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
                    TENDOCGIA: {
                        $trim: {
                            input: {
                                $concat: [
                                    { $ifNull: ["$DOCGIA_MATCHED.HOLOT", ""] },
                                    " ",
                                    { $ifNull: ["$DOCGIA_MATCHED.TEN", ""] },
                                ],
                            },
                        },
                    },
                    NGAYMUON: 1,
                    NGAYTRA: { $ifNull: ["$NGAYTRA", null] },
                    TINHTRANG: 1,
                    createdAt: 1,
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
    ): Promise<Omit<TheoDoiMuonSach, "_id"> | null> {
        const parsed = parsePayload(updateMuonSachSchema, data);
        return await TheoDoiMuonSachModel.findOneAndUpdate({ MADOCGIA, MASACH }, parsed, {
            returnDocument: "after", // Trả về document sau khi đã update
            runValidators: true, // Kiểm tra validate schema khi update
        });
    }

    // DELETE
    static async delete(
        MASACH: string,
        MADOCGIA: string,
    ): Promise<Omit<TheoDoiMuonSach, "_id"> | null> {
        return await TheoDoiMuonSachModel.findOneAndDelete({ MADOCGIA, MASACH });
    }
}
