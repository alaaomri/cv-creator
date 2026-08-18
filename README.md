# 🚀 CV Studio Cloud — Plateforme d'Ingénierie & Publication de CV

**CV Studio Cloud** est une plateforme moderne et complète de création, personnalisation, gestion de versions et publication web sécurisée de Curriculum Vitae professionnels. Conçue pour offrir une expérience fluide tant aux candidats qu'aux recruteurs et administrateurs, elle intègre un copilote IA, un moteur d'export PDF vectoriel A4 et un bouclier avancé de protection des données personnelles (Anti-Scraping & RGPD).

---

## 🌟 Fonctionnalités Principales

### 1. ✍️ Studio Candidat & Édition Temps Réel
- **Édition modulaire multi-sections** : Profil personnel, Expériences professionnelles, Formations & Diplômes, Compétences techniques & soft skills, Langues, Projets réalisés, Certifications et Sections personnalisées.
- **Sauvegarde manuelle optimisée & Protection anti-perte** :
  - Fin du matraquage serveur (*anti-hammering*) : les modifications sont conservées localement dans l'état React sans requêter la base à chaque frappe de touche.
  - **Validation côté client (Frontend Validation)** : vérification instantanée de l'email, des dates, du nom et de l'intégrité avant d'envoyer la moindre requête réseau.
  - **Bouton d'enregistrement explicite** avec statut visuel (*À jour*, *Modifié*, *Sauvegarde en cours*) et raccourci clavier universel (<kbd>Ctrl</kbd> + <kbd>S</kbd> / <kbd>Cmd</kbd> + <kbd>S</kbd>).
  - **Garde de navigation & Modale de confirmation** : si le candidat tente de quitter le studio, de changer de CV ou de fermer l'onglet avec des modifications non enregistrées, une modale de confirmation interactive s'affiche pour proposer de sauvegarder ou d'abandonner.
- **Visualisation synchrone** : Prévisualisation A4 en direct avec zoom adaptatif et mode d'édition directe depuis l'aperçu.
- **6 Gabarits Professionnels** :
  - `Modern Clean` : Disposition contemporaine équilibrée à deux colonnes avec barre latérale.
  - `Tech Developer` : Thème orienté ingénierie logicielle avec badges de compétences terminal et code.
  - `Executive` : Typographie avec empattements (serif) formelle pour profils de direction et management.
  - `Creative Minimal` : Mise en page épurée valorisant les espaces blancs et les contrastes nets.
  - `Academic Classic` : Format mono-colonne sobre, conforme aux standards universitaires et ATS.
  - `Accent Split` : En-tête coloré vibrant et séparation nette des blocs d'information.
- **Palette de couleurs personnalisable** : Personnalisation de la couleur primaire et de la police en 1 clic.
- **Gestionnaire multi-versions** : Duplication, archivage, bascule instantanée entre différentes variantes de CV et historique de révisions.

---

### 2. 🤖 Copilote IA (Gemini 3.7 Flash)
- **Génération & reformulation de puces d'expérience** : Transformation de descriptions brutes en réalisations percutantes avec verbes d'action et métriques quantifiables.
- **Optimisation de la synthèse / accroche** : Adaptation du ton selon le niveau de séniorité et le secteur visé.
- **Recommandation de mots-clés ATS** : Analyse et détection des compétences clés manquantes selon le poste ciblé.
- **Traduction instantanée** : Traduction multilingue (Français, Anglais, Espagnol, Allemand) préservant le vocabulaire technique.
- **Architecture sécurisée** : Clé d'API `GEMINI_API_KEY` strictement conservée côté serveur avec proxy sécurisé et repli heuristique déterministe en cas d'indisponibilité.

---

### 3. 🛡️ Bouclier de Sécurité & Anti-Scraping (Protection RGPD)
- 🔒 **Protection par Code PIN / Mot de Passe Recruteur (« Zero PII Leak »)** :
  - Lorsque la protection est active, l'API publique ne transmet **aucune donnée personnelle, expérience ni coordonnée** dans le payload JSON.
  - Page de déverrouillage sécurisée pour le recruteur avec indice personnalisable (*hint*).
  - Validation par hash cryptographique SHA-256 avec sel côté serveur.
  - Protection anti-force brute : blocage automatique après 5 tentatives infructueuses (bannissement temporaire par IP de 10 min).
- 👁️ **Masquage Anti-Moissonnage des Coordonnées (*Click-to-Reveal*)** :
  - Obfuscation dynamique de l'email et du téléphone contre les robots et expressions régulières (*regex*) de scraping automatique.
  - Révélation instantanée au clic pour les recruteurs humains.
- ⏱️ **Expiration Temporelle des Liens** :
  - Définition d'une durée de validité (7 jours, 30 jours, 90 jours ou illimité).
  - Révocation automatique de l'accès avec code HTTP `410 Gone` à l'échéance.
- 🚫 **En-têtes Anti-Indexation & Robots.txt Strict** :
  - Injection des headers HTTP `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`.
  - Fichier `/robots.txt` interdisant explicitement les crawlers IA et scrapers (*GPTBot, CCBot, Claude-Web, PerplexityBot, Scrapy, Google-Extended, etc.*).
- ⚡ **Rate Limiting par IP** :
  - Limitation du débit sur les routes publiques (40 req/min/IP) pour prévenir l'aspiration automatisée.

---

### 4. 📄 Exports & Partage Multi-Canaux
- **Export PDF Haute Définition** : Génération vectorielle A4 sans coupure de section via `html2canvas` et `jspdf`.
- **Export / Import JSON** : Sauvegarde intégrale et portabilité totale des données.
- **Déploiement Web 1-Clic** : Réservation d'un slug public personnalisé (ex: `/?p=alexandre-dubois-dev`) avec génération automatique de **QR Code**.
- **Partage par Email** : Génération de liens et composition d'emails pré-remplis pour les recruteurs.

---

### 5. 📊 Portail Administrateur & Observabilité SRE
- Accessible via le raccourci <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>, le paramètre `/?admin=true` ou le menu d'administration.
- **KPIs & Métriques en direct** : Taux de déploiement web (%), ratios d'exports (PDF/JSON/Email), volume d'appels IA Gemini, taux de succès du cache L2 TTL, et distribution des templates.
- **Explorateur de données & Inspecteur JSON** : Recherche plein texte, filtrage par statut de publication, modification des permissions et inspection du payload brut.
- **Sauvegarde globale de la base** : Téléchargement d'un snapshot complet de la base en JSON (`/api/admin/export/all`).
- **Endpoint Prometheus** : Scraping des métriques système normalisées (`/api/metrics`).
- **Journal d'audit** : Traçabilité des actions de création, mise à jour, publication, déverrouillage et export.

---

## 🛠️ Stack Technologique

| Composant | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti, Motion |
| **Backend & API** | Node.js (v18+), Express 4, TypeScript via `tsx` (dev) et `esbuild` (bundle CJS prod) |
| **Intelligence Artificielle**| SDK `@google/genai` (modèle `gemini-3.7-flash`) |
| **Base de Données & ORM** | PostgreSQL / Supabase, Prisma ORM, avec réplication miroir en mémoire sécurisée |
| **Authentification** | JWT (JSON Web Tokens) signés SHA-256 stockés en cookies `HttpOnly` / `SameSite=Lax` + RBAC |
| **Génération Document** | `html2canvas`, `jspdf`, `html-to-image` |

---

## 📂 Structure du Projet

```
├── README.md                  # Documentation du projet
├── AGENTS.md                  # Directives architecturales et spécifications système
├── package.json               # Dépendances et scripts de build
├── tsconfig.json              # Configuration TypeScript
├── vite.config.ts             # Configuration Vite & Tailwind CSS
├── server.ts                  # Serveur Express, proxy IA Gemini, cache L2 & API REST
├── index.html                 # Point d'entrée HTML
├── prisma/
│   └── schema.prisma          # Schéma de base de données relationnelle Prisma
├── src/
│   ├── main.tsx               # Point d'entrée React
│   ├── App.tsx                # Routeur principal, barre d'état et modales
│   ├── types.ts               # Définitions TypeScript (CVData, StoredCV, CVSecurityConfig...)
│   ├── context/
│   │   └── PreviewEditContext.tsx # Contexte d'édition in-situ et masquage des coordonnées
│   ├── data/
│   │   ├── sampleCVs.ts       # Profils de référence et configurations de thèmes
│   │   └── sampleCV.ts        # Données de démonstration initiales
│   ├── utils/
│   │   ├── pdfExport.ts       # Moteur d'export PDF vectoriel A4
│   │   ├── cvDefaults.ts      # Normalisation et valeurs par défaut des données
│   │   ├── cvValidator.ts     # Validation client (format email, dates, champs requis)
│   │   └── cvTransformer.ts   # Transformateurs de schémas
│   └── components/
│       ├── admin/
│       │   └── AdminPortal.tsx            # Console d'administration et d'audit
│       ├── common/
│       │   └── ProtectedContactItem.tsx   # Composant de masquage Click-to-Reveal
│       ├── dashboard/
│       │   └── VersionManagerDashboard.tsx# Tableau de bord des versions de CV
│       ├── devops/
│       │   └── DevOpsArchitectureHub.tsx  # Visualiseur d'architecture et télémétrie
│       ├── editor/
│       │   ├── CVFormEditor.tsx           # Formulaire de saisie par onglets
│       │   └── LiveCVPreview.tsx          # Conteneur de prévisualisation avec zoom
│       ├── modals/
│       │   ├── AIAssistantModal.tsx       # Assistant IA d'optimisation de contenu
│       │   ├── AuthModal.tsx              # Authentification & Inscription JWT
│       │   ├── UnsavedChangesModal.tsx    # Modale de confirmation de sortie sans sauvegarde
│       │   ├── WebPublishModal.tsx        # Déploiement web, slug, QR Code & Bouclier de Sécurité
│       │   ├── ShareModal.tsx             # Partage par email et lien
│       │   └── TemplateSelectorModal.tsx  # Galerie de sélection des gabarits
│       ├── public/
│       │   └── PublicCVPage.tsx           # Page de consultation publique recruteur & déverrouillage PIN
│       └── templates/
│           ├── CVPreviewRenderer.tsx      # Moteur d'aiguillage des gabarits
│           ├── ModernCleanTemplate.tsx    # Template Moderne Épuré
│           ├── TechDeveloperTemplate.tsx  # Template Développeur / DevOps
│           ├── ExecutiveTemplate.tsx      # Template Direction / Exécutif
│           ├── CreativeMinimalTemplate.tsx# Template Créatif Minimaliste
│           ├── AcademicClassicTemplate.tsx# Template Académique ATS
│           └── AccentSplitTemplate.tsx    # Template Split Accent
```

---

## 🚦 Démarrage Rapide

### Prérequis
- **Node.js** v18.0.0 ou supérieur
- **npm** ou **bun**

### Installation des dépendances
```bash
npm install
```

### Configuration des variables d'environnement
Créez un fichier `.env` à la racine (voir `.env.example`) :
```env
# Clé Gemini pour le Copilote IA (Optionnelle, repli heuristique automatique si absente)
GEMINI_API_KEY=votre_cle_gemini

# Secret JWT pour la signature des sessions
JWT_SECRET=votre_secret_jwt_securise

# Supabase + Prisma ORM (Port 6543 Supavisor Pooler pour le runtime)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Supabase Direct Connection (Port 5432 pour les migrations Prisma)
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Initialisation de la base Supabase avec Prisma
```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers Supabase
npx prisma db push
```

### Lancement en mode Développement
```bash
npm run dev
```
L'application démarre sur `http://localhost:3000`.

### Vérification TypeScript & Linting
```bash
npm run lint
```

### Compilation & Démarrage en Production
```bash
npm run build
npm start
```

---

## 🔌 Référence des Points d'API

### Authentification & Rôles
| Méthode | Route | Rôle Requis | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Public | Récupère la session utilisateur active via cookie HttpOnly |
| `POST` | `/api/auth/login` | Public | Authentification et émission du JWT sécurisé |
| `POST` | `/api/auth/register` | Public | Création d'un nouveau compte candidat |
| `POST` | `/api/auth/logout` | Public | Révocation du cookie de session |
| `POST` | `/api/auth/demo-switch` | Public | Bascule rapide de compte pour les tests (`USER` / `ADMIN`) |

### Gestion des CVs & Copilote IA
| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cvs` | Liste de tous les CVs de l'utilisateur |
| `GET` | `/api/cvs/:id` | Récupération d'un CV avec gestion du cache L2 |
| `POST` | `/api/cvs` | Création d'un nouveau CV |
| `PUT` | `/api/cvs/:id` | Mise à jour des données d'un CV (invalidation du cache) |
| `DELETE` | `/api/cvs/:id` | Suppression d'un CV |
| `POST` | `/api/cvs/:id/publish` | Déploiement web avec configuration de sécurité (PIN, masquage, expiration) |
| `POST` | `/api/cvs/:id/duplicate` | Clonage instantané d'une version de CV |
| `POST` | `/api/ai/generate` | Génération & optimisation de contenu par Gemini 3.7 Flash |

### Consultation Recruteur & Déverrouillage Sécurisé
| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/public/cv/:slug` | Consultation publique avec contrôle d'expiration, rate limiting et masque Zero PII |
| `POST` | `/api/public/cv/:slug/unlock` | Déverrouillage sécurisé par code PIN / mot de passe |

### Administration, Télémétrie & Santé
| Méthode | Route | Rôle Requis | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | **ADMIN** | Statistiques globales, ratios d'usage et santé système |
| `GET` | `/api/admin/cvs` | **ADMIN** | Inventaire complet avec payloads bruts |
| `GET` | `/api/admin/export/all` | **ADMIN** | Téléchargement du snapshot intégral de la base de données |
| `POST` | `/api/track/export` | Public | Enregistrement télémétrique des exports (PDF, JSON, Email) |
| `GET` | `/api/metrics` | Public | Métriques au format Prometheus |
| `GET` | `/api/health` | Public | Sonde de disponibilité et de vitalité du conteneur |

---

## 🔒 Sécurité & Bonnes Pratiques

1. **Confidentialité des clés** : `GEMINI_API_KEY` et `JWT_SECRET` ne sont jamais exposés au navigateur client.
2. **Sanitisation des réponses** : Un middleware de sécurité intercepte et purge récursivement toute propriété sensible (`passwordHash`, `token`, `secret`, `apiKey`) avant l'envoi au client.
3. **Isolation des rôles** : Les routes sous `/api/admin/*` sont protégées par le middleware `requireAdmin`.
4. **Protection du Recrutement** : Le code PIN et le masquage *Click-to-Reveal* empêchent l'indexation non sollicitée et le spam téléphonique/email des candidats.

---

## 📄 Licence

Ce projet est distribué sous licence MIT. Libre d'utilisation, de modification et de déploiement.
