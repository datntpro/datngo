# DATNGO

Studio viết kỹ thuật của Dat Ngo — field notes về hạ tầng, bảo mật, GitOps và cách làm sản phẩm có trọng lượng.

Site công khai tập trung vào bài viết. Phía sau là CMS kiểu Ghost: editor TipTap, SEO lint, chấm bài bằng AI, media bằng URL ngoài (không lưu file trên server), newsletter Beehiiv.

## Trang công khai

- `/` — trang chủ editorial
- `/writing` — toàn bộ bài
- `/writing/:slug` — bài viết, mục lục, reading progress
- `/topics/:slug` — chuyên mục
- `/work` — việc đang làm
- `/about` — tiểu sử
- `/newsletter` — đăng ký thư (form nội bộ hoặc embed Beehiiv)
- `/rss.xml` — RSS

## Studio (CMS)

Vào `/studio` sau khi đăng nhập (Google / X).

- Soạn bài kiểu Ghost: tiêu đề lớn, excerpt, thanh công cụ, ảnh từ URL hoặc thư viện
- Tự lưu nháp, xuất bản / gỡ xuất bản
- Phân tích SEO (tiêu đề, meta, heading, keyword, alt)
- Chấm chất lượng bài bằng Grok (nút trong editor)
- Media catalog — chỉ lưu URL, alt, caption, credit
- Topics, newsletter Beehiiv embed, cài đặt site

Bài seed được claim bởi tài khoản Studio đầu tiên đăng nhập.

## Stack

TanStack Start, Postgres (Neon trên production, PGLite khi dev), Better Auth, TipTap, Beehiiv.

## Chạy local

```bash
npm install
npm run dev
```

Cần `DATABASE_URL` (Neon) khi deploy. `XAI_API_KEY` để chấm bài bằng AI. Auth credentials do môi trường triển khai inject.

Dán URL form Beehiiv trong Studio → Newsletter nếu muốn embed chính thức.
