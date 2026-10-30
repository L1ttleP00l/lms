# FR-03B.3 — Paiements du personnel

30 octobre 2026 (Europe/Paris). Branche exclusive `littlepool-dev`.

## Publication préalable et base

FR-03B.2 publié sur autorisation explicite : `5204246824dff2fb63d9f89c65b23e8965058cae`, puis **`7b197f60c9adade5e515c8bd9c38c6a9141721c7`**. Base distante vérifiée avant/après push normal depuis b223c367 ; rapport GitHub comparé à l’octet, checkout propre et aligné. Compteurs 740 FR / 2 754 PO / 3 005 POT, quatre ajouts sans retrait, 78 empreintes PO et Framework vérifiés. Diff des douze fichiers et preuves 268 Vue, cinq Python et quatre parcours sûrs relus sans relancer ces suites pour la publication. develop toujours 6b791f33b34efa15566a0cb707f5be59d136df50.

Cette base réellement publiée est la référence de FR-03B.3. **Aucun push de FR-03B.3.** Reprise AGENTS/handoff, audit FR-03A, résultats FR-03B1/B2, glossaire et plan. Réutilisation des conteneurs/dépendances/site learning.localhost ; aucune installation ni réinitialisation.

## Changements et contrats métier

**Deux sources seulement** : enrollment.ts remplace une phrase anglaise ; EnrollPaymentPanel.vue contextualise deux libellés. Scripts du panneau et handlers inchangés. AST TypeScript identique après substitution de la seule phrase ; template identique hors deux libellés. EnrollStudentsForm, EnrollSelectStep, EnrollStudentTable, api.py, bulk_enrollment.py et permissions.py comparés à la base : byte-identiques.

- `resolve_payment` valide un paiement existant ou appelle `create_payment`. Ce dernier marque payment_received=1 et recorded_by_staff=True ; il ne capture pas un paiement via une passerelle. Montant, devise, source, calculs/totaux et valeurs techniques `create`/`link` inchangés.
- `validate_linked_payment` conserve membre, cible, type d’option certificat, paiement reçu et non utilisé. Une association n’est pas un nouveau paiement. Les contrôles serveur restent nécessaires ; la visibilité frontend ne les démontre pas.
- L’API crée une inscription ou active purchased_certificate sur un inscrit, avec paiement associé/enregistré si fourni. Aucun certificat n’est délivré ici. Le savepoint par apprenant permet un résultat partiel : aucune promesse d’atomicité globale.
- Nouvelle phrase : **For each successful enrollment or upgrade, the paid certificate option is enabled and a payment is recorded or linked.** Elle limite explicitement la promesse aux opérations réussies, contrairement à la proposition « pour chaque apprenant sélectionné ». La phrase ne modifie ni les branches ni les effets. L’ancienne clé n’était pas présente dans le PO français ; aucune entrée historique retirée.
- **Change billing address** ouvre le choix d’une adresse de facturation existante. La clé globale Change (« la monnaie ») et ses autres usages (images, compte email, Framework) restent inchangés.
- **Replace billing addresses** remplace Overwrite pour expliciter l’effet sur les adresses de la sélection. Le bouton ouvre les champs locaux ; Cancel restaure les adresses précédentes et le focus. Aucun document Address existant n’est réécrit par cette action. Aucun dialogue ni règle ajouté.
- New payment → Nouveau paiement enregistré décrit le mode de futur enregistrement administratif ; aucun paiement n’est créé au simple choix de ce mode. Link existing → Associer un paiement existant conserve le mode technique et ses validations.
- can_enroll_others et can_record_payments inchangés : en session, Moderator/Batch Evaluator peuvent autoriser l’inscription sans donner automatiquement l’enregistrement des paiements ; ce dernier dépend de can_author_batch. Aucun rôle/DocPerm/API accordé ou modifié.

## Traductions françaises disponibles

**49 nouvelles valeurs**, dont les libellés prioritaires et leurs dépendances directes (champs, validation, descriptions, détails communs/individuels, accessibilité et erreurs de résultat). Le volume dépasse l’indication initiale 8–12 pour couvrir les scénarios expressément demandés ; aucune section transactions/passerelles/PDF étendue. **Aucune des 740 valeurs antérieures modifiée ou supprimée.** Les compteurs de succès/option activée/échec de FR-01F et la sélection/adresses différentes de FR-03B.2 sont réutilisés.

| Clé source exacte | Français final |
| --- | --- |
| Record payments | Enregistrer des paiements |
| Include paid certificate | Activer l'option certificat payante |
| Turn off to enroll without a payment record. | Désactivez cette option pour inscrire sans enregistrer de paiement. |
| For each successful enrollment or upgrade, the paid certificate option is enabled and a payment is recorded or linked. | Pour chaque inscription ou activation réussie, l'option certificat payante est activée et un paiement est enregistré ou associé. |
| Certificate price {0}. | Prix de l'option certificat : {0}. |
| Course price {0}. | Prix du cours : {0}. |
| Batch price {0}. | Prix de la session : {0}. |
| New payment | Nouveau paiement enregistré |
| Link existing | Associer un paiement existant |
| Payment mode for {0} | Mode d'enregistrement du paiement pour {0} |
| Payment for {0} | Paiement pour {0} |
| Select payment | Sélectionner un paiement |
| Billing address | Adresse de facturation |
| Change billing address | Modifier l'adresse de facturation |
| Replace billing addresses | Remplacer les adresses de facturation |
| Existing address | Adresse existante |
| Add new address | Ajouter une nouvelle adresse |
| Use existing address | Utiliser une adresse existante |
| Billing name | Nom de facturation |
| Address line 1 | Ligne d'adresse 1 |
| Address line 2 | Ligne d'adresse 2 |
| State | État ou région |
| Postal code | Code postal |
| Close details | Fermer les détails |
| Details for {0} students | Détails pour {0} apprenants |
| Details for all {0} students | Détails communs aux {0} apprenants |
| Empty fields use the details for all. | Les champs vides reprennent les détails communs. |
| What you enter applies to these {0}. Empty fields use the details for all. | Les informations saisies s’appliquent à ces {0} apprenants. Les champs vides reprennent les détails communs. |
| Each student's name | Nom de chaque apprenant |
| Varies | Valeurs différentes |
| Required | Obligatoire |
| Missing: {0} | Informations manquantes : {0} |
| Linked | Associé |
| Not selected | Non sélectionné |
| Enter details for {0} | Détails pour {0} |
| Enter details for {0} students | Détails pour {0} apprenants |
| Enter details for all | Détails communs |
| {0} and {1} | {0} et {1} |
| Choose a payment to link for {0} | Sélectionnez un paiement à associer pour {0} |
| Fill in {0} in the details for all | Renseignez {0} dans les détails communs |
| Fill in the missing details for {0} | Renseignez les informations manquantes pour {0} |
| Add a billing address for {0} | Ajoutez une adresse de facturation pour {0} |
| Fill in {0} for {1} | Renseignez {0} pour {1} |
| {0}: {1}, and {2} more | {0} : {1} ; autres échecs : {2} |
| {0}: {1} | {0} : {1} |
| Could not enroll students | Impossible d’inscrire les apprenants |
| Billing | Facturation |
| Requires address | Adresse obligatoire |
| Incomplete | Incomplet |

Usages partagés examinés : Change reste globalement intact ; State correspond ici au champ géographique (pas à un statut technique) ; Billing, Required, Incomplete et les formats de listes conservent un sens générique compatible avec les usages recensés. Amount/Currency/Source/City/Country/Phone, Cancel/Back et les traductions correctes préexistantes sont réutilisés. Link et SwitchRow reçoivent déjà les libellés traduits ; aucune correction redondante des enfants. Aucun contenu pédagogique ou donnée utilisateur traduit.

### Ajustement mobile constaté

La première formulation des trois boutons de détails (« Renseigner les détails… ») repoussait le bouton d’inscription hors écran à 390 px pendant la recette. **Correction linguistique seule** : Détails communs / Détails pour {0} / Détails pour {0} apprenants. Aucun CSS/layout changé. Les quatre parcours finaux réussissent par des clics ordinaires, sans force ni dispatch artificiel du clic. La longueur de noms réels extrêmes et toutes largeurs possibles ne sont pas certifiées.

## Catalogues et activation

- PO **2 754 → 2 802 entrées**, **740 → 789 traductions renseignées** : 48 nouvelles entrées copiées du POT, une entrée vide renseignée. Édition ciblée Babel contrôlée autorisée pour ce lot ; en-tête et blocs non ciblés conservés à l’octet, historique sans nettoyage. Aucune ancienne traduction française corrigée.
- POT natif `bench generate-pot-file --app lms` : **3 005 → 3 006**. **Trois ajouts** : Change billing address, Replace billing addresses, nouvelle description complète du certificat. **Deux retraits** : Overwrite, ancienne description trompeuse, sans autre appel applicatif connu. Change reste présent ; sa référence Enrollment est retirée, ses deux autres emplacements sont conservés (**un changement de références commun**, pas un déplacement de ligne). Dates d’en-tête natives seules autres variations. Diff intégral relu ; pas de perte inexpliquée, test ou chaîne parasite. Aucun POT édité manuellement.
- Babel PO/POT, paramètres `{0}`/`{1}`/`{2}`, contextes/flags, 740 valeurs précédentes et 78 autres PO (38 LMS + 40 Framework) : contrôles réussis. Framework propre au SHA 959b85de4086656273e1d158f41923dd3808c350. Aucun changement de mapping ni de Framework.
- Compilation native `bench compile-po-to-mo --app lms --locale fr`, puis `bench --site learning.localhost execute frappe.translate.clear_cache` : réussies ; seconde compilation après raccourcissement mobile. **MO 789**, les **49 valeurs finales** concordent PO/MO/dictionnaire chargé. Préférences existantes fr/en et défaut système fr contrôlés sans modification. EN source/repli préservé ; aucune surcharge parallèle runtime.

## Tests et vérifications exécutés

### Vue ciblé

**238 tests / quatre fichiers réussis en une exécution de 12,21 s** : enrollmentHelpers, enrollSteps, enrollStudentsForm, enrollDialog. **22 cas ajoutés** dans trois fichiers existants ; quatrième réutilisé sans modification. Création/association et payloads simulés, absence de paiement admissible, sélection manquante, détails incomplets, valeurs communes/surcharges, adresse/remplacement/annulation, commutateurs cours/session/certificat, résultats succès/partiel/échec FR/EN et paramètres couverts. Aucun réseau dans ces mocks.

Premier passage : 233 réussis / cinq échecs. Une attente Overwrite obsolète ; deux assertions de description vide alors que le handler transmet undefined sur succès ; deux assertions de sélection erronées après fermeture qui efface déjà les cases. Harnais corrigés selon les comportements existants, aucune logique métier modifiée. Le passage final complet de ces quatre fichiers est réussi ; pas de conclusion tirée d’une relance isolée. Les trois libellés courts du PO ont ensuite été vérifiés en navigateur et par Babel/MO, sans changement source/test ni attentes de ces tests ; suites déjà validées non relancées.

### Python / contrôles statiques / build

- **Cinq méthodes existantes d’extraction réussies, 0,087 s**, sans DB : TypeScript et régression Vue native. Nouvelle phrase TS et deux libellés démontrés extraits par la génération native/POT. Aucun extracteur personnalisé.
- **Une méthode de contrôle, sept sous-cas**, exécutant seulement les deux helpers de permission extraits en AST avec collaborateurs fictifs : cours auteur/non-auteur, session Moderator/Batch Evaluator sans droit financier, auteur de session, refus et doctype inconnu. Tous réussis, sans site/DB ; preuve ciblée hors dépôt, pas validation intégrale des permissions effectives.
- Invariants AST/textuels, Babel, conservation des paramètres/contextes, 78 empreintes PO, intégrité backend/Framework, Prettier cinq fichiers, diff et recherche ciblée de secrets : réussis.
- **Build frontend réussi, commande 16,31 s** ; déclarations components.d.ts/auto-imports.d.ts restaurées, assets/MO ignorés. Avertissements Vite/Browserslist/fs historiques conservés. Aucun build à répéter après les seules traductions courtes ; les catalogues ont été recompilés.
- Aucun test backend transactionnel ou suite applicative complète. Lanceur pre-commit global historiquement bloqué non relancé ; contrôles ciblés effectués, hooks désactivés pour les commits.

### Chromium : portée exacte

**Quatre parcours finaux FR/EN × ordinateur 1440×1000 / mobile 390×844 complets en une exécution** : commutateur actif/inactif, détails communs et adresse obligatoire, saisie d’adresse, recherche d’une adresse existante, action Modifier puis retour à une nouvelle adresse, modes nouveau/associé, sélection manquante avec bouton désactivé et raison accessible, association admissible, résultat partiel simulé (succès Ann/échec Ben), maintien de la ligne échouée ; rechargement vers option certificat et description exacte, puis refus client simulé et absence d’action de soumission. Langues natives fr/en vérifiées.

**4 recherches d’utilisateurs, 4 previews, 56 recherches search_link et 4 lectures get_value Address entièrement simulées.** Identifiants/données fictifs seulement ; get_user_info simulant un gestionnaire ne lui attribue aucun rôle serveur. Lectures annexes de configuration/cours/utilisateurs également simulées. Seuls login/ping/get_translations autorisés vers le site ; garde installée avant montage. Les consultations de discussion à effet de création ne sont jamais autorisées.

**Quatre appels enroll_students_in_course entièrement fulfill en local**, chacun vérifiant deux membres, un paiement à associer et des détails communs de montant 100 fictif pour l’autre. Ces appels sont des tentatives simulées autorisées, **pas zéro appel au total**. **Zéro écriture sensible transmise au backend**, zéro endpoint sensible imprévu tenté. Tous les autres inserts/écritures/paiements/passerelles/inscriptions/Address/certificats/notifications et méthodes inconnues sont bloqués. Aucun paiement, encaissement, compte, inscription, adresse, coupon ou certificat réel créé/modifié ; authentification de comptes fictifs seulement.

Recette finale : **zéro pageerror**, **trois réponses HTTP 400 socket.io**, **12 boot_config bloqués**. Ne pas présenter le contrôle JavaScript global comme réussi. Premier essai interrompu sur selectOption utilisé pour un Select frappe-ui qui est un bouton combobox ; corrigé dans le harnais. Deuxième essai FR ordinateur terminé, mobile expiré sur le bouton hors viewport avec les libellés longs ; 13 Failed to fetch dus aux lectures get_count/get_course_to_continue non simulées et bloquées. Ces lectures ont ensuite reçu des réponses fictives, télémétrie toujours bloquée ; logs initiaux conservés, aucun défaut applicatif masqué.

Les sessions payantes sont vérifiées en composants/helpers/contrats, pas rejouées en navigateur. Remplacement/annulation d’adresses différentes, surcharges, aucune association admissible et résultats entièrement réussis/échoués : couverture composants ; navigateur couvre le résultat partiel et l’adresse commune. Refus navigateur = garde UX de cours simulée, pas preuve d’autorisation serveur. La matrice Python confirme séparément la distinction inscription/enregistrement. Aucun test de transaction réelle ni délivrance PDF.

## Limites conservées et suite

Toast mobile FR-03B.1 non confirmé ; 16 rejets JavaScript FR-02C.2 préexistants ; contrôle JS global non validé ; risque de double clic paiement non corrigé ; dates/formats horaires hors périmètre ; transactions et encaissements réels non testés. Aucune intervention sur ces sujets.

FR-03B.4 et lots suivants : administration générale des transactions, validations serveur détaillées non couvertes par ces 49 clés, badge Upgrade encore en anglais dans la sélection de certificats, dates et formats dans leurs lots respectifs. Ne pas assimiler l’activation de l’option à une délivrance. Aucune nouvelle phase commencée.

## Livraison et preuves

Sources/tests : EnrollPaymentPanel.vue, enrollment.ts, enrollSteps.test.ts, enrollDialog.test.ts, enrollmentHelpers.test.ts. Catalogues : fr.po, main.pot. Documents : ce rapport et CODEX_HANDOFF.md. **Neuf fichiers attendus.** Commit sources/tests **bc0ce772** ; second commit catalogues/rapport/handoff à relever avec git log -1. Aucun fichier généré/secret ajouté.

Preuves hors dépôt : `/workspace/work/fr03b3/` (snapshots, translations/plan/summary, génération, Vue premier/final, permissions AST, extraction, invariants, build, compilations, check final, browser-first/second/final et captures). develop/Framework intacts. Prochaine opération : revue des deux commits et accord explicite de publication. Aucun push FR-03B.3, PR, Crowdin, déploiement, intervention OMV 8 ou début FR-03B.4.
