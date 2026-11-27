<script setup lang="ts">
import { onMounted, ref } from "vue";
import { AlertCircle, ClipboardList } from "@lucide/vue";
import { docGiaAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { formatDate } from "@/lib/utils";
import { TinhTrangMuonSach, type Pagination, type TheoDoiMuonSach } from "@/types";
import AppLayout from "@/components/common/AppLayout.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import PaginationBar from "@/components/common/PaginationBar.vue";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const authStore = useAuthStore();
const borrows = ref<TheoDoiMuonSach[]>([]);
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
const selectedStatus = ref<string>("ALL");
const isLoading = ref(false);
const errorMessage = ref("");

const statusOptions = Object.values(TinhTrangMuonSach);

async function fetchMyBorrows(page = 1) {
    if (!authStore.userId) return;
    isLoading.value = true;
    errorMessage.value = "";
    try {
        const res = await docGiaAPI.getMyBorrows(authStore.userId, {
            page,
            limit: pagination.value.limit,
            tinhTrang: selectedStatus.value === "ALL" ? undefined : selectedStatus.value,
        });
        borrows.value = res.data || [];
        if (res.pagination) {
            pagination.value = res.pagination;
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Không thể tải danh sách mượn";
        if (msg.includes("chưa mượn sách")) {
            borrows.value = [];
            pagination.value = { page: 1, limit: 10, total: 0, totalPages: 1 };
        } else {
            errorMessage.value = msg;
        }
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    fetchMyBorrows(1);
});
</script>

<template>
    <AppLayout>
        <div class="space-y-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Phiếu mượn của tôi</h1>
                    <p class="text-sm text-muted-foreground">
                        Theo dõi trạng thái yêu cầu và lịch sử mượn sách
                    </p>
                </div>

                <div class="w-full sm:w-64">
                    <Select v-model="selectedStatus" @update:model-value="fetchMyBorrows(1)">
                        <SelectTrigger class="w-full">
                            <SelectValue placeholder="Lọc theo trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem
                                v-for="status in statusOptions"
                                :key="status"
                                :value="status"
                            >
                                {{ status }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Alert v-if="errorMessage" variant="destructive">
                <AlertCircle class="h-4 w-4" />
                <AlertDescription>{{ errorMessage }}</AlertDescription>
            </Alert>

            <div v-if="isLoading" class="space-y-2 rounded-lg border border-border bg-card p-4">
                <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
            </div>

            <div
                v-else-if="borrows.length === 0"
                class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-14 text-center"
            >
                <ClipboardList class="mb-3 h-10 w-10 text-muted-foreground" />
                <p class="text-base font-medium">Chưa có phiếu mượn nào</p>
                <p class="mt-1 text-sm text-muted-foreground">
                    Bạn có thể vào danh mục sách để gửi yêu cầu mượn sách.
                </p>
            </div>

            <div v-else class="rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã sách</TableHead>
                            <TableHead>Tên sách</TableHead>
                            <TableHead>Ngày mượn</TableHead>
                            <TableHead>Ngày dự kiến trả</TableHead>
                            <TableHead>Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="item in borrows" :key="`${item.MADOCGIA}-${item.MASACH}`">
                            <TableCell class="font-medium">{{ item.MASACH }}</TableCell>
                            <TableCell>{{ item.TENSACH || "—" }}</TableCell>
                            <TableCell>{{ formatDate(item.NGAYMUON) }}</TableCell>
                            <TableCell>{{ formatDate(item.NGAYDUKIENTRA) }}</TableCell>
                            <TableCell>
                                <StatusBadge :status="item.TINHTRANG" />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <PaginationBar :pagination="pagination" @change="fetchMyBorrows" />
        </div>
    </AppLayout>
</template>
