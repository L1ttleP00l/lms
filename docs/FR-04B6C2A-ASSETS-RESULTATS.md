# FR-04B.6C.2A — Reprise bloquée avant recette PDF LTR

1er novembre 2026 (Europe/Paris). Branche `littlepool-dev`, base locale/distante vérifiée **964475e16865c78f9d8bc6725bc2e5a5a3a8ed70**. AGENTS, handoff, rapports C.1Q/C.2 et mandat de reprise consultés. **C.2A non terminé : zéro nouveau PDF LTR.**

## Confirmé avant interruption

La collision provenait du générateur privé C.2 : les noms compilés des répertoires css et css-rtl étaient regroupés sous la même clé logique, sans préfixe rtl\_. Le dernier fichier rencontré écrasait l’entrée LTR ; FR/EN étaient bien de direction LTR, mais print.bundle.css pointait vers css-rtl.

Correction limitée aux manifestes/générateur hors Git : séparation assets.json et assets-rtl.json, clés RTL préfixées rtl\_ conformément à esbuild et bundled_asset natifs ; aucune désactivation de is_rtl. **59 entrées LTR et12 RTL, aucune collision**. Les fichiers sont les bundles compilés locaux, pas des CSS fabriquées ; aucune compilation ou installation.

Preuves privées conservées sous `/workspace/work/fr04b6c1q/{source,restore}/backup/c2a-assets/` : manifeste avant correction et results.json, avec langue/direction, clé demandée, chemin résolu, SHA du CSS réellement lu via le fetcher Pluto natif et règle direction:rtl. Sur chaque site, contrôles FR/EN → LTR et arabe → RTL réussis avant coupure. Une seule valeur de cache du manifeste privé a été actualisée via ClientCache.set_value ; aucune purge et aucun changement du résolveur Framework.

Les vérifications préparatoires du fetcher avaient initialement reçu un chemin relatif, non une URL résolue contre l’origine du site ; ce harnais a été adapté à la résolution native d’origine avant les contrôles réussis. Aucun PDF produit par ces contrôles. Isolation et sauvegardes avaient alors été recontrôlées sur les services actifs.

## Confirmé après reprise

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

## État Git, livrables et prochaine action

Sources applicatives, JSON/template/CSS, PO/POT et Framework inchangés. Références **998 FR /3 024 POT** conservées byte pour byte depuis la base, sans nouveau recompte Babel dans un conteneur arrêté. Framework propre au commit959b85de4086656273e1d158f41923dd3808c350 ; distant develop6b791f33b34efa15566a0cb707f5be59d136df50 inchangé.

Deux documents seulement : ce rapport de blocage et CODEX_HANDOFF.md. Commit local de reprise, **aucune publication de C.2A**, la nouvelle recette conditionnant cette publication n’ayant pas été exécutée. Ce commit ne déclare pas la mission terminée. Aucun artefact privé versionné.

**Prochaine action précise : faire rétablir les six services de recette existants dans un cadre autorisé, sans recréation/suppression ni intervention sur learning.localhost ; requalifier les protections et les états métier/logs, puis reprendre les huit variantes par site avec sorties distinctes.** Vérifier de nouveau les manifestes natifs/cache avant génération, sans refaire toute l’analyse ni écraser C.2.

C.2B reste un mandat distinct : après mesure LTR, privilégier une taille/orientation reconnue nativement (règle @page ou champs paper_size/paper_width/paper_height à étudier selon le schéma installé), sans forcer d’option dans le harnais ni changer le moteur. Aucune correction d’orientation réalisée ici.

Réserves FR-03, synchronisation du rappel B.3, B.4/B.5, politique de diffusion B.5C.2 non adoptée, ancien-format upgrade non démontré et I18N-01 non commencé conservés. Arrêt sur le blocage opérationnel.
