# FR-01D — Sécurisation de la génération des traductions

Date : 28 octobre 2026 (Europe/Paris). Dépôt `L1ttleP00l/lms`, branche `littlepool-dev`.

## Résultat et décision d’intégration

Les protections de publication amont sont ajoutées et leurs contrôles locaux réussissent. La génération native aboutit et retrouve les **13 clés FR-01B, dont les 7 nouvelles**. Le POT complet n’est toutefois **pas intégré** : son diff dépasse nettement ces sept clés. Le fichier suivi a été restauré à l’identique après conservation du candidat et de sa comparaison. Aucun PO, paramètre de site, dictionnaire runtime ou traduction française n’a changé. Aucun push, PR, workflow distant, accès Crowdin ni déploiement.

## Risque initial et protections

Le helper `.github/helper/update_pot_file.sh` installe un Bench, change le remote upstream vers `https://github.com/frappe/lms.git`, authentifie gh, pousse et ouvre une PR sur `frappe/lms`. Il n’a jamais été exécuté sans protection pendant cette mission.

- `.github/workflows/generate-pot-file.yml` : condition au niveau du job `github.repository == 'frappe/lms'`, avant tous les steps, donc aucun checkout/installation/publication dans le fork pour ce job. Les matrices, déclencheurs et autres workflows restent inchangés.
- Helper : garde immédiatement après `set -e`, exigeant à la fois `GITHUB_ACTIONS=true` et `GITHUB_REPOSITORY=frappe/lms`. Valeur absente ou différente : sortie 1 avant `cd`, installation et toute opération Git/gh. Les appels locaux sont refusés par défaut.
- `.github/helper/test_pot_publication_guard.py` : tests autonomes hors application, utilisant PyYAML déjà disponible. Aucun appel réseau. Cinq contextes non officiels échouent, dont notre fork, variables absentes et contexte officiel sans Actions ; le contexte officiel Actions franchit seulement un extrait de garde terminé par une sentinelle. Le corps de publication officiel n’est jamais exécuté par les tests. Les contextes refusés sont aussi exercés contre le vrai script protégé, avec PATH vide et HOME temporaire.

Cette garde prévient l’exécution accidentelle ; les variables locales peuvent être falsifiées. Elle ne remplace pas les permissions GitHub. Le test YAML valide structure et condition exacte ; ce n’est pas une exécution GitHub Actions distante. Ne pas réutiliser ce helper pour la génération locale du fork.

## Procédure locale reproductible

Mécanisme confirmé dans `frappe/commands/gettext.py` : `generate-pot-file --app lms` appelle `frappe.gettext.translate.generate_pot('lms')`. L’option app limite l’écriture à LMS ; la fonction utilise les extracteurs Babel natifs, sans appel de synchronisation PO ni de publication. Les fichiers Framework sont lus comme dépendance, sans modification de leur dépôt. Aucune connexion de site n’est requise avec cette option.

Depuis l’hôte, avec le conteneur existant `lms-bench` :

```bash
set -e
cd /workspace/frappe-bench/apps/lms
# Arrêter si l’une des deux vérifications échoue.
test "$(git branch --show-current)" = littlepool-dev
test -z "$(git status --porcelain)"
# Conserver une copie hors dépôt avant génération.
mkdir -p /workspace/work/fr01d
cp lms/locale/main.pot /workspace/work/fr01d/main.before.pot
# Même contrôle depuis le checkout monté dans le conteneur.
docker exec lms-bench bash -lc '
  set -e
  cd /workspace/frappe-bench/apps/lms
  test "$(git branch --show-current)" = littlepool-dev
  test -z "$(git status --porcelain)"
  cd /workspace/frappe-bench
  bench generate-pot-file --app lms
'
git diff --stat
git diff -- lms/locale/main.pot
```

Préserver les preuves précédentes avant une nouvelle exécution : le chemin de sauvegarde ci-dessus correspond à cette mission, pas à un historique automatique. Vérifier et comparer sémantiquement les couples `(msgid, contexte)`, emplacements, paramètres et indicateurs gettext, pas seulement le nombre de lignes. Arrêter l’intégration si le changement est inattendu ; conserver le candidat hors catalogue suivi et restaurer le fichier original depuis la copie. Ne pas le reconstruire ou filtrer manuellement pour ne garder que sept clés.

Commande réellement exécutée : `docker exec lms-bench bash -lc 'cd /workspace/frappe-bench && bench generate-pot-file --app lms'`. Sortie 0 : `POT file created at /workspace/frappe-bench/apps/lms/lms/locale/main.pot`. Checkout propre vérifié sur l’hôte et dans le conteneur après commit des protections. Aucun jeton nécessaire, aucune dépendance réinstallée. Ne pas appeler `update-po-files` dans cette procédure.

## Comparaison du POT généré

| Mesure | Résultat |
| --- | --- |
| Entrées hors en-tête avant / après | 2 673 / 2 780 |
| Ajouts / suppressions | 111 / 4 (solde +107) |
| Couples clé/contexte communs | 2 669, identiques |
| Entrées communes dont les références changent | 444 |
| Indicateurs gettext modifiés sur les clés communes | 0 |
| Contextes explicites avant / après | 0 / 0 |
| Diff brut | 961 lignes ajoutées, 469 retirées ; 1 430 lignes |
| Validation du candidat avec Babel `Catalog.check()` | Aucune erreur |

Tous les msgstr du candidat restent vides ; les sources sont conservées, sans traduction française injectée. Les paramètres des clés communes sont préservés par identité exacte des msgid et indicateurs. `Uploading {0}%` conserve `{0}`, le `%` littéral et `python-brace-format`, avec référence au composant Unsplash. Aucun contexte explicite n’existait dans les catalogues comparés ; pas de nouveau test synthétique des contextes de l’extracteur.

### Les treize clés FR-01B

| Clé exacte | Avant | Candidat natif |
| --- | --- | --- |
| `Student Progress` | Absente | Présente |
| `Courses` | Présente | Présente |
| `Signups` | Présente | Présente |
| `Enrollments` | Présente | Présente |
| `Completions` | Absente | Présente |
| `Certifications` | Absente | Présente |
| `Signups per day` | Absente | Présente |
| `Enrollments per day` | Absente | Présente |
| `Certifications per day` | Absente | Présente |
| `Course Completion` | Absente | Présente |
| `search by keyword` | Présente | Présente |
| `Upload Image` | Présente | Présente |
| `Uploading {0}%` | Présente | Présente |

Les sept nouvelles sont Student Progress, Completions, Certifications, Signups per day, Enrollments per day, Certifications per day et Course Completion. La clé supplémentaire d’accessibilité `Search by keyword` reste distincte de `search by keyword` ; aucune source renommée.

### Pourquoi ne pas intégrer ce résultat maintenant ?

Le POT versionné provient du commit amont `d1792003`, daté du 23 octobre 2026. Le code de base LMS contient déjà des évolutions ultérieures : notamment `5a668b04` (dialogue d’inscription), `93dfb5cf` (sélection) et les helpers de paiement en masse. Les 104 ajouts autres que les sept FR-01B pointent sur ces surfaces métier et d’autres évolutions préexistantes (quiz, permissions, paramètres pédagogiques). Ces fichiers n’ont pas été modifiés dans FR-01D. Un décalage entre le dernier POT amont et le code courant explique probablement l’essentiel du diff ; aucune preuve d’un simple défaut des sept enveloppes Vue.

Les quatre anciennes clés supprimées sont listées ci-dessous ; la recherche ciblée ne les retrouve plus comme libellés exacts du code courant. Ce n’est pas une suppression massive (4/2 673), mais le changement global dépasse le lot prévu. **Intégration arrêtée**, sans sélection manuelle des entrées. Une revue explicite du rafraîchissement global est nécessaire avant de versionner le POT.

- `Enroll Student`
- `Please select a payment for the purchased certificate.`
- `Please select a student to enroll.`
- `Student enrolled successfully`

Les artefacts locaux sont conservés dans `/workspace/work/fr01d/` : `main.before.pot`, `main.generated.pot`, `main.generated.diff`, `comparison.json`, `generation.log`, `before.json`, `compare.py` et `validate_generated.py`. Ils sont hors Git et leur conservation dépend de la restauration du workspace. Le tableau d’ajouts ci-dessous et les suppressions ci-dessus conservent la comparaison utile dans ce rapport versionné. Aucun POT généré n’est committé.

## Contrôles réellement exécutés

- Git initial : littlepool-dev propre, local et distant `040496fa78636a42eca414020973e6fe3640bc34` ; develop distant `6b791f33b34efa15566a0cb707f5be59d136df50`.
- `python .github/helper/test_pot_publication_guard.py -v` : 2 méthodes unittest réussies, incluant les 6 contextes du script ; vérification du refus réel dans les 5 cas interdits. Aucun setup ni corps officiel exécuté.
- `bash -n` : réussi ; lecture YAML, AST/compilation Python, Ruff lint et format du test : réussis avec les outils existants.
- Aide Bench, lecture native et génération : réussies ; contrôle Babel du candidat : réussi. Assertions des 13 clés, 7 nouvelles, interpolation, indicateurs et msgstr vides : réussies.
- Empreintes de **79 fichiers PO** LMS et Framework avant/après : identiques. Remotes LMS, HEAD et état Git Framework : identiques. POT suivi restauré octet pour octet. Diff relu et `git diff --check` réussi ; recherche ciblée de secrets effectuée avant commit documentaire.
- Le lanceur pre-commit global n’a pas été relancé (blocage d’installation npm déjà connu) ; contrôles ciblés utilisés. Aucun test Vue, backend applicatif, build, navigateur, recompilation MO, changement de langue ni vérification HTTP : sans rapport avec ce changement de CI/extraction. FR-01A n’est pas réexécuté.

## Fichiers, commits et suite

Commit local des protections : `a628ed1a` (`ci(i18n): restrict upstream POT publication to official repository`). Fichiers : helper, workflow et test de garde. Un second commit documentaire porte ce rapport et `CODEX_HANDOFF.md` ; relever son identifiant avec `git log -1`. Aucun commit du POT. Aucun push autorisé pour FR-01D.

Prochaine action : soumettre la comparaison des 111 ajouts / 4 retraits et obtenir l’accord pour une revue/intégration du rafraîchissement global du POT. Sans cet accord, conserver le POT suivi inchangé. Puis, après décisions distinctes, valider le circuit Crowdin, son budget/droits, le glossaire et les traductions candidates avant toute configuration, synchronisation ou import PO. Les traductions françaises manquantes restent manquantes à l’exécution. Le nom commercial reste également à valider. Arrêt après FR-01D, sans FR-02.

## Annexe — Inventaire des 111 ajouts du candidat non intégré

Sources et numéros de ligne observés au moment de la génération ; une seule référence est montrée lorsqu’il y en a plusieurs. Toutes les entrées ont un contexte absent.

| Clé source | Première référence |
| --- | --- |
| `1 student selected` | `frontend/src/components/Enrollment/EnrollSelectionBanner.vue:104` |
| `Add a billing address for {0}` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:548` |
| `Add new address` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:122` |
| `Add students to enroll` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:557` |
| `Address must be an Address name or an object with only these keys: {0}.` | `lms/lms/bulk_enrollment.py:105` |
| `Billing` | `frontend/src/components/Enrollment/EnrollStudentTable.vue:22` |
| `Billing address` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:107` |
| `Cannot submit for another user` | `lms/lms/permissions.py:1703` |
| `Certificate already purchased by {0}.` | `lms/lms/api.py:3747` |
| `Certifications` | `frontend/src/pages/Statistics.vue:42` |
| `Certifications per day` | `frontend/src/pages/Statistics.vue:78` |
| `Check your connection and try again.` | `frontend/src/components/Quiz.vue:710` |
| `Checking the selected students` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:556` |
| `Choose a payment to link for {0}` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:524` |
| `Clear selection` | `frontend/src/components/Enrollment/EnrollSelectionBanner.vue:100` |
| `Close details` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:25` |
| `Completions` | `frontend/src/pages/Statistics.vue:35` |
| `Could not enroll students` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:700` |
| `Could not load students` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:626` |
| `Course Completion` | `frontend/src/pages/Statistics.vue:88` |
| `Details for all {0} students` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:382` |
| `Details for {0} students` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:381` |
| `Each student's name` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:496` |
| `Empty fields use the details for all.` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:386` |
| `Enforce Assignment Passing` | `lms/lms/doctype/lms_settings/lms_settings.json:592` |
| `Enforce Open-ended Quiz Passing` | `lms/lms/doctype/lms_settings/lms_settings.json:586` |
| `Enforce Programming Exercise Completion` | `lms/lms/doctype/lms_settings/lms_settings.json:574` |
| `Enforce Programming Exercise Passing` | `lms/lms/doctype/lms_settings/lms_settings.json:598` |
| `Enforce Quiz Passing` | `lms/lms/doctype/lms_settings/lms_settings.json:580` |
| `Enroll Students` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:3` |
| `Enrollments per day` | `frontend/src/pages/Statistics.vue:67` |
| `Enter details for all` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:467` |
| `Enter details for {0}` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:462` |
| `Enter details for {0} students` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:465` |
| `Every address value must be text.` | `lms/lms/bulk_enrollment.py:110` |
| `Existing address` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:114` |
| `Fill in the missing details for {0}` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:545` |
| `Fill in {0} for {1}` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:550` |
| `Fill in {0} in the details for all` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:528` |
| `Include enrolled must be true or false.` | `lms/lms/api.py:3813` |
| `Invalid course or batch.` | `lms/lms/api.py:3788` |
| `Invalid course.` | `lms/lms/api.py:3700` |
| `Link existing` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:354` |
| `Linked payments` | `lms/lms/bulk_enrollment.py:216` |
| `Linked payments must map each user email to an LMS Payment name.` | `lms/lms/bulk_enrollment.py:220` |
| `Member payment details` | `lms/lms/bulk_enrollment.py:148` |
| `Member payment details can cover at most {0} students.` | `lms/lms/bulk_enrollment.py:153` |
| `Member payment details must map each user email to an object.` | `lms/lms/bulk_enrollment.py:150` |
| `Member payment details name {0} more than once.` | `lms/lms/bulk_enrollment.py:163` |
| `Member payment details name {0}, who is not in the members list.` | `lms/lms/bulk_enrollment.py:161` |
| `Members must be a list of user emails. Remove empty entries and try again.` | `lms/lms/bulk_enrollment.py:46` |
| `Missing: {0}` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:61` |
| `Names must be a list of users.` | `lms/lms/api.py:3817` |
| `New payment` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:353` |
| `No payment was given for {0}. Add a payment for this student.` | `lms/lms/api.py:3677` |
| `No students added` | `frontend/src/components/Enrollment/StudentPicker.vue:69` |
| `No user found with the email {0}.` | `lms/lms/bulk_enrollment.py:280` |
| `No users found` | `frontend/src/components/Enrollment/StudentPicker.vue:15` |
| `Not enrolled in batch` | `lms/lms/doctype/lms_batch_feedback/lms_batch_feedback.py:23` |
| `Only students in a course or batch that uses this quiz can take it. Ask your instructor to add you.` | `frontend/src/components/Quiz.vue:707` |
| `Overwrite` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:181` |
| `Page length must be a number.` | `lms/lms/api.py:3815` |
| `Payment amount must be a number that is zero or more.` | `lms/lms/bulk_enrollment.py:71` |
| `Payment arguments must be JSON objects.` | `lms/lms/api.py:3658` |
| `Payment details` | `lms/lms/bulk_enrollment.py:127` |
| `Payment details for {0} must be an object with only these keys: {1}.` | `lms/lms/bulk_enrollment.py:175` |
| `Payment details must have amount and currency, and may add source and address.` | `lms/lms/bulk_enrollment.py:130` |
| `Payment for {0}` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:50` |
| `Payment mode for {0}` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:40` |
| `Payment {0} cannot be linked to {1} for {2}. Link a received payment made by this user for this {3}.` | `lms/lms/bulk_enrollment.py:385` |
| `Payment {0} is already used by an enrollment. Link a payment that is not yet used.` | `lms/lms/bulk_enrollment.py:393` |
| `Payments can only be recorded for a paid batch.` | `lms/lms/api.py:3665` |
| `Payments can only be recorded for a paid course or a purchased certificate.` | `lms/lms/api.py:3726` |
| `Per-student payment details need the common payment details too.` | `lms/lms/bulk_enrollment.py:209` |
| `Purchased certificate must be true or false.` | `lms/lms/api.py:3704` |
| `Remove selected students` | `frontend/src/components/Enrollment/EnrollSelectionBanner.vue:98` |
| `Required` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:491` |
| `Requires address` | `frontend/src/components/Enrollment/EnrollStudentTable.vue:80` |
| `Reset details for selected students` | `frontend/src/components/Enrollment/EnrollSelectionBanner.vue:99` |
| `Search by name or email, or paste emails` | `frontend/src/components/Enrollment/StudentPicker.vue:14` |
| `Select payment` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:51` |
| `Selected students` | `frontend/src/components/Enrollment/EnrollSelectionBanner.vue:17` |
| `Signups per day` | `frontend/src/pages/Statistics.vue:56` |
| `Source is required.` | `lms/lms/doctype/lms_payment/lms_payment.py:21` |
| `Student Progress` | `frontend/src/pages/Courses/StudentCourseProgress.vue:4` |
| `Students you add will be listed here.` | `frontend/src/components/Enrollment/StudentPicker.vue:70` |
| `The address for {0}` | `lms/lms/bulk_enrollment.py:199` |
| `The certificate cannot be bought separately on a paid course. Turn off the certificate switch and try again.` | `lms/lms/api.py:3718` |
| `The common address` | `lms/lms/bulk_enrollment.py:137` |
| `Upgrade` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:345` |
| `Use existing address` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:222` |
| `User {0} is disabled.` | `lms/lms/bulk_enrollment.py:282` |
| `Varies` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:534` |
| `What you enter applies to these {0}. Empty fields use the details for all.` | `frontend/src/components/Enrollment/EnrollPaymentPanel.vue:388` |
| `You can enroll at most {0} students at a time. Remove {1} and try again.` | `lms/lms/bulk_enrollment.py:57` |
| `You can only submit a {0} for yourself, not for {1}.` | `lms/lms/permissions.py:1699` |
| `You cannot enroll students in this course.` | `lms/lms/api.py:3702` |
| `You cannot enroll students in this {0}.` | `lms/lms/bulk_enrollment.py:403` |
| `You cannot record payments for this batch.` | `lms/lms/api.py:3663` |
| `You cannot record payments for this course.` | `lms/lms/api.py:3724` |
| `{0} and {1}` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:508` |
| `{0} for {1} cannot be empty.` | `lms/lms/bulk_enrollment.py:193` |
| `{0} for {1} must be text.` | `lms/lms/bulk_enrollment.py:188` |
| `{0} has a linked payment, so their payment details cannot be changed.` | `lms/lms/bulk_enrollment.py:166` |
| `{0} is missing {1}. Fill these in, or clear the address to record none.` | `lms/lms/bulk_enrollment.py:115` |
| `{0} is not enrolled in batch {1}, so cannot give feedback on it.` | `lms/lms/doctype/lms_batch_feedback/lms_batch_feedback.py:19` |
| `{0} is not valid JSON. Send it as a JSON value and try again.` | `lms/lms/bulk_enrollment.py:39` |
| `{0} names an address that does not exist. Choose an existing address.` | `lms/lms/bulk_enrollment.py:100` |
| `{0} students` | `frontend/src/components/Enrollment/EnrollStudentsForm.vue:514` |
| `{0} students selected` | `frontend/src/components/Enrollment/EnrollSelectionBanner.vue:105` |
| `{0} {1} does not exist. Choose an existing {0}.` | `lms/lms/bulk_enrollment.py:76` |

## Revue approfondie du comparatif — 28 octobre 2026

Cette analyse réutilise exclusivement les POT et comparaisons conservés ; aucune génération, suite de tests ou compilation relancée. Elle précise la décision provisoire précédente. Le candidat contient bien les 111 clés nouvelles annoncées, toutes retrouvées dans les sources à leurs références, et les 13 clés FR-01B. Aucune entrée ajoutée ne provient d’un fichier de test, d’un asset généré ou d’une dépendance. Les clés sont distinctes, avec contexte absent ; plusieurs usages d’une même clé sont regroupés normalement.

### Quatre suppressions : origine, remplacement et impact

| Clé anglaise exacte | Ancienne origine dans le POT | Situation et remplacement actuels |
| --- | --- | --- |
| `Enroll Student` | BatchStudentForm.vue:2 et CourseEnrollmentForm.vue:2 | Ancien titre singulier disparu. Les deux pages délèguent maintenant au composant Enrollment/EnrollStudentsForm.vue, dont le titre est `Enroll Students` (ligne 3). Nouvelle clé plurielle : pas de transfert automatique de traduction. |
| `Please select a student to enroll.` | BatchStudentForm.vue:152 et CourseEnrollmentForm.vue:172 | Ancien toast de validation disparu. Le parcours accepte plusieurs membres et désactive l’action sans sélection (`canEnroll`, lignes 329–338 du formulaire partagé). `Add students to enroll`, `No students added`, `Students you add will be listed here.` orientent la sélection. Remplacement fonctionnel, sans clé équivalente unique. |
| `Student enrolled successfully` | BatchStudentForm.vue:164 et CourseEnrollmentForm.vue:191 | Ancien toast disparu. Le résultat est construit par `enrollOutcome` dans Enrollment/enrollment.ts:125–155, appelé par le formulaire partagé:671. Succès : `1 student enrolled` / `{0} students enrolled` ; résultat distinct pour mise à niveau du certificat et erreurs partielles. **Ces clés de résultat ne sont pas dans le candidat**, voir lacune TypeScript ci-dessous. |
| `Please select a payment for the purchased certificate.` | CourseEnrollmentForm.vue:176 | Ancienne validation du certificat disparu. Le parcours commun distingue création et liaison d’un paiement. `Choose a payment to link for {0}` (formulaire:524), `Fill in {0} in the details for all` (:528) et les validations backend assurent désormais cette information. Pas de correspondance univoque ; relire chaque nouvelle traduction dans son contexte. |

L’historique `74aad759` confirme le passage aux inscriptions multiples et la suppression des anciens toasts ; `5a668b04` poursuit la refonte du dialogue partagé. Les quatre chaînes exactes ne figurent plus dans les sources applicatives courantes. Leur présence historique dans les PO/POT ne constitue pas un usage actif.

Le PO français contient les quatre entrées mais leurs traductions sont vides : aucune traduction FR renseignée ne serait perdue pour ces quatre clés. D’autres langues ont des traductions non vides : 3 pour `Enroll Student` (bs, eo, sv), 13 pour chacune des trois autres (bs, da, de, eo, es, hr, mn, sk, sr, sr_CS, sv, uz, zh_TW). Ce comptage inclut toute valeur non vide et ne certifie ni approbation ni qualité. L’intégration d’un POT seul ne modifie ni PO ni MO, donc ne supprime pas immédiatement ces traductions au runtime. Un futur import/synchronisation pourra les rendre obsolètes ; conserver la mémoire de traduction et revoir les suggestions/fuzzy, surtout singulier → pluriel et ancien paiement → nouveau parcours. Ne pas recopier automatiquement l’ancien texte sur les nouvelles clés.

### Classement des 111 ajouts

Attribution à la première référence pour obtenir des groupes disjoints totalisant 111. L’annexe précédente conserve l’inventaire clé par clé et ses références.

| Origine | Nombre | Fonction et appréciation |
| --- | ---: | --- |
| Enrollment/EnrollStudentsForm.vue | 16 | Dialogue, choix et détails d’inscription ; textes visibles réels. Interpolations et fragments de liste à relire linguistiquement. |
| Enrollment/EnrollPaymentPanel.vue | 19 | Paiement, adresse et détails communs/individuels ; textes visibles, aides et valeurs de présentation. |
| Enrollment/EnrollSelectionBanner.vue | 6 | Sélection et actions collectives ; formes `1 student selected` / `{0} students selected` intentionnelles, non doublons. |
| Enrollment/StudentPicker.vue | 4 | Recherche, sélection et états vides ; textes visibles. |
| Enrollment/EnrollStudentTable.vue | 2 | Colonne `Billing` et indication `Requires address` ; préciser le contexte comptable pour la revue. |
| lms/lms/bulk_enrollment.py | 30 | Erreurs de validation membres, paiement et adresse ; messages destinés aux utilisateurs/API. Vocabulaire technique, mais pas de pollution par des identifiants internes seuls. |
| lms/lms/api.py | 15 | Validations d’inscription, permissions et paiement ; erreurs effectivement transmises à l’appelant. |
| Statistics.vue | 6 | Statistiques FR-01B : titres et sous-titres. Signups = comptes créés ; Certifications = certificats publiés : ambiguïtés déjà documentées, à traiter dans le glossaire. |
| Courses/StudentCourseProgress.vue | 1 | Titre Student Progress, FR-01B. |
| Quiz.vue | 2 | Erreur de connexion et refus d’accès au quiz ; messages destinés au lecteur. |
| lms_settings.json | 5 | Libellés administrateur des exigences de réussite ; destinés à la traduction. |
| permissions.py | 2 | Erreur et titre du refus de soumission pour autrui ; tous deux affichables. |
| lms_batch_feedback.py | 2 | Refus de retour sur une session sans inscription ; message et titre. |
| lms_payment.py | 1 | Source is required., validation affichable. |

Points de vigilance non bloquants pour les 111 ajouts :

- `Payment arguments must be JSON objects.`, `Linked payments must map each user email to an LMS Payment name.` et les erreurs de clés autorisées sont techniques **mais traduisibles** car elles expliquent une erreur à l’appelant. JSON, noms de DocTypes, noms de champs transmis en paramètres et identifiants doivent rester reconnaissables dans la traduction. Aucun chemin de fichier, secret, SQL ou nom de fonction isolé n’a été trouvé parmi ces 111 clés.
- `Member payment details`, `Payment details`, `Linked payments`, `The common address` sont des libellés employés dans des erreurs composées ; ce ne sont pas des variables accidentellement extraites. Relire les accords avec le message enveloppant.
- `Upgrade`, `Required`, `Varies` et les fragments `{0} and {1}` / `{0} students` demandent leur contexte métier. `What you enter applies to these {0}. Empty fields use the details for all.` insère un nombre de lignes : source anglaise peu naturelle, sans perte de paramètre ni défaut d’extraction. À améliorer seulement dans une mission sources autorisée.
- Pas de doublon exact nouveau détecté. Les formes singulier/pluriel sont des clés séparées voulues. Les différences de casse (`Billing name` dans TypeScript / `Billing Name` ailleurs, recherche Unsplash majuscule/minuscule) ne doivent pas être fusionnées automatiquement.

### Lacune confirmée : messages TypeScript absents

Le remplacement de `Student enrolled successfully` conduit à des clés visibles dans `frontend/src/components/Enrollment/enrollment.ts`, absentes du candidat :

- `1 student enrolled` / `{0} students enrolled`.
- `1 student upgraded to certificate` / `{0} students upgraded to certificate`.
- `1 student could not be enrolled` / `{0} students could not be enrolled`.

Les actions `Enroll 1 student` / `Enroll {0} students` du même module sont également absentes. Le formulaire appelle les helpers correspondants : il ne s’agit pas de code de test ou de simples chaînes inutilisées.

La configuration Framework `babel_extractors.csv` couvre `.py`, `.js`, `.html`, `.vue` et plusieurs JSON, mais aucun `.ts` ; LMS ne fournit pas de `babel_extractors.csv` propre. Le mécanisme natif utilise la première règle correspondant au fichier. Ces constats expliquent l’omission sans lancer une nouvelle extraction. Cela ne remet pas en cause l’extraction des 13 clés Vue FR-01B, mais empêche de qualifier le candidat de couverture complète du nouveau parcours d’inscription. Ni les six clés de résultat ni les deux boutons ne doivent être ajoutés manuellement au POT.

### Les 444 modifications de références

Comptage par entrée commune, et non par ligne du diff :

| Catégorie exclusive | Entrées | Effet |
| --- | ---: | --- |
| Mêmes chemins et même multiplicité, seuls numéros de ligne modifiés | 409 | Déplacement dans les fichiers ; aucune identité gettext modifiée. |
| Mêmes chemins, nombre d’occurrences modifié | 6 | Enrollments, Include in preview, Members must be a list of users., Search text must be text., Try again, Upcoming. Usages ajoutés ou retirés dans un fichier existant. |
| Ensemble de chemins modifié | 29 | 22 ajouts de chemins uniquement, 4 retraits uniquement, 3 cas mixtes. Il s’agit de lieux d’usage, pas de 29 fichiers renommés. |
| Total | 444 | Aucun changement de msgid, msgctxt ou indicateur gettext des clés communes. |

Les quatre retraits de chemins uniquement concernent `All`, `Enroll`, `Error`, `Purchased Certificate`. Les trois cas mixtes sont `Loading...`, `Payment`, `Student` : notamment déplacement des anciens formulaires vers les composants partagés. Les 22 ajouts correspondent surtout au nouveau dialogue, aux validations backend et à FR-01B : Courses/Signups/Enrollments dans les statistiques, ainsi que recherche et upload Unsplash.

Impact sémantique : aucune modification de contexte explicite gettext (msgctxt absent avant et après). En revanche, de nouveaux usages élargissent le contexte de revue : `Source` dans une validation de paiement, `New` comme statut d’inscription, `Incomplete` dans le tableau d’inscription, `Signups` dans les statistiques. Les traducteurs doivent examiner ces usages partagés ; une référence seule n’invalide pas une traduction mais peut exposer une ambiguïté globale. Pour les 409 déplacements, le classement décrit les métadonnées de référence ; il ne constitue pas un test fonctionnel de tous les écrans.

Aucun chemin extérieur, référence à un artefact généré ou déplacement inexpliqué relevé. Les ajouts d’usages et suppressions sont cohérents avec les modifications préexistantes. Anomalie significative : couverture TypeScript manquante, distincte de ces 444 changements normaux.

### Recommandation et contrôles ultérieurs

**Recommandation : intégration après correction du périmètre d’extraction, avec nouvelle extraction contrôlée nécessaire ensuite.** Le candidat est un instantané cohérent du périmètre natif actuel ; ses 111 ajouts et 4 suppressions ne justifient pas un filtrage manuel. Mais le remplacement du message de succès par des clés TypeScript absentes est une lacune concrète à résoudre avant de présenter le rafraîchissement comme complet.

Prochaine autorisation à demander : étude/correction minimale du périmètre d’extraction côté LMS, sans changer Framework. Examiner un mapping Babel propre à LMS utilisant un extracteur natif compatible avec le TypeScript réel ; sa compatibilité doit être vérifiée par un contrôle ciblé, pas supposée. Puis générer à nouveau nativement, revoir le diff complet et les nouvelles clés par rapport à ce candidat. Aucun de ces travaux n’a été effectué pendant cette analyse.

Après autorisation et intégration du POT revu : contrôler les 13 clés FR-01B, les clés TypeScript de résultat/action, l’absence de pertes inattendues, les paramètres/contextes/indicateurs et les traductions sources anglaises ; vérifier que seuls les fichiers autorisés changent et que les PO restent intacts. Le futur import PO par le circuit approuvé devra préserver la mémoire des clés obsolètes, faire relire les fuzzy, puis contrôler la compilation et le comportement FR/EN ciblé. L’intégration d’un POT seul n’active aucune traduction française.

Revue effectuée : lecture des artefacts et des sources, comparaison des références, recherche des chaînes exactes et consultation de l’historique Git ; lecture des PO pour évaluer l’impact des quatre suppressions. Un petit lecteur de catalogues hors dépôt a servi à classer les références et à contrôler les occurrences ; aucun extracteur ni test déjà validé n’a été relancé. Une première lecture des références des PO a rencontré un ancien format sans numéro de ligne ; le lecteur d’analyse a été adapté, sans modifier de catalogue. POT suivi, PO et sources applicatives inchangés ; aucune intégration autorisée ni exécutée.

## FR-01D.2 — Extraction TypeScript corrigée (28 octobre 2026)

**Résultat : candidat natif de 2 980 clés, non intégré.** La lacune TypeScript identifiée dans la revue précédente est résolue. Cette section actualise sa recommandation : le candidat complet peut désormais être proposé à l’intégration après validation du propriétaire. Aucune traduction française nouvelle n’est activée par cette correction.

### Mapping natif ajouté

Fichier racine `babel_extractors.csv` :

```csv
frontend/src/**.d.ts,ignore
frontend/src/**.test.ts,ignore
frontend/src/**.spec.ts,ignore
frontend/src/tests/**.ts,ignore
frontend/src/**/__tests__/**.ts,ignore
frontend/src/**.ts,frappe.gettext.extractors.javascript.extract
```

`get_method_map('lms')` lit ce CSV depuis la racine LMS. `generate_pot()` ajoute ensuite les règles Framework ; Babel utilise la première règle correspondante. Les exclusions sont limitées aux fichiers TypeScript : aucune règle Vue/JavaScript/Python/JSON existante n’est remplacée. Les fichiers de configuration hors frontend/src, dépendances et assets publics ne sont pas inclus par cette nouvelle règle. Les déclarations .d.ts (notamment générées) sont exclues. Aucun extracteur personnalisé, transpilation ou modification Framework.

L’extracteur JavaScript natif est un analyseur lexical, pas un compilateur TypeScript. Compatibilité vérifiée avec le module réel enrollment.ts (interfaces, types, génériques, assertions, optional chaining, callbacks et tableaux de paramètres), d’autres modules réels et un exemple ciblé contenant `import type`, `satisfies`, `as`, types génériques, coalescence, paramètres et contexte. Cela ne garantit pas toute syntaxe TypeScript future, les appels dynamiques ou les fichiers .tsx, hors périmètre de cette règle.

### Régression automatisée et contrôles

Nouveau test autonome `lms/tests/test_gettext_extraction.py`, sans site ni base : il combine les mappings natifs dans le même ordre que generate_pot et utilise Babel sur des copies temporaires des sources/fixtures, sans écrire de catalogue.

Commande réellement exécutée dans le conteneur existant :

```bash
docker exec lms-bench bash -lc 'cd /workspace/frappe-bench && env/bin/python -m unittest discover -s apps/lms/lms/tests -p test_gettext_extraction.py -v'
```

- Avant ajout du CSV : **3 tests échoués**, dont absence des huit messages d’inscription.
- Après correction, puis validation finale après rangement des imports : **3/3 tests réussis**, 0,051 s lors du passage final.
- Test réel : huit clés d’inscription et échantillons proctoring, quizSummary, useSettingsSource ; paramètres conservés.
- Test syntaxe : clé exacte `Result {0}: {1}`, contexte `Enrollment outcome`, occurrences répétées, absence des commentaires et arguments secondaires parasites.
- Test périmètre : .test.ts/.spec.ts, dossiers tests et __tests__, .d.ts, configuration, dépendances et assets hors périmètre exclus ; règles JS, Vue et Python préservées.
- Tests de garde publication : **2/2 méthodes réussies**, six contextes, aucun corps de publication exécuté. `bash -n` réussi. Contrôle YAML inclus dans ces tests.
- Ruff a signalé puis corrigé un ordre d’imports dans le nouveau test ; lint et format ciblés réussis. `git diff --check` et recherche ciblée de secrets réussis.
- Aucun test Vue ou backend applicatif complet, aucun build, navigateur, HTTP, compilation MO ou changement de langue. Lanceur pre-commit global non relancé (blocage npm précédemment documenté) ; outils existants réutilisés, aucune installation.

### Génération et nombres exacts

Après commit local du correctif/test, branche et checkout propre vérifiés dans le conteneur. Commande native : `bench generate-pot-file --app lms`, exécutée depuis /workspace/frappe-bench dans lms-bench. Sortie 0 ; aucun helper amont, aucune publication, aucun appel update-po-files ou Crowdin. Le candidat a été copié hors Git avant restauration octet pour octet du POT suivi.

| Comparaison | Avant | Après | Ajouts | Suppressions | Entrées communes avec références modifiées |
| --- | ---: | ---: | ---: | ---: | ---: |
| POT suivi → candidat FR-01D.2 | 2 673 | 2 980 | 311 | 4 | 506 |
| Candidat FR-01D → candidat FR-01D.2 | 2 780 | 2 980 | 200 | 0 | 93 |

Les 311 ajouts correspondent aux 111 déjà examinés plus 200 clés TypeScript supplémentaires. Les quatre suppressions restent exactement celles du formulaire individuel détaillées plus haut : aucune perte supplémentaire. Les 93 modifications de références par rapport au candidat précédent viennent de nouveaux usages TypeScript de clés déjà présentes. Les indicateurs gettext communs sont inchangés. Diff brut contre le POT suivi : 1 957 lignes ajoutées, 479 retirées ; à distinguer des nombres de messages.

Inventaire natif du périmètre : **434 fichiers .ts**, dont **256 ignorés**, 178 éligibles, **38 contenant 365 occurrences**, regroupées en **293 couples clé/contexte distincts**. Parmi ces 293 clés, 200 sont nouvelles et 93 déjà présentes. Les 140 autres fichiers éligibles n’apportent aucun message. Toutes les occurrences extraites de cet inventaire sont présentes dans le candidat ; aucun emplacement de test/spec/déclaration TypeScript ne pollue ce catalogue. La comparaison auxiliaire avec les appels littéraux des sources n’a montré qu’un écart : un exemple `__('Open the ')` dans un commentaire de transactions.ts, correctement ignoré.

### Messages attendus et qualité du candidat

Les **13/13 clés FR-01B** restent présentes. Les **8/8 clés TypeScript** sont maintenant présentes exactement :

| Clés de résultat ou d’action |
| --- |
| `1 student enrolled` |
| `{0} students enrolled` |
| `1 student upgraded to certificate` |
| `{0} students upgraded to certificate` |
| `1 student could not be enrolled` |
| `{0} students could not be enrolled` |
| `Enroll 1 student` |
| `Enroll {0} students` |

Lecture Babel et `Catalog.check()` : **aucune erreur**. Paramètres {0}/{1} et % littéraux conservés ; tous les msgstr du candidat sont vides. Contextes réels absents dans ce candidat comme dans les précédents ; le contexte explicite a été vérifié dans la fixture du test. Plusieurs occurrences d’une clé sont regroupées dans le catalogue natif sans créer de doublon d’identité.

Les nouveaux messages viennent d’inscription, réglages (comptes mail, badges, membres, transactions et connecteurs), Raven, éditeur, quiz, exercices et utilitaires. Les libellés `API Key`, `API Secret`, `Password is required` sont destinés à l’interface et ne contiennent aucune valeur secrète. `johndoe@example.com` est un placeholder explicitement enveloppé dans __(), sur un domaine d’exemple ; pas une donnée personnelle. Les aides d’administration contiennent parfois JSON, noms techniques et exemples : les conserver fidèlement à la traduction. Pas d’ajout parasite identifié nécessitant de filtrer manuellement le POT.

Limites restantes : les clés dynamiques telles que `__(target.title)` ne sont pas résolues par une extraction lexicale ; chaînes non enveloppées, .tsx et futurs dossiers/fichiers générés demandent une revue spécifique. Aucune couverture de traduction intégrale de l’application n’est revendiquée. Les libellés singulier/pluriel restent des clés anglaises séparées, selon le code existant ; aucune migration de modèle pluriel ou refonte de sources effectuée.

### Artefacts, intégrité et prochaine action

Dossier hors Git `/workspace/work/fr01d2/` : `main.before.pot`, `main.generated.pot`, `main.generated.diff`, `comparison.json` (comparaisons, 200 ajouts et inventaire par fichier), `comparison.log`, `compare.py`, `before.json`, `generation.log`, `tests-before.log`, `tests-after.log`, `tests-final.log`. Les candidats précédents restent dans /workspace/work/fr01d/. Ces artefacts dépendent de la conservation du workspace ; ne pas les écraser lors d’une reprise.

Les **79 PO LMS/Framework**, HEAD/état Framework, remotes et POT suivi sont identiques aux relevés avant génération. Sources applicatives inchangées. Aucun accès GitHub distant pendant cette mission ; dernier distant réellement vérifié précédemment : 040496fa. develop, production et workflows Crowdin inchangés.

Empreinte SHA-256 du candidat FR-01D.2 : `f089553d58a2c1a5fbab4457857ee5dbb0e17eec8beeb6425b184f1502a15a92` (généré depuis le checkout propre `6fdb0dc1`).

Commit correctif/test local : `6fdb0dc1`. Le commit documentaire courant actualise uniquement ce rapport et CODEX_HANDOFF ; relever son SHA par git log. Les trois commits FR-01D précédents restent également locaux. Aucun push effectué.

**Recommandation finale : intégration complète du candidat FR-01D.2 acceptable après autorisation explicite**, avec contrôle de son empreinte, du diff (311 ajouts / 4 retraits), des 13+8 clés, de l’intégrité des PO et de l’absence de modification de sources avant commit. Ne pas intégrer le candidat précédent de 2 780 clés. Si les sources ou le mapping évoluent entre-temps, refaire une extraction contrôlée plutôt que copier un artefact périmé. Les validations Babel/extraction ont déjà réussi : les réexécuter seulement si le contenu change ou si l’intégrité n’est plus démontrable. Puis attendre les décisions distinctes sur le circuit Crowdin, le glossaire et les traductions françaises avant tout import/synchronisation. Aucune intégration ni publication autorisée à ce stade ; arrêt après FR-01D.2.

## FR-01D.3 — Publication et intégration locale contrôlée (28 octobre 2026)

Les cinq commits autorisés ont été publiés par push normal, sans force, sur littlepool-dev : a628ed1a → dd9ec7b7 → 47cf7cf7 → 6fdb0dc1 → **1896abb62f359b997f91d5a522acf7cd58b3155b**. Avant publication : checkout propre, parent distant 040496fa, ordre et listes de fichiers exacts vérifiés pour chacun des cinq commits, aucun commit de fusion, recherche ciblée de secrets dans tous les fichiers concernés à chaque révision. Aucune divergence. Un fetch après push confirme le dernier SHA et la présence des cinq ancêtres sur GitHub. develop distant reste 6b791f33b34efa15566a0cb707f5be59d136df50. Aucun autre commit publié.

### Candidat réutilisé et intégré

Le candidat /workspace/work/fr01d2/main.generated.pot existe et son SHA-256 est exactement celui documenté : `f089553d58a2c1a5fbab4457857ee5dbb0e17eec8beeb6425b184f1502a15a92`. Le diff entre son checkout de génération 6fdb0dc1 et le checkout courant ne contient que le rapport et le handoff. L’état du Framework et les 79 PO correspondent aux relevés de génération. Le candidat reste donc applicable ; **aucune nouvelle extraction** n’a été nécessaire.

Après validation Babel préalable, copie intégrale et sans réécriture du candidat dans lms/locale/main.pot. Nouvelle lecture Babel du fichier intégré avec arrêt sur erreur de syntaxe, puis Catalog.check : aucune erreur. Le fichier intégré est identique octet pour octet au candidat.

- **2 673 → 2 980 clés : 311 ajouts, 4 suppressions, 506 entrées communes avec références modifiées.**
- 13 clés FR-01B et huit messages TypeScript présents exactement ; paramètres et indicateurs communs préservés, notamment {0}/{1} et Uploading {0}%.
- Suppressions limitées à Enroll Student ; Please select a student to enroll. ; Student enrolled successfully ; Please select a payment for the purchased certificate. Aucune suppression inexpliquée.
- Aucun contexte explicite ou msgid_plural avant/après. Les variantes singulier/pluriel restent les clés anglaises séparées prévues par le code existant ; aucune perte d’un pluriel gettext.
- Tous les msgstr restent vides. Aucun emplacement de test/spec/déclaration TypeScript introduit. Sources anglaises inchangées.
- Empreintes des 79 PO inchangées ; ni code applicatif, ni mapping, ni Framework modifié pendant l’intégration. Diff brut du POT : 1 957 lignes ajoutées, 479 retirées, conformément au candidat.

### Vérification TSX et limites

`git ls-files '*.tsx'` ne trouve aucun fichier TSX suivi dans le dépôt ; la recherche physique dans frontend/src n’en trouve aucun non plus. Aucun appel de traduction TSX identifié dans ces périmètres. Pas d’ajout de support .tsx. Les éventuels fichiers de dépendances/build hors périmètre ne sont pas des sources LMS à extraire. Les lacunes restantes concernent les appels à clés dynamiques, les chaînes non enveloppées et les syntaxes/fichiers futurs : ne pas déduire une couverture universelle du résultat actuel.

### Contrôles exécutés et état final

Contrôles spécifiques FR-01D.3 : Git local/distant, contenu et ordre des cinq commits, absence de divergence, recherche ciblée de secrets, empreinte/provenance du candidat, lecture/validation Babel avant puis après copie, comparaison sémantique au POT original, clés/paramètres/contextes/pluriels, contrôle des 79 PO, intégrité Framework, recherche TSX et git diff --check. Résultats réussis. Les 3 tests d’extraction et 2 tests de protection FR-01D.2 restent applicables et n’ont pas été réexécutés : leur code, le mapping et le Framework sont inchangés. Aucune suite applicative, installation, compilation, navigateur, synchronisation Crowdin, update-po-files ou déploiement.

Preuves complémentaires hors Git : /workspace/work/fr01d3/validate_integration.py et validation.json. Les artefacts FR-01D.2 sont conservés. Le commit local d’intégration contient uniquement lms/locale/main.pot, ce rapport et CODEX_HANDOFF.md ; son titre est `chore(i18n): integrate validated POT catalogue and update handoff`, SHA à relever avec git log. Il **n’est pas publié**. Aucun commit de suivi séparé créé pour simplement constater la publication.

Prochaine opération : obtenir l’autorisation explicite de publier ce nouveau commit POT. Le catalogue source est désormais intégré localement ; cela ne complète pas les traductions françaises ni les MO. Après publication seulement et sur instruction distincte : valider le circuit Crowdin, budget/droits, glossaire et propositions françaises avant toute configuration ou synchronisation. Arrêt après FR-01D.3, sans FR-02.
