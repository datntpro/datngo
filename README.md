# DATNGO

Site viết kỹ thuật. Đọc tự do, không cần tài khoản. Studio chỉ dành cho người viết được mời.

## Ai được vào Studio?

- **Độc giả:** đọc mọi bài, đăng ký thư bằng email. Không đăng nhập.
- **Người lạ bấm /studio rồi login Google/X:** bị từ chối — không soạn được, không đụng được bài.
- **Admin:** tài khoản Studio đầu tiên (hoặc email trong `STUDIO_ADMIN_EMAIL`). Toàn quyền, mời thêm người.
- **Publisher:** email được admin mời. Soạn / ẩn / xóa bài, media. Không sửa cài đặt site.

## Stack

TanStack Start, Postgres, Better Auth (Google / X), TipTap, Cloudflare R2 cho file.

## Media

Dán URL, hoặc tải file lên R2 khi các biến sau được gắn lúc deploy:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

## Database: Neon, Supabase, Cloudflare

App nói **Postgres**. Preview không gắn `DATABASE_URL` thì dùng PGLite (Postgres WASM).

Neon được dùng vì môi trường này inject `DATABASE_URL` Postgres serverless (scale-to-zero, nhánh DB). Supabase free cũng là Postgres + thêm Auth/Storage sẵn — nếu trỏ `DATABASE_URL` sang Supabase thì schema hiện tại chạy được; không cần đổi code.

Cloudflare **D1** là SQLite, không phải Postgres. Đổi sang D1 nghĩa là viết lại SQL + Better Auth. Trên Cloudflare, đường native thực tế với codebase này:

- Workers (`npm run build:cf`) + `nodejs_compat`
- Postgres qua **Hyperdrive** (Neon, Supabase, hoặc Postgres bất kỳ) → `DATABASE_URL`
- **R2** cho ảnh
- CDN của Cloudflare cho static

`npm run build` mặc định vẫn ra Vercel.

## Env khi deploy

- `DATABASE_URL` — Postgres
- `STUDIO_ADMIN_EMAIL` — (tuỳ chọn) chỉ email này được nhận ghế admin đầu tiên
- `XAI_API_KEY` — chấm bài AI
- `R2_*` — tải file
- Auth secrets do nền tảng inject
