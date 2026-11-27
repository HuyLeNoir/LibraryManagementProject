<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { TinhTrangMuonSach } from "@/types";

const props = defineProps<{
    status: TinhTrangMuonSach | string;
}>();

const badgeClass = computed(() => {
    switch (props.status) {
        case TinhTrangMuonSach.DangChoDuyet:
            return "bg-amber-50 text-amber-700 border-amber-200";
        case TinhTrangMuonSach.ChoNhanSach:
            return "bg-sky-50 text-sky-700 border-sky-200";
        case TinhTrangMuonSach.DangMuon:
            return "bg-indigo-50 text-indigo-700 border-indigo-200";
        case TinhTrangMuonSach.DaTra:
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case TinhTrangMuonSach.DangMuonQuaThoiHan:
        case TinhTrangMuonSach.TraQuaThoiHan:
            return "bg-rose-50 text-rose-700 border-rose-200";
        case TinhTrangMuonSach.KhongDenNhanSach:
            return "bg-zinc-100 text-zinc-600 border-zinc-200";
        default:
            return "bg-muted text-muted-foreground border-border";
    }
});
</script>

<template>
    <Badge variant="outline" :class="['font-normal', badgeClass]">
        {{ status }}
    </Badge>
</template>
