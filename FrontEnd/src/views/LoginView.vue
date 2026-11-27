<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { BookOpen, AlertCircle } from "@lucide/vue";
import { authAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import type { LoginDocGiaPayload, LoginNhanVienPayload } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref<"docgia" | "nhanvien">("docgia");
const apiError = ref("");

const readerCredentialsSchema = z.object({
    MADOCGIA: z.string().trim().min(1, "Vui lòng nhập mã độc giả"),
    Password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
const readerSchema = toTypedSchema(
    readerCredentialsSchema,
);

const staffCredentialsSchema = z.object({
    MSNV: z.string().trim().min(1, "Vui lòng nhập mã số nhân viên"),
    Password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
const staffSchema = toTypedSchema(
    staffCredentialsSchema,
);

const onReaderSubmit = async (values: unknown) => {
    apiError.value = "";
    try {
        const payload: LoginDocGiaPayload = readerCredentialsSchema.parse(values);
        const res = await authAPI.loginDocGia(payload);
        authStore.setSession(res.data);
        router.push("/books");
    } catch (error) {
        apiError.value = error instanceof Error ? error.message : "Đăng nhập thất bại";
    }
};

const onStaffSubmit = async (values: unknown) => {
    apiError.value = "";
    try {
        const payload: LoginNhanVienPayload = staffCredentialsSchema.parse(values);
        const res = await authAPI.loginNhanVien(payload);
        authStore.setSession(res.data);
        router.push("/staff/books");
    } catch (error) {
        apiError.value = error instanceof Error ? error.message : "Đăng nhập thất bại";
    }
};
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <Card class="w-full max-w-md border-border bg-card shadow-none">
            <CardHeader class="space-y-1 text-center">
                <div
                    class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted"
                >
                    <BookOpen class="h-5 w-5 text-foreground" />
                </div>
                <CardTitle class="text-xl font-semibold">Đăng nhập hệ thống</CardTitle>
                <CardDescription>Chọn vai trò để tiếp tục truy cập thư viện</CardDescription>
            </CardHeader>

            <CardContent class="space-y-4">
                <Alert v-if="apiError" variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ apiError }}</AlertDescription>
                </Alert>

                <Tabs v-model="activeTab" class="w-full" @update:model-value="apiError = ''">
                    <TabsList class="grid w-full grid-cols-2">
                        <TabsTrigger value="docgia">Độc giả</TabsTrigger>
                        <TabsTrigger value="nhanvien">Nhân viên</TabsTrigger>
                    </TabsList>

                    <TabsContent value="docgia" class="pt-4">
                        <Form
                            :validation-schema="readerSchema"
                            :initial-values="{ MADOCGIA: '', Password: '' }"
                            class="space-y-4"
                            v-slot="{ isSubmitting }"
                            @submit="onReaderSubmit"
                        >
                            <FormField v-slot="{ componentField }" name="MADOCGIA">
                                <FormItem>
                                    <FormLabel>Mã độc giả</FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: DG0001" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="Password">
                                <FormItem>
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            v-bind="componentField"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <Button
                                type="submit"
                                class="w-full"
                                :disabled="isSubmitting"
                            >
                                {{
                                    isSubmitting ? "Đang đăng nhập..." : "Đăng nhập độc giả"
                                }}
                            </Button>
                        </Form>
                    </TabsContent>

                    <TabsContent value="nhanvien" class="pt-4">
                        <Form
                            :validation-schema="staffSchema"
                            :initial-values="{ MSNV: '', Password: '' }"
                            class="space-y-4"
                            v-slot="{ isSubmitting }"
                            @submit="onStaffSubmit"
                        >
                            <FormField v-slot="{ componentField }" name="MSNV">
                                <FormItem>
                                    <FormLabel>Mã số nhân viên</FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: NV0001" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="Password">
                                <FormItem>
                                    <FormLabel>Mật khẩu</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            v-bind="componentField"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <Button
                                type="submit"
                                class="w-full"
                                :disabled="isSubmitting"
                            >
                                {{
                                    isSubmitting ? "Đang đăng nhập..." : "Đăng nhập nhân viên"
                                }}
                            </Button>
                        </Form>
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter
                class="flex flex-col gap-2 border-t border-border pt-4 text-center text-sm text-muted-foreground"
            >
                <div>
                    Chưa có tài khoản độc giả?
                    <RouterLink
                        to="/register"
                        class="font-medium text-foreground underline underline-offset-4"
                    >
                        Đăng ký ngay
                    </RouterLink>
                </div>
                <RouterLink to="/books" class="text-xs hover:text-foreground">
                    Xem danh mục sách không cần đăng nhập
                </RouterLink>
            </CardFooter>
        </Card>
    </div>
</template>
