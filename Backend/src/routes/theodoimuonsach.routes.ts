import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { TheoDoiMuonSachController } from "../controllers/theodoimuonsach.controller.js";
const router = Router();
//api/theo-doi-muon-sach/
router
    .route("/")
    .get(authenticate, authorize(["nhanvien"]), TheoDoiMuonSachController.GetAll)
    .post(authenticate, authorize(["docgia", "nhanvien"]), TheoDoiMuonSachController.create);
//api/theo-doi-muon-sach/:madocgia/:masach/
router
    .route("/:maDocGia/:maSach")
    .get(authenticate, authorize(["nhanvien", "docgia"]), TheoDoiMuonSachController.GetById)
    .put(authenticate, authorize(["nhanvien"]), TheoDoiMuonSachController.update)
    .delete(authenticate, authorize(["nhanvien"]), TheoDoiMuonSachController.delete);
export default router;
