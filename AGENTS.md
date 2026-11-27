# AGENTS.md

Tài liệu hướng dẫn kiến trúc, quy chuẩn code và quy trình làm việc cho AI Coding Agents trong dự án này. **Bắt buộc đọc kỹ và tuân thủ toàn bộ quy tắc dưới đây trước khi tạo hoặc chỉnh sửa mã nguồn.**

---

## 1. Tech Stack

- **Package Manager:** `pnpm` (Tuyệt đối không dùng `npm` hoặc `yarn`, không tạo `package-lock.json` hay `yarn.lock`).
- **Frontend:** Vue 3 (`<script setup lang="ts">`), TypeScript, Vite, Tailwind CSS, `shadcn-vue`, `lucide-vue-next`, `vee-validate` + `zod`, Vue Router, Pinia.
- **Backend:** Node.js, Express.js, TypeScript.
- **Database:** MongoDB với Mongoose ODM.

---

## 2. Cấu trúc thư mục chuẩn

```text
project-root/
├── AGENTS.md                 # File quy tắc cho AI Agent
├── API_DOCS.md               # Tài liệu đặc tả API chuẩn giữa Frontend & Backend
├── frontend/
│   ├── components.json       # Cấu hình shadcn-vue
│   └── src/
│       ├── assets/           # CSS global, Tailwind config/variables
│       ├── components/
│       │   ├── ui/           # Component cài từ shadcn-vue (KHÔNG tự sửa logic lõi trừ khi cần)
│       │   └── common/       # Component dùng chung tự viết (Navbar, Sidebar, ConfirmDialog...)
│       ├── views/            # Các trang chính của ứng dụng (*View.vue)
│       ├── router/           # Cấu hình Vue Router & Navigation Guards
│       ├── services/
│       │   └── api.ts        # Nơi tập trung toàn bộ HTTP request & API modules
│       ├── types/            # TypeScript interfaces/types dùng chung
│       └── lib/
│           └── utils.ts      # Hàm tiện ích (cn(), formatters...)
└── backend/
    └── src/
        ├── config/           # Kết nối MongoDB, biến môi trường (env)
        ├── models/           # Mongoose Schemas & Model Interfaces
        ├── services/         # Business logic & truy vấn database
        ├── controllers/      # Nhận request, gọi service, trả về HTTP response
        ├── routes/           # Định nghĩa Express Router & gắn middleware
        ├── middlewares/      # Auth (JWT), validate request, error handler
        └── types/            # Request/Response DTOs & Express custom types
```

---

## 3. Quy tắc bắt buộc cho Frontend (`frontend/`)

### 3.1. UI Components (`shadcn-vue`) & Phong cách thiết kế

- **Luôn ưu tiên component từ `shadcn-vue`:** Khi cần UI component (Button, Input, Card, Dialog, Table, Select, Badge, Sheet, Tabs...), kiểm tra `src/components/ui/` trước. Nếu chưa có, cài đặt bằng CLI:
    ```bash
    pnpm dlx shadcn-vue@latest add <component-name>
    ```
    _(Lưu ý: Dùng `pnpm dlx shadcn-vue@latest add` để thêm UI component, chỉ dùng `pnpm add <package>` khi cài thư viện npm)._
- **Phong cách Flat Minimalism:**
    - Chỉ sử dụng màu trơn (solid colors) dựa trên semantic tokens của `shadcn-vue` (`bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`).
    - **Cấm sử dụng gradient màu mè** (không dùng `bg-gradient-to-*`, hiệu ứng phát sáng neon hay đổ bóng nặng).
    - Ưu tiên bố cục thoáng, phân tách khối bằng viền mỏng (`border`) và khoảng cách (`gap`, `p-*`) nhất quán.

### 3.2. Quản lý trang theo View (`src/views/`)

- Mọi trang (page) đều phải đặt trong `src/views/` và kết thúc bằng hậu tố `View.vue`.
    - Ví dụ: `LoginView.vue`, `RegisterView.vue`, `DashboardView.vue`, `BookListView.vue`, `NotFoundView.vue` (hoặc `404View.vue`).
- Cấu hình route trong `src/router/index.ts` sử dụng dynamic import (`() => import('@/views/...')`) và khai báo route catch-all `/:pathMatch(.*)*` trỏ về trang 404.
- Không nhồi nhét logic gọi API phức tạp hay form dài trực tiếp vào View nếu có thể tách thành sub-components theo tính năng.

### 3.3. Validate Form bằng `vee-validate` + `zod`

- **Tất cả form** (đăng nhập, đăng ký, tạo/sửa dữ liệu, bộ lọc phức tạp) bắt buộc validate bằng `vee-validate` kết hợp `zod` (`@vee-validate/zod`) và bộ component `Form` của `shadcn-vue`.
- Không tự viết các biến `errorMessage` thủ công bằng `ref('')` để kiểm tra dữ liệu nhập.
- Mẫu chuẩn:

    ```ts
    import { useForm } from "vee-validate";
    import { toTypedSchema } from "@vee-validate/zod";
    import * as z from "zod";

    const formSchema = toTypedSchema(
        z.object({
            email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
            password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
        }),
    );

    const { handleSubmit, isSubmitting } = useForm({
        validationSchema: formSchema,
    });
    ```

### 3.4. Giao tiếp Backend qua `src/services/api.ts`

- **Bắt buộc đọc `@/API_DOCS.md` trước khi viết hoặc sửa bất kỳ API call nào.** Không tự đoán đường dẫn endpoint, HTTP method hay tên trường dữ liệu.
- Tuyệt đối không gọi `fetch` hay `axios` trực tiếp bên trong file `.vue`.
- Toàn bộ request phải đi qua hàm `request<T>()` dùng chung và gom nhóm theo từng object module rõ ràng trong `src/services/api.ts`:

```ts
// frontend/src/services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
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

    const token = localStorage.getItem("access_token");
    const response = await fetch(url.toString(), {
        ...customConfig,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Đã xảy ra lỗi khi kết nối máy chủ");
    }

    return result;
}

// Gom nhóm API theo domain với đầy đủ Request/Response types
export const libraryAPI = {
    getBooks: (params?: { search?: string; page?: number; limit?: number }) =>
        request<ApiResponse<Book[]>>("/books", { method: "GET", params }),

    getBookById: (id: string) => request<ApiResponse<Book>>(`/books/${id}`, { method: "GET" }),

    createBook: (payload: CreateBookPayload) =>
        request<ApiResponse<Book>>("/books", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    updateBook: (id: string, payload: UpdateBookPayload) =>
        request<ApiResponse<Book>>(`/books/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }),

    deleteBook: (id: string) => request<ApiResponse<null>>(`/books/${id}`, { method: "DELETE" }),
};
```

---

## 4. Quy tắc bắt buộc cho Backend (`backend/`)

### 4.1. Kiến trúc phân lớp (Layered Architecture)

Tuân thủ nghiêm ngặt luồng dữ liệu một chiều: **`Route -> Controller -> Service -> Model`**.

1. **Model (`src/models/*.model.ts`):**
    - Định nghĩa Mongoose Schema, bật `{ timestamps: true }`, khai báo đầy đủ TypeScript interface cho Document.
    - Đánh `index` cho các trường thường xuyên tìm kiếm hoặc lọc.
2. **Service (`src/services/*.service.ts`):**
    - Chứa toàn bộ business logic và thao tác CRUD với Mongoose Model.
    - **Không** nhận `req` hoặc `res` của Express làm tham số; chỉ nhận dữ liệu thuần (DTO/primitives) và trả về dữ liệu hoặc ném lỗi (`throw new AppError(...)`).
3. **Controller (`src/controllers/*.controller.ts`):**
    - Trích xuất `req.body`, `req.params`, `req.query`, gọi hàm tương ứng từ Service.
    - Chuẩn hóa định dạng JSON trả về cho Frontend:
        ```json
        {
            "success": true,
            "data": {},
            "message": "Thao tác thành công"
        }
        ```
4. **Route (`src/routes/*.route.ts`):**
    - Khai báo URL endpoint, gắn middleware xác thực/phân quyền và chuyển tiếp vào Controller.

### 4.2. Đồng bộ tài liệu `API_DOCS.md`

- Bất cứ khi nào Agent thêm mới, sửa đổi hoặc xóa một endpoint ở Backend (đường dẫn, method, body, query params, response format), **bắt buộc cập nhật ngay phần tương ứng trong `API_DOCS.md`** trước khi chuyển sang code Frontend.

---

## 5. Quy chuẩn TypeScript & Chất lượng Code

- **Strict TypeScript:** Hạn chế tối đa `any`. Mọi payload gửi lên và dữ liệu trả về từ API đều phải có `interface` hoặc `type` rõ ràng.
- **Xử lý trạng thái UI đầy đủ:** Mỗi View gọi dữ liệu từ API phải xử lý đủ 3 trạng thái:
    1. `isLoading` (hiển thị `Skeleton` từ `shadcn-vue` hoặc spinner gọn nhẹ).
    2. `error` (hiển thị thông báo lỗi rõ ràng qua Toast hoặc Alert).
    3. `empty` (hiển thị trạng thái trống khi danh sách không có dữ liệu).
- **Clean Code:** Đặt tên biến/hàm rõ nghĩa theo tiếng Anh (`camelCase` cho biến/hàm, `PascalCase` cho Component/Type/Interface), nội dung hiển thị giao diện và thông báo lỗi cho người dùng viết bằng tiếng Việt tự nhiên.

---

## 6. Quy trình làm việc & Kiểm tra trước khi hoàn tất

1. **Bước 1:** Đọc `API_DOCS.md` và kiểm tra các file hiện có liên quan đến tính năng được yêu cầu.
2. **Bước 2:** Nếu thiếu component UI từ `shadcn-vue`, chạy lệnh `pnpm dlx shadcn-vue@latest add <component>` trước khi viết code giao diện.
3. **Bước 3:** Triển khai code theo đúng kiến trúc phân lớp (Backend) hoặc View + `api.ts` + `vee-validate` (Frontend).
4. **Bước 4:** Chạy kiểm tra lỗi biên dịch TypeScript trước khi kết thúc tác vụ:
    - Frontend: `pnpm build` hoặc `pnpm vue-tsc --noEmit`
    - Backend: `pnpm tsc --noEmit`
