# 🎥 YouTube Indexer

> Une application complète permettant d’indexer automatiquement des chaînes et vidéos YouTube dans une base de données via l’API Google, avec une interface utilisateur intuitive pour effectuer des recherches ciblées.

---

## ⚙️ Technologies utilisées

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Symfony-000000?style=for-the-badge&logo=symfony&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" />
</p>

---

## 📌 Contexte

Ce projet permet d’automatiser l’indexation de vidéos issues de chaînes YouTube grâce à l’API Google.

### 🔁 Fonctionnalités principales :
- **Back-end (Symfony) :**
  - Route pour envoyer une requête à l’API YouTube et enregistrer les résultats en BDD.
  - Route pour rechercher les chaînes en BDD, vérifier si elles ont des vidéos, et si besoin les récupérer automatiquement depuis l’API.

- **Front-end (React) :**
  - Interface pour rechercher une chaîne YouTube et afficher les vidéos indexées.
  - Champ de recherche par mot-clé pour filtrer les vidéos d’une chaîne spécifique.

---

## 🚀 Installation du projet

### 🔧 Prérequis

- Node.js `v22.14.0`
- npm `v10.9.2`
- PHP `8.1.31`
- Composer
- Symfony CLI
- Une **clé API YouTube Data v3** (voir plus bas)

---

## 🖥️ Front-end (React)

Renommez le fichier `.env.example` en `.env` et modifiez-le pour y ajouter vos informations de connexion à la base de données.

```bash
cd frontend
npm install
npm run dev
```
Cela va lancer le serveur de développement React, généralement accessible via http://localhost:5173.
---

## 🛠 Configuration de la base de données dans le .env du Back-end
```bash
DATABASE_URL="mysql://<utilisateur>:<motdepasse>@127.0.0.1:3306/<nom_bdd>"
```
---
## 🧩 Back-end (Symfony)

Renommez le fichier `.env.example` en `.env` et modifiez-le pour y ajouter vos informations de connexion à la base de données.

```bash
cd backend
composer install
symfony serve
symfony console doctrine:database:create
symfony console d:m:m
```

Cela va lancer le serveur Symfony, généralement accessible via https://127.0.0.1:8000.

---

## 🔑 Configuration de l'API YouTube
1. Créez un projet sur la [console Google Cloud](https://console.cloud.google.com/).
2. Activez l'API YouTube Data v3.
3. Créez des identifiants d'API et copiez la clé API.
4. Ajoutez la clé API dans le fichier `.env` du back-end :
```bash
YOUTUBE_API_KEY=<votre_cle_api>
```
5. Assurez-vous que l'API est activée pour le projet et que la clé API est valide.

⚠️ Attention : Le quota de l’API YouTube peut être rapidement atteint. Il est recommandé de répartir les requêtes sur plusieurs jours, ou d’utiliser plusieurs clés si nécessaire.

---

