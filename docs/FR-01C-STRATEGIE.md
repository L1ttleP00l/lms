# FR-01C — Stratégie française et intégration Crowdin

Date : 28 octobre 2026 (Europe/Paris). Dépôt `L1ttleP00l/lms`, branche `littlepool-dev`, base locale et distante `b70e7d38`. **Document préparatoire : aucune option mise en œuvre, aucun accès Crowdin présumé.** FR-01A et FR-01B sont terminés et publiés ; leurs résultats ne sont pas réexécutés ici.

## 1. Architecture cible recommandée, à valider

LittlePool reste multilingue : anglais source et secours, français intégral visé, langue système configurable et préférence utilisateur explicite prioritaire/persistante. Les contenus pédagogiques rédigés sont distincts de l’interface.

**Recommandation principale : option B, projet Crowdin LittlePool dédié au catalogue du fork**, alimenté par le POT extrait nativement. Le projet prépare les PO livrés dans les chemins existants ; le runtime reste strictement Frappe. Réutiliser les traductions officielles compatibles comme base et contribuer les améliorations génériques au projet officiel (option A). Il ne s’agit pas de maintenir deux dictionnaires runtime LMS : un seul PO français LMS versionné, un seul MO LMS généré, puis la fusion native avec les catalogues Framework et éventuelles surcharges explicitement gérées.

Motif : le fork contient des clés absentes de l’amont et vise une couverture française complète ; une contribution officielle seule ne donne ni droit d’ajouter ces sources ni maîtrise des délais de validation. Un projet propre permet de contrôler le glossaire, les sources du fork et les validations, au prix d’une configuration et d’un coût éventuel à confirmer. Si budget ou droits ne le permettent pas, démarrer après accord par l’option C limitée aux clés approuvées, sans attendre ni inventer d’accès officiel.

Aucun projet créé, aucune invitation ni contribution envoyée, aucun workflow déclenché ou modifié. Cette recommandation n’est pas une décision d’achat ou une autorisation d’intégration.

## 2. Audit ciblé du circuit existant

| Élément versionné / code inspecté | Fonction disponible | Limite pour LittlePool |
| --- | --- | --- |
| `crowdin.yml` | `preserve_hierarchy: true` ; source `/lms/locale/main.pot`, destinations `/lms/locale/%two_letters_code%.po` | Pas de projet LittlePool identifié ; le mapping à deux lettres demande une revue avant ajout de variantes régionales |
| `lms/locale/main.pot`, `fr.po` | Sources gettext ; métadonnées du PO renvoyant au projet Frappe et à `[frappe.lms] develop` ; POT sous la même licence que Learning | Métadonnées = provenance, pas preuve d’accès, de configuration active ou de dernière synchronisation du fork |
| `.github/workflows/generate-pot-file.yml` | Génération planifiée le vendredi à 16:00 UTC ou manuelle ; matrice develop/main-hotfix/version-16-hotfix/version-15-hotfix ; Python 3.14, Node 24 | littlepool-dev absent ; installe un nouveau Bench en CI, donc coûteux et inutile pour les contrôles locaux déjà validés |
| `.github/helper/update_pot_file.sh` | Appelle `bench generate-pot-file --app lms`, commit le POT, pousse une branche et ouvre une PR | **Destination codée en dur `https://github.com/frappe/lms.git`, PR avec `-R frappe/lms`**. Ne pas exécuter pour le fork sans adaptation explicite et revue des droits |
| `.github/workflows/crowdin-actions-update-main-pot.yml` | Export réel des sources : push du POT sur les quatre branches citées ou lancement manuel ; `upload_sources: true`, import désactivé ; amorçage optionnel des PO | Le push littlepool-dev ne déclenche pas cet export. Un lancement manuel utilise `[frappe.lms] ${{ github.ref_name }}` et peut écrire dans le projet configuré : ne pas le lancer pour sonder les accès |
| `.github/workflows/crowdin-actions-download-translations.yml` | Import planifié le lundi à 04:00 UTC ou manuel ; téléchargement puis PR de localisation ; aucune source exportée par ce workflow | Matrice sans littlepool-dev, bases de PR notamment develop ; le workflow d’import ne remplace pas l’export des sources |
| `AGENTS.md`, `Contribution.md` | `_()`/`__()`, Crowdin comme circuit et interdiction d’éditer manuellement `lms/locale/` ; commits conventionnels et contributions relues | Les futurs travaux d’automatisation doivent respecter les restrictions utilisateur : littlepool-dev uniquement, aucune fusion ni push sans accord |
| Framework `frappe/commands/gettext.py`, `frappe/gettext/translate.py`, `babel_extractors.csv` | Génération POT, synchronisation PO, compilation MO ; extracteurs natifs notamment Python/JS/Vue/HTML/JSON | Ne pas remplacer le pipeline par un extracteur maison ou prétendre que toute clé dynamique/TypeScript est automatiquement couverte |
| Framework `frappe/translate.py`, LMS `get_translations`, plugin Vue | Fusion CSV/MO par application, langues parentes, surcharges Translation en base, cache ; repli natif et dictionnaire réactif déjà corrigés | Toute livraison doit vérifier le dictionnaire final, pas uniquement le PO ; surcharges et clés communes peuvent masquer une nouvelle traduction |

**Précision sur les documents précédents :** FR-01B décrivait le workflow d’import, qui n’exporte effectivement pas les sources. L’examen FR-01C identifie aussi le workflow d’export distinct ; l’export est donc implémenté, mais son utilisation sur le fork et ses autorisations restent à établir. Les constats/tests historiques ne sont pas réécrits.

### Disponibilité technique, droits et configuration

- Disponible localement : commandes et chargeur natifs, catalogues, conventions et définitions des workflows. L’extraction ciblée des 13 clés et la compilation native ont déjà été validées ; ne pas les répéter pour cette étude.
- Non vérifié : participation au projet officiel, rôle traducteur/relecteur/gestionnaire, droit de téléverser le POT, droit de créer une branche Crowdin, droit de télécharger uniquement les traductions approuvées ; disponibilité d’un projet propre et autorisations GitHub Actions/PR.
- La présence de références de variables dans les YAML ne prouve pas que les credentials existent ou donnent accès. Aucune page de secrets GitHub, variable d’environnement sensible, fichier de credentials, valeur de jeton ou service d’administration Crowdin n’a été consulté.
- À configurer seulement après accord : projet et propriétaire, langues/variantes, branche de localisation, export des sources, validation linguistique, export des traductions approuvées, droits minimaux et PR ciblant littlepool-dev. Ne pas amorcer des traductions officielles comme « approuvées » sans revue.
- Les prix, limites de mots/utilisateurs/branches et conditions d’une éventuelle offre open source Crowdin ne sont pas établis par le dépôt. Demander une confirmation actuelle au propriétaire avant décision ; aucune gratuité ni tarification chiffrée n’est supposée.

Le nom « traductions validées » doit correspondre à une règle d’export vérifiée : le YAML de téléchargement ne prouve pas à lui seul un filtrage sur les seules chaînes approuvées. Définir cette règle dans le projet, tester l’export puis relire la PR avant intégration.

## 3. Comparaison des options

| Critère | A — Crowdin officiel Frappe | B — Crowdin LittlePool | C — Translation natif Frappe versionné |
| --- | --- | --- | --- |
| Simplicité | Simple pour proposer une traduction d’une clé existante ; complexe pour ajouter une source propre au fork | Mise en place initiale à faire, ensuite circuit maîtrisé | Simple pour un petit lot ; export/fixtures à organiser |
| Coût éventuel | Conditions de contribution non vérifiées ; temps de revue et dépendance aux mainteneurs | Plan, éventuelle éligibilité open source et budget à confirmer | Pas d’abonnement Crowdin ; temps de saisie, revue, tests et maintenance à financer |
| Maintenance | Mutualisée avec l’amont ; délais et glossaire externes | LittlePool gère glossaire, validation et synchronisation amont | Petite liste de surcharges maintenable ; milliers d’entrées en fixtures peu adaptés à une traduction intégrale |
| Mises à jour | Bonne pour les clés communes ; ne couvre pas automatiquement les ajouts du fork | Bonne si imports amont sélectifs et sources épinglées | Noms de clés/contexte à suivre ; les surcharges masquent les corrections amont tant qu’elles subsistent |
| Automatisation | Fournie côté projet officiel selon droits ; aucune écriture permise à présumer | Export POT et import PO par PR possibles après configuration | Export/import natifs de fixtures filtrées ; validation linguistique essentiellement locale |
| Conflits | Conflits de fusion si écrasement du PO du fork ; décisions terminologiques externes | Conflits possibles avec les PO reçus de l’amont ; une seule autorité d’édition par clé à définir | Doublons ou collisions source/langue/contexte, import écrasant des données si mal filtré |
| Docker reproductible | PO versionné + MO compilé au build ; pas de dépendance Crowdin à l’exécution | Même runtime natif ; snapshot de traduction validé lié au commit | Extension/fixtures versionnées + import natif + cache invalidé ; un dump de base seul ne suffit pas |
| Multilinguisme | Hérite des langues officiellement disponibles, couverture variable | Langues du fork maîtrisées ; mapping des variantes à vérifier | Langue et contexte dans Translation ; même résolution native FR/EN/autres langues |

### A : conditions de contribution et réutilisation

Une permission de traduction sur une clé existante ne donne pas nécessairement le droit d’ajouter des sources. Les sept nouvelles clés absentes du POT doivent d’abord atteindre une branche de sources reconnue par les mainteneurs, ou être prises en charge dans le projet du fork. Ne pas créer une branche dans le projet officiel via un token supposé disponible.

Pour réutiliser les traductions officielles après mise à jour : relever les commits de LMS/Framework et la provenance des PO, préserver licences/attributions/métadonnées, comparer les clés exactes, paramètres, pluriels et contextes ; importer uniquement les apports compatibles dans la branche de localisation choisie. Ne jamais remplacer le PO du fork en bloc par celui de l’amont, au risque de perdre ses clés et choix relus. Le POT indique la licence du projet ; le dépôt est AGPL-3.0-or-later. Vérifier aussi les conditions de contribution et la provenance des traductions proposées avant import externe.

### B : une seule source d’édition pour le catalogue du fork

Le projet LittlePool devient l’autorité d’édition des traductions du catalogue LMS du fork ; l’anglais extrait reste l’autorité pour les clés. Amorcer le français avec un export officiel compatible, conserver sa provenance et son état de validation réel, puis traiter les ajouts et divergences du fork. Les mises à jour officielles entrent comme apports relus, sans écraser les corrections LittlePool approuvées. Les contributions génériques peuvent être proposées séparément à l’amont sur autorisation.

Le PO Framework reste géré par le circuit officiel Framework : ne pas modifier ses sources dans le fork LMS. Une préférence terminologique commune doit être portée à l’amont ou, exceptionnellement, surchargée nativement avec un périmètre explicite, car une clé globale peut affecter plusieurs applications.

### C : repli natif limité, sans dictionnaire frontend parallèle

Le DocType Frappe `Translation` stocke langue, source, traduction et contexte ; son contrôleur invalide les caches à l’enregistrement/suppression. Le chargeur natif fusionne ces valeurs après les catalogues. `frappe/utils/fixtures.py` sait exporter et importer des fixtures JSON, avec filtres définis par hook. Dans ce checkout, les fixtures LMS existantes **n’incluent pas Translation** : un simple export actuel ne transporte donc pas ces textes.

Proposition future : gérer les seules traductions LittlePool approuvées dans une extension Frappe versionnée, avec fixtures Translation strictement filtrées par langue et liste de clés/contexte autorisés ; les créer/relire via les outils natifs puis exporter, sans éditer le PO LMS. Garantir une entrée par langue/source/contexte, stabiliser les noms enregistrés, tester l’import sur un site jetable et définir la suppression des surcharges retirées (l’import ne garantit pas ce nettoyage). Ne jamais exporter tout le site ou toutes les traductions utilisateur.

C reste une option native, mais déroge au circuit d’édition Crowdin retenu par AGENTS.md : obtenir l’accord explicite sur cette exception et l’extension avant développement. Ne pas ajouter une extension pour le seul besoin de cette étude. Si B est ensuite adopté, retirer de façon contrôlée les surcharges devenues redondantes pour ne pas masquer le PO livré.

## 4. Maintenance et livraison proposées (non exécutées)

1. Valider option B, budget/droits et glossaire ; à défaut décider explicitement du petit lot C. Nommer un relecteur francophone.
2. Sur une copie de travail dédiée et après autorisation, générer le POT depuis le commit du fork avec `bench generate-pot-file --app lms`. Relire les différences ; conserver les clés anglaises. Réutiliser l’extracteur natif et les preuves FR-01B pour contrôler les nouvelles occurrences.
3. Exporter ce POT vers la branche Crowdin **du projet approuvé**, avec destinations GitHub exclusivement dans le fork. Éviter toute réutilisation du helper amont codé en dur. Si une synchronisation PO locale est nécessaire, utiliser la commande native `bench update-po-files --app lms --locale fr` dans le circuit convenu ; ne pas éditer les PO manuellement.
4. Appliquer le glossaire, préserver paramètres/HTML/Jinja et réviser les suggestions automatiques. Le statut « approuvé » exige une revue humaine ; contrôler les paramètres de l’export Crowdin.
5. Importer le PO approuvé par une PR ou un commit relu vers littlepool-dev, sans fusion automatique. Conserver POT et PO cohérents, sans changements applicatifs ni autres langues involontaires. Relever la provenance amont et les versions avant/après.
6. Vérifier parse et formats des PO, présence des clés et paramètres. Compiler par `bench compile-po-to-mo --app lms --locale fr`, et Framework seulement si ses sources livrées changent. Invalider ensuite le cache du seul site de test via `bench --site learning.localhost execute frappe.translate.clear_cache`.
7. Vérifier le dictionnaire chargé et les composants ciblés en FR/EN : utilisateur FR, utilisateur EN, préférence absente et visiteurs selon le changement ; rechargement, interpolation, accessibilité et absence de régression. Choisir les tests ciblés nécessaires, sans relancer par défaut toutes les suites.
8. Pour un futur build Docker : épingler code/runtime/dépendances et PO relus, compiler les MO dans les assets du Bench, puis effectuer l’import natif/caches au stade approprié. Aucun accès Crowdin ni token dans le conteneur d’exécution. Ne pas versionner les MO comme source et ne pas modifier le Docker de production dans cette mission.
9. Après mise à jour du fork : comparer POT et PO, repérer nouvelles clés, clés renommées/obsolètes et entrées fuzzy ; récupérer les apports officiels compatibles par revue. Ne pas réapprouver une traduction pour une clé modifiée sans lire le nouveau contexte. Tester les surcharges et collisions de clés globales.

Les variantes régionales (`fr`, `fr-FR`, `pt-BR`, etc.) nécessitent un mapping vérifié : `%two_letters_code%` seul peut les confondre. L’état présent utilise fr ; aucune variante n’est configurée ici. Le repli de langue, les préférences persistantes et les mécanismes réactifs FR-01A ne sont pas remplacés.

## 5. Tableau de travail : dix traductions manquantes

**Toutes les propositions ci-dessous sont à valider, non importées et non disponibles à l’exécution du seul fait de ce document.** Le statut POT reprend le relevé FR-01B, dont les fichiers n’ont pas changé. Aucun texte source n’est renommé.

| Clé anglaise exacte | Composant | Contexte réel | Proposition française | Paramètres à préserver | Validation | POT actuel |
| --- | --- | --- | --- | --- | --- | --- |
| `Student Progress` | StudentCourseProgress.vue | Dialogue sur la progression d’une personne inscrite | **Progression de l’apprenant** | Aucun ; données de personne inchangées | À valider | Absent |
| `Signups` | Statistics.vue | Comptes utilisateurs activés, hors Administrator/Guest ; aussi titre de série | **Comptes créés** | Aucun | À valider ; voir nuance métrique | Présent |
| `Enrollments` | Statistics.vue | Nombre d’inscriptions LMS, distinct des créations de compte | **Inscriptions aux cours** | Aucun | À valider | Présent |
| `Completions` | Statistics.vue | Inscriptions dont la progression atteint 100 % | **Cours terminés** | Aucun ; ce n’est pas un décompte de cours uniques | À valider | Absent |
| `Certifications` | Statistics.vue | Compte des LMS Certificate publiés | **Certificats publiés** | Aucun ; valeur interne conservée | À valider ; ce n’est pas une qualification externe | Absent |
| `Signups per day` | Statistics.vue | Créations de comptes regroupées par jour, filtre enabled | **Comptes créés par jour** | Aucun ; dates/valeurs conservées | À valider | Absent |
| `Enrollments per day` | Statistics.vue | Inscriptions aux cours regroupées par jour | **Inscriptions aux cours par jour** | Aucun | À valider | Absent |
| `Certifications per day` | Statistics.vue | Certificats publiés, série basée sur issue_date | **Certificats publiés par jour** | Aucun ; ne pas confondre date d’émission et date de publication | À valider | Absent |
| `Course Completion` | Statistics.vue | Sous-titre du graphique de répartition des états d’avancement | **Achèvement des cours** | Aucun ; catégories métier inchangées | À valider | Absent |
| `search by keyword` | UnsplashImageBrowser.vue | Indication dans le champ de recherche d’images | **Rechercher par mot-clé** | Aucun ; conserver la casse de la clé source | À valider | Présent |

La carte Signups compte les utilisateurs actuellement activés ; elle n’est pas une mesure immuable de tous les comptes créés historiquement. La série Certification est regroupée par `issue_date`, pas par date de changement du drapeau published. Ces nuances viennent des compteurs et des Dashboard Charts inspectés ; aucune métrique n’est modifiée ici. Si les libellés doivent distinguer davantage ces usages, proposer ultérieurement des clés contextuelles séparées après étude du contrat natif, plutôt que de renommer les données ou routes.

### Accessibilité : élément supplémentaire, hors des treize clés FR-01B

| Clé anglaise exacte | Composant et contexte | Proposition | Paramètres | Validation | POT actuel |
| --- | --- | --- | --- | --- | --- |
| `Search by keyword` | UnsplashImageBrowser.vue, aria-label existant du champ | **Rechercher par mot-clé** | Aucun | À valider ; même intention que le placeholder, clé distincte | Présent |

### Revue des trois traductions existantes

| Clé | Traduction actuelle (référence FR-01B) | Avis / proposition |
| --- | --- | --- |
| `Courses` | Cours | Correct et cohérent, à conserver |
| `Upload Image` | Télécharger une image | Sens ambigu/inversé en français : FileUploader sélectionne un fichier local, construit FormData puis POST vers `/api/method/upload_file` par défaut. Recommander **Importer une image** pour le bouton grand public ; **Téléverser une image** est une variante technique exacte. Ne rien modifier sans validation |
| `Uploading {0}%` | Envoi de {0}% | Sens correct et paramètre conservé ; proposer **Importation : {0} %** si le bouton devient Importer une image, avec espace française avant %. Variante : Téléversement : {0} %. À valider et relire dans le composant |

La proposition `{0}` doit rester exactement `{0}` ; le `%` reste un caractère littéral. Le texte source `Uploading {0}%` et l’appel `.format(progress)` ne changent pas. Le comportement d’envoi est établi par lecture de FileUploader/fileUploadHandler, sans téléversement réel. UnsplashImageBrowser n’a toujours pas de parcours utilisateur identifié dans FR-01B ; ne pas prétendre avoir validé son service externe.

## 6. Décisions attendues et prochaine action précise

1. Approuver B comme cible, ou choisir A/C ; confirmer propriétaire du projet, accès et budget avant toute configuration.
2. Valider les dix propositions, l’aria-label et les changements de qualité proposés pour les deux textes d’importation.
3. Valider les choix ambigus du glossaire : session/cohorte, apprenant/membre, certificat/certification, parcours/programme et libellés des compteurs.
4. Après accord seulement : préparer la génération contrôlée du POT du fork, puis la configuration d’un export/import vers le projet approuvé, sans helper pointant vers frappe/lms et sans modifier develop. Si C est choisi, cadrer d’abord les fixtures filtrées et leur nettoyage ; ne pas générer les deux architectures en parallèle.

La prochaine opération immédiate est la revue de ces documents et du glossaire par le propriétaire. Aucun import ni mise en œuvre ne découle automatiquement de leur rédaction. FR-02 n’est pas lancé.

## 7. Contrôles réalisés dans FR-01C

Lecture ciblée des consignes, rapports/plan, crowdin.yml, trois workflows de traduction, helper de génération, en-têtes POT/PO, fonctions natives d’extraction/compilation/fusion/fixtures, composants de téléversement et définitions des métriques. Contrôle Git local/distant et revue documentaire, absence de secrets dans les livrables, `git diff --check`.

Aucune suite applicative, extraction, compilation, connexion à un service Crowdin, consultation de credentials, changement de langue, installation, modification de code/PO/POT/workflow ou déploiement. Les états d’exécution sont repris de FR-01B ; ils ne sont pas de nouveaux tests. Un seul commit documentaire local regroupe stratégie, glossaire et handoff ; aucun push autorisé dans cette mission.
