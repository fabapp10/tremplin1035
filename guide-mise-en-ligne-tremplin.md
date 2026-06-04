# Mettre Tremplin en ligne — guide pas à pas

Ce guide t'explique, étape par étape, comment transformer le prototype `tremplin.jsx` en un vrai site accessible sur Internet, avec connexion Google et paiement réels.

---

## 1. Comprendre ce qu'il manque

Le prototype actuel tourne **entièrement dans le navigateur**. Pour un vrai produit payant, il faut ajouter quatre briques qui vivent sur un **serveur** :

1. **Hébergement / déploiement** — pour que le site ait une adresse publique.
2. **Comptes + connexion Google** — une vraie authentification.
3. **Paiement par abonnement** — débit réel des 19,90 € et 29,90 €.
4. **Clé API Claude côté serveur** — la clé ne doit jamais être visible dans le navigateur.

Et autour : un **nom de domaine** et les **pages légales** obligatoires.

> Important : dans le prototype, le verrouillage des outils se fait dans le navigateur. C'est contournable. En production, le contrôle du forfait doit se faire **côté serveur**.

---

## 2. La stack recommandée (simple, fiable, peu coûteuse)

Chacun de ces services a une offre gratuite suffisante pour démarrer.

| Besoin | Outil recommandé | Pourquoi |
|---|---|---|
| Framework du site | **Next.js** (React) | Tes composants actuels se réutilisent presque tels quels, et il gère le code serveur. |
| Hébergement | **Vercel** | Déploiement en un clic depuis GitHub, HTTPS automatique. |
| Comptes + connexion Google | **Supabase Auth** | Connexion Google intégrée, sans tout coder soi-même. |
| Base de données | **Supabase (PostgreSQL)** | Stocke les utilisateurs et leur forfait. |
| Paiement abonnement | **Stripe** | Gère parfaitement les abonnements mensuels et les résiliations. |
| Génération IA | **API Claude (Anthropic)** | Appelée depuis le serveur, jamais le navigateur. |
| Nom de domaine | **OVH, Gandi ou Namecheap** | Pour `tremplin.fr` ou `.app`. |

Tu peux remplacer Supabase par Firebase, ou Vercel par Netlify — le principe reste le même.

---

## 3. Phase 0 — Préparer ton poste de travail

Avant de coder, crée les comptes et installe les outils.

**Comptes à créer (gratuits) :**
- [ ] GitHub (pour héberger ton code)
- [ ] Vercel (connecté à GitHub)
- [ ] Supabase
- [ ] Stripe
- [ ] Console Anthropic — https://console.anthropic.com (pour la clé API)
- [ ] Google Cloud Console (pour activer la connexion Google)

**À installer sur ton ordinateur :**
- [ ] **Node.js** (version LTS) — https://nodejs.org
- [ ] **VS Code** (éditeur de code) — https://code.visualstudio.com
- [ ] **Git** — https://git-scm.com

---

## 4. Phase 1 — Créer le projet et y placer le prototype

1. Ouvre un terminal et lance :
   ```bash
   npx create-next-app@latest tremplin
   ```
   Réponds : TypeScript → non (plus simple pour démarrer), App Router → oui.
2. Ouvre le dossier `tremplin` dans VS Code.
3. Copie le contenu de `tremplin.jsx` dans un composant, par exemple `components/Tremplin.jsx`, et affiche-le depuis `app/page.js`.
4. Lance le site en local :
   ```bash
   npm run dev
   ```
   Ouvre http://localhost:3000 — tu dois voir ta landing page.

> À ce stade, l'app marche comme le prototype (IA, connexion et paiement encore simulés). On va maintenant les rendre réels, brique par brique.

---

## 5. Phase 2 — Rendre l'IA réelle (clé API côté serveur)

**Objectif :** déplacer les appels à Claude du navigateur vers le serveur, pour protéger ta clé.

1. Récupère ta clé sur https://console.anthropic.com → **API Keys**.
2. Crée un fichier `.env.local` à la racine et ajoute :
   ```
   ANTHROPIC_API_KEY=ta_cle_ici
   ```
   (Ce fichier ne doit jamais être public — il est ignoré par Git par défaut.)
3. Crée une route serveur `app/api/generate/route.js` :
   ```js
   export async function POST(req) {
     const { system, messages } = await req.json();
     const r = await fetch("https://api.anthropic.com/v1/messages", {
       method: "POST",
       headers: {
         "content-type": "application/json",
         "x-api-key": process.env.ANTHROPIC_API_KEY,
         "anthropic-version": "2023-06-01",
       },
       body: JSON.stringify({
         model: "claude-sonnet-4-20250514", // vérifie le modèle le plus récent sur docs.claude.com
         max_tokens: 1500,
         system,
         messages,
       }),
     });
     const data = await r.json();
     return Response.json(data);
   }
   ```
4. Dans l'app, remplace l'appel direct à `api.anthropic.com` par un appel à **ta** route `/api/generate`.

> Pour le modèle exact et les tarifs à l'usage (par million de tokens), réfère-toi à la documentation officielle : https://docs.claude.com/en/api/overview — ces valeurs évoluent.

---

## 6. Phase 3 — Connexion Google réelle (Supabase Auth)

1. Crée un projet sur Supabase. Note l'**URL du projet** et la **clé `anon`**.
2. Dans Google Cloud Console : crée un identifiant **OAuth 2.0**, et autorise l'URL de redirection fournie par Supabase.
3. Dans Supabase → **Authentication → Providers → Google** : colle l'ID client et le secret Google.
4. Ajoute à `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Installe le client : `npm install @supabase/supabase-js`.
6. Remplace le bouton « Continuer avec Google » simulé par un vrai appel :
   ```js
   import { createClient } from "@supabase/supabase-js";
   const supabase = createClient(url, anonKey);
   await supabase.auth.signInWithOAuth({ provider: "google" });
   ```

Désormais, la connexion crée un vrai compte.

---

## 7. Phase 4 — Base de données et forfaits

**Objectif :** savoir, côté serveur, quel forfait possède chaque utilisateur.

1. Dans Supabase → **Table Editor**, crée une table `profiles` :
   - `id` (référence vers l'utilisateur connecté)
   - `plan` (texte : `aucun`, `essentiel` ou `complet`)
   - `stripe_customer_id` (texte)
2. À l'inscription, crée une ligne avec `plan = 'aucun'`.
3. **Le verrouillage des outils se vérifie côté serveur** : avant chaque génération (route `/api/generate`), vérifie le forfait de l'utilisateur et refuse si l'outil n'est pas inclus. Le verrou visuel dans l'app reste utile, mais ne suffit pas seul.

---

## 8. Phase 5 — Paiement par abonnement (Stripe)

1. Dans Stripe → **Produits**, crée deux produits avec un prix **récurrent mensuel** :
   - Essentiel — **19,90 €/mois**
   - Complet — **29,90 €/mois**
   Note les identifiants de prix (`price_...`).
2. Crée une route `app/api/checkout/route.js` qui ouvre une session **Stripe Checkout** pour le prix choisi, et renvoie l'URL de paiement (installe `npm install stripe`).
3. Configure un **webhook Stripe** (`app/api/webhook/route.js`) qui écoute l'événement d'abonnement payé, puis met à jour `profiles.plan` (`essentiel` ou `complet`) de l'utilisateur. C'est ce qui débloque réellement les outils.
4. Pour les changements de forfait et les résiliations, active le **portail client Stripe** (une page toute faite que Stripe te fournit).

Clés à ajouter à `.env.local` :
```
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

> Stripe prélève une commission par transaction. Vérifie les tarifs actuels sur stripe.com/fr — ne les code pas en dur dans ton site.

---

## 9. Phase 6 — Déployer sur Internet (Vercel)

1. Pousse ton code sur GitHub :
   ```bash
   git init
   git add .
   git commit -m "Tremplin"
   ```
   Puis crée un dépôt sur GitHub et suis les instructions pour l'y envoyer.
2. Sur Vercel → **New Project** → importe ton dépôt GitHub.
3. Dans Vercel → **Settings → Environment Variables**, recopie **toutes** les variables de ton `.env.local` (clé Anthropic, Supabase, Stripe).
4. Clique **Deploy**. Quelques minutes plus tard, ton site est en ligne sur une adresse `…vercel.app`.

À chaque fois que tu pousses du code sur GitHub, Vercel redéploie automatiquement.

---

## 10. Phase 7 — Nom de domaine

1. Achète un domaine (ex. `tremplin.fr`) chez OVH, Gandi ou Namecheap.
2. Dans Vercel → **Domains**, ajoute ton domaine et suis les instructions DNS (à recopier chez ton registrar).
3. Le HTTPS (cadenas) est activé automatiquement par Vercel.

---

## 11. Phase 8 — Légal et conformité (France / UE)

Pour un site commercial, c'est obligatoire — et les pages sont déjà prêtes dans l'app, à compléter :
- [ ] **Mentions légales** — éditeur, hébergeur, contact (déjà gabarit dans l'app).
- [ ] **Politique de confidentialité (RGPD)** — données, finalités, droits (déjà gabarit dans l'app).
- [ ] **Conditions Générales de Vente (CGV)** — abonnement, prix, résiliation, droit de rétractation.
- [ ] **Bandeau cookies** — demande le consentement pour la mesure d'audience.
- [ ] Remplace les adresses e-mail d'exemple par les tiennes.

En cas de doute, fais relire ces documents par un professionnel.

---

## 12. Phase 9 — Tester puis lancer

- [ ] Connexion Google fonctionne (vrai compte créé).
- [ ] Paiement test Stripe (mode test) débloque le bon forfait.
- [ ] Les outils verrouillés sont **vraiment** inaccessibles sans le forfait (test côté serveur).
- [ ] Génération IA OK sur chaque module.
- [ ] Export PDF OK.
- [ ] Pages légales remplies.
- [ ] Domaine + HTTPS actifs.

Quand tout est vert, passe Stripe en **mode production** et communique ton adresse.

---

## Ordre conseillé et estimation

1. Projet Next.js + prototype (Phase 1)
2. IA côté serveur (Phase 2)
3. Connexion Google (Phase 3)
4. Base de données + forfaits (Phase 4)
5. Paiement Stripe (Phase 5)
6. Déploiement (Phase 6) + domaine (Phase 7)
7. Légal (Phase 8) + tests (Phase 9)

Compte quelques jours à quelques semaines selon ton aisance technique. Les phases 5 (Stripe) et 4 (sécurité côté serveur) sont les plus délicates : prends ton temps, et n'hésite pas à te faire accompagner par un développeur pour celles-ci.

---

## Liens utiles
- API Claude : https://docs.claude.com/en/api/overview
- Next.js : https://nextjs.org/docs
- Vercel : https://vercel.com/docs
- Supabase : https://supabase.com/docs
- Stripe (abonnements) : https://stripe.com/docs/billing/subscriptions/overview
