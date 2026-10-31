# FR-04B.1 — Pilote de l’email standard de certification

31 octobre 2026 (Europe/Paris), littlepool-dev. FR-04A publié et vérifié à **b31fdf7cf164533c6409aed81775ecb9c36a08a2**, base du pilote. Autorisation autonome limitée à cette famille ; I18N-01 et les autres lots non commencés.

## Audit publié et périmètre retenu

[FR-04A](FR-04A-AUDIT.md) : commit documentaire sur base bc1bc97b, distant sans divergence, rapport GitHub identique et checkout aligné avant pilote. L’email de certification est adapté à un test isolé : destinataire unique, send_mail invocable sur un objet fictif, aucun besoin d’insertion, validation métier, PDF ou envoi réel. Les chemins de rappels, paiement, notifications portail et impressions restent inchangés.

Sources et tests :

-   `lms/lms/doctype/lms_certificate/lms_certificate.py` : contexte natif de langue du destinataire autour du rendu et de la préparation sendmail.
-   `lms/templates/emails/certification.html` : salutation complète déjà extraite, échappement explicite des noms/titres et encodage du nom dans le lien existant.
-   `lms/tests/test_certification_email.py` : dix tests unittest hors site, sans DB/queue/SMTP.
-   `lms/locale/fr.po` : trois valeurs seulement renseignées via Babel ; `lms/locale/main.pot` : extraction native contrôlée.
-   Ce rapport et CODEX_HANDOFF.md.

## Cause et correction

Avant : sujet traduit dans la langue du contexte courant ; standard rendu par frappe.sendmail et modèle personnalisé rendu avant celui-ci, sans sélection de User.language du membre. Un expéditeur/job anglais peut donc produire un sujet/corps anglais pour un membre français.

Après : `with print_language(get_user_lang(self.member))` englobe sujet, construction des arguments, rendu personnalisé et appel sendmail. Les deux fonctions proviennent du Framework installé, inchangé. Contrat natif : User.language → System Settings.language → frappe.local.lang → en. Le gestionnaire résout le contexte de job puis restaure la langue et les environnements Jinja, y compris après exception. Aucune préférence utilisateur écrite, aucun mécanisme global parallèle.

Le sujet source reste **Congratulations on getting certified!**, sa traduction existante **Félicitations pour votre certification !** n’est pas modifiée. Standard : Hi {0}, → **Bonjour {0},** réutilise une clé déjà traduite ; noms propres non traduits. Les trois nouveaux paragraphes FR sont :

1. « Nous avons le plaisir de vous informer que vous avez obtenu votre certificat pour le cours {0}. Félicitations ! »
2. « Vous pouvez désormais mettre en valeur vos compétences et partager votre réussite avec vos collègues et sur LinkedIn. Pour accéder à votre certificat, cliquez sur le lien ci-dessous. Assurez-vous d’être connecté à la plateforme. »
3. « Encore toutes nos félicitations pour cette réussite. »

Best Regards/Cordialement et Certificate Link/Lien de certificat sont conservés. « Certificat » désigne le document remis, sans promettre une qualification officielle supplémentaire. Le sujet historique n’a pas été renommé globalement.

Le sandbox Jinja natif n’active pas autoescape global ; frappe.bold n’échappe pas son argument. Le standard échappe maintenant member_name et course_title avant insertion et conserve le strong contrôlé. Le nom du certificat est encodé en query, comme le format l’était déjà. **Destination et paramètres métier inchangés** : `/api/method/frappe.utils.print_format.download_pdf`, doctype LMS Certificate, name, format, no_letterhead=1. Pas d’URL externe, de paramètre de langue PDF ou de nouvelle pièce jointe.

Les arguments restent exactement member*name/course_name/course_title/name/template, sans modifier leurs valeurs pour le modèle personnalisé. La surcharge de LMS Settings conserve sa priorité, son sujet et son contenu : les appels `*()` utilisent le contexte destinataire, les phrases littérales restent celles de l’auteur. Aucune traduction ou sanitation globale d’un modèle personnalisé, aucun remplacement par le standard.

## Tests exécutés et isolation

Commande : `docker exec lms-bench ... /workspace/frappe-bench/env/bin/python -m unittest lms.tests.test_certification_email -v`, **sans bench run-tests, frappe.init, connexion au site ou after_insert**.

**Exécution finale complète : 10/10 réussis en 0,800 s** après formatage. Cas :

| Test                           | Résultat confirmé                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sujet et corps standard FR     | Sujet existant, trois nouveaux paragraphes, Bonjour, lien et Cordialement ; accents UTF-8, titre en strong échappé ; un appel sendmail fictif             |
| Destinataires successifs FR/EN | Sujet/corps anglais pour EN, données des rendus distinctes, pas de fuite de nom ni langue FR dans le rendu EN                                             |
| Sans préférence                | Quatre sous-cas : site FR/EN, puis langue de contexte, puis en ; restauration du contexte précédent                                                       |
| Traduction absente             | Retrait simulé d’une clé du dictionnaire de test → source anglaise, pas de chaîne vide                                                                    |
| Restauration                   | Langue et objet environnement Jinja initiaux retrouvés après rendu                                                                                        |
| Job                            | Résolution native du job anglais, rendu membre FR, retour au contexte anglais du job                                                                      |
| Personnalisation               | Vrai get_email_template et méthodes natives de rendu sur objet fictif ; sujet gettext FR/EN, cinq arguments conservés, littéraux non retraduits           |
| Personnalisation use_html      | Réponse HTML native rendue, recherche de compte sortant totalement simulée à None ; pas de lecture réelle d’Email Account                                 |
| HTML et lien                   | Noms/titres avec script/img/guillemets/accents neutralisés dans le standard ; parsing HTML et query retrouve les valeurs initiales, destination inchangée |
| Erreur de rendu                | Exception conservée, langue restaurée et zéro appel sendmail                                                                                              |

Lectures User.language/System Settings/cours/LMS Settings fictives ; dictionnaire FR construit depuis le vrai PO versionné, pas un dictionnaire concurrent livré. Rendu par fonctions natives get_email_from_template/get_jenv/render_template et méthodes Email Template, avec loader Jinja en mémoire et globals limités pour supprimer toute dépendance de site/hooks. Le type de sandbox et l’absence d’autoescape correspondent à la version installée ; les extensions Jinja spécifiques d’un site réel ne sont pas testées.

`frappe.sendmail` est remplacé intégralement par un captureur qui rend le standard ou recueille le contenu personnalisé, sans appeler l’expéditeur natif. get_doc est interdit sauf Email Template fictif, SQL/enqueue/enqueue_doc/get_print interdits ; aucune instance réelle de LMS Certificate construite ou insérée. Les permissions du modèle personnalisé ne sont pas certifiées : son contrôle read est simulé, sa sélection et l’appel natif sont préservés. Aucune Communication/Email Queue/notification/email/invitation ou certificat créé, aucun compte/session réel créé/modifié. **Zéro envoi réel et zéro écriture sensible métier.**

La préparation finale du transport (wrapper/signature/footer/MIME), le moteur SMTP, le client mail et les modèles personnalisés réellement stockés ne sont pas exécutés. Aucun PDF téléchargé. La compilation de catalogue ci-dessous ne déclenche pas l’envoi.

## Échecs intermédiaires conservés

-   Pré-correctif : neuf méthodes exécutées, bilan sept échecs d’assertion et deux erreurs (incluant sous-cas de repli et fixture de modèle) ; les défaillances langue/échappement sont reproduites. Ce passage n’est pas déclaré réussi.
-   Après correction source : un échec sur les paragraphes encore non traduits et une erreur de construction de Document Email Template sans métadonnées de site. Fixture remplacée par objet de rendu fictif utilisant les méthodes natives, sans construction Document/DB.
-   Après PO : une erreur du logger de render_template hors site. Logger remplacé dans le test, flags de rendu initialisés en mémoire ; aucune configuration de journal/site changée.
-   Neuf tests réussis, puis ajout du dixième cas use_html et d’assertions de séparation de données : dix réussis dans l’exécution finale complète. Aucun succès déduit d’une seule relance isolée.
-   Le premier script de comparaison AST a utilisé le mauvais cwd Git ; corrigé dans le script hors dépôt, puis contrôles complets réussis. Ruff absent du PATH/venv principal : exécutable 0.8.1 existant du cache pre-commit réutilisé, rien installé.

Preuves : `/workspace/work/fr04/` (tests-before, tests-first-after, tests-after, tests-next, tests-final et validation-final, ruff, generation/compilation, checks.json, copies initiales et traductions). Les échecs et les scripts de harnais restent disponibles ; aucun journal sensible n’est versionné.

## Catalogues et contrôles

Babel : édition uniquement des trois blocs français vides, sérialisés avec le protocole précédent ; **951 valeurs antérieures intégralement conservées → 954 valeurs renseignées**, 2 837 entrées PO inchangées. Paramètre {0} conservé, contextes/flags/pluriels vérifiés, validation Babel sans erreur. Les 78 autres PO sont identiques aux empreintes historiques.

Extraction exécutée une fois : `bench generate-pot-file --app lms`, aucune publication réseau ou update-po-files. **POT 3 019 → 3 019, zéro ajout/retrait de clé ; 19 messages ont des références mises à jour**, plus dates d’en-tête. Référence de salutation déplacée Dear vers Hi {0}, et déplacements de lignes du contrôleur de certificat ; sept références de MemberForm reflètent aussi les décalages C.1 déjà publiés. Ces chemins sont explicitement contrôlés, les autres références des messages communs conservées. Aucun diff massif ou perte inexpliquée. POT jamais édité manuellement.

Compilation : `bench compile-po-to-mo --app lms --locale fr --force`, réussie ; trois valeurs vérifiées dans le MO produit. MO non suivi. **Pas d’invalidation de cache ni de test d’envoi du site** : les preuves FR/EN sont les rendus isolés alimentés par le PO, pas une observation d’email livré ou de tous les dictionnaires déjà en cache du site.

Ruff 0.8.1 : tri d’imports, formatage et lint des deux fichiers Python réussis. AST : toutes les méthodes/permissions/critères/création/délivrance hors send_mail inchangés ; la liste d’instructions de send_mail est identique sous l’unique contexte natif ajouté. Contrats recipient/header/args/template/content inchangés. Diff et recherche ciblée de secrets contrôlés. Framework propre à 959b85de, develop 6b791f33 inchangé. Prettier des documents et git diff --check ; pas de réussite du lanceur pre-commit complet revendiquée, hooks désactivés pour les commits.

Aucune suite applicative globale, backend transactionnel, build Vue ou recette navigateur relancé : aucun composant frontend modifié. Pas de compte Email/SMTP/OAuth/notification/template réel lu ou modifié pour tester.

## Livraison, limites et prochain lot

Source/template/tests : **9cfdee8b**, puis catalogues et rapport/handoff dans le commit suivant (SHA via git log -1). Publication normale de B.1 autorisée sous les contrôles finaux ; aucun autre lot automatiquement autorisé.

Le standard historique est centré sur un cours (course_title) : certificat de session sans cours, contenu personnalisé multilingue libre et formats PDF nécessitent leurs propres fixtures/spécifications ; aucun changement métier ajouté pour les prendre en charge ici. La langue de l’email ne modifie pas default_print_language=en du PDF. Le lien relatif est conservé, son traitement effectif par wrapper/client mail non testé. Les modèles personnalisés littéraux peuvent rester anglais par choix de leur auteur ; leur contenu ne devient pas automatiquement français.

Les réserves FR-03 (Settings/accueil/JS/paiements/permissions/a11y/résidus) restent ouvertes. Prochain lot recommandé : **FR-04B.2 demande et rappel d’évaluation**, déduplication exacte et séparation des langues membre/évaluateur, avec effets de bord simulés. Aucun rappel réel ni nouvelle phase démarré. I18N-01 et production exclus ; arrêt après ce pilote.
