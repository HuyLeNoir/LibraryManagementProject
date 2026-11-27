<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { AlertCircle, CheckCircle2, Pencil } from "@lucide/vue";
import { docGiaAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { formatDate } from "@/lib/utils";
import type { DocGia } from "@/types";
import AppLayout from "@/components/common/AppLayout.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const authStore = useAuthStore();
const profile = ref<DocGia | null>(null);
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const editDialogOpen = ref(false);
const formError = ref("");

const profileSchema = toTypedSchema(
    z.object({
        HOLOT: z.string().trim().min(1, "Vui lòng nhập họ lót"),
        TEN: z.string().trim().min(1, "Vui lòng nhập tên"),
        NGAYSINH: z.string().min(1, "Vui lòng chọn ngày sinh"),
        PHAI: z.string().min(1, "Vui lòng chọn phái"),
        DIACHI: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
        DIENTHOAI: z.string().trim().min(1, "Vui lòng nhập số điện thoại"),
    }),
);

const { handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: profileSchema,
});

async function fetchProfile() {
    if (!authStore.userId) return;
    isLoading.value = true;
    errorMessage.value = "";
    try {
        const res = await docGiaAPI.getById(authStore.userId);
        profile.value = res.data;
        authStore.updateUser(res.data);
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : "Không thể tải hồ sơ";
    } finally {
        isLoading.value = false;
    }
}

function openEditDialog() {
    if (!profile.value) return;
    formError.value = "";
    const formattedDate = profile.value.NGAYSINH
        ? new Date(profile.value.NGAYSINH).toISOString().slice(0, 10)
        : "";
    resetForm({
        values: {
            HOLOT: profile.value.HOLOT,
            TEN: profile.value.TEN,
            NGAYSINH: formattedDate,
            PHAI: profile.value.PHAI,
            DIACHI: profile.value.DIACHI,
            DIENTHOAI: profile.value.DIENTHOAI,
        },
    });
    editDialogOpen.value = true;
}

const onSubmit = handleSubmit(async (values) => {
    if (!profile.value) return;
    formError.value = "";
    successMessage.value = "";
    try {
        const res = await docGiaAPI.update(profile.value.MADOCGIA, values);
        profile.value = res.data;
        authStore.updateUser(res.data);
        editDialogOpen.value = false;
        successMessage.value = "Cập nhật hồ sơ thành công.";
    } catch (error) {
        formError.value = error instanceof Error ? error.message : "Cập nhật thất bại";
    }
});

onMounted(() => {
    fetchProfile();
});
</script>

<template>
    <AppLayout>
        <div class="mx-auto max-w-2xl space-y-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Hồ sơ độc giả</h1>
                    <p class="text-sm text-muted-foreground">Thông tin cá nhân của bạn trên hệ thống</p>
                </div>
                <Button v-if="profile" variant="outline" @click="openEditDialog">
                    <Pencil class="h-4 w-4" />
                    Chỉnh sửa
                </Button>
            </div>

            <Alert v-if="successMessage" class="border-emerald-200 bg-emerald-50 text-emerald-800">
                <CheckCircle2 class="h-4 w-4" />
                <AlertDescription>{{ successMessage }}</AlertDescription>
            </Alert>

            <Alert v-if="errorMessage" variant="destructive">
                <AlertCircle class="h-4 w-4" />
                <AlertDescription>{{ errorMessage }}</AlertDescription>
            </Alert>

            <Card v-if="isLoading" class="border-border bg-card shadow-none">
                <CardContent class="space-y-3 pt-6">
                    <Skeleton v-for="i in 5" :key="i" class="h-6 w-full" />
                </CardContent>
            </Card>

            <Card v-else-if="profile" class="border-border bg-card shadow-none">
                <CardHeader class="border-b border-border">
                    <CardTitle class="text-base font-semibold">
                        {{ profile.HOLOT }} {{ profile.TEN }} ({{ profile.MADOCGIA }})
                    </CardTitle>
                </CardHeader>
                <CardContent class="grid grid-cols-1 gap-4 pt-6 text-sm sm:grid-cols-2">
                    <div>
                        <p class="text-muted-foreground">Mã độc giả</p>
                        <p class="font-medium">{{ profile.MADOCGIA }}</p>
                    </div>
                    <div>
                        <p class="text-muted-foreground">Phái</p>
                        <p class="font-medium">{{ profile.PHAI }}</p>
                    </div>
                    <div>
                        <p class="text-muted-foreground">Ngày sinh</p>
                        <p class="font-medium">{{ formatDate(profile.NGAYSINH) }}</p>
                    </div>
                    <div>
                        <p class="text-muted-foreground">Số điện thoại</p>
                        <p class="font-medium">{{ profile.DIENTHOAI }}</p>
                    </div>
                    <div class="sm:col-span-2">
                        <p class="text-muted-foreground">Địa chỉ</p>
                        <p class="font-medium">{{ profile.DIACHI }}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Dialog v-model:open="editDialogOpen">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Cập nhật thông tin cá nhân</DialogTitle>
                    <DialogDescription>Chỉnh sửa thông tin độc giả và lưu thay đổi.</DialogDescription>
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

                    <DialogFooter class="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            :disabled="isSubmitting"
                            @click="editDialogOpen = false"
                        >
                            Hủy
                        </Button>
                        <Button type="submit" :disabled="isSubmitting">
                            {{ isSubmitting ? "Đang lưu..." : "Lưu thay đổi" }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>
