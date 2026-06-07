// Route serveur : appelle l'API Claude avec la clé gardée côté serveur.
// La clé ANTHROPIC_API_KEY n'est jamais exposée au navigateur.
export const runtime = "nodejs";

export async function POST(req) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      { error: "Clé API manquante. Définis ANTHROPIC_API_KEY dans les variables d'environnement Vercel." },
      { status: 500 }
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { system, messages } = payload || {};
  if (!Array.isArray(messages)) {
    return Response.json({ error: "messages manquant." }, { status: 400 });
  }

  const body = {
    // Vérifie le modèle le plus récent sur https://docs.claude.com
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages,
  };
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
    return Response.json(data, { status: r.status });
  } catch (e) {
    return Response.json({ error: "Erreur lors de l'appel à l'IA." }, { status: 502 });
  }
}
