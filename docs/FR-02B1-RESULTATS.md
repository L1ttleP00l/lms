# FR-02B.1 — Corrections prioritaires du catalogue et de la fiche

29 octobre 2026 (Europe/Paris), L1ttleP00l/lms, branche littlepool-dev. Base initiale propre : **9bca8c1f**, précédé du commit documentaire 88b8a96b ; dernier distant connu 50384d1e, non publié de nouveau pendant ce lot. **Aucun push/PR, aucun FR-02B.2 commencé.**

## Résultat et périmètre

Les six catégories autorisées sont traitées sans reprendre les 39 clés de FR-02A. La dérogation Crowdin est limitée aux **sept traductions françaises directement nécessaires** ci-dessous. Les textes sources restent anglais ; aucun contenu pédagogique ni donnée de cours/avis/paiement n’est modifié. Le glossaire est complété uniquement pour les deux décisions contextuelles confirmées Gratuit/Avis.

| Défaut initial | Origine précise | Correction | Vérification et limites |
| --- | --- | --- | --- |
| Libre pour un cours sans prix | CourseCardOverlay utilise Free, traduit Libre par le PO LMS (pas par Framework) | Source contextualisée **Free course → Gratuit**, sans changer Free global | Visible en FR/EN, bureau/mobile ; prix payant non touché, non testé |
| Révoir dans le champ d’avis | ReviewModal utilise Review, traduit Révoir par le PO LMS | **Your review → Avis**, clé distincte de Review global | Champ réellement accessible par son label Avis / Your review |
| Aucun Courses trouvé | Courses passe un nom anglais à ListPage/EmptyStateLayout ; cadre français disponible mais argument brut | Nouvelle prop optionnelle emptyTitle, transmise au panneau et à l’annonce role=status ; catalogue fournit **No courses found → Aucun cours trouvé** | État vide réel vérifié en FR/EN bureau/mobile ; autres pages sans cette prop conservent le comportement par défaut |
| 3 inscrit / Students et compteurs accessibles | Fragments dynamiques, pas défaut de calcul : nombre + enrolled/Students, et texte sr-only de CourseCard | Réutilisation des clés FR-01F **1 student enrolled / {0} students enrolled** → **1 apprenant inscrit / {0} apprenants inscrits** | Cas 0/1/2/5 couverts dans les tests ; masque à zéro conservé ; valeur réelle 3 vérifiée navigateur. Arrondi existant 50+/100+ inchangé |
| 0% complété | CourseCard juxtapose pourcentage et completed | **Course progress: {0}% → Progression du cours : {0} %** | Paramètre et arrondi Math.ceil conservés ; source et français complets et naturels, pas de changement de calcul |
| Submit / validation / Error anglais | Trois littéraux Vue, Dialog enfant affiche action.label sans traduction ; Submit et Error déjà disponibles dans LMS/Framework | Appels natifs __('Submit'), __('Please enter a rating.'), __('Error') | Valider, Veuillez attribuer une note., Erreur ; validation réelle sans note et erreurs de secours avec ressources simulées, sans sauvegarde |
| Accessibilité et décompte de leçons directement liés | CourseCard expose le libellé Course progress ; CourseCardOverlay formate {0} of {1} lessons completed | **Progression du cours** ; **Leçons terminées : {0} sur {1}** | Paramètres conservés ; 0 sur 2 observé. Formulation de catégorie évitant un accord lié au nombre ; pas d’ajout à d’autres écrans |

Le résumé des inscriptions de CourseOverview est maintenant une phrase traduisible complète, comme le compteur latéral et celui de la carte. Le décompte des chapitres/leçons de l’aperçu reste hors lot : les anciennes clés section/lessons peuvent encore y apparaître en anglais. Les titres éditoriaux ne sont pas enveloppés dans __().

## Choix techniques minimaux

- Les traductions globales **Free → Libre** et **Review → Révoir** sont inchangées : aucun changement de sens imposé à leurs autres usages. Leurs nouvelles clés contextuelles sont sans msgctxt car le plugin Vue actuel ne résout pas le troisième argument ; aucune modification de ce plugin ou du Framework.
- ListPage accepte seulement un titre localisé facultatif. EmptyStateLayout possédait déjà une prop title : il n’a pas été modifié. Sans emptyTitle, le rendu et l’annonce d’autres ressources restent ceux d’avant ; les tests de liste partagée passent. Description générique, filtres et données ne sont pas réécrits.
- Réutilisation de phrases d’inscription existantes, sans ajout de logique métier. La visibilité à zéro et les nombres formatés/arrondis existants sont conservés ; à 1 la branche singulière est explicite, sinon la branche plurielle.
- Aucune modification des permissions, routes/API, calculs, couleurs, espacements ou structure de mise en page.

## POT natif et PO contrôlé

Après commit local des sources/tests et checkout propre, `bench generate-pot-file --app lms` exécuté dans lms-bench depuis /workspace/frappe-bench. Aucune modification manuelle du POT, aucun update-po-files ou Crowdin.

| Mesure | Avant | Après |
| --- | ---: | ---: |
| POT hors en-tête | 2 980 | **2 983** |
| Entrées françaises PO | 2 688 | **2 693** |
| Traductions françaises non vides | 586 | **593** |
| Messages compilés LMS/fr | 586 | **593** |

POT : **5 ajouts**, Free course ; Your review ; No courses found ; Please enter a rating. ; Course progress: {0}%. **2 suppressions** : enrolled et {0} enrolled, plus utilisés après remplacement par les phrases existantes. **48 changements de références**, liés aux composants modifiés ; aucun indicateur des clés communes changé. Diff brut final : 74 lignes ajoutées / 58 retirées. Le différentiel est relu et attendu, pas un rafraîchissement massif non expliqué.

Les anciennes entrées PO devenues obsolètes sont conservées : aucun nettoyage hors lot. Les cinq nouvelles entrées sont copiées du POT par Babel ; deux entrées présentes mais vides sont renseignées. Les autres blocs, commentaires et en-tête du PO sont identiques octet pour octet. Diff PO : **23 lignes ajoutées / 2 retirées**. Les 78 autres PO sont inchangés par empreintes ; aucun changement de source Framework.

Traductions ajoutées exactement :

| Source | Français |
| --- | --- |
| Free course | Gratuit |
| Your review | Avis |
| No courses found | Aucun cours trouvé |
| Please enter a rating. | Veuillez attribuer une note. |
| Course progress: {0}% | Progression du cours : {0} % |
| Course progress | Progression du cours |
| {0} of {1} lessons completed | Leçons terminées : {0} sur {1} |

Submit → Valider, Error → Erreur et les deux phrases d’inscription sont réutilisés sans modifier leurs traductions. Toutes les sources/valeurs sont vérifiées par Babel ; paramètres avec multiplicité, contextes et indicateurs correspondent au POT.

### Incident de format identifié avant intégration

Une première tentative utilisait la clé existante {0}% completed. Elle possède **python-brace-format et python-format** : le `% c` du texte anglais est interprété comme un format printf. Babel refuse la traduction prévue « Terminé à {0} % » (placeholders are incompatible). Aucun PO incorrect n’a été enregistré. La clé globale et ses indicateurs sont conservés ; le composant utilise une nouvelle phrase contextualisée terminant par %, sans cette ambiguïté. Nouveau POT natif généré depuis le checkout propre après cette correction, puis validé. Le premier candidat a été conservé hors Git, pas intégré.

## Tests réellement exécutés

### Régression Vue et format

Nouveau `frontend/src/tests/coursePriorityTranslations.test.ts` : **12 cas** FR/EN, incluant 0/1/2/5, prix, libellé/progression, compteur de fiche, état vide et annonce, champ/bouton d’avis, validation et fallback d’erreur avec ressources simulées. Le vrai plugin de traduction est utilisé ; les valeurs françaises synthétiques des tests ne valent pas une preuve de livraison, complétée ci-dessous par PO/MO/API et navigateur.

Avant corrections : 12 tests échoués. Après première correction : dix réussis, deux échoués parce que le harnais attendait un compteur visible à zéro alors que la carte le masque déjà. Cette attente a été corrigée pour préserver le comportement fonctionnel initial, pas le code pour satisfaire un faux besoin. Le texte de pourcentage a ensuite été ajusté suite au contrôle Babel.

Passage final complet ciblé : **7 fichiers / 60 tests réussis en 9,00 s**, en une exécution finale, après la dernière modification de source. Fichiers : coursePriorityTranslations, CourseCardOverlay, CourseOverviewOutline, ReviewModal, listPage, listPageFilteredEmpty, emptyStateLayout. Pas de suite Vue globale ni backend général. Les autres tests FR-01F ne sont pas revendiqués comme relancés.

Prettier 2.7.1 existant : formatage ciblé et contrôles réussis ; git diff --check réussi. Aucun changement JS autonome nécessitant ESLint ; lanceur pre-commit global historiquement bloqué non relancé. Une sauvegarde a d’abord visé à tort frontend/src/auto-imports.d.ts ; chemin corrigé en frontend/auto-imports.d.ts, sans modification du fichier ni installation.

### Compilation et build nécessaires au rendu réel

`bench compile-po-to-mo --app lms --locale fr`, puis invalidation native du cache du seul site learning.localhost : réussies. MO vérifié par read_mo : **593 messages, 27 902 octets**. Les sept valeurs sont identiques dans PO, MO et dictionnaire réel. Les traductions globales Free/Review sont vérifiées inchangées.

Build frontend dans le conteneur existant : **réussi en 14,46 s** (application + signup-select), nécessaire pour servir les sources Vue modifiées ; aucun déploiement. Avertissements Vite/Browserslist/face-api déjà connus, pas de réparation de dépendances. Les déclarations générées components.d.ts et auto-imports.d.ts ont été sauvegardées/restaurées ; aucun asset compilé versionné.

Le dictionnaire fusionné observé comporte 6 265 clés (6 084 issues des applications, 181 autres dont des noms de pays). Cette mesure agrège les contributions natives et leur contexte de cache ; **la différence avec les 6 120 du contrôle précédent ne représente pas 145 traductions de ce lot**. Seules les sept traductions LMS et leur intégrité sont attribuées au changement.

### Chromium : FR/EN, ordinateur/mobile

Quatre combinaisons parcourues sur le même compte apprenant fictif : fr/en × 1440 × 1000 / 390 × 844. Préférence enregistrée par mécanisme natif et vérifiée après navigation/rechargement, puis restaurée à fr et confirmée en base ; défaut système fr inchangé.

- Catalogue : Progression du cours : 0 %, label progressbar Progression du cours, texte accessible 3 apprenants inscrits ; anglais de secours/source correct dans le parcours en.
- Recherche sans résultat : Aucun cours trouvé visible **et annoncé**, aucune occurrence Aucun Courses ; anglais No courses found.
- Fiche : Gratuit, 3 apprenants inscrits, Leçons terminées : 0 sur 2 ; sources anglaises attendues en anglais.
- Dialogue d’avis : textbox nommé Avis / Your review, bouton Valider / Submit ; clic à note zéro affiche Veuillez attribuer une note. / Please enter a rating. et laisse le dialogue ouvert.
- **Zéro requête frappe.client.insert envoyée** : garde réseau installée pour empêcher toute sauvegarde accidentelle. Aucun avis, paiement, inscription, contenu ou progression créé/modifié. Le fallback serveur est testé seulement avec ressources simulées, pas par un enregistrement réel d’avis.
- Aucune pageerror JavaScript ; erreurs HTTP annexes (17 réponses pendant les parcours, notamment télémétrie et sockets) consignées, pas traitées ni assimilées à une absence globale d’erreurs. Pas de diagnostic ou modification de ces services.

Les bornes 0/1/2/5 sont vérifiées dans les tests de composants avec données fictives ; les contrôles navigateur utilisent la valeur réelle existante 3, sans modifier les données pour fabriquer d’autres effectifs. Aucun test lecteur d’écran exhaustif : seuls les libellés/annonces DOM directement concernés sont contrôlés.

## Fichiers, commits et limites restantes

Sources modifiées : Courses.vue, CourseOverview.vue, CourseCard.vue, CourseCardOverlay.vue, Layouts/pages/ListPage.vue, Modals/ReviewModal.vue et nouveau test ciblé. Fichiers de traduction : lms/locale/main.pot et fr.po. Documentation : ce rapport, CODEX_HANDOFF.md et deux décisions contextuelles dans GLOSSAIRE_FR.md.

Commit source/tests local : **55e4dd3a**. Le commit courant de livraison des catalogues/documentation lui succède, avec POT/PO, glossaire, rapport et handoff ; relever son SHA par git log. Les commits documentaires antérieurs **88b8a96b et 9bca8c1f** restent eux aussi non publiés. Aucun push autorisé ou effectué.

Preuves hors Git : /workspace/work/fr02b1/ : sauvegardes main.before.pot/fr.before.po, empreintes des 79 PO, premier candidat main.first.pot, catalog.py, pot-comparison.json, translation-plan.json, catalog-summary.json, journaux tests-before/after/final, génération, compilation et build, browser.cjs/log/json et captures FR/EN bureau/mobile, final_check.py et final-check.json. Pas de credential copié dans les livrables.

Limites assumées : titre Write a Review, Rating → Évaluation, onglets Upcoming/Enrolled, descriptions d’états vides, sections/lessons, aides secondaires et autres clés de l’audit peuvent encore rester anglais ou perfectibles ; ce lot ne les traduit pas silencieusement. La coque Collapse, les erreurs de télémétrie/sockets et l’intégration Unsplash restent indépendantes. Aucun achat, certificat ou refonte étudié/implémenté, aucune modification des statistiques ou noms techniques. Les traductions contextuelles ne corrigent pas les autres usages de Free/Review globaux.

Prochaine étape : soumettre ces résultats et les commits pour accord avant publication. Toute extension aux autres clés, un nouveau lot ou FR-02B.2 doit être explicitement autorisé ; **arrêt après FR-02B.1**.
