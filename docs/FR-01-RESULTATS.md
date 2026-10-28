# FR-01 — Activation et validation du français

Date : 28 octobre 2026 (Europe/Paris). Dépôt : `L1ttleP00l/lms`. Branche exclusive : `littlepool-dev`. Base de travail : `8b61d828`.

**Résultat : le français est activé sur le site de développement `learning.localhost` et fonctionne dans Vue, y compris pour les utilisateurs sans préférence. Les préférences anglaises restent respectées.** Deux défauts LMS reproduits ont été corrigés. Aucune traduction source, chaîne Vue hors traduction, mise en page ou source Frappe Framework n’a été modifiée.

## 1. État initial vérifié

Les trois documents `docs/AUDIT.md`, `docs/ROADMAP.md` et `docs/PLAN_FRANCISATION.md`, ainsi que `AGENTS.md`, ont été lus avant l’activation. Le checkout initial était propre, sur `littlepool-dev`.

L’environnement cloud était `running / connected`, avec politique réseau appliquée. Le démon Docker local répondait (28.4.0), les conteneurs locaux `lms-bench`, `lms-mariadb`, `lms-redis` étaient déjà actifs et l’API ping répondait `pong`. Aucune modification de leur configuration n’a été nécessaire.

Versions confirmées par Bench : Frappe `17.x.x-develop` au commit `959b85d` (constante source `17.0.0-dev`), LMS `2.45.2`, Payments `0.0.1`. L’environnement utilise le runtime applicatif Python 3.14 et Node.js 24 documenté par l’audit ; les versions correctives n’ont pas été relevées à nouveau pendant FR-01.

| Mesure | Avant FR-01 | Après activation et corrections |
| --- | ---: | ---: |
| Langue des System Settings | vide | `fr` |
| Entrées du dictionnaire effectif `get_all_translations('fr')` | 43 | **6 102** |
| `Courses` / `Next` dans ce dictionnaire | absents | **Cours / Suivant** |
| `Save` / `Cancel` | absents | Enregistrer / Annuler |
| `Lesson content` | absent | toujours absent, repli anglais conservé |
| LMS `fr.po` | 2 673 entrées, 568 renseignées | inchangé |
| Framework `fr.po` | 9 026 entrées, 5 769 renseignées | inchangé |
| LMS `fr/LC_MESSAGES/lms.mo` | absent | 26 373 octets, 568 messages |
| Framework `fr/LC_MESSAGES/frappe.mo` | absent | 500 977 octets, 5 769 messages |

Le nombre de clés fusionnées ne s’additionne pas simplement aux entrées des deux catalogues : clés communes, autres applications et traductions supplémentaires participent au résultat. Il ne mesure pas le taux de traduction de l’interface.

## 2. Actions réalisées et mécanismes confirmés

Le code de cette version confirme le circuit gettext : PO → compilation Babel en MO → lecture MO/CSV par Frappe → fusion avec traductions utilisateur et langues parentes → cache du site → API LMS → plugin Vue `__()`. `lms/www/_lms.py` utilise `frappe.translate.get_user_lang()` pour le bootstrap. Les paramètres `{0}` et les appels `.format()` restent pris en charge.

Les commandes suivantes ont été exécutées **dans le conteneur local `lms-bench`, depuis `/workspace/frappe-bench`** :

```bash
bench compile-po-to-mo --app lms --locale fr
bench compile-po-to-mo --app frappe --locale fr
bench --site learning.localhost execute frappe.translate.clear_cache
```

Elles ont produit les fichiers sous `sites/assets/locale/fr/LC_MESSAGES/`. Les fichiers ont été relus avec Babel et `gettext.GNUTranslations`, et leurs messages contrôlés. Le cache a été invalidé dans le contexte du seul site `learning.localhost` ; aucun autre site n’a été configuré.

Le français système a été enregistré via la méthode native LMS `lms.lms.api.set_system_preferences(language='fr')`, après initialisation de ce site et avec le compte administrateur local. Cette méthode vérifie le rôle System Manager, valide l’existence de Language `fr`, puis écrit les System Settings. La transaction a été validée. Aucune préférence d’un compte existant n’a été forcée en français.

Aucune extraction POT, écriture PO, création de traduction en base à titre de personnalisation, migration de schéma ou modification de Docker n’a été effectuée. Les traductions temporaires créées par les tests backend sont annulées par leur transaction et leurs caches sont nettoyés.

### Intégrité des sources

Les empreintes SHA-256 des PO sont identiques avant/après :

- LMS : `9858116fff2a0a997502aaf892a14f65ebafff1bda011e814096565a50d3ee84`.
- Framework : `7347c89c13f2961d6e98ffee423fa6c9cddb1604981e4e341d27d728efb1dc1d`.

Le checkout Framework reste sans diff. Les MO et assets générés restent hors des commits. Les déclarations TypeScript générées par le build ont été restaurées à leur état initial ; aucun changement généré sans rapport n’est inclus.

## 3. Anomalies reproduites et corrections minimales

### A. API sans repli pour un utilisateur sans langue

Avant correction, avec système `fr` et `User.language = NULL` : le bootstrap annonçait `fr`, mais l’API LMS renvoyait un dictionnaire vide (0 entrée). Après rechargement, ce compte restait donc en anglais. Les comptes explicitement français recevaient 6 102 entrées et le compte anglais 43 entrées sans traduction de Courses/Next.

Cause : `lms/lms/api.py::get_translations` lisait directement `User.language`, alors que le bootstrap employait le résolveur natif du Framework. Correction : utiliser `get_all_translations(get_user_lang())`. Le même mécanisme s’applique aux visiteurs et comptes connectés, selon la chaîne native compte → système → langue locale de requête → anglais.

Test de régression : `lms/tests/test_translations.py`. Les tests créent leurs propres comptes et de vraies entrées Translation temporaires, sans simuler le résolveur ni le chargeur. Les appels vérifiés utilisent Guest ou des comptes de test, pas Administrator. Avant correction, **3 tests réussissaient et 2 échouaient** (préférence absente avec et sans langue système). Après correction : **5/5 réussis**, avec sous-cas apprenant/formateur/gestionnaire.

### B. Rendu Vue figé avant l’arrivée du dictionnaire

Reproduction dans Chromium : retenir la réponse RPC de traduction pendant que la page `/lms/courses` s’affiche, puis la libérer après 2 secondes. Avant correction, `window.__('Courses')` renvoyait bien `Cours`, mais la page restait anglaise ; un rechargement pouvait corriger l’affichage. L’anomalie a été reproduite pour les profils français et Guest.

Cause : `window.translatedMessages` était un objet global sans dépendance réactive ; les textes déjà calculés/rendus n’étaient pas réévalués à son remplacement.

Correction : `frontend/src/translation.js` garde le dictionnaire dans un `shallowRef` Vue, initialisé depuis la variable globale si elle existe, puis actualisé à la réception RPC. La variable globale reste disponible pour les usages existants. L’interpolation, le repli sur les sources et les dictionnaires préchargés sont conservés. Le paramètre inutilisé de `fetchTranslations` est supprimé.

Test de régression : `frontend/src/tests/translation.test.ts`. Avec réponse tardive, le test rend un libellé calculé et un bouton, puis exige leur mise à jour sans remonter le composant. Avant correction, la version nettoyée du test donne **2 réussites et 1 échec sur le texte figé** ; après correction, 3/3 passent. Les tests existants de traduction des images de couverture passent également.

Une première rédaction du test utilisant un template compilé à l’exécution produisait en plus un avertissement Vue sur le préfixe `__`. Le test a été corrigé pour utiliser des fonctions de rendu ; cet avertissement du montage de test n’est pas présenté comme un défaut de l’application.

## 4. Vérifications fonctionnelles dans Chromium

Navigateur Chromium installé sur l’hôte, piloté par Playwright, viewport 1440 × 1000, locale navigateur volontairement `en-US`. Connexion réelle via l’API login, sessions distinctes, lecture du bootstrap HTML, du dictionnaire Vue et du texte exact « Cours » dans la page. La présence du mot dans le titre du cours de test ne suffit pas à ce contrôle : le libellé exact est vérifié séparément.

Cinq comptes synthétiques `fr01-…@example.com` ont été créés avec noms de test, mots de passe aléatoires et emails de bienvenue désactivés. Aucun identifiant réel ni secret n’est versionné. Rôles : LMS Student ; Course Creator ; System Manager + Moderator. Les comptes sont de type System User, avec les rôles indiqués. Le visiteur utilise une session sans connexion.

Un cours FR01 synthétique publié, un chapitre, deux leçons et trois inscriptions ont été créés sur le seul site local afin de tester le véritable bouton de navigation des leçons. Ces données marquées FR01 et les cinq comptes sont conservés pour une revue locale. Les identifiants aléatoires sont dans un fichier de travail hors dépôt, mode 0600 ; ils ne figurent ni dans ce document ni dans Git.

| Profil | Préférence enregistrée | Bootstrap / API | Dictionnaire | Libellé de page | Bouton réel de leçon |
| --- | --- | --- | ---: | --- | --- |
| Visiteur | aucune | fr / fr | 6 102 | Cours | Non applicable : leçon verrouillée pour Guest ; `__('Next')` vaut bien Suivant |
| Apprenant | fr | fr / fr | 6 102 | Cours | Suivant visible |
| Formateur | fr | fr / fr | 6 102 | Cours | Suivant visible |
| Gestionnaire | fr | fr / fr | 6 102 | Cours | Suivant visible |
| Apprenant anglais | en | en / en | 43 | Courses | Next visible |
| Compte sans préférence | NULL | fr / fr | 6 102 | Cours | Suivant visible |

Les 43 entrées anglaises ne contiennent pas de traduction pour Courses/Next : l’affichage utilise correctement les sources anglaises. Pour les six profils, le rendu du catalogue après arrivée tardive du dictionnaire et après rechargement est correct. Aucune erreur JavaScript `pageerror` n’a été relevée pendant cette matrice. L’accès à la leçon reste refusé au visiteur selon les permissions existantes ; il n’a pas été ouvert pour faciliter le test.

### Persistance et multilinguisme

Sur le même compte apprenant de test, la préférence a été enregistrée via `frappe.client.set_value` sur son propre champ User.language, avec session et protection CSRF natives :

1. Passage à `en` : deux rechargements successifs conservent bootstrap en, Courses et Next.
2. Retour à `fr` : deux rechargements successifs conservent bootstrap fr, Cours et Suivant.

L’état final de ce compte est français. Le compte explicitement anglais reste anglais et le compte sans préférence reste sans préférence. Le changement de langue testé prend effet après rechargement ; aucun basculement instantané sans rechargement n’a été ajouté.

## 5. Tests et contrôles réellement exécutés

Les commandes Bench/Yarn ci-dessous ont été exécutées dans `lms-bench`. Le build produit des assets optimisés locaux ; il ne déploie rien.

| Contrôle | Résultat |
| --- | --- |
| `bench --site learning.localhost run-tests --app lms --module lms.tests.test_translations` avant correction | 5 tests, 3 réussis, 2 erreurs confirmant les replis manquants |
| Même commande après correction | **5/5 réussis** ; matrice de rôles en sous-tests ; 1,34 s |
| `yarn test src/tests/translation.test.ts --maxWorkers=1` avant correction, test nettoyé | 2 réussis / 1 échec attendu sur le rendu tardif |
| `yarn test src/tests/translation.test.ts src/tests/coverImageTranslations.test.ts --maxWorkers=2` après correction | **9/9 réussis**, 2 fichiers |
| `yarn test --maxWorkers=2` après correction | **244/244 fichiers, 2 680/2 680 tests réussis**, une exécution complète, 250,33 s |
| `yarn build` | **Réussi**, bundle SPA + entrée HTML + signup-select ; 14,08 s |
| MO relus avec Babel et GNUTranslations | LMS 568 messages ; Framework 5 769 ; LMS Courses → Cours ; Next → Suivant dans les deux MO |
| Validation des messages PO par Babel `Message.check()` | LMS : aucune erreur ; Framework : **1 anomalie préexistante**, détaillée ci-dessous |
| Empreintes PO et diff Framework | PO inchangés ; aucune modification Framework |
| HTTP ping, `/lms`, API publique de traduction et API cours | **4 réponses HTTP 200** ; API traduction : 6 102 clés, Cours/Suivant |
| Références JS/CSS extraites du HTML `/lms` | **91 références contrôlées, toutes HTTP 200** ; les références peuvent inclure des préchargements |
| Playwright / Chromium sur site réel | Six profils, réponse RPC retardée, rechargement et leçons ; assertions linguistiques conformes, sauf bouton Guest non applicable par permission |
| Préférence de langue enregistrée par HTTP | en puis fr, deux rechargements pour chaque valeur : conforme |
| Hooks Ruff import/lint/format, Python AST, debug-statements, conflits | Réussis sur les fichiers concernés |
| Prettier 2.7.1 et ESLint 8.44.0 exécutés directement | Réussis sur les fichiers concernés après mise en forme du test TypeScript |
| `git diff --check` / contrôle du diff indexé | Réussi ; aucune modification générée ou traduction source incluse |

Le succès de la suite Vue correspond bien à **une exécution complète**, pas à une somme de relances isolées. L’échec par timeout de l’audit précédent reste un résultat historique distinct, sans être réécrit.

### Anomalies de validation et d’outillage

- Framework `frappe/locale/fr.po`, clé `Use % for any non empty value.` → `Utilisez % pour toute valeur non vide.` : Babel signale `placeholders are incompatible` sur cette entrée marquée `python-format`. Les empreintes prouvent qu’elle préexiste à FR-01. La compilation native réussit, mais la validation linguistique/format du catalogue Framework n’est donc pas entièrement verte. À remonter au circuit de traduction amont ; aucune correction manuelle appliquée.
- Le lanceur pre-commit complet a échoué lors de l’installation de son environnement Node : npm `EALLOWGIT` sur le paquet local du miroir Prettier. Les premières tentatives avaient également rencontré des répertoires de cache hôte non inscriptibles ; les caches de travail ont ensuite été placés sous `/workspace/work/fr01/`. Aucun rejet de revue d’approbation n’est intervenu. Les hooks Python ont été exécutés séparément, et les versions de Prettier/ESLint prévues par les hooks ont été lancées directement. Le lancement pre-commit complet n’est pas déclaré réussi.
- La première tentative Playwright de login avec APIRequestContext ne résolvait pas `learning.localhost` (`EAI_AGAIN`). Le login a ensuite été effectué depuis Chromium sur la même origine locale, avec succès ; aucune route réseau ni configuration DNS n’a été modifiée.
- Le build signale des avertissements existants : option Vite esbuildOptions dépréciée, données Browserslist anciennes et externalisation navigateur du module fs de face-api.js. Le build termine avec code 0 ; les bundles contrôlés se chargent.

## 6. Traçabilité, limites et reprise

Les mesures et journaux de cette mission sont dans `/workspace/work/fr01/`, hors dépôt : `before.json`, `after.json`, `catalog-check.json`, `activated-before-fix.jsonl`, journaux backend/frontend avant/après, `frontend-full.log`, `build.log`, `http.json`, `baseline-browser.json`, `verified-browser.json`, `persistence.json` et captures PNG avant/après. Le fichier des comptes est sensible et ne doit pas être publié. Les captures ont été conservées pour la revue locale ; elles ne sont pas des données de production.

La langue système et les comptes sont des données de la base locale, et les MO/assets des produits générés du Bench : **les commits Git seuls ne transportent pas l’activation du site**. Sur une restauration conservant la base et les assets, vérifier leur présence ; sur un nouveau site, reproduire la compilation, l’invalidation du cache et l’appel natif de configuration après validation de l’identité du site. Ne pas appliquer ces commandes à une production par défaut.

Si un retour arrière local est nécessaire : restaurer la langue système précédente via le mécanisme natif approprié (le champ était vide avant cette mission ; `set_system_preferences` ignore une chaîne vide), supprimer les seules données FR01 si souhaité, puis invalider les caches du site. Ne pas effacer les catalogues partagés d’un autre Bench. Les corrections de code peuvent être annulées indépendamment par Git après revue.

Non exécutés : suite backend LMS complète, suite E2E historique complète, tests de charge, autres navigateurs, recette exhaustive mobile, emails/PDF et connecteurs externes. Le parcours navigateur couvre le catalogue et la navigation de leçon, pas toute l’application. La validation exhaustive des formats linguistiques reste à faire, notamment à cause de l’anomalie Babel du Framework.

Un texte anglais peut encore apparaître brièvement avant la réception du dictionnaire ; le défaut où il restait figé après réception est corrigé sur les surfaces testées. Les chaînes prises comme instantanés hors calcul réactif, les clés non traduites, la marque et les contenus saisis ne sont pas automatiquement francisés par ce correctif.

## 7. Travaux restants pour FR-01B

- Rendre traduisibles les chaînes anglaises directes de StudentCourseProgress, Statistics et UnsplashImageBrowser, avec tests ciblés.
- Compléter le relevé des titres, placeholders, libellés accessibles et messages non extraits ; contrôler l’extraction native et le circuit Crowdin avant import.
- Préserver les valeurs techniques et les sources anglaises ; ne pas confondre texte affiché, identifiant et nom de marque.
- Prioriser les clés absentes sur le parcours pilote : 2 105 entrées LMS restent vides, et aucune traduction nouvelle n’a été créée ici.
- Suivre l’anomalie de format du catalogue Framework via le circuit amont. Traiter la locale Day.js, les emails et certificats dans les lots planifiés, sans les déclarer couverts par FR-01.

## 8. Commits et périmètre final

Correction et régressions : commit local `f1492f65` — `fix(i18n): align language fallback and refresh translated Vue text` (quatre fichiers : API, plugin Vue et leurs tests). Ce document fait l’objet d’un commit documentaire distinct.

Aucun push effectué dans cette mission. Aucun merge vers develop, aucune publication de production, aucune modification de configuration Docker ou du serveur OpenMediaVault 8. Les commits restent locaux, en attente de présentation des résultats et de l’accord explicite demandé par l’utilisateur avant publication sur GitHub.


## 9. Reprise et dénomination FR-01A

La consigne de continuité du 28 octobre 2026 nomme **FR-01A** le périmètre d’activation/validation déjà réalisé dans ce rapport sous le titre FR-01. Ce travail est terminé ; FR-01B n’a pas commencé. `CODEX_HANDOFF.md` décrit désormais la reprise, les contraintes et les commits locaux non publiés.

Lors de cette mise à jour documentaire, seuls les contrôles légers nécessaires ont été répétés : état Git local/distant, ping du site, langue système fr, dictionnaire de 6 102 entrées, présence des MO et empreintes PO inchangées. Aucun test applicatif, build, compilation, installation ou correctif fonctionnel supplémentaire n’a été exécuté. Les résultats des sections précédentes sont réutilisés et restent datés de FR-01A. Aucun push autorisé ou effectué.
