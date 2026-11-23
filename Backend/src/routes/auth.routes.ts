import { AuthController } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();
// /api/login
router.route("/login").post(AuthController.loginDocGia);

// /api/register
router.route("/register").post(AuthController.registerDocGia);

// /api/staff/login
router.route("/staff/login").post(AuthController.loginNhanVien);

export default router;
