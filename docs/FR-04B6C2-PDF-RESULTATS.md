# FR-04B.6C.2 — Recette PDF binaire de certification

1er novembre 2026 (Europe/Paris). Branche `littlepool-dev`, SHA initial local et distant **333b820a5582c113ba93f7c0a8d6e626ae88e6bd**. Framework **959b85de4086656273e1d158f41923dd3808c350**, propre. Mandat joint, AGENTS, handoff et rapports B.6/C.1/C.1Q consultés ; mécanismes natifs réellement présents examinés.

**Conclusion : PDF partiellement validé. 16 vrais PDF produits et lisibles ; contenu français/anglais vérifié, mais orientation paysage non respectée et recette graphique limitée par un manifeste d’assets de test incorrect.** Aucun correctif applicatif ou de format effectué. Ne pas déclarer le certificat prêt à l’impression finale.

## 1. Environnements et préconditions

Seules cibles de recette : `cert-c1q-source.localhost` et `cert-c1q-restore.localhost`, projet Compose `lp-cert-c1q-9c864a63`. Six conteneurs conservés ; mêmes identifiants et StartedAt au début/à la fin. Sources applicatives compatibles avec C.1Q, formats installés relus en base et comparés au JSON (HTML/include, CSS, moteur, langue en et date).

Recontrôles réussis : réseau none, aucun port publié, conteneurs non privilégiés UID1000, aucun montage de données/configuration de learning.localhost ; code et runtime partagés en lecture seule. MariaDB skip-networking et Redis port0 avec sockets distincts ; protections mute_emails/pause_scheduler/disable_scheduler/suspend_email_queue actives. Huit connexions synthétiques vers l’adresse réservée 192.0.2.10, ports25/465/587/443, échouent ENETUNREACH. Aucun worker/scheduler Frappe lancé, aucun job RQ métier.

PID1 des Bench toujours sleep. Un processus technique `flow_harness`/`flow serve` sur socket Unix est observé sur la cible source ; son exécutable et ses options ont été identifiés, il ne s’agit pas d’un worker/scheduler Frappe. Il n’a été ni arrêté ni reconfiguré. Son ancienneté n’est pas déduite du seul PID1.

Sauvegardes C.1Q et copies de restauration présentes : **8 fichiers réexaminés**, tailles et SHA256 identiques aux quatre artefacts du manifeste. Pas de nouvelle sauvegarde/restauration, purge ou suppression. Environ17 Gio libres et7,5 Gio de mémoire disponible avant génération ; limites Docker inchangées. Les services persistants lms-bench/lms-mariadb/lms-redis gardent identifiants et dates de démarrage ; empreintes de leurs configurations identiques. Aucune connexion à leur base ou intervention sur learning.localhost/OMV8.

## 2. Moteur réellement sélectionné

Sur les deux bases : Print Settings.pdf_generator=**PlutoPrint** ; choix reconnus chrome/PlutoPrint/Typst. La valeur historique `wkhtmltopdf` du Certificate n’est pas un choix reconnu : `resolve_pdf_generator` retient donc PlutoPrint. Format Jinja classique, aucun blocker Pluto, aucun hook on_print_pdf. Hooks PDF natifs chrome/PlutoPrint/Typst présents ; **PlutoPrint est effectivement appelé**, sans substitution de moteur.

Déjà disponibles : PlutoPrint, pypdf, pypdfium2/PDFium et Pillow. wkhtmltopdf existe mais n’est pas utilisé ; Chromium n’est pas disponible dans le Bench jetable. Aucune acquisition Chromium, installation, modification de sandbox/privilèges, dépendance ou police téléchargée. Un garde de harnais refuse toute bifurcation vers Chromium avant acquisition ; il n’a pas été déclenché.

## 3. Chemin exécuté et données fictives

Chemin natif : `download_pdf → validate_print_permission → print_language → get_print → printview/Jinja → hook get_plutoprint_pdf → get_pdf → PlutoPrint`. Aucun octet sentinelle, convertisseur PDF mocké ou HTML renommé en PDF. L’appel reste dans le processus de recette, sans session HTTP réelle. Le Print Format vient de la base de chaque site et son include est résolu nativement ; dictionnaires et moteur Jinja non remplacés.

Documents LMS Certificate uniquement en mémoire, identifiants préfixés C2-FICTIONAL, apprenant/cours/formateurs/évaluateur/organisme fictifs. Seules leurs lectures et rôles fictifs sont interceptés ; méta, format, traductions, résolveur, droits et convertisseur sont natifs. Aucun insert, délivrance, after_insert, publication ou email. Logo PNG géométrique créé en mémoire et passé en data URI, aucun File ajouté.

Dans les seuls assets neufs : liens vers les public applicatifs déjà montés RO et manifeste de résolution des bundles généré depuis les fichiers statiques existants. Aucune compilation frontend. **Limite détectée après rendu : le regroupement de noms logiques a sélectionné le bundle print RTL au lieu de LTR**. Les fetches le prouvent. Ce défaut de préparation n’a pas été corrigé par une nouvelle itération ; les conclusions graphiques sont limitées en conséquence et ne doivent pas être attribuées intégralement à l’application.

## 4. Variantes réellement produites

Chaque ligne a été exécutée sur chacun des deux sites, soit **8 PDF par site, 16 au total**.

| Variante             | Langue et contenu                                           | Résultat                                                    |
| -------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| fr-evaluator-logo    | FR explicite, contexte EN, accents/HTML, évaluateur et logo | PDF lisible, texte FR attendu                               |
| en-evaluator-logo    | EN explicite, contexte FR, mêmes identités/logo             | PDF lisible, texte EN attendu                               |
| fr-single-instructor | FR, un formateur, sans logo                                 | Formateur et identité présents                              |
| en-long-multiple     | EN, noms/titre longs, trois formateurs                      | Contenu complet après normalisation des ligatures           |
| fr-context           | Sans langue explicite, contexte FR, deux formateurs         | FR conservé malgré défaut du format en                      |
| en-context           | Sans langue explicite, contexte EN, un formateur            | EN conservé                                                 |
| custom-fr            | Format C1Q Fictional Custom, langue FR                      | Littéral anglais de l’auteur inchangé                       |
| custom-en            | Même modèle, langue EN                                      | Même littéral, HTML/CSS/langue par défaut stockés inchangés |

Contexte linguistique restauré après chaque appel. Dates visibles : **17 mai 2027 / May 17, 2027**, date civile sans conversion de fuseau. Apostrophes, accents, esperluette, guillemets et chevrons affichés comme texte ; aucun contenu de fixture devenu balise exécutable. Les intitulés, noms propres et titres de cours restent ceux de la fixture.

`default_print_language="en"` conservé. L’impression multiple n’a pas été rejouée en binaire ; ses priorités établies en B.6/C.1Q restent des résultats antérieurs, pas une nouvelle preuve PDF. Pas de session Desk ou recette d’un ancien format installé ; aucun format persisté artificiellement pour étendre les scénarios.

## 5. Structure, texte, graphisme et anomalie d’orientation

**16/16** : signature %PDF-, analyse pypdf stricte, ouverture PDFium, une page non blanche, texte attendu après normalisation Unicode NFKC et espaces, aucun caractère de remplacement U+FFFD. PDFium ne trouve aucune boîte de glyphe dépassant les limites de page. La normalisation est nécessaire car le moteur encode notamment « fi » sous forme de ligature « ﬁ » : deux comparaisons littérales du cas long échouaient, sans perte de texte après normalisation. Aucun succès global du seul script assimilé à une conformité graphique.

Dimensions de chaque page : **595,296 × 841,896 points, A4 portrait**, rotation effective portrait. Les **12 PDF standards échouent au critère paysage**. Les quatre PDF personnalisés restent en portrait sans exigence paysage propre à leur modèle.

Cause identifiée par les sources natives : le template possède `<meta name="pdfkit-orientation" content="Landscape">`, héritage wkhtmltopdf. Le Browser partagé chrome/Pluto lit les options CSS/Print Format/@page et l’option orientation, mais ne reprend pas cette balise pdfkit. Aucun paysage n’est fourni ailleurs dans le format installé. Le document sort donc en portrait. Aucun changement de template/JSON/Print Settings/Framework ou option forcée pour masquer cet échec.

**16 pages converties en PNG ; 8 images uniques inspectées à taille complète.** Pour chaque variante, le PNG de restauration est identique octet pour octet au PNG source : la seconde série est vérifiée par comparaison, pas prétendue réinspectée indépendamment. Nom, titre, date, évaluateur/formateurs visibles ; pas de coupure ou chevauchement majeur observé sur les images ; titre long sur plusieurs lignes, noms longs lisibles. Logo géométrique et marges visibles ; grandes zones verticales vides. Pas de bordure de certificat : la classe CSS historique inner-border n’est pas utilisée par ce HTML ; le contour bleu visible est celui du logo fictif.

Ces observations ne constituent **pas une recette LTR finale**, à cause du manifeste RTL du harnais. L’orientation portrait et cette limite suffisent à empêcher une validation graphique complète ; aucun ajustement de mise en page entrepris.

## 6. Polices et ressources externes

Familles locales recensées : Cantarell, DejaVu Sans/Serif/Mono. La requête Google Fonts Inter est tentée nativement sur chaque rendu standard : **12 tentatives, 0 succès**. Le moteur tolère leur échec et produit les PDF ; aucun accès externe réussi et aucun téléchargement. Les CSS du site sont servis par la lecture locale native, sans serveur HTTP.

Durées constatées des appels finaux : environ0,095 à0,691 seconde par PDF, sans délai de plusieurs secondes observé. Les PDF comportent des sous-ensembles embarqués aux noms génériques **CairoFont**, avec flux FontFile3 Type1C/CID. Leur famille source précise n’a pas été établie : ni Cantarell ni Inter ne sont déclarées « réellement utilisées » sur la seule base de fc-list. La lecture SFNT ne peut identifier ces flux CFF renommés. **La recette de famille typographique reste ouverte**, même si les accents sont visibles et le texte lisible sur les images. Aucune équivalence métrique avec Inter revendiquée.

## 7. Permissions et effets de bord

**16 scénarios de permissions réussis**, huit par site, avec vrai validate_print_permission et hooks LMS sur objets fictifs : titulaire privé autorisé ; tiers privé et Guest privé refusés ; Guest sur publié autorisé ; Administrator, Moderator, Course Creator et Batch Evaluator selon droits historiques. Pour les quatre refus cumulés, download_pdf déclenche PermissionError **avant tout appel get_print**, vérifié par garde. Aucun ignore_print_permissions, nouvelle route, clé, partage ou modification de droits.

Les cas autorisés du personnel vérifient le contrôle d’accès ; ils ne constituent pas huit téléchargements séparés sous ces profils. La réserve FR-03 de droits étendus du personnel est maintenue.

Avant/après : LMS Certificate, DocShare, inscriptions cours/session, Email Account, Email Queue et Communication restent à0. **File reste à2 par site**, état technique préexistant constaté avant ce lot, aucun File ajouté. Empreintes Print Format/DocPerm/Custom DocPerm/Role/Property Setter identiques ; modèle personnalisé intact. Aucun job RQ métier, worker/scheduler, SMTP ou transaction métier.

Access Logs natifs explicitement autorisés : **9 sur source, 8 sur restauration**, tous pour C2-FICTIONAL-CERT. Le premier échec de rendu a produit le neuvième log source. `frappe.in_test=True` seulement dans les processus de recette utilise l’insertion native directe SQLite plutôt que la file Redis différée ; aucun contournement de permission. Ces écritures techniques et fichiers SQLite sont distingués des données métier et conservés. Pas de purge de cache pour faire réussir les tests.

PDF/PNG/textes/résultats et journaux conservés hors Git sous `/workspace/work/fr04b6c1q/{source,restore}/backup/c2-pdf/`, dossiers privés0700 et fichiers0600. Aucune URL publique, configuration, sauvegarde ou donnée sensible publiée. Six conteneurs et toutes sauvegardes conservés, zéro suppression.

## 8. Contrôles, incidents et limites

-   Requalification des deux sites, 8 probes egress bloqués, 8 empreintes d’archives, identités/montages/ressources : vérifiés. Pas de répétition de restauration ou des anciennes suites.
-   Précontrôle initial : tentative de count SQL sur Access Log échoue car ce DocType est virtuel/SQLite ; inventaire adapté, puis comptes de logs par API native. Cela ne constitue pas un échec du moteur PDF.
-   Premier rendu source : refus User does not exist dans la construction du contexte web, avant conversion, identité fictive absente de la lecture cached. **Une correction du harnais de rendu**, limitée à cette lecture fictive, permet les huit variantes finales sur chaque site. Première trace conservée. Aucun vrai User créé.
-   Contrôles hôtes : schéma de snapshot et exigence de PID de docker top ajustés ; processus Flow identifié. Babel absent du Python hôte : vérification effectuée avec le Babel existant du conteneur, sans installation.
-   Générations binaires16, permissions16, analyses structurelles/textuelles16 réussies dans les limites décrites ; paysage standard12 échecs. **Aucune suite globale déclarée réussie.** Aucun ancien test HTML compté comme test binaire.
-   Sources, JSON/template, catalogues LMS et78 autres PO/Framework inchangés. Babel recompte **998 traductions FR, 3 024 clés POT** ; pas de modification/compilation de catalogues nécessaire.
-   Pas de test réutilisable versionné : les recettes de cette mission dépendent des deux bases privées/fixtures installées et restent hors Git. Aucun test global, build, SMTP, ancien-format upgrade, impression multiple binaire, comparaison de moteurs ou PDF sur données persistantes exécuté.

## 9. Suite recommandée et publication

Préparer un sous-lot distinct : remettre le manifeste statique de recette en conformité avec les bundles LTR/RTL natifs, puis spécifier une correction minimale d’orientation compatible avec le moteur natif (options reconnues/@page à étudier et tester), **sans modifier Framework ni imposer un moteur**. Reprendre ensuite la recette FR/EN paysage, textes longs, marges et identification fiable des polices. Aucun de ces correctifs commencé ici ; pas de refonte autorisée implicitement.

Politique de diffusion FR-04B.5C.2 toujours proposée/non adoptée ; réserves FR-03, B.3 synchronisation, B.4/B.5 et C.1Q ancien-format upgrade conservées. Aucun I18N-01 ou autre chantier démarré.

Livraison documentaire autorisée : ce rapport et CODEX*HANDOFF.md, un commit normal sur littlepool-dev après contrôles. Preuves privées complémentaires : `/workspace/work/fr04b6c1q/c2/` (inventaire/final-summary/contrôles), scripts recipe/c2*\*.py et journaux expurgés par cible. Ne pas publier les artefacts opérationnels. Arrêt après cette recette partielle.
