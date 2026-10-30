# FR-03B.2 — Sélection des inscriptions multiples

30 octobre 2026 (Europe/Paris). Base locale propre et distante réellement vérifiée **b223c367e42b29613f46c68fbac220c1e49afb40**, branche exclusive littlepool-dev. FR-03B.1 publié. Aucun push de ce lot.

## Périmètre et diagnostic natif

Reprise AGENTS/handoff, audit FR-03A, résultat FR-03B1, glossaire et plan : recherche/sélection/plafond/place/messages seulement. EnrollPaymentPanel limité à l’exception textuelle des adresses différentes. Aucun backend applicatif/API/permission/paiement/adresse/éligibilité/capacité modifié.

**Avant correction** : les trois clés sont présentes dans leurs sources et absentes du POT et du PO. Génération native `bench generate-pot-file --app lms` exécutée avant modification applicative : même catalogue de 3 001 clés, seules dates d’en-tête changées. Candidat conservé hors Git et POT suivi restauré avant correction.

Test natif comparatif avec les mappings get_method_map LMS + Framework :

| Variante équivalente | Vue | TypeScript |
| --- | --- | --- |
| __('Probe {0}', [value]) | extraite | extraite |
| Retour à la ligne avant le littéral du message | extraite | extraite |
| Tableau de remplacement contenant des sauts de ligne | **omise** | extraite |
| __('Probe {0}').format(value), arguments éventuellement multilignes | extraite | extraite |

**Cause confirmée** : les règles natives de fichiers Vue passent par l’extracteur HTML/template et TRANSLATE_PATTERN dans Framework `frappe/gettext/extractors/utils.py`. Sa partie qui saute les arguments JS utilise `.` sans DOTALL ; elle ne traverse pas les sauts de ligne du deuxième argument. Le mapping TypeScript utilise l’extracteur JavaScript, qui n’a pas cette limitation dans ces exemples. **Ce ne sont donc pas tous les appels multilignes qui échouent.** Aucune source Framework/mapping/extracteur personnalisé modifié.

Corrections locales, mêmes clés anglaises et paramètres dans le même ordre :

- StudentPicker : limite → __('You can enroll up to {0} students at a time.').format(MAX_STUDENTS).
- EnrollStudentsForm : message de places → __().format(Math.max(seatsLeft, 0), ready), avec variante singulière quand seatsLeft vaut 1.
- EnrollPaymentPanel : adresses différentes → __('Different addresses for these {0} students').format(members.length). Aucun changement de choix/remplacement/sauvegarde d’adresse.

Les scripts des trois SFC ont été comparés en AST à la base : identiques après normalisation des deux syntaxes gettext et neutralisation du seul choix de libellé singulier. MAX_STUDENTS=50, PAGE_LENGTH=20, délai 250 ms, calcul ready, Math.max, condition seatsExceeded, contrôles de soumission, déduplication, requêtes/paramètres, réponse obsolète, maintien de sélection et focus sont conservés.

La nouvelle clé **{0} seat left, {1} selected** corrige l’anglais « 1 seats ». En français, « Sélection : {1} » évite une deuxième flexion personne/personnes sans ajouter quatre combinaisons de clés ni changer les comptes. Le message ne s’affiche toujours que dans la branche payante avec places insuffisantes ; ce lot ne le rend pas visible dans d’autres états.

## Traductions disponibles

**21 valeurs nouvellement renseignées ; aucune traduction antérieure corrigée ou supprimée.** Les libellés partagés Students et les compteurs 1 student/{0} students restent pédagogiques dans les usages examinés (cours/sessions/suivi). Student → Apprenant de FR-03B.1, Member/Membre générique, Select all et les libellés déjà corrects sont conservés. Les données de recherche/noms/emails ne sont pas traduites. Different addresses… n’apparaît que pour un ensemble d’adresses différentes ; pas de logique financière élargie.

| Clé anglaise exacte | Français |
| --- | --- |
| Students | Apprenants |
| Enroll Students | Inscrire des apprenants |
| Selected students | Apprenants sélectionnés |
| Search by name or email, or paste emails | Rechercher par nom ou adresse électronique, ou coller des adresses |
| No users found | Aucun utilisateur trouvé |
| No students added | Aucun apprenant ajouté |
| Students you add will be listed here. | Les apprenants ajoutés apparaîtront ici. |
| 1 student selected | 1 apprenant sélectionné |
| {0} students selected | {0} apprenants sélectionnés |
| Remove selected students | Retirer les apprenants sélectionnés |
| Reset details for selected students | Réinitialiser les informations des apprenants sélectionnés |
| Clear selection | Effacer la sélection |
| You can enroll up to {0} students at a time. | Vous pouvez inscrire jusqu'à {0} apprenants à la fois. |
| {0} seats left, {1} selected | {0} places restantes · Sélection : {1} |
| {0} seat left, {1} selected | {0} place restante · Sélection : {1} |
| Different addresses for these {0} students | Ces {0} apprenants ont des adresses différentes |
| Could not load students | Impossible de charger les apprenants |
| 1 student | 1 apprenant |
| {0} students | {0} apprenants |
| Checking the selected students | Vérification des apprenants sélectionnés |
| Add students to enroll | Ajoutez des apprenants à inscrire |

Le repli anglais est testé avec le même plugin natif et un dictionnaire vide. Le helper de test lit le PO versionné ; aucun dictionnaire français parallèle dans l’application. Aucun identifiant technique/rôle/doctype/route/statut stocké traduit.

## Catalogue et activation

- PO **2 734 → 2 754 entrées**, **719 → 740 traductions renseignées**. 20 entrées ajoutées depuis le POT ; une entrée existante vide renseignée. Toutes les 719 valeurs antérieures et tous les blocs/en-tête non ciblés conservés, sans nettoyage.
- POT généré nativement après correction : **3 001 → 3 005**, **quatre ajouts et aucune suppression** : les trois omissions corrigées plus {0} seat left, {1} selected. **16 références communes déplacées** dans les fichiers concernés, sans changement de contexte/indicateur commun. Diff intégral relu, uniquement dates natives d’en-tête en plus ; aucune différence imprévue ou chaîne de test.
- Paramètres {0}/{1}, ordre, contextes et indicateurs contrôlés par Babel ; trois messages maintenant extractibles. Nouvelle clé singulière et clés historiques conservées.
- Compilation native LMS/fr et clear_cache natif du seul learning.localhost réussis. **MO 740 messages**, 21 valeurs identiques PO/MO/dictionnaire chargé. Préférences fr/en des comptes fictifs et système fr confirmées sans mutation.
- 78 autres PO intacts (38 LMS + 40 Framework), empreintes vérifiées ; Framework propre à 959b85de4086656273e1d158f41923dd3808c350. Aucun update-po-files, Crowdin, dépendance réinstallée ou configuration modifiée.

## Tests ciblés et bornes

### Extraction Python

Deux méthodes de régression ajoutées au fichier existant test_gettext_extraction.py. **Avant correctif applicatif** : test des vraies sources échoué sur les trois clés manquantes ; comparatif des huit variantes réussi. Après correctif : **5 méthodes du fichier réussies en une exécution, 0,049 s**, incluant les trois tests TypeScript antérieurs et les deux nouveaux. Aucune DB/site nécessaire. Premier essai du nouveau test bloqué sur indentation mixte, corrigée dans le test avant de produire l’échec de régression ci-dessus.

### Vue

**Passage final : 268 tests / six fichiers tous réussis en une exécution de 9,81 s** : studentPicker, enrollStudentsForm, enrollSteps, enrollmentHelpers, enrollDialog et courseEnrollmentForm. Tests existants réutilisés ; quatre fichiers adaptés, pas de nouveau fichier Vue de tests.

- Recherche par nom et email simulée ; mock de recherche étendu à l’adresse électronique, contrats txt/enroll_doctype/enroll_docname/include_enrolled/page_length vérifiés.
- Collage séparateurs/newlines/colonnes, adresses invalides, doublons/casse, membres exclus, changement de mode d’éligibilité, revalidation qui échoue, sélection conservée, réponse asynchrone et focus après retrait couverts par les tests existants pertinents.
- Ajouts FR/EN sur les bornes, noms accessibles, aria-live et messages de places. Le vrai plugin remplace l’ancienne fonction de traduction simplifiée dans les harnais affectés par .format ; le test de helper n’introduit pas de comportement applicatif.
- Les soumissions d’inscription des anciens tests restent des fonctions en mémoire ; aucune route serveur appelée. Les nouveaux tests de places vérifient explicitement l’absence de soumission BATCH.

| Cas simulé | Résultat vérifié |
| --- | --- |
| 0 | État vide traduit, aucune sélection ; aria-live reste vide selon le comportement existant |
| 1 | Un apprenant sélectionné, compteur singulier annoncé |
| 2 | Pluriel correct, paramètres conservés |
| 50 | Les 50 personnes restent sélectionnées, pas de message de dépassement |
| 51 proposées | Modèle plafonné à 50, message de limite avec 50, doublons traités sans changer mergeMembers |
| 0 place / 2 personnes prêtes | Message pluriel avec 0, inscription désactivée |
| 1 place / 2 personnes prêtes | Message singulier en FR/EN, inscription désactivée |
| 5 places / 2 personnes prêtes | Pas de dépassement, soumission autorisable selon mêmes autres conditions, pas de clic final |

Premier passage Vue : cinq fichiers/229 tests réussis, StudentPicker non chargé (mock hoisté utilisait les imports Vue avant leur initialisation, à cause de l’import du plugin de traduction). Factory de mock rendue asynchrone avec import Vue local ; aucun code applicatif changé pour masquer l’erreur. Final six fichiers/268 ci-dessus, pas une suite globale.

### Build, format et intégrité

Build nécessaire : **réussi, commande 16,41 s**. components.d.ts et auto-imports.d.ts sauvegardés/restaurés après fin, assets/MO non suivis. Prettier ciblé, Ruff lint/format Python, git diff --check, Babel, invariants AST et recherche ciblée de secrets réussis. Premier outil AST utilisait le chemin node_modules racine, corrigé vers frontend/node_modules existant, aucune installation. Lanceur pre-commit global historiquement bloqué non relancé ; hooks désactivés après contrôles ciblés.

## Chromium FR/EN ordinateur/mobile

**Quatre parcours réussis** (FR/EN × 1440×1000 / 390×844), cours et utilisateurs fictifs : état vide, recherche d’adresse, aucun résultat, collage de 51 adresses plus un doublon, plafond 50 et erreur accessible, ligne cochée avec annonce singulière, sélection de toutes les lignes affichées avec annonce 50, effacement des cases cochées puis retrait d’une ligne (49 restantes). Captures fictives et logs conservés. Aucune action finale d’inscription cliquée.

Garde API installée avant connexion/navigation. **16 recherches entièrement simulées**, noms/lookup/page_length/cible collectés sans données réelles ; réponses de cours et rôle gestionnaire également fictifs. get_bulk_enrollment_preview intercepté avec réponse fictive prête, mais **zéro appel dans ces parcours de cours gratuit**, conformément au fonctionnement existant. Son contrat et les places sont vérifiés en tests de composants, pas prétendus validés par le navigateur. Les parcours session et cas de paiement ne sont pas rejoués en navigateur ; leurs contrats sont couverts par les tests existants.

**Zéro requête sensible tentée et zéro transmise** : enroll_students_in_course, add_students_to_batch, insert, paiements, adresses, certificats, progression, emails et méthodes inconnues bloqués. Aucun apprenant réel consulté ni compte/inscription/certificat/Address/LMS Payment créé ou modifié. Rôle du gestionnaire simulé côté réponse get_user_info uniquement ; aucune attribution en DB. Connexion de deux comptes fictifs aux préférences fr/en existantes, sans changement de préférence.

Zéro pageerror et zéro HTTP en erreur **dans cette recette ciblée**, quatre boot_config bloqués. Cela ne valide ni l’action d’inscription réelle ni le contrôle JavaScript global. Focus après retrait et changement d’éligibilité vérifiés en composants ; pas de test exhaustif lecteur d’écran ni de rendu de toutes les conditions de paiement/adresses.

## Limites conservées / éléments reportés

- Toast de création mobile FR-03B.1 non confirmé ; 16 rejets JavaScript préexistants FR-02C.2 ; contrôle JavaScript global non validé ; double clic paiement, dates/formats horaires non traités ; aucune transaction réelle testée. Ni correction ni masquage dans ce lot.
- Valeurs financières, adresses, modes de paiement, messages détaillés de paiement et activation de l’option certificat restent FR-03B.3. Seule l’exception textuelle Different addresses a été traitée.
- La limite native d’extraction des autres appels Vue de même forme reste dans Framework ; ce lot corrige trois appels locaux et verrouille leur extraction, sans prétendre résoudre toutes les omissions possibles du projet.

## Livraison locale

Sources : StudentPicker.vue, EnrollStudentsForm.vue et EnrollPaymentPanel.vue. Tests : studentPicker.test.ts, enrollStudentsForm.test.ts, enrollSteps.test.ts, enrollDialog.test.ts, test_gettext_extraction.py. Catalogues fr.po/main.pot ; documentation ce rapport et CODEX_HANDOFF.md. **Commit source/tests : 52042468** ; commit catalogues/rapport/handoff à relever par git log -1.

Preuves hors dépôt : /workspace/work/fr03b2/ (snapshots, main.native-before.pot, diagnostic des huit variantes, échecs/réussites extraction, plans et résumé Babel, vue.log/vue-final.log, build/compile/check, invariants AST, browser.cjs/json et captures). Aucun compte/cookie/secret/asset généré ajouté. develop inchangé 6b791f33b34efa15566a0cb707f5be59d136df50, distant b223c367. **Deux commits locaux non publiés, arrêt après FR-03B.2 ; aucun FR-03B.3, PR, Crowdin, déploiement ou production OMV.** Prochaine action : revue et autorisation de publication.
