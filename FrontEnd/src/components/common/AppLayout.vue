<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { BookOpen, Building2, ClipboardList, LogOut, User, Users, UserCog } from "@lucide/vue";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const navItems = computed(() => {
    if (authStore.isStaff) {
        return [
            { to: "/staff/books", label: "Sách", icon: BookOpen },
            { to: "/staff/publishers", label: "Nhà xuất bản", icon: Building2 },
            { to: "/staff/borrows", label: "Mượn sách", icon: ClipboardList },
            { to: "/staff/readers", label: "Độc giả", icon: Users },
            { to: "/staff/employees", label: "Nhân viên", icon: UserCog },
        ];
    }

    const items = [];
    if (authStore.isReader) {
        items.push(
            { to: "/my-borrows", label: "Phiếu mượn của tôi", icon: ClipboardList },
            { to: "/profile", label: "Hồ sơ", icon: User },
        );
    }
    return items;
});

function handleLogout() {
    authStore.logout();
    router.push("/login");
}
</script>

<template>
    <div class="min-h-screen bg-background text-foreground">
        <header class="sticky top-0 z-30 border-b border-border bg-card">
            <div
                class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
            >
                <div class="flex items-center gap-6">
                    <RouterLink
                        :to="authStore.isStaff ? '/staff/books' : '/books'"
                        class="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
                    >
                        <BookOpen class="h-5 w-5" />
                        <span>Thư Viện</span>
                    </RouterLink>
                </div>

                <div class="flex items-center gap-3">
                    <template v-if="authStore.isAuthenticated">
                        <nav
                            class="flex items-center gap-1 overflow-x-auto border-border px-4 py-2"
                        >
                            <RouterLink
                                v-for="item in navItems"
                                :key="item.to"
                                :to="item.to"
                                :class="[
                                    'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                    route.path === item.to
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                ]"
                            >
                                <component :is="item.icon" class="h-3.5 w-3.5" />
                                <span>{{ item.label }}</span>
                            </RouterLink>
                            <Button variant="outline" size="xs" @click="handleLogout">
                                <LogOut class="h-4 w-4" />
                                <span class="hidden sm:inline">Đăng xuất</span>
                            </Button>
                        </nav>
                    </template>
                    <template v-else>
                        <Button variant="outline" size="sm" as-child>
                            <RouterLink to="/login">Đăng nhập</RouterLink>
                        </Button>
                        <Button size="sm" as-child>
                            <RouterLink to="/register">Đăng ký</RouterLink>
                        </Button>
                    </template>
                </div>
            </div>
        </header>

        <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <slot />
        </main>
    </div>
</template>
