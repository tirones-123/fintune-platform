# Documentation : Comptage de caractères & Logique de Paiement

> Cette page décrit comment les caractères sont comptés et comment les coûts/paiements sont gérés tout au long du flux de fine-tuning (frontend + backend).

---

## 1. Frontend

### 1.1 `ContentManager.js`
| Type de contenu | Source du comptage | Détails |
|-----------------|--------------------|---------|
| **Fichier uploadé (pdf/txt)** | `content_metadata.character_count` une fois le traitement terminé<br>Sinon estimation basée sur `size * 0.5` | Le backend met à jour `character_count` après OCR/parsage. |
| **YouTube** | **Estimation côté front** :<br>`estimated_characters = durée_minutes × 400` | L'estimation est envoyée au backend via `estimated_characters` lors de l'appel `POST /api/contents/url`. |
| **Website (scraping)** | Nombre de caractères exact (`description.length`) | Le texte est déjà scrapé côté front puis envoyé, donc comptage exact dès la création. |

👉 Pour chaque ajout, l'objet **Content** correspondant est poussé dans les états locaux **ET** passé au parent (`NewFineTuningFlowPage`) via les callbacks pour un comptage immédiat.

---

### 1.2 `CharacterEstimator.js`

1. Reçoit :
   * `selectedContentIds` & `selectedContents` (objets complets)
   * `freeCharactersRemaining` (quota gratuit restant renvoyé par `/api/usage-stats`).
2. Fonction centrale `getCharCountFromContent` :
   * Utilise en priorité `content_metadata.character_count` (exact).
   * Sinon `estimated_characters` (YouTube).
   * Sinon estimation fallback basée sur `duration_seconds` (YouTube) ou `size * 0.5`.
3. Calcule :
   * `totalCharacters` (exact ou estimé).
   * `estimatedCost = max(0, totalCharacters – freeCredits) × PRICE_PER_CHARACTER`.
   * `progressValue` pour la barre de progression (prend en compte l'absence de crédits gratuits).
4. Émet `onCharacterCountChange({count,isEstimated})` pour que `NewFineTuningFlowPage` garde trace du total.

---

### 1.3 `NewFineTuningFlowPage.js`

1. Agrège les IDs + objets contenus sélectionnés.
2. Récupère le solde gratuit via `characterService.getUsageStats()`.
3. Affiche le récapitulatif (étape 3) avec le nombre de caractères et le coût estimé.
4. **Envoi de la requête** `POST /api/fine-tuning-jobs` avec :
   ```jsonc
   {
     project_id: <id>,
     content_ids: [...],
     config: {
       provider, model, system_prompt, job_name
     }
   }
   ```

---

## 2. Backend

### 2.1 `contents.py ⟶ add_url_content`
* Pour **YouTube** : enregistre `estimated_characters` dans `content_metadata` quand présent.
* Pour **Website** : déduit `character_count` directement (texte déjà scrapé) et marque le contenu `completed`.

### 2.2 `fine_tuning_jobs.py ⟶ create_fine_tuning_job`
1. Récupère tous les `Content` concernés.
2. Calcule `total_characters` :
   * Si `type == youtube` **et** `status != completed` → prend `content_metadata.estimated_characters` (fallback 4000 si absent).
   * Sinon : `character_count` exact, sinon estimation fallback (`size * 0.5` ou valeur défaut).
3. Appelle `CharacterService.handle_fine_tuning_cost` pour déterminer :
   * `needs_payment`
   * `amount_usd / amount_cents`
   * `reason` (`first_free_quota`, `already_used_quota`, `low_amount`, …)
4. Branches :
   * `needs_payment == True` → création d'une session Stripe (`stripe_service.create_checkout_session`).
   * `needs_payment == False` → déduction immédiate des crédits et lancement des tâches (dataset, fine-tuning, transcriptions).

### 2.3 `character_service.py ⟶ handle_fine_tuning_cost`
Algorithme :
```
IF 1er job (has_received_free_credits=False):
    IF chars ≤ FREE_QUOTA (10 000)            → gratuit
    ELSE                                     → facturable (chars−FREE_QUOTA)
ELSE (jobs suivants):
    IF chars ≤ free_characters_remaining     → gratuit
    ELSE                                     → facturable (chars−free_remaining)

SI amount_usd < 0.60 $                       → override: gratuit (reason="low_amount")
```
Retourne un dict avec `needs_payment`, `billable_characters`, etc.

### 2.4 `payments.py`
* **Endpoint `/checkout/create-onboarding-session`**
  * Même logique : < 10 k → gratuit / déjà eus / > 10 k → Stripe.
* **Webhook `checkout.session.completed`**
  * Pour `onboarding_characters` et `fine_tuning_job` :
    * Ajoute transactions `CharacterTransaction` (gratuite & payante).
    * Met à jour `free_characters_remaining`, `total_characters_used`.
    * Crée dataset + fine-tuning puis lance les tâches.

---

## 3. Résumé des tables & champs pertinents

| Modèle | Champs clés |
|--------|-------------|
| **User** | `free_characters_remaining`, `total_characters_used`, `has_received_free_credits` |
| **Content** | `content_metadata.character_count`, `content_metadata.estimated_characters`, `size` |
| **CharacterTransaction** | `amount` (négatif = consommation), `price_per_character`, `total_price`, `payment_id` |

---

## 4. Flux complet
```
[Frontend] Sélection/Ajout contenus → Comptage local (ContentManager) → Estimation affichée (CharacterEstimator)
     ↓
[Frontend] Lancement job  (/api/fine-tuning-jobs)
     ↓
[Backend] Calcul caractères + handle_fine_tuning_cost
     ├─ Gratuit ⇒ Déduction crédits + Création Dataset/FT + Tâches
     └─ Payant  ⇒ Session Stripe
                     ↓
                  [Stripe Checkout]
                     ↓
              Webhook checkout.session.completed
                     ↓
      Transactions + Déduction crédits + Dataset/FT + Tâches
```

---

### Barèmes
* **Prix** : `0.000365 $` / caractère (≈ 0,0365 €/100 caractères).
* **Crédits gratuits** : 10 000 premiers caractères.
* **Seuil sans paiement** : montant < `0.60 $` (raison `low_amount`).

---

**Fin** 