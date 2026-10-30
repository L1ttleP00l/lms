# LittlePool Learning — Reprise Codex

Mis à jour le 30 octobre 2026 (Europe/Paris). **FR-03B.1 publié à b223c367e42b29613f46c68fbac220c1e49afb40. FR-03B.2 terminé localement : sélection multiple francisée, trois omissions Vue diagnostiquées et corrigées localement par __().format(), singulier seat ajouté. PO 740 traductions / 2 754 entrées ; POT 3 005 (+4/-0). Final 268 tests Vue/six fichiers, cinq tests Python d’extraction et quatre parcours Chromium FR/EN bureau/mobile réussis. Aucune écriture sensible tentée/transmise ; navigateur sur cours gratuit, preview non appelé. Deux commits locaux non publiés ; arrêt avant FR-03B.3. Limites mobile FR-03B.1/16 rejets JS/double clic/dates préservées.**

## 1. Projet et références Git

LittlePool Learning est un nom de travail provisoire pour une plateforme multilingue, fork amélioré de Frappe Learning. BRAND-01 propose Didorive (recommandé à approfondir), Syllovia, Didalume, Modulien et Savolet ; aucune identité finale validée, aucune disponibilité juridique ou de domaine établie. Politique officielle : **Fournir une traduction française intégrale tout en conservant l'anglais comme langue source et de secours, avec une langue système configurable et des préférences utilisateurs persistantes.** Réutiliser les mécanismes natifs Frappe/gettext/Crowdin, conserver les clés anglaises, ne pas coder le français directement et distinguer contenus pédagogiques et traduction d’interface. Le site local reste français ; les instances internationales peuvent choisir l’anglais ou une autre langue. Toute amélioration du sélecteur doit commencer par l’étude des fonctions natives, puis être validée, avec ordinateur et mobile prévus.

- Dépôt : https://github.com/L1ttleP00l/lms
- Branche exclusive : `littlepool-dev`.
- Répertoire : `/workspace/frappe-bench/apps/lms` ; `/workspace/lms` est un lien vers ce checkout.
- Dernier commit source/tests local : `52042468` (FR-03B.2).
- Dernier distant littlepool-dev vérifié : `b223c367e42b29613f46c68fbac220c1e49afb40` ; FR-03B.1 publié après diagnostic du toast mobile restant non confirmé, sans régression attribuable identifiée. Base FR-03B.2 propre et distante identique avant modification.
- Commit courant de livraison : `feat(i18n): deliver French bulk enrollment selection catalogue` ; relever son SHA par git log -1.

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

14. FR-01E : sources officielles Crowdin consultées le 29 octobre ; programme open source conditionnel (ancienneté, communauté, absence de produits commerciaux associés notamment), admission du fork non établie. Montants payants non accessibles dans la page officielle dynamique, donc non confirmés. Comparaison Crowdin / PO natifs / hybride, procédure d’amorçage/export approuvé et plan de lots préparés ; aucun compte/service créé.

15. FR-01F : pilote local explicitement autorisé en dérogation limitée à la convention Crowdin pour les 21 clés du seul lms/locale/fr.po. 15 entrées ajoutées depuis le POT, 18 traductions renseignées, une correction Upload Image et deux conservations. Autres blocs/78 PO/POT intacts. MO compilé et cache du seul site de développement invalidé ; 21 traductions réellement chargées, contrôles Chromium FR/EN ciblés réussis. Aucun push.

16. FR-02A : catalogue publié/inscrit/à venir/recherche vide, fiche FR01, vues mobile et volet Filtres, dialogue d’avis sans soumission parcourus avec compte apprenant fictif FR. 39 clés prioritaires proposées dans FR-02A-AUDIT ; inventaire technique 105 clés dont branches secondaires/édition, pas 105 corrections automatiques. Aucun nouveau test complet ni build ; pas de modification applicative/catalogue.

17. FR-02B.1 : six catégories prioritaires autorisées corrigées sans élargir aux 39 clés de l’audit. Code/tests dans 55e4dd3a ; génération native contrôlée +5 clés / -2 inutilisées / 48 références, POT 2 983 ; sept traductions PO ajoutées, total 593. Compilation, build nécessaire, 60 tests ciblés et quatre parcours FR/EN bureau/mobile réussis. Aucune donnée pédagogique/avis enregistrée.

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

FR-01E : nouveau `docs/FR-01E-CIRCUIT-TRADUCTION.md` et ce handoff uniquement ; un seul commit documentaire local.

FR-01F : `lms/locale/fr.po` et nouveau `lms/tests/test_french_pilot.py` dans 3fd92090 ; `docs/FR-01F-RESULTATS.md` et ce handoff dans le commit documentaire courant. Exception limitée consignée dans le rapport, convention générale AGENTS.md inchangée.

FR-02A : nouveau `docs/FR-02A-AUDIT.md` et ce handoff uniquement, un seul commit documentaire local.

FR-02B.1 : six Vue (Courses, CourseOverview, CourseCard, CourseCardOverlay, ListPage, ReviewModal) et nouveau coursePriorityTranslations.test.ts ; lms/locale/main.pot et fr.po ; docs/FR-02B1-RESULTATS.md, deux termes confirmés dans GLOSSAIRE_FR.md et ce handoff. Aucun autre catalogue/source Framework/dépendance modifié.

FR-02B.3 : CourseOverview.vue, CourseCreatorCard.vue, CourseInstructors.vue, CourseReviews.vue ; tests CourseReviews.test.ts et nouveau courseDetailTranslations.test.ts ; fr.po/main.pot, docs/FR-02B3-RESULTATS.md et ce handoff.

FR-02B.4 : RelatedCourses.vue, VideoPreview.vue, nouveau courseRemainingTranslations.test.ts, fr.po, docs/FR-02B4-RESULTATS.md et ce handoff ; aucun POT ni source Framework modifié.

FR-02C : nouveau docs/FR-02C-AUDIT.md et ce handoff uniquement ; aucune source applicative ni catalogue modifié.

FR-02C.1 : CourseCardOverlay.vue (seul fallback), nouveau courseSelfEnrollmentTranslations.test.ts, fr.po, docs/FR-02C1-RESULTATS.md et ce handoff ; POT/backend/helper global inchangés.

FR-02C.2 : Billing.vue, payments.py (titres littéraux seulement), Billing.test.ts, nouveau test_billing_gettext.py ; fr.po/main.pot, docs/FR-02C2-RESULTATS.md et ce handoff.

Les MO, assets générés, comptes et paramètres du site sont hors Git. Les commits seuls ne transportent pas l’activation de la base et les assets. Les PO sont restés inchangés jusqu’à FR-01E ; seul fr.po LMS est modifié dans le pilote autorisé FR-01F.

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

### Étude FR-01E (documentaire seulement)

Sources officielles datées/liées dans docs/FR-01E-CIRCUIT-TRADUCTION.md ; pas de tarif payant actuel certifié. La licence open source annoncerait 0 abonnement si accordée, mais le fork public seul ne démontre pas l’éligibilité (conditions d’activité/ancienneté et partage Global TM à accepter). Base locale sans abonnement SaaS possible avec éditeur PO et revue, après validation de l’exception à AGENTS.md. Aucun coût humain chiffré ni souscription proposée comme déjà décidée.

Lecture seule : 568 clés du POT ont une traduction non vide dans fr.po (aucune fuzzy), 2 412 n’y ont pas de traduction renseignée. Le runtime Framework peut couvrir d’autres clés ; ne pas présenter cette mesure comme un test de rendu. Empreintes 79 PO et POT publié inchangées. Aucun test, build, extraction, compilation, installation ou nouveau conteneur. La page GNU complémentaire n’a pas répondu ; les tarifs dynamiques Crowdin ne sont pas lisibles par les sources accessibles. Aucun accès de compte/secret ni contact externe.

Risque à traiter au premier import : export approuvé seul peut vider les traductions héritées non encore approuvées ; préserver la base et organiser la revue/approbation avant remplacement complet. Une seule autorité d’édition par phase, pas de traductions locales et Crowdin concurrentes. Contextes d’éditeur ≠ msgctxt runtime ; le plugin Vue actuel ne lit pas le troisième argument de contexte.

### Validation FR-01F (état courant du pilote local)

- 21 clés : 13 FR-01B et huit résultats/actions d’inscription TS ; 18 traductions ajoutées, une correction (Upload Image → Importer une image), deux conservations. 2 688 entrées PO / 586 non vides contre 2 673 / 568 avant. Les nouveaux libellés globaux Enrollments → Inscriptions et Certifications → Certificats évitent de restreindre les usages parcours/navigation. Signups → Comptes créés conserve une nuance : utilisateurs activés seulement. Formulations à relire, détails dans FR-01F-RESULTATS.
- 3/3 nouveaux tests autonomes de catalogue réussis (0,161 s final), Babel/paramètres/flags/contextes et conservation des blocs hors cible réussis. 78 autres PO et POT inchangés ; Framework et code applicatif inchangés. Ruff/format, diff et secrets ciblés réussis. Pas de suite générale ni build.
- bench compile-po-to-mo --app lms --locale fr puis bench --site learning.localhost execute frappe.translate.clear_cache : réussis. MO LMS 586 messages / 27 525 octets ; SHA-256 f17789e78594b7c6b8ee233966a11ebe33e870f3b13a4c99036903ffee26cba2. FR runtime 6 102 → 6 120 ; 21/21 valeurs correspondent au plan final. Framework non recompilé.
- Backend : Guest/compte FR/sans préférence → fr ; compte EN → en malgré défaut site fr. Chromium : cartes et trois sous-titres temporels, progression individuelle, plugin réel (21 clés), huit helpers d’inscription 1/2, pourcentage 0/37/100, repli anglais, préférence/rechargement FR/EN réussis. Compte formateur fictif temporairement EN puis restauré FR, vérifié en base. Aucune inscription/paiement créé.
- Rendu non vérifié : Course Completion masqué faute de complétions ; UnsplashImageBrowser sans parcours accessible. Leurs clés sont chargées, mais pas de preuve de rendu de ces deux surfaces. L’aria-label Search by keyword et descriptions d’erreurs multiples restent hors lot, avec repli anglais.
- Harnais navigateur initial échoué sur retour __() avec placeholder (objet .format), corrigé dans le seul script de contrôle ; parcours FR/EN final complet réussi. Pas d’installation typescript : Node stripTypeScriptTypes existant utilisé pour exécuter les vrais helpers dans le navigateur avec window.__ réel ; avertissement expérimental sans erreur pageerror. Détails dans le rapport.
- Preuves : /workspace/work/fr01f/ (sauvegarde fr.before.po, plan.json, scripts, empreintes, avant/après, journaux qualité/compilation/navigateur et captures). Ne pas publier les credentials existants. Les MO/cache du site de développement ne sont pas transportés par Git.

### Relecture finale FR-01F

Décisions utilisateur appliquées : Enrollments → Inscriptions et Certifications → Certificats conservés ; deux upgraded messages → Option certificat activée pour 1 apprenant / Option certificat activée pour {0} apprenants. Contexte confirmé : activation de purchased_certificate sur inscription existante, sans délivrance immédiate de certificat. Les 21 entrées sont relues, aucune autre correction linguistique nécessaire ; améliorations des statistiques reportées à un lot UX séparé.

Babel ciblé, conservation des autres messages/paramètres/contextes/indicateurs, compilation MO en mémoire et interpolation pour 2 apprenants : réussis. Toujours 586 traductions sur 2 688 entrées PO ; 78 autres PO et POT inchangés. Attente du test pilote alignée sur les deux nouvelles phrases, sans relancer les tests existants. Pas de compilation MO sur le site ni de navigateur : les deux formulations révisées sont dans Git/PO, mais le MO de développement et les preuves de rendu FR-01F gardent l’ancien texte. Avant nouvelle vérification runtime autorisée, compiler LMS/fr et invalider le cache du seul site de développement.

Rapport et handoff actualisés dans un seul commit local de relecture avec PO/test. Preuves : /workspace/work/fr01f-review/. Limites inchangées : Unsplash non rendu, graphique d’achèvement masqué, textes hors lot restant anglais. Aucune généralisation de l’exception PO.

### Vérification fonctionnelle finale FR-01F — état runtime actuel

Début sur littlepool-dev propre à 50384d1e575eaf1d625f8ba9e491c95bca308309. Commande exécutée dans le conteneur existant lms-bench : bench compile-po-to-mo --app lms --locale fr, depuis /workspace/frappe-bench. Réussie ; MO LMS 27 514 octets, SHA-256 321e896bbf31487514a995cc36fac38c9cdf7b0f156cc752849693dd29d5df51. Aucune installation, nouvelle extraction, modification de PO/POT ou code.

Après compilation : PO et MO contenaient les nouvelles formulations, mais get_all_translations('fr') gardait les deux anciennes. Cause identifiée avant nettoyage : cache natif de traduction fusionnée encore alimenté par l’ancien MO. Commande native bench --site learning.localhost execute frappe.translate.clear_cache exécutée sur le seul site de développement. Après : PO/MO/dictionnaire concordent, 6 120 clés, langue système fr inchangée. Aucun nettoyage global Redis ni autre site touché.

Chromium : source réelle enrollment.ts dépouillée des types via Node existant, helpers enrollOutcome exécutés avec résultats fictifs et vrai window.__ de la page. Les résultats sont affichés dans une zone DOM de contrôle ajoutée temporairement à la page, puis vérifiés pour 1, 2, 5 apprenants : Option certificat activée pour 1 apprenant / 2 apprenants / 5 apprenants. Français brut chargé avec {0} conservé ; anglais : 1 student upgraded to certificate / 2 et 5 students upgraded to certificate. Repli de la clé hors lot Search by keyword vers anglais correct. Préférence fr puis en vérifiée après rechargement, compte formateur fictif restauré à sa préférence initiale fr et confirmé en base. Aucun appel d’inscription/paiement ni modification pédagogique. Ce n’est pas une E2E transactionnelle du formulaire ou du toast métier.

Journaux : aucune pageerror JavaScript et aucune erreur de traduction identifiée. **L’assertion d’absence totale d’erreurs du harnais navigateur échoue**, malgré le succès des assertions linguistiques : trois réponses 403 de boot_config de télémétrie durant le parcours FR/EN, puis une quatrième lors du diagnostic ; logs frappe/services confirment quatre PermissionError pour cette URL. Diagnostic complémentaire identifie aussi socket.io HTTP 400, favicon.ico 404 et chargement de https://pulse.m.frappe.cloud/assets/pulse/js/pulse_client.js refusé par le tunnel/proxy. Ne pas déclarer l’environnement sans erreur ni qualifier ces erreurs de préexistantes sans preuve. Aucune correction de ces services hors périmètre entreprise.

Lecture des ajouts aux journaux bench.log, database.log, frappe.log et services.log ainsi qu’aux journaux de site depuis offsets enregistrés : quatre PermissionError de télémétrie, aucune exception de traduction/HTTP 500 relevée dans cet intervalle. Une sonde auxiliaire a échoué en essayant de compter Error Log via SQL : DocType virtuel SQLiteLogDocument (is_virtual=1), donc pas de table MariaDB tabError Log ; lecture des fichiers utilisée à la place, aucune migration ou modification DB. Les essais de contrôle échoués ne sont pas revendiqués comme réussis.

Preuves hors Git : /workspace/work/fr01f-final/ (compile.log, cache.log, after-compile.json, after-cache.json, final.json/log, measure.py, browser.cjs/log/json, render-fr/en.png, logs.before.json, log-review.json, network-diagnostic.cjs/log/json). Aucun credential copié. Aucun test/suite applicative, build, revalidation générale du pilote ou génération de données relancé. Les limites Unsplash/graphique masqué restent inchangées. Le rapport FR-01F historique garde les preuves datées avant cette activation ; ce paragraphe remplace la mention ancienne « deux nouvelles phrases non encore chargées ».

### Audit linguistique FR-02A

Documents FR-01F et glossaire réutilisés. Composants réels : Courses → ListPage/EmptyStateLayout/CourseCard ; CourseDetail → CourseOverview → CourseCardOverlay, CourseOutline/ChapterRow, CourseReviews/ReviewModal, CourseCreatorCard/RelatedCourses. Onglets administrateur non considérés comme oubli d’onglets apprenant.

Parcours Chromium ciblé, compte apprenant fictif déjà en fr sans changer sa préférence : catalogue publié, inscrit, à venir vide, recherche vide, fiche FR01 ; catalogue/fiche mobile, volet Filtres et dialogue Write a Review sans soumission. Neuf états observés, aucune inscription/paiement/avis/progression modifié. Aucun pageerror dans les sept premiers écrans ; télémétrie boot_config 403 toujours observée, pas d’investigation générale répétée. Lecture des sources et extracteur natif en mémoire sur 16 Vue pour provenance : 105 clés (71 sans valeur runtime / 34 présentes), périmètre principal sélectionné 39 clés. Aucun PO/POT écrit, aucun test complet/build/compilation/cache.

P0 : Aucun Courses trouvé (Courses passe un nom anglais ; état et annonce partagée ne traduisent pas l’argument), Submit/Please enter a rating./Error dans ReviewModal sans __(), Free → Libre, Review → Révoir, 3 inscrit. P1 : onglets Upcoming/Enrolled, filtre certificat mobile, contenu/à propos/actions/avis, annonces accessibles, compteurs section/lesson(s), texte de progression. Propositions et références exactes dans le rapport ; les 39 lignes ne sont pas toutes des PO vides et certaines demandent des phrases complètes/cas singulier-pluriel.

Les faux sens Libre/Révoir/inscrit sont dans le PO LMS, pas des erreurs exclusivement Framework. Plusieurs mots génériques ont la même traduction dans les deux PO. Collapse visible vient du littéral frappe-ui alors que LMS traduit seulement l’aria-label ; hors correction silencieuse d’une dépendance. ListFooter par défaut a des littéraux mais LMS remplace son slot droit, donc of est correctement sur ici. Textes sr-only distingués du texte visible ; body.innerText seul ne prouve pas une visibilité graphique.

Contenus anglais de description/introduction du cours, catégorie Business, tags, noms/bios/avis sont des données, pas des chaînes de composants à ajouter au POT. La marque provisoire n’est pas renommée. Branches payant/non inscrit/terminé/certificat/cours liés/plusieurs formateurs/avis anciens non parcourues. Lecture sr-only ≠ essai lecteur d’écran. Futur lot PO nécessite une nouvelle autorisation : l’exception FR-01F ne couvrait que ses 21 clés.

Artefacts hors Git : /workspace/work/fr02a/ (browser/extra-browser scripts, journaux/JSON, captures, inventory.py/log/json et catalog-hashes.json). Intégrité des 79 PO, POT et Framework vérifiée avant commit documentaire ; aucune modification de sources. Rapport préparé et recommandations soumises, FR-02B non démarré.

### FR-02B.1 — validation finale

Origines et résultats détaillés dans docs/FR-02B1-RESULTATS.md. Clés contextuelles Free course → Gratuit, Your review → Avis, No courses found → Aucun cours trouvé ; globals Free/Review conservés (Libre/Révoir pour leurs usages hors lot). Submit/Error enveloppés et traductions existantes réutilisées ; validation Please enter a rating. → Veuillez attribuer une note. Nouvelle prop emptyTitle optionnelle de ListPage pour panneau ET annonce, autres pages gardant le fallback précédent.

Compteurs des cartes/fiche : clés FR-01F 1 student enrolled / {0} students enrolled réutilisées (1 apprenant inscrit / n apprenants inscrits). Zéro reste masqué comme avant ; nombres/arrondis existants inchangés. Progression du cours : {0} %, aria Progression du cours et Leçons terminées : {0} sur {1} ajoutés directement dans les composants concernés. Sept traductions supplémentaires, PO 2 693 entrées / 593 renseignées ; 78 autres PO intacts.

POT généré nativement sur checkout propre : 2 980 → 2 983, cinq ajouts contextualisés, enrolled/{0} enrolled retirés faute d’usage, 48 changements de références. Aucun indicateur commun changé, aucun rafraîchissement inattendu. Une tentative avec la clé globale {0}% completed a échoué en validation Babel (double flag brace/printf, % c) avant toute écriture PO ; remplacée par Course progress: {0}% sans altérer cette clé globale. Premier candidat conservé hors Git, final validé.

7 fichiers / 60 tests ciblés réussis en 9,00 s dans l’état final ; 12 nouveaux cas FR/EN et compteurs 0/1/2/5, validation/fallback d’avis simulés. Avant correction 12 échecs ; deux attentes de zéro visible du harnais ont été rectifiées, pas le comportement de l’application. Prettier, Babel PO/POT et paramètres, git diff et intégrité réussis. Aucun backend/Vue complet. Build nécessaire aux sources Vue modifiées réussi (14,46 s), déclarations générées restaurées ; aucune installation ou publication d’assets.

MO LMS/fr compilé (593 messages / 27 902 octets) et cache du seul site de développement invalidé. Sept valeurs concordent dans PO/MO/dictionnaire ; globals restent inchangés. Dictionnaire fusionné observé 6 265 clés (6 084 applications, 181 autres dont pays) : ne pas attribuer la différence avec 6 120 à ces seules sept traductions. Défaut site fr inchangé.

Chromium fr/en × bureau/mobile : prix/compteurs/progression accessible, titre vide et annonce, champ Avis/Your review, Valider/Submit, validation de note zéro vérifiés. Zéro requête d’insertion d’avis, aucune donnée pédagogique/paiement modifiée. Préférence du compte apprenant fictif restaurée à fr et confirmée en base. Pas de pageerror ; erreurs HTTP annexes connues relevées, non corrigées. Bornes 0/1/2/5 testées avec données de composants ; navigateur sur effectif réel 3. Pas de test lecteur d’écran exhaustif.

Preuves hors Git : /workspace/work/fr02b1/ (scripts, sauvegardes, empreintes, comparaisons, journaux tests/génération/compilation/build, captures et validation.json/final-check.json). Les autres libellés anglais de l’audit restent hors lot ; pas d’achat/certificat ni FR-02B.2. Dérogation Crowdin limitée aux sept traductions nécessaires, non généralisable.

### FR-02B.2 — reprise immédiate

Rapport : docs/FR-02B2-RESULTATS.md. Seul code applicatif modifié : Courses.vue, clés My enrollments/With certificate à la place des globals Enrolled/Certification ; description complète anglaise via emptyDescription existant. Composants partagés, valeurs de filtres/routes/API inchangés. Seize traductions nécessaires dont la branche vide avec filtres seuls ; aucun changement hors de ces blocs français. Ancienne description générique avec {0} conservée pour les autres ressources.

POT natif 2 983 → 2 986 (+3, aucune suppression, 15 références), PO 2 693 → 2 696 et 593 → 609 traductions. Babel/paramètres/contextes/flags/MO/dictionnaire concordants. MO 609 messages, 29 157 octets ; dictionnaire fusionné observé 6 281 clés. Compilation native et clear_cache du seul site learning.localhost réussis. Les 78 autres PO (38 LMS + 40 Framework) sont inchangés ; une assertion initiale comptait à tort les 79 dans LMS seul, corrigée sans toucher aux fichiers.

Tests : cinq fichiers / 51 réussis en une exécution finale (10,93 s), dont 16 nouveaux cas FR/EN, compteurs 0/1/2/5 et progression simulée 0/25 sans changer d’inscription. Échecs intermédiaires du harnais documentés (URL d’onglet non écrite par le code existant, fixture is_student, rendu des doubles, sélecteurs/syntaxe). Prettier/git diff réussis ; pre-commit complet non relancé, hooks désactivés après contrôles ciblés. Build nécessaire 16,38 s réussi, déclarations restaurées, assets non suivis.

Chromium quatre combinaisons FR/EN bureau/mobile : onglets radios, filtre certificat, recherche vide/effacement, fiche/actions initiales et conservation Gratuit/compteur. Aucune pageerror ; 15 HTTP annexes hors lot. Zéro insertion, aucune donnée pédagogique modifiée. Préférence fictive restaurée fr et confirmée en base ; une assertion exécutée pendant le parcours anglais a échoué, contrôle final après restauration réussi. Reprendre est testé avec simulation de composant, pas transaction réelle. Aucun lecteur d’écran exhaustif ni suite complète. Preuves hors Git /workspace/work/fr02b2/, aucun secret copié.

### FR-02B.3 — état courant

Rapport docs/FR-02B3-RESULTATS.md. Quatre Vue : CourseOverview compte 1 chapter/{0} chapters et 1 lesson/{0} lessons ; CourseCreatorCard fournit des noms d’action accessibles et restaure le focus sur le profil après sélection ; CourseInstructors contextualise and {0} other instructors ; CourseReviews utilise deux phrases de moyenne/effectif, notes accessibles, aria-expanded/controls et dates complètes. Aucun calcul, permission, contenu éditorial ou profil modifié en base. Rating/section/sections/lesson/lessons du PO inchangés.

22 traductions ajoutées : PO 2 706 entrées / 631 renseignées ; POT natif 2 985 (+10/-11, 15 références). Tous les retraits sont des fragments remplacés, conservés dans les PO. Autres blocs français/en-tête identiques ; 78 autres PO et Framework inchangés. Babel/paramètres/contextes/flags réussis. Compilation et cache natifs du seul site réussis ; MO 631 messages / 30 279 octets, 22 valeurs concordantes et 16 valeurs FR-02B.2 conservées. Today → Aujourd'hui déjà chargé, non modifié. Dictionnaire agrégé observé 6 161 : ne pas comparer sa seule taille à 6 281 comme preuve de perte LMS, contributions/cache natifs variables.

Tests : 24 nouveaux cas FR/EN, revue des tests CourseReviews ; passage final 62 tests / quatre fichiers tous réussis en 8,49 s. Bornes de compteurs/avis 0/1/2/5 et formateurs 1/2/5 simulées ; cinq dates vérifiées. Prettier/git diff et recherche ciblée de secrets réussis, pre-commit complet non relancé et hooks désactivés après contrôles. Build nécessaire réussi 16,34 s, déclarations restaurées.

Chromium : quatre combinaisons FR/EN bureau/mobile ; réel 1 chapitre/2 leçons/zéro avis, puis réponses réseau simulées de cinq formateurs/avis sans écriture. Dépliage au clavier, cinq dates, résumés, noms accessibles et focus du profil après sélection sur bureau réussis. Carte détaillée des formateurs déjà masquée sur mobile, disposition conservée ; pas de lecteur d’écran ni cycle Tab exhaustif. Zéro insertion/pageerror ; dix HTTP annexes hors lot. Préférence fictive restaurée fr confirmée en base. Premier harnais échoué sur DNS Node route.fetch, remplacé par capture/substitution de réponse Chromium ; détails sensibles du journal de cet outil expurgés, aucun secret suivi. Preuves /workspace/work/fr02b3/. Pas de nouveau lot ni publication autorisés.

### FR-02B.4 — état courant

Rapport docs/FR-02B4-RESULTATS.md. Deux Vue modifiés : RelatedCourses devient une région section nommée par h2/useId ; VideoPreview fournit le nom accessible existant Video preview à video. Conditions, lecture, safeUrl et routes conservées. CourseOverview/CourseCardOverlay non modifiés. quiz_count compte les occurrences de blocs quiz Editor.js, sans déduplication : Quiz topic(s) traduit activité(s) de quiz. Six clés auparavant vides/absentes au runtime, désormais françaises ; aucune modification de contenu enregistré.

PO 2 706 entrées / 637 traductions ; POT 2 985 inchangé octet pour octet, aucune extraction nécessaire. Autres blocs/en-tête français et 78 autres PO intacts, Framework propre. Babel/paramètres/contextes/flags réussis. Compilation/cache natifs du seul site réussis ; MO 637 messages / 30 624 octets et six valeurs chargées, 22 valeurs FR-02B.3 conservées. Dictionnaire agrégé observé 6 305, ne pas l’assimiler au nombre de traductions ajoutées.

Tests ciblés : nouveau courseRemainingTranslations.test.ts, 16 cas ; final 22 tests / trois fichiers réussis en 3,00 s avec RelatedCourses/VideoPreview. Premier passage deux échecs de paramétrage it.each des tableaux, corrigés dans le harnais uniquement. Les 62 tests précédents non relancés. Prettier/diff/secrets/intégrité réussis ; pre-commit complet non relancé, hooks désactivés après contrôles. Build nécessaire 15,52 s réussi, déclarations restaurées, assets/MO hors Git.

Chromium quatre combinaisons FR/EN bureau/mobile : cours associés réel vide puis deux cartes simulées avec liens/noms, aperçu iframe nommé avec média fictif intercepté sans lecture externe, deux activités de quiz puis zéro, état sans chapitre et sans média. Sans leçon avec chapitre couvert par composant. Préférence fictive restaurée fr confirmée en base. Zéro insertion/pageerror ; 18 HTTP annexes hors lot. Premier harnais interrompu par lecture d’une réponse après navigation, capture limitée à la première réponse puis quatre parcours réussis. Pas de lecteur d’écran, décodage vidéo ou suites complètes. Preuves hors Git /workspace/work/fr02b4/. Aucun nouveau lot ou push autorisé.

### FR-02C — audit courant, sans correction

Rapport docs/FR-02C-AUDIT.md. Matrices des états d’inscription, achats/coupons/total nul, option certificat, évaluation et délivrance ; rôles/effets analysés dans les composants et contrôleurs directs. Séparation FR-02 apprenant / FR-03 gestion multiple-évaluateurs / FR-04 mails-PDF conservée. 67 chaînes sélectionnées : 54 points apprenant (10 P0, 43 P1, 1 P2), huit dépendances FR-03 et cinq valeurs correctes à conserver. Dix valeurs disponibles dans les MO lus, pas preuve du dictionnaire live ; six constructions supplémentaires non extractibles/techniques détaillées séparément.

Constats principaux confirmés par code : Get Certified recouvre achat puis évaluation ; Enroll for Free peut valider une option certificat à total nul ; Payment for suivi du type technique ; retour Billing(type=certificate) pointe vers batches/Checkout Batch ; titre Payment Gateway Not Configured et deux libellés Checkout absents du POT (sources dynamiques) ; validation d’adresse anglaise et Error brut malgré Erreur disponible ; deux clés de consentement ponctuées différemment. Aucun correctif engagé.

Sécurité : ne jamais appeler get_payment_link pour observer l’écran, même total nul ou accès déjà acquis (paiement/adresse/inscription possibles). Interdire aussi insert d’inscription, create_certificate, demandes/annulations d’évaluation, callbacks de paiement et PDF réels. enable_certification et paid_certificate sont mutuellement exclusifs par validation du cours ; ne pas inventer un cas valide combinant les deux. Inscrire/acheter l’option/réserver une évaluation/délivrer/consulter sont des actions distinctes.

Environnement à la reprise du 30 octobre : lms-bench arrêté ; tentative de lecture Frappe refusée avant exécution, aucune connexion DB. Aucun service redémarré. Lecture hors ligne des PO/POT et MO conservés (637 traductions / 2 706 PO, POT 2 985). Préférences/site inchangés. Aucun navigateur, rendu simulé, test applicatif, build, compilation, nettoyage de cache ou acte métier ; ne pas revendiquer de validation de paiement/émission ni de rendu actuel FR/EN bureau/mobile. Avant recette ultérieure, réutiliser le démarrage documenté uniquement dans le périmètre autorisé, puis installer une interception totale des API sensibles avant montage de Billing/certificats.

Preuves hors Git /workspace/work/fr02c/ : candidats, offline.py, inventory.json/state.json et journaux ; inventory.py non exécuté dans le conteneur arrêté, pas une preuve runtime. Aucun secret ni donnée personnelle nécessaire. Sources, 79 PO/POT et Framework conservés. Prochain petit lot recommandé FR-02C.1 : quatre clés d’auto-inscription apprenant et fallback Error natif ; préserver l’avertissement administrateur déjà correct. Exige nouvelle autorisation, aucune exception PO généralisée depuis FR-02B.

### FR-02C.1 — état courant

Rapport docs/FR-02C1-RESULTATS.md. Quatre clés existantes renseignées : Enroll Now → S'inscrire (aussi cohérent pour la session), Buy this course → Acheter ce cours, invitation à se connecter et succès d’inscription. Error/avertissement administrateur conservés. Seule ligne source : resourceErrorMessage(err, __('Error')). Nuance audit : toast.warning(__(msg)) traduisait déjà le résultat ; ne pas prétendre qu’un Error visible avant correction a été reproduit. Helper/toast/messages/routes/conditions/insertion inchangés.

PO 2 706 entrées / 641 traductions ; POT 2 985 inchangé octet pour octet, aucune extraction. Quatre blocs seuls changés, 78 autres PO et Framework intacts. Babel/paramètres/contextes/flags/Prettier/diff/secrets réussis. Démarrage documenté existant /workspace/.setup/start-services.sh réussi, services disponibles ; aucun nouveau conteneur/configuration/installation. Compilation et cache natifs du seul learning.localhost réussis ; MO 641 messages / 30 910 octets, quatre valeurs chargées, dictionnaire agrégé observé 6 309.

Final : 14 tests / deux fichiers tous réussis en une exécution 3,08 s, dont dix nouveaux cas FR/EN ; trois passages intermédiaires à deux échecs dus aux mocks reload/Tooltip, corrigés seulement dans le harnais. Suites complètes non relancées. Build nécessaire 14,59 s réussi ; déclarations restaurées. Pre-commit complet non relancé, hooks désactivés après contrôles.

Chromium quatre combinaisons FR/EN bureau/mobile : états du cours simulés (non inscrit, payant, fermé, membre), erreur spécifique/générique et succès simulés. Garde API préalable : 12 inserts interceptés, zéro transmis au serveur ; aucune méthode de paiement/facturation/création certificat appelée. Zéro pageerror ; huit HTTP 417/500 attendus simulés, deux HTTP annexes ; 32 appels boot_config bloqués par le harnais, aucun correctif télémétrie. Invité couvert en composant seulement, pas Guest Chromium. Pas de transaction réelle ni progression de leçon. Comptes fictifs fr/en utilisent leurs préférences existantes, confirmées en base sans modification/restauration temporaire ; système fr inchangé. Preuves /workspace/work/fr02c1/.

### FR-02C.2 — état courant et anomalie navigateur à conserver

Rapport docs/FR-02C2-RESULTATS.md. Billing : trois Payment for complets, Confirm without payment, retour course/certificate vers courses et batch vers batches via getLmsRoute, messages d’adresse paramétrés avec dix libellés explicites, PAN extractible. Consentement/état indien traduits sans règles nouvelles. payments.py : constante retirée et titre littéral aux trois appels _(), évalué par requête ; AST de toutes les autres fonctions identique, y compris get_payment_link. showError/generatePaymentLink/isZeroAmount textuellement inchangés.

17 blocs FR : 16 nouvelles valeurs et Billing Details corrigé ; total 657 / 2 715 entrées PO. POT natif 2 992 (+9/-2, 25 références), dont trois références rattrapent Error/Related Courses/Video preview des lots publiés. Les anciennes clés Payment for (espace final) et Enroll for Free restent dans le PO ; aucun nettoyage. Seconde extraction après correction d’une ligne vide Ruff, mêmes clés/comptes. 78 autres PO/Framework intacts, Babel/paramètres/contextes/flags réussis. MO 657 messages / 32 298 octets, 17 valeurs chargées, quatre valeurs FR-02C.1 préservées ; dictionnaire agrégé observé 6 187, pas une métrique de perte LMS.

Tests finaux : Billing.test.ts étendu 59 réussis en une exécution 2,45 s ; deux méthodes unittest sans site/DB réussies 0,047 s (extraction réelle et six sous-cas de titre traduit par appel). Premiers essais échoués sur fixture pays par défaut et mock du proxy frappe.db ; réparés dans les harnais, pas en métier. Prettier/Ruff/AST/diff/secrets/intégrité réussis ; hooks désactivés après contrôles, pre-commit global non relancé. Build nécessaire 16,22 s réussi ; déclarations restaurées, assets/MO non suivis.

**Chromium : quatre combinaisons FR/EN bureau/mobile, assertions fonctionnelles/sécurité réussies MAIS assertion finale aucune pageerror échouée (16 erreurs).** Quatre validations locales par combinaison affichent leur toast puis une promesse rejetée non capturée ; frappe-ui resources.js.handleError relance après onError, generatePaymentLink ne capture pas submit. Le bloc existant est conservé. Harnais unitaire historique ne reproduit pas cette relance ; son unhandled vide ne prouve pas un navigateur sans erreurs. Ne pas déclarer le navigateur entièrement réussi, ne pas relancer pour masquer le résultat. Correction d’exception et double clic nécessitent un périmètre autorisé distinct.

48 accès facturation + 48 récapitulatifs simulés avant montage ; aucune tentative/transmission d’endpoint sensible, aucun paiement/adresse/inscription/coupon/certificat créé. Trois retours avec destinations fictives vérifiés, consentement accessible et correction de case confirmés. Quatre HTTP annexes, 48 appels boot_config bloqués, pas de correction de ces services. Comptes fictifs fr/en conservent leurs préférences, confirmées en base sans modification ; système fr inchangé. Preuves /workspace/work/fr02c2/. Aucun FR-02C.3/4 commencé.

### FR-02C.3 — état courant

Rapport docs/FR-02C3-RESULTATS.md. Seule source applicative : utils.validate_coupon_applicability, deux phrases anglaises complètes à la place de Course/Batch injectés. AST intégral identique après normalisation du message, même requête et branche, aucun calcul/critère modifié. Billing.vue/payments.py inchangés. Coupon Code partagé avec formulaires administratifs corrigé en Code de réduction, usages vérifiés.

13 blocs PO ciblés via Babel : 12 valeurs nouvelles et une correction ; toutes autres valeurs/en-tête/blocs conservés. PO 2 717 entrées / 669 traductions ; POT natif 2 993 (+2/-1, zéro référence commune changée), ancienne entrée PO conservée. 78 autres PO/Framework intacts. Compilation/cache du seul site réussis, MO 669, 13 valeurs concordantes dans PO/MO/dictionnaire ; préférences fr/en et défaut fr inchangés.

Tests : 65 Vue / un fichier réussis 4,27 s ; cinq méthodes Python mock sans site/DB réussies 0,118 s, avec date simulée après erreurs initiales du harnais. Extraction native/paramètres/contextes/flags, Prettier/Ruff/AST/diff/secrets réussis. Manifeste PO initial incomplet (mauvais chemin Framework) remplacé par comparaison aux 78 empreintes de référence FR-02C.2, toutes identiques. Hooks désactivés après contrôles ; aucun build nécessaire, source Vue inchangée.

Chromium quatre parcours FR/EN bureau/mobile : noms accessibles, vide, application/retrait fictifs réussis ; 4 accès et 12 résumés simulés, zéro appel sensible tenté/transmis. Première attente incorrecte Remise au lieu de Remise: corrigée dans le harnais. Final zéro pageerror/HTTP en erreur dans cette recette ; quatre boot_config bloqués. Ne pas généraliser : les 16 rejets de validation FR-02C.2 restent préexistants et ouverts, non rejoués/corrigés/masqués. Aucun paiement/coupon réel, aucune inscription/adresse/certificat créé, aucun callback. Erreurs de passerelle seulement simulées en Python ; bold natif préservé, pas présenté comme assainisseur HTML. Preuves /workspace/work/fr02c3/. Aucun FR-02C.4, aucun push.

### FR-02C.4 — état courant

Rapport docs/FR-02C4-RESULTATS.md. CertificationLinks utilise deux clés Buy the certificate option/Access the evaluation sans changer branches/routes ; View Certificate devient Consulter le certificat. CourseCard indique Certificate option ou Certificate of completion dans l’infobulle et sr-only, icône/styles inchangés. UpcomingEvaluations utilise Schedule an evaluation ; Schedule global préservé. Aucun backend applicatif modifié ; éligibilité/permissions/progression/délivrance inchangées. Usages partagés View Certificate (Event), Issued On (badge), refus d’inscription (Certificate Request) vérifiés.

19 clés vérifiées : 18 nouvelles valeurs, Certification conservée. PO 2 721 entrées / 687 renseignées ; POT natif 2 997 (+4/-0), sept références expliquées. Autres blocs/en-tête français et 78 autres PO intacts. Compilation/cache du seul site réussis, MO 687 et 19 valeurs chargées concordantes ; préférences fr/en et défaut fr inchangés. Contrôle textuel des trois sources neutralisant les seuls libellés réussi ; handlers/routes/conditions identiques.

Tests finaux : 38 Vue / trois fichiers tous réussis en 22,37 s (22 nouveaux, 16 existants) ; une méthode Python, huit sous-cas FR/EN d’éligibilité sans site/DB, réussie 0,040 s. Harnais corrigés après erreurs d’import utils/routeur, URL PO sous Vitest, stub select.type et assertion anglaise de préfixe ; aucune logique métier ajustée pour masquer une erreur. Fixtures cohérentes fin de cours vs option payante. Prettier/Ruff/gettext/paramètres/contextes/diff/secrets/intégrité réussis ; hooks désactivés après contrôles. Build nécessaire réussi 17,94 s, déclarations restaurées, assets/MO hors Git.

Chromium quatre parcours FR/EN bureau/mobile complets : liens achat/évaluation, modal vide/disponible, validation sans sélection, absence d’évaluateur, certificat délivré simulé, seuil 50/100. 48 détails certification, 48 outlines, 12 listes de demandes et 8 calendriers simulés avant navigation ; zéro requête sensible tentée/transmise, aucun PDF/email/délivrance/achat/réservation/annulation. Zéro pageerror/HTTP en erreur dans cette recette, 28 boot_config bloqués. Deux attentes de harnais corrigées (Submit déjà Valider ; format horaire AM/PM natif). **Ne pas déclarer le contrôle JS global réussi** : les 16 rejets FR-02C.2 et double clic restent ouverts, non rejoués/corrigés. Badges et droits/refus/chargement/listes remplies couverts au niveau composant, pas tous rejoués en navigateur. Dates Day.js, AM/PM et autres textes calendrier restent à I18N-01/lot ultérieur ; administration FR-03, emails/PDF FR-04. Preuves /workspace/work/fr02c4/. Aucun push ni nouvelle phase.

### FR-03A — audit documentaire courant

Rapport docs/FR-03A-AUDIT.md, base publiée d1ccb8d2. Cartographie accueil/navigation/statistiques, membres, cours/sessions, inscriptions multiples, paramètres/transactions, évaluateurs/certificats et modération. 59 candidats priorisés, valeur PO LMS/Framework et extraction distinguées du rendu effectif ; pas d’inventaire exhaustif. 16 P0/41 P1/2 P2, propositions non livrées. Ne pas confondre rôle Course Creator et affectation Course Instructor ; can_enroll_others session plus large que can_record_payments ; paiements du personnel = enregistrements reçus, pas encaissement ; option certificat ≠ délivrance.

Points : Change (« la monnaie ») et Assignments (« Affectations ») partagés avec Framework ; préférer contextualiser. Phrase Students get the certificate… anglaise trompeuse dans enrollment.ts à revoir sur accord. Schémas Settings traduits par enfants mais plusieurs clés absentes POT ; trois appels Vue multilignes Enrollment absents POT, diagnostic natif ciblé à prévoir sans regénérer pendant l’audit. Open the fragment de transactions.ts est un exemple en commentaire, faux positif exclu. Joined repli direct dans CertifiedParticipants, dates I18N séparées.

Modération confirmée par endpoints/DocPerm, mais menus de réponse visibles au propriétaire seulement ; aucune file de signalements/approbation/journal métier confirmé. Permissions effectives de DB non lues, pas de preuve de sécurité complète. get_discussion_topics(single_thread=True) peut créer un fil : simuler même cette lecture dans une future recette. Audit sans API/DB/navigateur/test/build/extraction/compilation, aucune écriture métier. Codes/catalogues 687 FR/POT 2 997 et 78 autres PO/Framework préservés. Un commit local documentaire uniquement ; lots FR-03B.1–9 proposés, FR-04 emails/PDF et I18N-01 réservés. Aucun nouveau correctif autorisé ni commencé.

### FR-03B.1 — livraison locale courante

Rapport docs/FR-03B1-RESULTATS.md. Deux sources : Members fournit des phrases complètes d’états vides ; SettingsList ajoute deux overrides optionnels avec anciens replis pour les autres appelants. Recherche/filtres/pagination/branches/actions inchangés. members.ts, RoleSwitches, deux MemberForm et API byte-identiques à la base. Identifiants LMS Student/Course Creator/Batch Evaluator/Moderator et booléens conservés, aucun rôle/permission changé.

32 valeurs nouvellement renseignées, 687 antérieures conservées ; PO 2 734 entrées / 719 FR. POT natif 3 001 (+4/-0), cinq références déplacées seulement. Not saved ajouté après mesure intermédiaire 718, clé déjà POT ; nouvelle compilation/check final 719. 78 autres PO/Framework intacts, paramètres/contextes/flags/en-tête/blocs non ciblés contrôlés. MO 719 et 32 valeurs chargées concordantes, préférences fr/en et système fr inchangés. Pas de dictionnaire runtime parallèle ; helper test lit le PO et installe le vrai plugin.

Final 81 tests Vue/six fichiers réussis en une exécution 6,19 s ; premier 76/3 échecs de titre non rendu dans un stub, corrigé par assertion de l’attribut ; 79 puis ajout de deux cas read-only → 81. Création/édition/refus/rôles/échecs/partiels mockés ; pas de test Python applicatif, backend inchangé. Build 15,25 s réussi, déclarations restaurées. Prettier/diff/secrets/invariants/Babel réussis ; hooks désactivés après contrôles.

Chromium de sauvegarde : FR ordinateur réussi ; FR mobile attente du toast de création expirée, cause non établie, recette globale **non validée**. Trois écritures fictives fulfill, zéro transmises ; pas de rôle réel attribué. Un rejet d’onboarding bloqué et HTTP sockets consignés ; ne pas masquer ni prétendre à un navigateur entièrement sans erreur. Premier harnais avait aussi un sélecteur Courriel exact incompatible avec le marqueur required et des lectures LMS Settings non simulées ; corrigés dans le harnais, pas dans l’app. Collecteur navigateur save_role URL ne lit pas le JSON (null), preuve des identifiants par tests/code uniquement.

Recette différente d’affichage : quatre parcours FR/EN bureau/mobile complets, noms de rôles accessibles, fiche fictive rouverte et refus ; quatre lectures fake, zéro écriture même simulée, zéro endpoint interdit/transmis. Zéro pageerror, deux socket.io 400 et 12 boot_config bloqués dans cette recette. Elle ne remplace pas le test de sauvegarde échoué. Gestionnaire simulé dans get_user_info, pas attribué en DB ; suppression jamais exécutée. Liste/états vides/confirmation couverts en composants seulement, pas Chromium complet. Préserver 16 rejets FR-02C.2, double clic et dates hors lot. Preuves /workspace/work/fr03b1/, logs distincts. Deux commits locaux, aucun push, aucun FR-03B.2.

### FR-03B.2 — livraison locale courante

Rapport docs/FR-03B2-RESULTATS.md. Diagnostic natif avant correction : trois clés présentes sources mais omises, génération complète de base inchangée hors dates. Variantes démontrent que seuls les retours à la ligne dans le tableau du deuxième argument échouent en Vue (regex HTML/template sans DOTALL), pas les retours avant le message ni le TypeScript. Correction locale __().format() dans StudentPicker/EnrollStudentsForm/EnrollPaymentPanel ; pas de modification Framework/mapping. Singulier {0} seat left ajouté, français Sélection : {1} neutre. Conditions/capacité/dédup/API/focus et paramètres conservés, scripts AST équivalents après normalisation linguistique.

21 valeurs nouvelles, aucune ancienne corrigée/supprimée ; 740 FR / 2 754 entrées PO. POT 3 005 (+4/-0), 16 références déplacées seulement, diff intégral relu. 78 autres PO/Framework intacts. Babel/params/contextes/flags et compilation/cache du seul site réussis ; MO 740 et 21 valeurs chargées concordantes. Préférences fr/en et système fr inchangés.

Tests finaux : 268 Vue/six fichiers réussis en une exécution 9,81 s ; cinq tests Python d’extraction réussis 0,049 s. Vraies sources échouaient sur trois clés avant correction ; variantes démontrées. Harnais initial Python TabError corrigé avant test de régression ; premier Vue cinq fichiers/229 passent mais StudentPicker import échoue sur hoisting Vue ; factory mock import Vue local, final six passent. Aucun nouveau fichier de test, quatre fichiers Vue étendus/adaptés et fichier Python existant. Bornes FR/EN 0/1/2/50/51, places 0/1/5 et sélection excessive, recherche nom/email, collage/doublons/éligibilité, aria-live et focus couverts. Build 16,41 s réussi, déclarations restaurées. Format/Ruff/AST/diff/secrets réussis ; hooks désactivés après contrôles.

Chromium quatre parcours FR/EN ordinateur/mobile complets : cours gratuit, vide/recherche email/aucun résultat, collage 51+doublon plafonné 50, cases individuelles/toutes, aria-live, effacement de sélection et retrait d’une ligne. 16 recherches fictives, zéro preview appelé (interception prête ; tests composants couvrent son contrat), zéro endpoint sensible tenté/transmis ; aucun clic final d’inscription. Zéro pageerror/HTTP en erreur ciblé, quatre boot_config bloqués. Pas de transaction réelle ni nouvelle attribution de rôle ; données et gestionnaire côté réponse simulés. Pas de session payante/finance/adresse au navigateur. Ne pas confondre sélection et inscription, ni déclarer contrôle JS global validé. Preuves /workspace/work/fr03b2/. Toast mobile FR-03B.1 non confirmé, 16 rejets préexistants, double clic et dates restent ouverts. Aucun FR-03B.3, aucun push.

## 7. Problèmes connus et limites

- Traduction partielle : après FR-03B.2, 740/2 754 entrées PO LMS renseignées ; POT 3 005 clés. Les autres clés manquantes restent à traiter, et le Framework peut fournir des traductions communes au runtime. Compiler ne complète pas le catalogue ; les contenus éditoriaux ne sont pas traduits automatiquement.
- Babel signale une anomalie préexistante dans le PO Framework : `Use % for any non empty value.` / incompatibilité de paramètres. Compilation réussie mais validation Babel non entièrement verte. Aucun PO à modifier manuellement ; remonter au circuit amont.
- Pre-commit complet bloqué à l’installation npm du miroir Prettier (`EALLOWGIT`). Les contrôles Python et les versions prévues de Prettier/ESLint ont été exécutés séparément. Ne pas déclarer le lanceur complet réussi ; ne pas repartir dans une longue réparation sans nécessité.
- Avertissements de build existants : Vite esbuildOptions dépréciée, Browserslist ancien, module fs externalisé pour face-api.js.
- Un bref texte anglais avant réception RPC reste possible ; le rendu figé après réception est corrigé. Pas de basculement de langue instantané ajouté : rechargement testé.
- Non exécutés : suite backend complète, E2E historique complet, charge, autres navigateurs, mobile exhaustif, emails/PDF et connecteurs externes.
- Date Day.js française non activée et marque inchangée ; les chaînes directes des trois composants ciblés sont désormais enveloppées. La couverture des autres écrans n’est pas certifiée.
- FR-01C : workflow d’export Crowdin distinct bien présent, mais littlepool-dev non ciblé automatiquement. Le helper de génération POT cible toujours explicitement frappe/lms, mais FR-01D le bloque désormais hors Actions officiel. Ne jamais le réutiliser pour la génération locale du fork ; appeler directement Bench. Droits Crowdin, export des seules chaînes approuvées et coût d’un projet propre non vérifiés.
- Traductions candidates non livrées : Signups désigne des comptes, Enrollment des inscriptions pédagogiques ; Certifications compte des certificats publiés. Upload Image envoie un fichier local au serveur : Importer une image est proposé en remplacement de Télécharger une image, sans modifier le catalogue.

FR-01D : le POT historique du 23 octobre est en retard sur plusieurs évolutions métier de la base. FR-01D.2 ajoute encore 200 clés TypeScript au candidat initial ; ces ajouts ont été contrôlés. Le rafraîchissement global a été autorisé et intégré localement dans FR-01D.3 ; sa publication a été autorisée et vérifiée dans 22795529. Les appels dynamiques, chaînes non enveloppées, .tsx et futures syntaxes TS ne sont pas couverts automatiquement. Les garde-fous de CI préviennent un accident ; ils ne sont pas une frontière de sécurité contre des variables falsifiées.

Les preuves, scripts et captures locales sont dans `/workspace/work/fr01/`, hors dépôt. Cinq comptes fictifs et un cours FR01 à deux leçons sont conservés sur le site local. Ne pas lire, copier ou publier les fichiers de credentials ; aucun secret n’est nécessaire dans ce handoff.

## 8. État Git local et distant

FR-03B.1 publié par push normal de b06c7bc0 et b223c367 sur accord explicite ; rapport distant vérifié identique, fetch aligné. Base FR-03B.2 : b223c367e42b29613f46c68fbac220c1e49afb40. develop reste 6b791f33b34efa15566a0cb707f5be59d136df50 ; Framework propre à 959b85de4086656273e1d158f41923dd3808c350.

Deux nouveaux commits locaux FR-03B.2 non publiés : 52042468 (trois Vue, quatre tests Vue existants et test Python d’extraction), puis livraison courante PO/POT/rapport/handoff, SHA à relever. Checkout propre après commit. Mentions historiques FR-03B.1 non publié dépassées.

## 9. Prochaine opération et travaux restants

**Prochaine action précise :** lire docs/FR-03B2-RESULTATS.md et présenter les deux commits pour revue/autorisation de publication. Ne pas commencer FR-03B.3. Aucune transaction réelle. Réutiliser les preuves ; conserver les limites FR-03B.1 et autres anomalies hors lot. Paiements/adresses détaillés et autres occurrences Vue à traiter seulement dans un lot autorisé.

**Décision BRAND-01 en attente :** soumettre Didorive et Syllovia pour test linguistique FR/EN puis vérification des antériorités/disponibilités ; consulter les risques des cinq noms dans IDENTITE_PROJET. Obtenir la validation explicite du nom et du périmètre avant tout changement de références publiques. Ne pas renommer le dépôt ni l’identifiant technique lms, changer les visuels ou réserver un domaine par déduction. Aucune opération de renommage autorisée à ce jour.

**Suite FR-01C précisée par FR-01E :** Crowdin dédié reste l’atelier collaboratif privilégié sous conditions ; la livraison repose toujours sur les PO versionnés et le runtime natif. Le pilote FR-01F a reçu une exception explicite limitée à ses 21 clés ; toute généralisation reste à approuver et ne remplace pas la convention Crowdin. Valider budget/droits, traductions et glossaire avant toute édition/configuration. Les documents FR-01C/BRAND-01 sont déjà publiés. Option A reste utile pour contribuer les termes génériques ; option C, fixtures Translation natives filtrées dans une extension versionnée, est le repli limité si B n’est pas retenu. Rien de tout cela n’est déployé.

Une génération POT contrôlée a été autorisée et exécutée dans FR-01D, sans intégration à cause du diff global ; toute intégration ultérieure doit être revue. Après choix Crowdin et autorisation seulement : préparer un export/import dirigé vers le projet approuvé et littlepool-dev. Ne pas utiliser le helper de publication amont. Vérifier le filtrage des traductions approuvées, les variantes régionales et l’absence de secrets dans les livrables. Si C est choisi, valider d’abord l’exception au circuit Crowdin, le filtre de fixtures et le nettoyage des surcharges retirées.

FR-01C et FR-01E restent des études ; FR-01F a livré localement les traductions des 21 clés, sans Crowdin. L’aria-label Search by keyword reste hors lot et en anglais. La relecture terminologique du pilote n’implique pas l’approbation générale de toutes les propositions du glossaire.

FR-02B.1 à FR-02B.4, audit FR-02C et FR-02C.1 publiés ; FR-02C.2 publié avec limite JS documentée ; FR-02C.3 publié ; FR-02C.4 publié ; FR-03A publié ; FR-03B.1 publié ; FR-03B.2 local terminé, attendre accord de publication ; aucun FR-03B.3/FR-04 commencé. Les lots FR-02 à FR-05 et I18N-01 restent ceux du plan ; conserver EN source/secours, préférence utilisateur persistante/prioritaire et défaut configurable, et choisir des tests ciblés au lieu de relancer systématiquement les suites.

## 10. Sécurité et déploiement

Ne jamais intervenir sur la production OpenMediaVault 8 ni sur sa configuration Docker. Aucun déploiement, aucune fusion, aucune modification de develop, aucun push sans accord explicite. Pas de refonte graphique pendant FR-01A. Convention générale : suivre Crowdin et AGENTS.md pour les PO ; exceptions limitées FR-01F (21 clés) , FR-02B.1 (sept traductions nécessaires) , FR-02B.2 (16 entrées nécessaires) , FR-02B.3 (22 entrées nécessaires) , FR-02B.4 (six entrées nécessaires) , FR-02C.1 (quatre entrées nécessaires) FR-02C.2 (17 blocs nécessaires) FR-02C.3 (13 blocs nécessaires) FR-02C.4 (19 clés ciblées, 18 valeurs ajoutées) FR-03B.1 (32 valeurs ciblées) et FR-03B.2 (21 valeurs ciblées) du fr.po LMS, via Babel contrôlé ; aucune généralisation sans nouvelle décision. Pas de modification Framework pour les correctifs LMS. Utiliser uniquement des comptes de test sans données personnelles réelles et ne publier ni mots de passe, jetons, cookies de session, configurations sensibles, MO ni assets générés.
