# FR-02A — Audit linguistique du catalogue et des fiches de cours

Date : 29 octobre 2026 (Europe/Paris). Dépôt L1ttleP00l/lms ; branche littlepool-dev. **Audit documentaire uniquement, aucune correction appliquée ; FR-02B non démarré.**

## Reprise et périmètre réellement parcouru

Checkout initial propre à **88b8a96b**, commit documentaire local non publié dont le diff contient uniquement CODEX_HANDOFF.md ; parent publié 50384d1e. Aucun push ni fusion. Le handoff, le glossaire et les résultats FR-01F ont été réutilisés ; pas de nouvel audit général ni de répétition des tests FR-01F. Les décisions récentes Inscriptions/Certificats priment sur les propositions historiques du glossaire pour ces clés partagées.

Compte apprenant fictif FR01 existant, préférence **fr** vérifiée en base et dans document.documentElement.lang ; navigateur en-US pour vérifier que la langue de l’interface vient bien du compte. Aucun changement de préférence nécessaire. Même site learning.localhost, même Chromium et conteneur existants, aucune installation ni construction.

Parcours réalisés : catalogue publié /lms/courses, onglet inscrit via ?tab=enrolled, onglet À venir vide via ?tab=upcoming, recherche vide via ?title=FR02A-no-match, fiche du cours fictif FR01 existant ; catalogue et fiche à 390 × 844, puis ouverture du volet Filtres mobile ; ouverture du dialogue d’avis de l’apprenant inscrit **sans soumission**. Vue bureau 1440 × 1000. Ni démarrage de leçon, inscription, achat, paiement, certificat, publication d’avis ou modification de progression.

Les résultats du DOM distinguent texte visible et sr-only : {0} enrolled, Rated {0} out of 5 et annonces de chargement apparaissent dans body.innerText mais sont principalement destinés aux lecteurs d’écran. La capture À venir confirme un seul titre visible Aucun Courses trouvé ; la seconde occurrence textuelle est l’annonce role=status, pas un deuxième panneau visible.

## Architecture réelle et responsabilité des composants

| Zone | Fichiers concernés | Rôle |
| --- | --- | --- |
| Routes | frontend/src/routes.js:14–39 | /lms/courses et /lms/courses/:courseName |
| Catalogue | frontend/src/pages/Courses/Courses.vue | Filtres/onglets, requêtes, catégories, titre Tous les cours ; données de cours distinctes des labels |
| Liste partagée | components/Layouts/pages/ListPage.vue, Layouts/EmptyStateLayout.vue | Annonces de résultats, état vide, effacement, pagination ; réutilisation sur d’autres ressources |
| Carte de cours | components/CourseCard.vue, ProgressBar.vue, CourseInstructors.vue | Titre/résumé de contenu, compteurs, note, noms, progression et textes accessibles |
| Fiche | pages/Courses/CourseDetail.vue → CourseOverview.vue | Le mode apprenant rend la vue d’ensemble ; les onglets Overview/Dashboard/Editor/Settings sont conditionnés à isAdmin et ne constituent pas des oublis d’onglets apprenant |
| Plan du cours | CourseOutline.vue → ChapterRow.vue | Chapitres et leçons ; titres éditoriaux, états verrouillé/terminé ; aucun changement de leur contenu |
| Carte d’accès | CourseCardOverlay.vue → CertificationLinks.vue, VideoPreview.vue | Prix, progression, actions selon inscription/paiement/certificat, décompte des leçons |
| Formateurs/cours liés | CourseCreatorCard.vue, CourseInstructors.vue, RelatedCourses.vue | Présentation des intervenants et cours associés ; noms/bios/titres sont des données |
| Avis | CourseReviews.vue → Modals/ReviewModal.vue | Moyenne, compteur, dates et saisie d’un avis ; dialogue inspecté sans insertion |
| Contrôles partagés | Controls/ToggleFilter.vue, ClearableCombobox.vue ; frappe-ui Dialog/Checkbox/ListFooter | Les labels fournis par LMS ne sont pas retraduits automatiquement ; vérifier l’appelant avant d’accuser le composant enfant |

Les chemins courts components/... sont relatifs à frontend/src. CourseDashboard/CourseEditor/CourseForm, création/import de cours, lecteur de leçon complet et administration sont hors du périmètre de correction proposé.

## Inventaire principal : 39 clés à traiter ou contextualiser

Clés exactes et références issues d’une extraction **en mémoire par l’extracteur natif**, sans génération de POT, rapprochées du PO LMS, du PO Framework et du dictionnaire fr réellement chargé. L’inventaire technique brut couvre 105 clés (71 absentes du dictionnaire, 34 présentes), mais inclut des branches conditionnelles et d’édition : **105 n’est pas le nombre de corrections apprenant à effectuer**. La matrice principale ci-dessous est le périmètre candidat prioritaire ; elle distingue les branches réellement vues.

P0 = erreur de sens ou traduction inaccessible malgré sa présence ; P1 = parcours apprenant/accessibilité incomplet ; P2 = harmonisation demandant revue des autres contextes. Une ligne ne correspond pas nécessairement à un seul changement : pluriels, propriétés partagées et futures clés de phrases complètes demandent du code en plus du PO, après accord.

| Clé source exacte | Chargé actuellement en fr | Proposition | Observation / réserve | Priorité |
| --- | --- | --- | --- | --- |
| `Upcoming` | Absent → anglais | À venir | Onglet ; visible | P1 |
| `Enrolled` | Absent → anglais | Mes inscriptions | Onglet apprenant ; visible | P1 |
| `Certification` | Certification | Avec certificat | Filtre : présence d’un certificat, pas qualification officielle | P1 |
| `Certification available` | Absent → anglais | Certificat disponible | Libellé mobile ; visible dans le volet Filtres | P1 |
| `Only show courses that offer a certificate` | Absent → anglais | Afficher uniquement les cours proposant un certificat | Aide du filtre mobile visible ; infobulle sur ordinateur | P1 |
| `No {0} Found` | Aucun {0} trouvé | Aucun cours trouvé | Visible et annoncé ; paramètre Courses non traduit, correction de composition nécessaire | P0 |
| `There are no {0} currently. Keep an eye out, fresh learning experiences are on the way!` | Absent → anglais | Aucun cours pour le moment. De nouvelles possibilités d’apprentissage arrivent bientôt. | État À venir vide ; proposer une phrase contextualisée, pas une substitution fragile de nom | P1 |
| `Nothing matches "{0}". Try another search or clear the filters.` | Absent → anglais | Aucun résultat pour « {0} ». Essayez une autre recherche ou effacez les filtres. | Recherche sans résultat ; garder {0} | P1 |
| `Clear filters` | Absent → anglais | Effacer les filtres | Visible dans recherche vide | P1 |
| `1 result loaded` | Absent → anglais | 1 résultat chargé | Annonce role=status, non une carte visible | P1 |
| `{0} results loaded` | Absent → anglais | {0} résultats chargés | Annonce plurielle ; branche non parcourue avec plusieurs résultats | P1 |
| `{0} enrolled` | Absent → anglais | {0} inscriptions | Texte sr-only de carte ; prévoir cas 1 ou libellé neutre contextualisé | P1 |
| `Rated {0} out of 5` | Absent → anglais | Note : {0} sur 5 | Texte sr-only de carte ; ne pas confondre avec avis saisis | P1 |
| `Enrolled Students` | Absent → anglais | Apprenants inscrits | Infobulle ; inventaire statique, non survolée | P1 |
| `Lessons` | Absent → anglais | Leçons | Infobulle et compteur ; vérifier singulier Lesson séparément | P1 |
| `Course progress` | Absent → anglais | Progression du cours | Libellé accessible de barre ; rendu visuel de la barre indépendant | P1 |
| `completed` | complété | terminé | Visible dans 0% complété ; préférer phrase complète Terminé à {0} % dans une correction de composition | P1 |
| `Students` | Absent → anglais | Apprenants | Visible : 3 Students ; traiter 1 apprenant / plusieurs dans la composition | P1 |
| `Course content` | Absent → anglais | Contenu du cours | Titre visible | P1 |
| `section` | section | chapitre | Le compteur porte sur les objets chapitre ; harmoniser avec Chapitre, pas Section | P1 |
| `sections` | Absent → anglais | chapitres | Même compteur ; pluriel statique non observé | P1 |
| `lessons` | Absent → anglais | leçons | Visible dans 2 lessons ; lesson → leçon existe déjà et doit être conservé | P1 |
| `About this course` | Absent → anglais | À propos de ce cours | Titre visible | P1 |
| `Free` | Libre | Gratuit | Prix actuellement Libre : faux sens confirmé | P0 |
| `enrolled` | inscrit | inscrit / inscrits selon nombre | Visible : 3 inscrit ; ne pas corriger globalement par un pluriel unique | P0 |
| `{0} of {1} lessons completed` | Absent → anglais | {0} leçons terminées sur {1} | Visible 0 of 2 lessons completed ; préserver les deux paramètres et cas 1 | P1 |
| `Start Learning` | Absent → anglais | Commencer le cours | Action visible ; n’a pas été exécutée | P1 |
| `Continue Learning` | Absent → anglais | Reprendre le cours | Branche de progression non nulle, non parcourue | P1 |
| `This course includes:` | Absent → anglais | Ce cours comprend : | Titre visible de la carte latérale/mobile | P1 |
| `Course creator` | Absent → anglais | Formateur | Titre visible en capitales ; utilise la liste instructors, arbitrer si distinction auteur/formateur souhaitée | P1 |
| `course rating` | Absent → anglais | note du cours | Visible ; composer plutôt une phrase entière avec la moyenne et le nombre d’avis | P1 |
| `user rating` | Absent → anglais | avis | Branche 1 avis non observée ; aucun texte d’avis à traduire | P1 |
| `user ratings` | Absent → anglais | avis | Visible avec zéro avis ; phrase complète préférable au fragment anglais & | P1 |
| `Write a Review` | Absent → anglais | Donner un avis | Bouton et titre du dialogue visibles | P1 |
| `Review` | Révoir | Avis | Champ actuellement Révoir : nom mal traduit, source LMS | P0 |
| `Rating` | Évaluation | Note | Champ à étoiles actuellement Évaluation ; plus précis, vérifier les autres usages de cette clé globale | P2 |
| `Submit` | Valider | Valider | Visible Submit ; traduction déjà disponible mais appel __() manquant | P0 |
| `Please enter a rating.` | Absent → anglais | Veuillez attribuer une note. | Validation statique non déclenchée ; appel __() absent et clé absente du POT | P0 |
| `Error` | Erreur | Erreur | Fallback statique non déclenché ; __() absent alors que traduction disponible | P0 |

Les 39 clés de la matrice sont déjà dans le POT sauf Please enter a rating. ; leur état exact et leurs références sont dans inventory.json. Les deux fragments de ressource du titre vide ne doivent pas donner lieu à un simple remplacement global « Courses » dans toutes les sources. Les traductions proposées sont des recommandations, pas des traductions livrées.

### Erreurs de code confirmées, pas seulement des PO à remplir

1. **État vide bilingue** : Courses.vue:10 transmet empty-name="Courses" ; EmptyStateLayout.vue:40 insère directement props.name dans __('No {0} Found'), et ListPage.vue:300 fait de même dans l’annonce accessible. Le cadre français est disponible, mais pas la localisation de l’argument. La description utilise aussi props.name.toLowerCase() (EmptyStateLayout.vue:48). Recommander des phrases contextualisées ou une interface de noms localisés qui respecte casse/genre ; traiter ensemble panneau et annonce, puis vérifier les autres pages clientes. Ne pas coder le français en dur ou modifier le titre éditorial d’un cours.
2. **Avis : trois littéraux sans __()** dans Modals/ReviewModal.vue : action label: 'Submit' (:8), validation return 'Please enter a rating.' (:66), fallback resourceErrorMessage(err, 'Error') (:75). Dialog du frappe-ui installé affiche action.label directement (src/components/Dialog/Dialog.vue:130). Submit et Error ont déjà Valider/Erreur dans le dictionnaire, mais n’en bénéficient pas. La validation sans note n’a pas été déclenchée ; son défaut est confirmé statiquement. Envelopper les sources avec le mécanisme natif, puis extraire uniquement selon le circuit approuvé.
3. **Compositions fragiles** : CourseCardOverlay.vue:107 colle un nombre à __('enrolled') → 3 inscrit ; CourseOverview.vue:45 colle un nombre à Students ; CourseCard.vue:125 colle pourcentage et completed. Ne pas remplacer enrolled par inscrits partout : 1 inscrit serait perdu. Préférer des expressions contextualisées complètes ou des branches singulier/pluriel natives. Les fragments section(s)/lesson(s) doivent devenir Chapitre(s)/Leçon(s) sans modifier les objets ou titres stockés.
4. **Résumé des avis** : CourseReviews.vue:10–16 assemble course rating, '&', nombre et user rating(s). Le '&' est un séparateur source, pas une phrase anglaise oubliée dans une traduction ; recommander une phrase complète du type « Note moyenne : {0}/5 · {1} avis », source anglaise correspondante et paramètres préservés. Dates (:193–199) également composées avec month(s) ago/day(s) ago : révision statique à prévoir pour les avis anciens, sans inventer de faux avis pour la démontrer.

Les vrais contenus ne doivent pas être enveloppés aveuglément : course.title, short_introduction, description, chapter.title, lesson.title, noms/bios de formateurs et texte des avis sont des données éditoriales. Les classes CSS, noms de routes, icônes, statuts stockés, valeurs de filtre et arguments API sont techniques, pas des traductions à remplacer.

### Branches secondaires encore à couvrir

Inventaire statique dans les mêmes composants : Enroll Now → S’inscrire ; Buy this course → Acheter ce cours ; Contact the Administrator to enroll for this course → Contactez l’administrateur pour vous inscrire à ce cours ; Course content coming soon! → Le contenu du cours sera bientôt disponible ; Related Courses → Cours associés ; Certificate of completion → Certificat de fin de cours (sans promesse de qualification officielle) ; Get Certificate / View Certificate → Obtenir / Consulter le certificat. Get Certified demande arbitrage selon l’action réelle (évaluation ou accès au certificat), pas traduction automatique par « Être certifié ».

Pour plusieurs formateurs : Taught by → Animé par ; Taught by a team of {0} → Animé par une équipe de {0} formateurs ; Also teaching → Autres cours de ce formateur ; Show more instructors → Afficher les autres formateurs ; and/others → et/autres selon la phrase complète. Pour les avis : See more/See less, View all reviews et dates anciennes demandent une vérification de leur traduction dans un lot de contenu réel adapté.

Ces branches (payant, non inscrit, progression non nulle, certificat, cours lié, équipe de formateurs, avis anciens) ne sont pas prouvées par le parcours du seul cours FR01. L’audit statique est plus large que la démonstration navigateur ; aucune assertion de rendu complet de ces cas.

## Provenance LMS, Framework et composants partagés

- **Erreurs locales au PO LMS confirmées** : Free → Libre, enrolled → inscrit, completed → complété, Review → Révoir, section → section, Certification → Certification. Les traductions Framework correspondantes sont absentes dans le relevé ; ce ne sont pas des corrections à faire dans Framework pour ce lot.
- **Clés communes renseignées dans les deux PO** : Search → Recherche, Category → Catégorie, Filters → Filtres, Published → Publié, Rating → Évaluation, Submit → Valider, Error → Erreur, Clear → Nettoyer, of → sur, Loading… → Chargement…, Collapse → Réduire. La valeur fusionnée ne prouve pas quel catalogue est l’unique origine ; ne pas attribuer exclusivement ces textes au Framework. Rating/Clear peuvent demander contextualisation LMS plutôt qu’un changement global du vocabulaire Framework.
- **Composants Framework/UI** : frappe-ui rend Dialog, contrôles et pagination ; @framework/ui est lié au checkout Frappe pour des fonctions partagées. Ce n’est pas le même sujet que le PO Framework : une chaîne d’un composant peut être fournie/traduite par LMS. ListPage fournit son propre slot footer droit avec __('of') ; le littéral of dans le ListFooter générique est remplacé ici, donc pas une erreur visible supplémentaire à corriger dans ce contexte.
- **Collapse encore affiché malgré Réduire disponible** : AppSidebar.vue:96–100 traduit seulement aria-label ; le libellé visible est codé 'Expand'/'Collapse' dans frappe-ui/src/components/Sidebar/SidebarCollapseToggle.vue:2. L’aria-label peut donc être correct alors que le texte reste anglais. Ce point de coque commune doit être traité par une intégration/extension native du composant côté LMS ou une contribution amont explicitement autorisée, pas en modifiant Framework ou node_modules dans cet audit.
- **Coque adjacente** : Skip to main content → Aller au contenu principal (Layouts/pages/desktop/DesktopLayout.vue:8 et variantes mobile/no-sidebar), Complete your profile → Complétez votre profil, Highlight what makes you unique and show your skills. → Mettez en valeur vos compétences dans votre profil (Sidebar/AppSidebar.vue:41–50). Ces sources sont déjà enveloppées mais sans traduction française chargée. Batches → Lots est une traduction LMS déjà visible, incompatible avec la proposition Session de formation ; l’arbitrage Batch du glossaire et sa portée globale restent à valider hors correction ponctuelle du catalogue.

Les libellés déjà corrects Tous les cours, Cours, Recherche, Catégorie, Filtres, leçon, Terminé et Verrouillé doivent être conservés. Published → Publié n’est pas un manque de traduction ; « Publiés » ou « Disponibles » pour l’onglet est une amélioration de contexte UX éventuelle, pas une substitution de valeur stockée.

## Interface ou contenus pédagogiques ?

L’écran FR01 montre une introduction et description anglaises (« A course to test utilities of Frappe Learning », « This is a detailed description of the Utility Course. »). Ce sont des champs du cours fictif, **pas des clés d’interface oubliées**. Business est une catégorie issue des données ; les tags Frappe/Learning/Utility et noms du formateur viennent aussi des données. Ne pas les ajouter au POT comme s’il s’agissait de labels fixes de composant.

Les titres FR01 déjà français restent inchangés. La marque provisoire Learning et les identités utilisateur ne relèvent pas d’un renommage autorisé. Pour rendre des contenus disponibles dans plusieurs langues, prévoir une stratégie éditoriale distincte avec le propriétaire ; la francisation de l’interface ne traduit pas automatiquement cours, avis, gabarits pédagogiques ou catégories personnalisées.

## Priorités et estimation du périmètre de correction

| Lot proposé, à autoriser | Périmètre indicatif | Critère d’acceptation futur |
| --- | --- | --- |
| P0 : état vide et dialogue d’avis | Environ 4 Vue LMS (Courses, ListPage, EmptyStateLayout, ReviewModal), trois littéraux à envelopper et composition des noms ; quelques assertions ciblées | Aucun cours trouvé dans le panneau ET l’annonce ; Valider/Erreur chargés et validation de note traduisible, sans autre ressource cassée |
| P0/P1 : faux sens, compteurs et vocabulaire principal | Les 39 clés de la matrice, moins celles qui sont seulement à contextualiser ; environ 7–9 composants + fr.po, nombre final à arrêter après choix des phrases complètes | Gratuit, Avis, accord 1/n, paramètres intacts ; toutes les clés du lot déclaré réellement françaises en FR et sources anglaises en EN |
| P1 : accessibilité, filtres mobile et reprise | Annonces, tooltips/aria, Start/Continue Learning, certificat de filtre ; inclus en partie dans la matrice, ne pas additionner ces nombres | Même intention visible/accessible, recherche et volet Filtres utilisables en français |
| P2 : branches conditionnelles | Environ 15–25 clés complémentaires, données de test dédiées nécessaires pour payant/certificat/avis anciens/équipe/cours associés | Contrôles ciblés des seules branches retenues, pas une suite générale automatique |
| Coque commune / décisions UX | 3 zones de layout/sidebar et composant de repli/collapse ; Batch, note vs évaluation et labels statistiques à arbitrer séparément | Ne pas étendre silencieusement FR-02B aux autres pages, à Framework, à un renommage ou aux métriques |

Ces estimations portent sur des clés/fichiers, pas des heures promises ; elles dépendent des décisions de composition grammaticale et des contextes partagés. **Recommandation : autoriser d’abord un petit lot P0 + libellés centraux P1 explicitement listé**, puis les états conditionnels, plutôt qu’une modification globale des 105 clés extraites. La dérogation PO FR-01F ne couvrait que ses 21 clés : toute nouvelle traduction ou mise à jour POT devra être autorisée pour le lot futur, avec extension claire du périmètre.

## Contrôles effectués et limites

- Parcours Chromium ciblés décrits ci-dessus, captures et DOM ; dialogue d’avis ouvert sans soumission, volet Filtres mobile ouvert ; préférence de l’apprenant restée fr.
- Lecture des sources réelles, des composants enfants et des PO LMS/Framework ; extraction native en mémoire pour 16 fichiers Vue, sans réécrire de catalogue. 105 clés inventoriées avec états de dictionnaire ; comptage non assimilé à une certification de couverture.
- Aucun pageerror JavaScript dans les sept premiers écrans ; sept réponses de télémétrie boot_config refusées, anomalie annexe déjà documentée en FR-01F final. Pas d’analyse générale ou de correction des journaux/requêtes externes pendant cet audit.
- Aucun paiement, inscription, certificat, avis ou progression créé/modifié ; aucune préférence changée. Aucun test complet, build, compilation MO, invalidation de cache ou installation.
- Non parcourus : cours payant/non inscrit, cours terminé, affichage du certificat, plusieurs formateurs, avis existants/anciens, toutes catégories, pagination multi-page et vrais outils d’assistance. La lecture de sr-only n’est pas un test avec lecteur d’écran.
- Revue du diff/secrets documentaire et vérification de l’intégrité des 79 PO, du POT et du checkout Framework avant commit. Aucun changement de code, catalogue, workflow ou configuration ; develop et production non touchés.

Preuves hors Git : /workspace/work/fr02a/browser.cjs/log/json, extra-browser.cjs/log/json, captures catalogue/fiche bureau et mobile, états vides et dialogue/volet, inventory.py/log/json (références exactes, états LMS/Framework/runtime), catalog-hashes.json. Seules les données fictives existantes ont été utilisées ; aucun credential copié dans les livrables. 88b8a96b reste un commit documentaire local non publié ; le commit courant d’audit ajoute uniquement ce document et le handoff. Aucun push ou PR. Attendre la validation des recommandations et du périmètre avant toute implémentation ; **arrêt après FR-02A, sans FR-02B**.
