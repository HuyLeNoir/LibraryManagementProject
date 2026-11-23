# Backend API Documentation

This document describes the API routes currently mounted by the backend and highlights implementation mismatches that a Postman test run should report.

## Postman environment

Set these variables in the Postman environment:

| Variable      | Example                          | Description                                                                            |
| ------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| `baseUrl`     | `http://localhost:5000/api`      | API base URL. The server defaults to port `5000`; override it if `PORT` is configured. |
| `staffToken`  | (set from staff login response)  | JWT for endpoints requiring the `nhanvien` role.                                       |
| `readerToken` | (set from reader login response) | JWT for endpoints requiring the `docgia` role.                                         |
| `readerId`    | `DG0001`                         | A reader code present in the test database.                                            |
| `staffId`     | `NV0001`                         | A staff code present in the test database.                                             |
| `publisherId` | `NXB0001`                        | A publisher code present in the test database.                                         |
| `bookId`      | `S0001`                          | A book code present in the test database.                                              |

For protected requests, send:

```http
Authorization: Bearer {{staffToken}}
```

or use `{{readerToken}}` as appropriate. JSON endpoints use `Content-Type: application/json`.

## Response format

Successful requests generally return:

```json
{
    "success": true,
    "message": "Operation message",
    "data": {},
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
    }
}
```

`pagination` is included for list endpoints. Error responses are generally:

```json
{
    "success": false,
    "message": "Error message"
}
```

Common status codes: `200` success, `201` created, `400` invalid input, `401` missing/invalid authentication, `403` insufficient role, `404` not found, and `409` duplicate unique value.

## Authentication

| Method | Path           | Access | Purpose           |
| ------ | -------------- | ------ | ----------------- |
| `POST` | `/login`       | Public | Reader login      |
| `POST` | `/register`    | Public | Register a reader |
| `POST` | `/staff/login` | Public | Staff login       |

### `POST /login`

Request:

```json
{
    "MADOCGIA": "{{readerId}}",
    "Password": "reader-password"
}
```

On success, `data` contains `{ "user": ..., "role": "docgia", "token": "..." }`.

### `POST /register`

Request:

```json
{
    "MADOCGIA": "DG_POSTMAN_001",
    "HOLOT": "Nguyen Van",
    "TEN": "An",
    "NGAYSINH": "2000-01-15",
    "PHAI": "Nam",
    "DIACHI": "Can Tho",
    "DIENTHOAI": "0900000000"
}
```

The current controller returns `200` on success. `MADOCGIA` must be unique.

### `POST /staff/login`

Request:

```json
{
    "MSNV": "{{staffId}}",
    "Password": "staff-password"
}
```

On success, `data` contains `{ "user": ..., "role": "nhanvien", "token": "..." }`.

## Readers

| Method   | Path                                                          | Access          | Purpose                  |
| -------- | ------------------------------------------------------------- | --------------- | ------------------------ |
| `GET`    | `/docgia?page=1&limit=10&keyword=`                            | Staff           | List/search readers      |
| `POST`   | `/docgia`                                                     | Staff           | Create a reader          |
| `GET`    | `/docgia/:maDocGia`                                           | Reader or staff | Get reader by code       |
| `PUT`    | `/docgia/:maDocGia`                                           | Reader or staff | Update reader            |
| `DELETE` | `/docgia/:maDocGia`                                           | Staff           | Delete reader            |
| `GET`    | `/docgia/:maDocGia/danh-sach-muon?page=1&limit=10&tinhTrang=` | Reader          | Get a reader's loan list |

Reader fields: `MADOCGIA`, `HOLOT`, `TEN`, `NGAYSINH`, `PHAI`, `DIACHI`, `DIENTHOAI`. For `POST /docgia`, omit `MADOCGIA`; the service generates it.

Create example:

```json
{
    "HOLOT": "Nguyen Van",
    "TEN": "An",
    "NGAYSINH": "2000-01-15",
    "PHAI": "Nam",
    "DIACHI": "Can Tho",
    "DIENTHOAI": "0900000000"
}
```

For `PUT`, send one or more reader fields as a JSON object.

## Staff

| Method   | Path                                 | Access | Purpose           |
| -------- | ------------------------------------ | ------ | ----------------- |
| `GET`    | `/nhanvien?page=1&limit=10&keyword=` | Staff  | List/search staff |
| `POST`   | `/nhanvien`                          | Staff  | Create staff      |
| `GET`    | `/nhanvien/:msnv`                    | Staff  | Get staff by code |
| `PUT`    | `/nhanvien/:msnv`                    | Staff  | Update staff      |
| `DELETE` | `/nhanvien/:msnv`                    | Staff  | Delete staff      |

Create request:

```json
{
    "MSNV": "NV_POSTMAN_001",
    "HoTenNV": "Postman Test",
    "Password": "TestPass123",
    "ChucVu": "NhanVien",
    "DiaChi": "Can Tho",
    "SoDienThoai": "0900000001"
}
```

The create controller requires all fields; `Password` must be at least 8 characters and contain letters and digits. For `PUT`, send one or more of `HoTenNV`, `Password`, `ChucVu`, `DiaChi`, and `SoDienThoai`.

## Publishers

| Method   | Path                            | Access | Purpose                |
| -------- | ------------------------------- | ------ | ---------------------- |
| `GET`    | `/nxb?page=1&limit=10&keyword=` | Public | List/search publishers |
| `POST`   | `/nxb`                          | Staff  | Create publisher       |
| `GET`    | `/nxb/:manxb`                   | Public | Get publisher by code  |
| `PUT`    | `/nxb/:manxb`                   | Staff  | Update publisher       |
| `DELETE` | `/nxb/:manxb`                   | Staff  | Delete publisher       |

Publisher fields: `MANXB`, `TENNXB`, `DIACHI`.

Create example:

```json
{
    "MANXB": "NXB_POSTMAN_001",
    "TENNXB": "Postman Test Publisher",
    "DIACHI": "Can Tho"
}
```

## Books

| Method   | Path                             | Access | Purpose            |
| -------- | -------------------------------- | ------ | ------------------ |
| `GET`    | `/sach?page=1&limit=10&keyword=` | Public | List/search books  |
| `POST`   | `/sach`                          | Staff  | Create a book      |
| `GET`    | `/sach/:masach`                  | Public | Get a book by code |
| `PUT`    | `/sach/:masach`                  | Staff  | Update a book      |
| `DELETE` | `/sach/:masach`                  | Staff  | Delete a book      |

Book fields: `MASACH`, `TENSACH`, `DONGIA`, `SOQUYEN`, `NAMXUATBAN`, `MANXB`, `NGUONGOCTACGIA`.

Create example:

```json
{
    "MASACH": "S_POSTMAN_001",
    "TENSACH": "Postman Test Book",
    "DONGIA": 50000,
    "SOQUYEN": 5,
    "NAMXUATBAN": 2024,
    "MANXB": "{{publisherId}}",
    "NGUONGOCTACGIA": "Test Author"
}
```

## Loan tracking

| Method   | Path                                                          | Access          | Purpose                   |
| -------- | ------------------------------------------------------------- | --------------- | ------------------------- |
| `GET`    | `/theo-doi-muon-sach?page=1&limit=10&keyword=`                | Staff           | List/search loans         |
| `POST`   | `/theo-doi-muon-sach`                                         | Reader or staff | Create a loan             |
| `GET`    | `/theo-doi-muon-sach/:maDocGia/:MaSach`                       | Reader or staff | Get a loan                |
| `PUT`    | `/theo-doi-muon-sach/:maDocGia/:MaSach`                       | Staff           | Update a loan             |
| `DELETE` | `/theo-doi-muon-sach/:maDocGia/:MaSach`                       | Staff           | Delete a loan             |
| `GET`    | `/docgia/:maDocGia/danh-sach-muon?page=1&limit=10&tinhTrang=` | Reader          | List loans for the reader |

Create example:

```json
{
    "MADOCGIA": "{{readerId}}",
    "MASACH": "{{bookId}}",
    "NGAYMUON": "2026-11-23",
    "NGAYDUKIENTRA": "2026-11-30",
    "TINHTRANG": "Đang mượn"
}
```

The create payload does not include `NGAYTRA`. For updates, send one or more of `MADOCGIA`, `MASACH`, `NGAYMUON`, `NGAYDUKIENTRA`, `NGAYTRA`, and `TINHTRANG`.

## Known route/auth mismatches to verify

These are present in the current implementation. Include them as explicit findings in the test report rather than treating them as Postman setup errors:

1. **Reader tokens and reader-only routes:** the reader login token does not include `MSNV`, but authentication middleware requires `MSNV` for every token. Requests using `readerToken` on protected routes are therefore expected to fail with `401`.
2. **Reader profile routes:** the route declares `:maDocGia`, while the profile controller reads `madocgia`; get/update/delete may not receive the requested code correctly.
3. **Loan item routes:** the route declares `:MaSach`, while the controller reads `maSach`; get/update/delete may not receive the book code correctly.
4. **Loan list ownership check:** the controller checks `req.user.maDocGia`, but the declared JWT payload type and login service do not populate that claim.
5. **Expired loans:** a `GetExpired` controller exists, but no `/expired` route is registered.

## Suggested Postman test order

1. Verify the service is available with `GET {{baseUrl}}/nxb` (a public list endpoint).
2. Log in with a staff test account; save `data.token` as `staffToken`.
3. Use `staffToken` to test staff list/create/get/update/delete endpoints. Use unique test codes for create requests and clean up records after testing.
4. Test public publisher/book reads, then staff-protected writes.
5. Test reader login and save its token as `readerToken`; verify the reader-token behavior noted above.
6. Exercise loan list/create/item endpoints, including keyword search, and report route/auth mismatches separately.
