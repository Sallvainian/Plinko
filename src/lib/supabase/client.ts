import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin service key is only intended for the /admin surface.
// It should NOT be used outside that route's code path.
export const getAdminClient = () => {
  const serviceRole = (import.meta.env as any).ADMIN_SUPABASE_SERVICE_ROLE as string | undefined;
  if (!serviceRole) return null;
  return createClient(supabaseUrl, serviceRole);
};



