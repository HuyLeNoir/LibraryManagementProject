<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { AlertCircle, Building2, Pencil, Plus, Search, Trash2 } from "@lucide/vue";
import { nxbAPI } from "@/services/api";
import type { NhaXuatBan, Pagination } from "@/types";
import StaffLayout from "@/components/common/StaffLayout.vue";
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const publishers = ref<NhaXuatBan[]>([]);
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
const keyword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const formDialogOpen = ref(false);
const isEditing = ref(false);
const formError = ref("");

const deleteDialogOpen = ref(false);
const deletingItem = ref<NhaXuatBan | null>(null);
const isDeleting = ref(false);

const publisherSchema = toTypedSchema(
    z.object({
        MANXB: z.string().trim().min(1, "Vui lòng nhập mã nhà xuất bản"),
        TENNXB: z.string().trim().min(1, "Vui lòng nhập tên nhà xuất bản"),
        DIACHI: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
    }),
);

const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: publisherSchema,
});

async function fetchPublishers(page = 1) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
        const res = await nxbAPI.getAll({
            page,
            limit: pagination.value.limit,
            keyword: keyword.value.trim() || undefined,
        });
        publishers.value = res.data || [];
        if (res.pagination) pagination.value = res.pagination;
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : "Không thể tải danh sách NXB";
    } finally {
        isLoading.value = false;
    }
}

function openCreateDialog() {
    isEditing.value = false;
    formError.value = "";
    resetForm({ values: { MANXB: "", TENNXB: "", DIACHI: "" } });
    formDialogOpen.value = true;
}

function openEditDialog(item: NhaXuatBan) {
    isEditing.value = true;
    formError.value = "";
    resetForm({ values: { MANXB: item.MANXB, TENNXB: item.TENNXB, DIACHI: item.DIACHI } });
    formDialogOpen.value = true;
}

const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
        if (isEditing.value) {
            await nxbAPI.update(values.MANXB, values);
        } else {
            await nxbAPI.create(values);
        }
        formDialogOpen.value = false;
        await fetchPublishers(pagination.value.page);
    } catch (error) {
        formError.value = error instanceof Error ? error.message : "Lưu nhà xuất bản thất bại";
    }
});

function openDeleteDialog(item: NhaXuatBan) {
    deletingItem.value = item;
    deleteDialogOpen.value = true;
}

async function confirmDelete() {
    if (!deletingItem.value) return;
    isDeleting.value = true;
    try {
        await nxbAPI.delete(deletingItem.value.MANXB);
        deleteDialogOpen.value = false;
        await fetchPublishers(pagination.value.page);
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : "Xóa nhà xuất bản thất bại";
    } finally {
        isDeleting.value = false;
    }
}

onMounted(() => {
    fetchPublishers(1);
});
</script>

<template>
    <StaffLayout>
        <div class="space-y-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Quản lý nhà xuất bản</h1>
                    <p class="text-sm text-muted-foreground">
                        Quản lý danh sách nhà xuất bản đối tác
                    </p>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <form class="flex gap-2" @submit.prevent="fetchPublishers(1)">
                        <div class="relative w-full sm:w-64">
                            <Search
                                class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground"
                            />
                            <Input
                                v-model="keyword"
                                placeholder="Tìm mã hoặc tên NXB..."
                                class="pl-8"
                            />
                        </div>
                        <Button type="submit" variant="outline">Tìm</Button>
                    </form>
                    <Button @click="openCreateDialog">
                        <Plus class="h-4 w-4" />
                        Thêm NXB
                    </Button>
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
                v-else-if="publishers.length === 0"
                class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-14 text-center"
            >
                <Building2 class="mb-3 h-10 w-10 text-muted-foreground" />
                <p class="text-base font-medium">Chưa có nhà xuất bản nào</p>
                <p class="mt-1 text-sm text-muted-foreground">Nhấn "Thêm NXB" để tạo mới.</p>
            </div>

            <div v-else class="rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã NXB</TableHead>
                            <TableHead>Tên nhà xuất bản</TableHead>
                            <TableHead>Địa chỉ</TableHead>
                            <TableHead class="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="item in publishers" :key="item.MANXB">
                            <TableCell class="font-medium">{{ item.MANXB }}</TableCell>
                            <TableCell>{{ item.TENNXB }}</TableCell>
                            <TableCell>{{ item.DIACHI }}</TableCell>
                            <TableCell class="text-right">
                                <div class="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        @click="openEditDialog(item)"
                                    >
                                        <Pencil class="h-4 w-4" />
                                    </Button>
                                    <Button
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

            <PaginationBar :pagination="pagination" @change="fetchPublishers" />
        </div>

        <Dialog v-model:open="formDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{{
                        isEditing ? "Cập nhật NXB" : "Thêm nhà xuất bản"
                    }}</DialogTitle>
                    <DialogDescription>Nhập thông tin nhà xuất bản bên dưới.</DialogDescription>
                </DialogHeader>

                <Alert v-if="formError" variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ formError }}</AlertDescription>
                </Alert>

                <form class="space-y-4" @submit="onSubmit">
                    <FormField v-slot="{ componentField }" name="MANXB">
                        <FormItem>
                            <FormLabel>Mã NXB</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="NXB0001"
                                    :disabled="isEditing"
                                    v-bind="componentField"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="TENNXB">
                        <FormItem>
                            <FormLabel>Tên nhà xuất bản</FormLabel>
                            <FormControl>
                                <Input placeholder="NXB Kim Đồng" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="DIACHI">
                        <FormItem>
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                                <Input placeholder="Hà Nội" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <DialogFooter class="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            :disabled="isSubmitting"
                            @click="formDialogOpen = false"
                        >
                            Hủy
                        </Button>
                        <Button type="submit" :disabled="isSubmitting">
                            {{
                                isSubmitting
                                    ? "Đang lưu..."
                                    : isEditing
                                      ? "Lưu thay đổi"
                                      : "Tạo mới"
                            }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <ConfirmDialog
            v-model:open="deleteDialogOpen"
            title="Xác nhận xóa nhà xuất bản"
            :description="`Bạn có chắc chắn muốn xóa ${deletingItem?.TENNXB || ''} (${deletingItem?.MANXB || ''})?`"
            confirm-text="Xóa"
            :destructive="true"
            :loading="isDeleting"
            @confirm="confirmDelete"
        />
    </StaffLayout>
</template>
