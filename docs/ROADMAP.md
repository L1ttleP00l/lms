# Feuille de route LittlePool Learning

Date : 28 octobre 2026. Point de départ : audit du checkout LMS `6b791f33…`, Frappe v17 de développement, branche locale `littlepool-dev`. Cette feuille de route propose les étapes suivantes ; elle ne constitue pas une autorisation de déploiement. Aucun développement fonctionnel n’a été réalisé pendant l’audit.

## Objectif et méthode

Politique linguistique officielle, actualisée le 28 octobre 2026 : **Fournir une traduction française intégrale tout en conservant l'anglais comme langue source et de secours, avec une langue système configurable et des préférences utilisateurs persistantes.**

La langue dépend de chaque instance : français pour une instance française, anglais pour une instance internationale, autres langues extensibles. Le site de développement reste configuré en français. Les clés sources anglaises et les mécanismes natifs Frappe/gettext/Crowdin sont conservés ; les contenus pédagogiques des utilisateurs restent distincts de l’interface.

Transformer l’installation existante en une plateforme LittlePool multilingue et testée, avec une prise en charge française complète, en réutilisant les cours, programmes, cohortes et évaluations déjà présents. Commencer par un parcours pilote complet avant d’ajouter des mécanismes pédagogiques sur mesure.

Conserver `develop` intact pendant les travaux. Travailler sur `littlepool-dev` et des branches de sujets dédiées, avec revue des changements et synchronisation contrôlée de l’amont. Épingler LMS, Frappe et Payments ainsi que les versions runtime. Privilégier les paramètres natifs, puis une application d’extension pour le métier LittlePool ; limiter les modifications du fork et éviter de modifier le Framework pour une règle métier locale.

## Phases de localisation et critères de sortie

FR-01A est terminé : activation, repli et réactivité validés ; voir `docs/FR-01-RESULTATS.md`. Les résultats existants (6 102 clés françaises, six profils Chromium, 2 680 tests Vue réussis) sont conservés comme référence, sans les réexécuter pour cette mise à jour documentaire.

| Phase | Périmètre | Validation française et anglaise |
| --- | --- | --- |
| FR-01A — terminé | Activer les catalogues existants et corriger les défauts reproduits | Français du site local, comptes FR/EN, compte sans préférence, visiteur, rechargement et persistance déjà vérifiés |
| FR-01B — prochaine phase, non commencée | Rendre traduisibles les chaînes anglaises directes dans Vue, en conservant les sources anglaises et la présentation | Tests ciblés : traductions FR, sources EN et repli anglais pour clé absente ; extraction et interpolations contrôlées |
| FR-02 | Compléter le parcours apprenant : navigation, catalogue, cours/chapitres/leçons, quiz/évaluations/résultats, inscription/profil, erreurs, aides et accessibilité | Parcours représentatif en FR et EN ; formats de dates/nombres et états vides ; desktop/mobile |
| FR-03 | Compléter les interfaces formateur et administration : tableaux de bord, paramètres, utilisateurs et corrections | Rôles et fonctions inchangés en FR/EN ; aucune traduction des identifiants ou valeurs stockées |
| FR-04 | Notifications, courriels, certificats et attestations | Sujet/corps/langue destinataire et PDF en FR/EN ; variables, liens et accents conservés ; destinataires de test uniquement |
| FR-05 | Interfaces secondaires et couverture linguistique globale | Relevé global des manques FR, non-régression EN, pluriels, dates/nombres, libellés accessibles et composants partagés ; contenus utilisateurs traités séparément |
| I18N-01 | Étudier les sélecteurs et paramètres natifs existants, puis améliorer seulement après validation | Préférence explicite prioritaire et persistante, langue système configurable, changement et rechargement FR/EN sur ordinateur/mobile ; pas de mécanisme parallèle si Frappe suffit |

Aucune de ces phases suivantes n’est autorisée à démarrer dans la mission documentaire actuelle. Le chiffrage dépend du périmètre accepté et des accès Crowdin ; aucune durée ou quantité de quota n’est supposée.

## Chantiers produit distincts

La base reproductible, l’identité LittlePool, le pilote pédagogique, le suivi des cohortes et les enrichissements restent des chantiers distincts à cadrer. Le pilote doit être utilisable en français et en anglais. Les intégrations et la mise en service nécessitent leur recette et une décision explicite ; aucune étape ne déploie automatiquement en production.

## Backlog initial concret

Les preuves ci-dessous sont les constats historiques de l’audit ; elles ne décrivent pas toutes l’état actuel. LP-002 est couvert par FR-01A ; voir son rapport pour l’état effectif.

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
- Langues : architecture multilingue retenue, français intégral visé, anglais source et secours ; préciser les autres langues, variantes et le glossaire (`batch` → cohorte/session à décider).
- Attestation : simple certificat de complétion ou validation de compétences avec évaluateur.
- Contraintes : accessibilité, conservation/export des résultats, hébergement des médias et connecteurs réellement nécessaires.

Ces décisions peuvent être préparées en parallèle de la stabilisation technique ; elles ne bloquent pas la correction du circuit de traduction.

## Stratégie de validation

Conserver la suite Vue et les tests Python existants. Ajouter des tests ciblés lors des changements de comportement : interfaces FR et EN, repli anglais, préférence utilisateur prioritaire, langue système configurable, interpolations, permissions et progression. Réutiliser les résultats déjà validés et ne pas relancer toutes les suites sans nécessité technique. Faire une recette Playwright puis humaine du parcours pilote sur desktop et mobile, en incluant échecs, tentatives épuisées, dates/fuseaux, emails et certificats. Pour SCORM, utiliser des paquets réels de chaque standard retenu et vérifier accès, reprise et complétion.

À chaque livraison : examiner le diff, vérifier la migration éventuelle sur copie, conserver les résultats réellement exécutés et distinguer les contrôles automatisés de la recette manuelle. Les workflows existants de release et de publication d’assets doivent être revus avant tout push sur une branche qui les déclenche. Aucune étape de cette feuille de route ne doit déployer automatiquement en production pendant la phase de développement demandée.
