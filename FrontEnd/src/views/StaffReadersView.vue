<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { AlertCircle, Pencil, Plus, Search, Trash2, Users } from "@lucide/vue";
import { docGiaAPI } from "@/services/api";
import { formatDate } from "@/lib/utils";
import type { DocGia, Pagination } from "@/types";
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

const readers = ref<DocGia[]>([]);
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
const keyword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const formDialogOpen = ref(false);
const isEditing = ref(false);
const editingId = ref("");
const formError = ref("");

const deleteDialogOpen = ref(false);
const deletingItem = ref<DocGia | null>(null);
const isDeleting = ref(false);

const readerSchema = toTypedSchema(
    z
        .object({
            HOLOT: z.string().trim().min(1, "Vui lòng nhập họ lót"),
            TEN: z.string().trim().min(1, "Vui lòng nhập tên"),
            NGAYSINH: z.string().min(1, "Vui lòng chọn ngày sinh"),
            PHAI: z.string().min(1, "Vui lòng chọn phái"),
            DIACHI: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
            DIENTHOAI: z.string().trim().min(1, "Vui lòng nhập số điện thoại"),
            PASSWORD: z.string().optional(),
        })
        .superRefine((val, ctx) => {
            if (!isEditing.value && (!val.PASSWORD || val.PASSWORD.length < 6)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["PASSWORD"],
                    message: "Mật khẩu tối thiểu 6 ký tự",
                });
            }
            if (
                isEditing.value &&
                val.PASSWORD &&
                val.PASSWORD.length > 0 &&
                val.PASSWORD.length < 6
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["PASSWORD"],
                    message: "Mật khẩu tối thiểu 6 ký tự",
                });
            }
        }),
);

const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: readerSchema,
});

async function fetchReaders(page = 1) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
        const res = await docGiaAPI.getAll({
            page,
            limit: pagination.value.limit,
            keyword: keyword.value.trim() || undefined,
        });
        readers.value = res.data || [];
        if (res.pagination) pagination.value = res.pagination;
    } catch (error) {
        errorMessage.value =
            error instanceof Error ? error.message : "Không thể tải danh sách độc giả";
    } finally {
        isLoading.value = false;
    }
}

function openCreateDialog() {
    isEditing.value = false;
    editingId.value = "";
    formError.value = "";
    resetForm({
        values: {
            HOLOT: "",
            TEN: "",
            NGAYSINH: "",
            PHAI: "Nam",
            DIACHI: "",
            DIENTHOAI: "",
            PASSWORD: "",
        },
    });
    formDialogOpen.value = true;
}

function openEditDialog(item: DocGia) {
    isEditing.value = true;
    editingId.value = item.MADOCGIA;
    formError.value = "";
    const formattedDate = item.NGAYSINH ? new Date(item.NGAYSINH).toISOString().slice(0, 10) : "";
    resetForm({
        values: {
            HOLOT: item.HOLOT,
            TEN: item.TEN,
            NGAYSINH: formattedDate,
            PHAI: item.PHAI,
            DIACHI: item.DIACHI,
            DIENTHOAI: item.DIENTHOAI,
            PASSWORD: "",
        },
    });
    formDialogOpen.value = true;
}

const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
        if (isEditing.value) {
            const payload = { ...values };
            if (!payload.PASSWORD) delete payload.PASSWORD;
            await docGiaAPI.update(editingId.value, payload);
        } else {
            await docGiaAPI.create({
                ...values,
                PASSWORD: values.PASSWORD || "",
            });
        }
        formDialogOpen.value = false;
        await fetchReaders(pagination.value.page);
    } catch (error) {
        formError.value = error instanceof Error ? error.message : "Lưu độc giả thất bại";
    }
});

function openDeleteDialog(item: DocGia) {
    deletingItem.value = item;
    deleteDialogOpen.value = true;
}

async function confirmDelete() {
    if (!deletingItem.value) return;
    isDeleting.value = true;
    try {
        await docGiaAPI.delete(deletingItem.value.MADOCGIA);
        deleteDialogOpen.value = false;
        await fetchReaders(pagination.value.page);
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : "Xóa độc giả thất bại";
    } finally {
        isDeleting.value = false;
    }
}

onMounted(() => {
    fetchReaders(1);
});
</script>

<template>
    <StaffLayout>
        <div class="space-y-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Quản lý độc giả</h1>
                    <p class="text-sm text-muted-foreground">
                        Quản lý tài khoản và thông tin độc giả
                    </p>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <form class="flex gap-2" @submit.prevent="fetchReaders(1)">
                        <div class="relative w-full sm:w-64">
                            <Search
                                class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground"
                            />
                            <Input
                                v-model="keyword"
                                placeholder="Tìm mã hoặc tên độc giả..."
                                class="pl-8"
                            />
                        </div>
                        <Button type="submit" variant="outline">Tìm</Button>
                    </form>
                    <Button @click="openCreateDialog">
                        <Plus class="h-4 w-4" />
                        Thêm độc giả
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
                v-else-if="readers.length === 0"
                class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-14 text-center"
            >
                <Users class="mb-3 h-10 w-10 text-muted-foreground" />
                <p class="text-base font-medium">Chưa có độc giả nào</p>
            </div>

            <div v-else class="rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã ĐG</TableHead>
                            <TableHead>Họ và tên</TableHead>
                            <TableHead>Phái</TableHead>
                            <TableHead>Ngày sinh</TableHead>
                            <TableHead>Điện thoại</TableHead>
                            <TableHead>Địa chỉ</TableHead>
                            <TableHead class="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="item in readers" :key="item.MADOCGIA">
                            <TableCell class="font-medium">{{ item.MADOCGIA }}</TableCell>
                            <TableCell>{{ item.HOLOT }} {{ item.TEN }}</TableCell>
                            <TableCell>{{ item.PHAI }}</TableCell>
                            <TableCell>{{ formatDate(item.NGAYSINH) }}</TableCell>
                            <TableCell>{{ item.DIENTHOAI }}</TableCell>
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

            <PaginationBar :pagination="pagination" @change="fetchReaders" />
        </div>

        <Dialog v-model:open="formDialogOpen">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {{ isEditing ? `Cập nhật độc giả (${editingId})` : "Thêm độc giả mới" }}
                    </DialogTitle>
                    <DialogDescription>
                        {{
                            isEditing
                                ? "Cập nhật thông tin độc giả."
                                : "Mã độc giả sẽ được hệ thống tự động tạo."
                        }}
                    </DialogDescription>
                </DialogHeader>

                <Alert v-if="formError" variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ formError }}</AlertDescription>
                </Alert>

                <form class="space-y-4" @submit="onSubmit">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField v-slot="{ componentField }" name="HOLOT">
                            <FormItem>
                                <FormLabel>Họ lót</FormLabel>
                                <FormControl>
                                    <Input v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="TEN">
                            <FormItem>
                                <FormLabel>Tên</FormLabel>
                                <FormControl>
                                    <Input v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField v-slot="{ componentField }" name="NGAYSINH">
                            <FormItem>
                                <FormLabel>Ngày sinh</FormLabel>
                                <FormControl>
                                    <Input type="date" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="PHAI">
                            <FormItem>
                                <FormLabel>Phái</FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Chọn phái" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Nam">Nam</SelectItem>
                                        <SelectItem value="Nữ">Nữ</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <FormField v-slot="{ componentField }" name="DIENTHOAI">
                        <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                                <Input v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="DIACHI">
                        <FormItem>
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                                <Input v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="PASSWORD">
                        <FormItem>
                            <FormLabel>
                                {{
                                    isEditing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"
                                }}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Tối thiểu 6 ký tự"
                                    v-bind="componentField"
                                />
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
            title="Xác nhận xóa độc giả"
            :description="`Bạn có chắc chắn muốn xóa độc giả ${deletingItem?.HOLOT || ''} ${deletingItem?.TEN || ''} (${deletingItem?.MADOCGIA || ''})?`"
            confirm-text="Xóa"
            :destructive="true"
            :loading="isDeleting"
            @confirm="confirmDelete"
        />
    </StaffLayout>
</template>
