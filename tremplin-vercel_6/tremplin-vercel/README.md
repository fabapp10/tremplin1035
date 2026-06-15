# Tremplin — projet Next.js prêt pour Vercel

Assistant de candidature propulsé par l'IA : CV, lettre de motivation, préparation d'entretien et analyse de photo.

## Lancer en local

```bash
npm install
# crée un fichier .env.local avec ta clé (voir .env.example)
echo "ANTHROPIC_API_KEY=ta_cle" > .env.local
npm run dev
```

Ouvre http://localhost:3000

## Déployer sur Vercel

1. Pousse ce dossier sur un dépôt GitHub.
2. Sur https://vercel.com → **Add New → Project** → importe le dépôt.
3. Dans **Settings → Environment Variables**, ajoute :
   - `ANTHROPIC_API_KEY` = ta clé (depuis https://console.anthropic.com)
4. Clique **Deploy**. Vercel détecte Next.js automatiquement.

À chaque `git push`, Vercel redéploie.

## Comment ça marche

- L'interface (landing, pages, outils) est dans `components/Tremplin.jsx`.
- Les appels à l'IA passent par `app/api/generate/route.js`, **côté serveur**, pour ne jamais exposer la clé API dans le navigateur.
- Sans la variable `ANTHROPIC_API_KEY`, le site s'affiche mais la génération renvoie une erreur claire.

## Ce qui reste simulé

La **connexion Google** et le **paiement** sont encore simulés dans l'interface. Pour les rendre réels (Supabase Auth + Stripe + base de données), suis `guide-mise-en-ligne-tremplin.md`.

## Structure

```
tremplin/
├─ app/
│  ├─ layout.js          # mise en page racine
│  ├─ page.js            # rend le composant Tremplin
│  ├─ globals.css        # reset CSS
│  └─ api/generate/route.js  # appel sécurisé à l'API Claude
├─ components/
│  └─ Tremplin.jsx       # toute l'application (UI)
├─ package.json
├─ next.config.js
├─ jsconfig.json
├─ .gitignore
└─ .env.example
```
