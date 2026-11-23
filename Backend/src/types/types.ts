import { ObjectId } from "mongoose";

export interface Timestamps {
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

// 1. Nhà Xuất Bản
export interface NhaXuatBan extends Timestamps {
    _id?: string;
    MANXB: string;
    TENNXB: string;
    DIACHI: string;
}

// 2. Sách
export interface Sach extends Timestamps {
    _id?: string;
    MASACH: string;
    TENSACH: string;
    DONGIA: number;
    SOQUYEN: number;
    NAMXUATBAN: number;
    MANXB: string;
    NGUONGOCTACGIA: string;
}

// 3. Độc Giả
export interface DocGia extends Timestamps {
    _id?: ObjectId | string;
    MADOCGIA: string;
    HOLOT: string;
    TEN: string;
    NGAYSINH: string | Date;
    PHAI: "Nam" | "Nữ" | string;
    DIACHI: string;
    DIENTHOAI: string;
}

export interface NhanVien extends Timestamps {
    _id?: string;
    MSNV: string;
    HoTenNV: string;
    ChucVu: string;
    DiaChi: string;
    SoDienThoai: string;
}

// 5. Theo Dõi Mượn Sách
export interface TheoDoiMuonSach extends Timestamps {
    _id?: string;
    MADOCGIA: string;
    MASACH: string;
    NGAYMUON: string | Date;
    NGAYTRA?: string | Date | null;
    NGAYDUKIENTRA: string | Date;
    TINHTRANG?: "Đang chờ duyệt" | "Đang mượn" | "Đã trả" | "Trả quá thời hạn" | string;
}
export type UserRole = "nhanvien" | "docgia";

export interface LoginResult<T = unknown> {
    user: T;
    role: UserRole;
    token: string;
}

export interface JwtPayloadData {
    MSNV?: string;
    role: UserRole;
    chucVu?: string;
}
