// types/dto.types.ts
import { z } from "zod";
import {
    createDocGiaSchema,
    createMuonSachSchema,
    createNhanVienSchema,
    createNhaXuatBanSchema,
    createSachSchema,
    updateDocGiaSchema,
    updateMuonSachSchema,
    updateNhanVienSchema,
    updateNhaXuatBanSchema,
    updateSachSchema,
} from "../validators/schemas.js";

export type CreateSachPayload = z.infer<typeof createSachSchema>;
export type UpdateSachPayload = z.infer<typeof updateSachSchema>;

export type CreateDocGiaPayload = z.infer<typeof createDocGiaSchema>;
export type UpdateDocGiaPayload = z.infer<typeof updateDocGiaSchema>;

export type CreateNhaXuatBanPayload = z.infer<typeof createNhaXuatBanSchema>;
export type UpdateNhaXuatBanPayload = z.infer<typeof updateNhaXuatBanSchema>;

export type CreateNhanVienPayload = z.infer<typeof createNhanVienSchema>;
export type UpdateNhanVienPayload = z.infer<typeof updateNhanVienSchema>;

export type CreateMuonSachPayload = z.infer<typeof createMuonSachSchema>;
export type TraSachPayload = {
    NGAYTRA?: string | Date;
};
export type UpdateMuonSachPayload = z.infer<typeof updateMuonSachSchema>;
