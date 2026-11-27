import { z } from "zod";
import { AppError } from "../utils/appError.js";
import { TinhTrangMuonSach } from "../types/types.js";

export function parsePayload<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const message = result.error.issues
            .map((issue) => issue.message)
            .filter(Boolean)
            .join(", ");
        throw new AppError(message || "Dữ liệu không hợp lệ", 400);
    }
    return result.data;
}

const nonEmptyUpdate = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
    schema.partial().refine((obj) => Object.keys(obj).length > 0, {
        message: "Không có dữ liệu để cập nhật",
    });

// Auth
export const loginNhanVienSchema = z.object({
    MSNV: z
        .string({ error: "Vui lòng nhập mã số nhân viên" })
        .trim()
        .min(1, "Vui lòng nhập mã số nhân viên"),
    Password: z.string({ error: "Vui lòng nhập mật khẩu" }).min(1, "Vui lòng nhập mật khẩu"),
});

export const loginDocGiaSchema = z.object({
    MADOCGIA: z
        .string({ error: "Vui lòng nhập mã độc giả" })
        .trim()
        .min(1, "Vui lòng nhập mã độc giả"),
    Password: z.string({ error: "Vui lòng nhập mật khẩu" }).min(1, "Vui lòng nhập mật khẩu"),
});

// DocGia
export const createDocGiaSchema = z.object({
    HOLOT: z.string({ error: "Vui lòng nhập họ lót" }).trim().min(1, "Vui lòng nhập họ lót"),
    TEN: z.string({ error: "Vui lòng nhập tên" }).trim().min(1, "Vui lòng nhập tên"),
    NGAYSINH: z.union([z.string().min(1, "Vui lòng nhập ngày sinh"), z.date()]),
    PHAI: z.string({ error: "Vui lòng chọn phái" }).trim().min(1, "Vui lòng chọn phái"),
    DIACHI: z.string({ error: "Vui lòng nhập địa chỉ" }).trim().min(1, "Vui lòng nhập địa chỉ"),
    DIENTHOAI: z
        .string({ error: "Vui lòng nhập số điện thoại" })
        .trim()
        .min(1, "Vui lòng nhập số điện thoại"),
    PASSWORD: z.string({ error: "Vui lòng nhập mật khẩu" }).min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const updateDocGiaSchema = nonEmptyUpdate(createDocGiaSchema);

// NhanVien
export const createNhanVienSchema = z.object({
    MSNV: z
        .string({ error: "Vui lòng nhập mã số nhân viên" })
        .trim()
        .min(1, "Vui lòng nhập mã số nhân viên"),
    HoTenNV: z
        .string({ error: "Vui lòng nhập họ tên nhân viên" })
        .trim()
        .min(1, "Vui lòng nhập họ tên nhân viên"),
    ChucVu: z.string({ error: "Vui lòng nhập chức vụ" }).trim().min(1, "Vui lòng nhập chức vụ"),
    DiaChi: z.string({ error: "Vui lòng nhập địa chỉ" }).trim().min(1, "Vui lòng nhập địa chỉ"),
    SoDienThoai: z
        .string({ error: "Vui lòng nhập số điện thoại" })
        .trim()
        .min(1, "Vui lòng nhập số điện thoại"),
    Password: z.string({ error: "Vui lòng nhập mật khẩu" }).min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const updateNhanVienSchema = nonEmptyUpdate(createNhanVienSchema.omit({ MSNV: true }));

// NhaXuatBan
export const createNhaXuatBanSchema = z.object({
    MANXB: z
        .string({ error: "Vui lòng nhập mã nhà xuất bản" })
        .trim()
        .min(1, "Vui lòng nhập mã nhà xuất bản"),
    TENNXB: z
        .string({ error: "Vui lòng nhập tên nhà xuất bản" })
        .trim()
        .min(1, "Vui lòng nhập tên nhà xuất bản"),
    DIACHI: z.string({ error: "Vui lòng nhập địa chỉ" }).trim().min(1, "Vui lòng nhập địa chỉ"),
});

export const updateNhaXuatBanSchema = nonEmptyUpdate(createNhaXuatBanSchema);

// Sach
export const createSachSchema = z.object({
    MASACH: z.string({ error: "Vui lòng nhập mã sách" }).trim().min(1, "Vui lòng nhập mã sách"),
    TENSACH: z.string({ error: "Vui lòng nhập tên sách" }).trim().min(1, "Vui lòng nhập tên sách"),
    DONGIA: z.coerce.number({ error: "Đơn giá phải là số" }).min(0, "Đơn giá không được âm"),
    BIASACH: z.string({ error: "Không thấy đường dẫn bìa sách" }).trim(),
    SOQUYEN: z.coerce
        .number({ error: "Số quyển phải là số" })
        .int("Số quyển phải là số nguyên")
        .min(0, "Số quyển không được âm"),
    NAMXUATBAN: z.coerce
        .number({ error: "Năm xuất bản phải là số" })
        .int("Năm xuất bản phải là số nguyên"),
    MANXB: z
        .string({ error: "Vui lòng nhập mã nhà xuất bản" })
        .trim()
        .min(1, "Vui lòng nhập mã nhà xuất bản"),
    NGUONGOCTACGIA: z
        .string({ error: "Vui lòng nhập nguồn gốc tác giả" })
        .trim()
        .min(1, "Vui lòng nhập nguồn gốc tác giả"),
});

export const updateSachSchema = nonEmptyUpdate(createSachSchema);

// TheoDoiMuonSach
export const createMuonSachSchema = z.object({
    MADOCGIA: z
        .string({ error: "Vui lòng nhập mã độc giả" })
        .trim()
        .min(1, "Vui lòng nhập mã độc giả"),
    MASACH: z.string({ error: "Vui lòng nhập mã sách" }).trim().min(1, "Vui lòng nhập mã sách"),
    TINHTRANG: z.nativeEnum(TinhTrangMuonSach).optional(),
});

export const updateMuonSachSchema = nonEmptyUpdate(
    z.object({
        MADOCGIA: z.string().trim().min(1),
        MASACH: z.string().trim().min(1),
        NGAYTAOYEUCAU: z.union([z.string(), z.date()]),
        NGAYDUYET: z.union([z.string(), z.date()]),
        NGAYMUON: z.union([z.string(), z.date()]),
        NGAYTRA: z.union([z.string(), z.date()]).nullable(),
        NGAYDUKIENTRA: z.union([z.string(), z.date()]),
        TINHTRANG: z.enum(TinhTrangMuonSach),
        TIENPHAT: z.coerce.number().min(0),
    }),
);
