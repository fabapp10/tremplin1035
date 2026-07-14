import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { token } = await req.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return Response.json({ error: "non connecté" }, { status: 401 });

    const origin = req.headers.get("origin") || "https://www.tremplin.tech";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_PREMIUM, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: origin + "/?paiement=ok",
      cancel_url: origin + "/?paiement=annule",
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error("checkout", e);
    return Response.json({ error: "erreur" }, { status: 500 });
  }
}
