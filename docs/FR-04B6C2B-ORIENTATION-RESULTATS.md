# FR-04B.6C.2B / C.2B.1 — Orientation native et pagination corrigée

**Actualisation C.2B.1, 1er novembre 2026 : format installé adopté sans force sur les deux sites jetables ;18 PDF finaux,14 standards A4 paysage monopage et4 témoins personnalisés inchangés.17 tests ciblés réussis.** L’historique ci-dessous conserve l’échec C.2B initial ; la chronologie de la correction et ses limites suivent en fin de document. Aucun déploiement ni adoption sur learning.localhost.

## Historique conservé : premier candidat C.2B

1er novembre 2026 (Europe/Paris). Branche `littlepool-dev`, base locale/distante **686ebe9801951d8b635cdd8b30e1ade4fe1df3fb**, checkout initial propre. AGENTS/handoff, résultats B.6/C.1Q/C.2/C.2A et mécanismes natifs installés consultés. Framework propre **959b85de4086656273e1d158f41923dd3808c350**.

**Conclusion : les champs natifs donnent bien un A4 paysage, mais le cas long déborde sur deux pages. Candidat non intégré, aucun import, aucun push.** Le mandat interdit de publier comme validée une correction créant une seconde page. Aucun JSON, template, CSS, paramètre installé ou catalogue modifié.

## 1. Requalification

Six conteneurs existants du projet lp-cert-c1q-9c864a63 actifs, mêmes IDs/images/labels et montages privés qualifiés ; network none, ports0, non privilégiés, code/runtime RO, aucun montage de learning.localhost. Aucun redémarrage ni recréation nécessaire. Environ17 Gio disque et8,3 Gio RAM disponibles.

Deux audits natifs réussis avant expérience : DB/Redis sur sockets Unix distincts, skip-networking=1/port0, interface lo seule, aucune route, huit connexions réservées à192.0.2.10 ports25/465/587/443 bloquées. Protections email/jobs actives, aucun compte email ou job RQ métier, aucun worker/scheduler Frappe. Les formats et permissions installés restent conformes à C.2A.

Les huit artefacts de sauvegarde/restauration et32 PDF historiques C.2/C.2A ont été vérifiés par empreintes avant/après ; aucun écrasement. Les services persistants gardent IDs/StartedAt et empreintes de configuration ; aucune connexion à leur base. Aucun accès production/OMV8 ou learning.localhost.

## 2. Cause et solutions comparées

Le standard conserve sa meta historique pdfkit-orientation=Landscape, non lue par le chemin Browser/Pluto actuel. resolve_pdf_generator sélectionne PlutoPrint depuis Print Settings : wkhtmltopdf historique du JSON n’est pas un choix reconnu de cette version. Aucun moteur ou priorité changé. La balise est conservée : elle peut encore servir aux consommateurs historiques pdfkit ; aucune suppression de compatibilité justifiée par cette seule recette.

| Solution                                                | Comportement natif confirmé                                                                                             | Décision                                                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A. paper_size=Custom, paper_width=297, paper_height=210 | validate_paper_size exige dimensions positives ; unités mm. Browser lit ces champs et fournit largeur/hauteur au moteur | Testée en premier, paysage obtenu mais pagination refusée                                         |
| B. @page size:A4 landscape                              | get_page_rule_size reconnaît taille/orientation ; Browser ne les reprend que sans dimensions explicites déjà présentes  | Étude des sources seulement ; pas de CSS changé, ne résout pas à elle seule la hauteur du contenu |
| C. Paramètre explicite orientation=Landscape            | Option reconnue dans prepare_options_for_pdf, mais dépend du chemin d’appel et peut prendre priorité                    | Non injectée ; masquerait la configuration manquante et ne résoudrait pas le contenu trop haut    |

Priorités dans ce chemin classique : options explicites/dimensions déjà définies peuvent empêcher la lecture de taille du format ; sinon champs paper_size/width/height, puis règle @page si aucune taille explicite ; défaut Print Settings/A4 ensuite. prepare_options_for_pdf convertit les unités en pouces et retourne les dimensions finales ; l’option orientation reconnue peut permuter les axes. Aucune option explicite de taille ou paysage ajoutée à la recette.

## 3. Expérience avant toute modification source

Uniquement sur **cert-c1q-source.localhost** : copie en mémoire du Print Format installé, conservant HTML/CSS/métadonnées/langue/moteur. Candidate : Custom/297/210. Appel natif validate_paper_size réussi, aucune sauvegarde du document. Interceptions de lecture limitées au format candidat en mémoire et à ses trois champs de taille, en plus des lectures fictives déjà validées en C.2A. Les contrôles avant/après vérifient que les lignes réellement installées restent inchangées.

Même download_pdf/validate_print_permission/get_print/printview/Jinja/PlutoPrint que C.2A, mêmes fixtures et options, CSS LTR native effective. Le résolveur, le validateur, le convertisseur et les octets PDF ne sont pas simulés. Observation de PlutoPage.generate_pdf en délégation au vrai moteur : paperWidth=**11,693 pouces**, paperHeight=**8,268 pouces**, marges natives0,591 pouce. Les champs atteignent donc effectivement le moteur.

La seconde cible a été requalifiée mais **aucun PDF candidat n’y a été produit** : l’échec obligatoire sur la première suffit à arrêter avant intégration. Aucun ancien format artificiellement recréé pour provoquer un import.

## 4. Résultats binaires réellement mesurés

**8 PDF authentiques produits, 9 pages au total**, exclusivement candidat en mémoire. Aucun PDF sur format installé corrigé puisqu’aucune correction n’est adoptée.

| Variante                             | Dimensions et rotation              | Pages | Résultat                                   |
| ------------------------------------ | ----------------------------------- | ----- | ------------------------------------------ |
| FR évaluateur/logo                   | 841,895996×595,296021pt, rotation0° | 1     | Paysage, texte complet                     |
| EN évaluateur/logo                   | mêmes dimensions                    | 1     | Paysage, texte complet                     |
| FR un formateur                      | mêmes dimensions                    | 1     | Paysage, formateur visible                 |
| EN nom/titre longs, trois formateurs | mêmes dimensions sur les deux pages | **2** | **Échec : bloc formateurs séparé**         |
| FR issu du contexte                  | mêmes dimensions                    | 1     | Paysage, langue conservée                  |
| EN issu du contexte                  | mêmes dimensions                    | 1     | Paysage, langue conservée                  |
| Personnalisé FR                      | 595,296021×841,895996pt, rotation0° | 1     | Portrait et littéral de l’auteur conservés |
| Personnalisé EN                      | mêmes dimensions portrait           | 1     | Aucun changement                           |

Les six standards expérimentaux sont bien en paysage contre portrait en C.2A. Mais **un sur six échoue au critère une page** : le libellé Instructors reste en bas de page1 et les noms des trois formateurs passent en page2. Le mandat est donc non satisfait ; les succès de conversion ne sont pas présentés comme validation du correctif.

Huit fichiers analysés par pypdf strict/PDFium, neuf pages non blanches, textes attendus après normalisation NFKC des ligatures, dates/accents/chevrons/esperluette présents, aucun U+FFFD ni boîte de glyphe hors page. Les deux comparaisons littérales du cas long restent sensibles à la ligature fi, mais la comparaison normalisée confirme le contenu complet sur l’ensemble des pages. Cela n’excuse pas sa séparation graphique.

**Neuf pages converties et inspectées visuellement**, comparées aux rendus C.2A : nom long et cours complet sur page1, noms des formateurs seuls sur page2. Les autres variantes restent lisibles, logo et évaluateurs présents ; espacements verticaux très importants, ordre général conservé. Ne pas confondre absence de glyphe hors page et respect du document monopage.

Le HTML conserve notamment margin-bottom:13rem en tête et margin-bottom:12rem après la proposition principale. Réduire la hauteur de page rend cette réserve verticale incompatible avec le contenu long, même si la largeur supplémentaire réduit les retours à la ligne. Aucune valeur d’espacement changée pour faire passer le test.

## 5. Permissions, état installé et effets

**8 contrôles de permissions réussis** sur la première cible : titulaire privé autorisé ; tiers/Guest privés refusés avant get_print ; Guest publié ; Administrator/Moderator/Course Creator/Batch Evaluator selon droits historiques. Pas d’ignore_print_permissions ni rôle attribué réellement. Réserve FR-03 sur lecture étendue du personnel conservée.

Méthodes de génération finales sans erreur, analyses de contenu8 réussies, critère de pagination1 échec. Le premier postcontrôle Access Logs a rencontré une limite de liste virtuelle (25 lignes attendues, page par défaut limitée) ; une lecture bornée à1000 a permis la vérification des25 logs, sans nouvel appel PDF ni modification de Framework. Trace initiale conservée. Aucune suite globale ou nouveau build.

Préférences User/System Settings, Print Settings et métadonnées formats/DocPerm/Custom DocPerm/Role/Property Setter hachées identiques avant/après. Aucun certificat, DocShare, inscription, Email Account/Queue ou Communication créé ; File reste2 préexistants, RQ jobs0. **Access Logs techniques source17→25, soit+8**, tous pour C2-FICTIONAL-CERT ; pas de nouvelle impression sur la cible restaurée. Aucun email préparé/envoyé, aucun paiement, certificat métier ou contenu pédagogique.

Les ressources Google Fonts du template demeurent hors d’atteinte : six tentatives des standards,0 succès, aucune police téléchargée. Famille d’origine des sous-ensembles CairoFont/CFF toujours incertaine. Artefacts privés sous `/workspace/work/fr04b6c1q/source/backup/c2b-candidate/` (PDF/PNG/texte/results/inspection, dossiers0700/fichiers0600), scripts recipe/c2b\_\*.py et logs expurgés hors Git. Toutes les ressources conservées.

## 6. Intégration, adoption et tests non exécutés

**Aucun champ modifié dans certificate.json ; aucune actualisation de modified, aucun import ciblé ou forcé, aucune migration.** Les formats installés restent ceux de C.2A, donc portrait en exécution normale. La réussite d’un candidat intercepté en mémoire n’est jamais présentée comme une adoption.

Aucun rollback nécessaire : aucune modification persistante de format ou paramètre. Les sauvegardes restaurées/qualifiées C.1Q restent intactes comme références ; aucune restauration ou nettoyage engagé. Le mécanisme natif d’import et ses préconditions documentées ne sont pas exercés, l’étape préalable étant refusée.

Pas de test de régression de correctif ajouté au dépôt : aucun correctif admissible à valider. Les recettes privées dépendent des fixtures installées ; ne pas les versionner comme tests autonomes. Les tests source/format installé après adoption et16 PDF après correction ne sont **pas exécutés** ; ils devront être créés/exécutés lors d’une solution monopage acceptée. Pas de faux test vert affirmant que le standard Git est déjà paysage.

Babel disponible du conteneur recompte **998 FR/3024 POT** ; toutes sources/catalogues et Framework restent identiques à la base. develop reste6b791f33b34efa15566a0cb707f5be59d136df50. Un commit documentaire local seulement, rapport et handoff, **aucun push** car les critères de publication du mandat échouent.

## 7. Options de correction à décider

Option recommandée : conserver la configuration native Custom/297/210 comme candidate et autoriser un sous-lot de présentation distinct pour réduire/adapter les deux grandes réserves verticales à l’impression paysage et garder le groupe libellé+noms des formateurs sur la même page. Tester séparément les noms/titres longs FR et EN, évaluateur/logo et un/plusieurs formateurs, puis les huit variantes sur les deux sites après adoption contrôlée. Choisir les espacements par mesure binaire, pas au seul aperçu HTML.

Alternatives à évaluer séparément : règle de pagination locale protégeant le bloc formateurs, ou organisation verticale ajustée aux dimensions du papier. Une simple règle break-inside ne garantit pas une seule page si la hauteur totale reste excessive. Ne pas réduire globalement la police ou les marges, ajouter un paramètre d’URL, changer de moteur ou imposer fit-height pour masquer le dépassement. Aucun de ces changements réalisé ici.

Prochaine action précise : faire valider ce périmètre de présentation minimal avant toute modification source ; conserver le candidat privé et ses preuves, puis créer un test de régression qui exige paysage **et une page**, y compris le cas long actuellement rouge. Arrêt après C.2B sans autre lot automatique.

Réserves FR-03/B.3/B.4/B.5, politique de diffusion B.5C.2 non adoptée, priorités de langue simple/Desk/multiple, ancien-format upgrade non démontré et police exacte conservés ; I18N-01 non commencé. Aucune production/OMV8/learning.localhost concernée.

## C.2B.1 — Diagnostic mesuré et essais privés

Mandat complémentaire autorisant uniquement les dimensions natives et les espacements nécessaires ; base distante686ebe9801951d8b635cdd8b30e1ade4fe1df3fb et commit local de constat **0bb3415fbac327071b9d4a3a21a324552dea1b75 préservé**. Aucun reset/rebase/amendement de cet historique.

Les six conteneurs actifs ont été requalifiés : IDs/images/labels/montages, réseau none/ports0, sockets DB/Redis, protections mail/jobs et huit probes réservées bloquées. Aucun worker/scheduler Frappe, Email Account ou job métier. Huit archives/copies et40 PDF antérieurs (C.2/C.2A/C.2B) vérifiés par empreintes et conservés. Les rapports antérieurs et le handoff ont été réutilisés, sans audit global ou réinstallation.

**Partage de code vérifié : lms-bench monte /workspace entier**, donc le checkout LMS y est accessible même s’il est RO dans les cibles jetables. lms-bench est exited ; aucun démarrage ou changement de configuration/site/base n’y a été effectué. Tous les essais de template sont restés dans un chargeur Jinja privé des seuls processus de recette. Aucune version expérimentale écrite dans le checkout pendant ces premiers essais. Après validation binaire, seules les modifications finales ont été intégrées ; un futur démarrage du site persistant pourra naturellement voir le code partagé validé, sans que son Print Format installé ait été adopté ici.

Reproduction privée sur source : même candidat Custom297×210, espacements13rem/12rem, mêmes fixtures longues EN **et FR** → deux PDF, deux pages chacun. PDFium mesure la page595,296021pt de haut, marges natives0,591pouce≈42,552pt en haut/bas, soit≈510,192pt imprimables. Organisme vers y532,585–546,751 ; introduction FR vers y351,060–364,710 ; nom vers y317,442–335,298 ; phrase commençant vers y283,023 ; libellé formateurs vers y53,308–63,853. Les noms sont reportés en page2, vers y535,895–547,700. Coordonnées en points, origine au bas de page.

Ces mesures montrent une consommation verticale importante après l’organisme et après la phrase, mais aussi le poids réel des lignes de texte et du bloc formateurs. Une hauteur de page correcte ne suffit pas à elle seule. Aucun texte, nom, taille de caractère, largeur70%, police, marge papier ou donnée métier n’a été réduit/modifié.

## C.2B.1 — Valeurs expérimentées et erreur de harnais explicitée

| Étape privée               | Valeurs effectives après organisme / après phrase | PDF conservés         | Résultat                               |
| -------------------------- | ------------------------------------------------- | --------------------- | -------------------------------------- |
| Reproduction               | 13rem /12rem                                      | 2 source, FR/EN longs | 2pages chacun, échec attendu           |
| Premier essai annoncé12/11 | **11rem /11rem** en réalité                       | 2 source longs        | 1page                                  |
| Première matrice privée    | mêmes11/11 effectifs                              | 9 par site,18 total   | 1page, témoins personnalisés inchangés |
| Recontrôle exact final     | **12rem /11rem**                                  | 2 source longs        | 1page et contenu complet               |

**Erreur identifiée** : le remplacement en chaîne du générateur privé transformait13→12, puis remplaçait tous les12→11, y compris celui qu’il venait de créer. La première validation privée ne portait donc pas exactement sur les deux valeurs ensuite intégrées. Cette erreur a été découverte en comparant les PNG privés aux PNG du format réellement installé ; elle n’est pas masquée dans le bilan.

Les fichiers applicatifs ont reçu la réduction plus petite **13→12 et12→11**, sans remplacement ambigu. Leur matrice binaire installée réussit également ; le générateur privé a ensuite été corrigé pour cibler explicitement le bloc de largeur70%, et un contrôle supplémentaire des deux cas longs avec les valeurs exactes confirme le résultat. Aucun nouvel ajustement source nécessaire pour cette correction du harnais. Aucune exposition d’essai11/11 au site persistant.

Mesures avec les **valeurs finales12/11** : introduction FR y363,075–376,725 ; libellé formateurs y77,323–87,868 ; premier nom y49,895–61,700 sur page1. Le bas de ce nom est à≈49,9pt du bord inférieur, au-delà de la marge native≈42,6pt. L’introduction remonte d’environ12pt et le libellé de24pt comparés à la reproduction ; les noms réintègrent la page. La marge de sécurité reste bornée, elle ne garantit pas des textes de longueur illimitée.

## C.2B.1 — Sources et adoption native

Correctif **a7c43154** : seulement

-   certificate.json : paper_size=Custom, paper_width=297, paper_height=210 ; modified actualisé à l’heure réelle de l’édition, **2026-11-01 13:25:40.780861 UTC**, sans antidatage/futur artificiel pour forcer un import.
-   certificate.html : exactement les deux réductions13rem→12rem et12rem→11rem. Chaînes gettext, variables, échappement, dates, largeur, polices, balise pdfkit historique et tout le reste byte-identiques après neutralisation de ces deux valeurs.
-   Tests de langue/impression existants complétés par3 méthodes ciblées.

standard/doc_type/custom_format/HTML include/CSS/default_print_language=en/pdf_generator et autres paramètres conservés. Print Settings globaux inchangés. Aucune extraction de traduction, compilation PO/MO ou modification des catalogues nécessaire.

Avant chaque import : format installé relu, absence de personnalisation homonyme vérifiée sur ses champs et date ancienne identique à la référence Git, nouvelles dimensions absentes, source plus récente ; export privé du format installé conservé. Backups C.1Q complets et restauration auparavant vérifiée conservés, formats privés connus. **Un seul import_file_by_path(force=False) par cible**, depuis la nouvelle source. Pas de migration ni import forcé, aucune manipulation de date DB. Les deux imports ont eu lieu et ont été commités ; aucun import répété.

Premier contrôle post-import interrompu sur une comparaison de représentation297.0 contre297. C’est un défaut de harnais : Frappe stocke les champs Float en nombres flottants. Relecture **seule**, comparaison numérique correcte, champs et date installés conformes au JSON, sur les deux sites. Les formats personnalisés et droits ont été revérifiés ; les lignes historiques Certificate exportées, substituées uniquement pour le calcul de l’ancienne empreinte complète Print Format, reproduisent l’empreinte d’avant import : les autres lignes/modèles n’ont donc pas changé.

Les contrôles de préférences User/System Settings et Print Settings avant/après chaque matrice restent identiques. La tentative initiale d’import avait conservé leur hash seulement en mémoire ; son arrêt de contrôle n’est pas présenté comme une preuve persistée autonome de ces hashes autour de l’import. L’import ciblait uniquement Certificate, et les états installés/contrôles suivants sont documentés séparément.

Aucun retour arrière exécuté, puisque le format est conforme et la recette finale réussit. En cas de besoin futur : préserver les exports avant/après et les sauvegardes complètes, définir un retour arrière contrôlé séparé ; ne pas forcer une ancienne date de document ni écraser une base existante sans mandat.

## C.2B.1 — Recette finale sur formats installés

**18 PDF authentiques, neuf par site**, depuis les formats relus dans les bases, sans surcharge de format ou de template : sept standards (FR/EN évaluateur+logo, FR un formateur, FR/EN longs avec trois formateurs, FR/EN langue du contexte), plus modèles personnalisés FR et EN.

-   **14 standards :841,895996×595,296021pt, rotation0°, exactement1page**.
-   **4 personnalisés :595,296021×841,895996pt, rotation0°,1page**, littéraux/HTML/CSS inchangés.
    -18 signatures/lectures strictes pypdf/PDFium, textes complets après normalisation NFKC, glyphes dans page, accents, dates et noms/titres complets. Tous les trois formateurs retrouvés sur la même page dans les quatre scénarios longs installés.
    -18 pages rasterisées ; neuf variantes installées inspectées à taille complète, dont les deux cas longs et leurs blocs formateurs. Les PNG source/restauration sont identiques ; seconde série vérifiée par comparaison. Pas de contenu masqué, coupure ou chevauchement majeur. Espaces et séparation des blocs conservés, logo dans les marges ; témoins personnalisés aux pixels identiques à C.2A.
-   La comparaison au portrait C.2A et au paysage initial à deux pages conserve l’ordre de lecture et les données. Les différences de pixels avec le premier essai privé sont cohérentes avec ses11/11 effectifs, puis résolues par le contrôle exact12/11 ; aucune prétention de pixels identiques pour des présentations différentes.

Fixtures longues mesurées : **nom89 caractères, titre163 caractères, trois formateurs**. Leur réussite n’homologue pas des contenus illimités, logos arbitraires, autres polices, fuseaux ou traductions de longueur différente. Polices CairoFont/CFF de secours toujours non identifiées avec certitude ; aucune police téléchargée. Les ressources Google Fonts existantes restent bloquées, aucun accès externe réussi.

Nombre de PDF de recette **conservés pendant C.2B.1 :42** :2 reproduction+2 premier essai+18 première matrice privée+18 installés+2 contrôle exact. Les tests autonomes produisent aussi des PDF en mémoire, séparés de ces artefacts ; aucune sentinelle PDF. Les42 fichiers sont privés et ne sont pas publiés. Ils ne doivent pas être confondus avec42 validations finales : la reproduction échoue et la première matrice utilisait11/11.

## C.2B.1 — Tests et contrôles de sécurité

**Suite ciblée finale :17 méthodes réussies**,0 échec,0 skip dans cet environnement, dont14 tests existants et3 nouveaux : dimensions/champs natifs/espacements ; contenu long FR/EN et isolation du modèle personnalisé ; vraie conversion PlutoPrint FR/EN sans site privé, avec lecture du bundle CSS local et typographie native de printview. Les lectures sont simulées et les accès DB/SMTP/réseau sont bloqués ; aucune dépendance secrète ou chemin de site privé. Le test binaire est explicitement optionnel si PlutoPrint ou le bundle compilé local est absent, sans installation automatique.

Un contre-test privé rétablit les seuls anciens espacements **en mémoire** : le nouveau test binaire échoue comme attendu à2pages. Aucun fichier Git reverti et aucune validation HTML assimilée à une preuve PDF. Les permissions privées/publiées et refus avant PDF restent couvertes par les tests antérieurs, ainsi que16 scénarios de droits exécutés dans la matrice installée (huit par site).

Échecs intermédiaires conservés : premier test PDF autonome sans conf liée au site (harnais adapté avec conf fictive), puis rendu de test sans typographie native de printview qui paginait différemment (style natif ajouté). Après ce correctif, un test isolé a réussi, **puis la suite complète ciblée de17 méthodes a été relancée et réussie** ; la seule relance isolée n’a pas été utilisée pour déclarer la suite verte. La suite ne valide pas une recette Desk/multiple ni des transactions réelles.

Ruff absent du venv et des commandes disponibles : tentative de commande échouée, **contrôle Ruff non exécuté**, aucune installation. Syntaxe Python analysée, JSON chargé, diff/espaces vérifiés ; rapport formaté avec Prettier existant. Pas de build frontend, tests backend globaux, migration, Crowdin ou recompilation de catalogues.

Final : Certificate/DocShare/inscriptions/Email Account/Email Queue/Communication0 ; File2 préexistants par site, aucun File métier ajouté ; jobs RQ0, aucun worker/scheduler. Droits et modèles personnalisés inchangés. Source/template partagés modifiés seulement pour la version finale ; aucun démarrage ou adoption learning.localhost, services persistants et configurations conservés.

**Access Logs techniques :source25→49 (+24), restauration16→34 (+18), total+42**, cohérent avec les42 PDF de recette. Tests autonomes sans site : pas d’Access Log métier ni écriture DB. Aucun email, délivrance de certificat, donnée pédagogique ou paiement. Ne pas annoncer zéro écriture absolue.

Les huit archives et40 PDF historiques ont été revérifiés par SHA après les opérations ; tous conservés. Six conteneurs actifs, aucune suppression/recréation/installation.998 traductions françaises et3024 clés POT recomptées avec Babel natif ;79 PO/POT et Framework intacts. Réserves FR-03/B.3/B.4/B.5, diffusion B.5C.2 non adoptée, priorités de langue simple/Desk/multiple, ancien-format upgrade et police exacte maintenues ; I18N-01 non commencé.

## C.2B.1 — Livraison et suite

Commit de constat0bb3415f conservé ; correctif/tests **a7c43154**, puis complément documentaire courant (SHA via git log). Publication normale sur littlepool-dev autorisée par le mandat après contrôles ; aucune preuve binaire, script, secret, configuration, manifeste ou sauvegarde à publier. Les données de recette et exports restent sous `/workspace/work/fr04b6c1q/`, notamment source/restore/backup/c2b1-\*, et c2b1/ pour les contrôles et journaux techniques privés. Répertoires0700/fichiers0600 appliqués aux artefacts.

**Conclusion : standard A4 paysage monopage validé sur les deux sites jetables pour cette matrice et ces limites.** La réserve historique d’ancien-format upgrade concerne toujours une installation ancienne/personnalisée, pas ces deux versions connues comparées puis importées sans force. Aucun déploiement ou adoption générale autorisé implicitement.

Prochaine action possible, sur mandat distinct : décider de l’adoption sur une instance cible sauvegardée, en comparant ses personnalisations et dates, ou poursuivre les réserves FR-04 prioritaires. Ne pas supprimer de ressources ni généraliser la validation à des contenus illimités. Arrêt après C.2B.1.
