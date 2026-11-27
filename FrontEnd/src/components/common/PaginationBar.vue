<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import type { Pagination } from "@/types";

const props = defineProps<{
    pagination: Pagination;
}>();

const emit = defineEmits<{
    (e: "change", page: number): void;
}>();

function goTo(page: number) {
    if (page < 1 || page > props.pagination.totalPages) return;
    emit("change", page);
}
</script>

<template>
    <div
        v-if="pagination.total > 0"
        class="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
        <p class="text-sm text-muted-foreground">
            Trang <span class="font-medium text-foreground">{{ pagination.page }}</span> /
            <span class="font-medium text-foreground">{{ Math.max(1, pagination.totalPages) }}</span>
            ({{ pagination.total }} kết quả)
        </p>
        <div class="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                :disabled="pagination.page <= 1"
                @click="goTo(pagination.page - 1)"
            >
                <ChevronLeft class="h-4 w-4" />
                Trước
            </Button>
            <Button
                variant="outline"
                size="sm"
                :disabled="pagination.page >= pagination.totalPages"
                @click="goTo(pagination.page + 1)"
            >
                Sau
                <ChevronRight class="h-4 w-4" />
            </Button>
        </div>
    </div>
</template>
