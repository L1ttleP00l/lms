# FR-04B.6C.3Q.1 — Qualification des métadonnées du stockage

1er novembre 2026 (Europe/Paris), `littlepool-dev`, base locale/distante **f70ac599648056038e8bfe63e00123ccd38d4316**, checkout initial propre. AGENTS/handoff et rapports C.3/C.3Q consultés. Inspection limitée à l’identité, aux montages et aux métadonnées du répertoire racine ; aucun contenu de base ou secret ouvert.

**Conclusion : ACCÈS TOUJOURS BLOQUÉ.** Aucun contexte de maintenance existant, accessible et déjà autorisé n’a été identifié avec un montage réellement RO du stockage et une identité de lecture correcte. L’inspection s’arrête avant parcours interne. Aucune création d’auxiliaire, élévation, modification de droits ou démarrage.

## 1. Identité et périmètre réellement observés

Le worker cloud de développement répond ; daemon Docker local et projet identifiés par les mêmes conteneurs/montages que C.3Q. Les services persistants lms-mariadb/lms-bench/lms-redis restent arrêtés ; les conteneurs historiques ne sont pas qualifiés comme jetables. Leur état n’est pas modifié.

La qualification est faite dans le **namespace du worker accessible**, pas présentée comme un accès administrateur à l’hôte physique. UID/EUID1000, GID1000, aucun groupe supplémentaire ; uid_map et gid_map indiquent chacun une seule correspondance **1000 intérieur →0 dans le namespace parent, longueur1**. Un espace de noms utilisateur avec mapping restreint est donc visible. Cela ne donne pas les privilèges de l’UID0 dans le namespace courant et ne justifie pas une tentative d’élévation.

La correspondance ne permet pas de reconstruire l’identité réelle propriétaire des inodes DB. La valeur65534 observée peut représenter une identité non mappée : elle ne doit être ni considérée avec certitude comme le propriétaire réel, ni utilisée arbitrairement comme UID/GID d’un processus auxiliaire.

## 2. Droits et ACL de la racine

Métadonnées obtenues sans ouvrir/parcourir les fichiers internes :

| Frontière                 | Mode     | Propriétaire apparent | Vérification d’accès de l’identité courante |
| ------------------------- | -------- | --------------------- | ------------------------------------------- |
| /workspace                | 0755     | 1000:1000             | Lecture et traversée permises               |
| /workspace/.setup         | 0700     | 1000:1000             | Lecture et traversée permises               |
| /workspace/.setup/db-data | **0700** | **65534:65534**       | **Lecture et traversée refusées**           |

Ces trois frontières ne sont pas des liens symboliques selon lstat. Cela ne prouve rien sur les liens à l’intérieur du datadir, qui n’a pas été parcouru.

L’interrogation des noms d’attributs étendus de la racine n’indique pas de system.posix_acl_access. L’outil getfacl n’est pas disponible ; aucun décodage complet des ACL héritées/par défaut ou politiques de sécurité externes n’est revendiqué. L’absence de cet attribut particulier ne garantit pas à elle seule l’accès : les tests de droits restent négatifs. Aucune installation d’outil ni modification d’ACL/propriétaire/mode.

Le Permission denied de du documenté dans C.3Q n’est **pas rejoué** : le contexte de lecture seule étant non qualifié, aucun nouveau parcours agrégé n’est lancé. Son ancien0 demeure une mesure non disponible, jamais une preuve de répertoire vide.

## 3. Protection de lecture seule : non démontrée

Lecture de mountinfo du namespace courant : racine overlay RO, mais **/workspace est un montage overlay RW**, nosuid/nodev/relatime. Le RO de la racine ne protège donc pas le sous-montage /workspace. Les intentions d’un script de « lecture seule » ne changent pas ces flags et ne garantissent pas l’absence de mises à jour d’atime lors d’un parcours futur.

Les seuls conteneurs inspectés dont un bind exact ou parent donne accès au stockage sont lms-mariadb, lms-bench et lms-db historique : **tous arrêtés et tous avec accès RW par leurs montages**. Aucun de ces conteneurs ne constitue un contexte de maintenance RO existant. Il n’a été ni démarré, ni modifié, ni rejoint par un changement de namespace.

Aucun montage imbriqué sous le chemin datadir n’est visible dans la table de montage du worker. Ce constat porte seulement sur cette vue ; il ne remplace pas une qualification des frontières dans le futur contexte de maintenance et n’exclut pas des liens internes ou d’autres namespaces inconnus.

Les autres contextes d’administration éventuels de la plateforme ne sont pas établis comme accessibles et autorisés. Aucune recherche de credentials ni tentative sudo, changement d’UID/GID, conteneur privilégié, auxiliaire, mount/remount ou contournement des restrictions du cloud.

## 4. Mesures disponibles et non disponibles

| Mesure demandée                                    | Résultat réel                                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Taille apparente totale du datadir                 | **Non disponible**, aucun parcours autorisé/sûr possible                                                 |
| Espace alloué au datadir                           | **Non disponible**                                                                                       |
| Nombre de fichiers/sous-répertoires/liens internes | **Non disponible**, ni noms ni contenu lus                                                               |
| Montages imbriqués                                 | 0 visible sous ce chemin dans mountinfo du worker seulement ; qualification interne/future vue non faite |
| Capacité générale /workspace                       | **18 107 801 600 octets disponibles** au relevé, environ16,86 Gio                                        |
| Inodes /workspace                                  | **1 796 335 disponibles**,2 097 152 au total, valeurs fournies par statvfs de l’overlay                  |
| Erreurs/limitations                                | Droits read/traverse négatifs ; mapping propriétaire incomplet ; pas de contexte RO ; getfacl absent     |

La capacité vient de statvfs sur /workspace, sans ouverture du datadir. Ces valeurs sont une photographie du système de fichiers visible ; elles ne garantissent ni un quota applicable à une future cible, ni une réservation de ressources, ni la disponibilité au moment d’une copie.

**Impossible de conclure sur la place nécessaire** : taille apparente, allocation, fichiers creux, liens et éventuelles frontières internes du datadir sont inconnus. Prévoir séparément référence physique, copie de travail/récupération, dumps/archives et cible de restauration, avec marge pour redo/journaux et croissance ; ne pas dimensionner ce plan sur le seul espace libre.

## 5. Écrivains et confidentialité

Aucun conteneur actif inspecté ne dispose du bind exact/parent du stockage persistant. Les conteneurs qui le peuvent sont arrêtés. Cela ne prouve pas l’absence d’un processus hôte, opérateur, agent de synchronisation ou autre namespace écrivain ; aucune garantie de gel global n’est obtenue.

L’inspection ne publie aucun nom interne de fichier, de base, de compte ou contenu provenant du datadir. Aucun inventaire récursif, SQL, fichier InnoDB/SQL, dump ou configuration secrète n’est lu. Les métadonnées des frontières explicitement autorisées ne sont pas utilisées pour déduire la présence ou l’absence de données métier. Aucune copie/hachage du contenu des données réelles.

## 6. Contexte nécessaire et prochaine opération à autoriser

**Prochaine opération : mise à disposition puis vérification d’un contexte de maintenance en lecture seule, limité aux métadonnées de /workspace/.setup/db-data.** Le cadre actuel autorise seulement un contexte déjà accessible/préalablement autorisé : cette condition n’est pas remplie et n’est pas remplacée par une création automatique.

L’opérateur du runtime doit fournir et faire autoriser :

1. Une identité dont les UID/GID et mappings couvrent effectivement le propriétaire du stockage, sans chown/chmod/ACL de l’original et sans supposer que65534 fonctionne.
2. Une vue du chemin appliquant **RO au niveau du montage effectif**, avec contrôle des flags et de la portée des montages imbriqués, sans suivre de lien hors périmètre. La preuve se fait par inspection des flags et des montages, **pas par une tentative d’écriture sur la source**.
3. Des outils système déjà disponibles, périmètre borné, aucun contenu ouvert : tailles apparentes/allouées, comptages agrégés et erreurs d’accès ; aucun nom interne publié.
4. Une attestation/revérification des écrivains et des limites du stockage. Aucun MariaDB/Redis/Bench persistant ou moteur de récupération lancé.

Si la plateforme nécessite un auxiliaire, sa création, son identité et ses droits doivent faire l’objet d’une **autorisation distincte** avant toute commande : image en cache vérifiée, entrypoint de métadonnées seul, source RO, réseau none/ports0, aucun secret/DB/service applicatif, pas de privilège global. Une solution de lecture opérateur hors du mapping actuel est une autre possibilité à qualifier ; sa faisabilité n’est pas prouvée ici.

Après ces garanties seulement, refaire les mesures et décider si une copie est dimensionnable. Si cela exige de modifier l’original ou d’utiliser des privilèges non approuvés, arrêter. La simple ouverture d’une autorisation générale d’audit ne vaut pas autorisation d’élévation ou de création de ressource.

## 7. Mandat de copie ultérieur, strictement conditionnel

La séquence C.3Q reste une proposition **non exécutée** : référence physique à froid complète en espace neuf/protégé, contrôle des empreintes/cohérence, copie de travail distincte, récupération MariaDB uniquement dessus avec image compatible et services isolés, dump logique cohérent, restauration dans une nouvelle cible absente, puis lectures limitées de métadonnées Frappe.

Avant ce mandat : métadonnées qualifiées, capacité et confidentialité validées, propriétaire/périmètre des données connu (le datadir peut contenir plusieurs bases), gel attesté, méthode de conservation des droits/liens et secrets protégés définie. Une copie issue d’un arrêt brutal n’est au mieux que crash-consistante jusqu’à récupération/restauration prouvée. Aucun nettoyage d’archives ou retour en place implicite.

**Aucune copie, sauvegarde, récupération, restauration ou adoption du certificat n’est autorisée par le constat présent**, même si un futur contexte devenait accessible. Ces opérations exigeront une nouvelle autorisation explicite après qualification.

## 8. Vérifications, livrables et conclusion

Exécutés : Git/branche/SHA, état Docker/identités/montages, uid/gid et leurs mappings, lstat des trois frontières, tests d’accès sans ouverture, présence d’attribut ACL de la racine, table des montages et statvfs général. Aucun parcours du stockage après le constat de défaut de protection RO. Aucun test applicatif ou PDF relancé ; aucune création de conteneur, démarrage, SQL, copie, sauvegarde, restauration, import, purge, suppression ou secret consulté.

Seuls ce rapport et CODEX_HANDOFF.md changent. Sources LMS/Framework/develop/catalogues intacts ; références998 FR/3024 POT conservées par identité Git. Tous conteneurs/volumes/backups sont conservés. Publication documentaire normale autorisée après contrôle de périmètre/secrets/SHA, sans artefact brut du stockage.

**ACCÈS TOUJOURS BLOQUÉ : métadonnées de la racine et capacité générale connues ; propriétaire réel, accès RO effectif, taille/allocation/comptages internes et absence totale d’écrivains non établis.** Fournir et autoriser d’abord le contexte de maintenance décrit ci-dessus ; ne pas commencer une copie ou une récupération. Réserves FR-03/FR-04, politique de diffusion non adoptée et I18N-01 non commencé conservés. Arrêt après C.3Q.1.
