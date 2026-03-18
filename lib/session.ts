type SessionScope = "admin" | "site";

interface SessionPayload {
  exp: number;
  scope: SessionScope;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const normalized = padded + "=".repeat((4 - (padded.length % 4 || 4)) % 4);
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function verifyValueSignature(
  value: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const key = await importSigningKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    toArrayBuffer(fromBase64Url(signature)),
    encoder.encode(value)
  );
}

export async function createSessionToken(
  scope: SessionScope,
  secret: string,
  ttlSeconds: number
): Promise<string> {
  const payload: SessionPayload = {
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    scope,
  };
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  scope: SessionScope,
  secret: string | undefined
): Promise<boolean> {
  if (!token || !secret) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  const signaturesMatch = await verifyValueSignature(encodedPayload, signature, secret);
  if (!signaturesMatch) {
    return false;
  }

  try {
    const payload = JSON.parse(decoder.decode(fromBase64Url(encodedPayload))) as SessionPayload;
    if (payload.scope !== scope) {
      return false;
    }
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
