# FR-03B.9 — Accueil, statistiques et modération

31 octobre 2026, Europe/Paris. Branche littlepool-dev.

## Publication préalable et base

FR-03B.8 publié sur autorisation, push normal : **3844585e1735f1edadc79c858e509d6df089c002**, puis **f559542d4ef99c318818b839501b0a9c21a21f42**. Distant initial 14537592, huit fichiers/920 FR/3 013 POT confirmés, ajout unique Evaluation of {0}/Évaluation de {0}, aucun retrait ni perte PO. Preuves 171 Vue/douze contrôles de permissions fictives/compilation/build relues sans les rejouer pour publier. Quatre générations entièrement simulées, quatre rejets JS de chargement refusé conservés, réserve de lecture étendue des certificats maintenue. 78 autres PO/Framework intacts, secrets contrôlés. Rapport GitHub récupéré au SHA et identique au local ; checkout propre/HEAD égal au distant ; develop inchangée 6b791f33b34efa15566a0cb707f5be59d136df50. Références locales origin/littlepool-dev/develop absentes possibles : vérification par ls-remote.

**Base de FR-03B.9 : f559542d4ef99c318818b839501b0a9c21a21f42. Aucun push du lot courant.** AGENTS/handoff, audit FR-03A, résultats FR-03B8, glossaire et plan réutilisés. Site et dépendances existants, aucune installation/migration ou nouveau conteneur. Aucun début de FR-04 ni clôture définitive de FR-03.

## Périmètre et choix de volume

**31 traductions nouvelles**, aucune des 920 valeurs antérieures modifiée ou supprimée. Ce volume dépasse un micro-lot de 8–12, car il couvre les familles expressément demandées : six clés statistiques, une clé pédagogique de navigation, quatre clés d’annuaire, quinze clés d’accueil et cinq clés de discussion. Pas de traduction générale de l’administration, de nouveau workflow ou de permission.

Dix sources frontend : Statistics, CertifiedParticipants ; SidebarLink/AppSidebar, mobileRows et configuration Settings/Sidebar ; trois pages de navigation des devoirs ; Discussions pour rendre extractible son texte vide dynamique. Home/AdminHome et les composants de réponse/avis restent inchangés, leurs libellés existants recevant les traductions PO ciblées. Cinq fichiers de tests, dont staffOverviewTranslations nouveau. Aucune source backend, aucun calcul/filtre de graphique ou de liste modifié.

## Statistiques : sens reconfirmé sur la base

| Champ / valeur fictive de test | Calcul réel inchangé | Libellé final |
| --- | --- | --- |
| courses = 12 | LMS Course published=1, upcoming=0 | Cours publiés ; infobulle Cours publiés hors cours à venir |
| users = 35 | User enabled=1, hors Administrator et Guest | Comptes activés |
| enrollments = 60 | Nombre de LMS Enrollment | Inscriptions aux cours |
| completions = 20 | LMS Enrollment avec progress LIKE '%100%' | Inscriptions achevées |
| certifications = 14 | LMS Certificate published=1 | Certificats publiés |

Comptes activés ne veut pas dire connexions récentes ni activité pédagogique réelle, et ne compte pas seulement un rôle d’apprenant. Une personne peut avoir plusieurs inscriptions achevées ou certificats. **Le filtre d’achèvement est un LIKE, pas une égalité numérique stricte** ; interprétation nominale 100 %, aucune correction de ce calcul dans ce lot.

Published certificates est une clé anglaise spécifique aux statistiques ; elle remplace Certified Members pour le compteur et le titre du graphique des certificats. Sa série native Certification filtre bien published=1 et groupe selon **issue_date**, pas selon une date de publication. Signups/Comptes créés reste le titre du graphique de créations de comptes ; il n’est pas confondu avec le nombre de comptes actuellement activés.

Scripts Statistics et sources get_chart_details/get_course_completion_data inchangés. Paramètres chart_name, données, clés Completed/In Progress, couleurs, séries et hasCompletions identiques. Le test vérifie hasCompletions avec 0/1/20. Les légendes de l’anneau restent anglaises : le composant natif installé n’expose pas de formateur distinct des libellés de catégorie (format concerne les valeurs). Aucun remappage de données ajouté. Le titre existant de cet anneau reste inchangé et pourra être revu séparément ; ne pas annoncer tous les graphiques intégralement francisés.

## Annuaire et compteurs distincts

get_certification_query groupe par **Certificate.member**, filtre au moins un certificat publié et User.enabled=1 ; get_count_of_certified_members compte ces lignes distinctes. Certified Members est donc traduit **Personnes certifiées** dans l’annuaire, sans être détourné globalement en compteur de certificats.

Le titre chiffré utilise deux clés explicites : **1 certified participant** et **{0} certified participants**, permettant 0/1/plusieurs correctement en FR/EN. Cas fictifs : 14 certificats publiés appartenant à neuf personnes, puis recherche vers une personne et aucun résultat. La source de Certificate courses et sa traduction courte Cours avec certificat désignent le lien existant vers Courses?certification=true, sans promettre un certificat immédiatement obtenu.

Le badge certificate_count d’une carte provient de get_certified_participant_details : **nombre de tous les LMS Certificate du membre, sans filtre published dans cette requête**. Il ne faut donc pas en déduire la même somme que le compteur global de certificats publiés. Les labels certificate/certificates déjà disponibles et leur logique ne sont pas modifiés. Aucune recherche, catégorie, publication, visibilité de profil, pagination ou téléchargement changé.

## Navigation et Assignments

Dans les appels LMS examinés, Assignments désigne les travaux pédagogiques. Le Framework utilise aussi cette clé pour les affectations de tâches/notifications (assign_to.js/Notification Settings). **Assignments → Affectations est conservé dans le PO et le dictionnaire fusionné**, évitant une surcharge globale incorrecte.

La clé locale **Course assignments → Devoirs** est utilisée pour les affichages de navigation : SidebarLink, étapes d’onboarding affichées, configuration de barre latérale, pages/breadcrumbs Assignment(s)/Submission(s), et libellé de ligne MobileYou. Le lien brut Assignments, son nom de route, sa clé de ligne, les listes activeFor et la classification mobile restent inchangés. Le test de ligne mobile vérifie label nouveau/key Assignments/to Assignments ; le menu mobile conserve son groupe. Pas de dictionnaire parallèle ni de changement des identifiants LMS Assignment.

Les occurrences techniques dans routes.js, mobileNav.ts et getSidebarItems restent anglaises. Le titre chiffré distinct `{0} Assignments` et certains états génériques de cette page ne sont pas inclus dans la francisation du parcours complet des devoirs. Desk/Framework et tout usage non pédagogique ne sont pas annoncés corrigés.

## Accueil personnel

Home/AdminHome n’ont aucun changement de code : rôles is_moderator/is_instructor/is_evaluator, choix des vues, ressources et routes identiques. Les traductions couvrent Bonjour, résumé sans élément, noms singulier/pluriel des séances en direct/évaluations et trois phrases paramétrées, titres de cours/sessions, Tout voir et premier cours.

Les formulations « Au programme : … » évitent un adjectif dont l’accord deviendrait incorrect lorsque {0}/{2} vaut 1. Paramètres conservés {0}–{3}. Les noms, titres de cours et descriptions créés par les utilisateurs restent des données, non traduits. Tests de chacun des trois indicateurs de personnel avec 0/1/3 ; un indicateur d’accueil n’est pas une permission générale. Les essais navigateur utilisent un modérateur fictif, pas toutes les affectations possibles du personnel.

## Traductions livrées

| Source anglaise exacte | Français |
| --- | --- |
| Published Courses | Cours publiés |
| Published courses excluding upcoming courses | Cours publiés hors cours à venir |
| Enabled accounts | Comptes activés |
| Course Enrollments | Inscriptions aux cours |
| Completed enrollments | Inscriptions achevées |
| Published certificates | Certificats publiés |
| Course assignments | Devoirs |
| Certified Members | Personnes certifiées |
| 1 certified participant | 1 personne certifiée |
| {0} certified participants | {0} personnes certifiées |
| Hey | Bonjour |
| Manage your courses and batches at a glance | Gérez vos cours et vos sessions en un coup d'œil |
| live class | séance en direct |
| live classes | séances en direct |
| evaluations | évaluations |
| You have {0} upcoming {1}. | Vous avez {0} {1} à venir. |
| You have {0} {1} scheduled. | Au programme : {0} {1}. |
| You have {0} upcoming {1} and {2} {3} scheduled. | Au programme : {0} {1} à venir et {2} {3}. |
| Upcoming Live Classes | Séances en direct à venir |
| Courses Created | Cours créés |
| Upcoming Batches | Sessions à venir |
| See all | Tout voir |
| No courses created | Aucun cours créé |
| There are no courses currently. Create your first course to get started! | Aucun cours pour le moment. Créez votre premier cours pour commencer ! |
| New Course | Nouveau cours |
| Reply actions | Actions de la réponse |
| Reply by {0} | Réponse de {0} |
| Your reply | Votre réponse |
| Reply cannot be empty. | La réponse ne peut pas être vide. |
| Start a Discussion | Démarrer une discussion |
| Certificate courses | Cours avec certificat |

Toutes ces valeurs étaient vides ou absentes du PO. Zéro correction d’une ancienne valeur renseignée. Les avis réutilisent leurs traductions des lots FR-02 ; pas de retraduction inutile ni d’extension aux dates relatives, emails ou contenus pédagogiques.

## Modération : inventaire factuel

| Capacité | Confirmé dans le code examiné | Limite / autorisation |
| --- | --- | --- |
| Afficher sujets/réponses | Discussions, DiscussionReplies ; get_discussion_topics/get_discussion_replies | can_access_topic contrôle cours/session et inscription/auteur selon le contexte ; aucune lecture réelle testée |
| Créer une discussion | DiscussionModal insère Discussion Topic puis Discussion Reply ; bouton pour non-singleThread hors lecture seule | DocPerm/Custom DocPerm et validation de référence côté serveur ; aucune création testée en réel |
| Répondre | Éditeur/Post puis frappe.client.insert | validate_discussion_reply contrôle leçon/session et accès ; rejet de réponse vide local ; notifications possibles en réel, jamais déclenchées ici |
| Éditer sa réponse | Menu auteur → Edit, Post, Discard, set_value | UI condition user.name===reply.owner et non lecture seule ; autorisation effective serveur distincte |
| Supprimer une réponse | Menu auteur → Delete, frappe.client.delete | Pas de dialogue de confirmation dans ce handler ; aucune suppression confirmée/testée en réel |
| Avis de cours | CourseReviews et ReviewModal : affichage, note, aperçu/voir tout, écriture si inscription et pas déjà d’avis | Contrôleur LMSCourseReview : inscription de l’owner et unicité cours/owner, texte normalisé ; hook course_record_has_permission et DocPerm restent applicables |
| Supprimer/modérer un avis | Droits backend possibles selon DocPerm/hook | Aucun bouton dédié d’édition/suppression d’avis dans CourseReviews examiné ; ne pas annoncer une action UI disponible pour Moderator |
| Publier/dépublier/supprimer cours ou sessions | Actions existantes inventoriées FR-03B.4/B.5 | Contrôles d’auteur/modérateur/permissions propres à l’objet ; aucune action déclenchée dans B.9, avertissements destructifs incomplets conservés |

Les DocTypes Discussion Topic/Reply viennent du **Framework**, pas de contrôleurs LMS de même chemin. Le patch LMS give_discussions_permission prévoit read/write/create/delete pour LMS Student/Course Creator/Batch Evaluator avec if_owner=1, et Moderator avec if_owner=0. Ce patch n’est pas exécuté et les Custom DocPerm effectives de l’instance ne sont pas interrogées. Le menu frontend des réponses reste **auteur seulement**, même si le backend peut donner un droit plus large à un modérateur. Pas de nouveau droit déduit ou ajouté.

Point de sécurité : `get_discussion_topics(..., single_thread=True)` peut **créer** le sujet absent malgré son nom de lecture. Cet endpoint est entièrement simulé. Le scénario navigateur vide force une réponse nulle pour exercer l’affichage ; il ne prouve pas qu’un appel serveur natif sur sujet absent laisserait l’état vide sans insertion.

**Non confirmés dans les composants/endpoints examinés :** signalement, file de signalements, modération préalable, approbation éditoriale, sanction/suspension dédiée, historique métier de décision, journal immuable, tableau de bord centralisé. Ce n’est pas une preuve d’absence dans toutes les applications/modules Frappe possibles. Ces fonctions exigeraient une mission et une autorisation distinctes ; rien ajouté dans B.9.

## PO/POT et chargement

- **POT 3 013 → 3 019 : neuf ajouts / trois retraits**. Ajouts : 1 certified participant ; {0} certified participants ; Certificate courses ; Completed enrollments ; Course assignments ; Enabled accounts ; Published certificates ; Published courses excluding upcoming courses ; Start a Discussion.
- Retraits : **Active Members**, **Course Completions**, **Get Certified**. Seuls appels littéraux concernés remplacés par Enabled accounts, Completed enrollments et Certificate courses. Historique PO de ces clés conservé, aucun nettoyage de traduction. Certified Members reste pour les personnes ; Assignments reste pour ses autres contextes/métadonnées.
- **Seize références communes modifiées** : huit déplacements de ligne (Open to Work, certificate, New {0}, Search, certificates, Published Courses, Hiring, Category) et huit ensembles de références adaptés aux nouveaux labels (Course Enrollments, Enrollments, Assignments, Completions, Certified Members, Certifications, Courses, Signups). Published Courses passe d’une infobulle au titre cohérent du compteur, son infobulle explicite reçoit sa propre clé. Pas de fichier renommé, changement anormal de contexte/flags/pluriel ou chaîne parasite ; dates d’en-tête natives en plus. Rapport complet references.json hors Git.
- **PO 2 828 → 2 837 entrées ; 920 → 951 valeurs renseignées** : neuf entrées ajoutées depuis le POT, 22 vides renseignées, tous les autres blocs/en-tête et les 920 anciennes valeurs préservés via Babel contrôlé. Paramètres/contextes/flags vérifiés.
- Génération native bench generate-pot-file --app lms, aucun POT manuel, update-po-files ou Crowdin. Compilation native LMS/fr puis cache du seul learning.localhost via frappe.translate.clear_cache réussis ; 31 valeurs identiques PO/MO/dictionnaire réellement chargé, Assignments reste Affectations et Course assignments vaut Devoirs. 78 autres PO et Framework intacts, langues/préférences inchangées.

## Tests et erreurs intermédiaires

**115 tests Vue / sept fichiers réussis dans une exécution finale de 6,85 s** après le libellé de bouton final. staffOverviewTranslations nouveau, sidebarLink, mobileYouRows, Discussions, discussionMentions étendus ; CourseReviews et ReviewModal réutilisés sans modification. **39 nouveaux cas et 76 existants**, pas une suite globale.

Vérifications : cinq compteurs/valeurs 12/35/60/20/14 et distinction neuf personnes ; hasCompletions 0/1/20 ; annuaire 0/1/5 en composants, 9/1/0 en navigateur ; résumés de chaque indicateur personnel 0/1/3 ; navigation et identifiants techniques ; discussion vide FR/EN ; menu de réponse propre/tiers/lecture seule et refus de réponse vide sans appel ; avis et refus/soumission entièrement simulés par les tests existants. Vrai PO et plugin natif, pas de dictionnaire français parallèle.

Premier passage 109/109 avant les six cas de réponse supplémentaires. Puis **113/115** : deux nouveaux sélecteurs supposaient Post alors que sa traduction existante est localisée. Sélecteur corrigé avec le vrai catalogue ; aucune traduction absente masquée ou logique app modifiée. 115/115, puis raccourcissement du bouton et **sélection complète finale 115/115** ci-dessus. Un appel exploratoire Python hôte sans Babel a échoué ; aucun paquet installé, contrôles Babel effectués dans le conteneur existant comme prévu.

get_chart_details exécuté en AST avec frappe/db.count entièrement fictifs : cinq nombres et filtres exacts confirmés, zéro DB réelle. Douze sources métier/routes comparées à l’octet ; scripts setup Statistics/CertifiedParticipants/Discussions identiques. Home/AdminHome, réponses/avis, API/hook/permissions inchangés. Pas de suite Python/backend transactionnelle, migration ou nouvelle extraction de tests globale ; la génération native vérifie les nouvelles clés.

Build final **9,27 s** application + **1,44 s** signup, commande **12,80 s**, réussi ; build précédent 10,38/1,67 s après première version. Deuxième build justifié par le libellé source raccourci. Déclarations générées restaurées, assets/MO ignorés. Prettier des quinze fichiers frontend, diff, Babel, paramètres, empreintes et recherche ciblée secrets contrôlés. Avertissements Vite/Browserslist/fs conservés ; pre-commit global historiquement bloqué non relancé, commits après contrôles explicites avec hooks désactivés.

## Chromium : périmètre réellement validé

**Quatre recettes finales FR/EN ordinateur/mobile abouties sur les surfaces retenues** : statistiques fictives, accueil modérateur 0/1/3, annuaire 9/1/0 avec recherche, navigation Devoirs et route conservée, discussion vide puis réponse propre fictive et menu d’auteur. Ces surfaces sont disponibles sur mobile ; filtre d’annuaire ouvert par le bouton Filtres natif, pas par une UI inventée. Captures finales pour statistiques/accueil/annuaire/discussion, contenus utilisateurs fictifs inchangés.

**Avis : non validés en navigateur.** Deux tentatives avec une fiche de cours fictive minimale ont montré l’onglet Aperçu sans rendre la zone d’avis ni appeler get_reviews ; aucune pageerror, cause non diagnostiquée. Le scénario n’est pas présenté réussi ou attribué arbitrairement à une régression. Il reste couvert par CourseReviews/ReviewModal en composants ; compléter une fixture isolée serait une mission ciblée distincte, pas une lecture de cours réel pour contourner la limite. Les quatre recettes finales omettent ce segment et portent reviewBrowserNotValidated=true.

Premiers harnais : attente d’avis expirée ci-dessus ; recherche mobile supposée visible alors qu’elle est dans le panneau Filtres, navigation corrigée dans le script seulement. Revue visuelle : le premier bouton long masquait davantage le fil d’Ariane mobile ; source finale **Certificate courses**, français **Cours avec certificat**, même destination et même mise en page. Nouvelle extraction/compilation/build/tests puis quatre recettes finales sur la valeur livrée. La capture du panneau de filtres ouvert ne constitue pas une capture du détail d’un profil réel.

**Zéro écriture sensible tentée/transmise** : interceptions avant connexion/montage, tous statistiques/comptes/rôles/cours/sessions/personnes/certificats/avis/discussions/notifications fictifs ; auth des comptes de test/ping/traductions seuls vers le site. Méthodes inconnues, REST et toute insertion/modification/suppression/publication/email bloqués. Aucune réponse ou avis soumis dans le navigateur, aucun cours publié ou retiré. get_streak_info et lecture single-thread, potentiellement à effets de bord, sont simulés aussi.

Recette finale : quatre résultats, zéro pageerror, cinq HTTP400 socket.io et 42 boot_config bloqués. Ce résultat ciblé ne valide pas tout JavaScript, toutes les permissions ou les transactions réelles ; les rejets historiques/B.8 ne sont pas déclarés corrigés. Recherche, rôles et contenu fictifs servent seulement au test, pas à des statistiques de production.

## Bilan documentaire des neuf lots FR-03B

Mesures issues des rapports de chaque lot ; tests réutilisés/recoupés, **ne pas additionner comme une couverture unique**.

| Lot | Livraisons linguistiques | FR final | POT final / évolution | Preuves principales et limites |
| --- | --- | --- | --- | --- |
| B.1 membres/rôles | +32 valeurs ; rôles techniques conservés | 719 | 3 001, +4/-0 | 81 Vue ; sauvegarde mobile/toast non entièrement confirmés |
| B.2 inscriptions multiples | +21 ; sélection, places, adresses | 740 | 3 005, +4/-0 | 268 Vue ; écritures/inscriptions entièrement fictives |
| B.3 paiements personnel | +49 ; enregistrement/association ≠ encaissement | 789 | 3 006, +3/-2 | 238 Vue ; permissions/helpers simulés, aucune transaction réelle |
| B.4 cours/publication | +57 ; publication, achèvement, option certificat | 846 | 3 007, +1/-0 | 42 Vue ; confirmations de suppression potentiellement non exhaustives |
| B.5 sessions | +47 et trois corrections ; Batches→Sessions, Offline→Hors ligne | 893 | 3 010, +6/-3 | 57 Vue ; faux autosaves/publications, pas de déploiement |
| B.6 schémas de paramètres | +3 ; marqueur source N_ et règle Babel exacte | 896 | 3 013, +3/-0 | 86 Vue/sept extraction ; paramètres admin absents mobile, description non associée accessiblement |
| B.7 transactions | +12 ; Reçu/Non reçu, Autres paiements, option certificat | 908 | 3 012, +2/-3 | 105 Vue ; formulaires/états vides partiels, permissions réelles non certifiées |
| B.8 évaluateurs/certificats | +12 ; titre paramétré, disponibilités/publication | 920 | 3 013, +1/-0 | 171 Vue/douze helpers AST ; quatre refus JS simulés, lecture du personnel plus large que l’affectation |
| B.9 accueil/statistiques/modération | +31 ; compteurs/contextes/nav/annuaire/accueil/réponses | 951 | 3 019, +9/-3 | 115 Vue ; quatre recettes limitées, avis navigateur non validés, légendes encore anglaises |

Depuis l’état 687 FR/2 997 POT avant B.1 : **264 valeurs nouvelles**, trois corrections terminologiques B.5 et **+22 clés POT nettes**. Cohérence : Cours/Leçon/Devoirs/Session, inscription distincte d’une personne, option certificat distincte de délivrance/publication, disponibilité distincte de réservation, paiements enregistrés distincts de capture bancaire. Anglais source/secours et préférences prioritaires conservés.

**Domaines encore partiels :** paramètres, transactions, certains formulaires/validations/états vides, évaluations/Google, tâches pédagogiques détaillées, libellés de graphiques issus des données, aide/onboarding et éléments Framework, administration mobile absente selon le panneau. Cette mesure de PO n’est pas une mesure de couverture complète de l’interface ; Framework fournit d’autres traductions et les contenus éditoriaux ne sont pas automatiquement traduits.

## Réserves et suite à soumettre

Conserver : toast mobile B.1, rejets JS historiques et global non validé, double clic paiement, transactions réelles non testées, dates/heures/fuseaux I18N-01, avertissements destructifs incomplets, administration mobile partielle, association accessible de durée manquante, lecture préexistante large de certains certificats, permissions effectives de production non testées. Ajouter la limite avis navigateur et les résidus de légende/compteurs de page Devoirs, sans les annoncer corrigés.

Propositions distinctes à valider : reprise du navigateur d’avis avec fixture fiable ; revue d’accessibilité et des libellés de données ; audit d’autorisations de lecture des certificats/DocPerm effectives ; définition d’un éventuel vrai workflow de modération ; plan FR-04 emails/notifications/PDF avec langue du destinataire, variables, rendus et zéro envoi réel. Crowdin/budget et identité BRAND-01 restent leurs décisions propres. **Aucune clôture définitive de FR-03 et aucun FR-04 commencé** sans accord explicite.

## Livraison et reprise

Dix-neuf fichiers : dix sources frontend, cinq tests, fr.po/main.pot, ce rapport et CODEX_HANDOFF.md. Source/tests **9fe29fbc** ; second commit catalogues/rapport/handoff à relever avec git log -1. Aucun push B.9, PR, synchronisation Crowdin, migration, develop/Framework/Docker production/OMV modifié. Checkout propre après livraison attendue.

Preuves hors Git `/workspace/work/fr03b9/` : snapshots/empreintes, plan/summary/references, génération native, compilation/check, tests Vue initiaux/final, build, invariants/counters AST, recettes successives et captures fictives. Aucun compte/cookie/jeton/MO/asset ajouté. Prochaine action : revue de ces résultats et accord explicite avant publication des deux commits, clôture éventuelle ou nouveau chantier.
