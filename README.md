# E-commerce API (MVP)

RESTful API cho hệ thống thương mại điện tử, xây dựng bằng Node.js, Express 5, Prisma 7 và PostgreSQL.

## Yêu cầu
- Docker Desktop (chạy bằng Docker Compose), hoặc Node.js 22 và PostgreSQL 16 nếu chạy trực tiếp.

## Cấu hình
1. Sao chép `.env.example` thành `.env`.
2. Điền các giá trị:
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: thông tin PostgreSQL (mật khẩu chỉ gồm chữ và số).
   - `DATABASE_URL`: dùng khi chạy local, trỏ `localhost:5432`.
   - `JWT_SECRET`: chuỗi ngẫu nhiên từ 32 ký tự trở lên.
   - `JWT_EXPIRES_IN`: thời hạn token, ví dụ `1h`.
   - `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`: tài khoản admin được tạo khi khởi động.

## Chạy bằng Docker Compose
```
docker compose up -d --build
docker compose ps
```
Container `api` tự chạy migration, seed dữ liệu rồi khởi động server ở cổng `PORT`.

## Chạy local (không dùng container API)
```
docker compose up -d postgres
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Health check
`GET /health` trả `200` khi ứng dụng và database hoạt động, `503` khi mất kết nối database. Docker Compose dùng endpoint này để đánh dấu `healthy` / `unhealthy`.

## Xác thực và phân quyền
Đăng nhập nhận JWT, gửi kèm header `Authorization: Bearer <token>`.
Role: `CUSTOMER` (mặc định khi đăng ký), `ADMIN` (tạo sẵn bằng seed).

## Endpoint
| Method | Đường dẫn | Quyền |
|---|---|---|
| POST | /api/auth/register | công khai |
| POST | /api/auth/login | công khai |
| GET | /api/products, /api/products/:id | đã đăng nhập |
| POST, PUT, DELETE | /api/products, /api/products/:id | ADMIN |
| POST | /api/orders | đã đăng nhập |
| GET | /api/orders/:oid | chủ đơn hoặc ADMIN |
| POST, PATCH | /api/orders/:oid/shipment | ADMIN |
| GET | /health | công khai |

## Cơ sở dữ liệu
Gồm các bảng Role, MemberShip, User, Product, Order, OrderDetail, Shipment theo sơ đồ đính kèm đề bài.