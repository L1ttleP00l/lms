# LittlePool Learning — Reprise Codex

Mis à jour le 29 octobre 2026 (Europe/Paris). **Lire ce fichier en premier à chaque reprise. FR-02A terminé : audit documentaire du catalogue/fiches apprenant, bureau et mobile, sur le site existant. Matrice de 39 clés prioritaires et défauts de composition/littéraux identifiés, aucune correction appliquée. Les commits locaux non publiés sont 88b8a96b (validation runtime FR-01F) et le commit d’audit courant. Aucun code, PO/POT, Framework ou configuration modifié ; arrêter avant FR-02B et attendre la validation du périmètre.**

## 1. Projet et références Git

LittlePool Learning est un nom de travail provisoire pour une plateforme multilingue, fork amélioré de Frappe Learning. BRAND-01 propose Didorive (recommandé à approfondir), Syllovia, Didalume, Modulien et Savolet ; aucune identité finale validée, aucune disponibilité juridique ou de domaine établie. Politique officielle : **Fournir une traduction française intégrale tout en conservant l'anglais comme langue source et de secours, avec une langue système configurable et des préférences utilisateurs persistantes.** Réutiliser les mécanismes natifs Frappe/gettext/Crowdin, conserver les clés anglaises, ne pas coder le français directement et distinguer contenus pédagogiques et traduction d’interface. Le site local reste français ; les instances internationales peuvent choisir l’anglais ou une autre langue. Toute amélioration du sélecteur doit commencer par l’étude des fonctions natives, puis être validée, avec ordinateur et mobile prévus.

- Dépôt : https://github.com/L1ttleP00l/lms
- Branche exclusive : `littlepool-dev`.
- Répertoire : `/workspace/frappe-bench/apps/lms` ; `/workspace/lms` est un lien vers ce checkout.
- Dernier commit fonctionnel : `bc5cd471` (libellés Vue FR-01B et tests), publié.
- Dernier distant littlepool-dev vérifié lors de la publication précédente : `50384d1e575eaf1d625f8ba9e491c95bca308309`. Les quatre commits FR-01E/FR-01F sont publiés ; checkout propre à ce SHA confirmé au début de la vérification fonctionnelle finale, sans nouvelle interrogation distante nécessaire.
- Le commit portant cette actualisation documentaire est intitulé `docs: audit learner course catalogue and detail translations`. Son SHA ne peut pas être écrit dans son propre contenu ; à la reprise, relever le dernier commit exact par `git log -1 --oneline`.

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

## 7. Problèmes connus et limites

- Traduction partielle : après FR-01F, 586/2 688 entrées PO LMS renseignées ; POT toujours 2 980 clés. Les autres clés manquantes restent à traiter, et le Framework peut fournir des traductions communes au runtime. Compiler ne complète pas le catalogue ; les contenus éditoriaux ne sont pas traduits automatiquement.
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

État vérifié pendant FR-02A, 29 octobre 2026 :

- Checkout initial propre sur littlepool-dev à `88b8a96b`, commit local contenant uniquement le handoff de vérification runtime ; parent `50384d1e575eaf1d625f8ba9e491c95bca308309`.
- Dernier distant connu/vérifié lors de la publication précédente : 50384d1e (non réinterrogé pour cet audit). Dernier develop distant connu : 6b791f33b34efa15566a0cb707f5be59d136df50 ; aucune opération sur develop.
- Deux commits locaux non publiés : 88b8a96b et `docs: audit learner course catalogue and detail translations` (FR-02A-AUDIT et ce handoff uniquement). SHA du dernier à relever par git log -1 ; ne pas ajouter de commit pour inscrire son propre SHA.
- Aucun push autorisé ou effectué. Checkout propre prévu après le commit courant, aucun autre changement suivi attendu. Aucun code, PO/POT ou MO modifié par FR-02A.

## 9. Prochaine opération et travaux restants

**Prochaine action précise :** soumettre docs/FR-02A-AUDIT.md et faire valider le futur périmètre FR-02B : commencer par état vide/avis et libellés centraux, avec choix des phrases complètes, accords et usages partagés. N’implémenter aucune traduction, modification PO/POT/code ou dépendance sans nouvelle instruction ; ne pas généraliser la dérogation FR-01F. Les 39 clés principales sont des propositions, pas un lot automatiquement autorisé. Publication des deux commits documentaires également soumise à accord. Les erreurs de télémétrie/socket/favicon restent hors audit linguistique ; ne pas les corriger par déduction.

**Décision BRAND-01 en attente :** soumettre Didorive et Syllovia pour test linguistique FR/EN puis vérification des antériorités/disponibilités ; consulter les risques des cinq noms dans IDENTITE_PROJET. Obtenir la validation explicite du nom et du périmètre avant tout changement de références publiques. Ne pas renommer le dépôt ni l’identifiant technique lms, changer les visuels ou réserver un domaine par déduction. Aucune opération de renommage autorisée à ce jour.

**Suite FR-01C précisée par FR-01E :** Crowdin dédié reste l’atelier collaboratif privilégié sous conditions ; la livraison repose toujours sur les PO versionnés et le runtime natif. Le pilote FR-01F a reçu une exception explicite limitée à ses 21 clés ; toute généralisation reste à approuver et ne remplace pas la convention Crowdin. Valider budget/droits, traductions et glossaire avant toute édition/configuration. Les documents FR-01C/BRAND-01 sont déjà publiés. Option A reste utile pour contribuer les termes génériques ; option C, fixtures Translation natives filtrées dans une extension versionnée, est le repli limité si B n’est pas retenu. Rien de tout cela n’est déployé.

Une génération POT contrôlée a été autorisée et exécutée dans FR-01D, sans intégration à cause du diff global ; toute intégration ultérieure doit être revue. Après choix Crowdin et autorisation seulement : préparer un export/import dirigé vers le projet approuvé et littlepool-dev. Ne pas utiliser le helper de publication amont. Vérifier le filtrage des traductions approuvées, les variantes régionales et l’absence de secrets dans les livrables. Si C est choisi, valider d’abord l’exception au circuit Crowdin, le filtre de fixtures et le nettoyage des surcharges retirées.

FR-01C et FR-01E restent des études ; FR-01F a livré localement les traductions des 21 clés, sans Crowdin. L’aria-label Search by keyword reste hors lot et en anglais. La relecture terminologique du pilote n’implique pas l’approbation générale de toutes les propositions du glossaire.

FR-02A est désormais autorisé et terminé ; ne pas commencer FR-02B sans nouvelle instruction. Les lots FR-02 à FR-05 et I18N-01 restent ceux du plan ; conserver EN source/secours, préférence utilisateur persistante/prioritaire et défaut configurable, et choisir des tests ciblés au lieu de relancer systématiquement les suites.

## 10. Sécurité et déploiement

Ne jamais intervenir sur la production OpenMediaVault 8 ni sur sa configuration Docker. Aucun déploiement, aucune fusion, aucune modification de develop, aucun push sans accord explicite. Pas de refonte graphique pendant FR-01A. Convention générale : suivre Crowdin et AGENTS.md pour les PO ; exception FR-01F autorisée uniquement pour les 21 clés du fr.po LMS, via Babel contrôlé, non généralisable sans nouvelle décision. Pas de modification Framework pour les correctifs LMS. Utiliser uniquement des comptes de test sans données personnelles réelles et ne publier ni mots de passe, jetons, cookies de session, configurations sensibles, MO ni assets générés.
