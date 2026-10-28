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
