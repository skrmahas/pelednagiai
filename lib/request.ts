import type { NextRequest } from "next/server";

export class ValidationError extends Error {}

export async function readJsonBody(
  request: NextRequest
): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Neteisingas užklausos formatas");
  }
  return body as Record<string, unknown>;
}

export function readRequiredString(
  body: Record<string, unknown>,
  field: string,
  errorMessage: string
): string {
  const value = body[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(errorMessage);
  }
  return value.trim();
}

export function readOptionalString(
  body: Record<string, unknown>,
  field: string
): string | undefined {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new ValidationError(`Laukas "${field}" turi būti tekstas`);
  }
  return value.trim();
}

export function readNumber(
  body: Record<string, unknown>,
  field: string,
  errorMessage: string
): number {
  const value = body[field];
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(errorMessage);
  }
  return value;
}

export function readOptionalNumber(
  body: Record<string, unknown>,
  field: string
): number | undefined {
  const value = body[field];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`Laukas "${field}" turi būti skaičius`);
  }
  return value;
}

export function readEnumValue<T extends string>(
  body: Record<string, unknown>,
  field: string,
  allowedValues: readonly T[],
  errorMessage: string
): T | undefined {
  const value = body[field];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string" || !allowedValues.includes(value as T)) {
    throw new ValidationError(errorMessage);
  }
  return value as T;
}
