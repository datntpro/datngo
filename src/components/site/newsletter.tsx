import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/lib/cms/public";
import type { SiteSettings } from "@/lib/cms/types";

export function NewsletterForm({
  settings,
  source = "site",
  compact = false,
}: {
  settings: SiteSettings;
  source?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");
  const embed = settings.beehiivEmbedUrl;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await subscribeNewsletter({ data: { email, source } });
    if (res.ok) {
      setState("ok");
      setMessage("Đã ghi nhận. Số tới sẽ gửi khi có bài mới.");
      setEmail("");
    } else {
      setState("err");
      setMessage(res.error);
    }
  }

  return (
    <div className={compact ? "" : "border border-rule bg-paper-raised p-6 sm:p-8"}>
      {!compact ? (
        <>
          <p className="kicker">Newsletter · Beehiiv</p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight">Gửi vào hộp thư, không phải feed.</h2>
          <p className="mt-3 max-w-md text-muted">
            Một bài khi chắc. Không hype cycle. Có thể dán form Beehiiv trong Studio → Newsletter.
          </p>
        </>
      ) : null}

      {embed ? (
        <div className={compact ? "" : "mt-6"}>
          <iframe
            src={embed}
            title="Đăng ký newsletter"
            className="h-[320px] w-full border-0"
            data-beehiiv
          />
        </div>
      ) : (
        <form onSubmit={onSubmit} className={compact ? "flex gap-2" : "mt-6 flex flex-col gap-3 sm:flex-row"}>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@email.com"
            aria-label="Email"
            className="sm:flex-1"
          />
          <Button type="submit" disabled={state === "loading"}>
            {state === "loading" ? "Đang gửi…" : "Nhận thư"}
          </Button>
        </form>
      )}
      {message ? (
        <p className={`mt-3 font-mono text-xs ${state === "err" ? "text-brick" : "text-forest"}`}>{message}</p>
      ) : null}
    </div>
  );
}
