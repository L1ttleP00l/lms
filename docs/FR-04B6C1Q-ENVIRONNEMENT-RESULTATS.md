# FR-04B.6C.1Q — Environnement indépendant et adoption conditionnelle

31 octobre 2026 (Europe/Paris). `littlepool-dev`, base locale/distante vérifiée **9c864a63464333a52a2460007443f9f7bdb168e8**, Framework **959b85de4086656273e1d158f41923dd3808c350** propre. AGENTS/handoff, rapports B.6 et C.1 et mécanismes natifs réutilisés. Aucun changement du Framework, des sources applicatives ou des catalogues.

**Résultat : deux cibles neuves indépendantes qualifiées, sauvegarde complète et restauration vérifiées, HTML du format installé conforme en FR/EN.** Certificate avait déjà été adopté par l’installation native de LMS neuf ; l’unique import ciblé supplémentaire sans forçage retourne **False** (date égale, état déjà conforme). **Aucune mise à niveau d’un ancien format ni PDF binaire testés.** Aucun certificat ou email réel, aucune opération sur learning.localhost ou la production.

## 1. Existant et conditions préalables

C.1 avait correctement refusé d’opérer learning.localhost : site persistant, garanties manquantes. Il n’a été ni arrêté, renommé, restauré, migré, reconfiguré ou utilisé comme base de recette. Aucune donnée métier de ce site copiée. Les identifiants et StartedAt des trois services lms-bench/lms-mariadb/lms-redis ainsi que les empreintes des configurations commune/site sont identiques avant/après. Ces vérifications ne prétendent pas que ses activités autonomes sont figées ; aucune connexion SQL à sa base n’a été ouverte par ce lot.

Préparation : daemon Docker local vérifié explicitement via socket, driver vfs ; Docker Compose v2.40.3, images frappe/bench:latest, mariadb:11.8 et redis:7-alpine déjà en cache. Création avec IDs d’images locaux et politique **never pull**, sans build/pip/npm/téléchargement Internet. Python existant3.14.10 et dépendances réutilisés. Environ30 Gio libres avant préparation, environ17 Gio à la fin ; mémoire disponible initiale environ8 Gio. Quotas appliqués aux nouveaux conteneurs : Bench2 Gio/2CPU, MariaDB768 Mio/1CPU, Redis128 Mio/0,5CPU par cible. Aucune promesse de capacité pour un futur moteur PDF.

Les noms de projet/conteneurs, chemins et bases ont été vérifiés sans collision avant création. Aucun volume existant, .setup/db-data ou répertoire de site persistant monté dans les nouvelles cibles. Aucun prune, arrêt/recréation d’un conteneur existant ou nettoyage global.

## 2. Architecture réellement créée

Projet Compose neuf : **lp-cert-c1q-9c864a63**. Six conteneurs (Bench, MariaDB, Redis pour chaque cible), tous sans ports publiés, non privilégiés, réseau **none**, sans worker/scheduler lancé. Répertoire privé hors Git : `/workspace/work/fr04b6c1q/`.

| Cible              | Site                       | Ressources propres                                                                                                |
| ------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Source jetable     | cert-c1q-source.localhost  | Bench/sites/logs/configuration, MariaDB/data/socket, Redis/data/socket, secrets neufs et sauvegardes sous source/ |
| Restauration neuve | cert-c1q-restore.localhost | Même séparation sous restore/ ; site/base inexistants avant restauration, aucun ancien site écrasé                |

Les chemins internes des Bench restent canoniques `/workspace/frappe-bench` pour compatibilité des chemins Python ; leurs **montages hôtes et configurations sont distincts**. Le code Frappe/Payments/LMS et le venv sont les seules ressources de développement partagées, **en lecture seule**, autorisées par le mandat. Ce n’est pas une duplication indépendante de tous les octets de dépendances ni une VM séparée ; aucun site/configuration/volume métier persistant n’est partagé. Catalogues MO statiques copiés dans les assets neufs, pas données métier.

Chaque conteneur a sa propre interface loopback et aucune route externe. MariaDB utilise skip-networking et un socket Unix de sa cible ; Redis port0 et son propre socket Unix. Bench ne dispose ni du Docker socket ni d’un montage de /workspace entier. Pas de serveur web, port public ou routage vers un système métier. Les conteneurs fonctionnent à l’UID/GID1000 ; identités et mots de passe de test générés localement, protégés, distincts des secrets persistants et jamais publiés.

Le projet et ses fichiers opérationnels, configurations, sauvegardes, scripts et journaux restent **hors Git**. Toutes les ressources créées sont conservées ; aucun site, volume, conteneur ou archive supprimé, même créé pendant le lot. Une éventuelle suppression nécessitera une validation spécifique.

## 3. Protections démontrées

-   Inspection des six configurations Docker : network_mode=none, aucun port publié, montages RW uniquement dans le nouveau répertoire ; code/runtime RO, aucun accès au stockage de learning.localhost.
-   Sur chaque Bench neuf : interfaces=[lo], aucune route. Connexions uniquement vers **192.0.2.10, adresse réservée de documentation**, ports25/465/587/443 : **8/8 bloquées ENETUNREACH** au total, aucun prestataire contacté. Les proxys hérités ne donnent pas une route à ces conteneurs.
-   Connexion native aux seuls sockets propres à chaque cible ; MariaDB @@skip_networking=1 et Redis port=0 confirmés. Avant initialisation/restauration, absence de la base et du compte applicatifs cibles vérifiée dans leurs nouveaux MariaDB.
-   Configurations neuves mute_emails/pause_scheduler/disable_scheduler/suspend_email_queue et maintenance, complétées par absence de worker/scheduler et interceptions de transport. Ce ne sont donc pas seulement des champs vides. Aucun compte email, destinataire réel ou donnée métier importé.
-   Installation native avec sendmail/enqueue/enqueue_doc interceptés : **0 appel sendmail**, quatre demandes de jobs capturées sans mise en Redis ; 0 worker lancé. Après installation, restauration et contrôles : aucun rq:job:\* attendu, Email Account/Email Queue/Communication vides.

Les nouveaux sites comportent seulement Administrator et Guest comme comptes initiaux, aucun compte apprenant réel. LMS Certificate, LMS Course, LMS Batch, inscriptions de cours/sessions, Email Account, Email Queue, Communication et DocShare sont à **0** dans les instantanés contrôlés. Les tables/rôles/permissions de base sont initialisés par les applications, sans modification manuelle de la politique de droits ni impact sur les sites existants. L’installation initiale n’est pas un bench migrate sur un environnement existant.

## 4. Préservation et sauvegarde réellement réalisées

Avant tout import ciblé : un format **C1Q Fictional Custom** distinct est créé dans le seul site neuf, avec HTML/CSS littéraux fictifs, standard=No et langue fr. Deux fichiers texte entièrement fictifs sont placés dans public/files et private/files pour prouver une restauration de contenu ; aucun upload/File métier ou certificat utilisé.

Snapshot source : applications, nombre de tables, compteurs, empreintes complètes des lignes Print Format/DocPerm/Custom DocPerm/Role/Property Setter, empreintes des fichiers fictifs. CSS, HTML/include, doc_type, défaut en, moteur historique et date de Certificate conformes au JSON source ; aucune personnalisation homonyme inconnue.

Répertoire de sauvegarde natif par défaut **vide** contrôlé avant new_backup : sa routine delete_temp_backups n’a donc aucune archive antérieure à supprimer. Destination distincte neuve, droits protégés, umask077. `new_backup` natif effectue un dump frais avec force de **sauvegarde**, pas force d’import, et les fichiers publics/privés/configuration.

**Quatre artefacts produits et vérifiés** : dump gzip lu entièrement (intégrité), deux archives tar avec les fichiers fictifs attendus, configuration JSON identique à celle sauvegardée ; taille positive, SHA256 et modes sans accès groupe/autres vérifiés. Snapshot source inchangé après sauvegarde. Les copies de sauvegarde contiennent les secrets techniques nécessaires : protégées hors Git, aucun contenu affiché. Aucune sauvegarde préexistante supprimée.

## 5. Restauration native dans une cible absente

Les quatre artefacts sont copiés uniquement du site source **neuf** vers le répertoire incoming neuf de la cible restore, empreintes identiques. Aucun fichier ou dump de learning.localhost utilisé.

Restauration par le moteur natif Frappe `_new_site(source_sql=…, force=False)` après `validate_database_sql`, vers un nom de base/compte/site **préalablement inexistants**. Le CLI restore habituel délègue à ce moteur mais force sa création ; ce raccourci n’a pas été utilisé. Les opérations natives DROP IF EXISTS de bootstrap concernent une cible prouvée absente, pas une base existante. Aucun ancien site, compte, volume ou donnée à préserver écrasé.

Fichiers restaurés par `frappe.installer.extract_files`, avec répertoires publics/privés de destination vides avant extraction. Configuration de test restaurée en conservant uniquement les connexions/credentials de la **nouvelle base indépendante** ; autres clés identiques à la sauvegarde. Aucun secret réemployé depuis production ou le site persistant.

Comparaisons réussies : applications et nombre de tables, tous compteurs suivis, cinq ensembles de métadonnées/permissions hachés et fichiers publics/privés identiques ; configuration utile concordante hors différences de connexion intentionnelles. Les métadonnées du modèle personnalisé sont incluses. Ce contrôle valide ces ensembles et la restauration effective, **pas une identité binaire de toutes les pages SQL ou un scénario contenant des données pédagogiques réelles**. Site source inchangé ; sauvegardes et copies conservées.

## 6. Adoption : état installé et import non forcé

Après restauration vérifiée, le format Certificate est lu en base source et comparé à Git :

-   HTML exact : `{% include 'templates/print_formats/certificate.html' %}`.
-   CSS, doc_type=LMS Certificate, standard=Yes, default_print_language=en, pdf_generator historique et date concordants.
-   Le format a déjà été installé nativement depuis le code B.6 lors de l’installation initiale LMS ; sa date est égale à la source, pas artificiellement retouchée.

**Un seul appel ciblé import_file_by_path(..., force=False)** : retourne **False**, comportement attendu de comparaison des dates. Relire le format confirme le même contenu. Snapshots avant/après identiques pour formats, références, permissions, compteurs et fichiers. Aucune seconde tentative, force, modification de date, SQL de correction ou migration.

Cela démontre une **installation neuve conforme**, une restauration conforme et l’absence de réécriture nécessaire lors de la répétition non forcée à version identique. **Ce n’est pas la preuve d’une mise à niveau réussie d’un ancien Print Format installé** : cette situation n’a pas été fabriquée. Un format homonyme personnalisé ou plus récent aurait arrêté l’import. Sur la cible restaurée, aucun import supplémentaire effectué ; son contenu provient du dump vérifié.

La présence du template dans Git n’est pas utilisée seule comme preuve : HTML et paramètres relus dans les deux bases, puis rendus effectifs ci-dessous. Les caches sont propres aux deux nouveaux Redis ; aucune purge manuelle du site persistant ou synchronisation B.3.

## 7. HTML installé, langue et permissions

**32 méthodes de test réussies** : 16 sur le format relu dans chaque base (14 méthodes B.6 réutilisées +2 contrôles de format personnalisé installé et droits du personnel). Le harnais natif printview/Jinja/permission reste isolé pour les données de certificat ; son format et dictionnaire proviennent cette fois des bases installées et du MO998. Pas une relance des anciennes suites globales ni un certificat inséré.

En complément, **8 rendus directs réussis** (4 par site) avec le vrai chargeur Jinja du site et les traductions compilées natives, **sans remplacer get_all_translations ni le chargeur**. Seules les lectures correspondant à des identités/cours/formateurs fictifs sont interceptées ; les autres lectures restent sur les métadonnées neuves. HTML lu dans Print Format, include réellement résolu.

Cas couverts : FR/EN, langue explicite/repli, noms et titres accentués/HTML échappés, date civile FR/EN sans conversion, évaluateur ou formateurs, plusieurs formateurs, logo présent/absent, modèle personnalisé distinct inchangé, contexte linguistique restauré, URLs et règles d’impression héritées. default_print_language=en n’est pas changé ; différences simple/Desk/multiple établies en B.6 maintenues.

Les tests de permissions utilisent des objets de certificat fictifs : titulaire privé, tiers/Guest privé refusés, publié, Moderator/Course Creator/Batch Evaluator et administrateur selon droits existants. Les empreintes de permissions réellement stockées ne changent pas. **La lecture large de certains personnels demeure une réserve FR-03**, pas une nouvelle homologation des accès ou une restriction ajoutée.

Les tests de la frontière download retournent un sentinelle HTML encodé et le writer multiple est arrêté/mocker avant conversion : **aucun PDF binaire**. Aucune session HTTP/navigateur réelle ni téléchargement de police. Les URL Google Fonts présentes dans le template restent du texte non chargé. Les données fictives de rendu ne sont pas persistées ; Certificate/DocShare/Email Queue restent à0, aucun contenu pédagogique créé ou modifié.

## 8. Incidents et limites des preuves

-   Préparation initiale : chown vers UID999 refusé par le filesystem géré, avant création Docker. Lecture des entrypoints locaux confirme le mode non-root ; configuration revue vers UID/GID1000, puis validée par Compose et démarrage réel, sans suppression ni téléchargement.
-   Installation, sauvegarde, restauration et les 32 méthodes sur bases installées passent. L’extension de rendu direct rencontre deux défauts de harnais sur les deux cibles : signature get_value ne couvrant pas son appel keyword, puis lecture des formateurs passant par safe_get_all plutôt que get_all. Interceptions des seules lectures fictives adaptées ; aucun changement de Framework, de format ou de droits. Les huit rendus finaux passent ; les échecs intermédiaires ne sont pas présentés comme réussites.
-   Les traces applicatives sont expurgées à la collecte des credentials neufs ; contrôle ultérieur sans correspondance de leurs valeurs dans les journaux expurgés. Scripts/configurations/dumps/manifests restent hors Git, seul le constat documentaire est publié.
-   Isolation démontrée pour cette architecture et ces opérations : même daemon/hôte et ressources code/runtime RO communs, pas d’infrastructure physiquement séparée ni test d’évasion de conteneur. Aucune ressource métier persistante montable par ce projet.
-   Aucune validation de mise à niveau d’ancien format, de PDF/pagination/polices binaires, de SMTP ou de données réelles. La conformité source installée sur ces nouveaux sites ne corrige pas automatiquement un format sur learning.localhost.

## 9. État final et conservation

Projet neuf conservé, six conteneurs toujours dédiés (Bench en sleep, MariaDB/Redis techniques), zéro worker/scheduler, aucune interface réseau externe. Aucun conteneur/site/volume/archive supprimé ou nettoyé. Sauvegarde complète et copie de restauration conservées sous le répertoire privé hors Git ; réutilisation future soumise à vérification des versions et invariants. Aucun fichier de configuration de site, secret, dump, fixture ou script opérationnel publié.

Services persistants : mêmes IDs et dates de démarrage ; configurations hachées inchangées, aucune action vers leur base. Aucun accès OMV8, campagne, modification de learning.localhost, Framework ou develop, PR/Crowdin/migration globale. Sources et catalogues inchangés : **998 traductions FR et 3 024 clés POT**, 78 autres PO conservés.

La politique de diffusion B.5C.2 reste proposée, non adoptée ; réserves FR-03/B.3/B.4/B.5 conservées, synchronisation du rappel B.3 non effectuée. La réserve d’absence d’environnement jetable de C.1 est levée **pour ces deux cibles qualifiées**, pas pour le site persistant. La réserve PDF binaire reste entière ; I18N-01 non commencé.

**Prochaine étape possible : mandat FR-04B.6C.2**, sur ces cibles exclusivement après recontrôle de leur état, pour étudier un rendu PDF sans téléchargement externe et la disponibilité des ressources locales. Aucune installation de police ou génération PDF commencée ici. Le scénario de mise à niveau d’un ancien format nécessitera sa recette distincte si demandé, sans date artificielle ou forçage.

Deux fichiers documentaires livrés : ce rapport et CODEX_HANDOFF.md, publication normale autorisée après contrôles. Preuves privées : final-summary.json, snapshots et résultats dans source/backup et restore/backup sous `/workspace/work/fr04b6c1q/` ; ne pas publier ni afficher les artefacts de sauvegarde/configuration. Arrêt après ce mandat.
