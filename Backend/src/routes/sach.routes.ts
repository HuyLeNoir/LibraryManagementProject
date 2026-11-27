import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { SachController } from "../controllers/sach.controller.js";
import { uploadBookCover } from "../middlewares/upload.middleware.js";
const router = Router();
//api/sach/
router
    .route("/")
    .get(SachController.GetAll)
    .post(
        authenticate,
        authorize(["nhanvien"]),
        uploadBookCover.single("BIASACH"),
        SachController.create,
    );
//api/sach/:masach
router
    .route("/:masach")
    .get(SachController.GetById)
    .put(
        authenticate,
        authorize(["nhanvien"]),
        uploadBookCover.single("BIASACH"),
        SachController.update,
    )
    .delete(authenticate, authorize(["nhanvien"]), SachController.delete);
export default router;
