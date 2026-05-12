# GitHub Actions — Configuration 100% Autonome

Ce guide te permet de rendre ton XAU/USD Analyzer PRO 100% autonome, sans Kimi, avec actualisation quotidienne des donnees FRED.

---

## Etape 1: Creer un compte GitHub (gratuit)

1. Va sur https://github.com/signup
2. Crees un compte avec ton email
3. Verifie ton email

---

## Etape 2: Creer un nouveau repository

1. Clique sur le bouton vert **"New"** ou va sur https://github.com/new
2. Nom du repo: `xauusd-analyzer-pro`
3. Visibilite: **Public** (necessaire pour GitHub Pages gratuit)
4. **Ne coche PAS** "Add a README"
5. Clique **"Create repository"**

---

## Etape 3: Uploader le code

Apres avoir cree le repo, GitHub te montre des commandes. Utilises celles-ci:

```bash
# Dans le dossier du projet (tu dois me demander de te donner le ZIP)
# Ou utilises l'interface web GitHub:
```

**Plus simple — Upload via interface web:**

1. Sur la page de ton repo, cliques sur **"uploading an existing file"**
2. Fais glisser TOUS les fichiers du dossier `/mnt/agents/output/app/`
3. Cliques **"Commit changes"**

---

## Etape 4: Activer GitHub Pages

1. Dans ton repo, va dans **Settings** (onglet en haut)
2. Dans le menu de gauche, cliques sur **Pages**
3. Source: selectionnes **"GitHub Actions"**
4. Cliques **"Save"**

---

## Etape 5: Lancer le premier build

1. Va dans l'onglet **Actions** de ton repo
2. Tu verras le workflow "Deploy XAU/USD 24/7 Analyzer"
3. Cliques dessus, puis cliques **"Run workflow"** → **"Run workflow"**
4. Attends 2-3 minutes que le build se termine

---

## Etape 6: Acceder au site

1. Apres le build, retournes dans **Settings** → **Pages**
2. Tu verras l'URL: `https://TON_USERNAME.github.io/xauusd-analyzer-pro/`
3. Ce site est maintenant:
   - **100% gratuit**
   - **100% autonome** (rebuild tous les jours a minuit UTC)
   - **Donnees FRED actualisees automatiquement**
   - **Sans Kimi, sans token, sans rien payer**

---

## Ce qui se passe automatiquement

| Heure (UTC) | Action |
|-------------|--------|
| 00:00 | Fetch des nouvelles donnees FRED |
| 00:01 | Rebuild du site avec donnees fraiches |
| 00:02 | Deploy sur ton URL GitHub Pages |

**Tu n'as RIEN a faire. C'est totalement automatique.**

---

## URL du site apres configuration

```
https://TON_USERNAME.github.io/xauusd-analyzer-pro/
```

Remplace `TON_USERNAME` par ton nom d'utilisateur GitHub.

---

## En cas de probleme

Si tu veux forcer un rebuild manuel:
1. Va dans **Actions** dans ton repo
2. Cliques sur le workflow
3. Cliques **"Run workflow"**

---

## Fichiers importants dans ce projet

| Fichier | Role |
|---------|------|
| `.github/workflows/deploy.yml` | Workflow GitHub Actions (rebuild auto) |
| `scripts/fetch-fred.cjs` | Telecharge les donnees FRED |
| `vite.config.ts` | Configuration du build |
| `src/hooks/useRealtimePrice.ts` | Prix temps reel (inchange) |
| `src/services/fredApi.ts` | Donnees FRED (actualise au build) |
