# FR-04B.3 — Rappel standard d’évaluation

31 octobre 2026 (Europe/Paris), littlepool-dev. Base publiée vérifiée **d90ab299eed0a8cf5d00e88beb40442e5f0bd34d**, checkout initial propre. LMS2.45.2, Framework17.0.0-dev à 959b85de inchangé. B.3 désigne désormais le lot du rappel ; les familles sessions/cours/PDF initialement proposées dans FR-04A ne sont pas commencées.

**Résultat : correction native validée sur les sources en mémoire, y compris les prévisualisations. Aucune Notification installée n’a été modifiée ou resynchronisée : le fonctionnement effectif de l’enregistrement déjà en base n’est pas déclaré validé.**

## 1. Références et conception préalable

AGENTS/handoff, audit A, rapports B.1/B.2 et glossaire consultés ; sources du rappel et de confirmation, harnais/tests, Notification, fonctions de langue/conversion et synchronisation de la version installée examinés. Dépendances réutilisées, aucune installation. Le contrat retenu par le responsable est **un message commun dans la langue du membre**, reçu aussi par l’évaluateur, sans langue individuelle ni changement de visibilité.

| Option                                 | Compatibilité, extraction et contexte                                                                                                                                                                                                                  | Personnalisation, doublons et maintenance                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Hook natif get_context              | Confirmé dans Notification.send/load_standard_properties et les deux previews. Prépare sujet/textes/horaires sous print_language(get_user_lang(member)), retourne des valeurs puis restaure le contexte. Les littéraux Python sont extraits nativement | Pas de surcharge globale, pas d’envoi ajouté. Email Template prioritaire conservé ; hook omis pour surcharge/non-standard. Petite adaptation locale à recontrôler aux mises à jour Framework |
| B. Gettext directement dans sujet JSON | Expression Jinja rendue nativement, mais JSON hors mapping d’extraction actuel. Un changement isolé ne choisit pas la langue du membre et ne localise pas les dates                                                                                    | Mapping ciblé possible mais inutile ici ; contexte global non restauré à éviter. L’ancrage Python de A résout l’extraction sans nouvel extracteur                                            |
| C. Notifications/messages séparés      | Contraire au contrat d’un message commun                                                                                                                                                                                                               | Risque de doublon, changement de visibilité et planification ; rejetée, aucun développement                                                                                                  |

**Option A retenue et testée**, sans modifier Notification, le scheduler ou les règles de livraison. Le JSON ne contient qu’une expression de sujet et le corps synchronisé avec le HTML ; le code anglais réellement utilisé dans le hook Python constitue la source gettext. Aucun catalogue fabriqué ni extracteur ajouté.

## 2. Implémentation native

Cinq fichiers source/tests : trois fichiers de `lms/lms/notification/certificate_request_reminder/`, nouveau `lms/tests/test_reminder_email.py`, adaptations ciblées de `lms/tests/test_evaluation_email.py`. S’ajoutent fr.po/main.pot, ce rapport et CODEX_HANDOFF.md : **neuf fichiers** pour le lot.

Le hook vérifie la présence de l’alerte standard et l’absence d’Email Template spécifique. Il calcule la langue via get_user_lang et prépare dans print_language :

-   Sujet anglais source **Reminder for Certificate Evaluation** → **Rappel pour votre évaluation de certification**.
-   Salutation Hey {0}, phrase complète de programmation, évaluateur et consigne de préparation ; valeurs existantes réutilisées.
-   Nouvelle valeur **{0} is your evaluator → Votre évaluateur est {0}**.
-   Date/heure/fuseau présentés par les mêmes cinq fonctions que la confirmation.

Le résultat est un dictionnaire **de textes simples propres à ce rendu**, pas un moteur de langue parallèle. Notification rend ensuite sujet et HTML natifs, alors que la langue initiale est déjà restaurée. Les champs métier du document ne sont pas modifiés. Le sujet Jinja lit la valeur préparée ; le HTML échappe chaque phrase avec `|e`, protégeant noms/titres/fuseaux sans `|safe`. Aucun lien, image ou pièce jointe ajouté.

Une branche de repli existe lorsque le contexte préparé est absent : traduction dans le contexte courant et champs d’origine, sans prétendre appliquer la préférence membre. Elle sert notamment à un usage non standard des sources et aux appels de bas niveau qui contournent le hook. Elle ne remplace pas la validation du chemin standard complet.

Native send → load_standard_properties → get_context/module → get_template/HTML → send_notification_by_channel → send_an_email est utilisé dans les nouveaux tests. Notification et Communication/queue restent simulées aux frontières d’écriture, pas remplacées par une implémentation de livraison maison.

## 3. Langue, prévisualisation et personnalisations

Membre FR/EN et sans préférence : repli User.language → System Settings.language → contexte → en. Évaluateur FR/EN reçoit volontairement le même sujet/corps que le membre. Tests langues opposées et communes : un seul appel de préparation, mêmes deux destinataires To (le rappel n’utilise pas le cc de la confirmation), cc/bcc vides. Aucun destinataire retiré ou nouvel envoi.

Les vraies méthodes native preview_subject/preview_message sont appelées avec une demande fictive et le module réel : sujet français, corps français et corps de prévisualisation identique à celui passé au sendmail simulé. Source anglaise retrouvée si la traduction du sujet est retirée du dictionnaire de test. La langue initiale, même allemande, est retrouvée après rendu et après erreur de formatage ; une erreur Jinja dans la preview native conserve aussi ce contexte.

Une surcharge Email Template reste prioritaire. Le hook ne force alors pas la langue du membre, ne remplace ni son sujet ni ses textes et ne change pas ses variables. Preview et send utilisent le contenu d’auteur ; le test interdit l’appel de sélection de langue dans cette branche. Les traductions `_()` d’une surcharge continuent à suivre son contexte natif, et les littéraux restent ceux de l’auteur : **pas de promesse de français automatique pour tous les modèles personnalisés**. Pour une Notification non standard, le hook n’est pas appelé et le contexte initial reste inchangé. Aucun modèle stocké en base consulté/modifié pour ces contrôles.

## 4. Dates, heures et déclenchement

Réutilisation sans modification de get_evaluation_display_timezone, convert_from_system_timezone, format_timezone, format_date et format_time. Tests FR et EN comparent les trois arguments de présentation de la confirmation au corps du rappel, puis les instants convertis en UTC :

| Système fictif                 | Présentation attendue                      |
| ------------------------------ | ------------------------------------------ |
| 17 mai 2027 10:00 UTC          | 17 mai 12:00 Europe/Paris, GMT+2:00        |
| 17 mai 2027 23:45 UTC          | 18 mai 08:45 Asia/Tokyo, GMT+9:00          |
| 17 mai 2027 09:00 Asia/Kolkata | 16 mai 20:30 America/Los_Angeles, GMT−7:00 |
| 28 mars 2027 00:30 UTC         | 28 mars 01:30 Europe/Paris, GMT+1:00       |
| 28 mars 2027 01:30 UTC         | 28 mars 03:30 Europe/Paris, GMT+2:00       |

Même instant dans les deux zones, même présentation que la confirmation, date/heure/end_time/timezone stockés de la fixture inchangés. Le cas de changement d’heure utilise UTC comme source non ambiguë ; il ne valide pas toutes les heures locales ambiguës ou inexistantes du système. Zone historique non reconnue : comportement natif conservé, horloge inchangée et libellé échappé, aucune conversion inventée.

Le calendrier **Days Before/date/un jour** reste calculé nativement sur la date système du document. Lorsque le jour local diffère, le moment de déclenchement peut ne pas correspondre à « la veille » du calendrier affiché. Ce lot corrige la présentation, pas la date du scheduler ; aucune règle de réservation, conversion globale ou préférence I18N-01 ajoutée.

## 5. Destinataires et invariants

Comparaison structurée du JSON à la base : seuls **subject, message et modified** changent. La date modified des sources est actualisée pour signaler la nouvelle version ; elle ne représente pas une modification du document installé. Nom/type/canal/événement/date_changed/days_in_advance/condition/enabled/attach_print/is_standard et les quatre lignes de destinataires sont identiques.

La déduplication reste le vrai `Notification.get_list_of_recipients` : deux comptes distincts malgré member/member/evaluator/evaluator ; un destinataire lorsque les adresses sont identiques. Les tests natifs d’enveloppe B.2 sont réutilisés avec EmailQueue.new capturé, jamais exécuté réellement. Aucun second message ou deuxième Notification, aucune nouvelle entrée de scheduler/hook global, aucune modification de permission ou visibilité. Le contrôleur de confirmation, les conversions métier, hooks.py et babel_extractors.csv sont inchangés.

## 6. Tests et échecs intermédiaires

Régression avant correction : preview_subject native attendue FR renvoyait **Reminder for Certificate Evaluation** ; **un test réellement échoué** sur la base. Après code avant PO : huit nouvelles méthodes exécutées, cinq échecs d’assertions/sous-cas français faute de traductions. Après catalogue : 8/8. Ajout d’un test d’extraction Python/miroir JSON et adaptation des anciens constats de bas niveau : sélection finale complète **34/34 réussie en 1,576 s**.

Commande bench Python **sans site** : `python -m unittest lms.tests.test_reminder_email lms.tests.test_evaluation_email lms.tests.test_certification_email -v`. Neuf méthodes du nouveau module + quinze B.2 + dix B.1, avec plusieurs sous-cas ; aucun total des campagnes globales prétendu. Pas de suite transactionnelle, frontend, navigateur ou SMTP.

Couverture : vrai chemin send/prévisualisations/load_standard_properties/get_template du Framework ; source gettext réellement extraite ; FR/EN et replis, langues membre/évaluateur différentes ou communes, déduplication, absence de nouveau déclencheur, dates/UTC/minuit/heure d’été/zone héritée, HTML/accents/paramètres, erreur de hook et de preview, surcharges et standard/non-standard différenciés. Les tests B.2 anciennement diagnostiques ont été renommés pour distinguer **l’appel direct sans hook** du chemin complet désormais testé ; leurs résultats ne sont pas assimilés à une validation de livraison native complète. Les rapports historiques B.2 restent intacts.

Ruff 0.8.1 existant : imports, format et lint des trois Python modifiés réussis. Babel, JSON/HTML identiques, diff et recherche ciblée de secrets conformes. Les contrôles explicites remplacent le lanceur complet de hooks historiquement bloqué, non déclaré réussi.

## 7. Isolation et garanties

Harnais B.1/B.2 réutilisé : dictionnaire du PO versionné, fonctions natives de traduction/Jinja et conversions, loader/globals limités ; membres/cours/demande/documents fictifs. get_doc_module renvoie le module du dépôt, get_cached_doc renvoie la seule demande ou le modèle fictif, commentaires/DB/Settings/outgoing account remplacés. Aucune instance de réservation insérée.

sendmail est un captureur local. Communication.\_make et get_lazy_doc sont des mocks ; EmailQueue.new interdit sauf capture de déduplication B.2 ; Notification Log, enqueue/enqueue_doc, DB/connect, réseau et PDF bloqués/remplacés. Aucun scheduler/Days Before, calendrier, Google, certificat, compte, rôle, SMTP ou email réel. **Zéro email réel et zéro écriture sensible métier.** Les appels natifs Notification.send ici concernent uniquement les objets fictifs, pas une règle installée.

Pas de validation MIME/wrapper/footer, client email, permissions réelles ou réception. Le contexte du worker est restauré avant préparation native du transport ; seul le contenu applicatif a été prélocalisé. Aucun compte SMTP/OAuth ou secret demandé/modifié.

## 8. Catalogues

Extraction native `bench generate-pot-file --app lms` après modification des sources : **3 019 → 3 020 clés**, **un ajout** Reminder for Certificate Evaluation avec référence au Python effectivement utilisé, **zéro retrait**. Quatre clés existantes ont des références HTML/Python actualisées ; contextes, paramètres et flags/pluriels conservés. Aucune clé Jinja parasite ajoutée, aucun mapping JSON global ou nouvel extracteur. L’absence de mapping JSON subsiste mais n’empêche plus ce sujet, maintenant ancré en Python.

**957 → 959 valeurs françaises**, deux nouvelles ; 957 antérieures intégralement préservées. PO 2 837 → 2 838 entrées, la seconde traduction complétant une entrée déjà existante. Sérialisation Babel limitée aux blocs nécessaires, validation sans erreur. 78 autres PO identiques aux empreintes historiques, Framework propre à 959b85de, develop à 6b791f33 inchangé. Compilation native LMS/fr réussie, deux valeurs vérifiées dans le MO ; MO non suivi, aucun cache de site invalidé. Pas d’update-po-files/Crowdin.

## 9. Source Git et Notification installée : synchronisation future requise

`frappe.model.sync.sync_all/sync_for` parcourt les documents standard Notification et appelle import_file_by_path lors des installations/migrations. L’import compare notamment la date modified pour les documents autres que DocType ; une version DB plus récente peut faire ignorer le fichier, hors import forcé. Dans import_file.ignore_values, **enabled est explicitement préservé** pour Notification ; cela ne garantit pas la conservation de toutes les autres personnalisations.

Le modified Git est actualisé, mais **aucune migration, reload_doc, patch, synchronisation forcée ou modification Notification en base exécuté**, même en développement. Les tests utilisent le JSON du dépôt et le vrai chargement du HTML/module ; ils ne prouvent pas l’adoption par la Notification déjà installée. Un ancien sujet en base peut rester littéral anglais alors que les nouvelles sources de corps/hook sont chargées : **risque de version mixte tant que la synchronisation n’a pas été contrôlée**. Les modules de workers déjà importés peuvent également nécessiter le cycle de chargement adapté lors d’un futur déploiement autorisé.

Avant toute adoption future : mission explicitement autorisée, comparaison et sauvegarde du document installé (subject/message/email_template/destinataires/calendrier/état), revue des personnalisations, choix de la procédure native et recette sans envoi. Ne pas forcer un import aveugle ni effacer une surcharge locale. Cette publication Git n’est pas un déploiement et ne déclenche aucune de ces opérations.

## 10. Livraison et suite

Source/JSON/HTML/tests : **382e6f58**, puis catalogues/rapport/handoff dans le commit suivant (SHA via git log -1). Publication normale contrôlée autorisée si invariants et non-envoi confirmés ; après push vérifier SHA, rapport GitHub identique et checkout aligné/propre, sans commit récursif de suivi. Preuves `/workspace/work/fr04b3/` : régression, exécutions, catalogue/compilation, copies et contrôles.

Le correctif standard est validé en isolation ; la sélection membre et présentation horaire auparavant manquantes sont traitées **dans les sources**, sans annoncer un rappel reçu sur le site. Les surcharges et les règles non standard conservent leur propre comportement ; le calendrier système « la veille », les zones anciennes et les réserves FR-03 restent ouverts.

Suite renumérotée proposée : **FR-04B.4 — emails de confirmation/rappel de sessions et séances directes** ; **B.5 — annonces de cours/sessions et mentions/notifications portail** ; **B.6 — documents/PDF de certification**. Ce sont des propositions sans démarrage ; une mission séparée de synchronisation/recette du rappel peut être priorisée avant usage. Aucun email de session, PDF ou I18N-01 commencé ici. Arrêt après ce lot, attendre un nouvel ordre.
