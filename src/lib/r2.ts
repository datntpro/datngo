/** Cloudflare R2 via S3 API — works on Node (Vercel) and Workers (nodejs_compat). */

export function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET?.trim() &&
      process.env.R2_PUBLIC_BASE_URL?.trim(),
  );
}

function env(name: string) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`${name} chưa được gắn.`);
  return v;
}

export async function r2Put(key: string, body: Uint8Array, contentType: string): Promise<string> {
  const { AwsClient } = await import("aws4fetch");
  const account = env("R2_ACCOUNT_ID");
  const bucket = env("R2_BUCKET");
  const publicBase = env("R2_PUBLIC_BASE_URL").replace(/\/$/, "");
  const client = new AwsClient({
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });
  const url = `https://${account}.r2.cloudflarestorage.com/${bucket}/${key}`;
  const res = await client.fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: body as unknown as BodyInit,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Không ghi được R2 (${res.status}). ${text.slice(0, 180)}`);
  }
  return `${publicBase}/${key}`;
}

export async function r2Delete(key: string) {
  if (!r2Configured()) return;
  const { AwsClient } = await import("aws4fetch");
  const account = env("R2_ACCOUNT_ID");
  const bucket = env("R2_BUCKET");
  const client = new AwsClient({
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });
  const url = `https://${account}.r2.cloudflarestorage.com/${bucket}/${key}`;
  await client.fetch(url, { method: "DELETE" }).catch(() => undefined);
}
