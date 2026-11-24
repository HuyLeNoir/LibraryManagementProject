// types/dto.types.ts
import { Sach, DocGia, NhaXuatBan, NhanVien, TheoDoiMuonSach } from "./types.js";

type BaseSystemFields = "_id" | "createdAt" | "updatedAt";

export type CreateSachPayload = Omit<Sach, BaseSystemFields>;
export type UpdateSachPayload = Partial<CreateSachPayload>;

export type CreateDocGiaPayload = Omit<DocGia, BaseSystemFields | "MADOCGIA"> & {
    PASSWORD: string;
};
export type UpdateDocGiaPayload = Partial<CreateDocGiaPayload>;

export type CreateNhaXuatBanPayload = Omit<NhaXuatBan, BaseSystemFields>;
export type UpdateNhaXuatBanPayload = Partial<CreateNhaXuatBanPayload>;

export type CreateNhanVienPayload = Omit<NhanVien, BaseSystemFields> & {
    Password: string; // Chỉ có lúc tạo mới/đăng ký
};
export type UpdateNhanVienPayload = Partial<Omit<CreateNhanVienPayload, BaseSystemFields | "MSNV">>;

export type CreateMuonSachPayload = Omit<
    TheoDoiMuonSach,
    BaseSystemFields | "NGAYTRA" | "NGAYDUYET" | "NGAYMUON" | "NGAYTRA" | "NGAYDUKIENTRA"
>;
export type TraSachPayload = {
    NGAYTRA?: string | Date;
};
export type UpdateMuonSachPayload = Partial<Omit<TheoDoiMuonSach, BaseSystemFields>>;
