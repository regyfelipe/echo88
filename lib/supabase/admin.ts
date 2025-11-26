/**
 * Supabase Admin Client
 * Cliente administrativo para operações que precisam bypassar RLS
 * Use apenas no servidor (API routes)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key se disponível, senão usa anon key (menos seguro)
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Cria um cliente Supabase administrativo
 * Este cliente bypassa RLS e deve ser usado apenas no servidor
 */
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
