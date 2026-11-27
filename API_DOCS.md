# Backend API Documentation

Tài liệu đặc tả các API endpoint hiện có của hệ thống quản lý mượn sách thư viện.

## Base URL & Authentication

- **Base URL:** `http://localhost:5000/api` (có thể cấu hình qua biến môi trường `PORT`).
- **Headers:**
  - `Content-Type: application/json`
  - Với các endpoint yêu cầu xác thực: `Authorization: Bearer <token>`

## Response Format

### Thành công

```json
{
    "success": true,
    "message": "Thao tác thành công",
    "data": {},
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
    }
}
```

_(Trường `pagination` chỉ có ở các endpoint trả về danh sách phân trang)._

### Lỗi

```json
{
    "success": false,
    "message": "Thông báo lỗi"
}
```

Common status codes: `200` OK, `201` Created, `400` Bad Request (lỗi validate Zod / dữ liệu không hợp lệ), `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict (trùng lặp dữ liệu).

---

## 1. Authentication (`/api`)

| Method | Path           | Access | Mô tả                  |
| ------ | -------------- | ------ | ---------------------- |
| `POST` | `/login`       | Public | Đăng nhập độc giả      |
| `POST` | `/register`    | Public | Đăng ký tài khoản độc giả |
| `POST` | `/staff/login` | Public | Đăng nhập nhân viên    |

### `POST /login`
- **Body:**
  ```json
  {
      "MADOCGIA": "DG0001",
      "Password": "password123"
  }
  ```
- **Response `data`:** `{ "user": DocGia, "role": "docgia", "token": "..." }`

### `POST /register`
- **Body:** (`MADOCGIA` được hệ thống tự động sinh dạng `DG0001`, ...)
  ```json
  {
      "HOLOT": "Nguyễn Văn",
      "TEN": "An",
      "NGAYSINH": "2000-01-15",
      "PHAI": "Nam",
      "DIACHI": "Cần Thơ",
      "DIENTHOAI": "0900000000",
      "PASSWORD": "password123"
  }
  ```
- **Response `data`:** `{ "user": DocGia, "role": "docgia", "token": "..." }`

### `POST /staff/login`
- **Body:**
  ```json
  {
      "MSNV": "NV0001",
      "Password": "password123"
  }
  ```
- **Response `data`:** `{ "user": NhanVien, "role": "nhanvien", "token": "..." }`

---

## 2. Độc Giả (`/api/docgia`)

| Method   | Path                          | Access               | Mô tả                                  |
| -------- | ----------------------------- | -------------------- | -------------------------------------- |
| `GET`    | `/`                           | `nhanvien`           | Lấy danh sách độc giả (phân trang)     |
| `POST`   | `/`                           | `nhanvien`           | Tạo mới độc giả                        |
| `GET`    | `/:maDocGia`                  | `docgia`, `nhanvien` | Lấy thông tin độc giả theo mã          |
| `PUT`    | `/:maDocGia`                  | `docgia`, `nhanvien` | Cập nhật thông tin độc giả             |
| `DELETE` | `/:maDocGia`                  | `nhanvien`           | Xóa độc giả                            |
| `GET`    | `/:maDocGia/danh-sach-muon`   | `docgia`             | Độc giả xem danh sách mượn của bản thân |

- **Query params (`GET /`):** `page` (default `1`), `limit` (default `10`), `keyword` (tìm theo `MADOCGIA` hoặc `TEN`).
- **Query params (`GET /:maDocGia/danh-sach-muon`):** `page`, `limit`, `tinhTrang` (optional, lọc theo `TinhTrangMuonSach`).
- **Body (`POST /`):** Giống `POST /register` (`HOLOT`, `TEN`, `NGAYSINH`, `PHAI`, `DIACHI`, `DIENTHOAI`, `PASSWORD`).
- **Body (`PUT /:maDocGia`):** Partial của `POST /` (ít nhất 1 trường).

---

## 3. Nhân Viên (`/api/nhanvien`)

| Method   | Path     | Access     | Mô tả                             |
| -------- | -------- | ---------- | --------------------------------- |
| `GET`    | `/`      | `nhanvien` | Lấy danh sách nhân viên (phân trang) |
| `POST`   | `/`      | `nhanvien` | Tạo mới nhân viên                 |
| `GET`    | `/:msnv` | `nhanvien` | Lấy thông tin nhân viên theo MSNV |
| `PUT`    | `/:msnv` | `nhanvien` | Cập nhật thông tin nhân viên      |
| `DELETE` | `/:msnv` | `nhanvien` | Xóa nhân viên                     |

- **Query params (`GET /`):** `page`, `limit`, `keyword` (tìm theo `MSNV` hoặc `HoTenNV`).
- **Body (`POST /`):**
  ```json
  {
      "MSNV": "NV0001",
      "HoTenNV": "Trần Thị B",
      "ChucVu": "Thủ thư",
      "DiaChi": "Cần Thơ",
      "SoDienThoai": "0911111111",
      "Password": "password123"
  }
  ```
- **Body (`PUT /:msnv`):** Partial của `HoTenNV`, `ChucVu`, `DiaChi`, `SoDienThoai`, `Password` (ít nhất 1 trường).

---

## 4. Nhà Xuất Bản (`/api/nxb`)

| Method   | Path      | Access     | Mô tả                                  |
| -------- | --------- | ---------- | -------------------------------------- |
| `GET`    | `/`       | Public     | Lấy danh sách nhà xuất bản (phân trang) |
| `POST`   | `/`       | `nhanvien` | Tạo mới nhà xuất bản                   |
| `GET`    | `/:manxb` | Public     | Lấy thông tin nhà xuất bản theo mã     |
| `PUT`    | `/:manxb` | `nhanvien` | Cập nhật thông tin nhà xuất bản        |
| `DELETE` | `/:manxb` | `nhanvien` | Xóa nhà xuất bản                       |

- **Query params (`GET /`):** `page`, `limit`, `keyword` (tìm theo `MANXB` hoặc `TENNXB`).
- **Body (`POST /`):**
  ```json
  {
      "MANXB": "NXB0001",
      "TENNXB": "NXB Kim Đồng",
      "DIACHI": "Hà Nội"
  }
  ```
- **Body (`PUT /:manxb`):** Partial của `POST /` (ít nhất 1 trường).

---

## 5. Sách (`/api/sach`)

| Method   | Path       | Access     | Mô tả                         |
| -------- | ---------- | ---------- | ----------------------------- |
| `GET`    | `/`        | Public     | Lấy danh sách sách (phân trang) |
| `POST`   | `/`        | `nhanvien` | Tạo mới sách                  |
| `GET`    | `/:masach` | Public     | Lấy thông tin sách theo mã    |
| `PUT`    | `/:masach` | `nhanvien` | Cập nhật thông tin sách       |
| `DELETE` | `/:masach` | `nhanvien` | Xóa sách                      |

- **Query params (`GET /`):** `page`, `limit`, `keyword` (tìm theo `MASACH`, `TENSACH`, `NGUONGOCTACGIA`).
- **Body (`POST /`):**
  ```json
  {
      "MASACH": "S0001",
      "TENSACH": "Doraemon Tập 1",
      "DONGIA": 25000,
      "SOQUYEN": 10,
      "NAMXUATBAN": 2020,
      "MANXB": "NXB0001",
      "NGUONGOCTACGIA": "Fujiko F. Fujio"
  }
  ```
- **Body (`PUT /:masach`):** Partial của `POST /` (ít nhất 1 trường).

---

## 6. Theo Dõi Mượn Sách (`/api/theo-doi-muon-sach`)

| Method   | Path                 | Access               | Mô tả                                  |
| -------- | -------------------- | -------------------- | -------------------------------------- |
| `GET`    | `/`                  | `nhanvien`           | Lấy danh sách phiếu mượn (phân trang)  |
| `POST`   | `/`                  | `docgia`, `nhanvien` | Tạo yêu cầu mượn sách (trừ `SOQUYEN`)  |
| `GET`    | `/:maDocGia/:maSach` | `nhanvien`, `docgia` | Lấy chi tiết phiếu mượn                |
| `PUT`    | `/:maDocGia/:maSach` | `nhanvien`           | Cập nhật thông tin phiếu mượn          |
| `DELETE` | `/:maDocGia/:maSach` | `nhanvien`           | Xóa phiếu mượn                         |

- **Query params (`GET /`):** `page`, `limit`, `keyword` (tìm theo `MASACH`, `MADOCGIA`, `TENSACH`, `TENDOCGIA`), `tinhTrang` (lọc theo `TinhTrangMuonSach`).
- **Body (`POST /`):**
  ```json
  {
      "MADOCGIA": "DG0001",
      "MASACH": "S0001"
  }
  ```
- **Body (`PUT /:maDocGia/:maSach`):** Partial của `TheoDoiMuonSach` (`TINHTRANG`, `NGAYDUYET`, `NGAYMUON`, `NGAYTRA`, `NGAYDUKIENTRA`, `TIENPHAT`, ... - ít nhất 1 trường).
