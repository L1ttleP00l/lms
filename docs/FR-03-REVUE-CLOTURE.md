# FR-03 — Revue préparatoire à la clôture

31 octobre 2026, Europe/Paris. **Proposition de revue, pas attestation de clôture.** FR-03 n’est pas définitivement clôturé. FR-04 et I18N-01 ne sont pas démarrés.

## 1. Base Git, publication et méthode

Base distante vérifiée : **fb684be0f5c4f4d18fe6dd1d49260f6942a4c5f7**, branche littlepool-dev, dépôt L1ttleP00l/lms. Publication autorisée des commits **9fe29fbca7fdf54094782c41704ce99b85b1b68b** puis **fb684be0f5c4f4d18fe6dd1d49260f6942a4c5f7**, depuis f559542d ; push normal, sans force. Dix-neuf fichiers relus, parentés et checkout propre vérifiés. Rapport FR-03B9 récupéré sur GitHub au SHA et comparé à l’octet. Les neuf fins de lot ci-dessous sont des ancêtres de cette branche publiée. develop reste **6b791f33b34efa15566a0cb707f5be59d136df50** ; Framework propre à **959b85de4086656273e1d158f41923dd3808c350**.

Prépublication : 951 valeurs françaises et 3 019 clés POT réellement relues avec Babel ; neuf ajouts/trois retraits B.9 confirmés, 920 valeurs précédentes préservées, Assignments reste Affectations et Course assignments vaut Devoirs. Preuves 115 Vue/compilation/build/quatre Chromium limitées relues, zéro écriture sensible transmise, réserves avis/légendes/JS/a11y/permissions conservées. Aucun test applicatif relancé pour publier.

Documents consultés : AGENTS, CODEX_HANDOFF, ROADMAP, PLAN_FRANCISATION, GLOSSAIRE_FR, audit FR-03A et neuf rapports FR-03B.1–9. Références de maintenance gettext/Crowdin rapprochées des études FR-01C/E et du mapping existant. Les rapports et traces ne remplacent pas une nouvelle recette fonctionnelle : la revue réutilise leurs résultats avec leurs limites.

**Contrôles exécutés pendant cette revue :** lecture Babel des dix états Git de PO/POT (avant B.1 et fin de chaque lot), différences de clés/valeurs/flags, lecture ciblée des catalogues LMS/Framework pour les omissions, vérification des journaux finaux disponibles, parentés Git, empreintes et diff documentaire. Aucune génération POT, compilation MO, cache, build, suite Vue/Python applicative, navigateur, DB, migration, modification de compte ou transaction. Un script de lecture ne constitue pas un test d’interface.

## 2. Bilan quantitatif vérifié dans Git

Chaque nombre ci-dessous est recalculé depuis les objets Git des commits, pas seulement recopié des rapports. « Ajout FR » désigne une clé vide/absente devenue renseignée ; « correction » une valeur déjà renseignée modifiée. Les entrées sont distinguées par msgid et contexte, en excluant l’en-tête.

| Lot | Domaine | Ajouts FR | Corrections | FR final | POT ajouts/retraits/net | POT final | Fin de lot |
| --- | --- | ---: | ---: | ---: | --- | ---: | --- |
| B.1 | Membres et rôles | 32 | 0 | 719 | +4 / −0 = 4 | 3001 | `b223c367` |
| B.2 | Sélection des inscriptions multiples | 21 | 0 | 740 | +4 / −0 = 4 | 3005 | `7b197f60` |
| B.3 | Paiements du personnel | 49 | 0 | 789 | +3 / −2 = 1 | 3006 | `224c78f9` |
| B.4 | Cours et publication | 57 | 0 | 846 | +1 / −0 = 1 | 3007 | `be7f1e4b` |
| B.5 | Sessions de formation | 47 | 3 | 893 | +6 / −3 = 3 | 3010 | `866b742c` |
| B.6 | Paramètres usuels (pilote) | 3 | 0 | 896 | +3 / −0 = 3 | 3013 | `c040d188` |
| B.7 | Transactions | 12 | 0 | 908 | +2 / −3 = -1 | 3012 | `14537592` |
| B.8 | Évaluateurs et certificats | 12 | 0 | 920 | +1 / −0 = 1 | 3013 | `f559542d` |
| B.9 | Accueil, statistiques et modération | 31 | 0 | 951 | +9 / −3 = 6 | 3019 | `fb684be0` |

Point initial **736b1523** : **687 traductions renseignées**, 2 721 entrées PO, 2 997 clés POT. État final : **951 traductions renseignées**, **2 837 entrées PO**, **3 019 clés POT**. Somme des ajouts = **264**, gain net = **264**, aucune valeur renseignée perdue. Trois corrections B.5 : **Batches, Batch Details, Batch Start Date**, distinctes du gain net. Aucun fuzzy constaté dans ces dix états.

POT sur les neuf lots : **33 ajouts et 11 retraits**, soit **+22 nets**, 2 997 → 3 019. Aucun écart chiffré constaté entre cette reconstruction, les rapports et le catalogue courant. Les trois retraits B.9 sont Active Members, Course Completions et Get Certified ; remplacés par des clés contextualisées et conservés dans l’historique PO. Le seul delta net ne suffisait pas à les décrire.

Les 38 autres PO LMS sont identiques à l’octet entre avant B.1 et l’état courant. Les 40 PO Framework sont conformes aux empreintes conservées et le checkout Framework est inchangé ; ensemble des **78 autres PO** préservé. Le PO français LMS et le POT sont intègres à la base de la revue. L’anomalie historique Babel du PO Framework « Use % for any non empty value. » reste une réserve externe à LMS, sans nouveau contrôle complet ni correction Framework ici.

**Aucun pourcentage de francisation d’interface n’est calculé.** Les 951 valeurs ne couvrent pas toutes les clés du POT, les entrées historiques PO et le POT n’ont pas le même périmètre, Framework fournit d’autres traductions et les chaînes réellement affichées varient selon les écrans. Les contenus pédagogiques et données des utilisateurs sont distincts.

### Sources, tests réellement réussis et couverture par lot

Exécutions ciblées historiques relues, **pas relancées**, ni à additionner comme tests uniques : fichiers/cas communs entre lots.

| Lot | Modifications principales | Exécution finale réussie | Navigateur disponible | Réserve majeure |
| --- | --- | --- | --- | --- |
| B.1 | Members/SettingsList, deux formulaires et libellés de rôle contextualisés | 81 Vue / 6 fichiers ; Babel/MO/dictionnaire/build | 4 lectures FR/EN ordinateur/mobile ; sauvegarde FR ordinateur partielle simulée | Toast création FR mobile expiré ; sauvegarde navigateur pas entièrement validée |
| B.2 | Trois appels Vue reformulés en __().format, variante singulière et sélection | 268 Vue / 6 ; 5 méthodes extraction Python ; build/catalogues | 4 parcours FR/EN ordinateur/mobile, recherches fictives, plafond 50/51, sans inscription finale | Parcours sessions/aperçu payant non rejoués en navigateur |
| B.3 | Phrase de paiement fidèle à un enregistrement, deux libellés d’adresse | 238 Vue / 4 ; 5 extraction et 7 sous-cas de permission avec collaborateurs fictifs | 4 parcours FR/EN ordinateur/mobile, 4 inscriptions entièrement fulfill local | Sessions et transactions bancaires non validées ; résultat partiel simulé |
| B.4 | Cours/formulaire/publication et compteur Enrolled learners local | 42 Vue / 5 ; build/catalogues | 4 parcours principaux puis 4 lectures du libellé final, FR/EN ordinateur/mobile | Erreurs de sauvegarde surtout en composants ; avertissement destructif non exhaustif |
| B.5 | Sessions/formulaires/suivi ; Modalité et Compteurs contextualisés | 57 Vue / 10 ; build/catalogues | 4 parcours principaux puis 4 lectures/sélections fictives de formateurs | Affectations/publications/autosaves simulés ; permissions backend effectives non certifiées |
| B.6 | Module anglais N_ feuille et mapping Babel exact, schémas inchangés au rendu | 86 Vue / 6 ; 7 extraction ; build/catalogues | 2 rendus ordinateur FR/EN ; 2 constats d’absence de paramètres admin mobile | Description numérique visible mais sans association aria-describedby |
| B.7 | Received/Not received, Other payments, badge option certificat | 105 Vue / 7 ; build/catalogues | 2 parcours ordinateur FR/EN avec 2 mises à jour fulfill, lectures complémentaires ; absence admin mobile constatée | États vides/formulaire/erreurs encore anglais ; pas d’encaissement |
| B.8 | Titre Evaluation of {0}, disponibilités et description Published | 171 Vue / 7 ; 12 contrôles Python AST en mémoire ; build/catalogues | 4 parcours FR/EN ordinateur/mobile ; 4 générations entièrement fulfill | 4 rejets JS du chargement refusé simulé ; lecture des certificats plus large que l’affectation |
| B.9 | Statistiques/contextes, navigation Devoirs, annuaire 1/pluriel, textes d’accueil/réponses | 115 Vue / 7 ; compteurs en AST avec db.count fictif ; build/catalogues | 4 parcours retenus FR/EN ordinateur/mobile : accueil/statistiques/annuaire/discussions | Avis navigateur non validés, légendes de données anglaises ; aucun nouveau workflow |

Les journaux comprennent aussi des passages intermédiaires échoués : stubs incomplets, sélecteurs supposés anglais, catalogue lu avant modification, attentes de parcours non abouties. Ils ne sont pas supprimés du bilan. Les nombres du tableau correspondent aux sélections finales complètes de chaque lot ; une relance isolée n’est pas utilisée pour certifier toute une suite. Les phases B.4/B.5/B.7 possèdent des contrôles supplémentaires après une retouche de texte : distinguer ces lectures du rejeu intégral des parcours précédents. Pre-commit complet historiquement bloqué n’est pas déclaré réussi ; contrôles explicites et désactivation des hooks documentés dans les lots.

## 3. Bilan qualitatif par domaine

Le statut concerne **les preuves linguistiques disponibles**, pas une validation métier, bancaire ou de sécurité intégrale.

| Domaine | Statut de revue | Preuve et limite |
| --- | --- | --- |
| Membres et rôles | Partiellement validé | Rôles/libellés FR/EN et contrats exacts testés ; lectures navigateur réussies, toast/sauvegarde mobile non confirmés |
| Formateurs et évaluateurs | Partiellement validé | Affectations et garde du propriétaire simulées, disponibilités et calendrier affichés ; nombreux messages résiduels et aucune intégration Google réelle |
| Cours et sessions | Validé dans le périmètre testé | Formulaires/principaux libellés/publication fictive/compteurs ciblés FR/EN ; ne couvre ni tout l’éditeur ni les suppressions effectives |
| Inscriptions | Validé dans le périmètre testé | Sélection/places/retour partiel et contrats simulés ; pas de vraie inscription ni couverture navigateur de toutes les sessions payantes |
| Paiements administratifs | Partiellement validé | Enregistrement ≠ encaissement, filtres et statuts clairs ; champs/erreurs restants, transactions réelles non validées |
| Paramètres | Partiellement validé | Trois clés seulement ; extraction/chargement validés, autres données statiques manquantes, admin mobile absent et association accessible défaillante |
| Certificats | Partiellement validé | Option/réservation/résultat/génération/publication distingués ; générations simulées, PDF/emails hors périmètre et lecture du personnel à arbitrer |
| Accueil et compteurs ciblés | Validé dans le périmètre testé | 0/1/3 selon rôles fictifs, nombres connus et cartes FR/EN ; légendes de l’anneau non localisées, formats I18N exclus |
| Navigation ciblée | Validé dans le périmètre testé | Devoirs local, route/clé/groupe inchangés, Assignments global préservé ; autres libellés de navigation non exhaustivement revus |
| Avis et discussions | Partiellement validé | Composants/contrats/refus simulés et affichage des discussions ; avis non rendus dans la fixture navigateur, cause inconnue |
| Modération existante de bout en bout | Non validé | Inventaire de code et contrôles UI seulement ; aucune suppression réelle, Custom DocPerm effectives non interrogées |
| Nouveaux workflows de modération | Hors périmètre | Non confirmés dans les fichiers étudiés ; aucune implémentation ou permission ajoutée |
| PDF/courriels/notifications, intégrations réelles | Hors périmètre | FR-04/recettes d’intégration à autoriser, pas de preuve de rendu ou d’envoi réel dans FR-03 |

## 4. Matrice FR/EN et limites de couverture

| Surface | FR ordinateur | EN ordinateur | FR mobile | EN mobile | Nature de la preuve |
| --- | --- | --- | --- | --- | --- |
| Membres/rôles | Affichage oui ; sauvegarde simulée partielle | Affichage oui ; sauvegarde complète non démontrée | Affichage oui ; toast création non confirmé | Affichage oui ; sauvegarde complète non démontrée | Lecture réussie ≠ sauvegarde certifiée |
| Sélection d’inscriptions | Oui | Oui | Oui | Oui | Cours fictifs, aucun insert final réel ; sessions en composants |
| Paiement du personnel | Oui, simulé | Oui, simulé | Oui, simulé | Oui, simulé | Pas de capture ni rapprochement bancaire |
| Cours et sessions ciblés | Oui, simulé | Oui, simulé | Oui, simulé | Oui, simulé | Principal + lectures complémentaires selon version du texte |
| Paramètres admin B.6 | 3 clés rendues | 3 clés rendues | Panneau natif absent | Panneau natif absent | Ne pas compter quatre rendus réussis |
| Transactions B.7 | Oui, simulé | Oui, simulé | Panneau natif absent | Panneau natif absent | Filtres/recherche/dialogue ; formulaires/erreurs partiels |
| Évaluations et formulaire certificats B.8 | Oui, simulé | Oui, simulé | Oui, simulé | Oui, simulé | Ces surfaces mobiles existent, contrairement à Settings |
| Accueil/statistiques/annuaire/discussions B.9 | Oui dans le scénario retenu | Oui dans le scénario retenu | Oui dans le scénario retenu | Oui dans le scénario retenu | Autres rôles accueil en composants ; aucun backend sensible appelé |
| Avis B.9 | Non validé | Non validé | Non validé | Non validé | Deux attentes sur fixture minimale non abouties, segment exclu des recettes finales |

Rendu, interaction locale, écriture fulfill et fonctionnement serveur sont quatre niveaux distincts. Authentification des comptes fictifs et lectures de traduction autorisées n’attestent pas l’exécution des permissions des endpoints simulés. Aucun test réel de paiement, rôle, certificat, réservation, email ou PDF dans ces lots.

## 5. Inventaire classé des omissions connues

Contrôle ciblé des catalogues au SHA de base, sans modification. Catégories : **T1** absence de valeur française (distinguer entrée vide et entrée absente) ; **T2** clé réellement absente du POT ; **T3** traduction présente incorrecte/à contextualiser ; **T4** affichage/chargement/couverture ; **T5** formats/langue I18N-01 ; **T6** contenus FR-04. Ce n’est pas un inventaire exhaustif des 3 019 clés.

| Cas / clé exacte | Constat vérifié | Classe / suite |
| --- | --- | --- |
| Completed ; In Progress | POT et PO présents : Terminé / En Cours, également dans Framework ; légendes encore anglaises dans B.9 | **T4**, traduction non appliquée aux données de catégorie ; remplir le PO ou recompiler seul ne résout pas le rendu |
| New Transaction ; Fill in every required field ; No results | POT et entrée PO présents, msgstr vide ; aucune valeur Framework utile dans le catalogue lu | **T1**, compléter le lot transaction ; ne pas prétendre avoir mesuré toutes les surcharges éventuelles du site |
| No {0} match {1} ; No {0} match this filter | POT/PO présents, FR vide | **T1**, conserver paramètres et sens de la recherche/filtre |
| Paid For ; Payment ID ; Order ID ; Payment for Certificate ; Member Consent | POT/PO présents, FR vide | **T1**, champs de transaction encore anglais ; certificat ≠ option délivrée |
| The user this payment is recorded against. | POT/PO présents, FR vide | **T1**, descriptions secondaires, pas d’API à changer |
| Generate ; Certificates generated successfully ; Availability saved ; No hours set | POT/PO présents, FR vide | **T1**, actions/succès/état tiers non livrés dans B.8 |
| Add slot for {0} ; {0} start time ; {0} end time | POT/PO présents, FR vide | **T1**, noms accessibles encore partiellement anglais ; paramètres/jour à conserver |
| Set both a start and an end time. ; End time must be after the start time. | POT présents, **entrées absentes du PO LMS**, pas simplement vides ; pas de valeur Framework relevée | **T1**, importer les entrées puis traduire/valider, pas une nouvelle extraction à priori |
| Connected ; Not connected | POT/PO présents, FR vide | **T1**, Google Calendar à contextualiser, toujours sans OAuth réel pendant traduction |
| Lesson Completion Time (seconds) ; Enforce completion | Présents comme valeurs du schéma Settings ; absents du POT et du PO LMS | **T2**, étendre proprement la découverte statique autorisée, sans doubler la traduction enfant |
| A lesson is marked complete only once the selected items are done. | Description exacte de settings.ts, absente du POT/PO | **T2**, description hors pilote de trois clés B.6 |
| Assignments dans les options Enforce completion | Valeur statique pédagogique dans settings.ts ; traduction globale Affectations présente dans LMS/Framework | **T3**, contexte encore à adapter localement ; Devoirs de B.9 ne corrigeait que la navigation, pas tous les schémas |
| Previous | Précedent dans LMS et Framework | **T3**, accent à corriger dans le bon circuit ; le fait que le test reflète le PO ne valide pas l’orthographe |
| Issue Date | Date d’Émission dans LMS ; proposition Date de délivrance à confronter aux autres usages | **T3**, ambiguïté terminologique à relire, pas erreur globale démontrée |
| {0} Assignments | POT/PO présents, FR vide | **T1**, compteur distinct de la navigation Devoirs, accord à vérifier |
| Avis non affichés avec fixture B.9 | Aperçu présent, zone/get_reviews non atteints ; CourseReviews/ReviewModal réussis en composants | **T4**, limite de recette, **pas une traduction absente démontrée** et pas une régression attribuée sans diagnostic |
| Description de durée sans aria-describedby | Texte visible/chargé, nom de champ présent ; association programmatique absente | **T4**, défaut structurel d’accessibilité, pas manque de PO |
| Joined …, fromNow(), mois/jours, AM/PM, nombres/fuseaux | Textes directs et formats restant partiellement anglais, signalés dans FR-03A et recettes | **T5**, I18N-01 ; ne pas changer les heures stockées pour franciser |
| Sujets/corps d’emails, invitations/rappels, Print Format et PDF | Pas de validation FR-03 de ces contenus ou envois | **T6**, FR-04 ; distinction de l’interface de certificat déjà traitée |

Une entrée vide/absente de fr.po LMS ne prouve pas à elle seule que l’interface restera anglaise : Framework et surcharges natives peuvent compléter le runtime. Les valeurs de cette table sont statiques ; les affirmations de rendu viennent des seules recettes citées. Noms/titres/texte des cours, réponses et avis créés par l’utilisateur ne doivent pas être traduits automatiquement.

## 6. Réserves et priorités motivées

**P0** = blocage démontré empêchant d’accepter la livraison autorisée ; **P1** = vérification/correction prioritaire avant élargissement ou validation sensible ; **P2** = amélioration ou couverture complémentaire planifiée. Aucun élément revu ne démontre ici une nouvelle anomalie urgente P0 ; cela n’est pas une certification de sécurité. Les priorités ne sont pas des scores d’exploitation et une absence de test n’est pas une faille démontrée.

| Sujet | Nature | Priorité proposée | Justification et action ultérieure à autoriser |
| --- | --- | --- | --- |
| Toast création mobile B.1 et avis B.9 | Couverture incomplète, cause non confirmée | P1 | Deux points prioritaires sans preuve navigateur complète ; reproduire sur fixtures fiables, pas relancer toute la suite |
| Portée de lecture des certificats par le personnel | Comportement d’autorisation confirmé dans le code, politique à arbitrer | P1 | Read/select/print plus large que l’affectation ; vérifier l’intention et les DocPerm effectives, sans conclure à une fuite exploitée |
| Permissions de production non testées | Limite de portée | P1 avant mise en service | Un mock ne valide pas les contrôles réels ; audit sur environnement isolé à définir, aucune action production autorisée |
| Association accessible de la durée | Anomalie d’accessibilité confirmée | P1 | Description visible mais non associée ; corriger le renderer et tester les aides techniques dans un lot distinct |
| Paramètres pédagogiques Affectations / clés de schéma non extraites | Défaut de contexte/découverte linguistique | P1 | Risque de compréhension d’une règle d’achèvement ; petit lot ciblé avant extension du pilote |
| Double clic paiement historique | Risque fonctionnel non traité dans FR-03 | P1 avant parcours financier réel | Reproduire le parcours concerné, stratégie de non-duplication séparée ; ne pas généraliser la garde runSave d’un formulaire à tous les paiements |
| Avertissements destructifs non exhaustifs | Défaut de formulation sensible confirmé contre les cascades | P1 avant usage destructif | Texte ne liste pas toutes les conséquences ; ne pas effacer des données pour vérifier une traduction |
| Encaissements/transactions réelles non testés | Exclusion de recette financière | P1 avant ouverture financière | Pas bloquant à lui seul pour une traduction acceptée comme simulée ; recette prestataire/test dédiée à autoriser |
| Rejets JS historiques et quatre refus B.8 | Fiabilité/gestion d’erreur, global non validé | P1 pour diagnostic borné | Distinguer erreurs attendues de validation/refus et exceptions de parcours valides ; zéro erreur B.9 ne clôt pas ce diagnostic |
| Légendes, boutons/messages administratifs et noms accessibles restants | Résidu linguistique/affichage | P1 sur chemins fréquents, P2 ailleurs | Classes T1/T4 distinctes ; ne pas réimporter aveuglément un catalogue pour régler le rendu |
| Dates/heures/fuseaux non finalisés | Localisation T5 | P1 sur rendez-vous, P2 pour présentation secondaire | Vérifier lisibilité et conventions sans présumer un décalage de données ; I18N-01 séparé |
| Panneaux Settings/transactions absents sur mobile | Capacité UI non fournie | P2 | Constat natif, pas régression de traduction ; éventuel produit mobile à cadrer |
| Signalements/approbation/sanctions non confirmés | Fonction produit non validée | P2 | Inventaire seulement ; ni manque de traduction ni autorisation de construire un workflow |
| Orthographe Previous et style Issue Date | Qualité linguistique | P2 | Correction/contextualisation à revoir avec usages partagés et circuit de traduction |

## 7. Modération : consolidation FR-03A / B.9

| Fonction | Frontend confirmé | Backend / limite de preuve |
| --- | --- | --- |
| Consulter sujets/réponses | Discussions / DiscussionReplies pour leçon ou session | can_access_topic et accès de référence ; endpoints simulés, autorisations effectives non certifiées |
| Créer un sujet et sa première réponse | DiscussionModal, hors lecture seule selon écran | Insert Topic puis Reply, DocPerm/validation et notifications possibles ; jamais exécuté réellement |
| Publier une réponse | Éditeur/Post et refus de vide | validate_discussion_reply sur référence cours/session, droits Frappe ensuite ; pas de publication réelle |
| Éditer/supprimer une réponse | Menu auteur, hors lecture seule ; pas de menu universel Moderator confirmé | Patch give_discussions_permission prévoit Moderator sans if_owner, autres rôles LMS avec if_owner ; patch ≠ état effectif du site |
| Supprimer une réponse | Appel direct dans le menu auteur, pas de confirmation dans ce handler | Generic delete et permissions serveur ; aucun retrait testé réellement |
| Rédiger un avis | Selon inscription et absence d’avis existant ; ReviewModal | Inscription de l’owner, unicité cours/owner, normalisation du texte et hook course_record_has_permission |
| Retirer/modérer un avis | Pas de bouton dédié confirmé dans CourseReviews examiné | Droits possibles de DocPerm/hook ne prouvent pas une action UI ; aucun retrait |
| Publier/dépublier/supprimer cours/session | Actions étudiées B.4/B.5 | Contrôles propres à l’objet/auteur/modérateur, cascades et refus distincts ; seulement interactions simulées |

Non confirmés dans ces fichiers : signalement, file de validation, modération préalable, sanctions/suspension dédiée, workflow éditorial, historique métier de décisions, journal immuable et tableau de bord centralisé. Ne pas transformer l’absence de preuve locale en absence démontrée dans tout Frappe ou toute application installée. track_changes/owner/modified ne suffisent pas à prouver un journal immuable ou une traçabilité exhaustive des suppressions. Aucun système complet de modération certifié, aucun ajout dans cette revue.

## 8. Maintenance, gettext et Crowdin

- **Glossaire :** cohérence des termes Cours/Leçon/Devoirs/Session, Inscription/Compte, Formateur/Évaluateur ; maintenir les distinctions option/réservation/résultat/certificat/publication et enregistrement/capture bancaire. Le glossaire reste en partie une proposition historique : certaines décisions sont maintenant approuvées dans les lots, sans mise à jour générale de son statut. Ne pas appliquer toutes ses propositions comme des décisions acceptées.
- **État documentaire :** ROADMAP/PLAN_FRANCISATION datés du début de projet présentent encore FR-01B comme future et certaines phases comme non commencées. Ces mentions historiques sont dépassées par les commits/handoff/rapports. C’est un écart de statut documentaire, **pas un écart des métriques**. Prévoir une synchronisation éditoriale distincte, aucun de ces fichiers n’est modifié ici.
- **Extraction native :** conserver le mapping TS/exclusions et les corrections locales __().format des appels Vue omis par la forme multilignes. Les tests de régression couvrent ces formes, pas toute syntaxe future/TSX.
- **Module N_ B.6 :** règle exacte settingsText.ts → JavaScript Babel natif, avant la règle TS Frappe. Ce module ne résout aucune langue au chargement ; ses valeurs anglaises sont traduites par les renderers existants. N_ n’est pas reconnu partout par l’extracteur JS Frappe, et remplacer globalement cet extracteur par Babel ferait perdre des __. Conserver les tests de portée et ne pas étendre sans revue.
- **Contextes :** le plugin Vue courant ne fournit pas un msgctxt runtime général. Les clés anglaises contextualisées (Course assignments, Published certificates, Enrolled learners, etc.) évitent des remplacements globaux incorrects. Ne pas renommer routes, slugs, DocTypes, champs, valeurs Paid/Unpaid/Course ou rôles techniques pour franciser.
- **Historique :** neuf lots conservent les anciennes traductions et les autres langues, sans nettoyage global. Les nouveaux POT et anciens PO peuvent contenir des clés obsolètes conservées ; les comparer avant tout import, ne pas les supprimer pour améliorer un compteur.
- **Circuit :** les éditions françaises locales ont des dérogations explicites et bornées à AGENTS. Elles ne créent pas une double autorité durable. L’étude FR-01E propose PO versionnés/runtime Frappe et éventuel atelier Crowdin dédié, sous décision de gouvernance/droits/coûts ; aucune offre/condition actuelle revérifiée pendant cette revue.
- **Risque d’écrasement :** un export « seulement approuvé » ou un import amont peut vider/remplacer des valeurs héritées/locales non approuvées. Sauvegarder le PO exact et ses métriques, établir une comparaison base/amont/fork, réconcilier le glossaire et les clés contextualisées, faire approuver les conflits et contrôler placeholders/flags avant compilation. Un export approuvé n’est pas une preuve automatique de conservation des 951 valeurs.
- **Automatisation :** conserver les protections de publication amont et les destinations du fork. Aucun workflow, projet Crowdin, secret, dépendance ou Framework modifié. Autoriser explicitement un futur import/sync, ne pas utiliser le helper amont pour une génération locale.

## 9. Grille proposée pour décider la clôture

| Critère | État de revue | Motif |
| --- | --- | --- |
| 1. Livraison des neuf lots publiée | Satisfait | Tous les commits de fin de lot sont ancêtres du SHA distant confirmé fb684be0 |
| 2. Intégrité des catalogues | Satisfait avec réserve | LMS PO/POT valides, historique et 78 autres PO préservés ; anomalie Babel Framework historique externe non corrigée |
| 3. Absence de régression attribuable aux traductions | Satisfait avec réserve | Aucune régression attribuée dans les sélections et invariants examinés ; limites navigateur/JS empêchent une garantie globale |
| 4. Absence d’écriture sensible réelle dans les tests | Satisfait | Interceptions avant montage, fulfill et absence de transmission documentés ; pas certification d’autres campagnes inconnues |
| 5. Cohérence métier FR/EN | Satisfait avec réserve | Distinctions clés traitées ; paramètres/terminologie résiduels et formats à reprendre |
| 6. Couverture des écrans prioritaires | Satisfait avec réserve | Large couverture ciblée, avis et toast mobile incomplets, absence native de panneaux mobile |
| 7. Réserves de sécurité documentées | Satisfait | Politique de lecture des certificats et autorisations effectives clairement non certifiées ; risques non résolus |
| 8. Réserves d’accessibilité documentées | Satisfait | Association de durée absente et noms accessibles mixtes consignés ; pas une recette lecteur d’écran complète |
| 9. Travaux complémentaires identifiés | Satisfait | Classes T1–T6 et plan A/B/C ci-dessous, sans exécution implicite |
| 10. Accord explicite de clôture du responsable | Non satisfait à cette date | Autorisation présente limitée à publication B.9 et revue préparatoire ; décision réservée au responsable |

**Recommandation : validation complémentaire avant clôture.** Un contrôle borné du toast de création mobile et de la zone d’avis, avec fixtures fiables et écritures entièrement simulées, permettrait de lever deux incertitudes précises sans relancer tous les lots. Parallèlement, faire arbitrer la portée de lecture des certificats et accepter explicitement les exclusions de recette réelle/accessibilité. Si ces limites sont acceptées et les vérifications ciblées concluantes, une **clôture avec réserves** devient une décision raisonnable ; une clôture sans réserve ou une francisation intégrale n’est pas étayée.

Ce choix est une recommandation, pas une décision prise à la place du responsable. Un lot de traduction résiduelle peut être préféré avant clôture si les libellés des paramètres/transactions sont considérés comme un critère de sortie obligatoire. Ne pas imposer un encaissement réel pour valider une traduction, ni transformer cette revue en audit de sécurité global.

## 10. Plan d’action proposé, sans démarrage

| Catégorie | Proposition bornée | Preuve attendue après autorisation |
| --- | --- | --- |
| **A. Francisation résiduelle FR-03** | Textes fréquents transactions/certificats, noms accessibles et paramètres du schéma ; orthographe/contextes ; légendes comme problème de rendu distinct | Inventaire de clés réel, régression FR/EN, extraction si nécessaire, conservation des langues et données ; pas de cible artificielle de volume |
| **A. Validation complémentaire** | Fixtures fiables pour avis navigateur et toast membre mobile, en diagnostic court | Affichage/retour visibles FR/EN, interceptions préalables, zéro écriture métier réelle, limites restantes explicites |
| **B. Fonctionnel/sécurité/a11y** | Association de description, double clic paiement, avertissements destructifs, politique de lecture et DocPerm effectives, rejets JS | Autorisations et tests propres sur environnement isolé ; ne pas corriger en renommant des traductions |
| **B. Produit/modération/mobile** | Définir seulement si nécessaire le workflow de modération et les panneaux mobile manquants | Spécification et décision produit séparées, aucune capacité native inventée |
| **C. FR-04 prévu** | Courriels, notifications, invitations et certificats/PDF | Langue destinataire, variables/liens/accents, modèles et destinataires de test ; aucun envoi réel par déduction |
| **C. I18N-01 prévu** | Formats date/heure/nombre et étude/amélioration native des préférences | Préférence prioritaire/persistante et repli configurable ; ne pas réinventer le moteur. Les vérifications de langue déjà faites FR-01 ne signifient pas que cette phase d’amélioration a démarré |

Aucune date ou charge arbitraire fixée. Publication de cette revue, clôture définitive, nouveau correctif et lancement FR-04/I18N-01 requièrent chacun l’accord explicite correspondant.

## 11. Livraison documentaire et traçabilité

Seuls **docs/FR-03-REVUE-CLOTURE.md** et **CODEX_HANDOFF.md** modifiés. Un commit documentaire local ; SHA à relever avec git log -1. Aucun push de cette revue. État attendu après commit : checkout propre, un commit local d’avance sur fb684be0 ; develop/Framework/sources/PO/POT inchangés.

Preuves de lecture hors Git `/workspace/work/fr03-review/` : metrics.py/json/log (dix catalogues Git), omissions et contrôles de clés de schéma, empreintes des catalogues et rapport publié comparé. Les traces historiques `/workspace/work/fr03b1/` à `/workspace/work/fr03b9/` restent les preuves de tests, non réexécutées. Ne pas publier comptes, cookies, jetons, captures ou journaux sensibles.
