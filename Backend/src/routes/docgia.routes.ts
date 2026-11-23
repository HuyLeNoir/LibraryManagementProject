import { Router } from "express";
import { DocGiaController } from "../controllers/docgia.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { TheoDoiMuonSachController } from "../controllers/theodoimuonsach.controller.js";
const router = Router();
//api/docgia/
router
    .route("/")
    .get(authenticate, authorize(["nhanvien"]), DocGiaController.GetDocGiaAll)
    .post(authenticate, authorize(["nhanvien"]), DocGiaController.create);
//api/docgia/:maDocGia
router
    .route("/:maDocGia")
    .get(authenticate, authorize(["docgia", "nhanvien"]), DocGiaController.GetDocGiaByMaDocGia)
    .put(authenticate, authorize(["docgia", "nhanvien"]), DocGiaController.update)
    .delete(authenticate, authorize(["nhanvien"]), DocGiaController.delete);
// /api/docgia/:maDocGia/danh-sach-muon
router
    .route("/:maDocGia/danh-sach-muon")
    .get(authenticate, authorize(["docgia"]), TheoDoiMuonSachController.GetByMaDocGia);
export default router;
