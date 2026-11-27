<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { AlertCircle, BookOpen, CheckCircle2, Search, ToothbrushSparkles } from "@lucide/vue";
import { muonSachAPI, sachAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { formatCurrency } from "@/lib/utils";
import type { Pagination, Sach } from "@/types";
import AppLayout from "@/components/common/AppLayout.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

const authStore = useAuthStore();
const router = useRouter();

const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
    /\/api$/,
    "",
);

const books = ref<Sach[]>([]);
const latestBooks = ref<Sach[]>([]);
const currentLimit = ref(10);
const total = ref(999);
const keyword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const borrowDialogOpen = ref(false);
const selectedBook = ref<Sach | null>(null);
const isBorrowing = ref(false);
const borrowError = ref("");

// Theo dõi các ảnh bị lỗi tải để hiển thị fallback gọn gàng
const brokenImages = ref<Record<string, boolean>>({});

function getCoverUrl(path?: string) {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${SERVER_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function handleImageError(maSach: string) {
    brokenImages.value[maSach] = true;
}

async function fetchBooks(page = 1) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
        const res = await sachAPI.getAll({
            page,
            limit: currentLimit.value,
            keyword: keyword.value.trim() || undefined,
        });
        books.value = res.data || [];
        brokenImages.value = {};
        if (res.pagination) {
            currentLimit.value =
                res.pagination.total > 0 ? Math.min(currentLimit.value, res.pagination.total) : 10;
            total.value = res.pagination.total;
        }
        if (latestBooks.value.length === 0 && res.data.length > 0) {
            latestBooks.value = res.data.slice(0, 5);
        }
    } catch (error) {
        errorMessage.value =
            error instanceof Error ? error.message : "Không thể tải danh sách sách";
    } finally {
        isLoading.value = false;
    }
}

function handleSearch() {
    fetchBooks(1);
}

function openBorrowDialog(book: Sach) {
    if (!authStore.isAuthenticated) {
        router.push("/login");
        return;
    }
    selectedBook.value = book;
    borrowError.value = "";
    borrowDialogOpen.value = true;
}

async function confirmBorrow() {
    if (!selectedBook.value || !authStore.userId) return;
    isBorrowing.value = true;
    borrowError.value = "";
    successMessage.value = "";
    try {
        await muonSachAPI.create({
            MADOCGIA: authStore.userId,
            MASACH: selectedBook.value.MASACH,
        });
        borrowDialogOpen.value = false;
        successMessage.value = `Đã gửi yêu cầu mượn sách "${selectedBook.value.TENSACH}". Vui lòng chờ thủ thư duyệt.`;
        await fetchBooks(1);
    } catch (error) {
        borrowError.value =
            error instanceof Error ? error.message : "Không thể gửi yêu cầu mượn sách";
    } finally {
        isBorrowing.value = false;
    }
}

onMounted(() => {
    fetchBooks(1);
});
</script>

<template>
    <AppLayout>
        <div class="space-y-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Sách mới nhất</h1>
                </div>
            </div>
            <div class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card
                    v-for="book in latestBooks"
                    :key="book.MASACH"
                    class="flex flex-col justify-between overflow-hidden border-border bg-card pt-0 shadow-none"
                >
                    <div>
                        <!-- Khung ảnh bìa sách -->
                        <div
                            class="group relative aspect-3/4 w-full overflow-hidden border-b border-border bg-muted"
                        >
                            <img
                                v-if="book.BIASACH && !brokenImages[book.MASACH]"
                                :src="getCoverUrl(book.BIASACH)"
                                :alt="book.TENSACH"
                                loading="lazy"
                                class="h-full w-full object-cover group-hover:scale-105 transition-all ease-in-out duration-300"
                                @error="handleImageError(book.MASACH)"
                            />
                            <div
                                v-else
                                class="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground"
                            >
                                <BookOpen class="h-8 w-8 stroke-[1.5]" />
                                <span class="text-xs">Chưa có ảnh bìa</span>
                            </div>
                        </div>

                        <CardHeader class="space-y-2 pt-4">
                            <div class="flex items-start justify-between gap-2">
                                <span class="text-xs font-medium text-muted-foreground">
                                    {{ book.MASACH }}
                                </span>
                                <Badge
                                    variant="outline"
                                    :class="
                                        book.SOQUYEN > 0
                                            ? 'border-emerald-200 bg-emerald-50 font-normal text-emerald-700'
                                            : 'border-rose-200 bg-rose-50 font-normal text-rose-700'
                                    "
                                >
                                    {{
                                        book.SOQUYEN > 0 ? `Còn ${book.SOQUYEN} quyển` : "Hết sách"
                                    }}
                                </Badge>
                            </div>
                            <CardTitle class="line-clamp-2 text-base font-semibold leading-snug">
                                {{ book.TENSACH }}
                            </CardTitle>
                        </CardHeader>

                        <CardContent class="mt-3 space-y-1.5 text-sm text-muted-foreground">
                            <p>
                                Tác giả:
                                <span class="text-foreground">{{ book.NGUONGOCTACGIA }}</span>
                            </p>
                            <p>
                                Nhà xuất bản:
                                <span class="text-foreground">{{ book.TENNXB || book.MANXB }}</span>
                            </p>
                            <p>
                                Năm xuất bản:
                                <span class="text-foreground">{{ book.NAMXUATBAN }}</span>
                            </p>
                            <p>
                                Đơn giá:
                                <span class="font-medium text-foreground">
                                    {{ formatCurrency(book.DONGIA) }}
                                </span>
                            </p>
                        </CardContent>
                    </div>

                    <CardFooter class="mt-4 border-t border-border pt-4">
                        <Button
                            v-if="!authStore.isStaff"
                            class="w-full"
                            :disabled="book.SOQUYEN <= 0"
                            @click="openBorrowDialog(book)"
                        >
                            {{ book.SOQUYEN > 0 ? "Yêu cầu mượn sách" : "Tạm hết sách" }}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
        <div class="space-y-6 mt-15">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl font-semibold tracking-tight">Tất cả sách</h1>
                    <p class="text-sm text-muted-foreground">
                        Tìm kiếm và gửi yêu cầu mượn sách trực tuyến
                    </p>
                </div>

                <form class="flex w-full gap-2 sm:w-80" @submit.prevent="handleSearch">
                    <div class="relative flex-1">
                        <Search class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            v-model="keyword"
                            placeholder="Tìm tên sách, tác giả, mã..."
                            class="pl-8"
                        />
                    </div>
                    <Button type="submit" variant="outline">Tìm</Button>
                </form>
            </div>

            <Alert v-if="successMessage" class="border-emerald-200 bg-emerald-50 text-emerald-800">
                <CheckCircle2 class="h-4 w-4" />
                <AlertDescription>{{ successMessage }}</AlertDescription>
            </Alert>

            <Alert v-if="errorMessage" variant="destructive">
                <AlertCircle class="h-4 w-4" />
                <AlertDescription>{{ errorMessage }}</AlertDescription>
            </Alert>

            <div v-if="isLoading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card
                    v-for="i in 6"
                    :key="i"
                    class="overflow-hidden border-border bg-card pt-0 shadow-none"
                >
                    <Skeleton class="aspect-3/4 w-full rounded-none" />
                    <CardHeader class="space-y-2">
                        <Skeleton class="h-5 w-3/4" />
                        <Skeleton class="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent class="space-y-2">
                        <Skeleton class="h-4 w-full" />
                        <Skeleton class="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton class="h-9 w-full" />
                    </CardFooter>
                </Card>
            </div>

            <div
                v-else-if="books.length === 0"
                class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-14 text-center"
            >
                <BookOpen class="mb-3 h-10 w-10 text-muted-foreground" />
                <p class="text-base font-medium">Không tìm thấy sách nào</p>
                <p class="mt-1 text-sm text-muted-foreground">
                    Thử thay đổi từ khóa tìm kiếm hoặc quay lại sau.
                </p>
            </div>

            <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card
                    v-for="book in books"
                    :key="book.MASACH"
                    class="flex flex-col justify-between overflow-hidden border-border bg-card pt-0 shadow-none"
                >
                    <div>
                        <!-- Khung ảnh bìa sách -->
                        <div
                            class="group relative aspect-3/4 w-full overflow-hidden border-b border-border bg-muted"
                        >
                            <img
                                v-if="book.BIASACH && !brokenImages[book.MASACH]"
                                :src="getCoverUrl(book.BIASACH)"
                                :alt="book.TENSACH"
                                loading="lazy"
                                class="h-full w-full object-cover group-hover:scale-105 transition-all ease-in-out duration-300"
                                @error="handleImageError(book.MASACH)"
                            />
                            <div
                                v-else
                                class="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground"
                            >
                                <BookOpen class="h-8 w-8 stroke-[1.5]" />
                                <span class="text-xs">Chưa có ảnh bìa</span>
                            </div>
                        </div>

                        <CardHeader class="space-y-2 pt-4">
                            <div class="flex items-start justify-between gap-2">
                                <span class="text-xs font-medium text-muted-foreground">
                                    {{ book.MASACH }}
                                </span>
                                <Badge
                                    variant="outline"
                                    :class="
                                        book.SOQUYEN > 0
                                            ? 'border-emerald-200 bg-emerald-50 font-normal text-emerald-700'
                                            : 'border-rose-200 bg-rose-50 font-normal text-rose-700'
                                    "
                                >
                                    {{
                                        book.SOQUYEN > 0 ? `Còn ${book.SOQUYEN} quyển` : "Hết sách"
                                    }}
                                </Badge>
                            </div>
                            <CardTitle class="line-clamp-2 text-base font-semibold leading-snug">
                                {{ book.TENSACH }}
                            </CardTitle>
                        </CardHeader>

                        <CardContent class="mt-3 space-y-1.5 text-sm text-muted-foreground">
                            <p>
                                Tác giả:
                                <span class="text-foreground">{{ book.NGUONGOCTACGIA }}</span>
                            </p>
                            <p>
                                Nhà xuất bản:
                                <span class="text-foreground">{{ book.TENNXB || book.MANXB }}</span>
                            </p>
                            <p>
                                Năm xuất bản:
                                <span class="text-foreground">{{ book.NAMXUATBAN }}</span>
                            </p>
                            <p>
                                Đơn giá:
                                <span class="font-medium text-foreground">
                                    {{ formatCurrency(book.DONGIA) }}
                                </span>
                            </p>
                        </CardContent>
                    </div>

                    <CardFooter class="mt-4 border-t border-border pt-4">
                        <Button
                            v-if="!authStore.isStaff"
                            class="w-full"
                            :disabled="book.SOQUYEN <= 0"
                            @click="openBorrowDialog(book)"
                        >
                            {{ book.SOQUYEN > 0 ? "Yêu cầu mượn sách" : "Tạm hết sách" }}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Button
                v-if="currentLimit < total"
                size="sm"
                variant="outline"
                @click="
                    () => {
                        currentLimit += 10;
                        fetchBooks(1);
                    }
                "
            >
                Load more
            </Button>
        </div>

        <Dialog v-model:open="borrowDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Xác nhận mượn sách</DialogTitle>
                    <DialogDescription>
                        Gửi yêu cầu mượn sách đến thủ thư. Sách sẽ được giữ trong 24 giờ sau khi
                        duyệt.
                    </DialogDescription>
                </DialogHeader>

                <div
                    v-if="selectedBook"
                    class="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm"
                >
                    <div
                        class="h-20 w-16 shrink-0 overflow-hidden rounded border border-border bg-muted"
                    >
                        <img
                            v-if="selectedBook.BIASACH && !brokenImages[selectedBook.MASACH]"
                            :src="getCoverUrl(selectedBook.BIASACH)"
                            :alt="selectedBook.TENSACH"
                            class="h-full w-full object-cover"
                        />
                        <div
                            v-else
                            class="flex h-full w-full items-center justify-center text-muted-foreground"
                        >
                            <BookOpen class="h-5 w-5" />
                        </div>
                    </div>

                    <div class="space-y-1">
                        <p>
                            <span class="text-muted-foreground">Mã sách:</span>
                            {{ selectedBook.MASACH }}
                        </p>
                        <p>
                            <span class="text-muted-foreground">Tên sách:</span>
                            {{ selectedBook.TENSACH }}
                        </p>
                        <p>
                            <span class="text-muted-foreground">Tác giả:</span>
                            {{ selectedBook.NGUONGOCTACGIA }}
                        </p>
                        <p>
                            <span class="text-muted-foreground">Độc giả:</span>
                            {{ authStore.displayName }} ({{ authStore.userId }})
                        </p>
                    </div>
                </div>

                <Alert v-if="borrowError" variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ borrowError }}</AlertDescription>
                </Alert>

                <DialogFooter class="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        :disabled="isBorrowing"
                        @click="borrowDialogOpen = false"
                    >
                        Hủy
                    </Button>
                    <Button type="button" :disabled="isBorrowing" @click="confirmBorrow">
                        {{ isBorrowing ? "Đang gửi..." : "Xác nhận mượn" }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>
