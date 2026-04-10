# Facty 🧾

Facty est une application moderne de gestion de facturation et d'administration d'équipe, conçue pour simplifier la création, le suivi et la gestion de vos factures.

## 🚀 Fonctionnalités

- **Gestion des factures** : Créez, éditez, téléchargez (PDF) et suivez le statut de vos factures (brouillon, envoyée, payée, en retard).
- **Espace Client & Admin** : Tableaux de bord distincts pour les utilisateurs standards et les administrateurs.
- **Gestion d'équipe** : Invitez des collaborateurs avec des rôles spécifiques (admin, éditeur, lecteur) via des invitations par email sécurisées.
- **Authentification sécurisée** : Propulsé par Supabase Auth (Inscription, connexion, récupération de mot de passe).
- **Interface Moderne** : Interface utilisateur élégante, responsive et accessible, construite avec Tailwind CSS.

## 🛠️ Technologies utilisées

- **Frontend** : React 18, Vite, TypeScript, Tailwind CSS, Lucide React (icônes)
- **Backend & Base de données** : Supabase (PostgreSQL, Auth, Row Level Security)
- **Serverless** : Vercel Functions (pour les actions d'administration sécurisées comme l'invitation d'utilisateurs)
- **Déploiement** : Vercel

## ⚙️ Prérequis

- Node.js (v18 ou supérieur)
- Un projet [Supabase](https://supabase.com/) actif
- Un compte [Vercel](https://vercel.com/) (pour le déploiement et les fonctions serverless)

## 📦 Installation locale

1. **Cloner le dépôt**
   ```bash
   git clone <votre-repo-url>
   cd facty
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement**
   Créez un fichier `.env` à la racine du projet et ajoutez vos clés Supabase :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_supabase
   ```
   *Note : La `SUPABASE_SERVICE_ROLE_KEY` est requise pour les fonctions d'administration (Vercel Functions) comme l'invitation de membres d'équipe.*

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

## 🚀 Déploiement sur Vercel

Ce projet est pré-configuré pour un déploiement fluide sur Vercel grâce au fichier `vercel.json`.

1. Connectez votre dépôt GitHub/GitLab/Bitbucket à Vercel.
2. Allez dans **Project Settings > Environment Variables** et ajoutez vos 3 variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Déployez ! Vercel compilera automatiquement l'application React et déploiera la fonction d'invitation dans `api/invite-user.ts`. L'application sera alors disponible sur `https://factyapp.logonova.site/`.

## 🔒 Sécurité (Supabase RLS)

Assurez-vous que les politiques RLS (Row Level Security) sont correctement configurées dans votre base de données Supabase pour protéger les tables `profiles`, `invoices`, et `team_members`.

## 📄 Licence

Ce projet est sous licence MIT.
