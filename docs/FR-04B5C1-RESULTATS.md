# FR-04B.5C.1 — Destinataires formateurs des annonces

31 octobre 2026. `littlepool-dev`, base distante **3e75d0f4c4536944741f5dae14902b7cad46b552**, checkout initial propre. Mandat ciblé avec publication normale conditionnelle autorisée. Source/tests : **890f6f22** ; rapport/handoff dans le commit suivant (SHA via `git log -1`). Environnement existant réutilisé, aucune installation.

**Résultat : contrat des destinataires corrigé pour les annonces de cours et de sessions, validé sur fixtures par la normalisation native et QueueBuilder.process, sans vraie queue ni envoi. La correction peut débloquer une diffusion auparavant défectueuse ; elle n’autorise aucune campagne réelle ou activation en production.**

## 1. Cause et preuve avant correction

get_instructors joint Course Instructor et User et renvoie des `_dict` détaillés : name, username, full_name, user_image, first_name, bio. Les annonces passaient ces objets directement à sendmail(recipients=instructors), alors que QueueBuilder attend une liste de chaînes email. `_get_emails_list` appelle set(emails), impossible pour ces dictionnaires.

Avant modification, le nouveau test positif `test_announcement_addresses_pass_native_normalization` a réellement échoué sur l’annonce de cours : **TypeError: cannot use 'frappe.types.frappedict.\_dict' as a set element (unhashable type: '\_dict')**. Log hors dépôt : `/workspace/work/fr04b5c1/regression-before.log`. Le test final réinjecte également les anciens objets dans QueueBuilder et constate cette même erreur avant de vérifier le nouveau chemin cours/session. Aucune conclusion générale sur toutes les configurations SMTP, notamment sans formateur.

## 2. Représentation retenue et contrat natif

Deux représentations séparées, dans les seules fonctions `send_email_notification_for_published_courses` et `send_email_notification_for_published_batch` :

-   Les objets `instructors` restent inchangés dans args pour Jinja : noms, images, ordre et éventuels doublons conservés.
-   Chaque `instructor.name` identifie le même compte User ; `frappe.utils.get_email_address(name)` lit son champ email. La liste `recipients` ne contient que ces adresses. Aucun formateur ajouté, exclu ou remplacé ; aucun recours à full_name, username ou str(dict).

Lecture de la version installée : User.autoname normalise email et l’utilise comme name pour les comptes ordinaires ; User.validate aligne encore email sur name hors STANDARD_USERS. Les comptes standard ont des exceptions. La résolution native get_email_address couvre le contrat du compte sans présumer qu’un identifiant est toujours une adresse livrable. Test d’identité exceptionnelle fictive `FictionalLegacyIdentity` → `fictional-delivery@example.com`, même compte, objets Jinja inchangés. Cela n’affirme pas que ce cas est une configuration réelle du site.

Identité manquante : InvalidEmailAddressError avant toute résolution, afin d’éviter le repli natif get_email_address(None) vers la session. Email absent/vide, invalide, multiple ou pseudo-adresse undisclosed : **exception, aucun appel sendmail et aucun notification_sent marqué**. Contrôle avec les vrais split_emails/validate_email_address, sans parseur parallèle ni adresse de secours. Pas de suppression silencieuse d’un formateur ; le message de cet objet échoue entièrement. Une adresse syntaxiquement valide ne prouve ni boîte existante ni réception SMTP.

Aucune nouvelle clé gettext ni texte de template. L’erreur de préparation utilise le type natif InvalidEmailAddressError. Les nouvelles résolutions font une lecture User.email par ligne formateur, sans nouvelle sélection de public ni écriture User.

## 3. To/BCC, doublons et indicateurs

Même sélection `User.enabled=1` pour BCC, mêmes valeurs et même visibilité BCC ; CC absent, mêmes options de sendmail, mêmes sujets et corps. Un appel applicatif par cours/session et même set_value notification_sent=1 **après** sendmail. Les déclencheurs, gardes LMS Settings/publication/non-répétition, filtres, hooks, scheduler et permissions sont inchangés.

La liste To peut conserver des doublons exacts ; aucun moteur de déduplication LMS ajouté. QueueBuilder normalise chaque liste par set. Lors du process natif non séparé, l’union finale To+CC+BCC est elle aussi dédupliquée. Tests : formateur présent deux fois en To et également dans BCC, utilisateur BCC dupliqué, une occurrence finale par chaîne exacte dans le payload de queue capturé. Un utilisateur uniquement BCC ne devient jamais To. Pas de déduplication par casse, alias ou rapprochement heuristique de comptes.

Une liste de formateurs vide garde un To vide et les mêmes BCC : le process natif conserve l’enveloppe BCC seule. Le filtre de désabonnement natif est exercé avec une liste fictive ; aucune réimplémentation ou modification de ses règles. Les compteurs de messages/queues réelles dépendront toujours du Framework et des volumes ; aucune simulation ne vaut une campagne réelle.

Une erreur de résolution ou de préparation propagée empêche le set_value de l’objet en cours. Pour une liste de cours, les objets précédemment préparés peuvent déjà avoir été marqués ; pas d’atomicité globale ou de reprise nouvelle. Le comportement du Framework peut aussi retourner sans lever dans d’autres situations : ce correctif n’établit pas un accusé de livraison et ne refond pas notification_sent.

## 4. Tests exécutés

**32/32 méthodes réussies en 1,906 s**, commande avec le Python du bench sans site :

`python -m unittest lms.tests.test_announcement_emails -v`

La sélection comprend les 23 méthodes B.5 adaptées au nouveau contrat To et neuf nouvelles méthodes ; l’ancien test affirmant l’échec des To issus de l’application devient une assertion positive. Le constat historique reste testé explicitement avec les objets bruts. Les tests de mentions, jobs individuels et portail restent présents ; aucune suite globale lancée.

Couverture spécifique :

-   Cours et session, un/plusieurs formateurs, avec/sans image ; objets détaillés inchangés, même Jinja, FR/EN et langue commune maintenue.
-   Résolution native User.email, identité distincte de l’email, absence d’identité sans repli vers session.
-   BCC inchangés, aucun passage BCC → To, doublons exacts et recoupement To/BCC.
-   To vide, adresse absente/invalide/multiple, préparation échouée, absence de set_value et d’envoi dans ces échecs.
-   Un appel applicatif par objet, restauration du contexte après exception selon le chemin existant, désabonnements traités nativement.

Les nouveaux tests dépassent le mock sendmail : ils passent les adresses à la **vraie normalisation QueueBuilder.recipients/bcc/final_recipients/final_bcc et au vrai QueueBuilder.process(send_now=False)**. EmailQueue.new est une capture locale, jamais une création réelle ; send est interdit. `as_dict` est remplacé pour éviter compte sortant, construction MIME et environnement de site : **le rendu MIME, les en-têtes reçus par un client et SMTP ne sont pas validés**. Les assertions sur To/BCC concernent les rôles applicatifs et l’enveloppe native capturée, sans changer les règles Framework d’exposition.

Rendu Jinja natif conservé. Frontières du harnais existant réutilisées : sendmail/DB/settings/get_all remplacés, SQL/écritures interdits sauf set_value capturé pour comparer les mêmes indicateurs ; socket/SMTP, site, Redis enqueue/enqueue_doc, vraie Email Queue, Communication et Notification Log interdits/interceptés. Aucun scheduler, publication ou compte réel, aucune Notification ou préférence installée modifiée.

**Zéro email réel, zéro queue réelle, zéro écriture métier réelle.** Les adresses example.com et objets sont fictifs. Les captures de queue sont des structures en mémoire, sans Document inséré.

Ruff lint/format des trois Python réussis ; comparaison AST : toutes les définitions non concernées strictement identiques et les deux fonctions ne diffèrent que par résolution/validation des To. Arguments Jinja, options sendmail hors recipients, sujets, écritures et positions des indicateurs préservés. `git diff --check` et recherche ciblée de secrets conformes.

Un contrôle intermédiaire a supposé à tort que les 79 PO se trouvaient dans LMS. La vérification du périmètre historique établit **39 PO LMS, dont fr.po, et 40 PO Framework** : les « 78 autres PO » sont 38 LMS +40 Framework. Assertion corrigée dans le script de contrôle hors dépôt ; tous les fichiers concernés sont identiques aux références. Ce n’était pas une suppression de catalogues. Aucun échec intermédiaire de la suite après correction : 32/32 dès sa première exécution complète.

## 5. Intégrité et fichiers

Cinq fichiers seulement :

1. `lms/lms/doctype/lms_course/lms_course.py`.
2. `lms/lms/doctype/lms_batch/lms_batch.py`.
3. `lms/tests/test_announcement_emails.py`.
4. Ce rapport.
5. `CODEX_HANDOFF.md`.

get_instructors/utils, templates, API/frontend, hooks, permissions et schéma inchangés. Tous les PO et le POT identiques octet par octet à leurs références : **995 valeurs FR, 3 021 clés POT**, 78 autres PO vérifiés. Aucune extraction, compilation, purge de cache, migration ou génération de catalogue nécessaire/exécutée.

Framework propre et inchangé à `959b85de4086656273e1d158f41923dd3808c350`. develop distant attendu `6b791f33b34efa15566a0cb707f5be59d136df50` contrôlé avant/après publication. Pas de PR, fusion, Crowdin, déploiement ou intervention Docker/OMV8.

Preuves hors Git : `/workspace/work/fr04b5c1/` (regression-before.log, tests-after.log, checks.json, scripts de comparaison ; contrôles de publication). Seuls les résultats utiles sont versionnés ; aucun journal sensible, compte réel, cookie ou credential ajouté.

## 6. Avertissement de diffusion et réserves

**Le blocage de type des formateurs est levé sur fixtures. Cela peut rendre opérationnelles des annonces jusque-là en échec. Ce n’est pas une autorisation de les activer en production ni d’envoyer une campagne réelle.** Les réglages LMS Settings restent inchangés ; aucun envoi ou déploiement réalisé.

Le BCC enabled=1 peut inclure des personnes non inscrites ou non concernées, et ne démontre aucun consentement promotionnel. Décider séparément du public, du canal, des préférences et de la confidentialité avant toute activation. La présence volontaire d’un formateur en To et BCC conserve les rôles préexistants ; seule la déduplication native des chaînes identiques est utilisée.

Toutes les autres réserves B.5 demeurent : langue commune des annonces mixtes, sujets persistants non retraduits, offset calculé à minuit au changement d’heure, Markdown/URLs à revoir, garde email de mention inchangée, email_sent après enqueue sans garantie de livraison, liens historiques et éventuels emails natifs de Notification Log cumulés. **Réserve de synchronisation B.3 toujours ouverte**, réserves B.4 et FR-03 A–E conservées. Aucun PDF ou I18N-01 commencé.

**Recommandation pour FR-04B.6 : cadrer d’abord la politique de diffusion et de confidentialité BCC et les conditions de recette avant activation**, avec choix explicite sur langue commune/segmentation et reprise ; pas d’envoi réel implicite. Les notifications persistantes, fuseaux et PDF nécessitent leurs mandats distincts. Arrêt après ce correctif et sa publication contrôlée.
