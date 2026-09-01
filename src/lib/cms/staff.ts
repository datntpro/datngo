import { getSql } from "@/lib/db";
import { createId } from "@/lib/utils";
import { claimSeed, ensureSeed } from "./seed";

export type StaffRole = "admin" | "publisher";

export type StaffMember = {
  id: string;
  userId: string | null;
  email: string | null;
  role: StaffRole;
};

function mapStaff(row: Record<string, unknown>): StaffMember {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    email: row.email ? String(row.email).toLowerCase() : null,
    role: row.role === "admin" ? "admin" : "publisher",
  };
}

async function emailForUser(userId: string): Promise<string | null> {
  const sql = await getSql();
  try {
    const rows = await sql<{ email: string | null }>`
      select email from "user" where id = ${userId} limit 1
    `;
    return rows[0]?.email?.trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

function adminEmailAllowlist(): string[] {
  const raw = typeof process !== "undefined" ? process.env.STUDIO_ADMIN_EMAIL : undefined;
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Lookup only — never bootstraps the first owner. Safe on public pages. */
export async function peekStaff(userId: string, email?: string | null): Promise<StaffMember | null> {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from studio_staff`;
  const em = email?.trim().toLowerCase() || (await emailForUser(userId));
  const match = rows.find((r) => {
    if (r.user_id && String(r.user_id) === userId) return true;
    if (em && r.email && String(r.email).toLowerCase() === em) return true;
    return false;
  });
  return match ? mapStaff(match) : null;
}

/**
 * Resolve Studio access.
 * - Table empty → first signed-in user becomes admin (unless STUDIO_ADMIN_EMAIL
 *   is set, in which case only that email may claim).
 * - Otherwise only invited emails / bound user ids get in.
 * Random readers who sign in at /studio are denied.
 */
export async function resolveStudioStaff(
  userId: string,
  opts: { bootstrap?: boolean } = {},
): Promise<StaffMember | null> {
  await ensureSeed();
  const sql = await getSql();
  const email = await emailForUser(userId);
  const existing = await peekStaff(userId, email);
  if (existing) {
    if (!existing.userId) {
      await sql`
        update studio_staff set user_id = ${userId}, claimed_at = now()
        where id = ${existing.id}
      `;
      await claimSeed(userId);
      return { ...existing, userId };
    }
    return existing;
  }

  if (!opts.bootstrap) return null;

  const all = await sql<{ n: number }>`select count(*)::int as n from studio_staff`;
  const count = Number(all[0]?.n ?? 0);
  const allow = adminEmailAllowlist();

  if (count === 0) {
    if (allow.length > 0 && (!email || !allow.includes(email))) return null;
    const id = createId();
    await sql`
      insert into studio_staff (id, user_id, email, role, claimed_at)
      values (${id}, ${userId}, ${email}, ${"admin"}, now())
    `;
    await claimSeed(userId);
    return { id, userId, email, role: "admin" };
  }

  return null;
}

export async function requireStudio(userId: string, minRole?: "admin"): Promise<StaffMember> {
  const staff = await resolveStudioStaff(userId, { bootstrap: true });
  if (!staff) {
    throw new Error("Studio chỉ dành cho người viết. Đọc bài không cần tài khoản.");
  }
  if (minRole === "admin" && staff.role !== "admin") {
    throw new Error("Chỉ admin mới làm được việc này.");
  }
  return staff;
}

export async function listStaff(): Promise<StaffMember[]> {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select * from studio_staff order by role, email
  `;
  return rows.map(mapStaff);
}

export async function inviteStaff(email: string, role: StaffRole): Promise<StaffMember> {
  const sql = await getSql();
  const em = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) throw new Error("Email không hợp lệ.");
  const existing = await sql<Record<string, unknown>>`
    select * from studio_staff where lower(email) = ${em} limit 1
  `;
  if (existing[0]) {
    await sql`update studio_staff set role = ${role} where id = ${String(existing[0].id)}`;
    return mapStaff({ ...existing[0], role });
  }
  const id = createId();
  await sql`
    insert into studio_staff (id, email, role)
    values (${id}, ${em}, ${role})
  `;
  return { id, userId: null, email: em, role };
}

export async function removeStaff(id: string, actorId: string) {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from studio_staff where id = ${id}`;
  const row = rows[0];
  if (!row) return;
  if (String(row.user_id) === actorId) throw new Error("Không xóa chính mình.");
  if (row.role === "admin") {
    const admins = await sql<{ n: number }>`
      select count(*)::int as n from studio_staff where role = ${"admin"}
    `;
    if (Number(admins[0]?.n ?? 0) <= 1) throw new Error("Phải còn ít nhất một admin.");
  }
  await sql`delete from studio_staff where id = ${id}`;
}
