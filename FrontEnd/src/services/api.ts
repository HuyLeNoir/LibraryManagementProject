import type {
    ApiResponse,
    CreateDocGiaPayload,
    CreateMuonSachPayload,
    CreateNhanVienPayload,
    CreateNhaXuatBanPayload,
    DocGia,
    LoginDocGiaPayload,
    LoginNhanVienPayload,
    LoginResult,
    NhanVien,
    NhaXuatBan,
    Sach,
    TheoDoiMuonSach,
    TinhTrangMuonSach,
    UpdateDocGiaPayload,
    UpdateMuonSachPayload,
    UpdateNhanVienPayload,
    UpdateNhaXuatBanPayload,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...customConfig } = options;

    const url = new URL(`${BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                url.searchParams.append(key, String(value));
            }
        });
    }
    const isFormData = customConfig.body instanceof FormData;
    const token = localStorage.getItem("access_token");
    const response = await fetch(url.toString(), {
        ...customConfig,
        headers: {
            ...(!isFormData ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });

    let result: ApiResponse<unknown> | null = null;
    try {
        result = await response.json();
    } catch {
        // Response body is not JSON
    }

    if (!response.ok) {
        throw new Error(result?.message || `Đã xảy ra lỗi (${response.status})`);
    }

    return result as T;
}

export const authAPI = {
    loginDocGia: (payload: LoginDocGiaPayload) =>
        request<ApiResponse<LoginResult<DocGia>>>("/login", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    registerDocGia: (payload: CreateDocGiaPayload) =>
        request<ApiResponse<LoginResult<DocGia>>>("/register", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    loginNhanVien: (payload: LoginNhanVienPayload) =>
        request<ApiResponse<LoginResult<NhanVien>>>("/staff/login", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
};

export const sachAPI = {
    getAll: (params?: { page?: number; limit?: number; keyword?: string }) =>
        request<ApiResponse<Sach[]>>("/sach", { method: "GET", params }),

    getById: (masach: string) => request<ApiResponse<Sach>>(`/sach/${masach}`, { method: "GET" }),

    create: (payload: FormData) =>
        request<ApiResponse<Sach>>("/sach", {
            method: "POST",
            body: payload,
        }),

    update: (masach: string, payload: FormData) =>
        request<ApiResponse<Sach>>(`/sach/${masach}`, {
            method: "PUT",
            body: payload,
        }),

    delete: (masach: string) => request<ApiResponse<Sach>>(`/sach/${masach}`, { method: "DELETE" }),
};

export const nxbAPI = {
    getAll: (params?: { page?: number; limit?: number; keyword?: string }) =>
        request<ApiResponse<NhaXuatBan[]>>("/nxb", { method: "GET", params }),

    getById: (manxb: string) =>
        request<ApiResponse<NhaXuatBan>>(`/nxb/${manxb}`, { method: "GET" }),

    create: (payload: CreateNhaXuatBanPayload) =>
        request<ApiResponse<NhaXuatBan>>("/nxb", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    update: (manxb: string, payload: UpdateNhaXuatBanPayload) =>
        request<ApiResponse<NhaXuatBan>>(`/nxb/${manxb}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }),

    delete: (manxb: string) =>
        request<ApiResponse<NhaXuatBan>>(`/nxb/${manxb}`, { method: "DELETE" }),
};

export const docGiaAPI = {
    getAll: (params?: { page?: number; limit?: number; keyword?: string }) =>
        request<ApiResponse<DocGia[]>>("/docgia", { method: "GET", params }),

    getById: (maDocGia: string) =>
        request<ApiResponse<DocGia>>(`/docgia/${maDocGia}`, { method: "GET" }),

    create: (payload: CreateDocGiaPayload) =>
        request<ApiResponse<DocGia>>("/docgia", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    update: (maDocGia: string, payload: UpdateDocGiaPayload) =>
        request<ApiResponse<DocGia>>(`/docgia/${maDocGia}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }),

    delete: (maDocGia: string) =>
        request<ApiResponse<DocGia>>(`/docgia/${maDocGia}`, { method: "DELETE" }),

    getMyBorrows: (
        maDocGia: string,
        params?: { page?: number; limit?: number; tinhTrang?: TinhTrangMuonSach | string },
    ) =>
        request<ApiResponse<TheoDoiMuonSach[]>>(`/docgia/${maDocGia}/danh-sach-muon`, {
            method: "GET",
            params,
        }),
};

export const nhanVienAPI = {
    getAll: (params?: { page?: number; limit?: number; keyword?: string }) =>
        request<ApiResponse<NhanVien[]>>("/nhanvien", { method: "GET", params }),

    getById: (msnv: string) =>
        request<ApiResponse<NhanVien>>(`/nhanvien/${msnv}`, { method: "GET" }),

    create: (payload: CreateNhanVienPayload) =>
        request<ApiResponse<NhanVien>>("/nhanvien", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    update: (msnv: string, payload: UpdateNhanVienPayload) =>
        request<ApiResponse<NhanVien>>(`/nhanvien/${msnv}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }),

    delete: (msnv: string) =>
        request<ApiResponse<NhanVien>>(`/nhanvien/${msnv}`, { method: "DELETE" }),
};

export const muonSachAPI = {
    getAll: (params?: {
        page?: number;
        limit?: number;
        keyword?: string;
        tinhtrang?: TinhTrangMuonSach | string;
    }) => request<ApiResponse<TheoDoiMuonSach[]>>("/theo-doi-muon-sach", { method: "GET", params }),

    getById: (maDocGia: string, maSach: string) =>
        request<ApiResponse<TheoDoiMuonSach>>(`/theo-doi-muon-sach/${maDocGia}/${maSach}`, {
            method: "GET",
        }),

    create: (payload: CreateMuonSachPayload) =>
        request<ApiResponse<{ MADOCGIA: string; MASACH: string }>>("/theo-doi-muon-sach", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    update: (maDocGia: string, maSach: string, payload: UpdateMuonSachPayload) =>
        request<ApiResponse<TheoDoiMuonSach>>(`/theo-doi-muon-sach/${maDocGia}/${maSach}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }),
    approve: (maDocGia: string, maSach: string) =>
        request<ApiResponse<TheoDoiMuonSach>>(`/theo-doi-muon-sach/${maDocGia}/${maSach}/approve`, {
            method: "PUT",
        }),
    reject: (maDocGia: string, maSach: string) =>
        request<ApiResponse<TheoDoiMuonSach>>(`/theo-doi-muon-sach/${maDocGia}/${maSach}/reject`, {
            method: "PUT",
        }),
    receive: (maDocGia: string, maSach: string) =>
        request<ApiResponse<TheoDoiMuonSach>>(`/theo-doi-muon-sach/${maDocGia}/${maSach}/receive`, {
            method: "PUT",
        }),
    return: (maDocGia: string, maSach: string) =>
        request<ApiResponse<TheoDoiMuonSach>>(`/theo-doi-muon-sach/${maDocGia}/${maSach}/return`, {
            method: "PUT",
        }),
    delete: (maDocGia: string, maSach: string) =>
        request<ApiResponse<TheoDoiMuonSach>>(`/theo-doi-muon-sach/${maDocGia}/${maSach}`, {
            method: "DELETE",
        }),
};
