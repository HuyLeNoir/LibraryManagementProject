<script setup lang="ts">
import { onMounted, ref } from "vue";

import { AlertCircle, ClipboardList, Pencil, Search, Trash2 } from "@lucide/vue";
import { muonSachAPI } from "@/services/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TinhTrangMuonSach, type Pagination, type TheoDoiMuonSach } from "@/types";
import StaffLayout from "@/components/common/StaffLayout.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import PaginationBar from "@/components/common/PaginationBar.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

const borrows = ref<TheoDoiMuonSach[]>([]);
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
const keyword = ref("");
const selectedStatus = ref<string>("ALL");
const isLoading = ref(false);
const errorMessage = ref("");

const statusOptions = Object.values(TinhTrangMuonSach);

// Delete dialog
const deleteDialogOpen = ref(false);
const deletingItem = ref<TheoDoiMuonSach | null>(null);
const isDeleting = ref(false);

async function fetchBorrows(page = 1) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
        const res = await muonSachAPI.getAll({
            page,
            limit: pagination.value.limit,
            keyword: keyword.value.trim() || undefined,
            tinhtrang: selectedStatus.value === "ALL" ? undefined : selectedStatus.value,
        });
        borrows.value = res.data || [];
        if (res.pagination) pagination.value = res.pagination;
    } catch (error) {
        errorMessage.value =
            error instanceof Error ? error.message : "Không thể tải danh sách mượn";
    } finally {
        isLoading.value = false;
    }
}

function toDateInput(value?: string | null): string {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}
const detailDialogOpen = ref(false);
const selectedBorrow = ref<TheoDoiMuonSach | null>(null);

function openDetailDialog(item: TheoDoiMuonSach) {
    selectedBorrow.value = item;
    detailDialogOpen.value = true;
}

function openDeleteDialog(item: TheoDoiMuonSach) {
    deletingItem.value = item;
    deleteDialogOpen.value = true;
}

async function confirmDelete() {
    if (!deletingItem.value) return;
    isDeleting.value = true;
    try {
        await muonSachAPI.delete(deletingItem.value.MADOCGIA, deletingItem.value.MASACH);
        deleteDialogOpen.value = false;
        await fetchBorrows(pagination.value.page);
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : "Xóa phiếu mượn thất bại";
    } finally {
        isDeleting.value = false;
    }
}

onMounted(() => {
    fetchBorrows(1);
});
</script>

<template>
    <StaffLayout>
        <div class="space-y-6">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Theo dõi mượn sách</h1>
                    <p class="text-sm text-muted-foreground">
                        Quản lý và cập nhật trạng thái mượn/trả sách
                    </p>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <form class="flex gap-2" @submit.prevent="fetchBorrows(1)">
                        <div class="relative w-full sm:w-56">
                            <Search
                                class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground"
                            />
                            <Input
                                v-model="keyword"
                                placeholder="Tìm mã, tên sách, độc giả..."
                                class="pl-8"
                            />
                        </div>
                        <Button type="submit" variant="outline">Tìm</Button>
                    </form>

                    <div class="w-full sm:w-52">
                        <Select v-model="selectedStatus" @update:model-value="fetchBorrows(1)">
                            <SelectTrigger class="w-full">
                                <SelectValue placeholder="Lọc trạng thái" />
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
                <p class="text-base font-medium">Không có phiếu mượn nào</p>
            </div>

            <div v-else class="rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Độc giả</TableHead>
                            <TableHead>Sách</TableHead>
                            <TableHead>Ngày mượn</TableHead>
                            <TableHead>Ngày trả</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead class="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow
                            class="cursor-pointerr"
                            v-for="item in borrows"
                            :key="`${item.MADOCGIA}-${item.MASACH}`"
                        >
                            <TableCell>
                                <div class="font-medium">{{ item.MADOCGIA }}</div>
                                <div class="text-xs text-muted-foreground">
                                    {{ item.TENDOCGIA || "—" }}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div class="font-medium">{{ item.MASACH }}</div>
                                <div class="text-xs text-muted-foreground">
                                    {{ item.TENSACH || "—" }}
                                </div>
                            </TableCell>
                            <TableCell>{{ formatDate(item.NGAYMUON) }}</TableCell>
                            <TableCell>{{ formatDate(item.NGAYTRA) }}</TableCell>
                            <TableCell>
                                <StatusBadge :status="item.TINHTRANG" />
                            </TableCell>
                            <TableCell class="text-right">
                                <div class="flex justify-end items-center gap-1">
                                    <div
                                        v-if="item.TINHTRANG == TinhTrangMuonSach.DangChoDuyet"
                                        class="flex gap-1"
                                    >
                                        <Button
                                            variant="outline"
                                            size="xs"
                                            class="cursor-pointer"
                                            @click="
                                                () => {
                                                    muonSachAPI.approve(item.MADOCGIA, item.MASACH);
                                                    fetchBorrows(1);
                                                }
                                            "
                                        >
                                            Duyệt
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="xs"
                                            class="cursor-pointer"
                                            @click="
                                                () => {
                                                    muonSachAPI.reject(item.MADOCGIA, item.MASACH);
                                                    fetchBorrows(1);
                                                }
                                            "
                                        >
                                            Từ chối
                                        </Button>
                                    </div>
                                    <Button
                                        v-if="item.TINHTRANG == TinhTrangMuonSach.ChoNhanSach"
                                        class="cursor-pointer"
                                        variant="outline"
                                        @click="
                                            () => {
                                                muonSachAPI.receive(item.MADOCGIA, item.MASACH);
                                                fetchBorrows(1);
                                            }
                                        "
                                        size="xs"
                                    >
                                        Xác nhận đã nhận sách
                                    </Button>
                                    <Button
                                        class="cursor-pointer"
                                        v-else-if="
                                            item.TINHTRANG == TinhTrangMuonSach.DangMuon ||
                                            item.TINHTRANG == TinhTrangMuonSach.DangMuonQuaThoiHan
                                        "
                                        variant="outline"
                                        @click="
                                            () => {
                                                muonSachAPI.return(item.MADOCGIA, item.MASACH);
                                                fetchBorrows(1);
                                            }
                                        "
                                        size="xs"
                                    >
                                        Xác nhận đã trả sách
                                    </Button>
                                    <Button
                                        class="cursor-pointer"
                                        variant="ghost"
                                        size="icon-sm"
                                        @click="openDeleteDialog(item)"
                                    >
                                        <Trash2 class="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <PaginationBar :pagination="pagination" @change="fetchBorrows" />
        </div>

        <Dialog v-model:open="detailDialogOpen">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Chi tiết phiếu mượn ({{ selectedBorrow?.MADOCGIA }} -
                        {{ selectedBorrow?.MASACH }})
                    </DialogTitle>
                    <DialogDescription>
                        Thông tin trạng thái, ngày mượn/trả và tiền phạt.
                    </DialogDescription>
                </DialogHeader>

                <div v-if="selectedBorrow" class="space-y-4">
                    <div class="space-y-2">
                        <Label>Trạng thái</Label>
                        <Input
                            readonly
                            class="bg-muted/50 focus-visible:ring-0"
                            :model-value="selectedBorrow.TINHTRANG"
                        />
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div class="space-y-2">
                            <Label>Ngày mượn</Label>
                            <Input
                                type="date"
                                readonly
                                class="pointer-events-none bg-muted/50 focus-visible:ring-0"
                                :model-value="toDateInput(selectedBorrow.NGAYMUON)"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label>Ngày dự kiến trả</Label>
                            <Input
                                type="date"
                                readonly
                                class="pointer-events-none bg-muted/50 focus-visible:ring-0"
                                :model-value="toDateInput(selectedBorrow.NGAYDUKIENTRA)"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div class="space-y-2">
                            <Label>Ngày trả thực tế</Label>
                            <Input
                                type="date"
                                readonly
                                class="pointer-events-none bg-muted/50 focus-visible:ring-0"
                                :model-value="toDateInput(selectedBorrow.NGAYTRA)"
                            />
                        </div>

                        <div class="space-y-2">
                            <Label>Tiền phạt (VND)</Label>
                            <Input
                                readonly
                                class="bg-muted/50 focus-visible:ring-0"
                                :model-value="formatCurrency(selectedBorrow.TIENPHAT || 0)"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" @click="detailDialogOpen = false">
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <ConfirmDialog
            v-model:open="deleteDialogOpen"
            title="Xác nhận xóa phiếu mượn"
            :description="`Bạn có chắc chắn muốn xóa phiếu mượn (${deletingItem?.MADOCGIA || ''} - ${deletingItem?.MASACH || ''})?`"
            confirm-text="Xóa"
            :destructive="true"
            :loading="isDeleting"
            @confirm="confirmDelete"
        />
    </StaffLayout>
</template>
