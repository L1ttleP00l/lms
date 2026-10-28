# LittlePool Learning — Reprise Codex

Mis à jour le 28 octobre 2026 (Europe/Paris). **Lire ce fichier en premier à chaque reprise. FR-01A et FR-01B terminés et publiés. FR-01C préparatoire terminé localement : stratégie et glossaire proposés, aucune intégration réalisée. Arrêt avant FR-02 ; nouveau commit documentaire non publié.**

## 1. Projet et références Git

LittlePool Learning est une plateforme multilingue, fork amélioré de Frappe Learning. Politique officielle : **Fournir une traduction française intégrale tout en conservant l'anglais comme langue source et de secours, avec une langue système configurable et des préférences utilisateurs persistantes.** Réutiliser les mécanismes natifs Frappe/gettext/Crowdin, conserver les clés anglaises, ne pas coder le français directement et distinguer contenus pédagogiques et traduction d’interface. Le site local reste français ; les instances internationales peuvent choisir l’anglais ou une autre langue. Toute amélioration du sélecteur doit commencer par l’étude des fonctions natives, puis être validée, avec ordinateur et mobile prévus.

- Dépôt : https://github.com/L1ttleP00l/lms
- Branche exclusive : `littlepool-dev`.
- Répertoire : `/workspace/frappe-bench/apps/lms` ; `/workspace/lms` est un lien vers ce checkout.
- Dernier commit fonctionnel : `bc5cd471` (libellés Vue FR-01B et tests), publié.
- Base locale et distante avant FR-01C : `b70e7d38`, rapport FR-01B et handoff publiés.
- Le commit portant cette actualisation documentaire est intitulé `docs: propose FR-01C translation strategy and French glossary`. Son SHA ne peut pas être écrit dans son propre contenu ; à la reprise, relever le dernier commit exact par `git log -1 --oneline`.

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

## 7. Problèmes connus et limites

- Traduction partielle : 568/2 673 entrées LMS renseignées, 2 105 vides. Compiler ne complète pas le catalogue ; les contenus éditoriaux ne sont pas traduits automatiquement.
- Babel signale une anomalie préexistante dans le PO Framework : `Use % for any non empty value.` / incompatibilité de paramètres. Compilation réussie mais validation Babel non entièrement verte. Aucun PO à modifier manuellement ; remonter au circuit amont.
- Pre-commit complet bloqué à l’installation npm du miroir Prettier (`EALLOWGIT`). Les contrôles Python et les versions prévues de Prettier/ESLint ont été exécutés séparément. Ne pas déclarer le lanceur complet réussi ; ne pas repartir dans une longue réparation sans nécessité.
- Avertissements de build existants : Vite esbuildOptions dépréciée, Browserslist ancien, module fs externalisé pour face-api.js.
- Un bref texte anglais avant réception RPC reste possible ; le rendu figé après réception est corrigé. Pas de basculement de langue instantané ajouté : rechargement testé.
- Non exécutés : suite backend complète, E2E historique complet, charge, autres navigateurs, mobile exhaustif, emails/PDF et connecteurs externes.
- Date Day.js française non activée et marque inchangée ; les chaînes directes des trois composants ciblés sont désormais enveloppées. La couverture des autres écrans n’est pas certifiée.
- FR-01C : workflow d’export Crowdin distinct bien présent, mais littlepool-dev non ciblé automatiquement. Le helper de génération POT pousse explicitement vers frappe/lms et y ouvre la PR : ne pas l’exécuter sans adaptation autorisée. Droits Crowdin, export des seules chaînes approuvées et coût d’un projet propre non vérifiés.
- Traductions candidates non livrées : Signups désigne des comptes, Enrollment des inscriptions pédagogiques ; Certifications compte des certificats publiés. Upload Image envoie un fichier local au serveur : Importer une image est proposé en remplacement de Télécharger une image, sans modifier le catalogue.

Les preuves, scripts et captures locales sont dans `/workspace/work/fr01/`, hors dépôt. Cinq comptes fictifs et un cours FR01 à deux leçons sont conservés sur le site local. Ne pas lire, copier ou publier les fichiers de credentials ; aucun secret n’est nécessaire dans ce handoff.

## 8. État Git local et distant

Références vérifiées au début de FR-01C (28 octobre 2026) :

- littlepool-dev local et distant : `b70e7d38e4bbea3d049cfa242c41218b067bb372` ; checkout initial propre.
- develop distant : `6b791f33b34efa15566a0cb707f5be59d136df50`, inchangé.
- bc5cd471 et b70e7d38 sont publiés ; ne pas les pousser à nouveau.
- Nouveau commit local documentaire FR-01C : `docs: propose FR-01C translation strategy and French glossary` (SHA à relever avec git log). Parent b70e7d38 ; trois fichiers seulement : stratégie, glossaire et handoff. Aucun push autorisé ou effectué pour ce commit.

Aucun changement non enregistré prévu après ce commit. Aucun PO/POT, workflow, code applicatif ou paramètre de site modifié. Confirmer rapidement git status et le distant lors de la prochaine reprise plutôt que de déduire leur état des mentions historiques.

## 9. Prochaine opération et travaux restants

**Prochaine action précise :** faire valider au propriétaire l’option B (Crowdin dédié LittlePool, réutilisation officielle par revue), budget/droits, les dix traductions candidates plus l’aria-label et le glossaire ; obtenir l’accord explicite avant toute publication du commit documentaire ou configuration externe. Option A reste utile pour contribuer les termes génériques ; option C, fixtures Translation natives filtrées dans une extension versionnée, est le repli limité si B n’est pas retenu. Rien de tout cela n’est déployé.

Après choix et autorisation seulement : préparer une génération POT contrôlée depuis le commit du fork et un export/import dirigé vers le projet approuvé et littlepool-dev. Ne pas utiliser tel quel le helper qui cible frappe/lms. Vérifier le filtrage des traductions approuvées, les variantes régionales et l’absence de secrets dans les livrables. Si C est choisi, valider d’abord l’exception au circuit Crowdin, le filtre de fixtures et le nettoyage des surcharges retirées.

FR-01C s’arrête à la préparation. Les dix traductions FR-01B restent manquantes à l’exécution ; sept clés sont absentes du POT actuel, trois déjà présentes sont vides ; Search by keyword est une clé d’accessibilité supplémentaire. Les propositions du document ne sont ni approuvées ni importées.

Ne pas commencer FR-02 sans nouvelle instruction. Les lots FR-02 à FR-05 et I18N-01 restent ceux du plan ; conserver EN source/secours, préférence utilisateur persistante/prioritaire et défaut configurable, et choisir des tests ciblés au lieu de relancer systématiquement les suites.

## 10. Sécurité et déploiement

Ne jamais intervenir sur la production OpenMediaVault 8 ni sur sa configuration Docker. Aucun déploiement, aucune fusion, aucune modification de develop, aucun push sans accord explicite. Pas de refonte graphique pendant FR-01A. Pas de modification manuelle des PO ; suivre Crowdin et les conventions AGENTS.md. Pas de modification Framework pour les correctifs LMS. Utiliser uniquement des comptes de test sans données personnelles réelles et ne publier ni mots de passe, jetons, cookies de session, configurations sensibles, MO ni assets générés.
