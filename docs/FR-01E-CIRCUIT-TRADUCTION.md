# FR-01E — Circuit de traduction française

Étude du **29 octobre 2026 (Europe/Paris)**. Dépôt L1ttleP00l/lms, branche littlepool-dev ; base locale et distante vérifiée : `2279552914d1fb51dd425effcf192e4a2b519e11`. Documents FR-01C, glossaire, plan et workflows réutilisés ; aucune implémentation ni traduction effectuée.

## Recommandation

Retenir une architecture **hybride et portable : POT/PO versionnés dans Git, compilation et chargement natifs Frappe, Crowdin comme atelier collaboratif facultatif**. Préférer Crowdin pour une équipe de traducteurs non développeurs si son financement et ses conditions sont approuvés. En attendant, un pilote avec éditeur PO local et revue humaine évite de dépendre d’une admission gratuite incertaine. Ce pilote demande un accord explicite sur l’exception à la convention Crowdin d’AGENTS.md ; aucune autorisation d’édition PO n’est déduite de cette étude.

Une seule autorité d’édition par phase : atelier local **ou** projet Crowdin du fork ; Git reste la référence de livraison. Pas de dictionnaire frontend parallèle, pas de remplacement par des fixtures Translation pour gérer des milliers de messages. L’anglais demeure source/repli ; défaut système configurable et préférence utilisateur prioritaire restent inchangés.

## État réel des traductions

Lecture seule des catalogues versionnés, sans régénération ni test : POT **2 980 clés** ; PO français LMS **2 673 entrées**, dont **568 traductions non vides correspondant au POT actuel**, aucune de ces 568 marquée fuzzy ; **2 412 clés du POT sans traduction française renseignée dans ce PO**. Cela inclut clés nouvelles absentes et entrées existantes vides. Ce ne sont pas 2 980 traductions à créer.

Ces chiffres ne mesurent ni l’approbation linguistique ni la couverture runtime : Framework peut déjà fournir certaines clés communes, et les surcharges natives peuvent modifier le résultat. Les mesures FR-01A/FR-01B existantes restent les preuves de rendu ; aucune vérification applicative nouvelle ici. Les états « absent du POT » dans FR-01C sont historiques : les clés FR-01B et TypeScript ciblées sont désormais dans le POT publié.

## Crowdin : gratuité, coûts et limites vérifiés

Toutes les pages officielles citées ont été consultées le **29 octobre 2026** ; aucun compte connecté, formulaire soumis ou service de vente contacté.

### Programme open source : candidature possible, admission non établie

Le [formulaire officiel open source](https://crowdin.com/product/for-open-source) exige : projet Crowdin déjà créé, licence reconnue OSI, code public, absence de produits commerciaux associés, responsable du projet candidat, au moins trois mois de travail, communauté active, actualités du site tenues à jour et builds publiés régulièrement. Il prévoit participation au programme bêta et contribution des traductions à la mémoire globale Crowdin.

Le fork est public et fournit une licence AGPLv3 dans license.txt. **Cela ne prouve pas son éligibilité complète.** Ancienneté propre au fork, communauté, actualités/releases et activité commerciale associée ne sont pas établies. Ne pas utiliser automatiquement l’âge de Frappe LMS pour justifier celui de LittlePool. Les prestations ou produits associés doivent être déclarés au fournisseur avant de conclure. Les conditions de partage Global TM et leurs implications sur les droits des contributions doivent être acceptées explicitement. Aucune demande ne sera envoyée sans autorisation préalable de créer le projet requis.

### Budget

| Option | Coût vérifié / niveau de certitude |
| --- | --- |
| Licence open source accordée | 0 d’abonnement ; attribution conditionnelle, non acquise |
| Offre Crowdin payante | **Montants actuels non confirmés** ; devis ou confirmation officielle requis avant budget |
| Essai | 14 jours Team annoncés ; pas une gratuité durable |
| Édition locale PO + outils Frappe existants | 0 d’abonnement SaaS obligatoire ; travail humain et maintenance à financer |

La [page tarifaire officielle](https://crowdin.com/pricing) annonce, pour les licences accordées, projets/chaînes/membres illimités. Les prix sont hors taxes. Les mots hébergés dépendent des mots sources multipliés par les langues cibles, à l’échelle du compte ; **2 980 clés ≠ 2 980 mots**. Le texte accessible ne restitue pas les montants des cartes tarifaires dynamiques ; les recherches officielles complémentaires ne les ont pas confirmés. Aucun montant provenant d’un comparateur n’est retenu. Quotas API/stockage, managers, intégrations, options et éventuels services MT/IA doivent être confirmés pour l’offre proposée ; « illimité » ne signifie pas tous services gratuits. Aucun coût humain, conversion monétaire ou tarif professionnel de traduction n’est chiffré faute de périmètre/devis.

## Projet Crowdin du fork : procédure proposée, non exécutée

1. Après accord, le responsable choisit un compte propriétaire durable, crée un projet **file-based**, anglais source et français cible, et décide de sa visibilité. Le type file-based préserve la structure des fichiers ; un projet public est indexable. Un identifiant technique provisoire n’impose aucun renommage de LMS. [Création de projet](https://support.crowdin.com/creating-project/).
2. Nommer propriétaire, gestionnaire technique, traducteurs et relecteur français. Les traducteurs proposent ; le proofreader approuve. Propriétaire/gestionnaire gèrent fichiers, langues et paramètres. Les rôles supplémentaires et leur disponibilité dépendent du plan. Le compte propriétaire doit être choisi avec soin : la documentation Crowdin indique que la propriété du projet ne se transfère pas directement. Ne partager aucun compte ou jeton. [Rôles](https://support.crowdin.com/roles/).
3. Importer comme source le POT publié, à chemin stable lms/locale/main.pot, anglais, dans une branche propre au fork (exemple littlepool-dev). Configurer la sortie française lms/locale/fr.po ; vérifier le mapping de `fr` sans créer une variante fr-FR involontaire. Conserver les références, clés, contextes, indicateurs et paramètres. Le mapping actuel à deux lettres devra être revu avant toute variante régionale.
4. Importer le PO français existant par **Translations → Upload existing translations**, l’associer explicitement au POT et à la langue française, vérifier le rapport des clés appariées/ignorées et les paramètres avancés. Les formats à clés, dont PO, sont appariés par clé. Ne pas promouvoir tout le stock en « approuvé » sans revue ; tracer provenance et statut. [Import officiel](https://support.crowdin.com/uploading-translations/).
5. Importer le glossaire seulement après arbitrage ; activer les contrôles de paramètres et organiser les lots avec références/captures d’écran synthétiques. Toute prétraduction reste une suggestion, soumise au relecteur.
6. Configurer **Export only approved translations** et contrôler un export français avant toute livraison. La documentation prévoit un traitement propre au format : pour gettext PO, Skip untranslated strings conserve les clés avec valeurs vides. Éviter Skip untranslated files, qui exige une couverture complète et empêcherait les livraisons progressives. [Réglages d’export](https://support.crowdin.com/project-settings/export/).
7. Pour une automatisation ultérieure, la CLI documente `--export-only-approved` et `--skip-untranslated-strings`, avec restriction à fr/branche voulue. Les combiner évite de remplir des traductions non approuvées avec l’anglais selon le comportement CLI documenté. **Tester le PO réellement produit**, car un réglage projet et une option CLI ne prouvent pas à eux seuls le résultat du parser gettext. [CLI officielle](https://crowdin.github.io/crowdin-cli/commands/crowdin-download-translations).

Attention à l’amorçage : exporter seulement les approbations avant revue des 568 traductions héritées peut vider des traductions actuellement livrées. Ne pas remplacer le PO complet par ce premier export. Soit revoir/valider la base conservée avant remplacement complet, soit intégrer un delta approuvé par comparaison contrôlée en conservant la base héritée, avec statut de revue explicite. Dans ce second cas, ne pas prétendre que tout le PO livré a déjà été approuvé. Le premier aller-retour doit démontrer l’absence de régression du stock français existant.

### Automatisation limitée au fork

Les workflows actuels ne doivent pas être activés tels quels : export sur develop et branches hotfix, import par PR vers ces mêmes bases, noms de branches Crowdin `[frappe.lms] ...`, absence de filtre explicite « approuvé seulement » dans l’import. FR-01D protège seulement le workflow/helper de génération-publication amont ; les deux workflows Crowdin restent distincts et ne disposent pas de cette garde officielle. Ne pas présumer que leurs secrets existent ou que leur planification sur la branche par défaut du fork serait inoffensive.

Après autorisation, prévoir un circuit propre : identité projet Crowdin du fork, garde du dépôt `L1ttleP00l/lms`, ref littlepool-dev, export source et import séparés, branche de traduction dans le fork, relecture obligatoire, aucune fusion automatique et aucune écriture sur develop ou frappe/lms. Préférer d’abord des échanges manuels contrôlés ; automatiser après un aller-retour concluant. Toute future permission GitHub d’écriture/PR et tout stockage de credential relèvent d’un accord séparé ; limiter les droits au projet/dépôt requis, ne jamais utiliser des secrets d’amont. Aucun identifiant secret nécessaire à cette étude.

### Réutilisation légale et mises à jour

Utiliser les PO fournis avec le dépôt et leurs commits de provenance, en conservant notices, licences et attributions. La licence du dépôt est l’AGPLv3 ; respecter les mentions propres aux fichiers et contributions au lieu de supposer que toutes les traductions externes ont une licence identique. Un accès public Crowdin ne vaut pas autorisation générale de réutilisation/relicenciement. Avant d’ajouter une mémoire ou traduction externe, vérifier ses conditions, notamment pour le partage à une TM globale. La réutilisation des fichiers hérités dans le fork n’autorise pas à effacer leurs notices ni à imposer une autre licence aux contributeurs.

Lors d’une mise à jour : importer les sources comme mise à jour du même fichier/branche, conserver les identités de clés et sauvegarder PO, glossaire et mémoire exportable. Ne pas supprimer/recréer le projet ou ses fichiers. Récupérer les traductions amont par comparaison à trois versions (base amont connue, nouvel amont, PO du fork), conserver les corrections locales et soumettre les conflits à revue. Une ancienne approbation ne valide pas une clé ou un contexte modifié. Framework garde son propre catalogue et circuit officiel ; ne pas écraser son PO depuis LMS.

## Alternative native Frappe/Gettext et outillage complémentaire

| Besoin | Natif disponible dans cette version | Organisation/outils supplémentaires |
| --- | --- | --- |
| Extraction | bench generate-pot-file --app lms ; mapping TS LMS désormais publié | Revue du diff et des omissions dynamiques/chaînes non enveloppées ; aucune génération nécessaire pour commencer cette étude |
| Actualisation PO | bench update-po-files --app lms --locale fr ; code installé : Catalog.update(..., no_fuzzy_matching=True) | Autorisation préalable, sauvegarde, revue des clés obsolètes et conflits ; pas d’appariement approximatif automatique via cette commande |
| Édition | Frappe lit les PO ; ce n’est pas un atelier collaboratif de traduction PO | Poedit pour éditer visuellement un PO, ou éditeur gettext équivalent ; aucune réextraction avec un outil différent du pipeline Frappe |
| Revue | Git donne historique/diff ; fuzzy est un indicateur gettext | Traducteur et relecteur distincts, suivi par lot et clé, approbation humaine ; Git n’offre pas à lui seul un workflow linguistique |
| Qualité | Babel Catalog.check et compilation native déjà utilisés | Contrôle de complétude des paramètres, HTML/Jinja, liens, style, captures ; GNU msgfmt --check/--check-format possible si installé ultérieurement, pas supposé présent |
| Livraison | bench compile-po-to-mo --app lms --locale fr ; cache natif du site de test | Validation en environnement de développement, commits PO relus, MO générés hors sources ; aucun accès SaaS au runtime |
| Collaboration | Pas de portail d’équipe PO équivalent à Crowdin identifié | Répartition de lots sans chevauchement, mémoire locale, centralisation/merge par un mainteneur ; Weblate serait un service additionnel, non natif et hors étude d’installation |

[Poedit](https://poedit.com/) propose une édition gettext et un téléchargement gratuit ; fonctions Pro/MT non nécessaires au pilote recommandé. Ne pas supposer que toute option avancée est gratuite. Le mainteneur peut recevoir les fichiers d’un traducteur sans lui imposer Git, puis effectuer la revue et le commit. L’approbation sera matérialisée dans la revue Git et le suivi de lot ; une chaîne fuzzy n’est pas une approbation. Les surcharges Translation natives restent un outil d’exception pour quelques clés/site, pas l’autorité parallèle d’un catalogue complet.

## Comparaison

| Critère | Crowdin propre au fork | PO locaux + Frappe/Gettext | Hybride recommandé |
| --- | --- | --- | --- |
| Coût financier | 0 si licence accordée ; payant sinon, montant non confirmé | Pas d’abonnement obligatoire ; temps humain | Même base native, SaaS conditionnel |
| Complexité initiale | Compte, projet, droits, import/export à valider | Faible pour un pilote, discipline Git nécessaire | Pilote manuel puis intégration progressive |
| Traducteurs non développeurs | Éditeur web, tâches et contexte | Éditeur PO accessible, fichiers à transmettre | Choix de l’atelier, mainteneur gère Git |
| Collaboration/validation | Rôles et approbation intégrés | Organisation à construire, conflits de fichiers | Une seule autorité d’édition par phase |
| Conservation | TM et fichiers existants, export régulier indispensable | PO et historique Git, mémoire locale facultative | PO portables + sauvegarde des ressources SaaS |
| Automatisation | CLI/API/intégration, permissions à maîtriser | Bench natif et contrôles Git à organiser | Même validation de livraison quel que soit l’atelier |
| Sécurité | Données/identités SaaS et accès éventuels GitHub | Moins d’accès externes, sécurité des fichiers à gérer | Aucun credential ni dépendance SaaS au runtime |
| Maintenance | Administration du projet et du plan | Charge de coordination/merge plus élevée | Coût initial mesuré, pas de double édition concurrente |
| Compatibilité mises à jour | Bonne si identités stables et imports relus | Bonne si merge contrôlé, pas d’écrasement du PO | Pipeline Frappe et mapping TS conservés |
| Dépendance fournisseur | Métadonnées/approbations/TM à exporter avant sortie | Faible avec formats ouverts | Sortie SaaS possible grâce aux PO versionnés |

L’avantage concret de l’hybride est de garder la collaboration remplaçable sans changer l’application. Ce n’est pas deux dictionnaires ni deux rédactions concurrentes du français.

## Plan progressif soumis à validation

1. **Gouvernance avant toute traduction.** Approuver le circuit et son éventuelle exception locale à AGENTS.md ; nommer propriétaire technique et relecteur, valider les conditions économiques et le partage Global TM si Crowdin retenu. Fixer l’anglais source/secours, fr cible initiale et le périmètre LMS ; aucun changement de préférence utilisateur.
2. **Glossaire commun.** Arbitrer les choix de docs/GLOSSAIRE_FR.md : Session/Cohorte, Apprenant/Formateur, Certificat/Attestation, Parcours, Membre, statistiques et Importer/Téléverser. Puis marquer les choix comme validés avec leur contexte, sans traduire rôles/API/statuts stockés.
3. **Réutilisation et base.** Sauvegarder fr.po et sa provenance, conserver les 568 traductions utiles, comparer aux 2 980 sources ; traiter faux amis et incohérences, notamment Upload Image. Distinguer absence dans le PO, absence runtime et traduction jugée incorrecte. Les contenus de cours/leçons/devoirs saisis ne font pas partie de ces catalogues.
4. **Premier pilote proposé.** Livrer les dix clés FR-01B manquantes et l’aria-label distinct Search by keyword, puis revoir les huit messages TS d’inscription et les trois traductions FR-01B existantes. Leur formulation reste à approuver ; ne pas annoncer leur disponibilité avant import/compilation et vérification du dictionnaire. Priorité aux parcours réellement utilisés : navigation/catalogue, cours/leçon et progression, quiz, inscription ; réglages de connecteurs rarement utilisés ensuite. L’usage réel doit être confirmé par le propriétaire, sans collecter de données personnelles pour cette étude.
5. **Contrôles par lot.** Vérifier clé/contexte exacts, toutes occurrences des paramètres avec multiplicité, {}, %, HTML/Jinja et URLs, variantes singulier/pluriel, accents/espaces, longueur et accessibilité. Contrôles Babel + comparaison humaine ; pas d’approbation automatique d’une traduction machine. Les contextes d’éditeur servent de documentation ; ne pas les confondre avec msgctxt. Le plugin Vue actuel ne lit pas de troisième argument de contexte : ne pas introduire de nouvelles distinctions runtime sans mission technique dédiée.
6. **Validation du rendu.** Compiler nativement les seuls catalogues concernés, invalider le cache du seul site de développement, examiner dictionnaire/bootstrap/API et tester FR/EN, compte sans préférence/visiteur, persistance/rechargement et chargement asynchrone sur les écrans du lot. Aucun français codé en dur, aucun changement de langue globale pour forcer tous les comptes. Dates/nombres, mails et certificats nécessiteront leurs propres cas ; leurs contenus éditoriaux ne sont pas traduits automatiquement par PO.
7. **Mises à jour durables.** Épingler les commits code/Framework/POT/PO, comparer les trois versions lors de l’arrivée de l’amont, préserver les traductions locales relues, remettre les suggestions ambiguës en revue et archiver les clés obsolètes dans la mémoire plutôt que les recopier. Choisir ensuite seulement l’automatisation propre au fork ; aucun job ne doit publier vers frappe/lms ou develop. Le nom du projet reste provisoire.

## Décisions attendues

- Choisir pilote PO local avec exception de convention, ou création d’un projet Crowdin après clarification d’éligibilité ; valider ensuite le basculement éventuel, pas une double édition.
- Si Crowdin : confirmer ancienneté/communauté/releases, situation commerciale, visibilité, propriétaire durable, droits de réutilisation et acceptation du partage Global TM ; faire confirmer l’offre et les quotas par Crowdin avant tout coût engagé.
- Approuver le glossaire, le premier lot et son relecteur ; définir le critère de livraison des traductions héritées non encore revues.
- Autoriser séparément création/configuration externe, modification PO, éventuels workflows/credentials et publication. Rien de cela n’est autorisé ou exécuté par ce document.

## Vérifications et limites de l’étude

Lecture des documents demandés et workflows ; Git local/distant alignés à 22795529, develop distant inchangé à 6b791f33. Lecture des catalogues pour calculer l’intersection des traductions, contrôle des empreintes des 79 PO et du POT publié, relecture/diff/secrets des deux documents. Sources Crowdin officielles consultées et datées ci-dessus ; prix payants et admission gratuite non confirmés. La page GNU Gettext sollicitée pour documentation complémentaire n’a pas répondu ; aucune conclusion économique n’en est tirée.

Aucun test applicatif, extraction, compilation, installation, conteneur supplémentaire, création de compte/projet, invitation, contact externe, abonnement, lecture de secret, modification catalogue/workflow/Framework, push, PR ou déploiement. Un seul commit documentaire local doit contenir ce document et CODEX_HANDOFF.md. Arrêt après FR-01E ; attendre l’accord avant implémentation et ne pas commencer FR-02.
