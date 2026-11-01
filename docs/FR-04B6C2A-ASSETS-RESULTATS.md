# FR-04B.6C.2A — Assets corrigés et recette PDF LTR après reprise

1er novembre 2026 (Europe/Paris). Branche `littlepool-dev`, base locale/distante vérifiée **964475e16865c78f9d8bc6725bc2e5a5a3a8ed70**. AGENTS, handoff, rapports C.1Q/C.2 et mandat de reprise consultés. **Historique du blocage conservé ci-dessous ; reprise contrôlée réussie, résultats finaux en fin de rapport.**

## Confirmé avant interruption

La collision provenait du générateur privé C.2 : les noms compilés des répertoires css et css-rtl étaient regroupés sous la même clé logique, sans préfixe rtl\_. Le dernier fichier rencontré écrasait l’entrée LTR ; FR/EN étaient bien de direction LTR, mais print.bundle.css pointait vers css-rtl.

Correction limitée aux manifestes/générateur hors Git : séparation assets.json et assets-rtl.json, clés RTL préfixées rtl\_ conformément à esbuild et bundled_asset natifs ; aucune désactivation de is_rtl. **59 entrées LTR et12 RTL, aucune collision**. Les fichiers sont les bundles compilés locaux, pas des CSS fabriquées ; aucune compilation ou installation.

Preuves privées conservées sous `/workspace/work/fr04b6c1q/{source,restore}/backup/c2a-assets/` : manifeste avant correction et results.json, avec langue/direction, clé demandée, chemin résolu, SHA du CSS réellement lu via le fetcher Pluto natif et règle direction:rtl. Sur chaque site, contrôles FR/EN → LTR et arabe → RTL réussis avant coupure. Une seule valeur de cache du manifeste privé a été actualisée via ClientCache.set_value ; aucune purge et aucun changement du résolveur Framework.

Les vérifications préparatoires du fetcher avaient initialement reçu un chemin relatif, non une URL résolue contre l’origine du site ; ce harnais a été adapté à la résolution native d’origine avant les contrôles réussis. Aucun PDF produit par ces contrôles. Isolation et sauvegardes avaient alors été recontrôlées sur les services actifs.

## Confirmé lors de la première reprise bloquée

Le service cloud et les commandes hôtes répondent. En revanche, **les six conteneurs qualifiés sont tous exited, code255, OOMKilled=false**, avec les mêmes identifiants que l’inventaire C.2 :

-   lp-cert-c1q-9c864a63-source-bench/db/redis ;
-   lp-cert-c1q-9c864a63-restore-bench/db/redis.

La cause de leur arrêt n’est pas établie ; ne pas attribuer le code255 à une erreur PDF ou à un manque de mémoire. L’inspection Docker retrouve network_mode=none, aucun port publié et les montages privés/RO attendus, sans partage de données persistantes. Cela ne remplace pas un contrôle dynamique des sockets, queues, protections email et formats en base sur services actifs.

Le contrôle de reprise précédemment utilisé s’arrête sur docker top car le Bench source est arrêté. **Aucun conteneur redémarré, recréé, supprimé ou reconfiguré**, conformément à la clause d’arrêt du mandat si les protections ne sont plus démontrées. Aucun appel vers learning.localhost ou la production.

Les deux jeux de manifestes corrigés sont conservés : 59/12 entrées, print.bundle.css vers `/assets/frappe/dist/css/print.bundle.B5JU24AU.css` et rtl_print.bundle.css vers `/assets/frappe/dist/css-rtl/print.bundle.BHP4EN72.css`. Leurs valeurs concordent avec les résultats natifs d’avant interruption. **La sélection native n’a pas été rejouée après reprise**, faute de runtime actif ; il s’agit d’une vérification des artefacts conservés, pas d’un nouveau succès fonctionnel.

Les huit fichiers de sauvegarde/copie de restauration conservent les tailles et SHA256 du manifeste C.1Q. Les **16 PDF historiques** correspondent aux empreintes C.2 ; leurs PNG et autres preuves sont présents, aucun fichier écrasé ou supprimé. Ressources hôtes observées : environ17 Gio libres et8,8 Gio de RAM disponible ; ces capacités ne justifient pas à elles seules un redémarrage.

## Dernière commande interrompue

La commande préparée devait créer recipe/c2a_pdf.py et recipe/c2a_inspect.py, inventorier les anciens artefacts puis exécuter la recette dans les deux Bench. Les deux appels shell avaient échoué au transport exec-server avant création du processus.

Vérification après reprise : scripts, inventaire c2a/old-artifacts-hashes.json, journaux c2a_pdf.py.sanitized.log et répertoires de sortie c2a-pdf **absents** sur les deux cibles. Aucun PDF partiel à isoler et aucune génération à considérer comme exécutée. Aucun processus de recette ne tourne dans les conteneurs, tous arrêtés.

Aucune requête SQL métier ou écriture de recette effectuée pendant cette reprise. Les compteurs applicatifs et Access Logs ne sont pas relus en base arrêtée. Dernier état établi par C.2 : certificats/inscriptions/queues/communications/DocShare0, File2 par site inchangés, Access Logs techniques source9/restauration8. **Ces chiffres historiques ne constituent pas une nouvelle comparaison avant/après.** Aucun email ou certificat créé par les opérations hôtes de cette reprise.

## Non validé et limites restantes

-   **0/16 nouveaux PDF** : structure, texte FR/EN, accents, dates, HTML, polices, dimensions/rotation/pages et graphisme LTR non rejoués.
-   Aucune nouvelle comparaison graphique avant/après. Les conclusions C.2 restent celles de rendus ayant chargé la CSS RTL ; elles ne valident pas la présentation LTR.
-   Permissions, préférences, Print Settings, Print Formats installés et absence de jobs ne sont pas recontrôlés dynamiquement après reprise. Sources et Framework Git intacts ne prouvent pas à eux seuls l’état actuel de la base.
-   Portrait historique C.2 :595,296×841,896pt, douze standards ; sa persistance avec assets LTR reste à mesurer. La balise pdfkit-orientation reste dans le template Git inchangé, aucun paysage injecté.
-   Famille d’origine des sous-ensembles CairoFont non identifiée ; aucune nouvelle conclusion typographique.
-   Aucun test global, build, compilation de catalogue, installation, migration, SMTP ou téléchargement exécuté.

## État Git et prochaine action lors du blocage

Sources applicatives, JSON/template/CSS, PO/POT et Framework inchangés. Références **998 FR /3 024 POT** conservées byte pour byte depuis la base, sans nouveau recompte Babel dans un conteneur arrêté. Framework propre au commit959b85de4086656273e1d158f41923dd3808c350 ; distant develop6b791f33b34efa15566a0cb707f5be59d136df50 inchangé.

Deux documents seulement : ce rapport de blocage et CODEX_HANDOFF.md. Commit local de reprise, **aucune publication de C.2A**, la nouvelle recette conditionnant cette publication n’ayant pas été exécutée. Ce commit ne déclare pas la mission terminée. Aucun artefact privé versionné.

**Prochaine action précise : faire rétablir les six services de recette existants dans un cadre autorisé, sans recréation/suppression ni intervention sur learning.localhost ; requalifier les protections et les états métier/logs, puis reprendre les huit variantes par site avec sorties distinctes.** Vérifier de nouveau les manifestes natifs/cache avant génération, sans refaire toute l’analyse ni écraser C.2.

C.2B reste un mandat distinct : après mesure LTR, privilégier une taille/orientation reconnue nativement (règle @page ou champs paper_size/paper_width/paper_height à étudier selon le schéma installé), sans forcer d’option dans le harnais ni changer le moteur. Aucune correction d’orientation réalisée ici.

Réserves FR-03, synchronisation du rappel B.3, B.4/B.5, politique de diffusion B.5C.2 non adoptée, ancien-format upgrade non démontré et I18N-01 non commencé conservés. Arrêt sur le blocage opérationnel.

## Reprise autorisée : redémarrage contrôlé et état final

1er novembre 2026 (Europe/Paris), mandat complémentaire explicite de démarrage des six conteneurs existants. Commit de blocage **87d88cc759843a058427a59eaa1d702b0ee4382e préservé**, sans reset/rebase ni réécriture ; nouveau commit documentaire complémentaire.

Le cloud est running. L’inspection initiale retrouve les mêmes six identifiants, labels Compose lp-cert-c1q-9c864a63 et services, images locales qualifiées et commandes. Les arrêts portent tous le code255, OOMKilled=false, erreur Docker vide, dates de fin groupées au même instant. **Cause non établie** : concomitance avec la coupure observée ne prouve pas une cause cloud/MariaDB/Redis. Aucun manque de mémoire démontré.

Vérifiés avant démarrage : politique restart=no, réseau none, ports0, non privilégiés UID1000, montages privés séparés et code/runtime RO, aucune donnée persistante partagée. Commande Bench Docker exacte `/bin/sh -c 'exec sleep infinity'`, conduisant au seul processus sleep ; l’assertion préparatoire qui attendait directement Path=sleep a été corrigée après comparaison avec l’inventaire original, sans changement de commande ou de conteneur. Limites mémoire/CPU et images comparées à la configuration privée existante. Aucun téléchargement, compose up/down, modification de Compose ou recréation.

**Six démarrages par docker start sur IDs exacts, depuis l’hôte** : les quatre MariaDB/Redis d’abord ; disponibilité des sockets vérifiée par mariadb-admin/redis-cli ; les deux Bench ensuite. Les logs techniques récents confirment les marqueurs de disponibilité DB/Redis, sans afficher de credentials. Les six restent running à la fin, mêmes IDs et images ; seuls leurs StartedAt évoluent normalement. Aucun service persistant démarré, arrêté ou modifié.

## Requalification et sélection effective après démarrage

Deux audits natifs réussis : seuls lo et aucune route, huit connexions à192.0.2.10 ports25/465/587/443 bloquées ENETUNREACH ; MariaDB skip-networking=1, Redis port0, sockets propres à chaque cible, protections mute/pause/suspend actives. Aucun compte email, queue métier, job RQ, worker ou scheduler Frappe. Processus Bench vérifiés sans processus métier inattendu.

Empreintes des formats/permissions concordant avec C.2 ; Certificate installé identique au JSON source et modèle C1Q Fictional Custom intact. Préférences User/System Settings et Print Settings hachés avant/après recette : identiques. Configurations/services persistants gardent leurs empreintes, IDs et StartedAt précédents, aucune connexion à leur base.

**Manifestes corrigés conservés, pas reconstruits**. Nouveau contrôle natif get_assets_json/bundled_asset/is_rtl sur chaque site : FR/EN demandent print.bundle.css → `/assets/frappe/dist/css/print.bundle.B5JU24AU.css` ; arabe demande rtl_print.bundle.css → `/assets/frappe/dist/css-rtl/print.bundle.BHP4EN72.css`. Les fichiers locaux existent et leurs empreintes/règles de direction sont enregistrées. Aucune nouvelle purge ni actualisation de cache nécessaire après reprise.

Pendant les générations, le fetcher Pluto natif lit effectivement le bundle LTR attendu pour FR/EN ; aucun chemin css-rtl chargé par ces PDF. Le contrôle arabe porte seulement sur la résolution CSS, **pas une recette PDF arabe**.

## Nouveaux PDF et comparaison graphique

La commande précédemment interrompue était bien non démarrée. Les scripts privés ont ensuite été préparés depuis la recette C.2 déjà validée : retrait du générateur défectueux remplacé par des assertions de résolution LTR, sortie neuve c2a-pdf, mesure de rotation et contrôle haché des préférences/Print Settings. Mêmes fixtures, droits, format installé, options et moteur PlutoPrint ; aucune option paysage ajoutée. Aucune erreur de génération finale sur les deux cibles.

**16 nouveaux PDF authentiques**, huit par site : FR/EN évaluateur+logo, FR un formateur, EN plusieurs formateurs/noms longs, FR/EN sans langue explicite, modèle personnalisé FR/EN. Passage natif download_pdf/validate_print_permission/get_print/printview/Jinja/get_pdf/PlutoPrint, sans convertisseur sentinelle ni certificat persistant.

**16 analyses structurelles et textuelles réussies** : signature PDF, lecteur pypdf strict, ouverture PDFium, une page non blanche, contenu attendu après normalisation NFKC des ligatures, noms/titres/date/accents/chevrons et esperluette présents ; aucune boîte de glyphe hors page et aucun caractère U+FFFD. FR/EN explicites et contexte sans langue conservés, langue du contexte restaurée. Date civile17 mai2027/May17,2027, sans conversion de fuseau. Littéraux des modèles personnalisés inchangés ; default_print_language=en du standard intact.

**16 pages rasterisées, huit variantes inspectées visuellement à taille complète** ; images des deux sites identiques octet pour octet, seconde série contrôlée par comparaison. De plus, la comparaison Pillow avant/après mesure **16/16 images aux pixels identiques aux PNG historiques C.2**, malgré les chemins et SHA de CSS différents. Donc aucun écart visible d’alignement, marges, largeur, espacement, bloc formateurs/évaluateur, logo ou pagination attribuable au changement de bundle dans ces seules fixtures. Cela ne prouve pas que LTR et RTL soient interchangeables pour d’autres documents/composants.

Noms et titres longs lisibles sur plusieurs lignes, accents et logo géométrique visibles, aucune coupure/chevauchement majeur observé. Grandes zones verticales vides inchangées ; aucune bordure de certificat rendue puisque la classe historique inner-border n’est pas employée. L’ancienne réserve de biais RTL est levée pour cette recette LTR, **pas l’anomalie d’orientation ni une homologation de mise en page paysage**.

Les flux de polices embarqués restent des sous-ensembles CairoFont/CFF ; famille d’origine non identifiée avec fiabilité, analyse facultative non étendue. Ne pas les assimiler à Cantarell/Inter. Polices locales et glyphes français disponibles, aucun téléchargement. Les12 tentatives Google Fonts des standards échouent,0 succès externe ; lecture des CSS natives locale uniquement. Aucun Chromium acquis ou sandbox modifié.

## Orientation confirmée indépendante et proposition C.2B

Les **12 nouveaux PDF standards** restent A4 portrait : **595,296021×841,895996 points, rotation0°, une page**. Les quatre personnalisés ont les mêmes dimensions, sans exigence paysage propre au modèle. Les bons bundles LTR sont prouvés : le portrait est un défaut indépendant du manifeste.

La balise source pdfkit-orientation=Landscape est conservée. Le parseur natif Browser chrome/Pluto interprète les dimensions du Print Format, puis @page lorsqu’aucune taille explicite n’est déjà définie, les options CSS reconnues et l’orientation native ; il ne reprend pas cette meta historique. Rien n’a été forcé pour produire un succès artificiel.

**Proposition précise pour un mandat C.2B** : tester d’abord les champs natifs du seul format standard `paper_size=Custom`, `paper_width=297`, `paper_height=210` (mm), avec les priorités et marges de cette version, puis recette binaire FR/EN et modèles personnalisés. Une règle @page size:A4 landscape est une alternative à évaluer, mais peut être ignorée si des dimensions explicites du format ont priorité ; ne pas la considérer suffisante sans test. Préserver Print Settings globaux, moteur natif, permissions et modèles personnalisés, ne pas corriger Framework. **Aucun de ces changements appliqué dans C.2A.**

## Permissions, écritures techniques et conservation finales

**16 contrôles de permissions réussis**, huit par site : titulaire privé, tiers/Guest privés refusés avant get_print, Guest publié, Administrator et personnels selon droits historiques. Aucun ignore_print_permissions, nouveau partage ou changement des rôles ; réserve FR-03 de lecture large du personnel maintenue.

Avant/après : Certificate/DocShare/inscriptions/Email Account/Email Queue/Communication0 ; File2 par site préexistants, aucun fichier métier ajouté. Formats/custom, permissions, User/System Settings et Print Settings inchangés ; jobs métier Redis0. **16 Access Logs techniques ajoutés** : source9→17, restauration8→16, tous pour C2-FICTIONAL-CERT. Le flag in_test des processus privés conserve leur insertion SQLite native directe, pas de queue différée. Pas de zéro écriture absolue revendiqué.

Huit artefacts backup/copies revérifiés ; seize PDF historiques et l’ensemble des anciens artefacts privés comparés à leurs empreintes d’avant génération, inchangés. Nouveaux PDF/PNG/textes/inspection/comparison/results sous `/workspace/work/fr04b6c1q/{source,restore}/backup/c2a-pdf/`, dossiers0700/fichiers0600, hors Git et sans URL publique. Preuves de résolution sous backup/c2a-resolution-resumed.json, inventaire/redémarrage/final-resumed-summary sous c2a/. Toutes les ressources et sauvegardes conservées, aucune suppression.

**Conclusion finale : C.2A exécuté et documenté ; biais d’assets levé, recette binaire LTR concluante pour les contenus testés, PDF global toujours partiellement validé en raison du portrait.** Aucun ancien test global, build, migration, SMTP, impression multiple binaire ou ancien-format upgrade rejoué. Comptage Babel natif998 FR/3024 POT confirmé ; sources/catalogues/Framework/develop inchangés. Réserves FR-03/B.3/B.4/B.5, politique B.5C.2 non adoptée, famille de police et ancien-format upgrade conservés ; I18N-01 non commencé.

Publication normale conditionnelle des **deux commits documentaires** (blocage87d88cc7 puis complément courant, SHA via git log), uniquement rapport/handoff, autorisée par le nouveau mandat. Aucun script/manifeste/PDF/PNG/configuration/log/secret à publier. Arrêt après C.2A ; C.2B attend un mandat distinct.
