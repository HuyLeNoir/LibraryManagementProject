import express, { Express } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import docgiaRoutes from "./routes/docgia.routes.js";
import NhanVienRoutes from "./routes/nhanvien.routes.js";
import NhaXuatBanRoute from "./routes/nhaxuatban.routes.js";
import SachRoutes from "./routes/sach.routes.js";
import TheoDoiMuonSachRoutes from "./routes/theodoimuonsach.routes.js";
import AuthRoutes from "./routes/auth.routes.js";
const app: Express = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use("/api", AuthRoutes);
app.use("/api/docgia", docgiaRoutes);
app.use("/api/nhanvien", NhanVienRoutes);
app.use("/api/nxb", NhaXuatBanRoute);
app.use("/api/sach", SachRoutes);
app.use("/api/theo-doi-muon-sach", TheoDoiMuonSachRoutes);

app.use(errorHandler);

export default app;
