import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-sm">
        <p className="kicker">Studio</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">Vào bàn viết.</h1>
        <p className="mt-3 text-sm text-muted">
          Studio chỉ dành cho người được mời. Đọc bài không cần tài khoản. Muốn nhận bài qua email — đăng ký Thư, không cần đăng nhập.
        </p>
        <div className="mt-8 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant={p.providerId.includes("google") ? "default" : "outline"}
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/studio" })}
              >
                Tiếp tục với {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Đăng nhập đang tắt.</p>
          )}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 font-mono text-[11px] tracking-wide uppercase">
          <Link to="/" className="text-muted no-underline hover:text-ink">
            ← Trang chủ
          </Link>
          <Link to="/newsletter" className="text-muted no-underline hover:text-ink">
            Đăng ký thư
          </Link>
        </div>
      </div>
    </main>
  );
}
