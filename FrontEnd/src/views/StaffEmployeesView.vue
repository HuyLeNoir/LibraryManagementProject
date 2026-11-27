<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { AlertCircle, Pencil, Plus, Search, Trash2, UserCog } from "@lucide/vue";
import { nhanVienAPI } from "@/services/api";
import type { NhanVien, Pagination } from "@/types";
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

const employees = ref<NhanVien[]>([]);
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
const keyword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const formDialogOpen = ref(false);
const isEditing = ref(false);
const formError = ref("");

const deleteDialogOpen = ref(false);
const deletingItem = ref<NhanVien | null>(null);
const isDeleting = ref(false);

const employeeSchema = toTypedSchema(
    z
        .object({
            MSNV: z.string().trim().min(1, "Vui lòng nhập mã số nhân viên"),
            HoTenNV: z.string().trim().min(1, "Vui lòng nhập họ tên nhân viên"),
            ChucVu: z.string().trim().min(1, "Vui lòng nhập chức vụ"),
            DiaChi: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
            SoDienThoai: z.string().trim().min(1, "Vui lòng nhập số điện thoại"),
            Password: z.string().optional(),
        })
        .superRefine((val, ctx) => {
            if (!isEditing.value && (!val.Password || val.Password.length < 6)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["Password"],
                    message: "Mật khẩu tối thiểu 6 ký tự",
                });
            }
            if (
                isEditing.value &&
                val.Password &&
                val.Password.length > 0 &&
                val.Password.length < 6
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["Password"],
                    message: "Mật khẩu tối thiểu 6 ký tự",
                });
            }
        }),
);

const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: employeeSchema,
});

async function fetchEmployees(page = 1) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
        const res = await nhanVienAPI.getAll({
            page,
            limit: pagination.value.limit,
            keyword: keyword.value.trim() || undefined,
        });
        employees.value = res.data || [];
        if (res.pagination) pagination.value = res.pagination;
    } catch (error) {
        errorMessage.value =
            error instanceof Error ? error.message : "Không thể tải danh sách nhân viên";
    } finally {
        isLoading.value = false;
    }
}

function openCreateDialog() {
    isEditing.value = false;
    formError.value = "";
    resetForm({
        values: {
            MSNV: "",
            HoTenNV: "",
            ChucVu: "Thủ thư",
            DiaChi: "",
            SoDienThoai: "",
            Password: "",
        },
    });
    formDialogOpen.value = true;
}

function openEditDialog(item: NhanVien) {
    isEditing.value = true;
    formError.value = "";
    resetForm({
        values: {
            MSNV: item.MSNV,
            HoTenNV: item.HoTenNV,
            ChucVu: item.ChucVu,
            DiaChi: item.DiaChi,
            SoDienThoai: item.SoDienThoai,
            Password: "",
        },
    });
    formDialogOpen.value = true;
}

const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
        if (isEditing.value) {
            const { MSNV, ...rest } = values;
            if (!rest.Password) delete rest.Password;
            await nhanVienAPI.update(MSNV, rest);
        } else {
            await nhanVienAPI.create({
                ...values,
                Password: values.Password || "",
            });
        }
        formDialogOpen.value = false;
        await fetchEmployees(pagination.value.page);
    } catch (error) {
        formError.value = error instanceof Error ? error.message : "Lưu nhân viên thất bại";
    }
});

function openDeleteDialog(item: NhanVien) {
    deletingItem.value = item;
    deleteDialogOpen.value = true;
}

async function confirmDelete() {
    if (!deletingItem.value) return;
    isDeleting.value = true;
    try {
        await nhanVienAPI.delete(deletingItem.value.MSNV);
        deleteDialogOpen.value = false;
        await fetchEmployees(pagination.value.page);
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : "Xóa nhân viên thất bại";
    } finally {
        isDeleting.value = false;
    }
}

onMounted(() => {
    fetchEmployees(1);
});
</script>

<template>
    <StaffLayout>
        <div class="space-y-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Quản lý nhân viên</h1>
                    <p class="text-sm text-muted-foreground">
                        Quản lý tài khoản nhân viên thư viện
                    </p>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <form class="flex gap-2" @submit.prevent="fetchEmployees(1)">
                        <div class="relative w-full sm:w-64">
                            <Search
                                class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground"
                            />
                            <Input
                                v-model="keyword"
                                placeholder="Tìm MSNV hoặc họ tên..."
                                class="pl-8"
                            />
                        </div>
                        <Button type="submit" variant="outline">Tìm</Button>
                    </form>
                    <Button @click="openCreateDialog">
                        <Plus class="h-4 w-4" />
                        Thêm nhân viên
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
                v-else-if="employees.length === 0"
                class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-14 text-center"
            >
                <UserCog class="mb-3 h-10 w-10 text-muted-foreground" />
                <p class="text-base font-medium">Chưa có nhân viên nào</p>
            </div>

            <div v-else class="rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>MSNV</TableHead>
                            <TableHead>Họ tên</TableHead>
                            <TableHead>Chức vụ</TableHead>
                            <TableHead>Số điện thoại</TableHead>
                            <TableHead>Địa chỉ</TableHead>
                            <TableHead class="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="item in employees" :key="item.MSNV">
                            <TableCell class="font-medium">{{ item.MSNV }}</TableCell>
                            <TableCell>{{ item.HoTenNV }}</TableCell>
                            <TableCell>{{ item.ChucVu }}</TableCell>
                            <TableCell>{{ item.SoDienThoai }}</TableCell>
                            <TableCell>{{ item.DiaChi }}</TableCell>
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

            <PaginationBar :pagination="pagination" @change="fetchEmployees" />
        </div>

        <Dialog v-model:open="formDialogOpen">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{{
                        isEditing ? "Cập nhật nhân viên" : "Thêm nhân viên mới"
                    }}</DialogTitle>
                    <DialogDescription>Nhập thông tin nhân viên bên dưới.</DialogDescription>
                </DialogHeader>

                <Alert v-if="formError" variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ formError }}</AlertDescription>
                </Alert>

                <form class="space-y-4" @submit="onSubmit">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField v-slot="{ componentField }" name="MSNV">
                            <FormItem>
                                <FormLabel>Mã số nhân viên</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="NV0001"
                                        :disabled="isEditing"
                                        v-bind="componentField"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="ChucVu">
                            <FormItem>
                                <FormLabel>Chức vụ</FormLabel>
                                <FormControl>
                                    <Input placeholder="Thủ thư" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <FormField v-slot="{ componentField }" name="HoTenNV">
                        <FormItem>
                            <FormLabel>Họ tên nhân viên</FormLabel>
                            <FormControl>
                                <Input placeholder="Trần Thị B" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="SoDienThoai">
                        <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                                <Input placeholder="0911111111" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="DiaChi">
                        <FormItem>
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                                <Input placeholder="Cần Thơ" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="Password">
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
            title="Xác nhận xóa nhân viên"
            :description="`Bạn có chắc chắn muốn xóa nhân viên ${deletingItem?.HoTenNV || ''} (${deletingItem?.MSNV || ''})?`"
            confirm-text="Xóa"
            :destructive="true"
            :loading="isDeleting"
            @confirm="confirmDelete"
        />
    </StaffLayout>
</template>
