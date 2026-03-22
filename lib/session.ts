/**
 * Minimal signed-cookie session for staging admin auth.
 * Web Crypto API only â€” Edge Runtime + Node.js 18+ compatible.
 * Server-side only â€” never import from a Client Component.
 *
 * Cookie format: <payload_base64url>.<hmac_base64url>
 * Payload: JSON { user: string; exp: number }
 */

export const COOKIE_NAME = "admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

async function importKey(usage: KeyUsage[]): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET ?? "dev-secret-change-me";

  if (secret === "dev-secret-change-me" && process.env.NODE_ENV === "production") {
    console.error(
      "[session] SESSION_SECRET is using the insecure default. " +
        "Set SESSION_SECRET to a random value before deploying."
    );
  }

  const raw = new TextEncoder().encode(secret);

  return crypto.subtle.importKey(
    "raw",
    raw.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

function toB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";

  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }

  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);

  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }

  return arr.buffer as ArrayBuffer;
}

export interface SessionPayload {
  user: string;
  exp: number;
}

/** Create a signed cookie value for the given username. */
export async function createSessionCookie(username: string): Promise<string> {
  const enc = new TextEncoder();
  const data: SessionPayload = {
    user: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payloadB64 = toB64url(
    enc.encode(JSON.stringify(data)).buffer as ArrayBuffer
  );

  const key = await importKey(["sign"]);

  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadB64).buffer as ArrayBuffer
  );

  return `${payloadB64}.${toB64url(sig)}`;
}

/** Verify and decode a cookie value. Returns null if invalid or expired. */
export async function verifySessionCookie(
  value: string
): Promise<SessionPayload | null> {
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;

  const payloadB64 = value.slice(0, dot);
  const sigB64 = value.slice(dot + 1);

  const enc = new TextEncoder();
  const key = await importKey(["verify"]);

  let valid: boolean;

  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64url(sigB64),
      enc.encode(payloadB64).buffer as ArrayBuffer
    );
  } catch {
    return null;
  }

  if (!valid) return null;

  let parsed: SessionPayload;

  try {
    parsed = JSON.parse(new TextDecoder().decode(fromB64url(payloadB64)));
  } catch {
    return null;
  }

  if (Math.floor(Date.now() / 1000) > parsed.exp) return null;

  return parsed;
}