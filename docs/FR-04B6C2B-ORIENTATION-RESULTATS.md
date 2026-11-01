# FR-04B.6C.2B — Orientation native : candidat refusé pour pagination

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
