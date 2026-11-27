<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { AlertCircle, BookOpen } from "@lucide/vue";
import { authAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const router = useRouter();
const authStore = useAuthStore();
const apiError = ref("");

const registerSchema = toTypedSchema(
    z.object({
        HOLOT: z.string().trim().min(1, "Vui lòng nhập họ lót"),
        TEN: z.string().trim().min(1, "Vui lòng nhập tên"),
        NGAYSINH: z.string().min(1, "Vui lòng chọn ngày sinh"),
        PHAI: z.string().min(1, "Vui lòng chọn phái"),
        DIACHI: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
        DIENTHOAI: z.string().trim().min(1, "Vui lòng nhập số điện thoại"),
        PASSWORD: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    }),
);

const { handleSubmit, isSubmitting } = useForm({
    validationSchema: registerSchema,
    initialValues: {
        HOLOT: "",
        TEN: "",
        NGAYSINH: "",
        PHAI: "Nam",
        DIACHI: "",
        DIENTHOAI: "",
        PASSWORD: "",
    },
});

const onSubmit = handleSubmit(async (values) => {
    apiError.value = "";
    try {
        const res = await authAPI.registerDocGia(values);
        authStore.setSession(res.data);
        router.push("/books");
    } catch (error) {
        apiError.value = error instanceof Error ? error.message : "Đăng ký thất bại";
    }
});
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <Card class="w-full max-w-lg border-border bg-card shadow-none">
            <CardHeader class="space-y-1 text-center">
                <div class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                    <BookOpen class="h-5 w-5 text-foreground" />
                </div>
                <CardTitle class="text-xl font-semibold">Đăng ký tài khoản độc giả</CardTitle>
                <CardDescription>Mã độc giả sẽ được hệ thống cấp tự động sau khi đăng ký</CardDescription>
            </CardHeader>

            <CardContent class="space-y-4">
                <Alert v-if="apiError" variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ apiError }}</AlertDescription>
                </Alert>

                <form class="space-y-4" @submit="onSubmit">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField v-slot="{ componentField }" name="HOLOT">
                            <FormItem>
                                <FormLabel>Họ lót</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nguyễn Văn" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="TEN">
                            <FormItem>
                                <FormLabel>Tên</FormLabel>
                                <FormControl>
                                    <Input placeholder="An" v-bind="componentField" />
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
                                <Input placeholder="0900000000" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="DIACHI">
                        <FormItem>
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                                <Input placeholder="Cần Thơ" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="PASSWORD">
                        <FormItem>
                            <FormLabel>Mật khẩu</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Tối thiểu 6 ký tự" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <Button type="submit" class="w-full" :disabled="isSubmitting">
                        {{ isSubmitting ? "Đang đăng ký..." : "Đăng ký" }}
                    </Button>
                </form>
            </CardContent>

            <CardFooter class="justify-center border-t border-border pt-4 text-sm text-muted-foreground">
                Đã có tài khoản?
                <RouterLink to="/login" class="ml-1 font-medium text-foreground underline underline-offset-4">
                    Đăng nhập
                </RouterLink>
            </CardFooter>
        </Card>
    </div>
</template>
