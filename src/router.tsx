import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="kicker">404</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">Không tìm thấy trang.</h1>
        <p className="mt-3 text-muted">Đường dẫn này không còn hoặc chưa được xuất bản.</p>
        <a href="/" className="mt-6 inline-block font-mono text-xs tracking-[0.14em] uppercase text-forest">
          Về trang chủ
        </a>
      </div>
    </main>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}
