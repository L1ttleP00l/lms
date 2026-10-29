# FR-02B.2 — Onglets, filtres et actions apprenant

29 octobre 2026 (Europe/Paris). Branche `littlepool-dev`, base propre `3047b56aa113f3104d7e433046e441a4b273f23f`, identique au distant vérifié au début. FR-02B.1 et ses quatre commits sont bien publiés ; les anciennes mentions contraires du handoff étaient périmées. Aucun push pendant cette mission.

## Corrections et portée

Une seule source applicative change : `frontend/src/pages/Courses/Courses.vue`. Les composants enfants rendent déjà les libellés fournis ; aucun second appel de traduction n’est nécessaire. Les valeurs `enrolled`, `upcoming`, `certification`, les routes, requêtes, boutons et calculs restent identiques.

| Clé livrée | Français |
| --- | --- |
| Upcoming | À venir |
| My enrollments | Mes inscriptions |
| With certificate | Avec certificat |
| Certification available | Certificat disponible |
| Only show courses that offer a certificate | Afficher uniquement les cours proposant un certificat. |
| There are no courses currently. Keep an eye out, fresh learning experiences are on the way! | Aucun cours pour le moment. De nouvelles possibilités d’apprentissage arrivent bientôt. |
| Nothing matches "{0}". Try another search or clear the filters. | Aucun résultat pour « {0} ». Essayez une autre recherche ou effacez les filtres. |
| Nothing matches the filters applied. Try changing or clearing them. | Aucun résultat pour les filtres appliqués. Modifiez-les ou effacez-les. |
| Clear filters | Effacer les filtres |
| 1 result loaded | 1 résultat chargé |
| {0} results loaded | {0} résultats chargés |
| Course content | Contenu du cours |
| About this course | À propos de ce cours |
| This course includes: | Ce cours comprend : |
| Start Learning | Commencer le cours |
| Continue Learning | Reprendre le cours |

**Contextualisation nécessaire :** Enrolled est aussi un indicateur de tableaux de gestion et un onglet de programmes/sessions ; Certification sert à la navigation, à la fiche de certificat et aux formulaires. Leurs traductions globales sont conservées. Seul le catalogue utilise les nouvelles clés My enrollments et With certificate, sans msgctxt incompatible avec le résolveur Vue actuel.

La description générique `There are no {0} currently. Keep an eye out, fresh learning experiences are on the way!` insère un nom technique anglais en minuscules. Elle reste inchangée pour les autres ressources. Courses fournit une phrase anglaise complète via la prop **emptyDescription existante** de ListPage. Aucun changement de ListPage ou EmptyStateLayout ; leurs comportements partagés sont conservés. La phrase sans résultat avec filtres seuls est également renseignée : c’est la branche directement nécessaire au filtre certificat, sans élargissement à un autre écran.

Les autres clés partagées ont été examinées : Upcoming désigne des éléments à venir ; Certification available est aussi un filtre de sessions ; Start Learning apparaît également sur Lesson, SCORMChapter et le courriel d’intérêt pour un cours. Les formulations retenues correspondent à ces usages. Leur traduction peut donc bénéficier à ces emplacements, dont le rendu n’est pas certifié par ce lot. Les contenus éditoriaux, titres et catégories ne sont pas traduits automatiquement.

## Catalogues et chargement réels

Dérogation limitée à ces **16 entrées françaises**, toutes initialement vides ou nouvelles, par sérialisation Babel des seuls blocs concernés. Tous les autres blocs et l’en-tête sont conservés à l’identique ; pas de réécriture globale, d’update-po-files ou de Crowdin.

| Mesure | Avant | Après |
| --- | ---: | ---: |
| Clés POT | 2 983 | **2 986** |
| Entrées fr.po | 2 693 | **2 696** |
| Traductions françaises renseignées | 593 | **609** |
| Messages MO LMS/fr | 593 | **609** |

POT produit par la commande native `bench generate-pot-file --app lms` dans le conteneur existant. **Trois ajouts** : My enrollments, With certificate et la description complète des cours. **Aucune suppression**, 15 entrées communes avec références déplacées, aucun changement de paramètres/contextes/indicateurs communs. Pas de rafraîchissement inattendu intégré, ni de modification manuelle du POT. Les changements ultérieurs des tests sont exclus par le mapping natif et ne modifient pas les sources extraites.

Compilation native `bench compile-po-to-mo --app lms --locale fr`, puis `bench --site learning.localhost execute frappe.translate.clear_cache`, réussies. Le MO contient 609 messages, 29 157 octets. Les 16 valeurs concordent entre PO, MO et dictionnaire réel ; dictionnaire fusionné observé : 6 281 clés. Français système maintenu, anglais source et repli préservés. Aucune modification Framework.

Intégrité des **78 autres PO** vérifiée par empreintes et, pour LMS, comparaison Git : **38 autres LMS + 40 Framework**. Il ne s’agit pas de 79 PO tous présents dans LMS. Une première assertion auxiliaire supposait à tort 79 fichiers dans ce seul répertoire et a échoué ; le contrôle a été corrigé pour couvrir les deux applications. Aucun catalogue n’a été supprimé ou modifié hors du fr.po LMS.

## Tests exécutés

- **Passage final : cinq fichiers / 51 tests réussis en 10,93 s**, en une même exécution finale : coursePriorityTranslations, coursesFilters, CourseCardOverlay, listPageFilteredEmpty et emptyStateLayout. Deux fichiers adaptés, **16 nouveaux cas** FR/EN : annonces 0/1/2/5, recherche et paramètres, effacement, actions avec progression fictive 0/25 et route de leçon inchangée, onglets et valeur technique du filtre d’inscription. Les corrections FR-02B.1 prix/compteurs/progression/avis restent couvertes.
- Premiers contrôles : trois fichiers / 35 tests réussis. Les tentatives intermédiaires élargies ont échoué sur des attentes du harnais : tab=enrolled n’est pas écrit dans l’URL par le code existant ; fixture sans is_student ; Checkbox simulée sans label rendu ; sélection du composant Button simulé incorrecte. Une édition de sélecteurs du test a aussi produit une erreur de syntaxe, rectifiée. Ces essais ne sont pas revendiqués comme réussis ; aucune fonctionnalité n’a été changée pour les satisfaire.
- Babel PO/POT, paramètres `{0}` avec multiplicité, contextes, indicateurs, lecture MO et égalité avec le dictionnaire : réussis. Une assertion auxiliaire de préférence exécutée pendant le parcours anglais a échoué ; le contrôle final est réussi après restauration du compte en français, sans nettoyage supplémentaire.
- Prettier 2.7.1 ciblé et `git diff --check` : réussis. Aucun JS autonome modifié. Le lanceur pre-commit global historiquement bloqué par son installation npm n’a pas été relancé ; commits réalisés avec hooks désactivés après contrôles ciblés.
- Build frontend nécessaire au rendu de Courses modifié : **réussi en 16,38 s**, application et signup-select. Déclarations générées sauvegardées/restaurées ; aucun asset/MO versionné. Avertissements habituels Vite/Browserslist/face-api, sans intervention sur les dépendances.

## Chromium et limites

**Quatre combinaisons réussies : FR/EN × bureau 1440×1000 / mobile 390×844**, avec compte apprenant fictif existant :

- Navigation réelle À venir / Mes inscriptions (Upcoming / My enrollments), état vide contextualisé, retour aux cours inscrits.
- Filtre certificat dans la barre bureau et le volet Filtres mobile ; activation, valeur technique certification=true et description mobile française vérifiées.
- Recherche sans résultat avec interpolation, effacement effectif du titre et du filtre certificat, retour aux résultats.
- Fiche : Contenu du cours, À propos de ce cours, Ce cours comprend :, Commencer le cours ; contrôles conservés Gratuit et 3 apprenants inscrits. Anglais source correspondant vérifié.
- Langue persistante au rechargement malgré navigateur en-US ; préférence fictive restaurée à fr et confirmée en base. Défaut système fr inchangé.

La première tentative navigateur utilisait le rôle button pour les onglets ; ils sont des radios accessibles. Harnais corrigé, puis les quatre parcours ci-dessus ont réussi. Sur mobile, ces onglets sont dans le volet Filtres, ouvert pendant le contrôle.

**Zéro pageerror JavaScript, zéro requête d’insertion** (garde réseau). Quinze erreurs HTTP annexes consignées, notamment services déjà signalés de télémétrie/sockets : aucune correction ni investigation élargie. Aucun cours, inscription, avis, paiement ou progression modifié. Les actions ne sont pas déclenchées ; Reprendre le cours et la route sont vérifiés avec données simulées dans les tests, pas en modifiant une inscription réelle. Les bornes 0/1/2/5 sont simulées au niveau composant ; pas de fabrication de résultats réels ni de test lecteur d’écran exhaustif. Le texte de filtres seuls est validé par catalogue/runtime ; aucune assertion navigateur dédiée à cette phrase n’est revendiquée.

Non exécutés : suites Vue/backend complètes, transaction d’achat/certificat, tests multi-navigateurs et nouvelle validation générale FR-01. Les limites hors lot (avis détaillés, chapitres/leçons, coque commune, Unsplash) subsistent. Aucun FR-02B.3 commencé.

## Livrables et reprise

Commit sources/tests : **44846105**. Le commit suivant regroupe fr.po, POT natif, ce rapport et le handoff ; relever son SHA par git log. Aucun push ou PR. develop, Framework, Crowdin et production inchangés.

Preuves hors Git : `/workspace/work/fr02b2/` : sauvegardes PO/POT, scripts catalog.py/final_check.py/browser.cjs, translation-plan.json/summary.json/final-check.json, journaux de génération/compilation/build/tests et navigateur, captures bureau/mobile. Aucun identifiant ou cookie enregistré dans les livrables.

Prochaine opération : revue de ce rapport puis autorisation explicite avant publication des deux commits FR-02B.2. Arrêt après ce lot.
