# Audit LittlePool Learning

Date : 28 octobre 2026 (Europe/Paris). Périmètre : environnement cloud restauré dans cette nouvelle tâche, dépôt `https://github.com/L1ttleP00l/lms.git` et dépendances effectivement présentes. Audit technique et documentaire, sans modification fonctionnelle ni déploiement.

## 1. Conclusion

La restauration est opérationnelle **après relance des services locaux** par la procédure fournie. Le site `learning.localhost` sert `/lms`, les ressources JavaScript et les API contrôlées. Cela valide un environnement de développement, pas un déploiement de production ni tous les parcours utilisateur.

Priorités : rendre le français réellement disponible à l’exécution, compléter sa couverture, stabiliser les versions de développement, puis configurer l’identité LittlePool et un premier parcours pédagogique. La base ne contient aucun cours lors de la lecture de contrôle.

## 2. Restauration et versions réelles

Le service cloud est passé de `starting / offline` à `running / connected`. Son observation est courante et sa politique réseau est `enforced`. La configuration publiée porte la version `3883560e-753c-4685-ae0e-4682f9b32003~cecfgver_6ae2242ba87c8195a02044f7df2043cf`.

Le snapshot contient les sources, dépendances, assets et données MariaDB. Les conteneurs `lms-mariadb`, `lms-redis` et `lms-bench` étaient arrêtés au démarrage de la tâche. `/workspace/.setup/README.md` précise que les processus vivants ne font pas partie du snapshot et demande de relancer `/workspace/.setup/start-services.sh`. Ce script a été lu puis exécuté ; il a réutilisé les conteneurs existants. Aucun refresh/install, aucune migration et aucune reconstruction n’ont été lancés.

| Composant | Valeur vérifiée | Preuve |
| --- | --- | --- |
| Frappe Framework | `17.x.x-develop` selon Bench ; constante source `17.0.0-dev` | `bench version`, `bench --site learning.localhost list-apps`, `frappe/__init__.py` ; commit `959b85de4086656273e1d158f41923dd3808c350` |
| Frappe LMS / Learning | `2.45.2` | Bench et `lms/__init__.py` ; commit `6b791f33b34efa15566a0cb707f5be59d136df50` |
| Payments | `0.0.1`, branche `develop` | Bench ; commit abrégé `7411976` |
| Python de l’application | `3.14.10` | `env/bin/python --version` dans `lms-bench` |
| Node.js de l’application | `v24.22.1` | `node --version` dans `lms-bench` |
| Python / Node de l’hôte | `3.12.14` / `v24.19.0` | commandes du terminal extérieur au conteneur ; ne pas les confondre avec le runtime applicatif |
| Docker Engine | `28.4.0` | interrogation explicite du démon local |

Le lien `frappe-bench/env/bin/python` pointe vers `/home/frappe/.pyenv/versions/3.14.10/bin/python3.14`, disponible dans le conteneur. Son échec depuis l’hôte ne signifie donc pas que l’environnement Bench est cassé. Les exigences déclarées de LMS sont Python `>=3.14,<3.15`, Node `>=24`, Frappe `>=17.0.0-dev,<18.0.0`. Le champ npm racine `1.0.0` et celui du frontend `0.0.0` ne sont pas les versions du produit LMS.

### État Git

Le checkout isolé est `/workspace/frappe-bench/apps/lms`, accessible aussi via `/workspace/lms`. Il était propre sur la branche locale `work`. `git ls-remote --heads origin littlepool-dev develop` a confirmé `develop` au commit `6b791f33…` et l’absence de branche distante `littlepool-dev`. Aucune branche locale de ce nom n’existait. La branche locale `littlepool-dev` a été créée à ce commit. Aucun checkout ni changement de référence de `develop`, aucun push et aucun déploiement n’ont été effectués.

`list-apps` conserve encore le nom de branche `work` dans ses métadonnées de site ; `git` et `bench version` montrent bien `littlepool-dev`. Ce décalage de métadonnées ne constitue pas un échec de restauration.

## 3. Architecture du dépôt GitHub

Il s’agit d’un fork de Frappe Learning, sous AGPL-3.0-or-later. L’analyse porte sur le checkout correspondant au commit distant de `develop`, pas sur l’ensemble de l’historique, des issues ou des paramètres GitHub.

| Zone | Responsabilité et implications LittlePool |
| --- | --- |
| `frontend/src/pages`, `components`, `stores`, `router`, `routes.js` | SPA Vue 3, Pinia, Vue Router, Vite ; écrans apprenant, formateur et administration LMS |
| `frontend/src/translation.js`, `utils/dayjs.js` | traduction client et dates ; points de traitement du français |
| `lms/lms/doctype/` | schémas Frappe et contrôleurs des cours, cohortes, évaluations, progressions, certificats, paiements |
| `lms/lms/api.py`, `utils.py` | méthodes RPC, lecture et orchestration des données ; fichiers importants à parcourir avant tout changement transversal |
| `lms/lms/permissions.py`, `lms/hooks.py` | permissions documentaires, filtres de requête, routes, événements et tâches planifiées |
| `lms/page_renderers.py` | accès aux ressources SCORM ; conserver les contrôles serveur |
| `lms/www/_lms.py`, templates, emails | bootstrap SPA, métadonnées, inscription et notifications |
| `lms/locale`, `crowdin.yml`, `lms/translations` | gettext PO/POT et héritage CSV ; traduction communautaire Crowdin |
| `lms/patches.txt`, `patches`, `fixtures` | évolution des sites et données distribuées |
| `frontend/src/tests`, `lms/tests`, tests dans les DocTypes, `e2e` | Vitest, tests Python Frappe, Playwright |
| `.github/workflows` | tests, builds, releases et publication d’assets ; examiner les déclencheurs avant d’étendre la CI |

Le frontend utilise `frappe-ui` et **`@framework/ui: link:../../frappe/ui`**. Une copie isolée du seul dépôt LMS ne suffit donc pas au build ; conserver la structure Bench et épingler également le commit Frappe. Les workflows utilisent aussi un checkout Frappe `develop` pour cette dépendance.

`lms/public/frontend/` et `lms/www/_lms.html` sont des sorties générées non suivies : les personnalisations doivent viser les sources. MariaDB et Redis sont des services Docker distincts ; Bench fournit les processus web, workers et socket.io selon sa configuration. Le script expose les ports web/socket sur la boucle locale. La livraison de production, les sauvegardes distantes, l’envoi SMTP et les intégrations externes n’ont pas été validés.

Le fork comprend déjà des fonctions avancées (programmes, programmation, SCORM, proctoring, intégrations Raven et réglages étendus). « Natif » ci-dessous signifie présent dans ce checkout ; l’origine exacte de chaque ajout par rapport à l’amont n’a pas été reconstituée.

## 4. Traduction française : mécanismes et mesures

1. Python utilise `_()` et Vue `__()`. Les métadonnées des DocTypes et les templates ont aussi des chaînes traduisibles.
2. `crowdin.yml` associe `lms/locale/main.pot` à `lms/locale/%two_letters_code%.po`. `AGENTS.md` demande de gérer les traductions avec Crowdin et de ne pas modifier manuellement `lms/locale/`.
3. Frappe fusionne les CSV historiques, les catalogues gettext **compilés en MO**, les langues parentes et les traductions utilisateur en base ; le résultat est mis en cache (`frappe/translate.py`). Les MO attendus sont dans `sites/assets/locale/fr/LC_MESSAGES/{app}.mo` (`frappe/gettext/translate.py`).
4. `lms.lms.api.get_translations` choisit la langue du compte connecté ou celle des System Settings pour un invité. `frontend/src/translation.js` charge ce dictionnaire dans `window.translatedMessages`. En l’absence de traduction, la chaîne anglaise source est renvoyée ; les substitutions `{0}` sont gérées. Le bootstrap transmet séparément la langue de l’utilisateur via `get_user_lang()`.
5. La traduction des contenus de cours, des titres saisis et des pièces jointes reste un travail éditorial ; la traduction de l’interface ne traduit pas ces données.

### Couverture statique mesurée

Lecture réelle des PO avec Babel dans le conteneur, hors en-tête, entrées obsolètes et pluriels. Le fichier LMS ne contient pas de `msgid_plural`.

| Catalogue | Entrées singulières | Avec traduction | Vides | Couverture renseignée |
| --- | ---: | ---: | ---: | ---: |
| LMS `lms/locale/fr.po` | 2 673 | 568 | 2 105 | 21,2 % |
| Framework `frappe/locale/fr.po` | 9 026 | 5 769 | 3 257 | 63,9 % |

Aucune entrée fuzzy parmi les messages comptés. Ces pourcentages mesurent le remplissage des catalogues, pas la qualité linguistique, la couverture des sources actuelles ni le pourcentage des écrans effectivement traduits.

### Disponibilité effective : anomalie prioritaire

Le répertoire `sites/assets/locale` est absent. Une lecture de `get_all_translations('fr')` sur le site connecté à sa base renvoie seulement **43 entrées** ; `Courses`, `Next`, `Student Progress`, `Signups` et `Lesson content` sont absents du dictionnaire effectif. Pourtant le PO LMS contient `Courses → Cours` et `Next → Suivant`. La langue des System Settings est vide lors du contrôle. L’API publique des traductions répond, mais cela ne démontre pas la disponibilité du français.

Les catalogues sources sont donc présents, mais le français n’est pas opérationnellement prêt. Recommandation pour une prochaine mission : compiler les catalogues avec la commande Bench disponible pour cette version, invalider les caches, configurer les langues système/utilisateur puis contrôler les dictionnaires et écrans. Aucune de ces modifications n’a été appliquée ici.

Autres limites : le chargement asynchrone de `window.translatedMessages` n’est pas un état Vue réactif ; un affichage initial anglais mérite un test navigateur. La langue du bootstrap et celle choisie par l’API pourraient diverger selon les préférences : à tester avec des comptes réels. `utils/dayjs.js` importe les locales ar/he/fa/ur et active uniquement ces locales RTL ; **le français n’est ni importé ni activé**, donc les formats textuels et relatifs Day.js restent susceptibles d’être anglais.

## 5. Éléments anglais identifiés

Inventaire ciblé fondé sur le code et les catalogues, sans prétendre à une recette visuelle exhaustive.

| Zone / preuve | Anglais ou défaut constaté | Traitement proposé |
| --- | --- | --- |
| Catalogue LMS `fr.po` | 2 105 entrées vides, notamment les explications de progression des programmes, `Lesson content`, `1 lesson`, `1 mark`, `(opens in a new tab)` | Prioriser apprenant, formateur, administration ; compléter via Crowdin avec glossaire |
| `pages/Courses/StudentCourseProgress.vue` | `title="Student Progress"` transmis directement au Dialog | Passer par `__()` puis ajouter au circuit d’extraction |
| `pages/Statistics.vue` | `Courses`, `Signups`, `Enrollments`, `Completions`, `Certifications`, `Signups per day`, etc. transmis littéralement aux graphiques | Traduire à l’appel ; `frappe-ui/src/charts/NumberCard.vue` affiche directement `title` |
| `components/UnsplashImageBrowser.vue` | placeholder `search by keyword` | Envelopper la chaîne et traduire |
| `templates/emails/community_course_membership.html` | `Dear {{ full_name }},` en texte direct | Traduire la salutation ; vérifier le déclenchement et la langue du destinataire |
| `utils/dayjs.js` | dates et durées textuelles sans locale française activée | Charger/activer `fr`, tester fuseaux, pluriels et formats |
| `_lms.py`, `Sidebar/AppSidebar.vue` | repli `Frappe Learning` ; éléments de marque encore présents | Configurer Website Settings et contrôler les replis sources |
| Formulaires, emails, certificats, contenus SCORM | exemples `London`, noms de démonstration, modèles et contenus externes potentiellement anglais | Revue éditoriale ; ne pas traduire aveuglément les identifiants techniques |

Les chaînes déjà enveloppées dans `_()`/`__()` peuvent elles aussi rester anglaises à cause d’un PO vide ou d’un MO manquant. Les statuts techniques (`Complete`, noms de DocTypes, rôles) doivent conserver leurs valeurs de stockage et être traduits uniquement dans leur présentation.

## 6. Fonctions pédagogiques présentes et évolutions

La présence est établie par les pages, DocTypes, contrôleurs et tests du checkout ; hors verrouillage des leçons, les parcours n’ont pas été exécutés de bout en bout.

| Domaine | Existant | Amélioration envisageable |
| --- | --- | --- |
| Cours | catalogue, catégories, chapitres, leçons, éditeur riche, médias/PDF/vidéo, inscription, progression, notes et avis | gabarits LittlePool, objectifs explicites, sous-titres/transcriptions, ergonomie mobile |
| Parcours | programmes regroupant des cours, progression ordonnée ; verrouillage séquentiel des leçons | parcours par compétence et diagnostic initial ; prévoir la remédiation quand une évaluation bloque |
| Évaluation | banque de questions, quiz, tentatives et résultats, devoirs et corrections, exercices de programmation avec cas de test | feedback explicatif, rubriques d’évaluation, remédiation et révision espacée |
| Groupes | cohortes/batches, inscriptions, emploi du temps, cours en direct, participants et feedback | parcours accompagnés, suivi des absences et alertes de décrochage |
| Certification | demandes, évaluateurs, rendez-vous, certificats, badges | modèles LittlePool et critères compréhensibles ; compétences et preuves exportables |
| Interopérabilité | lecteur/import SCORM, interfaces `API` et `API_1484_11` dans le lecteur | recette de paquets 1.2/2004 réels ; ne pas présumer d’une conformité exhaustive ; étudier xAPI/LTI si besoin |
| Pilotage | statistiques, suivi individuel des leçons et évaluations, durées vidéo | indicateurs métier, cohortes et exports ; définir les métriques avant de développer |
| Communauté / opérations | profils, emplois, intégrations de communication, paiements/coupons, paramètres d’administration | simplifier les menus pour le public cible ; valider séparément SMTP, paiement, visio et Raven |
| Surveillance des quiz | code et tests de proctoring présents | décider de l’usage réel et tester accessibilité, permissions caméra et traitement des données avant activation |

Ces améliorations restent des propositions : public, disciplines, modèle économique et modalités d’accompagnement LittlePool restent à préciser. Aucune intégration externe n’a été exercée.

## 7. Risques et recommandations

- **P0 — Français indisponible à l’exécution** : compiler/distribuer les MO puis configurer et tester la langue, avant d’évaluer seulement la qualité des traductions.
- **P1 — Couverture faible et chaînes hors extraction** : traiter les manques sur les parcours principaux, dates, emails et certificats inclus ; préserver Crowdin comme source.
- **P1 — Dépendances de développement mobiles** : Frappe v17 dev, composants UI liés au Framework, dépendance Payments ; conserver des commits précis et documenter la procédure de mise à jour. Examiner l’écart `target-version = py310` de Ruff avec le runtime Python 3.14 lors d’une future maintenance.
- **P1 — Recette encore partielle** : les tests unitaires/intégration ne démontrent pas les parcours navigateur, les connecteurs ni la capacité de reprise après perte de données. Tester sauvegarde/restauration sur une copie jetable.
- **P2 — Personnalisation maintenable** : privilégier les réglages natifs puis une extension Frappe pour les besoins métier ; conserver les correctifs génériques limités et synchronisables avec l’amont. Examiner les obligations AGPL avant distribution.
- **P2 — Données et accessibilité** : définir les rôles, la conservation des résultats, les droits d’accès et l’accessibilité des médias à partir des usages réels, surtout si des mineurs ou le proctoring sont concernés.

## 8. Contrôles réellement exécutés

| Contrôle | Résultat / limite |
| --- | --- |
| État cloud, politique réseau, accès au terminal | Restauration disponible ; état final running/connected/enforced |
| Git local + `git ls-remote --heads origin littlepool-dev develop` | checkout propre initial ; commit distant confirmé ; branche dédiée créée localement |
| Démon Docker et script local de démarrage | Docker 28.4.0 ; Redis PONG ; Frappe finit par répondre après quelques resets pendant son démarrage |
| Versions dans `docker exec lms-bench` | Python 3.14.10, Node 24.22.1 ; Bench et applications installées relevés |
| HTTP `GET /api/method/ping`, Host `learning.localhost` | `{"message":"pong"}` |
| HTTP `GET /lms` | 200 ; inspection HTML, sans exécution navigateur |
| Trois scripts référencés dans le HTML | 200, contenu reçu : index, runtime Rolldown, runtime Vue ; CSS non contrôlé séparément |
| HTTP `GET /api/method/lms.lms.utils.get_courses` | `{"message":[]}` ; zéro cours confirmé par lecture DB |
| HTTP `GET /api/method/lms.lms.api.get_translations` | réponse HTTP réussie ; français vérifié séparément par lecture explicite |
| Lecture DB et `get_all_translations('fr')` | langue système vide, 43 traductions ; catalogues MO français absents |
| Analyse Babel des PO français | décomptes reproduits en section 4 |
| `bench --site learning.localhost run-tests --app lms --module lms.tests.test_lesson_locking` | **32 tests d’intégration + 7 tests unitaires réussis (39)** |
| `yarn test --maxWorkers=4` dans `frontend/` du conteneur | **243 fichiers réussis, 1 échoué ; 2 677 tests réussis, 1 échoué / 2 678** en 226,77 s. Échec : `upcomingEvaluationsNotice.test.ts`, cas `warns in amber while the deadline is still ahead`, timeout à 20 000 ms |
| `yarn test src/tests/upcomingEvaluationsNotice.test.ts --maxWorkers=1` | **3/3 tests réussis** en relance isolée (9,08 s au total). Échec non reproduit isolément, compatible avec une sensibilité à la charge ; la suite complète reste en échec lors de son exécution |
| Contrôle des documents | `git diff --no-index --check /dev/null docs/AUDIT.md` et idem ROADMAP : aucun diagnostic d’espaces ou conflit ; code 1 normal pour des fichiers nouveaux différents de `/dev/null`. `pre-commit` absent du PATH hôte, non exécuté |

Erreurs de diagnostic rencontrées puis corrigées : `bench` absent et lien Python indisponible sur l’hôte (utilisation du conteneur) ; première tentative réseau dans le sandbox refusée (accès normal via le contexte autorisé ensuite) ; appel erroné `lms.lms.api.get_courses` renvoyant HTTP 417 (bonne méthode : `lms.lms.utils.get_courses`) ; première initialisation Python directe depuis la racine Bench donnant un chemin de log incorrect (lecture DB réussie depuis `sites/`). Ces tentatives ne sont pas des tests applicatifs réussis.

Les journaux de tests de cette tâche sont conservés dans `/workspace/scratch/littlepool-frontend-tests.log`, `/workspace/scratch/littlepool-frontend-retry.log` et `/workspace/scratch/littlepool-backend-tests.log`. Les résultats historiques cités dans `.setup/README.md` ne sont pas comptés comme exécutés dans cette tâche.

Non exécutés : suite Python complète, Playwright, recette authentifiée multi-rôles, rendu français navigateur, build neuf, charge, audit de sécurité exhaustif, intégrations externes, restauration de sauvegarde indépendante et tests de production. Les tests backend peuvent créer des données de test sur le site local ; aucune donnée de production n’est concernée.
