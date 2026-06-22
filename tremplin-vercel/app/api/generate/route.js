// Route serveur : appelle l'API Claude (clé gardée côté serveur)
// + vérifie la limite "1 CV gratuit" de façon infalsifiable.
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      { error: "Clé API manquante. Définis ANTHROPIC_API_KEY dans Vercel." },
      { status: 500 }
    );
  }

  let payload;
  try { payload = await req.json(); }
  catch { return Response.json({ error: "Requête invalide." }, { status: 400 }); }

  const { system, messages, token } = payload || {};
  if (!Array.isArray(messages)) {
    return Response.json({ error: "messages manquant." }, { status: 400 });
  }

  // --- Vérification utilisateur + limite CV gratuit (côté serveur) ---
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let user = null, admin = null, profile = null;

  if (url && anonKey) {
    try {
      const supa = createClient(url, anonKey);
      const { data } = await supa.auth.getUser(token);
      user = data && data.user ? data.user : null;
    } catch (e) { user = null; }

    // Si Supabase est configuré, il faut être connecté pour générer
    if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });

    if (serviceKey) {
      admin = createClient(url, serviceKey);
      const { data: p } = await admin
        .from("profiles")
        .select("plan, free_cv_used")
        .eq("id", user.id)
        .maybeSingle();
      profile = p;
      if (!profile) {
        await admin.from("profiles").insert({ id: user.id });
        profile = { plan: "gratuit", free_cv_used: false };
      }
      // Utilisateur gratuit ayant déjà utilisé son CV -> bloqué
      if (profile.plan !== "premium" && profile.free_cv_used) {
        return Response.json({ error: "limit" }, { status: 403 });
      }
    }
  }

  const body = { model: "claude-sonnet-4-6", max_tokens: 1500, messages };
  if (system) body.system = system;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();

    // Génération réussie pour un utilisateur gratuit -> on marque le CV gratuit comme utilisé
    if (r.ok && admin && profile && profile.plan !== "premium") {
      try { await admin.from("profiles").update({ free_cv_used: true }).eq("id", user.id); } catch (e) {}
    }

    return Response.json(data, { status: r.status });
  } catch (e) {
    return Response.json({ error: "Erreur lors de l'appel à l'IA." }, { status: 502 });
  }
}
