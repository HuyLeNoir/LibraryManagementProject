import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { NhanVienControler } from "../controllers/nhanvien.controller.js";
const router = Router();
//api/nhanvien
router
    .route("/")
    .get(authenticate, authorize(["nhanvien"]), NhanVienControler.GetAll)
    .post(authenticate, authorize(["nhanvien"]), NhanVienControler.create);
//api/:nhanvien/
router
    .route("/:msnv")
    .get(authenticate, authorize(["nhanvien"]), NhanVienControler.GetById)
    .put(authenticate, authorize(["nhanvien"]), NhanVienControler.update)
    .delete(authenticate, authorize(["nhanvien"]), NhanVienControler.delete);
export default router;
