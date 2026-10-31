# FR-04B.2 — Confirmation de réservation et diagnostic du rappel

31 octobre 2026 (Europe/Paris), littlepool-dev. Base distante vérifiée : **556f388f8f2bf6aede7f3c99af7e826cd364abb5**. Checkout initial propre, FR-04A/B.1 publiés ; Framework 17.0.0-dev à 959b85de, LMS 2.45.2. Aucun changement de dépendances.

**Livraison partielle explicite : confirmation immédiate terminée dans le périmètre testé ; rappel standard diagnostiqué, non modifié et non déclaré francisé/validé intégralement. FR-04B.2 n’est pas entièrement terminé.** Le mandat autorise la publication d’un sous-lot sûr avec ses limites. Ni FR-04B.3 ni I18N-01 commencé.

## 1. Sources et comportements initiaux

Lecture AGENTS/handoff, [audit A](FR-04A-AUDIT.md), [rapport B.1](FR-04B1-RESULTATS.md), glossaire, contrôleur et test métier de demande, Notification/Email Queue natifs et tests pertinents de Notification. Les tests métier existants créent utilisateurs/inscriptions/documents : ils n’ont pas été lancés dans cette mission isolée.

Modifiés :

-   `lms/lms/doctype/lms_certificate_request/lms_certificate_request.py` : seul le rendu dans send_notification est borné par la langue native du membre.
-   `lms/templates/emails/certificate_request_notification.html` : échappement HTML explicite des variables insérées.
-   `lms/tests/test_evaluation_email.py` : quinze méthodes isolées, dont diagnostics du rappel natif.
-   `lms/locale/fr.po`, `lms/locale/main.pot`, ce rapport et CODEX_HANDOFF.md.

Les trois sources du rappel (JSON, HTML, Python get_context) restent **identiques** à la base ; aucun mapping Babel, hook, workflow, permission, scheduler ou Framework modifié.

Initialement after_insert appelle send_notification. Une garde compte sortant/mail_login entoure sujet, dates/arguments et frappe.sendmail. Membre principal, évaluateur en cc, retry=3 et header sujet/green ; la langue était celle du contexte de requête/job. Aucun after_insert ou calendrier réel exécuté.

## 2. Confirmation immédiate : choix de langue et destinataires

Après la garde existante, `with print_language(get_user_lang(self.member))` englobe sujet, conversion/formatage et préparation sendmail. Contrat natif confirmé en B.1 : User.language → System Settings.language → contexte courant → en. Aucun champ User ou paramètre système modifié. Le contexte est restauré après succès et après erreur de rendu.

Le **message unique et la copie sont conservés** : aucune division silencieuse en deux emails, aucun changement de personnes informées ou de visibilité. Français pour le membre FR ; anglais pour EN ; repli natif pour membre sans préférence. Si l’évaluateur a une autre langue, **il reçoit la version du membre**, pas une version individuellement traduite. Les tests FR/EN mixtes et de même langue vérifient cette règle, un seul appel de préparation par réservation fictive, recipients/cc inchangés, pas de bcc ajouté.

Même adresse en principal et cc : le lot ne réécrit pas les entêtes existants. Le QueueBuilder natif, dans son chemin non séparé par défaut, construit l’enveloppe avec `set(final_recipients + final_cc + final_bcc)` ; le test appelle ce traitement avec sources, rendu et EmailQueue.new complètement remplacés. Une seule adresse d’enveloppe est observée, aucune queue réelle. Cela ne certifie ni les alias/casses équivalents ni des options de transport externes.

Trois entrées françaises vides seulement renseignées via Babel :

| Source                               | Français                                 |
| ------------------------------------ | ---------------------------------------- |
| Your evaluation slot has been booked | Votre créneau d’évaluation a été réservé |
| Hey {0}                              | Bonjour {0}                              |
| Your evaluator is {0}                | Votre évaluateur est {0}                 |

Les traductions déjà présentes de la phrase date/cours et de préparation/ponctualité sont réutilisées sans modification. Paramètres {0}…{3} et noms propres conservés. Le standard échappe membre, cours, date, heure, libellé de fuseau et évaluateur ; les arguments métier conservent leurs valeurs originales. Aucune URL ou pièce jointe ajoutée.

## 3. Horaires et instant du rendez-vous

Fonctions existantes conservées : get_evaluation_display_timezone, convert_from_system_timezone, format_timezone, format_date et format_time. Seul le contexte linguistique du formatage change. AST : garde, conversions, arguments, recipients/cc/retry et instructions initiales identiques sous le contexte ajouté ; toutes les autres méthodes, validations, règles de créneaux et fonctions de calendrier/scheduler restent identiques.

Tests avec fonctions natives et lectures fictives :

| Heure système fictive           | Affichage évaluation attendu      | Constat                                          |
| ------------------------------- | --------------------------------- | ------------------------------------------------ |
| 17 mai 2027, 10:00 UTC          | 17 mai, 12:00 Europe/Paris        | Horaire ordinaire, GMT+2:00                      |
| 17 mai 2027, 23:45 UTC          | 18 mai, 08:45 Asia/Tokyo          | Passage proche de minuit, jour suivant, GMT+9:00 |
| 17 mai 2027, 09:00 Asia/Kolkata | 16 mai, 20:30 America/Los_Angeles | Jour précédent, GMT−7:00                         |

Comparaison explicite des deux datetimes convertis en UTC : même instant ; date/heure stockées de la fixture inchangées. Les dates moyennes utilisent mai/May selon langue et le format horaire natif. Fuseau texte hérité non reconnu : comportement natif de conservation de l’heure et du libellé, sans prétendre à une conversion fiable ; libellé HTML échappé. Batch facultatif absent testé via le chemin du cours. Pas de convertisseur global concurrent ni modification d’I18N-01.

## 4. Rappel standard : diagnostic et arrêt de l’adaptation

### Pipeline natif observé

Notification.send obtient le contexte puis, si is_standard, appelle load_standard_properties : get_context du module standard puis chargement du corps HTML. Le hook LMS actuel est vide et ne fixe aucune langue. send_notification_by_channel choisit le canal et peut produire un Notification Log supplémentaire si demandé ; ces déclencheurs ne sont pas exécutés dans les tests.

Dans send_an_email :

1. Surcharge Email Template éventuelle rendue depuis doc.as_dict, sinon sujet littéral (rendu Jinja uniquement s’il contient `{`) et corps rendus dans le contexte courant.
2. Pièces jointes déterminées, puis destinataires calculés.
3. Déduplication exacte par groupe via `list(set(recipients))`, `list(set(cc))`, `list(set(bcc))`.
4. Communication préparée puis sendmail avec un sujet/corps déjà communs. Email Queue ne retraduit pas individuellement ces textes.

Le test instrumenté constate rendu du corps avant calcul des destinataires. Le sujet JSON littéral ne passe pas par gettext. Le test de surcharge native Email Template confirme sa priorité et son rendu dans le contexte courant ; la personnalisation n’ajoute pas automatiquement la préférence individuelle du membre ou de l’évaluateur. Une Notification non standard ne bénéficie pas du hook standard ; une modification générale du contexte dans ce hook sans restauration serait dangereuse.

### Destinataires et langue : limites maintenues

JSON : member/member/evaluator/evaluator. Le vrai get_list_of_recipients renvoie **deux adresses distinctes**, ou une si membre et évaluateur sont le même compte, et aucune si les deux champs sont absents. Cela ne démontre pas quatre emails/double envoi. Les groupes cc/bcc restent distincts ; aucune adresse réelle interrogée.

Sujet **Reminder for Certificate Evaluation** reste anglais dans les deux contextes. Le corps varie avec la langue de contexte, pas avec User.language individuelle. Les trois nouvelles valeurs du PO bénéficient à leurs clés communes, dont Hey {0}, mais la ligne `{0} is your evaluator` du rappel reste sans traduction LMS. **Ni sujet FR pour membre FR ni FR/EN simultané par destinataire déclarés résolus.** Une séparation nécessiterait de définir la visibilité des destinataires, les interactions avec surcharges/Communication et une stratégie anti-doublons : aucun second envoi ni seconde règle ajouté.

### Extraction JSON : blocage confirmé, aucune clé fabriquée

La composition réelle get*method_map(lms) + get_method_map(frappe) ne contient **aucune règle correspondant au chemin JSON de cette Notification**. Le corps HTML dispose de l’extracteur natif, le sujet JSON non. La clé Reminder for Certificate Evaluation est absente du POT courant. Ajouter simplement `{{ *('Reminder for Certificate Evaluation') }}` au JSON pourrait changer le rendu dans un contexte mais ne prouverait ni extraction ni langue du destinataire ; ce changement n’a pas été intégré.

**Proposition minimale avant toute publication d’un futur correctif de rappel** : étudier l’extension native get_context déjà fournie, avec sujet source littéral dans un petit module Python effectivement utilisé et extrait nativement, valeurs de présentation renvoyées au template sans laisser une langue globale modifiée. Alternative à évaluer : mapping strictement limité au JSON concerné qui décode ses champs Jinja, avec test d’extraction native ; ne pas appliquer un extracteur générique aveuglément à tous les JSON. Aucune de ces options n’est développée ici. La sélection de langue commune ou une éventuelle séparation doit être spécifiée/testée avant modification du nombre d’emails. Pas de surcharge globale de Notification/Framework ni nouveau workflow pour forcer ce lot.

### Affichage temporel du rappel

Le rappel rend doc.date et doc.start_time directement, avec doc.timezone. Le contrôleur de demande dérive ce champ du fuseau système. Exemple fictif confirmé : confirmation **16 mai 2027, 20:30 America/Los_Angeles (GMT−7:00)** ; rappel **17 mai 2027, 09:00 Asia/Kolkata**. Les deux peuvent désigner le **même instant**, mais le rappel ne reprend pas l’heure/zone vue à la réservation. Ne pas présenter cette différence comme une mutation des heures stockées ou un décalage d’instant démontré. Les anciennes valeurs libres de timezone demanderaient une vérification supplémentaire.

Aucune correction temporelle du rappel intégrée : conserver calendrier Days Before, délai un jour, champ date, condition Upcoming, enabled, destinataires et attach_print=0. Leur migration/activation en base n’est pas exécutée.

## 5. Tests, résultats et erreurs intermédiaires

Commande finale : bench Python **hors site**, `python -m unittest lms.tests.test_evaluation_email lms.tests.test_certification_email -v` dans le conteneur existant. **25/25 méthodes réussies en 1,196 s** : quinze nouvelles et dix B.1 réutilisées, plusieurs sous-cas. Les diagnostics qui constatent les limites du rappel réussissent comme tests de constat ; cela ne rend pas le rappel fonctionnellement francisé.

Nouveaux cas : FR/EN, sans préférence/site FR/site EN/contexte/en, langues mixtes et communes, compte sortant absent et repli mail_login, trois conversions natives/changement de jour, batch absent/fuseau hérité/HTML/accents, paramètres inchangés, traduction absente, rendu en erreur et restauration, même adresse sans nouveau message, déduplication native Notification et enveloppe QueueBuilder, rappel actuel dans deux contextes, ordre de rendu/destinataires et modèle personnalisé, champs destinataires absents, absence de mapping JSON.

Avant correction : quatorze méthodes, neuf échecs d’assertions (sous-cas compris) et une erreur de fixture (get_value ne recevait pas as_dict). Après contexte source : un échec de traduction encore vide et la même erreur de fixture. Après les trois valeurs et la signature de lecture fictive corrigée : 14/14 réussies. Ajout du cas de personnalisation/ordre natif, amélioration de l’erreur Jinja et des assertions d’instant : sélection finale complète 25/25 avec B.1. Les journaux restent conservés ; aucune réussite globale déduite d’une relance isolée.

Isolation reprise de B.1 : natifs get_user_lang/print_language/Jinja/formatage/conversion avec loader et globals limités, vrai PO lu en mémoire ; User/Settings/cours/session entièrement fictifs. sendmail remplacé par captureur de rendu ; Communication.\_make, get_lazy_doc et compte sortant sont des mocks. EmailQueue.new interdit par défaut, capture sans effet dans le seul test de déduplication. SQL/connect, sockets réseau, enqueue/enqueue_doc, Notification Log et PDF bloqués/remplacés. Pas d’appel after_insert réel, Notification.send/Days Before/scheduler, création de réservation, calendrier/Google, Email Queue/Communication réels, SMTP, certificat, rôle ou permission. **Zéro email réel et zéro écriture sensible métier.**

Le sandbox et les dépendances de site sont remplacés comme en B.1 ; ces tests ne valident ni toute configuration Jinja/Notification stockée, ni MIME/wrapper/footer/SMTP/client mail, ni les permissions de production.

## 6. Catalogues et contrôles techniques

-   **954 → 957 valeurs FR** : trois nouvelles, 954 antérieures intégralement préservées, PO toujours 2 837 entrées. Édition des seuls blocs nécessaires par Babel, paramètres/contextes/flags/pluriels contrôlés, Babel sans erreur.
-   `bench generate-pot-file --app lms`, une extraction native : **3 019 → 3 019**, zéro ajout/retrait de clé, **dix messages avec références de lignes modifiées** dans le contrôleur de demande et dates d’en-tête. Aucun POT manuel ou update-po-files, aucune clé du sujet JSON artificiellement ajoutée.
-   Compilation native LMS fr forcée et trois valeurs vérifiées dans le MO ; MO non suivi. **Aucune invalidation de cache**, inutile aux tests isolés ; aucune réception d’email ou dictionnaire de site déjà en cache certifié.
-   Ruff 0.8.1 existant : tri d’imports, formatage et lint des deux Python réussis. AST : garde, arguments et appel d’envoi identiques sous le contexte natif ajouté, méthodes de validation/critères et fonctions hors send_notification inchangées ; rappel JSON/HTML/Python identiques à la base.
-   78 autres PO identiques aux empreintes historiques, Framework propre à 959b85de, develop inchangé à 6b791f33b34efa15566a0cb707f5be59d136df50. Versions exécutées : Framework17.0.0-dev/LMS2.45.2 ; dépendances conservées. Prettier documentaire, git diff --check, revue du diff et secrets/fixtures fictives contrôlés.

Aucune suite globale/transactionnelle, aucun build Vue, navigateur/SMTP ou site neuf. Hooks complets non déclarés réussis ; commits avec hooks désactivés après contrôles explicites. Preuves et copies initiales hors dépôt : `/workspace/work/fr04b2/`.

## 7. Livraison partielle et suite

Source/template/tests : **0123104d**, puis catalogues/rapport/handoff dans le commit suivant (SHA via git log -1). Publication normale du **seul sous-lot sûr** autorisée après vérification des critères : confirmation immédiate testée, rappel non modifié et limites visibles dans ce rapport. Après push, vérifier SHA distant, rapport GitHub identique, checkout propre/aligné et develop intact ; ne pas créer de commit uniquement pour constater la publication.

**Périmètre terminé :** sujet/corps de confirmation dans la langue du membre, copie conservée, garde et instant préservés, HTML et traductions testés sans envoi. **Périmètre non terminé :** sujet FR et langue individuelle/commune explicitement définie pour le rappel standard, extraction de son JSON, harmonisation de son affichage avec la réservation. Langue individuelle de l’évaluateur non validée, y compris dans la confirmation où une seule version est volontairement conservée.

Recommandation pour **FR-04B.3** : mission de conception puis pilote borné du rappel, choix de langue/destinataires et visibilité, voie native d’extraction du sujet, présentation via les conversions existantes, compatibilité des surcharges et anti-doublons. Aucun scheduler ni migration/envoi réel requis pour concevoir ces tests. Ne pas commencer ce lot automatiquement ; les autres familles d’emails et I18N-01 restent hors mandat, les réserves FR-03 demeurent ouvertes.
