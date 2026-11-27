<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ShieldAlert } from "@lucide/vue";
import { Button } from "@/components/ui/button";
</script>

<template>
    <div class="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
            <ShieldAlert class="h-6 w-6 text-foreground" />
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">403 - Không có quyền truy cập</h1>
        <p class="mt-2 max-w-md text-sm text-muted-foreground">
            Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản phù hợp.
        </p>
        <div class="mt-6 flex gap-3">
            <Button variant="outline" as-child>
                <RouterLink to="/books">Về trang chủ</RouterLink>
            </Button>
            <Button as-child>
                <RouterLink to="/login">Đăng nhập</RouterLink>
            </Button>
        </div>
    </div>
</template>
