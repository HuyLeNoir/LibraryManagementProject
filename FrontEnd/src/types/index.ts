export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    pagination?: Pagination;
}

export type UserRole = "nhanvien" | "docgia";

export interface NhaXuatBan {
    MANXB: string;
    TENNXB: string;
    DIACHI: string;
}

export interface Sach {
    MASACH: string;
    TENSACH: string;
    DONGIA: number;
    BIASACH: string;
    SOQUYEN: number;
    NAMXUATBAN: number;
    MANXB: string;
    NGUONGOCTACGIA: string;
    TENNXB?: string;
}

export interface DocGia {
    MADOCGIA: string;
    HOLOT: string;
    TEN: string;
    NGAYSINH: string;
    PHAI: string;
    DIACHI: string;
    DIENTHOAI: string;
}

export interface NhanVien {
    MSNV: string;
    HoTenNV: string;
    ChucVu: string;
    DiaChi: string;
    SoDienThoai: string;
}

export const TinhTrangMuonSach = {
    DangChoDuyet: "Đang chờ duyệt",
    ChoNhanSach: "Đã duyệt chờ nhận sách",
    KhongDenNhanSach: "Đã huỷ do không đến nhận sách trong vòng 24h",
    DangMuon: "Đang mượn",
    DangMuonQuaThoiHan: "Đang mượn quá thời hạn cho phép",
    DaTra: "Đã trả",
    TuChoi: "Từ chối cho mượn",
    TraQuaThoiHan: "Trả quá thời hạn",
} as const;

export type TinhTrangMuonSach = (typeof TinhTrangMuonSach)[keyof typeof TinhTrangMuonSach];

export interface TheoDoiMuonSach {
    MADOCGIA: string;
    MASACH: string;
    TENDOCGIA?: string;
    TENSACH?: string;
    NGAYTAOYEUCAU?: string;
    NGAYDUYET?: string;
    NGAYMUON?: string;
    NGAYTRA?: string | null;
    NGAYDUKIENTRA?: string;
    TINHTRANG: TinhTrangMuonSach;
    TIENPHAT?: number | null;
}

export interface LoginResult<T = DocGia | NhanVien> {
    user: T;
    role: UserRole;
    token: string;
}

export interface LoginDocGiaPayload {
    MADOCGIA: string;
    Password: string;
}

export interface LoginNhanVienPayload {
    MSNV: string;
    Password: string;
}

export interface CreateDocGiaPayload {
    HOLOT: string;
    TEN: string;
    NGAYSINH: string;
    PHAI: string;
    DIACHI: string;
    DIENTHOAI: string;
    PASSWORD: string;
}

export type UpdateDocGiaPayload = Partial<CreateDocGiaPayload>;

export interface CreateNhanVienPayload {
    MSNV: string;
    HoTenNV: string;
    ChucVu: string;
    DiaChi: string;
    SoDienThoai: string;
    Password: string;
}

export type UpdateNhanVienPayload = Partial<Omit<CreateNhanVienPayload, "MSNV">>;

export type CreateNhaXuatBanPayload = NhaXuatBan;
export type UpdateNhaXuatBanPayload = Partial<CreateNhaXuatBanPayload>;

export type CreateSachPayload = Omit<Sach, "TENNXB">;
export type UpdateSachPayload = Partial<CreateSachPayload>;

export interface CreateMuonSachPayload {
    MADOCGIA: string;
    MASACH: string;
}

export type UpdateMuonSachPayload = Partial<
    Pick<
        TheoDoiMuonSach,
        "TINHTRANG" | "NGAYDUYET" | "NGAYMUON" | "NGAYTRA" | "NGAYDUKIENTRA" | "TIENPHAT"
    >
>;
