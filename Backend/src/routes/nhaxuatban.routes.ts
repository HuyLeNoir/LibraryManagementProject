import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { NhaXuatBanController } from "../controllers/nhaxuatban.controller.js";
const router = Router();
//api/nxb/
router
    .route("/")
    .get(NhaXuatBanController.GetAll)
    .post(authenticate, authorize(["nhanvien"]), NhaXuatBanController.create);
//api/nxb/:nxb/
router
    .route("/:manxb")
    .get(NhaXuatBanController.GetById)
    .put(authenticate, authorize(["nhanvien"]), NhaXuatBanController.update)
    .delete(authenticate, authorize(["nhanvien"]), NhaXuatBanController.delete);
export default router;
