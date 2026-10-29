# FR-02B.3 — Chapitres, formateurs et avis

29 octobre 2026 (Europe/Paris), `L1ttleP00l/lms`, branche exclusive `littlepool-dev`. Base initiale propre et distante vérifiée : **192f75d2c51eabd09c14d2a893f8db0100a2b965**. FR-02B.2 est publié ; les anciennes mentions contraires du handoff sont historiques. Aucun push ni PR pendant cette mission.

## Anomalies et corrections

| Zone | Origine et défaut | Correction limitée |
| --- | --- | --- |
| Compteur du plan | CourseOverview assemble nombre + section(s)/lesson(s) | Messages contextualisés 1 chapter / {0} chapters et réutilisation de 1 lesson / {0} lessons. Chapitre remplace Section uniquement ici ; zéro reste masqué comme avant, données et calcul inchangés. |
| Formateurs | CourseCreatorCard fournit déjà des clés traduisibles, encore anglaises ; la liste correspond aux instructors, pas à un auteur distinct | Formateur, Animé par, équipe de n formateurs, Autres formateurs. Noms, biographies et destinations des profils conservés. |
| Liste compacte | CourseInstructors compose nombre + others au-delà de deux personnes | and {0} other instructors → et {0} autres formateurs ; noms et liens individuels conservés. À deux personnes, and → et est déjà disponible et inchangé. |
| Sélection du formateur | Le bouton sélectionné disparaît de la liste des pairs, laissant perdre le focus ; son nom accessible n’indique que la personne | Show instructor {0} annonce l’action et le nom ; après sélection, nextTick place le focus sur le lien du profil affiché. Aucune navigation ou autorisation modifiée. |
| Résumé des avis | Nombre, course rating, &, user rating(s) assemblés | Phrase complète Note moyenne : moyenne/5 · n avis, avec source anglaise singulière/plurielle. Moyenne formatée et effectif gardent les calculs existants. |
| Notes accessibles | Les étoiles de chaque avis n’ont pas de libellé numérique explicite dans ce composant | Groupe role=img nommé avec Rated {0} out of 5 ; étoiles décoratives masquées aux aides techniques. La clé partagée était vide et bénéficie aussi aux cartes de cours. |
| Avis longs | See more / See less sans traduction chargée et sans état accessible | Traductions, aria-expanded et aria-controls vers le texte ; seuil 220 caractères et mécanique de dépliage inchangés. |
| Dates | Nombre + month(s)/day(s) ago, ordre impropre au français | Phrases gettext complètes, singulier/pluriel. Calcul Day.js des mois/jours inchangé, aucune locale globale modifiée. Today → Aujourd'hui était déjà chargé et reste inchangé. |

Le résumé est rendu dans le span existant du texte des avis ; le nombre de moyenne auparavant isolé est inclus dans cette phrase pour éviter duplication et fragments. Aucun nouveau style, couleur ou agencement de page ajouté. Titres éditoriaux des chapitres/leçons, textes des avis et biographies ne sont pas enveloppés dans __() ou modifiés en base. **Rating**, section, sections, lesson et lessons dans le PO sont conservés à l’identique.

## Traductions livrées

Dérogation Crowdin limitée à **22 entrées françaises** directement nécessaires. Toutes étaient vides ou nouvelles ; aucun remplacement de traduction déjà correcte.

| Source anglaise | Français |
| --- | --- |
| 1 chapter | 1 chapitre |
| {0} chapters | {0} chapitres |
| 1 lesson | 1 leçon |
| {0} lessons | {0} leçons |
| Course creator | Formateur |
| Taught by | Animé par |
| Taught by a team of {0} | Animé par une équipe de {0} formateurs |
| Also teaching | Autres formateurs |
| Show more instructors | Afficher les autres formateurs |
| Show instructor {0} | Afficher le formateur {0} |
| and {0} other instructors | et {0} autres formateurs |
| Average rating: {0}/5 · 1 review | Note moyenne : {0}/5 · 1 avis |
| Average rating: {0}/5 · {1} reviews | Note moyenne : {0}/5 · {1} avis |
| Write a Review | Donner un avis |
| See more | Voir plus |
| See less | Voir moins |
| View all reviews | Voir tous les avis |
| Rated {0} out of 5 | Note : {0} sur 5 |
| 1 day ago | Il y a 1 jour |
| {0} days ago | Il y a {0} jours |
| 1 month ago | Il y a 1 mois |
| {0} months ago | Il y a {0} mois |

Write a Review est également le titre du dialogue : il est traduit sans modification de ReviewModal. Les autres usages de Course creator/See more/See less ont été recherchés dans les sources directes ; aucune divergence de sens constatée pour les usages traduisibles de ce lot. Les noms des personnes restent des données ; Formateur est retenu parce que CourseCreatorCard affiche bien la liste instructors. Aucun arbitrage linguistique bloquant subsiste dans ce périmètre ; les décisions Batch/Program et les autres propositions du glossaire restent indépendantes.

## POT, PO et compilation

`bench generate-pot-file --app lms`, exécuté dans le conteneur de développement existant, produit **2 985 clés**, contre 2 986. Diff intégral relu : 62 lignes ajoutées / 58 retirées, **dix ajouts**, **onze retraits**, **15 références communes modifiées**. Aucun changement de paramètres/contextes/indicateurs communs ou ajout de contenu éditorial/test.

Ajouts : 1 chapter ; {0} chapters ; 1 day ago ; {0} days ago ; 1 month ago ; {0} months ago ; les deux phrases Average rating ; Show instructor {0} ; and {0} other instructors. Les deux clés de leçons et Rated {0} out of 5 existent déjà et sont réutilisées.

Retraits expliqués, chacun n’étant plus appelé en traduction après correction :

| Ancienne clé | Ancienne origine | Remplacement |
| --- | --- | --- |
| section ; sections | CourseOverview | 1 chapter / {0} chapters |
| lesson | CourseOverview | 1 lesson ; lessons reste utilisé ailleurs dans le POT |
| course rating ; user rating ; user ratings | CourseReviews | Deux phrases complètes Average rating |
| day ago ; days ago | CourseReviews | 1 day ago / {0} days ago |
| month ago ; months ago | CourseReviews | 1 month ago / {0} months ago |
| others | CourseInstructors | and {0} other instructors |

Aucune suppression inexpliquée. **Ces anciennes entrées restent dans fr.po** : pas de nettoyage ni d’update-po-files. Les autres langues restent inchangées.

Édition contrôlée par Babel des seuls blocs autorisés, copie des nouvelles entrées du POT et comparaison octet pour octet des blocs non ciblés/en-tête : réussies. PO français **2 696 → 2 706 entrées**, traductions renseignées **609 → 631**. Paramètres avec multiplicité, contextes et indicateurs vérifiés ; Babel PO/POT sans erreur.

Compilation `bench compile-po-to-mo --app lms --locale fr` puis invalidation native du seul site avec `bench --site learning.localhost execute frappe.translate.clear_cache` : réussies. MO **631 messages / 30 279 octets**. Les 22 valeurs concordent entre PO, MO et dictionnaire réel ; les 16 valeurs FR-02B.2 restent présentes. Dictionnaire fusionné observé : **6 161 clés**. Sa taille varie selon les contributions/contextes natifs du cache ; la différence avec les 6 281 précédentes n’est pas une mesure de perte des traductions LMS. Le contrôle de conservation porte sur les blocs PO, le MO et les clés ciblées, pas sur cette seule taille agrégée.

**78 autres PO inchangés par empreintes** : 38 LMS et 40 Framework. Framework propre à 959b85de4086656273e1d158f41923dd3808c350. Aucun changement de workflow, API, permission ou locale Day.js.

## Tests réellement exécutés

- Nouveau courseDetailTranslations.test.ts : **24 cas FR/EN**, compteurs 0/1/2/5 ; formateurs 1/2/5, noms/liens/biographies, sélection/focus et expansion des pairs ; résumés 0/1/2/5, notes accessibles, dépliage/repli du texte, affichage des cinq avis ; dates aujourd’hui, 1/2 jours, 1/2 mois avec horloge figée.
- CourseReviews.test.ts adapté à la nouvelle phrase et au contrat natif `.format()` ; autres assertions de liste, étoiles et ressources conservées.
- Premier passage : **36 tests / trois fichiers réussis**. Passage final après les dernières sources : **62 tests / quatre fichiers réussis en une exécution de 8,49 s**, incluant CourseOverviewOutline et coursePriorityTranslations pour les régressions FR-02B.1/2 directement liées. Aucun échec de ces deux passages, aucune suite complète.
- Babel, paramètres/contextes/indicateurs, compilation/lecture MO/dictionnaire, intégrité, recherche ciblée de secrets et git diff --check : réussis. Prettier 2.7.1 sur les six fichiers sources/tests : réussi. Aucun JS autonome modifié ; lanceur pre-commit complet historiquement bloqué non relancé, hooks désactivés après contrôles ciblés.
- Build nécessaire aux composants modifiés : **réussi en 16,34 s**, application + signup-select. Déclarations générées sauvegardées/restaurées, aucun MO/asset suivi. Avertissements Vite/Browserslist/face-api habituels, pas de réinstallation.

### Chromium FR/EN, ordinateur/mobile

Quatre combinaisons réussies (1440×1000 et 390×844) avec compte apprenant fictif existant, navigateur en-US : langue utilisateur respectée au rechargement et préférence restaurée à fr, confirmée en base ; défaut système fr maintenu.

1. **Données réelles existantes, sans modification** : 1 chapitre · 2 leçons, résumé zéro avis, ouverture du dialogue Donner un avis / Write a Review sans soumission.
2. **Réponses réseau simulées uniquement dans le navigateur** : cinq formateurs fictifs et cinq avis fictifs, récupérant le reste de la fiche réelle. Aucun enregistrement créé. Résumé moyenne 4/5 et cinq avis, prévisualisation de quatre puis cinq, Voir plus/Voir moins au clavier, aria-expanded et notes accessibles, cinq cas de date vérifiés dans les deux langues.
3. Bureau : équipe de cinq formateurs, affichage des pairs, activation d’un bouton de sélection par Entrée ; focus réellement transféré au lien du profil sélectionné, biographie correspondante visible. Pas de navigation vers un faux profil.
4. Mobile : liste compacte des formateurs et avis vérifiés. **La carte détaillée CourseCreatorCard est déjà masquée par hidden md:flex** ; son sélecteur n’est donc pas vérifié comme visible sur téléphone et n’a pas été rendu visible par une refonte.

**Zéro requête d’insertion**, garde réseau présente ; aucune donnée pédagogique/progression/paiement ou avis modifié. Zéro pageerror JavaScript. **Dix erreurs HTTP annexes** consignées, sans intervention sur télémétrie/sockets/scripts externes.

Le premier harnais navigateur a échoué : route.fetch côté Node ne résolvait pas learning.localhost (EAI_AGAIN), contrairement à Chromium. Correction limitée au harnais : capturer une réponse réelle du navigateur puis la substituer en mémoire pour les cas simulés, sans nouvel appel Node ni modification réseau/configuration. Son journal initial a été expurgé des détails d’authentification générés par l’outil ; aucun de ces détails ne figure dans Git. L’essai échoué n’est pas compté comme un parcours réussi.

Non exécutés : lecteur d’écran réel et cycle Tab exhaustif, autres navigateurs, suites backend/Vue complètes, profils réels multiples ou publication d’avis. Le focus de sélection est couvert ; le parcours clavier exhaustif de tous les contrôles reste distinct. Compteurs à zéro conservent leur masquage ; la liste continue à filtrer les auteurs absents sans modifier le compteur brut existant. Aucun changement du calcul de moyenne/périodes ou de locale générale ; I18N-01 garde la question Day.js globale.

## Livrables et prochaine opération

Code : CourseOverview.vue, CourseCreatorCard.vue, CourseInstructors.vue, CourseReviews.vue. Tests : CourseReviews.test.ts et nouveau courseDetailTranslations.test.ts. Catalogues : fr.po et main.pot. Documentation : ce rapport et CODEX_HANDOFF.md. **Commit sources/tests : 16ed87d1** ; le commit suivant livre catalogues/documentation, SHA à relever par git log.

Preuves hors Git : `/workspace/work/fr02b3/` (sauvegardes PO/POT, comparaison/diff, plan des 22 traductions, scripts contrôlés, journaux tests/build/compilation et navigateur, captures, final-check.json). Aucun compte fictif supplémentaire créé, aucun secret dans les livrables suivis.

Prochaine opération recommandée : relire puis autoriser explicitement la publication des deux commits. Les compléments d’interface hors lot, locale globale et accessibilité exhaustive restent à prioriser séparément. **Arrêt après FR-02B.3, aucun nouveau lot, push, Crowdin, déploiement ou intervention OMV 8.**
