import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { token } = await req.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return Response.json({ error: "non connecté" }, { status: 401 });

    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || !profile.stripe_customer_id) {
      return Response.json({ error: "aucun abonnement" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://www.tremplin.tech";
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: origin + "/",
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error("portal", e);
    return Response.json({ error: "erreur" }, { status: 500 });
  }
}
