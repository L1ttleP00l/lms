# Feuille de route LittlePool Learning

Date : 28 octobre 2026. Point de départ : audit du checkout LMS `6b791f33…`, Frappe v17 de développement, branche locale `littlepool-dev`. Cette feuille de route propose les étapes suivantes ; elle ne constitue pas une autorisation de déploiement. Aucun développement fonctionnel n’a été réalisé pendant l’audit.

## Objectif et méthode

Transformer l’installation existante en une plateforme LittlePool cohérente, francophone et testée, en réutilisant les cours, programmes, cohortes et évaluations déjà présents. Commencer par un parcours pilote complet avant d’ajouter des mécanismes pédagogiques sur mesure.

Conserver `develop` intact pendant les travaux. Travailler sur `littlepool-dev` et des branches de sujets dédiées, avec revue des changements et synchronisation contrôlée de l’amont. Épingler LMS, Frappe et Payments ainsi que les versions runtime. Privilégier les paramètres natifs, puis une application d’extension pour le métier LittlePool ; limiter les modifications du fork et éviter de modifier le Framework pour une règle métier locale.

## Phases et critères de sortie

| Phase | Priorité / dépendance | Travaux proposés | Critères d’acceptation |
| --- | --- | --- | --- |
| 0. Base reproductible | P0, avant les autres étapes | Documenter démarrage Docker et accès Bench, verrouiller les versions, vérifier les assets, formaliser sauvegarde/restauration sur copie jetable, conserver les journaux CI | Une nouvelle tâche démarre le site et passe les contrôles HTTP/DB et tests ciblés ; restauration des données démontrée séparément |
| 1. Français effectif | P0, après 0 | Identifier la commande de compilation adaptée à Frappe v17, produire les MO de LMS/Framework, vérifier leur distribution et les caches ; configurer langue système et comptes pilotes | `Courses → Cours` et `Next → Suivant` dans le dictionnaire effectif ; invité, apprenant et formateur affichent les traductions après connexion et rechargement |
| 2. Français complet du pilote | P1, après 1 | Glossaire, traduction Crowdin, extraction des chaînes hors `__()`/`_()`, locale Day.js, formats et pluriels, emails et certificats | Aucun anglais non justifié sur inscription → cours → leçon → quiz → résultat → certificat ; dates françaises, substitutions conservées, revue linguistique et captures mobile/desktop |
| 3. Identité et périmètre LittlePool | P1, parallélisable avec 2 après cadrage | Nom, logo, favicon, métadonnées, accueil et navigation ; configurer les fonctions visibles selon les rôles et le besoin ; modèles email/certificat | Marque cohérente sur le parcours pilote, emails et PDF ; permissions respectées ; absence de régression sur navigation et accessibilité |
| 4. Pilote pédagogique | P1, après 2–3 | Construire un cours et un programme représentatifs, définir objectifs, prérequis, évaluations, feedback et critères de réussite ; tester une cohorte si retenue | Un apprenant termine le parcours ; un formateur corrige et suit la progression ; certificat conforme ; comportement des échecs et du déblocage documenté |
| 5. Suivi et accompagnement | P2, après retour pilote | Définir indicateurs, suivi de cohortes, exports, relances et remédiation ; brancher visio/communication seulement si nécessaires | Indicateurs réconciliés avec les résultats sources ; droits vérifiés ; relances testées dans un canal de test ; connecteurs validés indépendamment |
| 6. Enrichissements ciblés | P2/P3, après mesures d’usage | Étudier compétences, diagnostic initial, révision espacée, parcours adaptatifs, badges enrichis ; tester interopérabilité SCORM et décider si xAPI/LTI sont utiles | Chaque ajout répond à un besoin mesuré, réutilise l’existant lorsque possible et possède un test utile ; aucune promesse de standard sans validation |
| 7. Préparation à la mise en service | Après validation du pilote ; décision distincte | Recette complète sur préproduction, rôles et sécurité, sauvegardes, observabilité, charge adaptée, accessibilité et procédure de retour arrière | Rapport de recette accepté, versions figées et récupération démontrée ; décision explicite avant toute action de production |

Les phases expriment un ordre de dépendance, pas des dates promises. Le chiffrage dépend du public, du volume de contenus, des intégrations et du niveau de personnalisation retenus.

## Backlog initial concret

| ID | Sujet | Preuve de départ | Vérification attendue |
| --- | --- | --- | --- |
| LP-001 | Démarrage/restauration reproductible | Les trois services étaient arrêtés après restauration ; script existant fonctionnel | Nouvelle tâche, relance documentée, ping, page, API et base |
| LP-002 | MO français et configuration de langue | Répertoire locale compilée absent ; dictionnaire FR de 43 entrées ; langue système vide | Comparer PO et dictionnaire effectif, vérifier les comptes FR et le retour anglais voulu |
| LP-003 | Compléter Crowdin sur le parcours pilote | 568/2 673 entrées LMS renseignées | Inventaire des clés réellement utilisées, revue métier, contrôle des paramètres `{0}` et HTML |
| LP-004 | Chaînes non traduisibles et dates | Student Progress, Statistics, Unsplash, Dear ; Day.js sans `fr` | Tests ciblés et recette navigateur de ces surfaces |
| LP-005 | Identité LittlePool | Replis Frappe Learning et modèles existants | Contrôler d’abord les réglages natifs ; vérifier accueil, navigation, emails et certificats |
| LP-006 | Parcours de référence | Aucun cours dans la base contrôlée | Créer sur site pilote un cours, quiz, devoir et programme représentatifs ; vérifier progression et remédiation |
| LP-007 | Rôles et recette pédagogique | Permissions centralisées et tests existants | Invité, apprenant, formateur, évaluateur, gestionnaire ; accès directs API et documents inclus |
| LP-009 | Fiabilité de la suite Vue sous charge | Un timeout sur 2 678 tests ; les 3 tests du fichier passent isolément | Diagnostiquer coût d’import et concurrence ; ne pas masquer un échec en augmentant aveuglément les délais |
| LP-008 | Intégrations et exploitation | Payments installé ; visio et communication présentes dans le code | Tester uniquement les connecteurs retenus avec comptes et données de test |

## Choix produit à cadrer avant personnalisation

- Public : adultes, établissements, associations ou mineurs ; disciplines et niveau d’autonomie.
- Modalités : autoformation, cohortes accompagnées, direct, évaluations et remédiation.
- Diffusion : catalogue public ou privé, inscription libre ou invitation, gratuité ou paiement.
- Langues : français uniquement ou multilingue ; variantes et glossaire (`batch` → cohorte/session à décider).
- Attestation : simple certificat de complétion ou validation de compétences avec évaluateur.
- Contraintes : accessibilité, conservation/export des résultats, hébergement des médias et connecteurs réellement nécessaires.

Ces décisions peuvent être préparées en parallèle de la stabilisation technique ; elles ne bloquent pas la correction du circuit de traduction.

## Stratégie de validation

Conserver la suite Vue et les tests Python existants. Ajouter des tests ciblés lors des changements de comportement : chargement français, interpolations, permissions et progression. Faire une recette Playwright puis humaine du parcours pilote sur desktop et mobile, en incluant échecs, tentatives épuisées, dates/fuseaux, emails et certificats. Pour SCORM, utiliser des paquets réels de chaque standard retenu et vérifier accès, reprise et complétion.

À chaque livraison : examiner le diff, vérifier la migration éventuelle sur copie, conserver les résultats réellement exécutés et distinguer les contrôles automatisés de la recette manuelle. Les workflows existants de release et de publication d’assets doivent être revus avant tout push sur une branche qui les déclenche. Aucune étape de cette feuille de route ne doit déployer automatiquement en production pendant la phase de développement demandée.
