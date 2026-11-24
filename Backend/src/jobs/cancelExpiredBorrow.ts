import cron from "node-cron";

import { TheoDoiMuonSachService } from "../services/theodoimuonsach.service.js";

export function initCancelExpiredRequestsJob() {
    // Chạy mỗi 15 phút một lần: '*/15 * * * *'
    cron.schedule("*/15 * * * *", async () => {
        const [cancelResult, overdueResult] = await Promise.allSettled([
            TheoDoiMuonSachService.cancelExpired(),
            TheoDoiMuonSachService.setMuonQuaThoiHan(),
        ]);

        if (cancelResult.status === "rejected") {
            console.error("[CronJob] Lỗi tự động hủy phiếu quá hạn nhận:", cancelResult.reason);
        }

        if (overdueResult.status === "rejected") {
            console.error("[CronJob] Lỗi cập nhật phiếu mượn quá thời hạn:", overdueResult.reason);
        }
    });
}
