# FR-03B.1 — Membres et rôles

30 octobre 2026 (Europe/Paris), branche littlepool-dev. **Base publiée réellement vérifiée : 736b1523b220b08708b51fa53a545bf16e2dbebc**. FR-03A a été publié au préalable sur autorisation explicite, par push normal depuis d1ccb8d2 ; rapport distant accessible et identique, fetch aligné 0/0. Aucun push de FR-03B.1.

## Périmètre et changements

La liste des membres, les deux formulaires (paramètres et route), leurs rôles et descriptions, refus, confirmations et erreurs utilisent déjà les appels natifs __. **Aucun changement de leur logique de sauvegarde ou de permissions.** RoleSwitches.vue, members.ts, les deux MemberForm.vue, NewMemberModal.vue, les API et contrôleurs restent inchangés.

Deux sources modifiées pour l’affichage seulement :

- Members.vue fournit quatre phrases complètes pour l’état vide initial, la recherche et le filtre de rôle, sans remplacer un nom anglais dans une phrase française générique.
- SettingsList.vue accepte deux propriétés optionnelles emptyTitle/emptyDescription ; ses autres appelants gardent leurs phrases/replis, leurs branches et leur comportement. Aucun filtrage, appel réseau, pagination, rôle, action de création/suppression ou disposition changé. Le défaut filtered existant n’a pas été modifié.

Le lot reste limité aux membres et à leur dépendance directe : **32 clés françaises renseignées**, dont les quatre nouvelles phrases. Nombre supérieur à l’estimation initiale FR-03A (8–12) parce que les deux formulaires, les quatre descriptions et les erreurs demandées sont couverts ensemble ; aucune autre section administrative ajoutée.

## Traductions effectivement disponibles

| Clé source | Français |
| --- | --- |
| A line or two about this person | Quelques mots sur cette personne |
| Actions for {0} | Actions pour {0} |
| Edit Member | Modifier un membre |
| Evaluator | Évaluateur |
| Filter by role | Filtrer par rôle |
| First Name is required | Le prénom est obligatoire. |
| Instructor | Formateur |
| Member added successfully | Membre ajouté avec succès |
| Member updated | Membre mis à jour |
| Moderator | Modérateur |
| New Member | Nouveau membre |
| Not saved | Modifications non enregistrées |
| Student | Apprenant |
| This member has not loaded yet | Les informations de ce membre ne sont pas encore chargées. |
| This site is in read-only mode. | Ce site est en lecture seule. |
| Unable to add member | Impossible d’ajouter le membre |
| Unable to update member | Impossible de modifier le membre |
| Unable to update user | Impossible de modifier l’utilisateur |
| You are not permitted to manage members. | Vous n’êtes pas autorisé à gérer les membres. |
| Learn courses and track progress | Suivre des cours et sa progression |
| Build and manage courses, chapters, and lessons | Créer et gérer des cours, des chapitres et des leçons |
| Manage batches, review and grade submissions | Gérer des sessions de formation, examiner et noter les travaux remis |
| Oversee all users, content, and system settings | Superviser l’ensemble des utilisateurs, les contenus et les paramètres du système |
| Delete user | Supprimer le compte utilisateur |
| This permanently deletes the user account and cannot be undone. | Cette action supprime définitivement le compte utilisateur et ne peut pas être annulée. |
| User deleted | Compte utilisateur supprimé |
| Unable to delete user | Impossible de supprimer le compte utilisateur |
| Go to Profile | Consulter le profil |
| No members found | Aucun membre trouvé |
| No members match {0}. | Aucun membre ne correspond à « {0} ». |
| No members match this role filter. | Aucun membre ne correspond à ce filtre de rôle. |
| Add a member to get started. | Ajoutez un membre pour commencer. |

Les 32 valeurs sont concordantes dans PO/MO/dictionnaire réel du site. Les quatre phrases nouvelles ont été extraites nativement, sans édition manuelle du POT. Les 687 traductions précédentes sont toutes conservées, sans correction globale.

### Usages partagés et ambiguïtés

- Student → Apprenant, Instructor → Formateur, Evaluator → Évaluateur et Moderator → Modérateur sont des libellés d’acteurs également présents dans cours/sessions/profils. Usages littéraux consultés via l’inventaire FR-03A ; aucun changement des identifiants ni comparaison métier. Course Creator → Créateur de cours était déjà correct et reste inchangé. Un badge Instructor peut représenter Course Creator dans la liste : ne pas en déduire une affectation à tous les cours.
- ROLE_ROWS conserve ses quatre descriptions anglaises ; leur traduction ne modifie ni leur sens général ni les capacités. Elles restent synthétiques et plus générales que certains contrôles (System Manager, affectations). Leur précision métier complète est reportée, aucune nouvelle promesse d’autorisation n’est ajoutée au code.
- Not saved est utilisé par le marqueur d’état partagé et signifie partout des modifications non enregistrées dans les usages examinés ; la nouvelle valeur est vérifiée dans le dictionnaire après ajout final. Les clés Saved/Save/Create/Roles/Course Creator, First/Last Name, Email/Username/Phone/Bio et autres traductions existantes correctes sont conservées.
- Not saved est traduit au moment du rendu par le composant enfant SettingsHeader, pas laissé brut. La nouvelle traduction n’exige ni changement de cet enfant ni nouvelle extraction.
- Email is required reste avec la traduction existante (« L’Email est requis » dans le PO, apostrophe ASCII) ; pas d’harmonisation de style étendue aux champs partagés avec Framework. Les exemples de noms/téléphones du formulaire ne sont pas des données de vrais membres et n’ont pas été modifiés.
- This member has not loaded yet est un message de validation traduit ; cela **ne crée pas de nouveau traitement d’erreur de chargement**. Les ressources peuvent conserver un chargement ou un message serveur selon le défaut existant. Aucun gestionnaire global d’erreur ajouté.

## Contrats techniques et sécurité

Mapping inchangé :

| Clé interne | Identifiant API/stocké | Libellé formulaire |
| --- | --- | --- |
| lms_student | LMS Student | Apprenant |
| course_creator | Course Creator | Créateur de cours |
| batch_evaluator | Batch Evaluator | Évaluateur |
| moderator | Moderator | Modérateur |

Filtre : valeurs All/LMS Student/Course Creator/Moderator/Batch Evaluator conservées ; badge Course Creator affiché Formateur comme auparavant Instructor. Les valeurs booléennes/0–1, ROLE_MAP, différences de rôles, reprise après sauvegarde partielle, filtres et pagination API sont inchangés. Comparaison octet pour octet de members.ts, RoleSwitches, deux MemberForm et api.py à la base : réussie.

Refus frontend is_moderator et read_only_mode conservés, backend only_for et contrôles existants préservés. Aucun rôle réel attribué/retiré ; aucune permission assouplie. Le rôle gestionnaire du navigateur est **un get_user_info fictif intercepté**, pas un rôle accordé aux comptes du site. Aucun appel backend d’ajout/modification/suppression de membre ou d’affectation de rôle. La confirmation de suppression reste définitive, dialogue et handler inchangés ; son action destructive n’est jamais exécutée dans le navigateur.

## Catalogues et compilation

- PO **2 721 → 2 734 entrées ; 687 → 719 traductions**. 13 entrées absentes du PO ajoutées depuis le POT, autres valeurs ciblées précédemment vides. Aucun nettoyage historique. Blocs/en-tête non ciblés conservés octet pour octet par l’outil Babel contrôlé.
- POT natif **2 997 → 3 001** : quatre ajouts, **zéro suppression**, cinq références communes déplacées. Ajouts : Add a member to get started., No members found, No members match this role filter., No members match {0}. Déplacements : Add one to get started, Filter by role, No {0} match this filter, No {0} match {1}, Search. Dates d’en-tête natives seules autres variations. Diff intégral relu, aucun changement imprévu de contexte/indicateur/paramètre.
- Paramètres {0} conservés, y compris recherche/noms accessibles ; pas de traduction de données utilisateur. Babel PO/POT et indicateurs/contextes : réussis. 78 autres PO intacts (38 LMS + 40 Framework), Framework propre à 959b85de4086656273e1d158f41923dd3808c350.
- Compilation native LMS/fr et invalidation du cache du seul learning.localhost réussies. **MO 719 messages**, 32 valeurs réelles contrôlées ; préférences préexistantes fr/en et défaut système fr confirmés sans modification.
- Mesure intermédiaire 718/31 avant ajout de Not saved ; ajout final autorisé, seconde compilation/contrôle effectués. POT inchangé par ce dernier ajout car clé déjà présente. Les tests Vue restent applicables : aucune source/test ni valeur qu’ils attendent modifiée après leur passage final ; Not saved contrôlé dans PO/MO/dictionnaire, pas de nouvelle recette Chromium de ce marqueur.

## Tests exécutés

### Vue ciblé

**Passage final : 81 tests / six fichiers, tous réussis en une exécution de 6,19 s** :

- settingsMemberForm.test.ts : créations/modifications en mémoire, reprises après échec partiel, ajout de cas FR/EN de succès/refus/validation/échec et lecture seule.
- memberFormRoute.test.ts : route, refus, réouverture, rôles accessibles et différences ; nouveau cas FR avec save_role simulé vérifiant exactement Batch Evaluator et value=1.
- NewMemberModal.test.ts existant réutilisé pour correspondances de rôles, ajout/édition/isolement et garde de soumission, sans réseau.
- memberTranslations.test.ts nouveau : vraies traductions PO via plugin natif, quatre identifiants exacts, badges/options/colonnes/aria-label, filtres et états vides, confirmation d’irréversibilité et erreur/refus simulé via le helper (handler destructif non invoqué).
- settingsList.test.ts : trois états d’override contextualisé ajoutés ; anciennes assertions des autres appelants conservées.
- settingsListEmptyContent.test.ts : contrat de contenu vide personnalisé conservé.

Premier passage 76 réussis/3 échecs : le stub EmptyState expose le titre par attribut data-title et ne le rend pas comme texte. Assertion corrigée sur cet attribut, sans toucher l’application ; 79/79 ensuite. Deux cas read-only FR/EN ajoutés → final 81/81. Aucun échec restant dans cette sélection. Le helper tests/helpers/frenchCatalog.ts lit le PO et utilise le vrai plugin ; aucun dictionnaire runtime parallèle ajouté.

### Build et contrôles

Build nécessaire aux deux changements Vue : **réussi, commande 15,25 s**. Déclarations components.d.ts/auto-imports.d.ts restaurées ; assets/MO hors Git. Avertissements habituels Vite/Browserslist/face-api conservés. Prettier ciblé, git diff --check, recherche ciblée de secrets et contrôles d’intégrité réussis. Pre-commit complet historiquement bloqué non relancé ; hooks désactivés après contrôles ciblés. Aucun test Python applicatif : backend inchangé ; Python utilisé uniquement pour les contrôles Babel/catalogues/dictionnaire.

### Chromium : résultats à distinguer

**Recette de sauvegarde partielle (browser-second.log / browser-write-attempt.json)** : FR ordinateur a achevé création simulée, sauvegarde d’une modification de rôle, réouverture et refus. FR mobile a atteint le scénario de création, mais l’attente du toast « Membre ajouté avec succès » a expiré. **Cette recette n’est pas déclarée réussie sur les quatre combinaisons.** Trois requêtes d’écriture interceptées et répondues fictivement au total, zéro transmise ; rôle de gestionnaire et lectures de membres fictifs. Le collecteur de paramètres URL ne lit pas le corps JSON du save_role et contient null pour role/value ; ne pas le citer comme preuve des paramètres. Les identifiants exacts sont vérifiés par les tests Vue et l’intégrité des sources.

Première tentative de harnais arrêtée sur recherche exacte du nom accessible Courriel alors que le contrôle requis inclut « *(required) » ; des lectures LMS Settings non simulées avaient également reçu 403 et les appels onboarding bloqués produisaient Failed to fetch. Simulations de lecture complémentaires et sélecteur email adaptés uniquement dans le harnais. Tentative suivante : un rejet Failed to fetch d’onboarding bloqué et erreurs HTTP sockets consignés ; pas de correction métier, pas de masquage. **La cause du toast mobile absent n’est pas établie ; limite à diagnostiquer séparément si nécessaire.** Les formulaires et handlers de sauvegarde sont inchangés par le lot ; leurs tests unitaires passent, cela ne remplace pas une preuve de succès mobile navigateur.

**Recette distincte d’affichage sans sauvegarde (browser-readonly.cjs/json)** : quatre parcours FR/EN × ordinateur 1440×1000 / mobile 390×844 ont achevé rôles et noms accessibles, formulaire neuf, réouverture d’une fiche fictive et refus du non-gestionnaire. Zéro pageerror dans cette recette, deux HTTP socket.io 400 annexes, 12 boot_config bloqués. Quatre lectures de membre simulées, **zéro écriture même simulée**, zéro tentative d’endpoint interdit et zéro transmission sensible. Ne pas assimiler ce succès à la validation des toasts de sauvegarde ni à la réussite du contrôle JavaScript global.

Toutes les gardes sont installées avant connexion/montage. get_member/get_members et User fictif substitués, autres API non explicitement autorisées bloquées ; add/update/save_role de la recette partielle répondus par fulfill, jamais continue/fetch vers serveur, delete_member toujours bloqué. Aucun compte réel ni rôle/profil d’un compte existant modifié, aucune suppression, paiement, inscription ou délivrance. Préférences natives de deux comptes fictifs fr/en utilisées sans mutation. Aucun secret/cookie dans les preuves suivies. Liste, états vides et suppression couverts au niveau composant ; pas de recette Chromium complète de la liste/du dialogue de suppression ni de toutes les erreurs de chargement.

## Limites et livraison

- Les 16 rejets préexistants FR-02C.2, le double clic paiement et les formats de dates restent ouverts, non corrigés/non rejoués. Aucun contrôle JavaScript global déclaré réussi.
- Contrôles effectifs de permissions serveur non rejoués en DB ; tests de refus UI et contrats mockés, pas certification d’accès en production. Pas de transaction réelle, email, lecteur d’écran exhaustif, suite globale ou installation.
- Certains libellés génériques de sauvegarde/chargement dépendent encore de Framework ou d’une clé dynamique ; aucune prétention de couverture intégrale de toute l’administration. Les différences existantes des deux formulaires restent conservées.

Fichiers source : Members.vue et SettingsList.vue. Tests : trois fichiers existants étendus (settingsMemberForm, memberFormRoute, settingsList), nouveau memberTranslations.test.ts et helper frenchCatalog.ts. Catalogues : fr.po/main.pot. Documentation : ce rapport et CODEX_HANDOFF.md. **Commit source/tests : b06c7bc0** ; commit catalogues/rapport/handoff à relever par git log -1.

Preuves hors dépôt : /workspace/work/fr03b1/ (snapshots, plan/résumé, génération et diff, tests avec passage initial/final, build, compilations/check-final.log, harnais navigateur et échecs/succès distincts, captures fictives). Base distante 736b1523, develop 6b791f33b34efa15566a0cb707f5be59d136df50. Checkout propre après commits, nouveaux commits locaux seulement. **Aucun push/PR/Crowdin/déploiement/production ; aucun FR-03B.2 commencé.** Prochaine action : revue des résultats et limites, puis autorisation de publication ou demande de diagnostic ciblé du toast mobile.
