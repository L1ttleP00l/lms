# LittlePool Learning — Reprise Codex

Mis à jour le 28 octobre 2026 (Europe/Paris). **Lire ce fichier en premier à chaque reprise. FR-01D.3 terminé : les cinq commits FR-01D/FR-01D.2 sont publiés jusqu’à 1896abb6. Le POT validé de 2 980 clés est intégré dans un nouveau commit local non publié, avec rapport/handoff. Aucun PO ni code applicatif modifié. Attendre l’autorisation avant de publier ce commit POT. Arrêt avant FR-02 ; identité et circuit Crowdin en attente de validation.**

## 1. Projet et références Git

LittlePool Learning est un nom de travail provisoire pour une plateforme multilingue, fork amélioré de Frappe Learning. BRAND-01 propose Didorive (recommandé à approfondir), Syllovia, Didalume, Modulien et Savolet ; aucune identité finale validée, aucune disponibilité juridique ou de domaine établie. Politique officielle : **Fournir une traduction française intégrale tout en conservant l'anglais comme langue source et de secours, avec une langue système configurable et des préférences utilisateurs persistantes.** Réutiliser les mécanismes natifs Frappe/gettext/Crowdin, conserver les clés anglaises, ne pas coder le français directement et distinguer contenus pédagogiques et traduction d’interface. Le site local reste français ; les instances internationales peuvent choisir l’anglais ou une autre langue. Toute amélioration du sélecteur doit commencer par l’étude des fonctions natives, puis être validée, avec ordinateur et mobile prévus.

- Dépôt : https://github.com/L1ttleP00l/lms
- Branche exclusive : `littlepool-dev`.
- Répertoire : `/workspace/frappe-bench/apps/lms` ; `/workspace/lms` est un lien vers ce checkout.
- Dernier commit fonctionnel : `bc5cd471` (libellés Vue FR-01B et tests), publié.
- Dernier distant littlepool-dev vérifié après publication FR-01D.3 : `1896abb62f359b997f91d5a522acf7cd58b3155b`. Les cinq commits FR-01D/FR-01D.2 et les documents FR-01C/BRAND-01 sont publiés. Ne pas déduire l’état actuel des anciens rapports.
- Le commit portant cette actualisation documentaire est intitulé `chore(i18n): integrate validated POT catalogue and update handoff`. Son SHA ne peut pas être écrit dans son propre contenu ; à la reprise, relever le dernier commit exact par `git log -1 --oneline`.

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
3. **FR-01A** : activation des traductions françaises existantes et validation achevées. Le rapport initial appelle cette phase « FR-01 » ; la mission suivante l’a explicitement nommée FR-01A. FR-01B réalisé ensuite dans le strict périmètre des trois composants autorisés.
4. Catalogues français LMS et Framework compilés via `bench compile-po-to-mo --app <app> --locale fr`. Cache de traduction invalidé dans le contexte du seul site de développement.
5. Français système enregistré par la méthode native `lms.lms.api.set_system_preferences(language='fr')` sur ce site. Aucune préférence de compte existant forcée.
6. Deux anomalies reproduites puis corrigées dans LMS : API sans repli pour compte sans langue ; rendu Vue figé après arrivée asynchrone du dictionnaire. Aucun changement de source Framework.
7. Politique multilingue publiée dans d1022580 ; suivi 1f3db262 vérifié puis publié lors de FR-01B sur accord explicite.
8. FR-01B : trois composants Vue rendus traduisibles (13 clés distinctes, 17 emplacements), sans modifier scripts métier, classes CSS, API ou permissions. 16 tests ciblés, extraction native et build réussis ; Chromium FR/EN sur statistiques et progression. Aucun nouveau catalogue ni installation ; compte de test temporairement passé en anglais puis restauré en français. bc5cd471 et b70e7d38 publiés sur accord explicite.
9. FR-01C : examen ciblé des workflows Crowdin, de leur helper, de la chaîne native et des métriques ; stratégie comparative A/B/C et glossaire préparés. Projet Crowdin LittlePool recommandé sous réserve de validation/budget/droits ; Translation natif avec fixtures filtrées comme repli limité si Crowdin indisponible. Aucune configuration créée.

10. BRAND-01 : étude documentaire de nommage avec recherche web préliminaire ; cinq propositions et recommandation conditionnelle. Aucun choix adopté, dépôt/identifiant lms/visuels/domaines inchangés.
11. FR-01D : job POT limité à frappe/lms ; helper refusant tout contexte autre que GitHub Actions officiel avant installation/Git/gh. Génération locale native exécutée sur checkout propre. Résultat : 2 673 → 2 780 entrées, 111 ajouts / 4 retraits, 444 références modifiées. Les 13 clés FR-01B dont 7 nouvelles sont présentes ; validation Babel réussie. Diff global inattendu : intégration arrêtée et POT suivi restauré à l’identique, candidat conservé hors dépôt. Aucun changement des 79 PO contrôlés, du Framework ou des remotes.

12. FR-01D.2 : mapping natif LMS ajouté pour frontend/src/**.ts, exclusions des tests et déclarations. Trois tests de régression échoués avant et réussis après ; génération native 2 980 clés (311 ajouts / 4 retraits depuis le POT suivi, +200 / aucune suppression depuis le candidat FR-01D). 13 clés FR-01B et 8 clés enrollment.ts présentes. Aucun POT intégré, PO inchangés.

13. FR-01D.3 : publication des cinq commits autorisés par push normal vérifiée ; candidat FR-01D.2 applicable (sources/mapping/Framework inchangés), intégré localement sans nouvelle extraction. Babel et contrôles 13+8 clés, 311 ajouts/4 suppressions/506 références, paramètres/contextes/pluriels et 79 PO réussis. Aucun TSX suivi ou dans frontend/src. Nouveau commit POT non publié.

## 5. Fichiers créés ou modifiés

- `docs/AUDIT.md`, `docs/ROADMAP.md`, `docs/PLAN_FRANCISATION.md` : contexte historique ; consulter selon besoin, sans relire systématiquement tout l’audit.
- `lms/lms/api.py` : `get_translations()` utilise `get_all_translations(get_user_lang())`, comme le bootstrap pour la sélection de langue.
- `frontend/src/translation.js` : dictionnaire conservé dans un shallowRef Vue, variable globale préservée, interpolations et repli anglais conservés.
- `lms/tests/test_translations.py` : cinq tests d’intégration avec comptes et traductions temporaires réels.
- `frontend/src/tests/translation.test.ts` : chargement tardif, libellés calculés, interpolations, dictionnaire préchargé et repli anglais.
- `docs/FR-01-RESULTATS.md` : détail des mesures, commandes, tests et limites ; document principal pour reprendre FR-01A.
- `CODEX_HANDOFF.md` et encart de reprise dans `AGENTS.md` : continuité et règles permanentes.

FR-01B : `frontend/src/pages/Courses/StudentCourseProgress.vue`, `frontend/src/pages/Statistics.vue`, `frontend/src/components/UnsplashImageBrowser.vue` et le nouveau `frontend/src/tests/fr01bTranslations.test.ts`. Rapport : `docs/FR-01B-RESULTATS.md`. Le handoff est actualisé ; aucun autre composant modifié.

FR-01C : `docs/FR-01C-STRATEGIE.md` (comparaison, architecture, dix clés candidates et aria-label distinct, revue des trois traductions existantes), `docs/GLOSSAIRE_FR.md` (15 termes pédagogiques et arbitrages), et ce handoff. Aucun autre fichier modifié dans cette phase.

BRAND-01 : `docs/IDENTITE_PROJET.md` et ce handoff. Contrôles : pré-recherche web de confusions, références INPI/EUIPO/OMPI, cohérence et diff des documents ; aucun test applicatif ni vérification de disponibilité auprès des registres de marques/domaines/GitHub.

FR-01D : `.github/helper/update_pot_file.sh`, `.github/workflows/generate-pot-file.yml`, nouveau `.github/helper/test_pot_publication_guard.py` (commit local `a628ed1a`) ; `docs/FR-01D-RESULTATS.md` et ce handoff (rapport initial `dd9ec7b7`, puis revue documentaire courante). Aucun POT/PO committé.

FR-01D.2 : nouveau `babel_extractors.csv` racine et `lms/tests/test_gettext_extraction.py`, commit local `6fdb0dc1` ; mise à jour du rapport FR-01D et de ce handoff dans le commit documentaire courant. Aucune source applicative ni Framework modifiée.

FR-01D.3 : `lms/locale/main.pot` intégré depuis le candidat validé, `docs/FR-01D-RESULTATS.md` et ce handoff actualisés dans un seul commit local. Aucun PO, code, Framework ou mapping modifié par cette mission.

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

### Validation FR-01B (à réutiliser)

- 7 nouveaux tests : avant correction 1 réussi / 6 échoués ; après correction tous réussis.
- Contrôle ciblé avec plugin et composant voisin : 16/16 tests réussis en 3,07 s. Pas de suite complète relancée.
- Build frontend réussi (14,91 s) ; Prettier réussi ; scripts/classes et empreintes PO inchangés ; 13 clés reconnues par l’extracteur natif sans écrire POT/PO.
- Chromium réel : statistiques Cours en FR / Courses en EN ; dialogue Student Progress en FR et EN faute de traduction. Compte formateur fictif restauré à fr. Aucune erreur pageerror.
- Trois traductions ciblées réellement disponibles : Courses → Cours, Upload Image → Télécharger une image, Uploading {0}% → Envoi de {0}%. Dix clés ciblées encore absentes du dictionnaire FR : voir rapport. Les dictionnaires synthétiques des tests ne valent pas traductions déployées.
- UnsplashImageBrowser sans usage trouvé dans les écrans : tests de composant seulement, pas de parcours Chromium ni appel externe. Aucun upload réel testé.

### Contrôles FR-01C

Étude documentaire seulement : code/configuration versionnés et preuves FR-01B réutilisées, contrôle Git local/distant et relecture/diff/secrets des livrables. Aucun test applicatif, build, extraction, compilation, installation, accès Crowdin ou consultation de credentials. Politique linguistique et résultats précédents conservés.

### Contrôles FR-01D (ne pas relancer les tests applicatifs)

- 2 méthodes unittest réussies : 6 contextes de garde dont 5 refusés aussi avec le vrai script protégé ; contexte officiel testé uniquement sur le préambule terminé par sentinelle. Corps de publication jamais exécuté. YAML : condition du job et matrice contrôlées ; pas d’exécution Actions distante.
- bash -n, lecture YAML, AST/compilation Python, Ruff lint et format : réussis. Bench generate-pot-file --app lms : sortie 0, catalogue validé avec Babel ; 13/13 clés ciblées et 7/7 nouvelles ; paramètres et indicateurs communs préservés, msgstr vides.
- 79 empreintes PO identiques ; remotes, HEAD/état Framework inchangés ; POT suivi restauré octet pour octet ; diff et recherche ciblée de secrets contrôlés. Aucun frontend/backend/HTTP/navigateur/build/MO exécuté pour FR-01D.
- Comparaison persistante : rapport FR-01D avec inventaire des 111 ajouts et 4 retraits. Preuves complémentaires hors Git : /workspace/work/fr01d/{main.before.pot,main.generated.pot,main.generated.diff,comparison.json,generation.log,before.json,compare.py,validate_generated.py}. Leur persistance dépend de la restauration du workspace.

### Revue du comparatif FR-01D

Analyse seule, sans génération ni tests répétés : les 111 ajouts sont présents aux références indiquées. Les 4 suppressions viennent des anciens formulaires individuels remplacés par l’inscription multiple ; traductions FR vides, traductions non vides dans d’autres PO à conserver en mémoire lors d’une future synchronisation. Références : 409 déplacements de lignes, 6 changements de multiplicité à chemins identiques, 29 changements d’ensemble de chemins (22 ajouts seuls / 4 retraits seuls / 3 mixtes). Aucun msgctxt ni indicateur des clés communes modifié.

Lacune confirmée : les 6 messages singulier/pluriel de résultat d’enrollment.ts et les 2 actions Enroll 1 student / Enroll {0} students sont absents du candidat ; mapping natif sans .ts et pas de mapping propre LMS. Recommandation : corriger le périmètre d’extraction côté LMS après autorisation, vérifier la compatibilité de l’extracteur natif avec TypeScript puis refaire une extraction contrôlée. Aucun changement de sources ni POT fait pendant la revue. Détails, classement des 111 ajouts et impact des suppressions ajoutés au rapport existant. Artefacts d’analyse supplémentaires hors Git : /workspace/work/fr01d/review.py, review.json, review.log.

### Validation FR-01D.2

Correction native : règles LMS placées avant les règles Framework, première correspondance prioritaire ; extracteur JavaScript natif compatible avec le TypeScript actuel. CSV limité à frontend/src, ignore .d.ts/.test.ts/.spec.ts et dossiers tests/__tests__ sans remplacer les règles existantes des autres langages.

- 3 tests d’extraction échoués avant, 3/3 réussis après (passage final 0,051 s) ; vrais modules enrollment/proctoring/quizSummary/useSettingsSource, syntaxe TS et contexte synthétique, paramètres, occurrences répétées, exclusions et préservation JS/Vue/Python.
- Protections de publication : 2/2 méthodes réussies ; bash -n, Ruff lint/format ciblés, Babel Catalog.check, contrôles d’intégrité et secrets/diff réussis. Aucun test applicatif complet, installation, frontend build, navigateur ou MO.
- Inventaire : 434 TS, 256 ignorés, 178 éligibles, 38 avec messages ; 365 occurrences / 293 clés distinctes. Candidat : 2 980 entrées, 311 ajouts / 4 suppressions / 506 références modifiées contre le POT suivi ; +200 clés / 0 suppression / 93 références modifiées contre le candidat précédent. Tous msgstr vides et indicateurs communs inchangés. Les 13+8 clés attendues sont présentes ; aucune occurrence de test/déclaration TS dans le catalogue.
- 79 PO, Framework, remotes et POT suivi inchangés. Génération effectuée depuis checkout propre 6fdb0dc1 via bench generate-pot-file --app lms ; aucun update-po-files, réseau externe ou Crowdin. POT original restauré après copie du candidat.
- Artefacts : /workspace/work/fr01d2/ (main.before.pot, main.generated.pot, main.generated.diff, comparison.json/log, compare.py, before.json, generation.log, tests-before/after/final.log). Empreinte du candidat dans la section FR-01D.2 du rapport. Ne pas écraser ces preuves.

## 7. Problèmes connus et limites

- Traduction partielle : 568/2 673 entrées LMS renseignées, 2 105 vides. Compiler ne complète pas le catalogue ; les contenus éditoriaux ne sont pas traduits automatiquement.
- Babel signale une anomalie préexistante dans le PO Framework : `Use % for any non empty value.` / incompatibilité de paramètres. Compilation réussie mais validation Babel non entièrement verte. Aucun PO à modifier manuellement ; remonter au circuit amont.
- Pre-commit complet bloqué à l’installation npm du miroir Prettier (`EALLOWGIT`). Les contrôles Python et les versions prévues de Prettier/ESLint ont été exécutés séparément. Ne pas déclarer le lanceur complet réussi ; ne pas repartir dans une longue réparation sans nécessité.
- Avertissements de build existants : Vite esbuildOptions dépréciée, Browserslist ancien, module fs externalisé pour face-api.js.
- Un bref texte anglais avant réception RPC reste possible ; le rendu figé après réception est corrigé. Pas de basculement de langue instantané ajouté : rechargement testé.
- Non exécutés : suite backend complète, E2E historique complet, charge, autres navigateurs, mobile exhaustif, emails/PDF et connecteurs externes.
- Date Day.js française non activée et marque inchangée ; les chaînes directes des trois composants ciblés sont désormais enveloppées. La couverture des autres écrans n’est pas certifiée.
- FR-01C : workflow d’export Crowdin distinct bien présent, mais littlepool-dev non ciblé automatiquement. Le helper de génération POT cible toujours explicitement frappe/lms, mais FR-01D le bloque désormais hors Actions officiel. Ne jamais le réutiliser pour la génération locale du fork ; appeler directement Bench. Droits Crowdin, export des seules chaînes approuvées et coût d’un projet propre non vérifiés.
- Traductions candidates non livrées : Signups désigne des comptes, Enrollment des inscriptions pédagogiques ; Certifications compte des certificats publiés. Upload Image envoie un fichier local au serveur : Importer une image est proposé en remplacement de Télécharger une image, sans modifier le catalogue.

FR-01D : le POT historique du 23 octobre est en retard sur plusieurs évolutions métier de la base. FR-01D.2 ajoute encore 200 clés TypeScript au candidat initial ; ces ajouts ont été contrôlés. Le rafraîchissement global a été autorisé et intégré localement dans FR-01D.3 ; sa publication reste en attente. Les appels dynamiques, chaînes non enveloppées, .tsx et futures syntaxes TS ne sont pas couverts automatiquement. Les garde-fous de CI préviennent un accident ; ils ne sont pas une frontière de sécurité contre des variables falsifiées.

Les preuves, scripts et captures locales sont dans `/workspace/work/fr01/`, hors dépôt. Cinq comptes fictifs et un cours FR01 à deux leçons sont conservés sur le site local. Ne pas lire, copier ou publier les fichiers de credentials ; aucun secret n’est nécessaire dans ce handoff.

## 8. État Git local et distant

Références réellement vérifiées pendant FR-01D.3, 28 octobre 2026 :

- Distant littlepool-dev après push et fetch : `1896abb62f359b997f91d5a522acf7cd58b3155b`.
- Cinq commits autorisés publiés, ordre vérifié : a628ed1a, dd9ec7b7, 47cf7cf7, 6fdb0dc1, 1896abb6. Aucun push forcé ni fusion.
- develop distant : `6b791f33b34efa15566a0cb707f5be59d136df50`, inchangé.
- Seul nouveau commit local non publié : `chore(i18n): integrate validated POT catalogue and update handoff`, avec uniquement POT, rapport et handoff. Relever son SHA exact par git log -1 (impossible d’inscrire son propre hash dans son contenu).
- Checkout propre prévu après ce commit ; confirmer git status à la reprise. Publication de ce commit POT non autorisée à ce jour. Aucun changement non enregistré prévu.

## 9. Prochaine opération et travaux restants

**Prochaine action précise :** demander l’autorisation de publier le nouveau commit local contenant le POT de 2 980 clés, déjà intégré et validé. Ne pas régénérer ni réintégrer inutilement. Dernier distant : 1896abb6 ; commit local à relever par git log -1. Le POT intégré correspond au SHA-256 f089553d58a2c1a5fbab4457857ee5dbb0e17eec8beeb6425b184f1502a15a92. Aucun PO/runtime/Crowdin à modifier en attendant. Les validations spécifiques d’intégration sont dans la section FR-01D.3 du rapport et /workspace/work/fr01d3/validation.json. Les tests d’extraction/protection FR-01D.2 sont réutilisés sans relance ; aucun TSX suivi ni dans frontend/src. Après autorisation distincte seulement, avancer sur le circuit de traduction approuvé.

**Décision BRAND-01 en attente :** soumettre Didorive et Syllovia pour test linguistique FR/EN puis vérification des antériorités/disponibilités ; consulter les risques des cinq noms dans IDENTITE_PROJET. Obtenir la validation explicite du nom et du périmètre avant tout changement de références publiques. Ne pas renommer le dépôt ni l’identifiant technique lms, changer les visuels ou réserver un domaine par déduction. Aucune opération de renommage autorisée à ce jour.

**Suite FR-01C, toujours en attente :** faire valider au propriétaire l’option B (Crowdin dédié LittlePool, réutilisation officielle par revue), budget/droits, les dix traductions candidates plus l’aria-label et le glossaire ; obtenir l’accord explicite avant toute configuration externe. Les documents FR-01C/BRAND-01 sont déjà publiés. Option A reste utile pour contribuer les termes génériques ; option C, fixtures Translation natives filtrées dans une extension versionnée, est le repli limité si B n’est pas retenu. Rien de tout cela n’est déployé.

Une génération POT contrôlée a été autorisée et exécutée dans FR-01D, sans intégration à cause du diff global ; toute intégration ultérieure doit être revue. Après choix Crowdin et autorisation seulement : préparer un export/import dirigé vers le projet approuvé et littlepool-dev. Ne pas utiliser le helper de publication amont. Vérifier le filtrage des traductions approuvées, les variantes régionales et l’absence de secrets dans les livrables. Si C est choisi, valider d’abord l’exception au circuit Crowdin, le filtre de fixtures et le nettoyage des surcharges retirées.

FR-01C s’arrête à la préparation. Les dix traductions FR-01B restent manquantes à l’exécution ; les treize clés ciblées sont désormais dans le POT intégré localement, mais les dix traductions FR manquantes restent à produire/importer par le circuit approuvé ; Search by keyword est une clé d’accessibilité supplémentaire. Les propositions du document ne sont ni approuvées ni importées.

Ne pas commencer FR-02 sans nouvelle instruction. Les lots FR-02 à FR-05 et I18N-01 restent ceux du plan ; conserver EN source/secours, préférence utilisateur persistante/prioritaire et défaut configurable, et choisir des tests ciblés au lieu de relancer systématiquement les suites.

## 10. Sécurité et déploiement

Ne jamais intervenir sur la production OpenMediaVault 8 ni sur sa configuration Docker. Aucun déploiement, aucune fusion, aucune modification de develop, aucun push sans accord explicite. Pas de refonte graphique pendant FR-01A. Pas de modification manuelle des PO ; suivre Crowdin et les conventions AGENTS.md. Pas de modification Framework pour les correctifs LMS. Utiliser uniquement des comptes de test sans données personnelles réelles et ne publier ni mots de passe, jetons, cookies de session, configurations sensibles, MO ni assets générés.
