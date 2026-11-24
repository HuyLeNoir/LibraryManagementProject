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
export enum TinhTrangMuonSach {
    DangChoDuyet = "Đang chờ duyệt",
    ChoNhanSach = "Đã duyệt chờ nhận sách",
    KhongDenNhanSach = "Đã huỷ do không đến nhận sách trong vòng 24h",
    DangMuon = "Đang mượn",
    DangMuonQuaThoiHan = "Đang mượn quá thời hạn cho phép",
    DaTra = "Đã trả",
    TraQuaThoiHan = "Trả quá thời hạn",
}
export interface TheoDoiMuonSach extends Timestamps {
    _id?: string; //fuick this
    MADOCGIA: string;
    MASACH: string;
    NGAYTAOYEUCAU: string | Date;
    NGAYDUYET?: string | Date;
    NGAYMUON?: string | Date; //untill the request get approved
    NGAYTRA?: string | Date | null; //until book loaner give it back
    NGAYDUKIENTRA?: string | Date; //untill the request get approved
    TINHTRANG: TinhTrangMuonSach; //every request should have status
    TIENPHAT?: number;
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
