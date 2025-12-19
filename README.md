# 🏋️ leGym — Réseau de Salles de Sport Franchisées

> **Un pass. Toutes les salles leGym.**

Application web moderne permettant aux utilisateurs d'accéder à un réseau de salles de sport franchisées avec un seul compte. Suivez vos défis, gagnez des badges et consultez le classement en temps réel.

## 🚀 Démo en ligne

**👉 [https://le-gym-esgi.vercel.app/](https://le-gym-esgi.vercel.app/)**

Testez l'application directement dans votre navigateur !

## 🔧 Tester l'API avec Postman

Une collection Postman est disponible pour tester tous les endpoints de l'API :

1. Téléchargez et installez [Postman](https://www.postman.com/downloads/)
2. Importez le fichier `leGym.postman_collection.json` situé à la racine du projet
3. Configurez les variables d'environnement dans Postman :
   - `baseUrl` : `https://le-gym-esgi.vercel.app` (ou `http://localhost:3000` en local)
   - `clientEmail`, `ownerEmail`, `adminEmail` : emails des comptes de test
   - `password` : mot de passe des comptes

### Endpoints disponibles

| Catégorie  | Endpoints                                                 |
| ---------- | --------------------------------------------------------- |
| **Auth**   | Login (Client/Owner/Admin), Who Am I                      |
| **Public** | Home Data, List Gyms, Gym Detail, Challenges, Leaderboard |
| **Client** | Join Challenge, Log Workout, Sync Badges, Get Rank        |
| **Owner**  | Create/Update Gym, Get My Gym                             |
| **Admin**  | Manage Users, Exercise Types, Badges, Approve/Reject Gyms |

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Styles** : Tailwind CSS + shadcn/ui
- **Base de données** : Prisma ORM (SQLite dev / PostgreSQL prod)
- **Authentification** : Better Auth
- **Déploiement** : Vercel

## 📦 Installation locale

```bash
# Cloner le repository
git clone <repo-url>
cd le-gym

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env

# Initialiser la base de données
pnpm prisma migrate dev

# Peupler avec des données de test
pnpm prisma db seed

# Lancer le serveur de développement
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📝 Scripts disponibles

| Commande             | Description                         |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Démarre le serveur de développement |
| `pnpm build`         | Build de production                 |
| `pnpm lint`          | Analyse ESLint                      |
| `pnpm format`        | Formatage Prettier                  |
| `pnpm typecheck`     | Vérification TypeScript             |
| `pnpm prisma studio` | Interface graphique pour la BDD     |

## 🗄️ Base de données

- **Développement** : SQLite (`file:./prisma/dev.db`)
- **Production** : PostgreSQL (configurez `DATABASE_URL`)

## 👥 Rôles utilisateurs

| Rôle            | Permissions                                                        |
| --------------- | ------------------------------------------------------------------ |
| **Client**      | Rejoindre des défis, logger ses séances, consulter ses badges      |
| **Gym Owner**   | Gérer sa salle, créer des défis                                    |
| **Super Admin** | Gestion complète (utilisateurs, salles, badges, types d'exercices) |

## 📄 Licence

Projet réalisé dans le cadre de l'ESGI — 2025
