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

router.put(
    "/:maDocGia/:maSach/approve",
    authenticate,
    authorize(["nhanvien"]),
    TheoDoiMuonSachController.approve,
);
router.put(
    "/:maDocGia/:maSach/reject",
    authenticate,
    authorize(["nhanvien"]),
    TheoDoiMuonSachController.reject,
);
router.put(
    "/:maDocGia/:maSach/receive",
    authenticate,
    authorize(["nhanvien"]),
    TheoDoiMuonSachController.receive,
);

router.put(
    "/:maDocGia/:maSach/return",
    authenticate,
    authorize(["nhanvien"]),
    TheoDoiMuonSachController.returnBook,
);
router
    .route("/:maDocGia/:maSach")
    .get(authenticate, authorize(["nhanvien", "docgia"]), TheoDoiMuonSachController.GetById)

    .put(authenticate, authorize(["nhanvien"]), TheoDoiMuonSachController.update)
    .delete(authenticate, authorize(["nhanvien"]), TheoDoiMuonSachController.delete);
export default router;
