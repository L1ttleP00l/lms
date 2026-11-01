# FR-04B.6C.3 — Audit préalable à l’adoption du certificat PDF

1er novembre 2026 (Europe/Paris). Dépôt L1ttleP00l/lms, branche exclusive `littlepool-dev`, base publiée et locale **99bc8a7f26d61d00e96e9a7237fc6d1a395aa844**, checkout initial propre. AGENTS/handoff et rapport C.2B/C.2B.1 consultés.

**Recommandation : ADOPTION BLOQUÉE en l’état sur learning.localhost.** Son format installé, ses personnalisations, son moteur effectif et sa capacité de restauration ne sont pas établis ; ses services sont arrêtés et ne sont pas redémarrés. Cette conclusion n’invalide pas la recette des sites jetables, mais celle-ci ne suffit pas à autoriser une installation existante.

## 1. Versions et architecture confirmées

| Élément                   | Constat                                                                  | Portée de la preuve                                                                       |
| ------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Frappe                    | 17.0.0-dev, commit959b85de4086656273e1d158f41923dd3808c350, arbre propre | Sources partagées présentes ; pas une validation du schéma de la base persistante arrêtée |
| LMS                       | 2.45.2, fork au SHA de référence ci-dessus                               | Version déclarée dans le code, incluant les correctifs LittlePool                         |
| Payments                  | 0.0.1, commit7411976eaefdcb69c06642932e568dbbbc58ec8b                    | Ne pas confondre version applicative et Framework                                         |
| Python /Node              | 3.14.10 /24.22.1                                                         | Binaires réellement interrogés dans un Bench jetable déjà actif                           |
| PlutoPrint /pypdf /PDFium | 0.22.0 /6.21.2 /5.14.0                                                   | Métadonnées des paquets du runtime partagé, sans génération PDF                           |

Référence Payments exacte relevée : **7411976eaefdcb69c06642932e568dbbbc58ec8b**. Aucun code ou paquet installé/mis à jour pendant cet audit.

Le conteneur persistant lms-bench monte `/workspace` entier en lecture/écriture ; le checkout LMS est donc partagé, pas isolé par le seul nom de site. Les deux Bench jetables utilisent des montages privés pour sites/logs/configs/données et le code/runtime partagé en lecture seule. Les changements de code déjà publiés sont présents dans le checkout ; cet audit ne les réapplique pas.

## 2. Sites identifiés et accès réellement utilisé

| Site/ressource                 | Classification                                                                        | État et accès C.3                                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| learning.localhost             | Installation cloud persistante à préserver ; absence de lien production non démontrée | Seul site_config.json découvert dans le Bench principal. lms-bench/lms-mariadb/lms-redis sont exited255 ; fichiers de configuration inspectés uniquement pour présence de clés non secrètes, aucune connexion SQL ni lecture de données métier |
| cert-c1q-source.localhost      | Site jetable explicite C.1Q                                                           | Bench/MariaDB/Redis actifs ; lecture des seules métadonnées de format et de schéma dans une transaction SQL READ ONLY                                                                                                                          |
| cert-c1q-restore.localhost     | Site jetable restauré explicite C.1Q                                                  | Même accès limité, conteneurs distincts du source                                                                                                                                                                                              |
| lms-db, lms-mariadb-incomplete | Conteneurs historiques arrêtés, rôle résiduel non établi                              | Inspection Docker seulement, pas d’accès à leurs bases/volumes. Ni suppression ni qualification comme ressource inutile                                                                                                                        |
| Répertoires Flow               | Outils techniques                                                                     | Non assimilés à des sites Frappe en l’absence de site_config.json                                                                                                                                                                              |

Aucun démarrage, arrêt, redémarrage, recréation, montage, connexion OMV8 ou accès production. Les données persistantes MariaDB sont montées depuis `/workspace/.setup/db-data` ; Redis persistant utilise un volume Docker distinct. Les autres volumes historiques ne sont ni ouverts ni effacés. Leur présence n’est pas une preuve de sauvegarde exploitable.

## 3. État publié et état installé

Le standard Git Certificate cible LMS Certificate, standard=Yes, custom_format=1. HTML exact : include de `templates/print_formats/certificate.html`. CSS JSON conservée ; taille Custom297×210mm, default_print_language=en, moteur déclaré wkhtmltopdf, modified=2026-11-01 13:25:40.780861. Le template partagé conserve les clés gettext/variables/échappements et les deux espacements validés12rem/11rem. Aucun fichier runtime certificate.html voisin du JSON n’a été introduit en C.2B.1.

**Sites jetables, lecture actuelle confirmée** : Certificate correspond aux champs publiés, à la date, au HTML et au CSS (comparaisons et empreintes). Ses dimensions SQL Decimal297.000000000/210.000000000 sont numériquement identiques aux entiers JSON, pas une divergence. Disabled=0. Le format est égal à la source, pas plus ancien ni plus récent. La conformité binaire reste celle de C.2B.1 :18 PDF installés et17 tests ciblés ; ces tests ne sont pas rejoués et aucun PDF n’est créé dans C.3.

**learning.localhost : informations insuffisantes**. Impossible de comparer sans remettre ses services en route ou ouvrir ses données autrement, ce qui n’est pas autorisé. Son Certificate peut être ancien, personnalisé, plus récent ou déjà conforme ; aucun de ces états n’est présumé. Le code du dépôt ne prouve pas le contenu du document installé.

Le champ historique wkhtmltopdf ne suffit pas à identifier le moteur réel : le résolveur installé choisit un générateur reconnu explicite/du format, puis Print Settings ou PlutoPrint, avec replis conditionnels. Les paquets du code partagé sont présents, mais Print Settings, options/hook locaux et fonctionnement effectif du site persistant restent à vérifier. Aucun changement de moteur ou de sandbox proposé implicitement.

## 4. Personnalisations, défauts et références

Sur **chacun des deux jetables**, deux formats pour LMS Certificate : Certificate et le témoin **C1Q Fictional Custom**, standard=No, langue fr, moteur déclaré PlutoPrint, HTML/CSS distincts. Il n’est pas un modèle client et n’est pas pris comme inventaire de learning.localhost.

La lecture des DocField trouve `template` lié à Print Format avec default=NULL. Le champ DocType.default_print_format est NULL en table, mais **un Property Setter pertinent fixe default_print_format à Certificate**. Lire seulement la table DocType ferait donc manquer le défaut effectif. Aucun autre Property Setter du champ template ou de ce défaut trouvé dans ce périmètre sur les jetables. Aucune valeur de certificat métier consultée.

Dans le code LMS, le champ template est choisi parmi les formats LMS Certificate ; les liens Desk/portail et la route certificate construisent le téléchargement avec le format associé au certificat. Les références de schéma ayant options=Print Format et default=Certificate sont au nombre de0 sur les jetables ; cela ne signifie pas qu’aucun certificat réel ne référence ce nom sur une installation existante. **Aucune table LMS Certificate ni donnée personnelle lue**, même pour produire un inventaire de références métier.

À préserver avant adoption cible : tous modèles personnalisés et leurs champs/versions, éventuelle personnalisation homonyme Certificate, Property Setters/defaults, format conservé sur les anciens certificats, includes/surcharges runtime, images/letterheads/CSS et paramètres de langue/moteur. Leur inventaire persistant reste bloquant.

## 5. Synchronisation native : analyse des sources, sans exécution

Sources examinées : modules/import_file.py, contrôleur Print Format, printview et résolveur PDF du Framework **réellement présent**.

-   import_file_by_path lit le JSON et compare modified DB/source. Pour Print Format, **date DB supérieure ou égale → saut sans force**, même si le contenu diffère. La logique de migration_hash de DocType ne sécurise pas un Print Format. Un document plus récent n’est donc ni automatiquement conforme ni autorisé à remplacer.
-   Si la date source est plus récente et que les préconditions passent, import_doc peut remplacer le document existant : before_import, contrôleur, suppression/recréation, insertion, mise à jour du modified d’origine. Ce n’est pas une fusion des champs HTML/CSS personnalisés.
-   Le drapeau externe force=False n’empêche pas `delete_old_doc` d’appeler en interne delete_doc(force=1, for_reload=True). **Cette suppression interne existe dans le mécanisme natif** ; elle doit être couverte par le futur mandat, pas masquée par la seule formulation « import non forcé ».
-   disabled fait partie des valeurs explicitement conservées pour Print Format ; ne pas en déduire la conservation des autres personnalisations. L’import normal utilise des flags ignorant notamment permissions/liens/validations selon son contexte ; le nom du format n’est pas une barrière de protection.
-   before_save/on_update/on_trash et hooks de document peuvent agir. Print Format.on_update invalide les caches de DocType, demande un export selon les conditions natives et peut enlever un défaut désactivé ; on_trash invalide aussi. Une importation future implique donc potentiellement des caches/hooks/exports, pas une simple lecture de fichier. Le mode développeur et les conditions d’export devront être contrôlés avant une opération sur code partagé.
-   printview cherche d’abord certaines surcharges de code avant le HTML en base. Un include en base peut également suivre le template du checkout sans nouvel import du document. Comparer le seul JSON ou modified ne suffit pas.

**Aucun import, migrate, appel de hook, SQL d’écriture, date modifiée ou purge de cache exécuté ici.** Les deux imports C.2B.1 restent des événements antérieurs sur cibles jetables, pas une opération C.3 sur le persistant.

## 6. Sauvegardes : preuves et garanties manquantes

**Confirmé** : backups C.1Q des sites neufs (dump MariaDB gzip, fichiers publics/privés et configuration) et copies de restauration conservés ;8 empreintes vérifiées pendant C.3. Leur restauration dans une seconde cible absente avait été démontrée en C.1Q. Exports Certificate avant/après adoption C.2B.1 présents hors Git. Ces preuves concernent les jetables uniquement ; les sauvegardes C.1Q précèdent même leur correction d’orientation.

**Persistant** : répertoire learning.localhost/private/backups présent,0 fichier régulier observé. Ni common_site_config ni site_config ne déclarent backup_path. Cela ne prouve pas l’absence de sauvegarde distante/externe ; aucun inventaire exhaustif hors de ces emplacements ni lecture de secret/dump n’a été tenté. Existence d’un dump récent cohérent, fichiers associés, configuration/chiffrement, intégrité, rétention, exports de personnalisations et restauration de **cette cible** non établis.

**Risque natif confirmé** : new_backup appelle delete_temp_backups avant génération ; son chemin nettoyé vient de get_backup_path/configuration et peut contenir des archives antérieures. Un simple argument de destination ne garantit pas qu’aucune ancienne archive ne sera supprimée. Aucune commande de sauvegarde/restore lancée pour « vérifier » ce point.

Avant mandat ultérieur, arrêter la procédure tant que l’ensemble des chemins nettoyés, la préservation des archives et la cohérence du dump/fichiers/config ne sont pas définis. Prévoir une destination neuve protégée, inventaire/hashes des copies et permissions ; ne pas publier les secrets/chiffrement. Un volume Docker courant, un ancien conteneur ou une copie brute non validée ne remplace pas une restauration prouvée.

## 7. Matrice de risques et niveau de preuve

| Point                        | Classement                                           | Conclusion pour installation existante                                                                                                                    |
| ---------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Écrasement HTML/CSS homonyme | Confirmé par mécanisme ; présence locale à vérifier  | Arrêt si personnalisation inconnue, même standard=Yes                                                                                                     |
| Certificats déjà délivrés    | Confirmé pour les chemins de téléchargement examinés | Un nouveau téléchargement peut refléter le format/code courant ; aucune mutation des certificats stockés n’est démontrée ou nécessaire                    |
| PDF archivés déjà produits   | Hypothèse conditionnelle                             | Un fichier PDF existant n’est pas automatiquement réécrit par le changement de format ; identifier le stockage réel sans extraire de données personnelles |
| Nouveaux téléchargements     | Confirmé par code ; cible à vérifier                 | Taille, pagination, police et contenus doivent être testés sur cible isolée représentative                                                                |
| Priorités linguistiques      | Confirmé par sources et recette antérieure           | Simple explicite/contexte et Desk/multiple/default en diffèrent ; ne pas imposer la langue du titulaire ni changer le défaut                              |
| Droits d’impression          | Confirmé dans les fonctions, recette antérieure      | Gates natifs maintenus ; droits/options locaux à recontrôler sans élargissement ; réserve FR-03 du personnel toujours ouverte                             |
| Modèles personnalisés        | Confirmé sur jetables ; persistant inconnu           | Formats distincts intacts dans C.2B.1, mais includes partagés et defaults locaux peuvent influencer le rendu                                              |
| Checkout partagé             | Confirmé par montage /workspace                      | Après démarrage, un include déjà installé peut suivre le nouveau template sans import ; effet cible hypothétique tant que HTML persistant inconnu         |
| Moteur/polices               | Confirmé pour runtime jetable ; cible à vérifier     | Ne pas assimiler wkhtmltopdf JSON au moteur effectif ; CairoFont de secours non identifié, pas de garantie sur tailles illimitées                         |
| Relation avec production     | À vérifier                                           | Aucun accès OMV8 ; provenance/criticité des données persistantes non attestées, traiter comme à préserver                                                 |

## 8. Procédure proposée : mandat d’adoption distinct

1. Faire préciser la cible, son propriétaire/périmètre et son éventuelle relation production ; autoriser séparément son accès et, si nécessaire, un démarrage contrôlé. Le présent audit n’autorise aucun redémarrage ultérieur automatique.
2. Définir les protections email/queues/scheduler/réseau et le caractère représentatif d’une copie isolée ; ne pas démarrer l’instance persistante sur la seule confiance dans un site_config. Les clés mute/pause/suspend n’apparaissent pas dans ses fichiers lus ; une autre protection DB/infrastructure est possible mais inconnue.
3. Lire les seules métadonnées nécessaires de la cible : Certificate complet et empreinte/date, modèles/defaults/Property Setters, moteur/config, surcharges/includes ; inventorier les références sous forme agrégée autorisée, sans exporter de certificat ou identité réels.
4. Sauvegarder base/fichiers/config/personnalisations avec méthode sans nettoyage non autorisé, puis vérifier restauration dans une nouvelle cible isolée. Ne pas considérer l’ancienne sauvegarde C.1Q suffisante. Conserver l’état de code et des ressources nécessaires à un retour arrière.
5. Comparer le format : déjà identique → aucune importation nécessaire ; plus récent ou personnalisé/inconnu → arrêter et arbitrer ; plus ancien et conforme à une référence connue → import natif ciblé non forcé seulement sous mandat couvrant ses effets internes. Aucun changement artificiel de modified pour contourner un saut.
6. Vérifier source/DB après cette éventuelle opération. Si import ignoré malgré différence, arrêter ; pas de tentative forcée, migration générale ou purges pour « faire passer ».
7. Produire les PDF depuis le **format réellement installé** sur fixtures : matrice FR/EN courte et longue, trois formateurs, évaluateur/logo, langue du contexte, modèles personnalisés témoins. Mesurer A4 paysage/rotation0/1page, contenus complets, marges/glyphes et inspecter les images ; conserver les limites89 caractères de nom/163 de titre testées en C.2B.1 comme exemples, pas garanties universelles.
8. Recontrôler refus privés avant conversion, publié/titulaire/personnel, defaults et langues. Comparer paramètres, permissions, formats, préférences, queues/comptages autorisés ; séparer Access Logs techniques des écritures métier. Aucun email/délivrance réel.

## 9. Retour arrière envisagé, non exécuté

Conserver sauvegarde complète cohérente, exports avant/après des formats/defaults et version du code partagé. Le retour au seul ancien JSON par import non forcé risque d’être ignoré à cause de la date ; **ne pas résoudre cela par force ou falsification de modified**. Un ancien format utilisant le nouvel include ne retrouverait pas forcément l’ancien rendu sans la bonne version de code.

Préférer une restauration vérifiée en nouvelle cible isolée et une décision de bascule explicite si un retour complet est nécessaire. Toute restauration en place, restauration de volume, modification du routage ou réapplication de personnalisation exigerait son propre cadre/autorisation ; rien de cela n’est commencé. La procédure finale doit être rédigée et testée pour la cible avant adoption, sans suppression de ressources existantes.

## 10. Contrôles C.3 et décisions bloquantes

Exécutés : Git/références, versions de code/runtime, inventaire Docker/sites/montages/backup par métadonnées, lecture des mécanismes Framework ; deux transactions SQL READ ONLY sur les seuls jetables, puis rollback/fermeture, sans bootstrap Frappe/cache/hooks. Tables limitées à Print Format/DocField/DocType/Property Setter ; aucune table de certificat, apprenant ou contenu pédagogique lue. Preuves privées sous /workspace/work/fr04b6c1q/c3 et source/restore/backup/c3-readonly-metadata.json, hors Git. Aucun nouveau PDF, test applicatif, Access Log Frappe, sauvegarde, restauration, import, email ou certificat créé. Les éventuels journaux techniques automatiques du serveur DB ne sont pas assimilés à des écritures métier.

Non exécutés : accès DB persistant, comparaison actuelle du format/defaults/personnalisations de learning.localhost, inventaire métier, recette PDF sur cette cible et sauvegarde/restauration de cette installation. Les17 tests et18 PDF C.2B.1 sont des preuves antérieures réutilisées, pas un résultat de C.3.

Seuls ce rapport et CODEX_HANDOFF.md changent. Sources/catalogues identiques au SHA initial ; références998 FR/3024 POT conservées, sans compilation ni recomptage global. Framework et develop inchangés. Publication documentaire seule autorisée ; aucun autre lot engagé.

**Décisions indispensables : cible/provenance des données, autorisation d’accès/démarrage séparée, inventaire des personnalisations, protection des effets de bord, sauvegarde et restauration prouvées pour cette cible, stratégie de retour arrière et critères d’adoption. ADOPTION BLOQUÉE tant que ces garanties manquent.** Réserves FR-03/B.3/B.4/B.5, diffusion B.5C.2 non adoptée, ancien-format upgrade, polices et priorités de langue conservées ; I18N-01 non commencé. Arrêt après C.3.
