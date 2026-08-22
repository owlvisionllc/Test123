import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/** Magic link. The domain trigger refuses anything not on the company domain,
 *  but Supabase still reports success either way — it will not tell a stranger
 *  whether an address exists. So the UI says "check your email" regardless. */
export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export const signOut = () => supabase.auth.signOut();
