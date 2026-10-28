# LittlePool Learning — Reprise Codex

Mis à jour le 28 octobre 2026 (Europe/Paris). **Lire ce fichier en premier à chaque reprise. FR-01A terminé et publié ; arrêt avant FR-01B. Politique multilingue publiée dans d1022580 sur accord explicite. Le présent suivi de publication reste local.**

## 1. Projet et références Git

LittlePool Learning est une plateforme multilingue, fork amélioré de Frappe Learning. Politique officielle : **Fournir une traduction française intégrale tout en conservant l'anglais comme langue source et de secours, avec une langue système configurable et des préférences utilisateurs persistantes.** Réutiliser les mécanismes natifs Frappe/gettext/Crowdin, conserver les clés anglaises, ne pas coder le français directement et distinguer contenus pédagogiques et traduction d’interface. Le site local reste français ; les instances internationales peuvent choisir l’anglais ou une autre langue. Toute amélioration du sélecteur doit commencer par l’étude des fonctions natives, puis être validée, avec ordinateur et mobile prévus.

- Dépôt : https://github.com/L1ttleP00l/lms
- Branche exclusive : `littlepool-dev`.
- Répertoire : `/workspace/frappe-bench/apps/lms` ; `/workspace/lms` est un lien vers ce checkout.
- Dernier commit fonctionnel : `f1492f65` (corrections i18n et tests).
- Dernier commit avant ce suivi : `d1022580` (politique multilingue), désormais publié.
- Le commit portant cette actualisation documentaire est intitulé `docs: record multilingual policy publication`. Son SHA ne peut pas être écrit dans son propre contenu ; à la reprise, relever le dernier commit exact par `git log -1 --oneline`.

## 2. Règles permanentes pour économiser le quota

À chaque nouvelle tâche : lire d’abord CODEX_HANDOFF.md et les instructions AGENTS.md, puis uniquement les documents nécessaires ; vérifier rapidement branche et état Git. Réutiliser l’environnement existant. Ne pas réinstaller de dépendances opérationnelles. Ne pas répéter les analyses ou tests validés sans raison technique concrète. Limiter commandes, recherches et modifications au périmètre autorisé.

Ne supposer aucun quota chiffré. En cas de blocage, signaler la cause et proposer une correction avant une longue investigation ou une opération coûteuse. Des tests ciblés suffisent lorsqu’ils couvrent le changement ; ne pas lancer automatiquement toutes les suites.

À chaque fin de tâche, même interrompue : actualiser ce fichier avec le travail réalisé, les tests, les changements non enregistrés et la prochaine opération exacte ; effectuer un commit local cohérent des changements ; donner un résumé court en français. Aucune publication Git sans accord explicite.

## 3. Environnement connu

| Composant | Version connue / provenance |
| --- | --- |
| Frappe Framework | Bench `17.x.x-develop`, constante `17.0.0-dev`, commit `959b85d` |
| Frappe LMS | `2.45.2`, base applicative `6b791f33` |
| Payments | `0.0.1`, commit `7411976` |
| Python applicatif | `3.14.10`, relevé lors de l’audit |
| Node applicatif | `24.22.1`, relevé lors de l’audit |
| Docker local | `28.4.0` |

Site de développement : `learning.localhost`. Conteneurs existants : `lms-bench`, `lms-mariadb`, `lms-redis`. Port web local : 8000. Ne pas confondre Python/Node de l’hôte avec ceux du conteneur.

Sur une nouvelle restauration, les processus peuvent être arrêtés : lire `/workspace/.setup/README.md` puis réutiliser le script `/workspace/.setup/start-services.sh` si nécessaire. Lire la compétence cloud avant toute intervention sur cet environnement. Ne pas lancer `install.sh` par réflexe. Les outils Bench s’exécutent dans lms-bench, depuis `/workspace/frappe-bench`.

## 4. Phase et travaux terminés

1. Audit et feuille de route rédigés : `79c42808`.
2. Plan de francisation : `8b61d828` ; documents précédents publiés sur littlepool-dev. Politique multilingue et phases suivantes actualisées dans ROADMAP, PLAN_FRANCISATION et ce handoff, sans nouveau développement.
3. **FR-01A** : activation des traductions françaises existantes et validation achevées. Le rapport initial appelle cette phase « FR-01 » ; la mission suivante l’a explicitement nommée FR-01A. Pas de FR-01B réalisé.
4. Catalogues français LMS et Framework compilés via `bench compile-po-to-mo --app <app> --locale fr`. Cache de traduction invalidé dans le contexte du seul site de développement.
5. Français système enregistré par la méthode native `lms.lms.api.set_system_preferences(language='fr')` sur ce site. Aucune préférence de compte existant forcée.
6. Deux anomalies reproduites puis corrigées dans LMS : API sans repli pour compte sans langue ; rendu Vue figé après arrivée asynchrone du dictionnaire. Aucun changement de source Framework.
7. Mission actuelle : trois commits FR-01A vérifiés et publiés par push normal autorisé ; politique EN/FR enregistrée uniquement dans les trois documents concernés. Aucun test, build ou audit applicatif répété, aucune dépendance réinstallée, aucune configuration du site modifiée.

## 5. Fichiers créés ou modifiés

- `docs/AUDIT.md`, `docs/ROADMAP.md`, `docs/PLAN_FRANCISATION.md` : contexte historique ; consulter selon besoin, sans relire systématiquement tout l’audit.
- `lms/lms/api.py` : `get_translations()` utilise `get_all_translations(get_user_lang())`, comme le bootstrap pour la sélection de langue.
- `frontend/src/translation.js` : dictionnaire conservé dans un shallowRef Vue, variable globale préservée, interpolations et repli anglais conservés.
- `lms/tests/test_translations.py` : cinq tests d’intégration avec comptes et traductions temporaires réels.
- `frontend/src/tests/translation.test.ts` : chargement tardif, libellés calculés, interpolations, dictionnaire préchargé et repli anglais.
- `docs/FR-01-RESULTATS.md` : détail des mesures, commandes, tests et limites ; document principal pour reprendre FR-01A.
- `CODEX_HANDOFF.md` et encart de reprise dans `AGENTS.md` : continuité et règles permanentes.

Les MO, assets générés, comptes et paramètres du site sont hors Git. Les commits seuls ne transportent pas l’activation de la base et les assets. Les fichiers PO n’ont pas été modifiés.

## 6. Résultats validés et état effectif

Avant activation : langue système vide, MO absents, dictionnaire français effectif de 43 entrées. Après : langue `fr`, **6 102 clés**, Courses → Cours, Next → Suivant, Save → Enregistrer, Cancel → Annuler.

MO LMS : 568 messages, 26 373 octets. MO Framework : 5 769 messages, 500 977 octets. Les empreintes PO avant/après sont identiques ; elles figurent dans le rapport.

Tests exécutés lors de FR-01A, **ne pas les relancer sans nécessité** :

- Backend traduction : 5/5 réussis ; avant correction, deux cas échouaient sur le repli linguistique.
- Frontend ciblé : 9/9 réussis ; le test de chargement tardif échouait avant correction.
- Suite Vue complète : 244 fichiers, **2 680 tests réussis en une exécution**, 250,33 s. Cette suite a déjà été exécutée ; ne pas la répéter pour des changements documentaires.
- Build Vue : réussi, 14,08 s ; aucune mise en production.
- Chromium/Playwright : six profils vérifiés (visiteur, apprenant FR, formateur FR, gestionnaire FR, compte EN, compte sans préférence). Affichage Cours et Suivant correct sur les surfaces accessibles ; anglais respecté. Le bouton de leçon est inaccessible au visiteur selon les permissions existantes.
- Préférence enregistrée en anglais puis en français sur un même compte : persiste après deux rechargements par langue. État final de ce compte : français.
- HTTP : quatre endpoints et 91 références JS/CSS, tous HTTP 200.
- Ruff, AST, debug-statements, conflits, Prettier et ESLint exécutés séparément : réussis.

**Vérification légère lors de la création de ce handoff** : ping pong ; langue système toujours fr ; dictionnaire toujours 6 102, Cours/Suivant présents ; MO présents ; empreintes PO identiques. Pas de recompilation, réinstallation, modification fonctionnelle ou nouvelle suite de tests pendant cette mise à jour.

## 7. Problèmes connus et limites

- Traduction partielle : 568/2 673 entrées LMS renseignées, 2 105 vides. Compiler ne complète pas le catalogue ; les contenus éditoriaux ne sont pas traduits automatiquement.
- Babel signale une anomalie préexistante dans le PO Framework : `Use % for any non empty value.` / incompatibilité de paramètres. Compilation réussie mais validation Babel non entièrement verte. Aucun PO à modifier manuellement ; remonter au circuit amont.
- Pre-commit complet bloqué à l’installation npm du miroir Prettier (`EALLOWGIT`). Les contrôles Python et les versions prévues de Prettier/ESLint ont été exécutés séparément. Ne pas déclarer le lanceur complet réussi ; ne pas repartir dans une longue réparation sans nécessité.
- Avertissements de build existants : Vite esbuildOptions dépréciée, Browserslist ancien, module fs externalisé pour face-api.js.
- Un bref texte anglais avant réception RPC reste possible ; le rendu figé après réception est corrigé. Pas de basculement de langue instantané ajouté : rechargement testé.
- Non exécutés : suite backend complète, E2E historique complet, charge, autres navigateurs, mobile exhaustif, emails/PDF et connecteurs externes.
- Date Day.js française non activée ; chaînes Vue directes et marque inchangées.

Les preuves, scripts et captures locales sont dans `/workspace/work/fr01/`, hors dépôt. Cinq comptes fictifs et un cours FR01 à deux leçons sont conservés sur le site local. Ne pas lire, copier ou publier les fichiers de credentials ; aucun secret n’est nécessaire dans ce handoff.

## 8. État Git local et distant

Publication confirmée le 28 octobre 2026, après vérification du checkout propre, des trois commits attendus, des fichiers inclus et recherche ciblée de motifs de secrets sur leurs ajouts (aucun motif détecté). Push normal sans force, sans divergence et sans fusion.

Références distantes vérifiées après publication :

- `refs/heads/littlepool-dev` : `d1022580386e366ec0d5e09154bbeb57bc50156f`.
- `refs/heads/develop` : `6b791f33b34efa15566a0cb707f5be59d136df50`, inchangé.

Les commits autorisés sont désormais publiés :

1. `f1492f65` — corrections i18n et tests.
2. `556bf7bd` — rapport FR-01A.
3. `15b0f323` — handoff et règles de reprise.
4. `d1022580` — politique multilingue et phases suivantes, publié lors de la dernière opération sur accord explicite.

**Seul commit non publié après cette opération :** le présent suivi, `docs: record multilingual policy publication`, qui modifie uniquement CODEX_HANDOFF.md et a pour parent d1022580. SHA à relever avec `git log -1 --oneline`. Il reste local ; l’autorisation reçue couvrait d1022580 uniquement.

Contrôles de publication : checkout propre et branche littlepool-dev, fichiers attendus uniquement dans d1022580, recherche ciblée de secrets sans motif détecté, référence distante égale au parent avant push (aucune divergence), push normal sans force. Après fetch de littlepool-dev depuis GitHub, les identifiants des trois blobs CODEX_HANDOFF.md, ROADMAP.md et PLAN_FRANCISATION.md correspondent exactement à d1022580. develop reste inchangée. Aucun test applicatif, build, installation ou travail FR-01B exécuté. Aucun changement non enregistré prévu après ce commit local de suivi.

## 9. Prochaine opération et travaux restants

**Prochaine action précise :** lire ce handoff et vérifier rapidement Git, puis attendre la nouvelle mission. d1022580 est publié : ne pas refaire son push. Le suivi local ne peut être poussé qu’avec un nouvel accord explicite.

**Prochaine phase de développement recommandée : FR-01B**, à démarrer uniquement sur nouvelle instruction. Lire le périmètre actualisé de PLAN_FRANCISATION, traiter les chaînes Vue directes de StudentCourseProgress, Statistics et UnsplashImageBrowser, préserver les sources anglaises et la présentation, vérifier les tests ciblés FR/EN et l’extraction/Crowdin. Ne pas refaire FR-01A.

Ordre de localisation : FR-02 parcours apprenant ; FR-03 formateur/administration ; FR-04 notifications/courriels/certificats ; FR-05 interfaces secondaires et couverture globale. I18N-01 : étudier les fonctions natives de sélection et langue système, proposer une amélioration puis attendre validation avant développement. Chaque phase doit vérifier FR et EN, le repli anglais et les préférences persistantes. Aucune phase suivante n’a commencé dans cette mission.

## 10. Sécurité et déploiement

Ne jamais intervenir sur la production OpenMediaVault 8 ni sur sa configuration Docker. Aucun déploiement, aucune fusion, aucune modification de develop, aucun push sans accord explicite. Pas de refonte graphique pendant FR-01A. Pas de modification manuelle des PO ; suivre Crowdin et les conventions AGENTS.md. Pas de modification Framework pour les correctifs LMS. Utiliser uniquement des comptes de test sans données personnelles réelles et ne publier ni mots de passe, jetons, cookies de session, configurations sensibles, MO ni assets générés.
