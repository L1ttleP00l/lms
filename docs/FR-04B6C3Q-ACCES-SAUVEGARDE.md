# FR-04B.6C.3Q — Qualification des accès et des sauvegardes

1er novembre 2026 (Europe/Paris), `littlepool-dev`, base locale/distante **ae0bc7d3682a00cdc9f177524e04534638985eef**, checkout initial propre. AGENTS, CODEX_HANDOFF et audit C.3 consultés ; compétence cloud appliquée. Mission documentaire, aucun accès au contenu des bases, secret ou certificat métier.

**Décision : ACCÈS ENCORE BLOQUÉ.** Une stratégie est définie, mais le droit de lecture du répertoire MariaDB et son volume réel ne sont pas établis ; il est inaccessible dans l’identité courante. Le redémarrage de MariaDB originale ne respecte pas l’objectif « aucune modification persistante ». La première intervention à autoriser est une qualification de lecture de métadonnées en contexte de maintenance approprié, pas encore une copie ou une adoption.

## 1. État confirmé de l’installation et des ressources

Les identités de C.3 sont retrouvées : lms-bench4f3005cf…, lms-mariadb88752650…, lms-redis80261e05…. Tous restent exited255, OOMKilled=false, erreur Docker vide ; restart=no. Dates de fin groupées le1er novembre2026 vers03:43:36 Europe/Paris. Aucune action de cycle de vie réalisée.

| Ressource              | Constat actuel                                                                                                                                                                  | Risque/limite                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lms-bench              | Même image Bench en cache ; commande technique sleep, montage RW de /workspace entier                                                                                           | Le checkout et les fichiers persistants sont partagés. La commande Docker seule ne décrit pas tous les processus qu’un script/opérateur pourrait lancer après démarrage |
| lms-mariadb            | Image MariaDB identique à la référence C.1Q, entrée Docker native ; bind RW /workspace/.setup/db-data→/var/lib/mysql ; injection d’authentification par fichier existant non lu | Un serveur lancé peut écrire la récupération, journaux, fichiers système ou données ; pas un accès sans modification                                                    |
| lms-redis              | Volume Docker distinct et conservé ; entrée Redis native                                                                                                                        | Contenu/queues inconnus ; ne pas relancer un Redis contenant potentiellement des jobs réels dans une copie applicative                                                  |
| lms-db historique      | Arrêté ; volume MariaDB distinct et accès RW au parent /workspace/.setup                                                                                                        | Rôle non établi ; ni sauvegarde ni copie de référence présumée, aucune suppression                                                                                      |
| lms-mariadb-incomplete | Arrêté ; autre bind historique                                                                                                                                                  | Nom/ancien échec ne prouvent pas que ses données soient jetables                                                                                                        |
| Projet jetable C.1Q    | Ressources distinctes conservées                                                                                                                                                | Les backups/recettes antérieurs ne qualifient pas les données persistantes                                                                                              |

Le daemon local répond, driver vfs. Le réseau persistant **lms-dev est un bridge non interne**, avec0 conteneur attaché observé au moment de l’audit. Cela ne garantit pas l’absence d’egress lors d’un démarrage. Ports Bench configurés8000/9000 sur loopback hôte ; DB/Redis sans port hôte publié. Absence de port publié ne signifie pas absence de TCP entre conteneurs.

Les noms des variables HTTP(S)\_PROXY sont présents dans les configurations Docker ; **aucune valeur affichée ou modifiée**. Le réseau, les proxies, le scheduler et SMTP ne doivent pas être supposés neutralisés par les anciens réglages cloud. Les clés de suspension absentes des fichiers avaient été constatées dans C.3 ; aucune relecture des contenus de configuration sensibles dans C.3Q.

## 2. Cause des arrêts : ce qui peut être conclu

Inspection d’état : même code255, pas de preuve OOM, pas de message d’erreur Docker. Les100 dernières lignes disponibles de MariaDB ont été classées par marqueurs techniques sans publier leur contenu : présence de ready for connections et de crash recovery ; pas de marqueur de fin d’arrêt propre dans cette fenêtre. Bench ne fournit pas de lignes retenues ; Redis n’apporte pas de cause explicite dans les marqueurs examinés. La requête bornée d’événements Docker autour de l’heure d’arrêt ne renvoie aucun événement conservé.

**Confirmé** : arrêt simultané et politique sans redémarrage automatique. **Hypothèse seulement** : incident du runtime/cloud, cohérent avec l’interruption observée mais non prouvé. Les traces de recovery peuvent concerner un démarrage antérieur ; elles ne prouvent pas la cause du dernier arrêt ni l’intégrité de la base. Pas d’investigation longue, redémarrage « pour voir » ou modification de configuration.

## 3. Droit de lecture et capacité : nouveau blocage concret

`stat` sur /workspace/.setup/db-data : répertoire mode0700, UID/GID affichés **65534:65534**. Identité d’exécution1000 ; /proc/self/uid_map et gid_map ne montrent qu’un mapping d’une identité (1000 vers0 extérieur). L’identité propriétaire réelle du stockage n’est donc pas utilisable/démontrée depuis ce contexte ;65534 peut être une représentation d’identité non mappée, **pas un UID à choisir aveuglément dans un conteneur**.

Le parcours de taille `du -sb` est refusé par le système. Son0 suivi de Permission denied est un **échec de mesure**, pas une base vide. Aucun chmod/chown/ACL, changement de namespace, élévation ou tentative de lecture des fichiers n’a suivi.

Tailles apparentes agrégées accessibles : public/files0 octet observé, private/files73728 octets. Ce sont des métadonnées de taille, pas un inventaire de contenu ni une preuve d’absence de données personnelles ; liens externes, stockage objet, fichiers hors de ces chemins et cohérence temporelle inconnus. Environ17 Gio disque libres et8 Gio de mémoire disponible ; **impossible de certifier la capacité de copie/restauration sans taille fiable de MariaDB**, en incluant les copies de travail, archives et marge de récupération.

Les conteneurs pouvant accéder au chemin DB par un montage RW exact ou parent sont lms-mariadb, lms-bench et lms-db : tous arrêtés. Aucun conteneur actif avec ce montage englobant n’a été trouvé. Cela n’atteste pas l’absence d’un autre écrivain hôte, d’un agent externe ou d’un mécanisme de synchronisation ; gel/absence d’écrivain à recontrôler et faire attester avant toute copie.

## 4. Comparaison des méthodes d’accès

| Méthode                                                                 | Avantage                                                                              | Écritures/risques                                                                                                                 | Décision                                                                             |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| SQL READ ONLY sur serveur déjà actif                                    | Sélection précise des seules métadonnées                                              | Nécessite serveur actif et autorisation ; des journaux techniques serveur peuvent exister                                         | Impossible actuellement sur la source arrêtée ; aucun SQL exécuté dans C.3Q          |
| Lecture brute des fichiers InnoDB/MyISAM                                | Évite de lancer un serveur                                                            | Ne fournit pas une lecture SQL fiable ; dépendance aux fichiers système/redo et formats ; confidentialité                         | Non retenue pour interpréter le Print Format, aucun fichier de données ouvert        |
| Démarrage de MariaDB persistante seule                                  | Permettrait un SELECT sans lancer Bench                                               | Récupération/initialisation et journaux peuvent écrire l’original ; réseau original non isolé, événements/réplication à contrôler | Non compatible avec cette mission sans modification ; non retenu comme premier accès |
| Copie physique à froid puis démarrage d’une **copie de travail** isolée | Préserve l’original si source figée et montée RO ; récupération possible sur la copie | Copie complète potentiellement multi-bases et sensible ; permissions/capacité non qualifiées ; crash-consistance à prouver        | Stratégie recommandée conditionnellement, **pas encore exécutable/autorisée**        |
| Snapshot cohérent du stockage par un administrateur                     | Peut contourner le problème d’identité sans modifier l’original                       | Capacité/procédure/provider non connus, exige une autorisation distincte                                                          | Alternative à qualifier si lecture RO correcte impossible dans Codex                 |

Un serveur ne devient pas réellement sans écriture par une session SELECT ou le seul réglage SQL read_only. Les opérations de démarrage/récupération doivent être exécutées exclusivement sur une copie de travail, jamais sur les données originales montées RO. Aucun démarrage de conteneur auxiliaire dans ce mandat.

## 5. Risques d’un redémarrage ultérieur

-   **Confirmé** : réseau bridge non interne et proxies configurés ; le démarrage actuel ne reproduit pas l’isolation none des jetables. Ne pas utiliser les règles réseau générales du cloud comme preuve de blocage SMTP.
-   **À vérifier** : comptes sortants, queues d’emails et jobs en base/Redis, scheduler, Notification installées et éventuels scripts de lancement/reprise. Aucun compte ou identifiant de livraison lu pour les découvrir.
-   **Confirmé** : la commande Bench est technique, mais le montage /workspace permet d’exécuter les scripts existants. Ne pas lancer bench start, un script global ou tous les services par réflexe.
-   **À vérifier** : événements SQL/réplication/startup MariaDB, options de recovery et compatibilité du datadir. La commande native peut récupérer/initialiser un répertoire selon son état ; ne jamais tester sur l’original.
-   **Recommandation** : pour un futur accès de copie, MariaDB seul, network none, aucun port, socket propre ; aucun Bench, worker, scheduler ou Redis métier. Désactiver les mécanismes SQL autonomes/réplication sur la copie avec options vérifiées pour l’image en cache, sans modifier la source.

## 6. Sauvegardes connues et nettoyage natif

**Preuves antérieures réutilisées** : C.1Q a sauvegardé puis restauré son site neuf dans une seconde cible absente ; dump DB, fichiers publics/privés et configuration protégés. Les8 artefacts/copies et exports Print Format C.2B.1 ont été inventoriés/vérifiés dans les lots précédents. Ils ne contiennent pas l’installation persistante et ne sont pas une sauvegarde de learning.localhost. Aucun dump/configuration/secret n’est relu dans C.3Q.

**Persistant** : chemin par défaut private/backups présent, vide lors de C.3 ; aucun backup_path déclaré dans les fichiers alors examinés. Aucun inventaire distant, snapshot provider, garantie de rétention ou restauration de la cible connu. Les volumes Docker courants/historiques ne sont pas assimilés à des sauvegardes. Configuration du site et clés nécessaires sont des composants à préserver sous contrôle d’accès, pas à afficher ni versionner.

**Source Framework confirmée** : new_backup appelle delete_temp_backups avant de construire BackupGenerator. Ce nettoyage utilise get_backup_path/configuration et l’ancienneté calculée avec ctime, avec seuil configurable keep_backups_for_hours ou23h. Une destination fournie à la génération ne redéfinit pas nécessairement le chemin nettoyé.

Autres effets : get_backup peut réutiliser des archives récentes au lieu d’en produire de nouvelles ; delete_if_step_fails peut supprimer les fichiers de l’étape et enregistrer des callbacks de suppression. Le chiffrement natif peut demander/générer une clé de backup et modifier la configuration suivant son état. **Bypasser seulement new_backup pour appeler la classe ne prouve donc pas une procédure sans modification/nettoyage.**

Aucun de ces mécanismes n’est exécuté ici. Pour une future sauvegarde, définir tous chemins source/destination, fraîcheur, nettoyage et chiffrement ; interdire toute suppression non autorisée et écriture sur l’original. Privilégier d’abord une image de référence à froid conservée et un dump issu de sa copie de travail, puis tester la restauration. Aucun paramètre de backup n’est changé dans la configuration persistante.

## 7. Procédure future de copie cohérente et restauration — non exécutée

### Phase A : qualification préalable, sans données copiées

Faire autoriser la première intervention décrite en fin de rapport. Obtenir une identité de maintenance lisant les métadonnées via un montage explicitement RO, sans chmod/chown des sources, et mesurer le datadir. Arrêter si les droits exigent une modification de l’original ou un privilège non autorisé. Identifier le propriétaire/périmètre des données : une copie physique du datadir peut inclure **plusieurs bases et comptes**, pas uniquement learning.localhost.

Vérifier l’espace pour au moins : image physique de référence, copie de travail récupérable, dump/archives et nouvelle cible de restauration, avec marge pour journaux/redo. Définir noms/chemins neufs, chiffrage, conservation et responsables ; ne rien écraser. Faire attester l’absence d’écrivains hôtes/containers et de lien OMV8/production non autorisé.

### Phase B : copie physique à froid, sous mandat distinct de copie de données réelles

1. Revalider les IDs, états arrêtés et tous montages ; ne pas démarrer l’original. Ouvrir uniquement les sources nécessaires en lecture seule dans un contexte de maintenance approuvé, réseau none/ports0, sans entrypoint de base ou script applicatif.
2. Copier **l’ensemble cohérent du datadir** requis par la version MariaDB, pas seulement le dossier d’une base : fichiers système, redo/undo, métadonnées, droits et liens selon inventaire validé. Préserver modes/UID/GID/liens nécessaires dans la copie, sans toucher leurs originaux. Examiner et borner les liens externes avant de les suivre. Ne pas supposer qu’une simple copie partielle de fichiers .ibd suffise.
3. Préserver séparément les fichiers publics/privés, configurations nécessaires et révision du code dans le même intervalle de gel ; clés/secrets copiés par un mécanisme protégé uniquement si le mandat le prévoit, jamais affichés. Aucun Redis contenant des queues métier ne doit être automatiquement relancé.
4. Produire inventaire/empreintes des copies et vérifier les originaux avant/après dans le cadre autorisé. Une copie physique après arrêt brutal est **crash-consistante au mieux**, pas une sauvegarde validée. Conserver cette référence intacte et ne pas démarrer un serveur dessus.

### Phase C : récupération et lecture sur copie de travail uniquement

Créer une seconde copie de travail, nouveaux conteneurs/sites/volumes entièrement disjoints, même image MariaDB en cache, aucun téléchargement. Monter seulement cette copie RW, jamais le datadir original ni /workspace entier. Garder réseau none, aucun port, socket nouveau et aucune application/worker/scheduler. Vérifier les options natives permettant de neutraliser événements/réplication sur cette version ; les journaux et recovery sont des **écritures autorisées sur la copie** à comptabiliser.

Si la récupération échoue, arrêter sans forcer une réparation destructrice ni revenir essayer sur l’original. Les écritures de recovery dans la copie sont attendues ; ne pas annoncer une équivalence binaire avec la référence après démarrage.

Lire d’abord les métadonnées SQL nécessaires dans une transaction READ ONLY ; ne pas exporter de table d’apprenants/certificats. Un dump logique complet pour sauvegarde inclut des données réelles : autorisation explicite, destination privée/chiffrée et absence de publication requises, même s’il provient d’une copie.

### Phase D : preuve de restauration vers une troisième cible neuve

À partir de la copie récupérée, créer un dump logique cohérent avec l’outil/version déjà disponible, en contrôlant son périmètre et le stockage des secrets. Préserver la sauvegarde complète base+fichiers+configuration ; ne pas appliquer les procédures Frappe non qualifiées de nettoyage/chiffrement à l’original.

Restaurer dans une **nouvelle cible précédemment absente**, réseau none/ports0 et données/credentials propres ; pas sur learning.localhost ni sur un ancien conteneur. Valider version, schéma, métadonnées/empreintes de formats/droits, cohérence des fichiers/config et compteurs agrégés autorisés ; les données personnelles ne doivent pas apparaître dans les preuves publiées. Distinguer les différences de connexion intentionnelles de la configuration utile restaurée. Aucun bench migrate, import de format, email ou tâche métier automatique dans cette qualification.

Une restauration réussie et ses contrôles, pas seulement un dump non vide ou un volume présent, lèveront la réserve correspondante. Toute bascule/retour en place/adoption de Certificate nécessitera encore son autorisation ; aucun nettoyage des ressources au titre de cette proposition.

## 8. Contrôles futurs du Print Format

Après accès SQL sûr, sélectionner uniquement les métadonnées nécessaires : Certificate (name/doc_type/standard/custom_format/disabled, HTML/CSS, dimensions, langue/moteur déclarés, modified) et leurs empreintes ; formats personnalisés, DocType/DocField et Property Setters pertinents. Les includes peuvent révéler des informations locales : conserver le contenu privé et publier des différences anonymisées.

Référence Git : standard Yes/LMS Certificate, include natif du template, Custom297×210, langue en, moteur déclaré wkhtmltopdf et modified2026-11-01 13:25:40.780861. Comparer les nombres numériquement et les dates selon la représentation native, pas les seuls noms ou la seule ancienneté. Le moteur effectif dépend de Print Settings/options/hooks : lire ces seules métadonnées sans lancer un PDF.

Ne pas oublier le Property Setter du défaut d’impression, le champ template et ses règles, les surcharges physiques/includes et le code partagé. Égal → aucune adoption nécessaire ; ancien connu → adoption éventuellement envisageable sous autre mandat ; plus récent, personnalisé ou inconnu → arbitrage, pas import forcé ni date artificielle. Les références métier éventuelles au format ne seront examinées que sous forme agrégée explicitement autorisée, sans certificat réel extrait.

Cette étape est une comparaison, pas une synchronisation. Les dates et contenus de learning.localhost restent actuellement inconnus ; aucune conformité n’est extrapolée des jetables.

## 9. Garanties manquantes et première intervention à autoriser

**ACCÈS ENCORE BLOQUÉ** par : identité de lecture non qualifiée (source0700/UID65534), taille DB inconnue donc capacité non démontrée, absence d’attestation de gel/provenance/périmètre, méthode de copie non éprouvée sur ce stockage et restauration de cette installation non prouvée. Les17 tests/18 PDF du certificat n’apportent aucune de ces garanties.

**Première intervention précise à autoriser : qualification de maintenance des droits de lecture et des tailles, sur /workspace/.setup/db-data seulement.** L’administrateur du runtime doit fournir/valider une identité et un contexte de montage RO compatibles avec les UID/GID réels, en dehors des limites de mapping actuellement observées si nécessaire. Il ne s’agit pas d’autoriser le code à changer les droits ou les propriétaires de l’original.

Périmètre du futur mandat initial : vérifier mapping/identité, traversée et droit de lecture des métadonnées, mesurer taille apparente/allouée et nombre d’objets par agrégats, établir les frontières/liens du stockage et l’absence d’écrivains. Si un conteneur auxiliaire est retenu, sa création doit être explicitement autorisée : image en cache vérifiée, entrypoint remplacé par outils de métadonnées, montage source RO seul, network none/ports0, aucun secret/site/DB démarré, pas de privilèges globaux. L’identité ne doit pas être choisie en supposant que65534 fonctionne. Une solution de snapshot opérateur est à qualifier si la plateforme ne permet pas ce contexte sûr.

Interdits même dans cette première intervention proposée : copie du contenu métier ou des secrets, sauvegarde/restore, MariaDB/Redis/Bench persistants, chmod/chown, migration/import/cache purge et suppression. Résultat attendu : droit de lecture et capacité documentés, ou blocage motivé. **Une deuxième autorisation distincte devra ensuite couvrir la copie de données réelles, leur périmètre et la récupération/restauration isolée.** Rien de cette première intervention n’a commencé dans C.3Q.

## 10. Contrôles exécutés et livraison

Exécutés : Git/branche/SHA, inspection Docker d’états/montages/réseau/volumes/variables par **noms seuls**, marqueurs de logs sans publication de contenu, événements bornés, stat/mapping/tailles agrégées et lecture ciblée du code Framework de sauvegarde. Échec du parcours du datadir documenté, aucun contournement/élévation. L’inventaire de volumes porte sur leur identité et leurs associations, pas leur contenu.

Aucune lecture SQL, table métier, secret/configuration/dump, copie de données réelles, sauvegarde, restauration, import, purge, redémarrage, modification de Compose ou intervention production. Aucun PDF/test applicatif relancé ; aucun nouvel Access Log Frappe ou email. Les logs automatiques du daemon ne sont pas une activité métier ni une preuve de modification volontaire des données.

Seuls ce rapport et CODEX_HANDOFF.md sont modifiés et publiables. Sources LMS, Framework, develop et catalogues identiques à la référence ;998 FR/3024 POT conservés par identité Git, sans recompilation. Publication normale documentaire après contrôles ; arrêt après C.3Q. Les réserves FR-03/B.3/B.4/B.5, politique de diffusion non adoptée, polices, langues et ancien-format upgrade restent ouvertes ; I18N-01 non commencé.
