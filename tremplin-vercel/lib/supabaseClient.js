import { createClient } from "@supabase/supabase-js";

// Si les variables d'environnement ne sont pas (encore) définies,
// `supabase` vaut null : l'app continue de fonctionner avec la connexion simulée.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
