<script setup lang="ts">
import { RouterLink } from "vue-router";
import { FileQuestion } from "@lucide/vue";
import { Button } from "@/components/ui/button";
</script>

<template>
    <div class="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
            <FileQuestion class="h-6 w-6 text-foreground" />
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">404 - Không tìm thấy trang</h1>
        <p class="mt-2 max-w-md text-sm text-muted-foreground">
            Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.
        </p>
        <Button class="mt-6" as-child>
            <RouterLink to="/books">Về danh mục sách</RouterLink>
        </Button>
    </div>
</template>
