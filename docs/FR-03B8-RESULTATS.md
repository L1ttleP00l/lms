# FR-03B.8 — Évaluateurs et administration des certificats

31 octobre 2026. Branche exclusive littlepool-dev.

## Publication préalable et base

FR-03B.7 publié par push normal autorisé : **36d73db1099833bea55e20c036cadf5d1068e601**, puis **14537592329e5b38ef96bad6d6b506309d612d09**. Base distante c040d188 vérifiée, ordre des deux commits et six fichiers relus ; 908 FR/3 012 POT confirmés, diff +Not received/Other payments, -Paid/Unpaid/For Course entièrement expliqué, trois références communes déplacées. Historique PO et 78 autres PO préservés ; conditions/critères/API inchangés, deux sauvegardes entièrement fulfill local. Preuves 105 Vue/build/compilation relues sans rejouer les tests pour publier. Recherche ciblée secrets négative, Framework propre. Rapport récupéré sur GitHub au SHA publié et comparé à l’octet ; checkout propre/HEAD égal au distant. develop reste 6b791f33b34efa15566a0cb707f5be59d136df50.

**Base réellement publiée : 14537592329e5b38ef96bad6d6b506309d612d09. Aucun push FR-03B.8.** AGENTS/handoff, audit FR-03A, résultat FR-03B7, glossaire et sections utiles du plan consultés. Les références locales origin/littlepool-dev/develop peuvent manquer : état distant obtenu par ls-remote, pas par une référence locale supposée actuelle. Environnement learning.localhost et dépendances existants réutilisés, aucune installation, migration, nouveau conteneur ou déploiement.

## Périmètre et douze traductions

Lot de douze clés prioritaires, pas traduction complète des évaluations/certificats. Une seule source applicative modifiée : **ProfileEvaluationSchedule.vue**, expression du titre d’événement. Trois fichiers de tests existants étendus : profileEvaluationSchedule.test.ts, ProfileEvaluator.test.ts et bulkCertificatesForm.test.ts. Aucun changement de permissions, API, calcul horaire, réservation ou génération.

| Clé source exacte | Valeur française livrée |
| --- | --- |
| Could not load evaluations | Impossible de charger les évaluations |
| No evaluations yet | Aucune évaluation pour le moment |
| Evaluations students book with you will show up here. | Les évaluations réservées auprès de vous apparaîtront ici. |
| Evaluations students book with this evaluator will show up here. | Les évaluations réservées auprès de cet évaluateur apparaîtront ici. |
| Evaluation of {0} | Évaluation de {0} |
| Availability | Disponibilités |
| Time off | Indisponibilités |
| No hours yet | Aucun créneau défini pour le moment |
| Could not load hours | Impossible de charger les horaires |
| Add slot | Ajouter un créneau |
| Generate Certificates | Générer des certificats |
| Enabling this will publish the certificate on the certified participants page. | Cette option publie le certificat sur la page des participants certifiés. |

**Douze valeurs nouvelles : onze entrées vides renseignées, une entrée ajoutée. Zéro traduction antérieure corrigée ou supprimée.** Les usages partagés ont été vérifiés : Generate Certificates est aussi le menu d’ouverture de BatchDetail, avec le même sens ; les deux descriptions d’état vide sont propres au profil personnel/tiers et ne sont pas fusionnées. Availability/Time off sont des libellés d’interface, pas des valeurs stockées. Retry, Evaluator, Published et Expiry Date sont réutilisés, non retraduits.

Issue Date conserve la traduction globale existante « Date d’Émission » (apostrophe droite dans le PO), à revoir avec ses autres usages avant de préférer « Date de délivrance ». Previous conserve « Précedent », faute préexistante hors douze clés. Ne pas annoncer ces deux termes corrigés.

## Titre dynamique et paramètres

L’ancienne expression `${d.member_name}'s Evaluation` était affichée par le calendrier et le détail Event sans gettext. Elle devient **__('Evaluation of {0}').format(d.member_name)**. Le titre anglais de secours est Evaluation of Fictional Learner ; le français est Évaluation de Fictional Learner. Le nom reste une donnée, sans traduction, concaténation française ou insertion HTML ajoutée.

Test avec nom contenant littéralement `{1}` et `<Learner>` : substitution de {0} exacte, nom conservé. Les champs member/participant, id, course, dates, fromTime/toTime, lieu et couleur restent identiques. Filtres evaluator/status != Cancelled, limite 500, cache, Calendar config, boutons Previous/Next et retry inchangés. Comparaison de source/template après normalisation de la seule expression : identique à l’octet. Un changement de langue s’applique au nouveau chargement des événements ; aucun nouveau basculement instantané de titres déjà transformés n’est ajouté.

## Sens des opérations et publication

- Une disponibilité ouvre des plages potentielles ; ce n’est pas une réservation. Les horaires et indisponibilités fictifs utilisés ne sont jamais sauvegardés par la recette navigateur. La validation d’un horaire incohérent reste la fonction rangeErrors existante.
- Une LMS Certificate Request représente une demande/réservation et non une réussite. Son affichage calendrier ne crée ni résultat ni certificat. Les états d’évaluation ne sont pas renommés ou fusionnés.
- L’achat d’une option certificat, la réservation, le résultat, la délivrance et la publication sont distincts. Aucun message ne promet un certificat obtenu à partir d’un paiement ou d’une simple réservation.
- BulkCertificatesForm envoie issue_date, expiry_date, template, evaluator, published, course et batch inchangés. **Published publie sur la page des participants certifiés** ; sa description ne promet ni PDF, envoi, validation d’évaluation ou encaissement. Le propriétaire peut lire son certificat avant publication, et certains personnels ont aussi un accès de lecture : unpublished ne signifie pas inaccessible à tous.
- generate_batch_certificates vérifie la lecture de la session puis insère sous les permissions du demandeur ; erreurs individuelles retournées et savepoint par membre. Le formulaire conserve ses refus read-only/non-admin/certification désactivée/aucun inscrit et n’annonce le succès qu’en l’absence d’erreurs. Aucun algorithme, modèle ni destinataire modifié. L’insertion réelle pourrait déclencher l’email du contrôleur LMSCertificate : **elle n’est jamais exécutée ici**.

## Permissions : code et simulations, pas certification globale

Sources métier examinées en lecture seule, byte-identiques à la base : api.py, permissions.py, hooks.py, contrôleurs LMS Certificate/Request/Evaluation, ProfileEvaluator, BulkCertificatesForm et evaluatorAvailability (neuf fichiers).

| Opération | Contrôle natif observé, inchangé |
| --- | --- |
| Voir les disponibilités | enforce_evaluator_access : rôle requis et propriétaire, ou Moderator consultant un évaluateur ; cible Batch Evaluator requise |
| Écrire les disponibilités | get_owned_evaluator_doc : propriétaire uniquement, y compris pour Moderator ; save_evaluator_availability ne prend pas une autre cible libre |
| Voir les onglets de profil | Profil Batch Evaluator ; propriétaire évaluateur ou Moderator, redirection About sinon |
| Enregistrer un résultat | Batch Evaluator/Moderator ; can_evaluate par affectation cours/session ou demande active non annulée, exception modérateur ; hooks génériques distincts |
| Écrire un certificat | save_certificate_details et hook has_permission : rôles/affectations/auteurs, données stockées pour empêcher un déplacement hors périmètre ; Moderator/administrateur disposent d’exceptions |
| Générer pour une session | Garde UX plus large is_moderator/is_evaluator/can_manage ; lecture LMS Batch et permissions LMS Certificate serveur restent indispensables |

**Réserve d’autorisation préexistante :** has_permission de LMS Certificate accorde la lecture/sélection/impression à Course Creator et Batch Evaluator, et le filtre de liste ne les limite pas aux seuls certificats affectés. La portée de lecture est plus large que la portée d’écriture. Ne pas annoncer qu’un évaluateur ne peut lire que « ses » certificats ; un durcissement de cette politique demande un chantier distinct. Les évaluations ont leurs propres hooks de lecture/propriétaire et ne se déduisent pas de cette règle certificat. Aucun rôle ni DocPerm réel modifié.

**Douze contrôles de helpers Python extraits en AST avec collaborateurs en mémoire réussis**, sans import Frappe/site/DB : disponibilité du propriétaire, refus d’un autre évaluateur, revue modérateur, affectation/demande active/non-affectation pour can_evaluate, certificat de session affectée et membre inscrit, deux refus hors périmètre, apprenant refusé sur un autre certificat non publié/écriture, et constat explicite de la lecture étendue du personnel. Ce ne sont pas douze tests d’intégration d’endpoints. Les tests Vue existants de profil/refus/read-only et le formulaire avec backend refusé simulé complètent cette preuve limitée. Aucune autorisation effective de production certifiée.

## Catalogues et chargement

- **POT 3 012 → 3 013** : un ajout **Evaluation of {0}**, flag natif python-brace-format, référence ProfileEvaluationSchedule.vue:121. Aucune suppression, aucun déplacement de référence commune ; seules dates natives d’en-tête changent en plus.
- **PO 2 827 → 2 828 entrées, 908 → 920 traductions renseignées**. Douze blocs seulement, toutes les 908 valeurs anciennes, autres blocs et en-tête préservés par Babel contrôlé. Paramètres {0}, contextes et flags conservés ; aucune modification des 78 autres PO ou du Framework.
- Extraction native `bench generate-pot-file --app lms` ; aucun POT modifié manuellement, update-po-files, helper de publication ou Crowdin.
- Babel PO/POT valide. `bench compile-po-to-mo --app lms --locale fr`, puis cache du seul site learning.localhost via frappe.translate.clear_cache : réussis. Les douze valeurs concordent PO/MO/dictionnaire français réellement chargé. Le site, les préférences FR/EN et l’anglais source/secours ne sont pas modifiés.

## Tests exécutés et échecs conservés

**171 tests Vue / sept fichiers réussis dans une même exécution finale, 19,81 s.** Sélection : profileEvaluationSchedule, ProfileEvaluator, profileEvaluatorTabs, evaluatorAvailability, evaluationSlotPicker, upcomingEvaluationsNotice, bulkCertificatesForm. **Seize cas ajoutés**, 155 existants.

Nouveaux cas : états vides personnels/tiers FR/EN, erreur et Retry, titre paramétré et données d’événement, noms accessibles existants Previous/Next ; disponibilités/ajout local/indisponibilités/erreur de chargement/état vide ; titre et description Published, payload exact et publication locale true→false sans soumission, génération et refus entièrement fictifs. La confirmation de génération encore non traduite est testée comme **repli anglais**, pas comme une valeur française livrée. Helper du vrai PO et plugin Vue natif, aucun dictionnaire parallèle.

Premier passage : **169 réussis / deux échecs**. Un sélecteur de test supposait Monday dans le nom accessible alors que le traducteur rend Lundi ; le nouveau test utilise le texte rendu du bouton dans la ligne Monday. L’autre supposait Précédent, mais la valeur existante est Précedent : assertion sur le catalogue réellement livré, faute laissée documentée. Aucune valeur PO hors lot ou logique applicative changée pour ces échecs. Sélection complète finale 171/171, pas une déduction à partir d’une relance isolée. Le cas événement anglais existant est adapté au nouveau titre source attendu.

Douze contrôles Python AST en mémoire et neuf sources métier comparées : réussis. Pas de suite backend transactionnelle ni de base de test à installer ; tests security existants non rejoués, aucune source Python modifiée. Nouvelle extraction native et validation de la clé paramétrée suffisent au mapping inchangé ; suite d’extraction globale non répétée.

Build frontend nécessaire : **17,61 s** application, **1,64 s** signup, commande **21,73 s**, réussi. Déclaration components.d.ts générée restaurée, MO/assets ignorés. Prettier des quatre fichiers frontend, diff, invariants, paramètres, Babel, empreintes et recherche ciblée secrets réussis. Avertissements Vite/Browserslist/fs historiques conservés ; hooks désactivés après contrôles explicites, pre-commit complet historiquement bloqué non relancé. Aucune suite globale lancée.

## Chromium FR/EN ordinateur/mobile

**Quatre parcours aboutis** sur la navigation native : /user/fictional-settings/schedule et /slots, profil tiers fictif, /batches/FR03B8-FAKE/certificates. Ces profils/formulaires sont disponibles sur mobile ; c’est différent des paramètres d’administration absents dans les lots précédents. Aucune nouvelle route ou interface mobile créée.

Dans chaque variante : événement et titre français/anglais, chargement refusé 403 simulé sur contexte navigateur neuf, Retry vers état vide personnel, événement puis état vide tiers, disponibilités/indisponibilités, ajout local d’un créneau et horaire de fin invalide, calendriers Google connecté/déconnecté entièrement fictifs sans clic OAuth, titre et description de publication du formulaire, Published true→false local, génération fulfill local et confirmation. Captures fictives ordinateur/mobile contrôlées, sans refonte de mise en page.

**Quatre appels generate_batch_certificates entièrement simulés**, paramètres vérifiés et published=false ; **zéro appel de ce type transmis au serveur**. Aucune sauvegarde de disponibilité, réservation, annulation, résultat, certificat, PDF, email ou notification réelle. Refus d’autorisation d’écriture/génération en composants/helpers, pas une validation d’autorisations serveur réelles. Les états Google sont affichés, aucune connexion/déconnexion/renommage/invitation testée réellement.

Interceptions avant connexion et montage : tous profils, créneaux, calendriers, demandes, sessions, cours, certificats, utilisateurs et référentiels fictifs. Toute méthode inconnue/REST ou écriture non attendue bloquée ; seules auth des comptes de test, ping et traductions vers le site. get_evaluator_details est simulé, notamment parce que sa lecture native peut vérifier un jeton Google côté serveur ; aucune configuration réelle de compte Google consultée. La lecture Unsplash préchargée par le sélecteur de couverture et get_batch_courses sont aussi simulées, sans service externe appelé.

**Recette finale : quatre résultats, quatre générations simulées, zéro écriture sensible imprévue/transmise, 24 boot_config bloqués.** Le compteur sensitiveRequestsAttempted compte les écritures non attendues, pas les quatre fulfill autorisés. Quatre réponses 403 et **quatre pageerror PermissionError** correspondent exclusivement à scheduleMode=error volontairement déclenché ; sept HTTP400 socket.io conservés. Aucun autre pageerror final dans les parcours valides. L’erreur de chargement affichée est bien traduite et le réessai fonctionne malgré la promesse de chargement automatique rejetée. Ce chemin natif est inchangé ; la modification du titre ne s’exécute que dans transform après succès. **Ne pas déclarer le contrôle JavaScript global réussi**, ni ces rejets résolus.

Premiers harnais : lecture Unsplash inconnue bloquée (Failed to fetch), puis simulée ; erreur demandée après calendrier déjà chargé masquée par la préférence native aux événements en cache (comportement existant confirmé en test), d’où erreur testée désormais avant toute donnée en contexte neuf ; sélecteur input[type=time] invalide avec le TimePicker natif, puis saisie commit par Entrée nécessaire ; get_batch_courses bloqué causait quatre Failed to fetch, lecture ensuite simulée. Scripts corrigés seulement, preuves initiales conservées. Aucun nettoyage de cache du site pour ces essais ; aucune modification de Framework pour les faire passer.

## Limites et FR-03B.9

Francisation partielle voulue de douze clés. Restent : Generate, Certificates generated successfully, erreurs/refus détaillés, No hours set pour un tiers, descriptions d’aide d’horaires, Add slot for {0}/noms accessibles de créneaux encore mixtes, validations horaires, descriptions de calendrier Google. Les validations et confirmation de génération observées en FR restent en anglais : aucune traduction française prétendue. Issue Date/Previous à revoir dans un lot contextualisé, dates/jours/AM-PM/fuseaux restent I18N-01.

Génération serveur, contenus PDF/emails/notifications, OAuth et permissions effectives non testés. Lecture des certificats du personnel à examiner séparément, sans durcissement implicite. Les cas de read-only/non-affectation/backend refusé sont limités aux simulations et contrôles décrits, pas à toutes les combinaisons de rôles en navigateur.

Maintenir les réserves : toast mobile FR-03B.1 non confirmé, 16 rejets JS historiques et contrôle global non validé, double clic paiement, transactions réelles non testées, avertissements de suppression non exhaustifs, certains écrans d’administration absents sur mobile, association accessible de durée FR-03B.6 manquante, administration FR-03B.7 incomplète. Aucun de ces problèmes déclaré résolu.

À proposer pour FR-03B.9, sur accord uniquement : catalogue CertifiedParticipants (hors administration), clés résiduelles des évaluateurs/certificats, revue de la portée de lecture et erreurs de chargement ; ne pas démarrer automatiquement. Aucun renommage, PR, Crowdin, production OMV ou develop modifié.

## Livraison et reprise

Huit fichiers : ProfileEvaluationSchedule.vue ; trois tests étendus ; fr.po/main.pot ; ce rapport ; CODEX_HANDOFF.md. Commit sources/tests **3844585e** ; second commit catalogues/rapport/handoff à relever avec git log -1. Deux commits locaux, **aucun push FR-03B.8**. Checkout propre après livraison attendue, aucune modification non enregistrée.

Preuves hors dépôt `/workspace/work/fr03b8/` : snapshots/empreintes, initial/plan/summary, génération/Babel/compilation/check, Vue initial/final, build, invariants, static-contracts/permissions, scripts browser et traces successives, captures fictives. Ne pas publier les identifiants de test/cookies, MO/assets ou journaux privés. Prochaine opération : revue et accord explicite avant publication des deux commits ; aucun FR-03B.9.
