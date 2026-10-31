# FR-03V1 — Validation complémentaire ciblée

31 octobre 2026, site de développement learning.localhost, branche littlepool-dev.

## Publication et périmètre

Revue publiée par push normal : **b67c8c55f243b259f84e81bee37d6d055c3bcf06**, descendant direct de fb684be0f5c4f4d18fe6dd1d49260f6942a4c5f7. Avant publication : checkout propre, deux documents seulement, bilan 687→951 FR (+264, trois corrections), POT 2 997→3 019 (+33/−11), catalogues intacts et absence de secrets contrôlés. Rapport GitHub récupéré et comparé octet par octet ; distant vérifié après publication. develop reste 6b791f33b34efa15566a0cb707f5be59d136df50. Ce SHA publié est la base de FR-03V1.

Seules les réserves avis navigateur B.9 et création de membre mobile B.1 ont été examinées. AGENTS, handoff, revue, rapports B.1/B.9 et glossaire consultés ; sources et harnais historiques réutilisés. Aucun changement applicatif, test versionné, catalogue, Framework, configuration ou donnée pédagogique. La revue initiale reste intacte. FR-03 n’est pas clôturé.

## Résultat principal

| Scénario                                                                       | FR ordinateur | EN ordinateur | FR mobile                      | EN mobile                      |
| ------------------------------------------------------------------------------ | ------------- | ------------- | ------------------------------ | ------------------------------ |
| Avis : inscription, affichage, formulaire, validation, refus et succès simulés | Réussi        | Réussi        | Réussi                         | Réussi                         |
| Membres : validation et refus simulé                                           | Réussi        | Réussi        | Réussi                         | Réussi                         |
| Membres : succès depuis une ouverture directe, accueil non terminé             | Réussi        | Réussi        | Échec                          | Échec                          |
| Contrôle mobile avec accueil déjà terminé                                      | Sans objet    | Sans objet    | Toast visible et retour normal | Toast visible et retour normal |

**Six des huit parcours principaux réussissent entièrement.** Les deux contrôles mobiles après changement de l’état fictif d’accueil n’effacent pas les échecs initiaux. Aucun succès global JavaScript ou de sauvegarde navigateur n’est déclaré.

## A — Diagnostic des avis

Route réelle : `/lms/courses/FR03V1-COURSE#overview`. Un profil apprenant fictif est fourni par get_user_info ; son inscription existe uniquement dans la réponse simulée get_course_details. Aucun cours ou membre métier réel n’est lu.

Le harnais B.9 fournissait `tags: []`. Le DocType LMS Course définit pourtant tags comme Data ; CourseOverview utilise `course.data.tags.split(', ')`. Reproduction contrôlée avec ce même tableau : erreur console Vue **TypeError: e.course.data.tags.split is not a function**. CourseOverview est présent dans l’arbre, CourseReviews absent, get_course_outline appelé mais **get_reviews : zéro appel**. Le gestionnaire Vue capte cette erreur de rendu : l’absence de pageerror ne suffisait pas à l’exclure.

Dans ce contrôle, seule la valeur tags est ensuite remplacée par une chaîne vide, puis la page rechargée : CourseReviews apparaît dans l’arbre, get_reviews est appelé une fois, avis et bouton deviennent visibles. **Défaut de fixture confirmé**, distinct du masquage normal sans inscription/avis. Le défaut historique est expliqué par une donnée incompatible avec le contrat natif ; aucune protection applicative contre ce tableau invalide n’est ajoutée.

Fixtures finales : cours gratuit publié FR03V1-COURSE, tags chaîne vide, instructors tableau vide, contenu et titre explicitement fictifs ; membership `{name: 'FAKE-ENROLLMENT', member: 'fictional-settings@example.com', progress: 0}` ou null. Un avis fictif comporte rating 5, owner_details avec username/full_name et une date fixe. get_count renvoie 0 puis 1 pour LMS Course Review ; pas de préférence ou rôle réel modifié.

Dans les quatre parcours FR/EN :

-   Inscription sans avis personnel : bouton « Donner un avis » / « Write a Review », avis existant visible.
-   Dialog natif ouvert ; soumission sans note : « Veuillez attribuer une note. » / « Please enter a rating. », zéro appel insert.
-   Note 5 et texte fictif : insert entièrement simulé ; fraction transmise exactement **1 = 5/5**, DocType et cours contrôlés par assertions.
-   Refus HTTP 403 simulé : message explicite français/anglais visible, dialogue conservé ; aucune écriture serveur.
-   Succès simulé : dialogue fermé, get_reviews/get_count rechargés, bouton masqué ; après rechargement, avis personnel déjà publié toujours pris en compte.
-   Sans inscription et sans avis : composant monté et lectures simulées, mais zone/bouton normalement masqués.

Le contrôle diagnostique FR ordinateur a aussi relevé le résumé « Note moyenne : 5/5 · 1 avis ». Les quatre recettes vérifient l’avis existant ; elles ne comportent pas d’assertion indépendante sur toutes les variantes numériques du résumé. Les variantes, avis longs et règles de modération restent couverts par les preuves antérieures de composants, non rejouées ici.

## B — Diagnostic de la création mobile

Le parcours historique est une ouverture directe de `/lms/settings/users/new`. L’arbre confirme **pages/Forms/MemberForm.vue**, sous MobileLayout en mobile, et non components/Settings/Members/MemberForm.vue. Le formulaire des paramètres possède un autre cycle de sauvegarde ; sa réussite ne valide pas cette route.

Sur cette route, le courriel est obligatoire ; prénom/nom facultatifs dans le handler. Le bouton data-testid member-save est actif pour une nouvelle fiche. Courriel vide : toast natif localisé et aucun add_member. Données fictives valides : courriel réservé example.com, prénom Fictional, nom Member ; switch Apprenant/Student activé. Le harnais lit correctement les corps JSON : `save_role` reçoit `role: 'LMS Student', value: 1` et l’identifiant fictif renvoyé par add_member.

Étapes séparément observées :

| Étape                                    | Ordinateur FR/EN                           | Mobile à froid FR/EN                        |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| add_member simulé répond et est consommé | Oui, save_role suit                        | Oui, save_role suit                         |
| save_role simulé terminé                 | Oui                                        | Oui, l’exécution atteint ensuite onboarding |
| Mise à jour de l’accueil                 | Initialisé par AppSidebar, requête simulée | Exception synchrone avant requête           |
| Toast de succès                          | Rendu et visible                           | Non confirmé ; attente expirée              |
| Fermeture/retour                         | `/lms/you`                                 | Reste `/lms/settings/users/new`             |

Un diagnostic Chromium supplémentaire avec pause sur les exceptions capturées, sans modification du code, établit :

`TypeError: Cannot read properties of undefined (reading 'map')`

Pile : onboarding-D74S8loP.js → MemberForm-CdarRXyd.js. Dans la version installée, useOnboarding.updateOnboardingStep appelle `onboardings[appName].map(...)` lorsque les étapes stockées sont vides. Leur enregistrement setUp est effectué par **AppSidebar.setUpOnboarding**. DesktopLayout monte AppSidebar ; MobileLayout ne le monte pas. Une ouverture mobile directe avec accueil non terminé laisse donc `onboardings.learning` non initialisé.

La route MemberForm appelle updateOnboardingStep **après** add_member et assignRoles, dans le même try/catch et **avant** toast.success, notifyMembersChanged et close. L’exception est capturée et remplacée en FR par **« Impossible d’ajouter le membre »**, relevé par MutationObserver du conteneur Sonner. Il ne s’agit pas d’un simple toast invisible ou d’une promesse réseau de création encore pendante. Aucun délai supplémentaire ne résout cette branche.

Les deux parcours mobiles principaux reproduisent l’absence de succès et de retour. Dans chacun, un contrôle subséquent marque uniquement l’accueil fictif comme terminé dans le localStorage de son contexte navigateur, recharge la page et rejoue la création simulée : succès visible FR/EN et retour à `/lms/you`. Ce contrôle montre que Toaster/ToastProvider existent en mobile et fonctionnent ; il ne constitue **pas une correction produit**. Les captures mobiles finales et le champ toasts du résultat principal reflètent ce contrôle après rechargement ; les erreurs FR initiales sont conservées intégralement dans probe.json/debug.json. Le message générique d’échec EN initial n’a pas été capturé séparément avant ce rechargement : ne pas lui attribuer une assertion DOM inexistante.

**Défaut applicatif reproductible, antérieur à FR-03B.1.** Le handler de route est inchangé depuis 23e2bf5c ; diff vide entre la base B.1 736b1523 et le SHA publié pour les deux MemberForm. La modification ultérieure de AppSidebar porte sur un libellé de devoir, pas sur l’initialisation. La trace B.1 ne capturait pas cette exception aval ; son Failed to fetch d’onboarding bloqué ne prouvait pas à lui seul cette cause. Aucun lien avec une traduction ou une permission n’est établi.

Impact : création/attribution susceptibles d’avoir terminé avant un faux échec UI ; une nouvelle tentative pourrait répéter une opération déjà accomplie. Ce risque est démontré dans le flux simulé, **aucun doublon réel n’a été créé**.

Proposition de lot distinct, à autoriser : rendre l’initialisation de l’accueil indépendante du layout dans LMS et isoler son suivi de la confirmation métier, sans modifier les permissions, les appels add_member/save_role ou le Framework. Tester les ouvertures mobiles à froid, accueil vide/en cours/terminé, refus réel simulé et échec du suivi après succès métier. Ne pas simplement masquer l’exception ni relancer la création automatiquement. Aucun correctif réalisé dans FR-03V1.

## Interceptions, preuves et sécurité

Chromium existant, contextes neufs, ordinateur 1440×1000 et mobile 390×844. Langues natives des comptes synthétiques FR/EN conservées et document.lang vérifié. Toutes les interceptions installées avant navigation. Seuls login des comptes synthétiques, ping et get_translations continuent vers le site. Les lectures métier/session exposées à l’interface sont remplacées par des fixtures ; Framework/UI et assets proviennent du site de développement.

Tous les autres appels method sont bloqués par défaut ; REST /api/resource également bloqué. add_member, save_role, insert d’avis et mise à jour d’accueil sont localement fulfill, avec refus ou succès fictif. update_member et les autres écritures ne sont pas autorisés à passer. Aucun endpoint d’inscription, de paiement, de certificat ou d’email utilisé. L’authentification crée une session technique de test ; ce n’est pas une écriture de données métier.

Matrice principale : **26 appels sensibles simulés**, dont 8 insert d’avis (4 refus/4 succès), 10 add_member, 6 save_role et 2 update_user_onboarding_status. Les deux relectures mobiles de contrôle sont incluses dans ces nombres. Dix-huit boot_config de télémétrie bloqués ; aucun appel inconnu supplémentaire requis dans la matrice finale. **Zéro écriture sensible transmise au backend**, par liste de continuation limitée et traitement local de chaque écriture observée. Pas de transaction, attribution réelle de rôle, email, avis réel ou modification de contenu.

Preuves hors dépôt : `/workspace/work/fr03v1/` : browser.cjs, main.json/log, probe.json/log, debug.json/log, captures fictives et published-review.md. Les identifiants d’authentification existants sont seulement lus par le harnais, jamais inclus dans les traces/documents.

## Échecs intermédiaires et portée des vérifications

Huit parcours principaux, plus **trois parcours de diagnostic justifiés** : FR ordinateur avec tags invalide puis corrigé ; FR mobile reproduisant le faux échec ; FR mobile avec débogueur pour identifier l’exception capturée. Les deux contrôles d’accueil terminé sont des branches des parcours mobiles principaux. Pas de relance des neuf lots.

Le premier probe d’avis a aussi révélé deux insuffisances annexes de fixture : get_programs renvoyait un tableau au lieu de `{enrolled: [], published: []}` ; get_certification_details n’était pas simulé. Elles ont été corrigées uniquement dans le harnais. Quatre Failed to fetch liés à ces lectures bloquées et erreurs console de profil/programmes restent dans probe.json. Les erreurs de rendu Vue sont recherchées en console autant que via pageerror.

Matrice finale : zéro pageerror, **mais échec métier capturé dans le handler mobile**. Les logs console conservent les HTTP403 attendus des refus, des échecs réseau externes/tunnel, les boot_config bloqués et quelques socket HTTP400. Le diagnostic CDP inclut également des exceptions internes capturées de bibliothèques ; la pile onboarding ci-dessus est isolée par sa position après les réponses métier et son message visible. Aucun de ces résultats ne valide le contrôle JavaScript global.

Aucune suite Vue/backend, installation, build, compilation MO, génération POT, nettoyage de cache ou opération DB exécuté. Aucun test versionné modifié : le diagnostic est navigateur et le produit est inchangé. Empreintes des 39 PO LMS et du POT identiques à la revue ; 78 autres PO identiques aux empreintes historiques. Framework propre à 959b85de4086656273e1d158f41923dd3808c350. Diff final exclusivement documentaire, contrôle de secrets et git diff --check.

## Recommandation et limites conservées

**Option B — Correction complémentaire**, à décider par le responsable : la réserve d’avis est levée dans le périmètre fictif testé, mais le faux échec mobile est un défaut produit reproductible qui mérite un lot séparé avant clôture. L’état « accueil terminé » ne doit pas servir à déclarer les deux parcours mobiles entièrement réussis.

Conserver les 16 rejets JavaScript historiques, l’absence de validation JS globale, le double clic paiement, les transactions réelles non testées, la lecture des certificats, les légendes anglaises, les traductions administratives manquantes, l’association accessible de durée, les avertissements de suppression, dates/heures/fuseaux et les capacités de modération non confirmées. Aucune validation de permissions en production déduite des mocks. Ni clôture définitive de FR-03, ni début FR-04/I18N-01 autorisé.

Livraison : ce rapport et CODEX_HANDOFF.md, un commit documentaire local non publié. Prochaine action : décision sur le lot de correction mobile et sur la publication de cette validation ; aucune correction ou publication automatique.
