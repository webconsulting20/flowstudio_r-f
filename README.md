# Références — Portfolio Créatif

Plateforme web sécurisée de présentation de références clients, avec authentification et back-office d'administration.

## Stack technique

- **Next.js 14** (App Router) — Framework React full-stack
- **TypeScript** — Typage statique
- **Tailwind CSS** — Styling utilitaire
- **Prisma** + **SQLite** — ORM et base de données (migrable vers PostgreSQL)
- **NextAuth.js** — Authentification JWT
- **Lucide React** — Icônes

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Initialiser la base de données et les données de démo
npm run setup

# 3. Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## Comptes de démonstration

| Rôle   | Email            | Mot de passe |
|--------|------------------|--------------|
| Admin  | admin@demo.com   | demo1234     |
| Viewer | viewer@demo.com  | demo1234     |

## Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Authentification
│   │   └── videos/              # API CRUD vidéos
│   ├── admin/                   # Back office
│   │   ├── edit/[id]/           # Édition vidéo
│   │   └── new/                 # Ajout vidéo
│   ├── login/                   # Page de connexion
│   ├── video/[id]/              # Détail vidéo
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Page d'accueil / galerie
├── components/                  # Composants réutilisables
├── lib/                         # Utilitaires (prisma, auth, catégories)
└── types/                       # Types TypeScript
prisma/
├── schema.prisma                # Schéma de données
└── seed.ts                      # Données de démonstration
```

## Fonctionnalités

### Front office
- Galerie de vidéos avec cards visuelles
- Filtrage par catégorie (Motion Design, Filmé, Marketing Digital)
- Barre de recherche
- Fiche détaillée avec lecteur vidéo intégré (YouTube, Vimeo, direct)
- Design premium, responsive et fluide

### Back office (admin)
- Tableau de gestion des vidéos
- Ajout de vidéo avec formulaire complet
- Modification et suppression
- Aperçu de miniature en temps réel

### Authentification
- Login sécurisé avec JWT
- 2 rôles : admin et viewer
- Middleware de protection des routes
- Redirection automatique si non connecté

## Déploiement en production

### Option 1 : Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

Variables d'environnement à configurer sur Vercel :
- `NEXTAUTH_SECRET` — un secret aléatoire (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — l'URL de production
- `DATABASE_URL` — connexion à la base de données

### Option 2 : PostgreSQL en production

Pour passer de SQLite à PostgreSQL :

1. Modifier `prisma/schema.prisma` :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Mettre à jour `DATABASE_URL` :
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. Regénérer et migrer :
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### Variables d'environnement

```env
DATABASE_URL="file:./dev.db"                              # SQLite en dev
NEXTAUTH_SECRET="votre-secret-aleatoire-et-securise"      # Obligatoire
NEXTAUTH_URL="https://votre-domaine.com"                  # URL de prod
```

## Évolutions prévues

- Tags et filtres avancés
- Upload de fichiers vidéo (via S3/Cloudflare R2)
- Comptes clients dédiés avec accès restreint
- Analytics de consultation
- Export PDF des références
