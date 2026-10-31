# FR-03B.6 — Pilote d’extraction des textes de schéma

31 octobre 2026 (Europe/Paris). Branche littlepool-dev.

## Publication préalable et base

FR-03B.5 publié par push normal sur accord explicite : **067708f4fbce7190ec1601567f4c4abb575fb2d0** puis **866b742cdbfb0f030e20dc52333f5962f6383890**. Distant be7f1e4b, quatorze fichiers, 893 FR/3 010 POT, six ajouts/trois retraits, 47 nouvelles valeurs/trois corrections et Offline/Hors ligne contrôlés. Preuves 57 Vue, quatre Chromium principaux et quatre contrôles des formateurs relues ; 24 écritures fictives entièrement interceptées. Sources comparées aux substitutions autorisées, 78 PO/Framework intacts, secrets contrôlés. Aucun test/build relancé pour publier. SHA distant et rapport GitHub identique vérifiés, checkout propre/aligné, develop inchangé 6b791f33b34efa15566a0cb707f5be59d136df50.

**866b742c est la base réelle du pilote. Aucun push FR-03B.6.** Reprise AGENTS/handoff, audit FR-03A, résultat FR-03B5, glossaire et plan ; environnement existant réutilisé, sans installation ni suite globale. Périmètre **exactement trois clés**, pas une francisation générale des paramètres.

## État initial et diagnostic reproductible

| Clé exacte | Source initiale | POT | PO LMS | PO Framework | Dictionnaire fusionné FR |
| --- | --- | --- | --- | --- | --- |
| System Configuration | settings.ts, label du groupe | absente | absente | absente | absente, repli anglais |
| Access & Availability | Preferences.vue, accessSections.label | absente | absente | absente | absente, repli anglais |
| Seconds a learner must stay on a lesson before it is marked complete. | settings.ts, description lesson_dwell_time | absente | absente | absente | absente, repli anglais |

Contrôles limités aux trois clés, aucun document de configuration sensible lu. get_all_translations('fr') confirme l’absence de traduction fusionnée, donc aucune valeur Framework/base à réutiliser ni surcharge identifiée pour ces clés.

**Cause précise :** settingsTree et accessSections sont des données statiques anglaises. Settings.vue appelle __(group.label), SettingsFields appelle __(section.label)/__(field.description), après le chargement du dictionnaire. Ces appels dynamiques ne révèlent pas leurs valeurs à l’extraction. La traduction au rendu est correcte ; l’omission vient de la découverte des chaînes, pas du chargement Vue. Preferences contient aussi des appels littéraux __ déjà extraits : ils ne doivent pas être perdus.

Dans la version Framework installée, `frappe/gettext/translate.py` définit **PYTHON_KEYWORDS = DEFAULT_KEYWORDS | {"_lt": None, "N_": None}** et transmet ce dictionnaire à extract_from_dir. Malgré le nom PYTHON_KEYWORDS, ces mots-clés sont aussi transmis aux méthodes Babel sélectionnées. L’extracteur JavaScript spécifique Frappe ignore ce paramètre pour la reconnaissance et recherche seulement __ par défaut ; N_ n’y est donc pas automatiquement pris en charge. L’extracteur JavaScript **natif de Babel**, sélectionnable dans le mapping applicatif, utilise les mots-clés reçus et reconnaît N_. Ce n’est pas une API JavaScript Frappe de traduction différée.

Comparatif exécuté avec les outils installés, sans Framework modifié :

| Déclaration | Extracteur JS Frappe courant | Extracteur JS Babel avec mots-clés natifs Frappe |
| --- | --- | --- |
| Chaîne brute de schéma | non extraite | non extraite |
| N_('Pilot schema text') | non extraite | extraite |
| __('Pilot schema text') | extraite | non extraite |

Le dernier cas interdit de remplacer globalement l’extracteur TypeScript par Babel : cela perdrait des appels __. La règle doit viser uniquement le nouveau module de textes sources sans ces appels.

## Solution locale retenue

- Nouveau **settingsText.ts**, module feuille de trois constantes anglaises, déclarées avec **N_**, marqueur no-op reconnu par les mots-clés natifs Frappe ci-dessus. La fonction locale N_ retourne simplement son argument anglais, sans appeler le traducteur ni choisir une langue.
- Une seule règle exacte dans **babel_extractors.csv** : `frontend/src/components/Settings/settingsText.ts,javascript`, avant la règle TypeScript générique et après les exclusions de tests/déclarations existantes. **Aucun extracteur personnalisé**, regex ou wrapper ajouté ; aucune source Framework changée. Tous les autres fichiers Vue/TypeScript conservent leurs méthodes natives antérieures.
- settings.ts importe ces constantes pour le label de groupe et la description ; Preferences.vue les importe pour Access & Availability. Leurs valeurs runtime restent exactement les chaînes anglaises précédentes. Les trois constantes sont réellement consommées par les schémas, pas des appels morts ajoutés pour gonfler le POT.
- Les renderers continuent d’appeler __ au moment du rendu, sans nouveau chemin de traduction. Aucune table de valeurs françaises, cache de langue ou résolution parallèle dans l’application.

Cette utilisation du marqueur natif N_ est **une adaptation applicative au mapping Babel**, pas une affirmation que l’extracteur JS Frappe sait déjà traiter N_ partout. Le module reste limité aux textes source no-op ; y déplacer des appels runtime __ ferait perdre leur extraction avec cette règle. Le test verrouille les trois clés et la portée exacte du mapping. Toute extension doit être autorisée et testée, pas une conversion automatique de settings.ts.

## Trois traductions livrées

| Source anglaise | Français |
| --- | --- |
| System Configuration | Configuration du système |
| Access & Availability | Accès et disponibilité |
| Seconds a learner must stay on a lesson before it is marked complete. | Durée minimale pendant laquelle un apprenant doit rester sur une leçon avant qu'elle soit considérée comme terminée. |

Les trois usages recensés sont ceux du pilote ; aucune autre valeur du glossaire imposée. La description exprime une durée minimale en secondes, sans changer lesson_dwell_time, son minimum 1, sa valeur ni les règles d’achèvement. Les autres avertissements vidéo/quiz/devoirs restent inchangés, même lorsqu’ils sont encore anglais.

## Contrats et permissions préservés

Comparaison AST de settings.ts et du script Preferences après résolution des trois constantes et retrait de leur seul import : **identiques à la base** ; template Preferences identique à l’octet. settingsTree n’est ni traduit ni reconstruit ; labels anglais, slugs general/signup/course-progress, noms de champs, source.doc, save, types, options techniques, conditions, exigences et liens restent identiques. settingsSchema.ts, Settings.vue, SettingsFields.vue/Panel, composants mobiles, useAutosave et API sont inchangés.

Le test de contrat vérifie notamment course-progress, source {doc:'LMS Settings'}, save:'auto', lesson_dwell_time, min:1 et les données du champ avant/après changement de dictionnaire. Le chargement du nouveau module ne sollicite pas de traducteur global ; changer FR/EN au rendu ne modifie pas les valeurs anglaises du schéma. Le test renderer vérifie qu’aucune traduction française pilote n’est repassée au traducteur comme clé : pas de double traduction ajoutée.

Preferences conserve ses deux chemins : LMS Settings pour les préférences applicatives, endpoint spécifique pour langue/fuseau. canEditSystem exige is_system_manager===true et systemEditable attend aussi la lecture des préférences. Moderator ne devient pas System Manager. Le navigateur vérifie les contrôles langue désactivés pour un modérateur fictif, activés pour un System Manager fictif après rechargement, **sans interaction sur ces contrôles**. Aucun changement de langue/fuseau/site/permissions réel ; pas de preuve d’autorisation serveur réelle ou de production.

## Gettext et dictionnaire final

- **POT 3 010 → 3 013** : exactement les trois clés pilotes ajoutées ; **zéro suppression**. Trois références de ligne déplacées d’une ligne dans Preferences (Auto, Left to Right, Right to Left) à cause de l’import. Contextes/flags communs inchangés, seules dates natives d’en-tête en plus. Aucun POT édité manuellement, aucune extraction globale des autres textes du schéma.
- **PO 2 816 → 2 819 entrées ; 893 → 896 traductions renseignées**. Trois entrées ajoutées depuis le POT par Babel contrôlé ; **893 valeurs antérieures et tous les autres blocs/en-tête préservés**, sans nettoyage. Aucun changement aux 78 autres PO ni au Framework.
- Babel PO/POT, paramètres/contextes/flags, empreintes et diff complet contrôlés. Compilation native `bench compile-po-to-mo --app lms --locale fr`, puis `bench --site learning.localhost execute frappe.translate.clear_cache` réussies. **MO 896**, les trois valeurs concordent PO/MO/dictionnaire fusionné effectivement chargé. Préférences fr/en des comptes fictifs et défaut système fr inchangés. Anglais source/repli vérifié en tests et navigateur, aucune surcharge concurrente trouvée pour les clés du pilote.

## Tests exécutés

### Extraction

Deux régressions ajoutées au fichier Python existant : extraction des trois vraies constantes et portée du mapping (N_ extrait dans le seul module feuille, pas généralisé aux autres .ts, texte brut non extrait). **Avant la règle : deux échecs attendus**, trois clés absentes. **Après : sept méthodes du fichier réussies en une exécution, 0,101 s**, incluant les cinq régressions TypeScript/Vue antérieures justifiées par le changement de mapping. Aucun site/DB pour ces tests ; le diagnostic ponctuel du dictionnaire est distinct.

### Vue

**86 tests / six fichiers réussis en une exécution finale de 20,41 s**, quatre nouveaux cas, 82 existants : settingsContract, settingsFields, settingsDialogWidth, useSettingsHash, sidebarSettingsSaveRace et settingsText nouveau. Le helper lit le vrai PO et installe le plugin natif ; aucun dictionnaire français parallèle.

Nouveaux cas : import du module avec un traducteur global qui lèverait s’il était appelé (zéro appel), contrat anglais/slug/champ/save/min avant/après FR/EN, rendu de section et description dans les deux langues, rechargement du dictionnaire sur le composant monté, absence de double traduction des textes pilotes et de mutation du document fictif à 35 secondes. Aucun champ édité ni sauvegarde réelle.

Premier passage **84 réussis / deux échecs** : une modification trop large du helper de test référençait lang dans deux anciens cas autonomes de focus. Ces deux mocks ont été restaurés à leur comportement initial, sans modification applicative. 86/86 ensuite ; assertions supplémentaires sur les appels de traduction, puis passage final complet 86/86 ci-dessus. Aucun échec restant dans cette sélection. Les tests existants gardent leurs contrats d’autosave/focus/routage ; aucun test global déclaré réussi par déduction.

### Build et qualité

Build frontend nécessaire aux imports/module : **réussi, commande 13,56 s** ; déclarations components.d.ts/auto-imports.d.ts restaurées, assets/MO ignorés. Avertissements Vite/Browserslist/fs historiques conservés. Prettier six fichiers frontend, Ruff check/format Python, AST, Babel, paramètres et contrôles d’intégrité/secrets réussis. Pre-commit complet historiquement bloqué non relancé ; hooks désactivés après contrôles ciblés. Aucune suite backend transactionnelle, aucune dépendance réinstallée.

## Navigateur : résultats à distinguer

### Ordinateur FR/EN

**Deux parcours de lecture** affichent les trois clés pilotes : configuration système, accès/disponibilité et description de durée ; champ à 35 secondes/minimum 1 conservé. Navigations #settings/general et #settings/course-progress natives, rechargement avec rôle simulé System Manager, contrôle d’état désactivé/activé du sélecteur de langue sans le modifier. Titres et description français réellement affichés, repli anglais réellement affiché. Aucun panneau messagerie/OAuth/paiement/intégration ouvert, aucune valeur sensible consultée.

**Limite d’accessibilité confirmée, non corrigée :** le renderer compact de ce champ numérique rend la description dans un div sans identifiant et ne lui associe pas aria-describedby. Le champ dispose d’un nom accessible ; la description est visible mais son association programmatique n’est pas validée. Premier contrôle d’association **échoué**, trace conservée ; c’est une condition du renderer existant, qui reste byte-identique. La recette finale contrôle séparément nom accessible, texte visible, valeur et minimum, et enregistre **descriptionLinked:false**. **Ne pas déclarer une accessibilité complète ni tous les contrôles initiaux réussis.** Une correction générale de ce renderer doit faire l’objet d’un périmètre approprié.

### Mobile FR/EN

La version actuelle **n’expose pas les paramètres d’administration sur mobile** : AppSidebar/Settings n’y sont pas montés ; routes.ts indique explicitement l’absence de pages /settings, MobileYou expose un compte/apparence sans ces paramètres. Deux parcours /you avec les hashes de paramètres confirment absence du dialogue et du champ, sans contourner la navigation ni monter artificiellement le dialogue desktop.

**Les trois traductions ne sont donc pas validées comme rendues sur mobile.** Deux vérifications de limitation native aboutissent, pas deux recettes mobiles complètes du pilote. Les composants responsive mobiles et leurs libellés ne sont pas modifiés pour inventer cette surface. Leur développement reste hors lot.

### Sécurité et journaux

Interceptions installées avant connexion/montage : tous les documents LMS Settings fictifs, préférences système langue/fuseau fictives, langues, catégories, listes, utilisateurs et ressources nécessaires simulés. Seuls auth/ping/get_translations vers le site. Toute écriture Settings, set_system_preferences, insert/save/delete/set_value, opérations comptes/permissions/intégrations et REST bloquées ; aucune écriture prévue ni fulfill transactionnel.

**Zéro requête d’écriture sensible tentée et zéro transmise**, y compris au montage et à la fermeture ; aucun autosave déclenché. Aucun paramètre pédagogique, préférence, compte ou permission modifié. Valeurs de configuration réduites à un document fictif sans email/OAuth/passerelle ; aucune vraie configuration consultée. Le serveur reçoit seulement l’authentification des comptes de test et les lectures autorisées du dictionnaire.

Recette finale : **zéro pageerror**, un HTTP 400 socket.io, six boot_config et deux get_single_value non admis bloqués. Les deux lectures génériques n’ont renvoyé aucune valeur réelle. Premier essai avait aussi une lecture de catégories bloquée causant un Failed to fetch ; elle a ensuite reçu une réponse fictive. Les erreurs initiales et l’échec aria-describedby restent consignés. **Contrôle JavaScript global non validé.**

## Limites et reprise

Pilote limité à trois clés, pas tous les libellés de settings.ts/Preferences. Le nom du champ en secondes et les autres textes peuvent encore dépendre du Framework ou rester anglais ; aucun catalogue complet déduit. Le module source N_ ne doit pas devenir un emplacement d’appels runtime __ sans réviser la règle et ses tests ; maintien de ce fichier exact/du marqueur et réextraction à surveiller lors des mises à jour. La solution ne généralise pas N_ aux fichiers Vue/TypeScript existants.

Conserver : toast mobile FR-03B.1 non confirmé, 16 rejets JS historiques, contrôle global non validé, double clic paiement, transactions réelles non testées, dates/heures/fuseaux I18N-01, confirmations destructives potentiellement non exhaustives et permissions réelles de production non testées. Ajouter les réserves d’association de description et d’absence d’administration mobile ci-dessus. Autres clés dynamiques et éventuelle amélioration du renderer à traiter seulement sur autorisation FR-03B.7/lot adapté ; **aucun FR-03B.7 commencé**.

## Livraison locale

Douze fichiers : mapping Babel ; settingsText.ts nouveau ; settings.ts/Preferences.vue ; trois tests Vue (deux étendus, settingsText nouveau) et test_gettext_extraction.py ; fr.po/main.pot ; ce rapport et CODEX_HANDOFF.md. Commit sources/tests **ebef8f52** ; second commit catalogues/rapport/handoff à relever avec git log -1. Aucun push FR-03B.6.

Preuves hors dépôt `/workspace/work/fr03b6/` : snapshots, diagnostic natif/dictionnaire et variantes, échec/réussite extraction, génération/plan/summary, Vue initiaux/final2, build/compilation/check, invariants AST, browser-first/browser et captures fictives. Aucun secret, cookie, jeton, fichier MO/asset ajouté au dépôt. Prochaine action : revue et autorisation explicite avant publication ; aucune PR, Crowdin, develop, Framework, production OMV 8 ou nouvelle phase.
