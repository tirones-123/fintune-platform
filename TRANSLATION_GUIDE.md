# Guide de Traduction pour FineTuner (IA Assistant)

Ce guide explique comment demander la traduction de composants React pour l'application FineTuner, en utilisant la bibliothèque `react-i18next`.

## Objectif

Traduire le texte visible par l'utilisateur du français (langue source actuelle) vers l'anglais (nouvelle langue principale) et s'assurer que le code utilise le système de traduction `react-i18next`.

## Instructions pour l'IA

Lorsque vous demandez la traduction d'un fichier ou d'un composant, veuillez suivre ces étapes :

1.  **Identifier les Chaînes à Traduire :** Repérez toutes les chaînes de caractères littérales visibles par l'utilisateur dans le code JSX et JavaScript (ex: titres, labels de boutons, placeholders, messages d'erreur, textes d'aide, etc.). N'oubliez pas les props passées à d'autres composants.
2.  **Importer `useTranslation` :** Si ce n'est pas déjà fait, importez le hook `useTranslation` de `react-i18next` en haut du fichier :
    ```javascript
    import { useTranslation } from 'react-i18next';
    ```
3.  **Initialiser le Hook :** Dans le corps du composant fonctionnel, appelez le hook pour obtenir la fonction `t` :
    ```javascript
    const { t } = useTranslation();
    ```
4.  **Créer des Clés de Traduction :** Pour chaque chaîne identifiée, créez une clé de traduction unique et logique. Utilisez une structure hiérarchique avec des points (ex: `login.title`, `common.cancel`, `project.details.descriptionLabel`). Préférez l'anglais pour les clés elles-mêmes.
5.  **Remplacer les Chaînes par `t('key')` :** Remplacez chaque chaîne de caractères en dur par un appel à la fonction `t` avec la clé correspondante :
    ```jsx
    // Avant
    <Typography>Connexion</Typography>
    <Button>Annuler</Button>

    // Après
    <Typography>{t('login.title')}</Typography>
    <Button>{t('common.cancel')}</Button>
    ```
6.  **Ajouter les Traductions aux Fichiers JSON :**
    *   Ouvrez `public/locales/en/translation.json` (Anglais - Principal).
    *   Ouvrez `public/locales/fr/translation.json` (Français).
    *   Ajoutez les nouvelles clés et leurs traductions correspondantes dans *les deux fichiers*, en respectant la structure hiérarchique JSON :
        *   **en/translation.json :**
            ```json
            {
              "login": {
                "title": "Login"
              },
              "common": {
                "cancel": "Cancel"
              }
              // ... autres clés
            }
            ```
        *   **fr/translation.json :**
            ```json
            {
              "login": {
                "title": "Connexion"
              },
              "common": {
                "cancel": "Annuler"
              }
              // ... autres clés
            }
            ```
7.  **Gérer l'Interpolation (si nécessaire) :** Si une chaîne contient des variables, utilisez l'interpolation :
    ```jsx
    // Avant
    <Typography>Bonjour {userName} !</Typography>

    // Clé: welcomeMessage = "Hello {{name}}!" (en) / "Bonjour {{name}} !" (fr)

    // Après
    <Typography>{t('welcomeMessage', { name: userName })}</Typography>
    ```
8.  **Gérer les Pluriels (si nécessaire) :** Utilisez les options de `t` pour gérer les pluriels (consultez la documentation `i18next`).
9.  **Nettoyer les Imports/Variables Inutilisés :** Après les modifications, supprimez les éventuels imports ou variables devenus inutiles.

**Exemple Complet de Demande :**

> "Peux-tu traduire le composant `frontend/src/components/auth/LoginForm.js` en anglais en suivant les instructions de `TRANSLATION_GUIDE.md` ?"

**Note :** L'anglais (`en`) est la langue principale. Les clés doivent être ajoutées en premier dans `en/translation.json`. 

**Note :** Ajouter uniqument des nouveles clés de traductions, ne jamais en supprimer.