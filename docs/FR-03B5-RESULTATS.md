# FR-03B.5 — Sessions de formation et suivi pédagogique

31 octobre 2026 (Europe/Paris), branche littlepool-dev.

## Publication préalable et base

FR-03B.4 publié sur autorisation explicite : **18d0d021228d661d18f0e94bf585d06f2d868451**, puis **be7f1e4b8c69bb6ff4896777be7c4d36db7a9def**. Base distante 224c78f9 vérifiée, huit fichiers relus, 846 FR / 3 007 POT, ajout unique Enrolled learners et aucune suppression ; clé globale Enrolled conservée. Preuves 42 Vue et quatre Chromium complets/quatre contrôles de titre relues, 40 écritures fictives sans transmission confirmées. Aucun test/build relancé pour publier. Réserve de suppression non exhaustive conservée, traduction fidèle sans minimiser les conséquences. Push normal, rapport GitHub identique et checkout propre/aligné ; develop toujours 6b791f33b34efa15566a0cb707f5be59d136df50.

**be7f1e4b est la base réelle de FR-03B.5. Aucun push de ce nouveau lot.** Reprise AGENTS/handoff, audit FR-03A, résultat FR-03B4, glossaire et plan ; conteneurs/dépendances/site learning.localhost réutilisés, pas de réinstallation ni de réinitialisation.

## Périmètre et corrections locales

Liste/navigation, création/modification, dates/heures/fuseau (libellés seulement), places, formateurs, modalité, publication, libellé d’annonce, confirmation de suppression et suivi pédagogique. **Cinq sources modifiées, uniquement dans la couche d’affichage :**

- Batches.vue : cinq phrases complètes d’onglets/titres Active/Upcoming/Archived/Unpublished/Enrolled batches. Le titre reprend la phrase de l’onglet, avec repli Batches, plutôt que concaténer {0} Batches. Cela évite « Actif/Archivé » masculins avec « Sessions » et la concaténation grammaticalement inadéquate ; valeurs internes active/upcoming/archived/unpublished/enrolled et tous les filtres/requêtes inchangés.
- BatchForm.vue et NewBatchForm.vue : Medium devient **Session delivery mode** pour le seul libellé ; traduction « Modalité ». La clé globale Medium et sa valeur Moyen restent intactes, notamment dans le dictionnaire fusionné avec Framework.
- AdminBatchDashboard.vue : réutilise **Enrolled learners → Apprenants inscrits** de FR-03B.4 ; **Certified → Certificates**, parce que get_count porte sur des documents LMS Certificate filtrés par batch_name, sans distinct par personne ni filtre published. Aucun calcul changé et aucune promesse de personnes distinctes ou de certificats publiés ajoutée.
- BatchStudentProgress.vue : **Complete → Completed**, état d’avancement « Terminé », sans modifier la clé globale Complete/Terminer utilisée comme action. Pourcentage, données, seuils/couleurs, visibilité du badge et routes inchangés.

Comparaison textuelle exacte à la base après ces seules substitutions : réussie. BatchDetail, BatchOverview, batchForm.ts, useBatchForms, API, utils, permissions et contrôleur LMS Batch byte-identiques. Aucun identifiant technique LMS Batch, champ, rôle, route, statut stocké, contrat API ou opération métier modifié. Pas de refonte graphique.

## Traductions finales

**50 entrées ciblées : 47 valeurs nouvellement renseignées et trois corrections existantes indispensables** :

| Clé corrigée | Avant | Après |
| --- | --- | --- |
| Batches | Lots | Sessions de formation |
| Batch Start Date | Date de début du lot, avec espace insécable final | Date de début de la session |
| Batch Details | Détails du lot | Détails de la session |

Le dépassement des 10–15 clés indicatives est limité à la cohérence indispensable des deux formulaires, aux dates/heures/places/formateurs, aux états de liste, à la confirmation destructive et aux résultats/validations expressément demandés. Les descriptions directement liées aux interrupteurs du formulaire évitent de laisser une opération payante ou de certificat décrite seulement en anglais. Pas d’extension aux opérations financières, intégrations, SEO, PDF ou contenus pédagogiques.

| Clé anglaise exacte | Français final |
| --- | --- |
| Batches | Sessions de formation |
| New Batch | Nouvelle session |
| Active batches | Sessions en cours |
| Upcoming batches | Sessions à venir |
| Archived batches | Sessions archivées |
| Unpublished batches | Sessions non publiées |
| Enrolled batches | Mes sessions |
| Only show batches that offer a certificate | Afficher uniquement les sessions proposant un certificat |
| Batch Start Date | Date de début de la session |
| Batch End Date | Date de fin de la session |
| Session Start Time | Heure de début de la session |
| Session End Time | Heure de fin de la session |
| Seat Count | Nombre de places |
| Number of seats available | Nombre de places disponibles |
| Instructors | Formateurs |
| Select instructors | Sélectionner des formateurs |
| Session delivery mode | Modalité |
| Online | En ligne |
| Offline | Hors ligne |
| Batch Details | Détails de la session |
| Batch overview | Présentation de la session |
| Batch options | Options de la session |
| Unpublish batch | Dépublier la session |
| Publish batch | Publier la session |
| Delete batch | Supprimer la session |
| Batch published | Session publiée |
| Batch unpublished | Session dépubliée |
| Batch updated successfully | Session mise à jour avec succès |
| Batch created successfully | Session créée avec succès |
| Error creating batch | Impossible de créer la session |
| You are not permitted to create a batch. | Vous n'êtes pas autorisé à créer une session. |
| Batch deleted successfully | Session supprimée avec succès |
| Confirm your action to delete | Confirmer la suppression |
| Deleting this batch will also delete all its data including enrolled students, linked courses, assessments, feedback and discussions. Are you sure you want to continue? | La suppression de cette session supprimera également ses données, notamment les inscriptions, les liens avec les cours, les évaluations, les retours et les discussions. Voulez-vous vraiment continuer ? |
| Batch Summary | Synthèse de la session |
| Progress of students in courses and assessments | Progression des apprenants dans les cours et les évaluations |
| Number of Students | Nombre d'apprenants |
| Make Announcement | Rédiger une annonce |
| Add students to the batch to make an announcement | Inscrivez des apprenants à la session pour pouvoir rédiger une annonce |
| Evaluation End Date | Date de fin des évaluations |
| Short Description | Brève description |
| Short description of the batch | Brève description de la session |
| Enrollment & Certification | Inscription et certificats |
| Allow users to enroll in this batch on their own. | Permettre aux utilisateurs de s'inscrire eux-mêmes à cette session. |
| Issue certificates to batch participants. | Permettre la délivrance de certificats aux participants de la session. |
| Paid Batch | Session payante |
| Charge a fee for batch enrollment. | Faire payer l'inscription à la session. |
| Enable evaluations for batch participants. | Activer les évaluations pour les participants de la session. |
| paid batches | les sessions payantes |
| Amount must be a positive number for {0}. | Le montant doit être un nombre strictement positif pour {0}. |

### Usages partagés examinés

Batches et Batch Details désignent les objets pédagogiques dans les usages UI/métadonnées LMS recensés : correction de Lots/Détails du lot cohérente avec le glossaire, sans renommer le DocType ni le module. Instructors/Select instructors sont aussi utilisés pour les cours : Formateurs/Sélectionner des formateurs restent pertinents. Les dates génériques Start Date/End Date/Start Time/End Time de création conservent leurs valeurs déjà présentes ; aucune harmonisation cosmétique globale (« Heure de Fin » conservé). Timezone, sélecteur de fuseau, évaluateur et autres libellés corrects réutilisés.

Active/Upcoming/Unpublished, Enrolled, Medium, Complete et leurs traductions globales restent inchangés ; les clés locales évitent d’altérer les autres contextes. No students enrolled yet, recherche/aucun résultat et Enrolled learners réutilisent les lots précédents, pas de nouvelle traduction redondante.

**Online/Offline restent exactement les valeurs stockées/API.** Les options traduites sont En ligne/Hors ligne. Le code examiné définit l’énumération et la transporte, sans garantir qu’Offline désigne exclusivement une salle physique ou une présence synchrone. Aucune traduction « En présentiel » déduite. Le fournisseur de visioconférence est un autre réglage ; aucun service Google/Zoom ouvert ou modifié.

Les noms de session/cours/catégorie/apprenant, titres des travaux, notes/commentaires et données de progression ne sont pas traduits. Les métadonnées d’interface ne sont pas des contenus pédagogiques multilingues automatiques.

## Opérations et autorisations conservées

- Création : garde Moderator/évaluateur et mode lecture seule native ; Course Creator ne confère pas automatiquement ce droit. Formulaire modifiable et refus testés avec données fictives.
- Affectation : recherches conservent **["Batch Evaluator", "Course Creator"]** ; ce sont des rôles techniques de recherche, pas une affectation globale à toutes les sessions. Le sélecteur conserve can_change_instructors. Évaluateur avec can_manage mais sans ce droit : lecture seule. Aucun membre créé ni rôle réel attribué.
- BatchDetail conserve is_moderator/is_evaluator/can_manage ; leur affichage ne certifie pas des droits serveur identiques. can_modify_batch/can_author_batch, DocPerm et hooks inchangés. Publication/dépublication testées avec réponses fictives uniquement.
- Make Announcement ouvre la route NewAnnouncement : **Rédiger une annonce**, pas Publier/envoyer immédiatement. Les tests existants d’ouverture et de formulaire sont simulés ; le navigateur vérifie le bouton désactivé sans participant, ne l’ouvre ni ne le soumet.
- L’autosave profond et différé **1 000 ms**, validations et handlers de BatchForm restent inchangés. Le code existant normalise déjà certaines heures en HH:mm ; aucune modification de ce format, de Day.js ou de conversion de fuseau. La recette modifie uniquement des champs fictifs et intercepte avant montage toutes les écritures, métadonnées incluses.

### Suppression : sens et limites

La confirmation annonce les données de la session. « Cours liés » est traduit par **liens avec les cours** : delete_batch supprime les lignes Batch Course, pas les documents LMS Course. Le backend supprime aussi inscriptions, LMS Assessment (associations d’évaluations), calendrier LMS Batch Timetable, retours et discussions/réponses liés à la session, puis la session. Il ne faut pas en déduire la suppression de tous les quiz/devoirs originaux ou une garantie de traitement de toutes les dépendances. Le calendrier est une conséquence connue non explicitement énumérée par le texte source ; réserve conservée, pas de refonte de suppression ni d’inventaire complet prétendu.

**Aucun appel delete_batch, aucune confirmation destructive exécutée, même dans les recettes navigateur.** Ouverture, texte, bouton rouge et annulation testés. Le message de réussite est traduit/chargé mais ne constitue pas une suppression réellement vérifiée. Les limites antérieures de suppression de cours restent ouvertes.

## Catalogues et chargement

- PO **2 808 → 2 816 entrées**, **846 → 893 traductions renseignées**. Huit entrées absentes ajoutées (six nouvelles clés et deux validations TypeScript), 39 entrées vides renseignées, trois valeurs corrigées ci-dessus. **843 autres valeurs renseignées antérieures préservées**, toutes les autres entrées/en-tête/blocs hors cible inchangés. Aucun nettoyage des anciennes clés.
- POT natif `bench generate-pot-file --app lms` : **3 007 → 3 010**, **six ajouts / trois retraits**. Ajouts : Active batches, Upcoming batches, Archived batches, Unpublished batches, Enrolled batches, Session delivery mode. Retraits : **Archived**, remplacé par Archived batches (seul usage applicatif connu) ; **Certified**, remplacé par Certificates ; **{0} Batches**, remplacé par les titres complets d’onglets. Les trois anciennes entrées PO sont conservées. **Dix changements de références communes**, tous dans les cinq sources modifiées (ajouts/retraits de références des clés réutilisées, pas de nouvelle logique). Dates natives d’en-tête seules variations supplémentaires ; aucun POT édité manuellement, aucune perte inexpliquée.
- Babel PO/POT, flags/contextes et paramètres {0}, conservation des blocs et 78 autres PO (38 LMS + 40 Framework) : contrôles réussis. Framework propre à 959b85de4086656273e1d158f41923dd3808c350.
- Compilation native LMS/fr et invalidation du cache du seul learning.localhost réussies. **MO 893**, les **50 valeurs finales concordent PO/MO/dictionnaire chargé** ; les clés réutilisées Completed/Certificates et Enrolled learners sont déjà disponibles. Préférences fictives fr/en et langue système fr inchangées. Aucun dictionnaire parallèle, update-po-files, Crowdin ou changement d’outil d’extraction.

## Tests et résultats

**Dernière exécution ciblée : 57 tests / dix fichiers tous réussis en une exécution de 13,06 s**, 18 nouveaux cas et 39 préexistants :

- newBatchForm : labels FR/EN, création/refus simulés, champs obligatoires, affectation fictive, identifiants/payloads/routes conservés.
- batchFormInstructors : garde de lecture seule existante ; nouveaux libellés FR/EN, valeurs Online/Offline, confirmation destructive sans action, autosave capturé en mémoire et paramètres inchangés.
- batchesHeader : deux cas FR/EN de titres complets et bouton Nouvelle session ; paramètres techniques d’ouverture existants conservés.
- adminBatchDashboardFilters : deux cas FR/EN de compteurs/titre/axes et données fictives ; cache/filtres/remontage/ouverture par identifiant d’inscription existants conservés.
- batchProgressTranslations nouveau : six cas FR/EN à 0/40/100 %, badge d’état Terminé, colonnes, un cours fictif pour que le badge soit effectivement visible.
- batchDetailPublishedBadge, batchDetailOpeners, batchDetailNotFound, batchesStudentFilter, announcementForm : inchangés et réutilisés pour statuts/refus/rôles/routes/filtres/annonces simulées.

Premier passage **47 réussis / huit échoués et quatre erreurs de watcher** : le harnais réinjectait un tableau Vue Proxy par copie superficielle, incompatible avec structuredClone(toRaw(doc)) ; six fixtures de progression n’avaient aucun cours/évaluation et le badge était légitimement masqué. Remplacement de la fixture par JSON brut, présence d’un cours fictif cohérent ; aucun patch du clone, de la visibilité ou des calculs applicatifs. Passage **55/55** ensuite. Ajout des deux tests de titre : import du helper réel avant Vue causant un échec de chargement de batchesHeader (zéro test dans ce fichier, neuf autres fichiers/53 tests réussis). Ordre d’import du harnais corrigé ; **final 57/57** ci-dessus. Ces quatre erreurs de watcher sont distinctes des 16 rejets JavaScript historiques ; pas masquées ni corrigées par un changement métier.

**Build frontend réussi, commande 13,63 s.** Déclarations components.d.ts/auto-imports.d.ts restaurées, assets/MO hors Git ; avertissements Vite/Browserslist/fs historiques conservés. Prettier dix fichiers, comparaison exacte des substitutions et intégrité sources/API/permissions/PO/Framework, diff et recherche ciblée de secrets : réussis. Pas de test Python transactionnel/backend : aucune logique Python modifiée ; contrôles Babel/dictionnaire par Python seulement. Pas de suite globale ni réparation du pre-commit historiquement bloqué ; hooks désactivés après contrôles ciblés.

## Chromium FR/EN ordinateur/mobile

### Quatre parcours principaux

**Quatre parcours FR/EN × 1440×1000 / 390×844 complets dans une exécution** : liste fictive, ouverture du formulaire Nouvelle session sans création, validation locale du titre vide, paramètres fictifs et libellés des dates/heures/fuseau, nombre de places, sélection Offline conservée techniquement, publication puis dépublication entièrement simulées, dialogue de suppression et Escape sans confirmation, libellé d’annonce désactivé sans participant, dashboard vide puis apprenant fictif/progression individuelle 40 % Terminé et recherche sans résultat.

**24 tentatives d’écriture autorisées entièrement fulfill** : huit autosaves, huit métadonnées et huit publications/dépublications. **Zéro écriture sensible transmise**, zéro endpoint sensible imprévu tenté, zéro insert/delete_batch/inscription/paiement/certificat/annonce envoyé. Tous les cours/sessions/membres/progressions/fuseaux/préférences/formateurs/catégories/évaluations et autres données nécessaires sont fictifs ou simulés avant montage. Seuls authentification/ping/traductions sont admis vers le site ; REST et méthodes inconnues bloqués. Les 20 lectures get_list, 24 détails de session, recherches et listes de discussion éventuellement nécessaires ne sont jamais envoyés vers les données réelles. Aucun sujet de discussion créé ; aucune connexion à une intégration externe.

Recette principale : **zéro pageerror**, **trois HTTP 400 socket.io**, **12 boot_config bloqués**. Premier essai interrompu sur une attente exacte de libellé de date incluant un marqueur required ; sélecteur adapté au préfixe accessible, sans changer l’application. Les quatre parcours finaux réussissent sans clic forcé ; contrôles exercés accessibles sur mobile, sans prétendre couvrir toutes les largeurs ou tous les contenus longs.

### Sélection des formateurs et lecture seule séparées

**Quatre parcours complémentaires FR/EN ordinateur/mobile** : sélection locale d’un deuxième formateur fictif, sans enregistrement ; rechargement avec un évaluateur fictif, can_manage=true/can_change_instructors=false et rôles cohérents → sélecteur désactivé. **Zéro écriture même simulée** dans ces parcours. Douze recherches de formateurs fictives ; paramètres roles conservent exactement Batch Evaluator/Course Creator. Zéro pageerror, un HTTP 400 socket.io et huit boot_config bloqués. Aucune création de membre ni attribution de rôle.

Premier essai interrompu parce que le harnais attendait le nom complet du second formateur, alors que le composant résume volontairement par prénoms. Assertion sur le résumé natif des deux sélections, pas de modification de ce comportement. L’état de rôle final utilise Batch Evaluator et is_evaluator ; aucun droit réel accordé.

Les deux recettes sont distinctes. Création réussie, refus serveur, erreurs de publication/sauvegarde et annonces restent couverts par les tests existants/simulations ; le navigateur n’a pas effectué une création, affectation sauvegardée, annonce ou transaction réelle. La permission serveur effective ne se déduit pas du drapeau can_manage renvoyé par un mock. Identifiants de fuseau et paramètres de recherche préservés ; formats de dates/heures non validés au titre d’I18N-01.

## Limites et travaux suivants

Conserver sans correction : toast mobile FR-03B.1 non confirmé ; 16 rejets JS historiques ; contrôle JS global non validé ; double clic paiement ; transactions réelles non testées ; dates/heures/fuseaux I18N-01 ; limites des confirmations destructives. Aucun résultat de cette recette ciblée ne valide globalement JavaScript ou les permissions de production.

Les libellés de visioconférence/SEO/modèles de courriel, opérations d’annonces/discussions, évaluations détaillées et intégrations non nécessaires à ce lot restent à inventorier/traiter dans leurs missions autorisées ; PDF/courriels restent FR-04. Les valeurs/statuts provenant des données ne sont pas traduits naïvement. **Aucun FR-03B.6 commencé.**

## Livraison locale

Quatorze fichiers : cinq sources Batches/BatchForm/NewBatchForm/AdminBatchDashboard/BatchStudentProgress ; cinq tests (quatre existants modifiés, batchProgressTranslations nouveau) ; fr.po/main.pot ; ce rapport et CODEX_HANDOFF.md. Commit sources/tests **067708f4** ; second commit catalogues/rapport/handoff à relever avec git log -1. Aucun push FR-03B.5.

Preuves hors dépôt `/workspace/work/fr03b5/` : snapshots, inventory/plan/summary, génération/compilation/check, invariants, logs Vue initiaux/final3, build, browser-full/browser-instructors et essais initiaux, captures fictives. Aucun secret/cookie/identifiant d’authentification ni fichier généré imprévu ajouté. Prochaine action : revue et accord explicite de publication. develop/Framework/78 autres PO intacts, aucun déploiement, PR, Crowdin ou intervention OMV 8.
