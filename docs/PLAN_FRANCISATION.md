# Plan de francisation — LittlePool Learning

Date : 28 octobre 2026 (Europe/Paris). Travail documentaire sur `littlepool-dev`, à partir de `docs/AUDIT.md`, `docs/ROADMAP.md` et du code installé : LMS `2.45.2` (`6b791f33…`) et Frappe `17.0.0-dev` (`959b85de…`). Aucune modification fonctionnelle, graphique, de langue du site ou de catalogue n’est réalisée dans cette mission.

## 1. Point de départ et sauvegarde

Le commit `79c42808e9fbcf10ff9619e731f771b8a527a7de` ajoute uniquement `docs/AUDIT.md` et `docs/ROADMAP.md`. Les contenus ont été relus ; une recherche ciblée de clés privées, jetons GitHub, identifiants AWS et affectations de mots de passe/secrets n’a trouvé aucun motif suspect. Aucun fichier `.env`, configuration de site, mot de passe ni secret n’est inclus dans ce commit. Les chemins et noms de paramètres mentionnés dans l’audit ne sont pas leurs valeurs secrètes. Ce contrôle porte sur le commit documentaire, pas sur une certification de tout l’historique du fork.

La branche a été publiée par `git push -u origin littlepool-dev`, sans force, sans fusion et sans modification de `develop` :

https://github.com/L1ttleP00l/lms/tree/littlepool-dev

L’audit reste un constat daté : ses mentions « aucun push effectué » décrivent la mission précédente. Ses mesures sont de 568 traductions renseignées sur 2 673 entrées LMS (2 105 vides), 5 769 sur 9 026 pour le Framework, et seulement 43 entrées françaises chargées à l’exécution. La priorité est de rendre les traductions existantes disponibles, puis de compléter les manques. Ces mesures d’exécution n’ont pas été répétées dans cette mission.

## 2. Circuit natif et fichiers concernés

Les chemins LMS ci-dessous sont relatifs au dépôt. Les chemins Framework sont relatifs à `apps/frappe/` dans le Bench ; ils sont des dépendances à inspecter, pas des fichiers à modifier dans ce chantier LMS.

| Fichier ou zone | Mécanisme / rôle |
| --- | --- |
| `crowdin.yml` | Source `/lms/locale/main.pot` et traduction `/lms/locale/%two_letters_code%.po` |
| `lms/locale/main.pot`, `lms/locale/fr.po` | Inventaire gettext et traductions françaises du LMS ; sources suivies par Git |
| `lms/translations/` | CSV historique encore chargé par Frappe ; seul `es.csv` est présent dans ce checkout, pas de CSV français LMS |
| `frontend/src/translation.js`, `translation.d.ts`, `main.js` | Plugin `__()`, injection globale, chargement RPC et interpolation |
| `lms/lms/api.py::get_translations` | Langue du compte connecté ou langue système pour Guest, puis dictionnaire fusionné |
| `lms/www/_lms.py::get_boot` | Langue, direction, format de date et fuseau transmis au client ; langue via `get_user_lang()` |
| `frontend/src/utils/dayjs.js` | Formats et temps relatifs ; seules les locales RTL ar/he/fa/ur sont importées/activées actuellement |
| `frontend/src/pages/`, `components/`, `utils/` | Libellés, boutons, erreurs, aide, états vides, accessibilité et chaînes de composants |
| `lms/lms/doctype/`, `api.py`, `utils.py` | Métadonnées, labels/options, validations et messages Python `_()` |
| `lms/templates/emails/`, `lms/lms/notification/`, `lms/www/` | Jinja, emails, notifications et inscription ; vérifier aussi sujets et langue des destinataires |
| Modèles Email Template / Print Format, DocTypes LMS Certificate | Données et gabarits de certificats ; la traduction d’interface ne traduit pas automatiquement leur contenu |
| Framework `frappe/locale/main.pot`, `frappe/locale/fr.po`, `frappe/translations/` | Catalogues partagés pour Desk, comptes, contrôles et messages système |
| Framework `frappe/translate.py`, `frappe/gettext/translate.py` | Fusion, caches, langues parentes, lecture CSV/MO, génération POT et compilation |
| Framework `frappe/commands/gettext.py`, `babel_extractors.csv` | CLI native et extracteurs Python/JS/Vue/HTML/JSON |
| Framework `frappe/core/doctype/translation/translation.py` | Surcharges `Translation` en base et invalidation des caches lors des changements |
| `.github/workflows/crowdin-actions-download-translations.yml` | Import Crowdin par PR ; matrice actuelle sans `littlepool-dev` |
| `sites/assets/locale/fr/LC_MESSAGES/lms.mo` et `frappe.mo` | Résultats compilés attendus dans le Bench ; ne pas ajouter ces binaires aux sources LMS |

### Résolution et limites

- Frappe fusionne les traductions des applications installées : CSV puis MO pour chaque application ; les traductions utilisateur en base passent ensuite et peuvent surcharger le résultat. Les langues parentes sont prises en compte. Des clés identiques entre applications peuvent se recouvrir : tester le dictionnaire final, pas seulement un PO.
- `frappe.translate.get_user_lang()` applique compte → langue système → langue locale → anglais. L’API LMS lit directement `User.language` pour un compte connecté et ne reprend pas explicitement ce repli système : tester le cas d’un utilisateur sans langue, sans supposer un comportement identique au bootstrap.
- Le plugin Vue renvoie la source anglaise si aucune traduction n’existe. Il prend en charge `__('… {0}').format(value)` et `__('… {0}', [value])`. Préserver les clés anglaises et les paramètres ; ne pas substituer directement du français dans les sources.
- `window.translatedMessages` est alimenté de façon asynchrone, sans état réactif Vue explicite ; vérifier le premier rendu, la navigation et le changement de langue. Le paramètre `lang` de `fetchTranslations` n’est actuellement pas transmis à l’API.
- Les contenus de cours, données saisies, paquets SCORM, documents, vidéos et sous-titres relèvent d’une traduction éditoriale distincte.
- L’en-tête du PO indique `Language: fr_FR`, mais son nom est `fr.po` et le chargeur construit le chemin à partir du code demandé : utiliser d’abord `fr`, puis tester explicitement toute variante. L’en-tête seul ne crée pas un catalogue `fr-FR`.

## 3. Classement des manques français

Un relevé statique a retrouvé les 2 105 entrées LMS vides en lisant `msgid`/`msgstr`, puis en filtrant leurs références `#:` et certains mots-clés. Les catégories se recouvrent, ne couvrent pas toutes les entrées et ne doivent **pas être additionnées**. Les références sont celles du PO existant, pas une nouvelle extraction exhaustive des sources.

| Catégorie | Entrées candidates vides | Exemples réels de clés vides | Zones de traitement |
| --- | ---: | --- | --- |
| Navigation | 90 | `(opens in a new tab)`, `1 result loaded`, `Actions for {0}` | Sidebar, MobileYou, routes, NotFound, Layouts |
| Cours | 129 | `1 lesson`, `About this course`, `Add chapter` | pages/Courses, CourseCard, DocType LMS Course |
| Leçons | 50 | `Assignment`, `Body`, `Could not load your saved progress` | Lesson, LessonForm, SCORMChapter, Course Lesson |
| Quiz | 197 | `1 mark`, `Accepted answer {0}`, `Add accepted answer`, `Add option` | pages/Quiz, components/Quiz, utils/quizQuestion, LMS Quiz |
| Utilisateurs | 45 | `Availability`, `Clear time off`, `Edit Member` | Profile, formulaires membres, Settings/Members, inscription |
| Administration | 212 | `1 Import`, `Active Members`, `Actions for {0}` | Settings, Statistics, DataImport ; tri manuel des noms/exemples nécessaire |
| Notifications | 53 | ` to `, `A new batch has been published on `, `Checkout the course`, `Class:` | templates/emails et notifications Frappe |
| Certificats | 92 | `Award my first certificate`, `Certificate of completion`, `Certificate price` | écrans, emails, contrôleurs et modèles de certificat |

Méthode de classement : navigation par références Sidebar/MobileYou/routes/NotFound/Layouts ; cours par pages/Courses/CourseCard/doctype/lms_course ; leçons par pages/Lesson/SCORMChapter/doctype/course_lesson ; quiz par pages/Quiz/components/Quiz/utils/quizQuestion/doctype/lms_quiz ; utilisateurs par pages/Profile/pages/Forms/Member/Settings/Members/new-sign-up ; administration par components/Settings/pages/Statistics/pages/DataImport ; notifications par templates/emails ou /notification/ ; certificats par les termes Certificate/certificate/certification dans les références et textes. Ces nombres sont des indices de tri, pas une mesure de couverture des parcours.

Le backlog devra attribuer une catégorie principale par clé, conserver les catégories secondaires et prioriser son exposition réelle. Les fragments comme ` to ` et les phrases assemblées demandent une revue du contexte grammatical avant traduction. Les chaînes techniques, noms propres et exemples de saisie ne sont pas tous à traduire.

## 4. Chaînes anglaises hors traduction dans Vue

| Fichier | Chaînes confirmées | Correction future envisagée |
| --- | --- | --- |
| `frontend/src/pages/Courses/StudentCourseProgress.vue` | `title="Student Progress"` | `:title="__('Student Progress')"` et extraction native |
| `frontend/src/pages/Statistics.vue` | `Courses`, `Signups`, `Enrollments`, `Completions`, `Certifications`, `Signups per day`, `Enrollments per day`, `Certifications per day`, `Course Completion` | Passer les titres et sous-titres par `__()` à l’appel ; les composants charts reçoivent le texte prêt à afficher |
| `frontend/src/components/UnsplashImageBrowser.vue` | `placeholder="search by keyword"` | Placeholder traduit via `__()` |
| `frontend/src/components/Sidebar/AppSidebar.vue` | `title="Frappe Learning"` | Marque et paramétrage à traiter séparément ; pas une traduction littérale du nom du produit |
| Formulaires membres | Exemples `London`, `Jane`, `Doe`, adresses de démonstration | Revue éditoriale, sans traduire noms/adresses ou identifiants automatiquement |

Hors Vue : `lms/templates/emails/community_course_membership.html` contient `Dear {{ full_name }},` sans `_()`. Les dates Day.js sont aussi une source d’anglais indépendante des PO. Ce relevé ciblé doit être complété par inspection des textes visibles, attributs `title`/`placeholder`/`aria-label`, options, erreurs et composants partagés ; une recherche regex seule ne détermine pas si un enfant traduit lui-même une prop.

## 5. Production et chargement des catalogues

Les commandes et options suivantes ont été confirmées dans `frappe/commands/gettext.py` et par leur aide CLI dans `lms-bench`. Elles sont proposées pour le futur lot ; seule l’aide a été exécutée ici.

Depuis `/workspace/frappe-bench` **dans le conteneur** :

```bash
# Compilation seule des sources existantes, sans modifier les PO
bench compile-po-to-mo --app lms --locale fr
bench compile-po-to-mo --app frappe --locale fr

# Invalidation du cache des traductions sur le site de développement
bench --site learning.localhost execute frappe.translate.clear_cache
```

Ajouter `--force` uniquement si les dates de modification rendent la recompilation nécessaire. Le compilateur lit le PO avec Babel puis écrit le MO dans `sites/assets/locale/fr/LC_MESSAGES/`. La fonction de compilation ne vide pas elle-même le cache fusionné. La lecture de `get_all_translations('fr')` doit être faite avec un contexte de site initialisé ; contrôler ensuite l’API avec de vrais comptes. Configurer la langue système et les comptes pilotes via les réglages natifs, puis recharger la page/reconnecter pour renouveler l’état client.

Pour un changement futur des sources, le circuit d’extraction disponible est :

```bash
bench generate-pot-file --app lms
bench update-po-files --app lms --locale fr
```

Ces commandes écrivent des sources suivies. Elles sont réservées au circuit de localisation convenu avec Crowdin, avec revue du diff ; ne pas les exécuter comme simple diagnostic ni réécrire tous les catalogues. `babel_extractors.csv` inclut notamment Python, JavaScript, Vue, HTML et métadonnées JSON. Après ajout d’un appel littéral à `__()`/`_()`, vérifier sa présence dans le POT : la simple écriture de l’appel ne garantit pas toute extraction, notamment dans les fichiers TypeScript ou pour des clés dynamiques.

Le mécanisme historique `build-message-files` / commandes CSV n’est pas le choix principal pour les PO de cette version. Éviter de créer un second catalogue `fr.csv` concurrent pour contourner Crowdin.

## 6. Stratégie compatible avec les mises à jour

1. **Traductions génériques** : Crowdin reste la source de traduction, conformément à `AGENTS.md` (« Translations are managed on Crowdin; do not edit lms/locale/ by hand »). Ne pas modifier manuellement les PO LMS ni les catalogues Framework dans ce chantier. Préparer les propositions dans un tableau de travail avec clé, contexte, traduction, paramètres et statut de validation, puis utiliser le circuit Crowdin et importer le résultat relu.
2. **Accès Crowdin** : la configuration mentionne le projet amont ; les droits d’écriture et secrets du fork n’ont pas été vérifiés. Ne pas supposer qu’ils existent. Le workflow d’import cible develop et d’autres branches, pas littlepool-dev, et n’exporte pas les nouvelles sources (`upload_sources: false`). Définir un circuit dédié ou importer des commits de traduction sélectionnés sur littlepool-dev, sans lancer le workflow existant ni fusion automatique vers develop.
3. **Vocabulaire LittlePool** : utiliser ponctuellement le DocType natif `Translation` pour les surcharges propres au site. Versionner uniquement les entrées validées via un export/fixture contrôlé d’une extension si la reproductibilité le demande, sans exporter tout le site. Cette méthode exige que la chaîne passe déjà par le système de traduction ; elle ne corrige pas un texte Vue brut.
4. **Glossaire** : proposer Course → Cours, Lesson → Leçon, Quiz → Quiz, Assignment → Devoir, Program → Parcours. Faire valider Batch → Cohorte ou Session et Member → Membre ou Apprenant selon le contexte. Distinguer certificat de complétion et certification évaluée. Employer le vouvoiement et des consignes concises.
5. **Sources** : garder les clés anglaises, valeurs de statut, noms de DocTypes et contrats d’API. Envelopper uniquement la présentation, préserver `{0}`, balises et variables Jinja. Pour une phrase ambiguë, préférer un message complet avec paramètres à des fragments, avec revue de son impact sur les clés existantes.
6. **Livraison** : ne suivre ni MO ni assets générés. Documenter compilation et invalidation du cache dans la procédure reproductible. Les traductions Framework partagées doivent rester dans leur circuit amont ; aucune modification du checkout Framework n’est prévue.

## 7. Priorités et premier lot proposé

### Lot FR-01 — Activer et sécuriser le français existant (P0)

Périmètre volontairement réduit pour une prochaine mission :

- Compiler les PO français LMS et Framework présents, vider les caches ciblés et configurer la langue sur le seul site de développement et trois comptes pilotes (apprenant, formateur, gestionnaire).
- Vérifier le repli de langue pour Guest et un compte sans préférence. Si une incohérence bootstrap/API est reproduite, préparer une correction minimale et un test de régression, dans un commit séparé.
- Rendre traduisibles `Student Progress`, les neuf clés distinctes listées pour Statistics et `search by keyword`, sans changement de mise en page. Faire passer les clés absentes par extraction/Crowdin ; utiliser une surcharge native uniquement si elle relève du vocabulaire LittlePool validé.
- Préparer une sélection éditoriale limitée aux clés d’un parcours « catalogue → cours → leçon → quiz → résultat », à valider dans Crowdin. Ne pas promettre de traduire d’un bloc les 2 105 manques.

Critères de sortie : MO présents et lisibles ; `Courses → Cours` et `Next → Suivant` disponibles à l’exécution ; absence de régression sur les interpolations ; préférence utilisateur respectée ; chaînes ciblées effectivement françaises après rendu ; aucune différence fonctionnelle ou graphique involontaire. Le seuil n’est pas le nombre global de clés fusionnées, qui dépend des autres applications.

### Lots suivants

- **FR-02 (P1)** : dates Day.js françaises, navigation, inscription/profil et totalité du parcours pilote, avec états vides, erreurs, pluriels et accessibilité.
- **FR-03 (P1)** : écrans formateur/administration, devoirs et corrections, progression et cohortes.
- **FR-04 (P1/P2)** : notifications, sujets d’emails, langue du destinataire, modèles de certificats et rendu PDF ; utiliser uniquement des destinataires de test.
- **FR-05 (P2)** : fonctions secondaires et contenus pédagogiques/SCORM, avec traduction éditoriale indépendante et contrôle de la qualité linguistique.

## 8. Tests nécessaires pour les futurs lots

| Niveau | Vérifications |
| --- | --- |
| Catalogues | Clés extraites, absence de doublons problématiques, paramètres et HTML conservés ; analyse Babel des PO et comparaison avec les dictionnaires effectivement chargés ; compilation reproductible |
| Serveur | Dictionnaire français par app puis fusionné, surcharges Translation et cache invalidé ; langue système, utilisateur fr/en et utilisateur sans langue ; contrôles de permissions inchangés |
| Vue | Étendre `frontend/src/tests/translation.test.ts` si nécessaire : repli anglais, tableau de substitutions, `.format`, premier chargement et changement de langue ; tests ciblés des titres et placeholders modifiés |
| Dates | Locale fr, noms des mois, temps relatifs, singulier/pluriel, fuseau du site et du navigateur, conservation des datetimes serveur |
| Navigateur | Parcours invité/apprenant/formateur/gestionnaire, premier rendu et rechargement ; desktop/mobile, clavier et libellés accessibles ; absence d’anglais sur le périmètre accepté |
| Notifications et documents | Sujet/corps/destinataire, variables et liens conservés, langue attendue, caractères accentués et débordements PDF ; aucun envoi réel hors test |
| Régression | Suite Vue, modules Python concernés, build des assets si les sources changent et recette Playwright ciblée. Conserver explicitement tout échec et toute relance |

Les résultats de l’audit précédent (39 tests backend réussis, 2 677 tests Vue réussis et un timeout ; 3/3 lors de la relance isolée) restent historiques. Le timeout doit être suivi ; ne pas présenter la suite complète comme verte.

## 9. Risques de maintenance

- Frappe v17 develop et `@framework/ui` lié au checkout Framework : épingler les commits, contrôler les évolutions des extracteurs, API et composants partagés.
- Imports Crowdin susceptibles de remplacer des retouches locales ; éviter les modifications manuelles et les catalogues concurrents. Les accès au projet Crowdin et son flux d’export restent à établir.
- Les traductions globales et surcharges en base peuvent affecter plusieurs applications ; tester les clés communes et documenter la priorité des surcharges.
- Une clé anglaise renommée perd sa correspondance ; des fragments traduits littéralement donnent des phrases incorrectes. Garder contexte et paramètres dans la revue.
- MO manquants, cache serveur ancien ou état client non renouvelé peuvent masquer une traduction correcte. Valider la chaîne complète après chaque livraison.
- Ne pas confondre traduction, marque, contenu pédagogique et changement métier ; aucun renommage des valeurs stockées, permissions ou routes pour franciser une interface.

## 10. Contrôles réellement exécutés dans cette mission

- Vérification de la branche courante `littlepool-dev`, checkout initial propre, origine `L1ttleP00l/lms`, contenu exact du commit 79c42808 et lecture des deux documents.
- Recherche ciblée de motifs de secrets sur les deux blobs documentaires : aucun résultat ; contrôle des noms de fichiers et du diff.
- Lecture des déclencheurs GitHub Actions ; les workflows de publication d’assets examinés ne ciblent pas littlepool-dev. Aucun workflow déclenché manuellement, aucune PR ni fusion créée.
- Publication Git normale de la branche d’audit et contrôle des références distantes ; develop reste à `6b791f33b34efa15566a0cb707f5be59d136df50` au contrôle suivant la publication.
- Lecture des mécanismes Framework/LMS et aides exécutées dans lms-bench : `bench compile-po-to-mo --help`, `bench generate-pot-file --help`, `bench update-po-files --help`.
- Relevé statique des entrées françaises vides et classement indicatif documenté ci-dessus ; revue ciblée des chaînes Vue.

Aucune compilation de catalogue, extraction POT, modification de PO, modification de langue ou de cache, reconstruction d’assets, migration ni suite applicative n’a été exécutée ici. Les commandes de préparation sont proposées et leur syntaxe est vérifiée, mais leur résultat d’exécution reste à démontrer pendant FR-01.
