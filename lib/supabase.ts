import "server-only";
import { createClient } from "@supabase/supabase-js";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

const clientOptions = {
  auth: {
    persistSession: false,
  },
};

export const supabasePublic = createClient(
  supabaseUrl,
  supabaseAnonKey,
  clientOptions
);

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  clientOptions
);
