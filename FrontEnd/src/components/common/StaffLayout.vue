<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
    BookOpen,
    Building2,
    ClipboardList,
    LogOut,
    User,
    Users,
    UserCog,
    ChartColumn,
} from "@lucide/vue";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const dashboardItems = [{ to: "/staff/dashboard", label: "Admin Dashboard", icon: ChartColumn }];
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
    <SidebarProvider v-if="authStore.isAuthenticated">
        <!-- 1. Sidebar nằm bên trái (con trực tiếp của SidebarProvider) -->
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" as-child>
                            <RouterLink :to="authStore.isStaff ? '/staff/books' : '/books'">
                                <div
                                    class="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
                                >
                                    <BookOpen class="size-4" />
                                </div>
                                <span class="truncate font-semibold">Thư Viện</span>
                            </RouterLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Dashoard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem v-for="item in dashboardItems" :key="item.to">
                                <SidebarMenuButton
                                    as-child
                                    :is-active="route.path === item.to"
                                    :tooltip="item.label"
                                >
                                    <RouterLink :to="item.to">
                                        <component :is="item.icon" />
                                        <span>{{ item.label }}</span>
                                    </RouterLink>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Danh mục</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem v-for="item in navItems" :key="item.to">
                                <SidebarMenuButton
                                    as-child
                                    :is-active="route.path === item.to"
                                    :tooltip="item.label"
                                >
                                    <RouterLink :to="item.to">
                                        <component :is="item.icon" />
                                        <span>{{ item.label }}</span>
                                    </RouterLink>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarTrigger class="cursor-pointer" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Đăng xuất" @click="handleLogout">
                            <LogOut />
                            <span>Đăng xuất</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>

        <!-- 2. Toàn bộ phần bên phải nằm gọn trong SidebarInset -->
        <SidebarInset>
            <!-- <header
                class="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6"
            >
                <div class="flex items-center gap-3">
                    <SidebarTrigger class="-ml-1" />
                    <div class="h-4 w-px bg-border" />
                    <span class="text-sm font-medium text-foreground">
                        {{ navItems.find((i) => i.to === route.path)?.label || "Thư Viện" }}
                    </span>
                </div>

                <Button variant="outline" size="sm" @click="handleLogout">
                    <LogOut class="h-4 w-4" />
                    <span class="hidden sm:inline">Đăng xuất</span>
                </Button>
            </header> -->

            <main class="flex-1 px-4 py-6 sm:px-6">
                <div class="mx-auto max-w-7xl">
                    <slot />
                </div>
            </main>
        </SidebarInset>
    </SidebarProvider>

    <div v-else class="min-h-screen bg-background text-foreground">
        <header class="sticky top-0 z-30 border-b border-border bg-card">
            <div
                class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
            >
                <RouterLink
                    to="/books"
                    class="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
                >
                    <BookOpen class="h-5 w-5" />
                    <span>Thư Viện</span>
                </RouterLink>

                <div class="flex items-center gap-2">
                    <Button variant="outline" size="sm" as-child>
                        <RouterLink to="/login">Đăng nhập</RouterLink>
                    </Button>
                    <Button size="sm" as-child>
                        <RouterLink to="/register">Đăng ký</RouterLink>
                    </Button>
                </div>
            </div>
        </header>

        <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <slot />
        </main>
    </div>
</template>
