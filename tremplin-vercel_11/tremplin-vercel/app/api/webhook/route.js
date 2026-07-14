import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Client "admin" (clé service_role) : le webhook n'a pas de session utilisateur,
// il doit pouvoir mettre à jour la bonne fiche dans profiles.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("webhook signature", e);
    return new Response("signature invalide", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      if (s.client_reference_id) {
        await admin
          .from("profiles")
          .update({ plan: "premium", stripe_customer_id: s.customer })
          .eq("id", s.client_reference_id);
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      await admin
        .from("profiles")
        .update({ plan: "gratuit" })
        .eq("stripe_customer_id", sub.customer);
    }
  } catch (e) {
    console.error("webhook traitement", e);
  }

  return Response.json({ received: true });
}
