# FR-04B.6C.1 — Préparation de l’adoption du format Certificate

31 octobre 2026 (Europe/Paris). `littlepool-dev`, base locale/distante vérifiée **65360541bdcb3a90c113e0037146b2d48d9784f5**, checkout initial propre. Framework réellement présent, propre : **959b85de4086656273e1d158f41923dd3808c350**. AGENTS/handoff, rapport B.6 et audit A consultés ; sources natives d’import/synchronisation/impression et tests existants examinés.

**Diagnostic uniquement : aucun site jetable suffisamment qualifié n’est disponible. Aucun import, sauvegarde de site, lecture du Print Format installé ou rendu depuis sa base n’a été effectué. L’adoption et le HTML installé restent non validés.** Cette issue est prévue par le mandat ; aucune tentative de création/restauration d’un site pour contourner le blocage.

## 1. Environnement effectivement identifié

| Contrôle non destructif        | Observation                                                                                                                                                                         | Limite / décision                                                                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bench                          | `/workspace/frappe-bench`, application `/workspace/frappe-bench/apps/lms`, lien `/workspace/lms` ; README de configuration et mounts du conteneur concordants                       | Le chemin cloud seul n’établit pas le caractère jetable                                                                                                                                                        |
| Sites configurés dans ce Bench | **learning.localhost** est le seul répertoire doté de site_config.json ; flow-server n’est pas un site configuré identifié par ce critère                                           | Aucun site de recette jetable distinct confirmé. Sites archivés/échecs d’initialisation mentionnés par le README non réactivés                                                                                 |
| MariaDB                        | Configuration effective fusionnée commune/site : db_host=lms-mariadb, port3306 ; identité de connexion relevée uniquement sous empreinte, aucune valeur d’authentification affichée | Pas de connexion SQL. Nom/login/mot de passe de base non exposés ; absence de données personnelles non démontrée                                                                                               |
| Volumes/réseau                 | lms-bench monte /workspace ; MariaDB conserve `/workspace/.setup/db-data` ; Redis utilise un volume Docker ; réseau local lms-dev                                                   | Stockage persistant de développement, non attesté jetable. Aucun montage OMV observé dans ces métadonnées ; ce n’est ni une inspection de production ni une preuve qu’aucune donnée à préserver n’a été copiée |
| Processus                      | Conteneurs Bench/MariaDB/Redis actifs, honcho et processus Python présents ; inspection sans arguments de processus                                                                 | Les rôles exacts worker/scheduler ne sont pas déduits des seuls noms ; aucun processus arrêté/modifié                                                                                                          |
| Protections                    | mute_emails, pause_scheduler, disable_scheduler, suspend_email_queue et pause_queue non renseignés dans les configurations lues                                                     | Cela ne prouve pas leur absence à tout autre niveau, mais **aucun blocage effectif n’est établi**                                                                                                              |
| SMTP/externe                   | Aucun paramètre mail_server/mail_login/smtp_server renseigné dans ces fichiers ; cloud sous politique HTTP restreinte, pas isolement réseau total démontré des conteneurs           | Un Email Account en base peut exister ; aucun accès à sa configuration, aucune tentative SMTP/HTTP métier. Pas de preuve que tout envoi ou job est interdit                                                    |
| Données métier                 | Aucune liste de personnes/certificats interrogée, aucun document confidentiel téléchargé                                                                                            | Absence de vrais apprenants/certificats inconnue ; les anciennes fixtures n’attestent pas que tout le site est fictif                                                                                          |

Le README décrit un environnement de développement isolé et persistant, pas une autorisation de jeter son contenu. Il recommande de préserver les données d’initialisation existantes. **learning.localhost ne satisfait donc pas les conditions d’adoption de ce mandat.** Aucun accès OMV8, production ou préproduction partagé effectué.

## 2. État avant/après et sauvegarde

| Élément                            | État source vérifié                                                                         | État installé avant/après                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Print Format / DocType cible       | Certificate / LMS Certificate, standard=Yes                                                 | Non lu ; existence et provenance de personnalisation inconnues                   |
| HTML source                        | `{% include 'templates/print_formats/certificate.html' %}`                                  | Non lu, non importé, non déclaré conforme                                        |
| Paramètres                         | default_print_language=en ; pdf_generator=wkhtmltopdf historique ; CSS/version B.6 présents | Aucun changement ; moteur installé opérationnel non vérifié                      |
| Date source modified               | 2026-10-31 22:06:36.049122                                                                  | Date DB inconnue, aucune comparaison live                                        |
| Template inclus                    | Fichier présent, SHA256 `6508befe83cfbf7ef326b193f75552c0cc65f08745e203bd60a29a68f8647d1a`  | Résolution depuis un format installé non testée                                  |
| CSS source                         | SHA256 `828dc54a9e4c01bf2b21bce9bf4b0ba1b127ce94daa871ec622adc71d940fb7d`                   | CSS installé non exporté/comparé                                                 |
| Formats personnalisés / références | Sélection native explicite et repli via Property Setter/default_print_format étudiés en B.6 | Aucun inventaire DB, aucune substitution, référence ou personnalisation modifiée |

**Sauvegarde vérifiée : non.** Aucun fichier dans le répertoire par défaut private/backups du site au moment du contrôle ; d’éventuelles copies ailleurs ne sont pas inventoriées. Aucune sauvegarde créée, déplacée ou supprimée : la sauvegarde était autorisée seulement pour un site jetable confirmé.

Outils disponibles : commandes natives backup/restore présentes dans les sources Bench/Frappe ; mariadb-dump, mysqldump, mariadb/mysql, tar et gzip trouvés dans le conteneur par recherche d’exécutables, sans lancer de dump ni de connexion. La présence des outils ne valide ni leurs accès ni une restauration.

Point de vigilance confirmé : le CLI backup utilise scheduled_backup/new_backup ; new_backup appelle **delete_temp_backups**, susceptible de supprimer des fichiers anciens du répertoire de sauvegarde selon keep_backups_for_hours/défaut. Ne pas lancer ce chemin avant d’avoir protégé les sauvegardes antérieures et vérifié qu’aucune suppression interdite ne peut survenir. Aucun nettoyage natif exécuté ici.

## 3. Contrat natif d’import confirmé par lecture

Sources : frappe/model/sync.py, frappe/modules/import_file.py, printing/doctype/print_format/print_format.py et modules/utils.py, au SHA Framework ci-dessus.

1. sync référence les Print Formats et appelle import_file_by_path, puis commit si import. Un migrate général traiterait bien davantage qu’un format : **non utilisé**.
2. import_file_by_path lit le JSON, calcule un hash et examine modified en base. Pour un **Print Format** existant, sans force, une date DB égale ou plus récente conduit au saut. Le traitement migration_hash spécifique aux DocTypes ne doit pas être attribué à Certificate.
3. Document absent ou source plus récente : l’import peut continuer. force=True contournerait ces garde-fous : **interdit pour cette recette**. La protection particulière des Kanban Boards personnalisés n’est pas une protection générale des Print Formats homonymes.
4. import_doc active in_import, prépare le contrôleur/document, charge d’éventuelles propriétés de code, exécute before_import et un prétraitement éventuel. Si le nom existe, **delete_old_doc peut supprimer l’ancien document**, puis insert le recrée avec le même nom ; ce n’est pas une simple mise à jour du HTML.
5. Le delete interne utilise force=1/for_reload=True et peut préserver certains enfants/valeurs selon les listes d’exception et reset_permissions. Cette force interne du Framework ne doit pas être confondue avec une autorisation d’utiliser force=True à l’import ; elle explique le besoin d’une vraie sauvegarde.
6. Hors data_import, plusieurs validations de liens/permissions/obligatoires sont ignorées par les flags natifs. Cela n’est pas une garantie d’absence d’effets de bord ; ne pas détourner cette API pour modifier des droits.
7. Les hooks du document peuvent s’exécuter. Print Format.on_trash/on_update invalident notamment les caches du DocType ; on_update peut aussi ajuster un format par défaut s’il est désactivé. L’export développeur est normalement inhibé par in_import. Les hooks installés supplémentaires ne sont pas inventoriés sur un site jetable, puisqu’il n’y en a pas de confirmé.
8. La date source est réappliquée après import. Le CLI execute délègue à commands/execute.py, dont le chemin normal commit : ne pas traiter son appel comme un essai automatiquement annulé. Les écritures/hook/cache ne se résument pas à un SELECT.

Les références à Certificate conservent en principe le même nom, mais une suppression/recréation peut affecter enfants, métadonnées et hooks ; pas de garantie de préservation déduite du seul nom. Aucune suppression/recréation, écriture SQL directe ou modification de code Framework réalisée.

## 4. Idempotence : analyse, pas recette accomplie

Avec la même source et un document réimporté à sa date source, un prochain import non forcé devrait être sauté par la comparaison de dates. C’est un **comportement attendu du code**, pas une idempotence expérimentale démontrée ici. Une personnalisation à date égale/récente peut aussi être sautée ; le saut ne prouve donc pas que le HTML est déjà identique.

Si le document est plus récent : constater son état/provenance et **arrêter sans force**, sans retoucher modified pour obtenir l’import. Ne pas répéter les imports jusqu’à réussir. En cas d’erreur, arrêter le processus de recette et conserver le diagnostic ; ne pas réutiliser aveuglément un contexte d’import en échec. Un db.rollback seul ne prouve pas le retour arrière d’écritures déjà commit ou d’effets sur les caches/fichiers.

## 5. Procédure de préparation à approuver séparément

Ce plan **n’est pas exécuté** et n’autorise pas à modifier learning.localhost.

### A. Qualifier un site existant réellement jetable

Obtenir une attestation explicite pour son nom, propriétaire et destruction/restauration possible. Identifier Bench/version, base, volumes/fichiers, réseau et absence de partage avec toute production/donnée à préserver. Vérifier uniquement sur ce site qualifié que les membres, cours et certificats sont fictifs ; ne pas lire de données réelles pour satisfaire cette exigence. Ne pas créer/supprimer de site dans le présent mandat.

Démontrer le blocage du transport SMTP, d’Email Queue/Communication/Notification Log non attendues, de Redis enqueue, schedulers/workers et connexions externes, pas seulement une option absente. Les imports/hooks doivent rester possibles dans une portée explicitement contrôlée ; aucune délivrance, upload/File, DocShare, préférence ou LMS Settings ne doit être modifiée. Mettre les protections en place requerra son mandat propre si elles n’existent pas déjà.

### B. Préserver et vérifier avant toute écriture

Sur le seul site qualifié : exporter hors Git les formats complets (HTML/CSS, défaut langue, moteur, standard/personnalisé, modified, origine des adaptations), références Property Setter et documents fictifs, métadonnées de permissions. Comparer Certificate à la source et tous les formats personnalisés distincts ; origine inconnue → arrêt.

Prévoir une sauvegarde native complète base + fichiers publics/privés + configuration nécessaire, dans un emplacement protégé hors Git. Vérifier auparavant les nettoyages automatiques, puis préserver toute sauvegarde antérieure sans la supprimer. Inventorier tailles/empreintes et intégrité des archives/dump, liens de configuration et clé de restauration si nécessaire, sans publier leur contenu ni secrets. La sauvegarde peut contenir des credentials : droits restreints, jamais dans les logs Git.

Vérifier la restauration par une procédure approuvée sur le **seul site jetable**, sans créer un autre site dans cette mission et sans exposer la base au réseau métier. Une vérification d’archive seule n’est pas une restauration testée. Ne pas démarrer l’import tant que le niveau de restauration requis n’est pas établi.

### C. Import natif ciblé unique, sous garde

Après tous les critères remplis, le chemin candidat est le CLI Bench du site jetable vers **frappe.modules.import_file.import_file_by_path**, avec uniquement le JSON `lms/lms/print_format/certificate/certificate.json`, `force=False` et sans reset_permissions. Le nom du site sera arrêté dans le mandat de reprise, pas remplacé par learning.localhost par défaut. Aucun migrate, mise à jour SQL, reload forcé ou source modifiée pour influencer la comparaison.

Consigner le booléen retourné et la cause du saut éventuel. Si date DB plus récente/égale sans contenu conforme : arrêter. Si import : vérifier depuis une nouvelle lecture native l’include exact, CSS, doc_type, standard, langue en, paramètres et format choisi ; mesurer les modifications attendues de métadonnées/hooks sans les confondre avec zéro écriture. Comparer formats personnalisés, références et permissions à l’état sauvegardé. Vérifier aucune création/modification de certificat, email, queue, Communication, File ou données métier sensibles.

### D. HTML installé et permissions sur objets fictifs

Utiliser le format **relu en base après import**, le Jinja natif et MO existants, sans convertir en PDF. Cas : FR/EN, noms/titres accentués ou HTML, date civile, évaluateur ou un/plusieurs formateurs, logo absent/présent, repli et contexte restauré ; format d’auteur distinct avec/sans langue, littéraux inchangés. Les liens Google Fonts restent inertes : aucune navigation/téléchargement externe.

Tester les droits sur objets fictifs : titulaire, membre tiers privé, Guest privé, certificat publié, administrateur/Moderator/Course Creator/Batch Evaluator selon règles actuelles. Conserver les droits parfois larges du personnel sans les homologuer ; aucun rôle, DocShare, publication, inscription ou évaluation modifié.

### E. Retour arrière reproductible à faire valider

Arrêter les manipulations, garder journaux expurgés et empreintes, maintenir les blocages de jobs/envois. Restaurer **le site jetable identifié**, avec dump + archives publiques/privées et configuration conservée, par le restore natif correspondant à la version sauvegardée. Les options natives with-public-files/with-private-files et la gestion protégée de la clé doivent être vérifiées dans ce contexte ; jamais de secret dans une ligne de commande ou le rapport. Ne pas employer un import forcé de l’ancien JSON comme retour arrière.

Relire formats, références, permissions et compteurs de données fictives ; comparer à la sauvegarde et constater le résultat. Aucun retour arrière effectué/testé ici, aucune sauvegarde supprimée. La stratégie ne doit pas inclure de site partagé ni production ; si la restauration ne peut pas être exercée en sécurité, rester à la préparation.

## 6. Vérifications exécutées et non exécutées

**Nouveaux tests applicatifs réussis : 0 ; aucun lancé.** Contrôles réellement réalisés : branche/HEAD/distant, lecture des sources, découverte des sites/configurations via champs non secrets, mounts/réseau/processus sans arguments, présence des exécutables de sauvegarde, métadonnées source et empreintes, intégrité Git/catalogues/Framework, format/diff et recherche de secrets. Aucune connexion Frappe/SQL ou requête utilisateur réelle.

Les **14 tests HTML isolés et deux rendus depuis MO de B.6** restent une preuve historique réutilisable du rendu source, non relancée ; ils ne deviennent pas une preuve d’import ou d’HTML installé par citation. Les anciens tests transactionnels de certificats ne sont pas exécutés. Pas de test complémentaire versionné : le blocage d’environnement ne justifie pas de répéter ces assertions.

| Résultat demandé                         | État de C.1                                           |
| ---------------------------------------- | ----------------------------------------------------- |
| Site jetable confirmé                    | Non                                                   |
| Sauvegarde vérifiée/restauration exercée | Non / non                                             |
| Import natif ciblé                       | Non effectué                                          |
| État personnalisé avant/après            | Non lu, non modifié                                   |
| HTML installé FR/EN conforme             | Non vérifié                                           |
| Permissions/modèles préservés            | Aucun changement effectué ; recette live non réalisée |
| Certificat/email/écriture métier         | Zéro                                                  |
| PDF binaire                              | Non lancé, réservé à C.2                              |

Deux fichiers seulement sont publiables : ce rapport et CODEX_HANDOFF.md. Sources, format/template, routes/tests, PO/POT, Framework et develop inchangés. Valeurs de référence B.6 inchangées : **998 FR, 3 024 clés POT**, 78 autres PO intacts. Pas de compilation, extraction, purge, migration, import, campagne ou déploiement.

## 7. Réserves et prochaine action précise

La préparation **ne lève pas** la réserve d’adoption B.6. Le rappel B.3 reste non synchronisé ; la politique B.5C.2 reste proposée, non adoptée. Limites B.4/B.5 (langues, portail, offsets, liens/Markdown, indicateurs) et FR-03 A–E, dont lecture large du personnel, conservées. Aucune production, OMV8, permission ou campagne touchée ; I18N-01 non commencé.

**Prochaine action : faire confirmer/provisionner sous mandat distinct un site réellement jetable et isolé, avec protections et restauration vérifiables, puis reprendre les étapes B–D de C.1.** Ne pas passer directement à la recette binaire : FR-04B.6C.2 reste à autoriser après adoption/HTML installé validés et disponibilité de ressources hors réseau. Aucun téléchargement de police ou génération PDF dans cette mission.

Publication documentaire normale autorisée après contrôles du distant, diff limité, absence de secrets et identité GitHub ; cette publication n’est pas une adoption technique. Arrêt après C.1.
