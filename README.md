# CV Studio

Générateur de CV professionnel — **NestJS + Prisma + Nuxt 4 + Vuetify + Tailwind + TypeScript**.

## Stack

| Couche | Techno |
|---|---|
| API | NestJS 11, Passport JWT, class-validator |
| ORM / DB | Prisma + PostgreSQL |
| Frontend | Nuxt 4, Vue 3, TypeScript |
| UI | Vuetify 3 + Tailwind CSS |
| PDF | PDFKit |

L’ancien code Express/Vue est conservé dans `legacy/`.

## Prérequis

- Node.js ≥ 20
- PostgreSQL en local

## Installation

```bash
# 1. Dépendances
npm install

# 2. Configurer la base (backend/.env)
cp backend/.env.example backend/.env
# Éditer DATABASE_URL si besoin

# 3. Créer la base PostgreSQL
createdb cv_generator   # ou via psql

# 4. Migrations Prisma
npm run db:migrate

# 5. Lancer API + frontend
npm run dev
```

- Frontend : http://localhost:3000  
- API : http://localhost:3001/api  
- Health : http://localhost:3001/api/health  

## Parcours produit

1. Créer un compte (`/auth/register`) → un CV par défaut est créé
2. Éditer profil / expériences / formations / compétences
3. Prévisualiser (`/preview`)
4. Télécharger le PDF

## Sécurité (corrigée vs legacy)

- Ownership forcément lié à `req.user.id` (plus d’IDOR via `userId` client)
- JWT sans secret hardcodé (variable d’environnement obligatoire)
- Validation DTO stricte
- CORS restreint à l’origine frontend

## Scripts utiles

```bash
npm run dev:api      # NestJS seul
npm run dev:web      # Nuxt seul
npm run db:studio    # Prisma Studio
npm run build        # Build API + web
```
