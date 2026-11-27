import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initCancelExpiredRequestsJob } from "./jobs/cancelExpiredBorrow.js";
initCancelExpiredRequestsJob();
const PORT = process.env.PORT || 5000;
// Kết nối DB trước rồi khởi chạy Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on: http://localhost:${PORT}`);
    });
});
