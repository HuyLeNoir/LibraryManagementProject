<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

defineProps<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    loading?: boolean;
}>();

const emit = defineEmits<{
    (e: "update:open", value: boolean): void;
    (e: "confirm"): void;
}>();
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{{ title }}</DialogTitle>
                <DialogDescription>{{ description }}</DialogDescription>
            </DialogHeader>
            <DialogFooter class="gap-2 sm:gap-0">
                <Button
                    type="button"
                    variant="outline"
                    :disabled="loading"
                    @click="emit('update:open', false)"
                >
                    {{ cancelText || "Hủy" }}
                </Button>
                <Button
                    type="button"
                    :variant="destructive ? 'destructive' : 'default'"
                    :disabled="loading"
                    @click="emit('confirm')"
                >
                    {{ loading ? "Đang xử lý..." : confirmText || "Xác nhận" }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
