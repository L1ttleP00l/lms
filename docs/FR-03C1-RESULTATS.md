# FR-03C.1 — Faux échec mobile après création d’un membre

31 octobre 2026 (Europe/Paris), branche littlepool-dev. Base publiée : **d4a65e21c3e4fa70238fc852499f009d8ad77a92**.

## Publication préalable

FR-03V1 publié par push normal autorisé, parent b67c8c55 vérifié, checkout initial propre et diff limité au rapport de validation et au handoff. Résultats 6/8, avis 4/4 et réserves conservés ; absence de secrets et intégrité des catalogues contrôlées. SHA distant vérifié, rapport GitHub récupéré et identique. develop reste 6b791f33b34efa15566a0cb707f5be59d136df50. Aucun push FR-03C.1.

## Diagnostic confirmé

Les preuves FR-03V1 sont réutilisées : ouverture directe mobile de `/lms/settings/users/new`, profil modérateur entièrement fictif, accueil non terminé. add_member aboutit puis save_role aboutit ; ensuite **TypeError: Cannot read properties of undefined (reading 'map')**. La pile capturée par Chromium pointe sur useOnboarding.updateOnboardingStep, puis pages/Forms/MemberForm.vue.

L’exception est **synchrone** : les définitions `onboardings.learning` sont absentes, car leur setUp est effectué par AppSidebar, non monté dans MobileLayout. Le catch de création englobait ce suivi, la télémétrie, le toast, le rafraîchissement et la fermeture. Il produisait donc « Impossible d’ajouter le membre » après une opération métier simulée déjà terminée. Le toast de succès et la fermeture n’étaient pas atteints ; ce n’était pas une notification cachée par une fermeture réussie.

Reproduction unitaire sur le code publié, avec un mock reproduisant cette exception native : **un test ciblé échoue avant correction**, sur l’absence du toast de succès attendu. Le même cas fait partie de la suite finale réussie. Aucun nouvel utilisateur réel créé pour reproduire le défaut. Les preuves navigateur initiales restent dans `/workspace/work/fr03v1/` ; pas de nouvelle recette pré-correctif complète.

Une seconde propriété du Framework installé est confirmée par lecture du code : updateOnboardingStep renvoie void et son appel interne à update_user_onboarding_status ne retourne ni n’attend la promesse. Entourer seulement cette méthode d’un await/catch ne gérerait pas ses rejets réseau.

## Correctif limité

Seuls deux fichiers de source/test changent :

-   `frontend/src/pages/Forms/MemberForm.vue`.
-   `frontend/src/tests/memberFormRoute.test.ts`.

Le try/catch métier attend exclusivement **add_member et toutes les attributions save_role sélectionnées**. Une erreur de l’un de ces appels affiche toujours l’échec et conserve le formulaire ; aucun toast de succès, événement de suivi ou retour normal ne suit. Le code n’ajoute aucune relance automatique. Les erreurs partielles d’attribution conservent le message d’échec existant ; aucun rollback ou mécanisme de reprise métier ajouté.

Après réussite obligatoire, toast natif de succès, signal de rafraîchissement et fermeture fonctionnent indépendamment du suivi secondaire. Onboarding et télémétrie sont chacun exécutés dans une promesse explicitement traitée, sans attendre le réseau secondaire pour confirmer la création. Une exception synchrone ou une promesse rejetée ne déclenche ni faux échec de création ni deuxième add_member. Diagnostics constants : `Member created; onboarding tracking failed.` ou `Member created; telemetry tracking failed.` Aucun objet d’erreur, adresse, identifiant ou donnée de formulaire journalisé.

Le suivi d’invitation reste local à ce formulaire : lorsqu’il est disponible et non terminé, appel **attendu** du même endpoint natif `frappe.onboarding.update_user_onboarding_status`, avec le même contrat `steps: JSON.stringify(...), appName: 'learning'`. Après réussite seulement, mise à jour du cache **natif** useStorage `onboardingStatus`, des étapes déjà enregistrées, de l’indicateur de complétion et de minimize. Aucune requête détachée non observable du helper Framework n’est appelée. Cette adaptation est nécessaire pour traiter les rejets de la version void ; aucun Framework ou utilitaire partagé modifié, aucun magasin parallèle créé.

Quand les étapes ou la session requises sont indisponibles, le suivi secondaire est signalé et omis pour cette création. L’accueil n’est pas désactivé globalement : le parcours avec étapes disponibles continue à persister invite_students. Le lot ne déplace pas l’initialisation globale et n’ajoute pas de file de rattrapage pour l’événement omis. Ce comportement est une limite explicite, pas une preuve de suivi de l’accueil réussi sur mobile à froid.

Aucun changement d’API backend, de paramètres métier, de rôle technique, DocPerm, contrôle d’accès, schéma User, mode édition ou traduction. Paramètres add_member, assignRoles, refus d’accès et handler saveRoles comparés à la base : identiques. Aucun auxiliaire supplémentaire nécessaire.

## Tests Vue et promesses

Commande finale : `yarn --cwd frontend test src/tests/memberFormRoute.test.ts src/tests/settingsMemberForm.test.ts --maxWorkers=2`.

**42/42 réussis dans deux fichiers : 31 route, 11 paramètres**, exécution finale 3,88 s Vitest (4,62 s commande). Dix nouveaux cas dans la route, traductions réelles du PO chargées via le helper existant. La suite des paramètres est inchangée.

Couverture ciblée :

-   Succès FR et EN avec accueil non initialisé : toast, signal membres, retour MobileYou et une seule création.
-   Accueil disponible : contrat natif, étape et cache mis à jour.
-   Erreur synchrone et rejet asynchrone de la persistance secondaire : succès métier préservé, cache non faussement complété.
-   Exception et rejet de télémétrie traités, sans exposer le détail fictif privé dans les diagnostics.
-   Attente d’un rôle obligatoire avant succès, mais absence d’attente du réseau secondaire pour fermer ; suivi achevé ensuite.
-   Vrais refus add_member et save_role : erreur visible, pas de suivi, pas de succès ou navigation, aucune deuxième création.
-   Contrats techniques, refus d’accès, édition et navigation existants conservés.

Échecs intermédiaires conservés : premier passage pré-correction 6/29 en échec ; premier passage après correction 5/40 en échec parce que cinq anciens cas ne modélisaient pas l’état d’accueil et déclenchaient le diagnostic attendu, interdit par la garde console du projet. Leur fixture par défaut représente maintenant un accueil terminé ; **les nouveaux cas d’accueil indisponible restent explicites et vérifient le diagnostic**, sans ignorer l’exception. Deux cas supplémentaires ont été ajoutés ensuite (télémétrie synchrone et promesses différées). La reproduction pré-correctif isolée échoue comme attendu ; les 42 cas finaux ont été rejoués ensemble après les dernières assertions. Aucune déduction de réussite globale à partir d’une relance isolée.

Aucun rejet non géré signalé par Vitest dans cette exécution ciblée. Les problèmes JavaScript historiques ne sont pas déclarés résolus.

## Recette Chromium

Build frontend exécuté avec dépendances existantes : `yarn --cwd frontend build`, **réussi en 16,00 s**, y compris signup-select (1,90 s). Avertissements existants de build conservés ; fichier de déclarations généré restauré, aucun artefact ajouté au dépôt. Pas de compilation MO, extraction POT ou build supplémentaire.

| Parcours                     | État d’accueil                             | Validation et refus simulé | Succès, toast visible, retour /lms/you    |
| ---------------------------- | ------------------------------------------ | -------------------------- | ----------------------------------------- |
| FR ordinateur 1440×1000      | Indisponible au montage, fixture contrôlée | Réussis                    | Réussis                                   |
| EN ordinateur 1440×1000      | Indisponible au montage, fixture contrôlée | Réussis                    | Réussis                                   |
| FR mobile 390×844            | Ouverture directe native, non initialisé   | Réussis                    | Réussis                                   |
| EN mobile 390×844            | Ouverture directe native, non initialisé   | Réussis                    | Réussis                                   |
| FR ordinateur supplémentaire | Étapes disponibles, sidebar normale        | Réussis                    | Réussis, persistance secondaire confirmée |

**Quatre parcours principaux sur quatre réussis, plus un contrôle disponible réussi.** Chaque parcours vérifie courriel vide sans écriture, refus fictif avec message visible/formulaire conservé, puis succès simulé, rôle exact LMS Student/value 1, toast natif FR/EN, retour /you, absence de faux message d’échec et exactement un add_member pour la tentative valide. Le refus précédent constitue volontairement une tentative distincte. Aucun avis ou autre lot rejoué.

Sur ordinateur, AppSidebar initialise normalement l’accueil avant la soumission. Une première tentative de harnais avec `?fromLesson=1` (layout natif sans sidebar) n’a pas suffi : un montage initial avait déjà enregistré les étapes ; les assertions d’indisponibilité ont échoué **malgré un succès métier**. Trace conservée dans browser-first.json, non comptée comme parcours validé.

Harnais corrigé uniquement : les deux principaux parcours ordinateur utilisent ce layout et un profil fictif initialement non gestionnaire ; après montage, le modérateur est activé **dans la ressource utilisateur fictive du navigateur**, sans aucun appel serveur. L’objet d’accueil capturé au montage ne possède pas d’étapes ; le diagnostic attendu confirme cette branche. Ce contrôle n’est pas une attribution réelle de rôle ni la preuve d’une navigation normale de modérateur sur ordinateur. Le cinquième parcours utilise le profil modérateur et le layout desktop normaux, sans cette adaptation, pour vérifier la persistance quand l’intégration est disponible. Les parcours mobiles principaux sont directs, sans cette manipulation ni marqueur « accueil terminé ».

Résultats conservés : main.json, browser-final.log et captures. Zéro pageerror final ; quatre diagnostics secondaires d’indisponibilité attendus, aucun dans le contrôle disponible. Les HTTP403 des refus, échecs externes/tunnel et boot_config bloqués restent visibles dans les journaux ; le contrôle JavaScript global n’est pas déclaré réussi.

## Sécurité, intégrité et limites

Interceptions avant navigation, lectures métier/utilisateur/paramètres fictives. Seuls login des comptes synthétiques, ping et traductions passent vers learning.localhost. Toute méthode inconnue et REST bloqués par défaut. **16 appels sensibles simulés** : dix add_member (cinq refus/cinq succès), cinq save_role et une mise à jour d’accueil ; **zéro transmis au backend**. Aucun update_member, invitation, email, membre ou rôle réel modifié. Cinq boot_config bloqués. Les comptes d’authentification synthétiques existants sont réutilisés sans publier leurs credentials.

Empreintes : 39 PO LMS + POT inchangés, 78 autres PO inchangés ; 951 valeurs FR et 3 019 clés POT conservées. Framework propre à 959b85de4086656273e1d158f41923dd3808c350. develop distant inchangé ; aucun catalogue, backend, production ou paramétrage Docker modifié. Prettier des deux fichiers et git diff --check réussis, recherche ciblée de secrets et données personnelles dans les ajouts. Aucun hook complet réinstallé : commits avec hooks désactivés, contrôles ciblés explicites ; pas de déclaration de réussite du lanceur pre-commit complet. Aucune suite globale/backend ou transaction réelle exécutée.

**Risque analogue dans Settings/Members/MemberForm.vue** : suivi onboarding/capture toujours dans la fonction métier de runSave, avant confirmation. Desktop normal initialise les étapes, mais une exception secondaire synchrone pourrait produire un faux échec ; le helper natif void conserve son risque de rejet détaché. Lecture du code et onze tests existants réussis ne constituent pas une reproduction navigateur de ce risque dans Settings. Cette implémentation reste inchangée, conformément au périmètre.

Conserver aussi : états partiels réels de création/rôles, concurrence et reprise non testés ; accueil omis à froid sans rattrapage ; compatibilité de l’adaptation à recontrôler si Framework modifie son helper/cache. Les 16 rejets JS historiques, double clic paiement, transactions réelles, lecture des certificats, légendes anglaises, traductions administratives manquantes, accessibilité de durée, suppressions, dates/fuseaux et modération non confirmée restent ouverts.

Preuves hors dépôt : `/workspace/work/fr03c1/` (publication, tests avant/après et finaux, build, harnais, JSON, captures), complétées par FR-03V1. Source/tests : commit local **a6c4e93e** ; rapport/handoff dans un second commit documentaire local, SHA à relever par git log -1. Aucun push de ces commits.

## Incidence sur la clôture

Le faux échec de la route mobile est corrigé dans le périmètre simulé, et les avis avaient été validés en FR-03V1. **Recommandation : envisager une clôture FR-03 avec réserves**, après acceptation explicite des limites ci-dessus, notamment le risque analogue du formulaire Settings et le suivi d’accueil omis à froid. Cette recommandation n’est ni une clôture définitive, ni une validation de production ou de sécurité globale.

Prochaine décision : revue/publication de FR-03C.1 et acceptation des réserves, ou autorisation d’une validation/correction distincte de Settings. FR-04 et I18N-01 non démarrés. Attendre l’accord du responsable.
