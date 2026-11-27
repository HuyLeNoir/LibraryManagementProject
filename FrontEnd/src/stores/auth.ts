import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { DocGia, LoginResult, NhanVien, UserRole } from "@/types";

const TOKEN_KEY = "access_token";
const ROLE_KEY = "user_role";
const USER_KEY = "user_info";

function loadStoredUser(): DocGia | NhanVien | null {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? (JSON.parse(raw) as DocGia | NhanVien) : null;
    } catch {
        return null;
    }
}

export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
    const role = ref<UserRole | null>((localStorage.getItem(ROLE_KEY) as UserRole | null) || null);
    const user = ref<DocGia | NhanVien | null>(loadStoredUser());

    const isAuthenticated = computed(() => Boolean(token.value));
    const isStaff = computed(() => role.value === "nhanvien");
    const isReader = computed(() => role.value === "docgia");

    const userId = computed(() => {
        if (!user.value) return "";
        if ("MADOCGIA" in user.value) return user.value.MADOCGIA;
        if ("MSNV" in user.value) return user.value.MSNV;
        return "";
    });

    const displayName = computed(() => {
        if (!user.value) return "";
        if ("MADOCGIA" in user.value) return `${user.value.HOLOT} ${user.value.TEN}`.trim();
        if ("MSNV" in user.value) return user.value.HoTenNV;
        return "";
    });

    function setSession(result: LoginResult<DocGia | NhanVien>) {
        token.value = result.token;
        role.value = result.role;
        user.value = result.user;
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(ROLE_KEY, result.role);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    }

    function updateUser(updated: DocGia | NhanVien) {
        user.value = updated;
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }

    function logout() {
        token.value = null;
        role.value = null;
        user.value = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(USER_KEY);
    }

    return {
        token,
        role,
        user,
        isAuthenticated,
        isStaff,
        isReader,
        userId,
        displayName,
        setSession,
        updateUser,
        logout,
    };
});
