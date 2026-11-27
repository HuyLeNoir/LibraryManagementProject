import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { UserRole } from "@/types";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/books",
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/LoginView.vue"),
        meta: { guestOnly: true },
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("@/views/RegisterView.vue"),
        meta: { guestOnly: true },
    },
    {
        path: "/books",
        name: "BookCatalog",
        component: () => import("@/views/BookCatalogView.vue"),
    },
    {
        path: "/my-borrows",
        name: "MyBorrows",
        component: () => import("@/views/MyBorrowsView.vue"),
        meta: { requiresAuth: true, roles: ["docgia"] as UserRole[] },
    },
    {
        path: "/profile",
        name: "Profile",
        component: () => import("@/views/ProfileView.vue"),
        meta: { requiresAuth: true, roles: ["docgia"] as UserRole[] },
    },
    {
        path: "/staff",
        redirect: "/staff/books",
    },
    {
        path: "/staff/books",
        name: "StaffBooks",
        component: () => import("@/views/StaffBooksView.vue"),
        meta: { requiresAuth: true, roles: ["nhanvien"] as UserRole[] },
    },
    {
        path: "/staff/publishers",
        name: "StaffPublishers",
        component: () => import("@/views/StaffPublishersView.vue"),
        meta: { requiresAuth: true, roles: ["nhanvien"] as UserRole[] },
    },
    {
        path: "/staff/readers",
        name: "StaffReaders",
        component: () => import("@/views/StaffReadersView.vue"),
        meta: { requiresAuth: true, roles: ["nhanvien"] as UserRole[] },
    },
    {
        path: "/staff/employees",
        name: "StaffEmployees",
        component: () => import("@/views/StaffEmployeesView.vue"),
        meta: { requiresAuth: true, roles: ["nhanvien"] as UserRole[] },
    },
    {
        path: "/staff/borrows",
        name: "StaffBorrows",
        component: () => import("@/views/StaffBorrowsView.vue"),
        meta: { requiresAuth: true, roles: ["nhanvien"] as UserRole[] },
    },
    {
        path: "/forbidden",
        name: "Forbidden",
        component: () => import("@/views/ForbiddenView.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/NotFoundView.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const authStore = useAuthStore();
    const requiresAuth = Boolean(to.meta.requiresAuth);
    const guestOnly = Boolean(to.meta.guestOnly);
    const allowedRoles = to.meta.roles as UserRole[] | undefined;

    if (guestOnly && authStore.isAuthenticated) {
        return authStore.isStaff ? "/staff/books" : "/books";
    }

    if (requiresAuth && !authStore.isAuthenticated) {
        return "/login";
    }

    if (allowedRoles && authStore.role && !allowedRoles.includes(authStore.role)) {
        return "/forbidden";
    }

    return true;
});

export default router;
