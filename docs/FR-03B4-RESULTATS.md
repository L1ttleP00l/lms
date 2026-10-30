# FR-03B.4 — Cours, paramètres et publication

31 octobre 2026 (Europe/Paris). Branche exclusive littlepool-dev.

## Base réellement publiée

FR-03B.3 publié sur autorisation explicite, push normal de **bc0ce7723d7276d6e361057ac87d2a46808ce8b2** puis **224c78f96879386a2ec311a9772fbb8024681b69**. Distant initial 7b197f60 vérifié ; neuf fichiers attendus, 789 FR/3 006 POT, trois ajouts/deux retraits expliqués, historique PO, 78 empreintes et Framework intacts. Preuves 238 Vue/cinq extraction/sept simulations de permission/quatre Chromium relues sans relance pour publier. Rapport GitHub comparé identique ; checkout propre et aligné, develop toujours 6b791f33b34efa15566a0cb707f5be59d136df50. **224c78f9 est la base de FR-03B.4. Aucun push de ce nouveau lot.**

Reprise AGENTS/handoff, audit FR-03A, rapport FR-03B3, glossaire et plan. Dépendances, conteneurs et learning.localhost réutilisés ; aucune installation, réinitialisation, modification Framework ou production.

## Périmètre et changement applicatif minimal

Paramètres de visibilité/inscription/progression, tarification et options certificat, publication, avertissement de suppression et tableau de bord. Les appels natifs __ sont déjà présents ; aucune réécriture des composants enfants pour traduire deux fois. **Une seule source modifiée : CourseDashboard.vue remplace le titre Enrolled par Enrolled learners.** Calculs, requêtes, filtres, routes et structures restent identiques.

La clé partagée Enrolled sert aussi d’onglet des sessions/parcours auxquels l’utilisateur est inscrit (Batches.vue/StudentPrograms.vue) : « Inscrits » convient mal à cet objet, tandis que le graphique compte des apprenants. **La clé globale et sa valeur vide sont conservées**, sans imposer une traduction aux autres écrans ; le titre ciblé devient « Apprenants inscrits ». Ce choix évite une ambiguïté réelle, pas une simple préférence stylistique. Décision prise lors de la revue des usages partagés avant commit ; traduction intermédiaire globale retirée du candidat avant livraison.

Aucune autre source applicative modifiée : CoursePublishSettings.vue, CourseForm.vue, CourseDetail.vue, utils/courseForm.ts, utils/resource.ts, api.py, permissions.py, utils.py et contrôleur LMS Course conservés. Aucun debounce, verrouillage, gestionnaire d’erreur, condition/permission, identifiant, modèle PDF, route, lien ou paramètre technique changé.

## Traductions livrées

**57 nouvelles valeurs françaises**, aucune des **789 traductions précédentes** corrigée ou supprimée. Le volume dépasse l’indication 10–15 : descriptions, erreurs, noms accessibles et validations des options explicitement demandées sont inclus. Aucun autre lot administratif/éditeur général étendu. EN reste source/repli, préférence utilisateur prioritaire, langue système configurable.

| Clé anglaise exacte | Français final |
| --- | --- |
| Not yet open for enrollment. | Les inscriptions ne sont pas encore ouvertes. |
| Highlight on the homepage. | Mettre en avant sur la page d'accueil. |
| Self enrollment | Inscription autonome |
| Let users enroll themselves. | Permettre aux utilisateurs de s'inscrire eux-mêmes. |
| Enforce Lesson Completion | Imposer l'achèvement des leçons |
| Students must complete each lesson before the next one opens. | Les apprenants doivent terminer chaque leçon pour accéder à la suivante. |
| Pricing and certification | Tarification et certificats |
| Paid course | Cours payant |
| Charge learners to enroll in this course. | Faire payer l'inscription à ce cours. |
| Select currency | Sélectionner une devise |
| Course price | Prix du cours |
| Completion certificate | Certificat de fin de cours |
| Issue a free certificate when learners complete the course. | Délivrer un certificat gratuit aux apprenants qui terminent le cours. |
| Paid certificate | Option certificat payante |
| Sell an evaluator-graded certificate alongside this free course. | Proposer une option certificat payante avec évaluation pour ce cours gratuit. |
| Certificate price | Prix de l'option certificat |
| Select evaluator | Sélectionner un évaluateur |
| Timezone | Fuseau horaire |
| Select timezone | Sélectionner un fuseau horaire |
| Certificates render from a Print Format. Build or customize templates from the desk. | Les certificats utilisent un format d'impression. Créez ou personnalisez leurs modèles depuis le bureau Frappe. |
| Manage templates | Gérer les modèles |
| Payments app required | Application Payments requise |
| Get the Payments app | Obtenir l'application Payments |
| Selling a paid course or certificate needs the Payments app. Install it from the Frappe Marketplace, then turn on pricing here. | La vente d'un cours ou d'une option certificat nécessite l'application Payments. Installez-la depuis Frappe Marketplace, puis activez la tarification ici. |
| Course updated successfully | Cours mis à jour avec succès |
| Course deleted successfully | Cours supprimé avec succès |
| Delete Course | Supprimer le cours |
| Deleting the course will also delete all its chapters and lessons. Are you sure you want to delete this course? | La suppression du cours supprimera également tous ses chapitres et toutes ses leçons. Voulez-vous vraiment supprimer ce cours ? |
| Course options | Options du cours |
| No changes to save | Aucune modification à enregistrer |
| Course published | Cours publié |
| Course unpublished | Cours dépublié |
| These quizzes have no questions, so learners skip them: {0} | Ces quiz ne contiennent aucune question ; les apprenants peuvent les passer sans répondre : {0} |
| Could not update publish status | Impossible de modifier le statut de publication |
| Unpublish course | Dépublier le cours |
| Publish course | Publier le cours |
| Lessons | Leçons |
| Average Completion Rate | Taux moyen d'achèvement |
| No students enrolled yet | Aucun apprenant inscrit pour le moment |
| Enroll students to track their progress here | Inscrivez des apprenants pour suivre leur progression ici |
| Search students | Rechercher des apprenants |
| No students match your search | Aucun apprenant ne correspond à votre recherche |
| Try a different name | Essayez un autre nom |
| Progress Summary | Résumé de la progression |
| Lesson Completion | Achèvement des leçons |
| Sort by | Trier par |
| Enrolled On | Date d'inscription |
| Lesson Index | Ordre des leçons |
| Completion Rate | Taux d'achèvement |
| Add a {0} before saving. | Renseignez le champ « {0} » avant d’enregistrer. |
| Short Introduction | Brève présentation |
| Add at least one {0} before saving. | Ajoutez au moins un {0} avant d’enregistrer. |
| paid courses | les cours payants |
| paid certificates | les options certificat payantes |
| Currency is required for {0}. | La devise est obligatoire pour {0}. |
| Price must be a positive number for {0}. | Le prix doit être un nombre strictement positif pour {0}. |
| Enrolled learners | Apprenants inscrits |

### Usages partagés et textes conservés

Visibility/Visibilité, Upcoming/À venir, Featured/En vedette, Currency/Devise, Evaluator/Évaluateur et autres traductions correctes conservées. Featured est aussi utilisé par les cartes de cours : aucun remplacement cosmétique par Mis en avant. No students enrolled yet est partagé avec AdminBatchDashboard (deux emplacements), et la traduction reste pertinente pour les apprenants d’une session. Lessons → Leçons convient aux cartes, infobulles et parcours ; Sort by → Trier par est générique. Add a {0} before saving. sert aussi aux autres formulaires : « Renseignez le champ… » conserve le paramètre et évite les accords liés au genre du champ. Certificate price apparaît ici dans le tarif de l’option payante, pas dans un état de délivrance. Les données de nom, description, leçon, apprenant, prix, devise et fuseau ne sont pas traduites ni modifiées.

Les premières recettes avaient temporairement Enrolled → Inscrits dans le dictionnaire de travail ; cette valeur ne fait pas partie de la livraison. Les assertions et recettes complémentaires vérifient la clé contextualisée après le build final.

## Publication, certificats, permissions et suppression

### Publication et visibilité

CourseDetail conserve le bouton Publier/Dépublier sur ordinateur et le menu Publier le cours/Dépublier le cours sur mobile, **uniquement sous is_moderator**. Statut publié, loading, succès, erreur et avertissement de quiz sans question préservés. La publication simulée renvoie __onload.quizzes_without_questions ; titre fictif interpolé intact. Aucune nouvelle confirmation de publication inventée : les mécanismes existants sont conservés.

Un formateur affecté accède aux paramètres mais n’obtient pas ce bouton. Le rôle Course Creator seul ne prouve pas une affectation au cours. CourseForm conserve ses contrôles de rôle puis d’appartenance aux instructors ; can_author_course/can_modify_course, DocPerm/hooks inchangés. Le backend delete_course appelle can_modify_course ; l’accès UI ne certifie pas les permissions serveur. Les tests simulent Moderator, formateur affecté, Course Creator non affecté, évaluateur et apprenant, sans attribution de rôle réelle.

### Certificats et Payments

- enable_certification = certificat gratuit de fin de cours ; paid_certificate = option payante avec évaluation. Achat/activation ≠ certificat délivré.
- L’activation paid_course désactive paid_certificate comme auparavant. Le contrôleur interdit enable_certification et paid_certificate simultanés, exige évaluateur/fuseau pour l’option payante et montant/devise pour les modes payants. Aucune contrainte assouplie ou « corrigée » pour faciliter les tests.
- Payments manquant : dialogue, texte et action traduits ; la garde n’active pas le mode payant. Deux tests FR/EN vérifient ce cas sans ouvrir le lien externe. L’URL Marketplace et le lien de gestion des formats d’impression sont identiques, jamais cliqués dans les recettes. Aucune application installée, passerelle configurée ou modèle PDF modifié.

### Suppression : limite de l’avertissement existant

Dialogue Supprimer le cours, message, bouton destructif et annulation vérifiés en FR/EN ordinateur/mobile. **Aucun clic de confirmation, aucun appel delete_course, même simulé dans le navigateur.** Tests de composant inspectent les callbacks de succès/erreur séparément sans invoquer l’action destructive.

**La portée réelle est plus large que les chapitres/leçons cités par le texte source.** delete_course supprime aussi inscriptions, progression, durées vidéo, certificats/demandes/évaluations de certificat, intérêts, associations de mentor/session/parcours/cours liés, avis et discussions des leçons. Quiz/devoirs et travaux remis sont désassociés plutôt que tous supprimés. Le texte français traduit fidèlement l’avertissement existant mais ne constitue pas un inventaire complet de ces conséquences. Ce risque de contenu est signalé pour une future clarification anglaise/UX explicitement validée ; aucune nouvelle promesse d’innocuité ajoutée, aucune logique de suppression changée.

## Catalogues et activation

- PO **2 802 → 2 808 entrées**, **789 → 846 valeurs renseignées** : six entrées manquantes ajoutées depuis le POT (dont Enrolled learners et cinq validations TypeScript), 51 entrées existantes vides renseignées. Babel contrôlé, en-tête/blocs hors cible conservés à l’octet, toutes les anciennes valeurs préservées. Aucun nettoyage historique.
- POT natif **3 006 → 3 007**, **un ajout et zéro suppression** : Enrolled learners. La référence CourseDashboard est retirée de la clé Enrolled, toujours présente dans trois autres fichiers (**un changement de références commun**). Seules dates d’en-tête natives en plus ; pas de modification manuelle du POT, de chaîne parasite ou de perte inexpliquée. Les dates natives sont en UTC, d’où le 30 octobre dans l’en-tête.
- Babel PO/POT, paramètres {0}, contextes/flags, conservation des blocs et 78 autres PO (38 LMS + 40 Framework) contrôlés ; Framework propre à 959b85de4086656273e1d158f41923dd3808c350.
- Compilation native `bench compile-po-to-mo --app lms --locale fr`, puis `bench --site learning.localhost execute frappe.translate.clear_cache` réussies. Nouvelle compilation après contextualisation finale. **MO 846**, **57 valeurs finales identiques PO/MO/dictionnaire chargé** ; préférences fictives fr/en et défaut système fr inchangés. Aucun dictionnaire runtime parallèle, Crowdin ou update-po-files.

## Tests ciblés exécutés

**Passage final après contextualisation : 42 tests / cinq fichiers réussis en une exécution de 11,04 s** (25 cas nouveaux, 17 existants) :

- coursePublishSettings : trois cas existants, huit FR/EN supplémentaires (cours gratuit/payant/option certificat, labels/descriptions, self enrollment, maintien des champs et exclusivité paid_course, Payments manquant sans lien externe).
- coursePublishEmptyQuizWarning : deux existants, quatre FR/EN publication/dépublication, titre du quiz/paramètre et erreur de repli/serveur ; ressources et callbacks en mémoire.
- courseManagementTranslations nouveau : treize cas — avertissement de suppression sans action, autosave différé 1 000 ms entièrement mocké, sauvegarde explicite/succès/erreur, dashboard vide/recherche/filtres/moyenne, validation gratuite/payante/certificat et cinq gardes UX de rôles/affectation. Lit le vrai PO avec le plugin natif. Aucun endpoint réel.
- courseDetailOutlet et newCourseForm inchangés : routes/outlet/reload et création/validation/refus fictifs réutilisés. Les autres suites de traduction apprenant inchangées ne sont pas rejouées.

Première préparation : erreur de syntaxe de guillemets dans un template de test, corrigée avant exécution. Premier passage **23 réussis / 10 échoués** : stubs anonymes FormControl/Dialog non remplacés, $dialog non installé sur globalProperties, liste du harnais non réactive, et journal d’erreur attendu par le code natif. Harnais corrigés, sans modification de logique applicative. Le journal attendu est intercepté et **explicitement asserté** seulement dans le test de refus fictif, pas masqué globalement. Passages intermédiaires **35/37** (injection dayjs absente dans les deux cas Payments, dont une relance commencée avant correction), puis **37/37**, ajout des cinq gardes → **42/42** ; après nouveau titre, passage final complet **42/42** ci-dessus. Aucun échec restant dans cette sélection ; ne pas déduire la réussite d’une suite globale.

**Build nécessaire après le seul changement de titre : réussi, commande 13,56 s.** Déclarations components.d.ts/auto-imports.d.ts restaurées ; assets/MO ignorés. Avertissements Vite/Browserslist/fs préexistants conservés. Prettier, diff/invariants et secrets : contrôles ciblés réussis. Pas de suite Python backend : aucune logique Python changée ; Python/Babel utilisé pour les contrôles de catalogues et du dictionnaire. Pas de réinstallation ni suite globale/pre-commit complet historiquement bloqué.

## Chromium et interceptions : portée exacte

### Quatre parcours complets

**Quatre parcours FR/EN × 1440×1000 / 390×844 terminés dans une exécution** : paramètres, self enrollment, cours payant et champ de prix, option certificat et prix, certificat de fin de cours, publication puis dépublication fictives, avertissement de quiz vide, dialogue de suppression/annulation, dashboard sans inscription puis apprenant fictif et recherche sans résultat ; formateur affecté sans action de publication après rechargement. La version testée à ce stade différait de la finale uniquement par le titre compteur Enrolled/Inscrits ensuite contextualisé et sa traduction, aucun handler/chemin de ces parcours n’a changé.

**16 autosaves + 16 mises à jour de métadonnées + 8 publications/dépublications entièrement fulfill localement**, soit **40 tentatives d’écriture simulées autorisées**, **zéro transmise au backend**. Ne pas écrire « zéro appel d’écriture » : les appels existent et sont interceptés. Toutes les lectures sensibles du cours/document, utilisateurs/formateurs, paramètres, prix, progression/liste/tri, fuseaux et recherches sont simulées avant montage. Seuls auth/ping/traductions vont au site. REST /api/resource et toute autre méthode non explicitement admise sont bloqués ; suppression, chapitre/leçon, inscription, paiement/certificat, notifications et méthode inconnue interdits. **Zéro endpoint sensible imprévu tenté, zéro delete_course appelé.** Aucun document LMS Course réel, métadonnée, inscription, paiement, prix ou certificat enregistré ; authentification de comptes fictifs uniquement, aucun rôle serveur modifié.

Recette complète : **zéro pageerror**, **une réponse HTTP 400 socket.io**, **12 boot_config bloqués**. Ces résultats ciblés ne valident pas le contrôle JavaScript global ni une publication effective.

Premiers essais interrompus : panneau d’onboarding recouvrant les interrupteurs, bouton Close trop générique attrapant une notification qui disparaissait, et acteur fictif changé sans rechargement conservant le store gestionnaire. Harnais limité au panneau natif puis état client natif « onboarding terminé » simulé (localStorage dans le contexte jetable), Close ciblé, recherche de formateurs fictive fournie, rechargement explicite de l’acteur. Deux Failed to fetch initiaux provenaient de lectures de formateurs bloquées. Aucun clic forcé ni changement de permission/app pour contourner ces problèmes ; traces initiales conservées.

### Vérification complémentaire après build final

**Quatre parcours supplémentaires FR/EN ordinateur/mobile, en lecture seule**, vérifient Enrolled learners/Apprenants inscrits et le taux moyen après le build/compilation finaux, sans répéter les opérations déjà validées. Zéro écriture même simulée dans cette recette. Les deux recettes et leurs journaux sont distincts ; le contrôle complémentaire ne remplace pas ni ne prétend réexécuter tous les scénarios de la recette complète.

Le dialogue Payments manquant et les erreurs de sauvegarde/publication restent vérifiés au niveau composant, pas tous rejoués dans Chromium. Le navigateur utilise un état Payments installé fictif et un cours modifiable fictif, aucune preuve des autorisations effectives du backend. Les descriptions complètes et attributs sont testés, pas une validation exhaustive lecteur d’écran. Formats de dates/heures non modifiés.

## Limites et sujets suivants

Conserver : toast mobile FR-03B.1 non confirmé, 16 rejets JS préexistants, contrôle JS global non validé, risque double clic paiement, transactions/encaissements réels non testés, dates/heures I18N-01. Aucun correctif de ces sujets.

Ce lot ne garantit pas la francisation intégrale de l’éditeur : Course details, Course editor, certains champs/SEO/médias/onboarding et catégories de progression provenant des données restent à inventorier/traiter dans les lots autorisés. Les noms des catégories du graphique sont aussi utilisés par la logique de couleurs ; aucun remplacement naïf des données. Publication effective/permissions réelles, échecs serveur non simulés, emails/PDF FR-04 et clarification exhaustive de la confirmation destructive restent non validés. Sessions et autres interfaces à traiter selon FR-03B.5 et le plan, **sans commencer ce lot ici**.

## Livraison locale et reprise

Huit fichiers attendus : CourseDashboard.vue ; trois tests coursePublishSettings/coursePublishEmptyQuizWarning/courseManagementTranslations ; fr.po/main.pot ; ce rapport et CODEX_HANDOFF.md. Commit sources/tests **18d0d021** ; second commit catalogues/rapport/handoff, SHA à relever avec git log -1 ; aucun push de FR-03B.4.

Preuves hors dépôt `/workspace/work/fr03b4/` : snapshots, translations/plan/summary, usages partagés, logs Vue initiaux/final, génération/compilations/check final, build, browser-full et browser-header distincts, essais initiaux/debug et captures fictives. Aucun secret, cookie, identifiant d’authentification ou fichier généré ajouté au dépôt. develop et Framework inchangés. Prochaine action : revue des commits et autorisation explicite avant publication ; aucune PR, Crowdin, production OMV 8 ou phase suivante.
