<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { AlertCircle, BookOpen, Pencil, Plus, Search, Trash2 } from "@lucide/vue";
import { nxbAPI, sachAPI } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import type { NhaXuatBan, Pagination, Sach } from "@/types";
import AppLayout from "@/components/common/AppLayout.vue";
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
import StaffLayout from "@/components/common/StaffLayout.vue";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const books = ref<Sach[]>([]);
const publishers = ref<NhaXuatBan[]>([]);
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
const keyword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const formDialogOpen = ref(false);
const isEditing = ref(false);
const formError = ref("");

const deleteDialogOpen = ref(false);
const deletingBook = ref<Sach | null>(null);
const isDeleting = ref(false);
const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
    /\/api$/,
    "",
);
const fileSchema = z
    .instanceof(File, { message: "Vui lòng chọn ảnh bìa sách" })
    .refine((file) => file.size <= MAX_FILE_SIZE, "Kích thước ảnh tối đa 5MB")
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Chỉ chấp nhận định dạng .jpg, .png, .webp",
    );
const bookSchema = computed(() => {
    toTypedSchema(
        z.object({
            MASACH: z.string().trim().min(1, "Vui lòng nhập mã sách"),
            TENSACH: z.string().trim().min(1, "Vui lòng nhập tên sách"),
            BIASACH: isEditing.value ? fileSchema.optional() : fileSchema,
            DONGIA: z.coerce.number().min(0, "Đơn giá không được âm"),
            SOQUYEN: z.coerce
                .number()
                .int("Số quyển phải là số nguyên")
                .min(0, "Số quyển không được âm"),
            NAMXUATBAN: z.coerce.number().int("Năm xuất bản phải là số nguyên"),
            MANXB: z.string().trim().min(1, "Vui lòng chọn nhà xuất bản"),
            NGUONGOCTACGIA: z.string().trim().min(1, "Vui lòng nhập nguồn gốc tác giả"),
        }),
    );
});

const { handleSubmit, isSubmitting, setFieldValue, resetForm } = useForm({
    validationSchema: bookSchema,
});
const previewUrl = ref<string | null>(null);

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
        // Gán trực tiếp object File vào vee-validate
        setFieldValue("BIASACH", file);
        previewUrl.value = URL.createObjectURL(file);
    }
}
async function fetchBooks(page = 1) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
        const res = await sachAPI.getAll({
            page,
            limit: pagination.value.limit,
            keyword: keyword.value.trim() || undefined,
        });
        books.value = res.data || [];
        if (res.pagination) pagination.value = res.pagination;
    } catch (error) {
        errorMessage.value =
            error instanceof Error ? error.message : "Không thể tải danh sách sách";
    } finally {
        isLoading.value = false;
    }
}

async function fetchPublishers() {
    try {
        const res = await nxbAPI.getAll({ page: 1, limit: 100 });
        publishers.value = res.data || [];
    } catch {
        // Ignore silent publisher prefetch error
    }
}

function openCreateDialog() {
    isEditing.value = false;
    formError.value = "";
    resetForm({
        values: {
            MASACH: "",
            TENSACH: "",
            DONGIA: 0,
            SOQUYEN: 1,
            NAMXUATBAN: new Date().getFullYear(),
            MANXB: publishers.value[0]?.MANXB || "",
            NGUONGOCTACGIA: "",
        },
    });
    formDialogOpen.value = true;
}

function openEditDialog(book: Sach) {
    isEditing.value = true;
    formError.value = "";
    resetForm({
        values: {
            MASACH: book.MASACH,
            TENSACH: book.TENSACH,
            DONGIA: book.DONGIA,
            SOQUYEN: book.SOQUYEN,
            NAMXUATBAN: book.NAMXUATBAN,
            MANXB: book.MANXB,
            NGUONGOCTACGIA: book.NGUONGOCTACGIA,
        },
    });
    previewUrl.value = book.BIASACH ? `${SERVER_URL}${book.BIASACH}` : null;
    console.log(previewUrl.value);
    formDialogOpen.value = true;
}

const onSubmit = handleSubmit(async (values) => {
    formError.value = "";
    try {
        const formData = new FormData();
        formData.append("MASACH", values.MASACH);
        formData.append("TENSACH", values.TENSACH);
        formData.append("DONGIA", String(values.DONGIA));
        formData.append("SOQUYEN", String(values.SOQUYEN));
        formData.append("NAMXUATBAN", String(values.NAMXUATBAN));
        formData.append("MANXB", values.MANXB);
        formData.append("NGUONGOCTACGIA", values.NGUONGOCTACGIA);

        // Chỉ đính kèm BIASACH nếu người dùng thực sự chọn File mới
        if (values.BIASACH instanceof File) {
            formData.append("BIASACH", values.BIASACH);
        }

        if (isEditing.value) {
            await sachAPI.update(values.MASACH, formData);
        } else {
            await sachAPI.create(formData);
        }

        formDialogOpen.value = false;
        await fetchBooks(pagination.value.page);
    } catch (error) {
        formError.value = error instanceof Error ? error.message : "Lưu sách thất bại";
    }
});

function openDeleteDialog(book: Sach) {
    deletingBook.value = book;
    deleteDialogOpen.value = true;
}

async function confirmDelete() {
    if (!deletingBook.value) return;
    isDeleting.value = true;
    try {
        await sachAPI.delete(deletingBook.value.MASACH);
        deleteDialogOpen.value = false;
        await fetchBooks(pagination.value.page);
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : "Xóa sách thất bại";
    } finally {
        isDeleting.value = false;
    }
}
function clearPreview() {
    if (previewUrl.value && previewUrl.value.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = null;
}

watch(formDialogOpen, (isOpen) => {
    if (!isOpen) {
        clearPreview();
        resetForm();
    }
});

onMounted(() => {
    fetchBooks(1);
    fetchPublishers();
});
</script>

<template>
    <StaffLayout>
        <div class="space-y-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Quản lý sách</h1>
                    <p class="text-sm text-muted-foreground">
                        Thêm, cập nhật và xóa đầu sách trong thư viện
                    </p>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <form class="flex gap-2" @submit.prevent="fetchBooks(1)">
                        <div class="relative w-full sm:w-64">
                            <Search
                                class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground"
                            />
                            <Input
                                v-model="keyword"
                                placeholder="Tìm mã, tên sách, tác giả..."
                                class="pl-8"
                            />
                        </div>
                        <Button type="submit" variant="outline">Tìm</Button>
                    </form>
                    <Button @click="openCreateDialog">
                        <Plus class="h-4 w-4" />
                        Thêm sách
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
                v-else-if="books.length === 0"
                class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-14 text-center"
            >
                <BookOpen class="mb-3 h-10 w-10 text-muted-foreground" />
                <p class="text-base font-medium">Chưa có sách nào</p>
                <p class="mt-1 text-sm text-muted-foreground">
                    Nhấn "Thêm sách" để tạo đầu sách mới.
                </p>
            </div>

            <div v-else class="rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã sách</TableHead>
                            <TableHead>Tên sách</TableHead>
                            <TableHead>Tác giả</TableHead>
                            <TableHead>NXB</TableHead>
                            <TableHead class="text-right">Đơn giá</TableHead>
                            <TableHead class="text-right">Số quyển</TableHead>
                            <TableHead class="text-right">Năm XB</TableHead>
                            <TableHead class="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="book in books" :key="book.MASACH">
                            <TableCell class="font-medium">{{ book.MASACH }}</TableCell>
                            <TableCell>{{ book.TENSACH }}</TableCell>
                            <TableCell>{{ book.NGUONGOCTACGIA }}</TableCell>
                            <TableCell>{{ book.TENNXB || book.MANXB }}</TableCell>
                            <TableCell class="text-right">{{
                                formatCurrency(book.DONGIA)
                            }}</TableCell>
                            <TableCell class="text-right">{{ book.SOQUYEN }}</TableCell>
                            <TableCell class="text-right">{{ book.NAMXUATBAN }}</TableCell>
                            <TableCell class="text-right">
                                <div class="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        @click="openEditDialog(book)"
                                    >
                                        <Pencil class="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        @click="openDeleteDialog(book)"
                                    >
                                        <Trash2 class="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <PaginationBar :pagination="pagination" @change="fetchBooks" />
        </div>

        <Dialog v-model:open="formDialogOpen">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{{ isEditing ? "Cập nhật sách" : "Thêm sách mới" }}</DialogTitle>
                    <DialogDescription>Nhập đầy đủ thông tin sách bên dưới.</DialogDescription>
                </DialogHeader>

                <Alert v-if="formError" variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ formError }}</AlertDescription>
                </Alert>

                <form class="space-y-4" @submit="onSubmit">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField v-slot="{ componentField }" name="MASACH">
                            <FormItem>
                                <FormLabel>Mã sách</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="S0001"
                                        :disabled="isEditing"
                                        v-bind="componentField"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="MANXB">
                            <FormItem>
                                <FormLabel>Nhà xuất bản</FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger class="w-full">
                                            <SelectValue placeholder="Chọn NXB" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem
                                            v-for="nxb in publishers"
                                            :key="nxb.MANXB"
                                            :value="nxb.MANXB"
                                        >
                                            {{ nxb.TENNXB }} ({{ nxb.MANXB }})
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <FormField v-slot="{ componentField }" name="TENSACH">
                        <FormItem>
                            <FormLabel>Tên sách</FormLabel>
                            <FormControl>
                                <Input placeholder="Doraemon Tập 1" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="NGUONGOCTACGIA">
                        <FormItem>
                            <FormLabel>Nguồn gốc / Tác giả</FormLabel>
                            <FormControl>
                                <Input placeholder="Fujiko F. Fujio" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FormField v-slot="{ componentField }" name="DONGIA">
                            <FormItem>
                                <FormLabel>Đơn giá</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="SOQUYEN">
                            <FormItem>
                                <FormLabel>Số quyển</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="NAMXUATBAN">
                            <FormItem>
                                <FormLabel>Năm xuất bản</FormLabel>
                                <FormControl>
                                    <Input type="number" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>
                    <FormField name="BIASACH">
                        <FormItem>
                            <FormLabel>Chọn ảnh bìa sách</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    class="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                                    @change="handleFileChange"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <div
                        v-if="previewUrl"
                        class="w-64 overflow-hidden rounded-md border border-border"
                    >
                        <img
                            :src="previewUrl"
                            alt="Preview bìa sách"
                            class="aspect-video w-full object-cover"
                        />
                    </div>

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
            title="Xác nhận xóa sách"
            :description="`Bạn có chắc chắn muốn xóa sách ${deletingBook?.TENSACH || ''} (${deletingBook?.MASACH || ''})?`"
            confirm-text="Xóa"
            :destructive="true"
            :loading="isDeleting"
            @confirm="confirmDelete"
        />
    </StaffLayout>
</template>
