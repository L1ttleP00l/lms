# FR-02C.4 — Parcours apprenant de certification

30 octobre 2026 (Europe/Paris). Base propre publiée `8ea35b028eac4c37809d24ec598b609bb6829858`, branche exclusive `littlepool-dev`. Mission locale, aucun push/PR/Crowdin/déploiement.

## Corrections et matrice des états

| État fictif | Libellé FR / source anglaise | Destination / comportement préservé |
| --- | --- | --- |
| Inscrit, option payante non achetée, is_student | Acheter l'option certificat / Buy the certificate option | Billing, type certificate, même nom de cours |
| Option achetée, pas de certificat | Accéder à l'évaluation / Access the evaluation | CourseCertification, même courseName ; ne délivre rien |
| Certificat existant | Consulter le certificat / View Certificate | Branche prioritaire, fonction de consultation PDF inchangée ; aucun téléchargement pendant la recette |
| Sans membership ou sans droit étudiant, sans certificat | Aucun bouton d'achat | Conditions d'origine inchangées ; pas de nouvelle autorisation |
| Badge catalogue enable_certification | Certificat de fin de cours / Certificate of completion | Icône identique, texte sr-only et infobulle descriptifs identiques |
| Badge catalogue paid_certificate | Option certificat / Certificate option | Indique une possibilité, jamais un certificat acquis |
| Fin de cours, progression 0/99 | Bouton Obtenir le certificat absent | Même seuil 100 et enable_certification |
| Fin de cours, progression 100 | Obtenir le certificat / Get Certificate | Peut créer ou réutiliser un certificat selon le backend ; action non exécutée |
| Page, certificat déjà délivré | Phrase descriptive + Délivré le | Nom du cours/date conservés, carte et action PDF inchangées |
| Évaluations vides, évaluateur présent | Évaluations à venir, invitation et Planifier une évaluation | Même ouverture de modal et mêmes conditions |
| Évaluateur absent / nombre d’évaluations égal au nombre de cours évaluables | Action de planification masquée | Même logique canScheduleEvals ; aucune correction calendrier |
| Modal, aucun créneau / sélection absente | Aucun créneau disponible pour ce cours. / Sélectionnez un créneau pour votre évaluation. | Validation locale, aucune réservation |
| Modal, créneau fictif disponible | Plage horaire nommée | Valeurs système/affichage/fuseaux conservés, aucune soumission valide |
| Accès sans option achetée / erreur | Redirection vers cours / message spécifique prioritaire ou repli français | Redirections et resourceErrorMessage inchangés |

Deux mécanismes restent distincts et mutuellement exclusifs dans les fixtures cohérentes : enable_certification pour la fin de cours, paid_certificate pour l’option avec évaluation. Un achat ne délivre pas de certificat. Les données contradictoires entre ces mécanismes ne sont pas présentées comme un état métier valide.

Seules trois sources Vue changent : CertificationLinks (deux textes), CourseCard (libellé calculé pour infobulle/sr-only), UpcomingEvaluations (Schedule an evaluation). Conditions, ordre des branches, styles, routes, membership, handlers, appels de téléchargement, seuil de progression et métadonnées restent identiques. Comparaison textuelle à la base après neutralisation des seuls textes et du calcul de libellé : réussie. Aucune source Python applicative, CourseCardOverlay, CourseCertification ou EvaluationModal modifiée.

## Traductions et usages partagés

19 clés vérifiées : **18 valeurs nouvellement renseignées et Certification déjà correcte conservée**. Édition Babel limitée aux blocs ciblés, autres blocs et en-tête français conservés octet pour octet. Anglais source/secours maintenu, pas de dictionnaire runtime parallèle.

| Source | Français | État |
| --- | --- | --- |
| Certificate of completion | Certificat de fin de cours | Renseignée |
| Certification | Certification | Conservée |
| Certification is not enabled for this course. | La délivrance d'un certificat de fin de cours n'est pas activée pour ce cours. | Renseignée |
| Could not load this certification. | Impossible de charger les informations de certification. | Renseignée |
| Get Certificate | Obtenir le certificat | Renseignée |
| Issued On | Délivré le | Renseignée |
| No slots available for the selected course. | Aucun créneau disponible pour ce cours. | Renseignée |
| Please select a slot for your evaluation. | Sélectionnez un créneau pour votre évaluation. | Renseignée |
| Schedule an evaluation to get certified. | Planifiez une évaluation en vue d'obtenir votre certificat. | Renseignée |
| Schedule your evaluation | Planifiez votre évaluation | Renseignée |
| Upcoming Evaluations | Évaluations à venir | Renseignée |
| View Certificate | Consulter le certificat | Renseignée |
| You are already certified for this course. Click on the card below to open your certificate. | Un certificat vous a déjà été délivré pour ce cours. Sélectionnez la carte pour le consulter. | Renseignée |
| You are not enrolled in this course. | Vous n'êtes pas inscrit à ce cours. | Renseignée |
| You have not completed the course yet. | Vous n'avez pas encore terminé ce cours. | Renseignée |
| Buy the certificate option | Acheter l'option certificat | Renseignée |
| Access the evaluation | Accéder à l'évaluation | Renseignée |
| Certificate option | Option certificat | Renseignée |
| Schedule an evaluation | Planifier une évaluation | Renseignée |

Usages partagés vérifiés : View Certificate également dans Event (consultation d’un certificat) ; Issued On pour l’attribution de badges (Délivré le reste exact) ; You are not enrolled… également dans LMS Certificate Request (même refus d’inscription) ; Upcoming Evaluations aussi sur l’accueil et un template d’évaluations (titre générique exact). Les gabarits et courriels ne sont pas modifiés. Certification reste Certification. **Get Certified et Schedule globaux non traduits/remplacés** ; Get Certified reste dans CertifiedParticipants, Schedule dans Profile et Course Evaluator. Aucun écran administratif élargi au lot.

## Catalogues et environnement

- POT généré nativement par `bench generate-pot-file --app lms` : **2 993 → 2 997**, quatre ajouts : Buy the certificate option, Access the evaluation, Certificate option, Schedule an evaluation. **Aucune suppression**, sept références communes modifiées, toutes expliquées : quatre déplacements de lignes de compteurs CourseCard, ajout du lieu Certificate of completion, retrait des anciens lieux Get Certified et Schedule. Dates d’en-tête natives actualisées ; aucun changement imprévu de paramètre/contexte/indicateur. Diff intégral relu.
- PO **2 717 → 2 721 entrées**, **669 → 687 traductions renseignées**. Anciennes clés conservées, aucun nettoyage. Contrôles Babel, flags/contextes et paramètres réussis.
- 78 autres PO (38 LMS + 40 Framework) identiques aux empreintes de référence ; Framework propre à 959b85de4086656273e1d158f41923dd3808c350.
- Compilation native LMS/fr puis cache natif du seul site learning.localhost : réussis. **MO 687 messages**, 19 clés concordantes PO/MO/dictionnaire réel. Défaut fr et préférences préexistantes des comptes fictifs fr/en confirmés sans écriture de préférence.
- Build frontend nécessaire : **réussi, commande 17,94 s**. Déclarations components.d.ts/auto-imports.d.ts sauvegardées/restaurées après fin du build ; aucun asset/MO suivi. Avertissements habituels Vite/Browserslist/face-api, aucune installation ni configuration Docker modifiée.

## Tests réellement exécutés

### Vue

Nouveau certificationTranslations.test.ts : **22 cas FR/EN**, vrai plugin et valeurs du PO versionné dans le harnais. Ressources en mémoire, appels d’écriture interdits, openExternal simulé. Vérifie les trois branches/liaisons exactes et priorité d’un certificat existant, absence de droit/membership/données, badges et texte accessible, progression 0/99/100, page délivrée et date/nom, erreur spécifique/refus vs repli, redirection sans option, liste vide/remplie, absence d’évaluateur, modal vide/disponible et validation sans sélection. Aucune sélection suivie d’une réservation valide.

Tests existants courseCertification.test.ts (13) et upcomingEvaluationsNotice.test.ts (3) réutilisés. **Passage final : 38 tests / trois fichiers tous réussis en une exécution de 22,37 s**. Le test historique de PDF appelle seulement openExternal mocké, aucun réseau/PDF.

Échecs intermédiaires documentés : chargement du harnais bloqué par import indirect des utilitaires vers le routeur, puis lecture PO avec URL non file dans Vitest ; utilitaires externes simulés et lecture locale du PO corrigée. Passage suivant : 19 réussis/3 échecs (type select non déclaré dans le stub provoquant un avertissement ; assertion anglaise ambiguë car Schedule an evaluation est aussi le préfixe de la phrase vide). Correction des seuls mocks/sélecteurs, puis 38 réussis. Fixtures de fin de cours ensuite rendues cohérentes aussi dans la réponse certification simulée (paid_certificate=0) et passage final 38/38 ci-dessus. Aucun défaut applicatif masqué par suppression d’avertissement.

### Python

Nouveau test_certificate_messages.py, unittest sans site/DB : **une méthode, huit sous-cas FR/EN réussis en 0,040 s**. Refus inscription absente, certificat de fin de cours désactivé, progression 99, et acceptation 100 vérifiés avec vraies valeurs du PO et Frappe intégralement simulé dans le module. Seules méthodes DB exists/get_value attendues, aucun get_doc/sendmail, aucun create_certificate, save ou insert. Le chemin accepté ne crée rien : seule validate_certification_eligibility est appelée.

### Chromium

**Quatre parcours FR/EN × ordinateur 1440×1000 / mobile 390×844 réussis** : liens d’achat/évaluation et destinations, transition vers page d’évaluation, état vide et créneaux fictifs, nom accessible du dialogue, validation sans sélection, absence d’évaluateur, phrase/date d’un certificat délivré, seuil 50/100 du bouton de fin de cours. Captures des pages délivrées. Aucun clic de consultation de PDF ou de création de certificat, aucun achat ni réservation.

Garde API installée avant connexion et montage : **48 get_certification_details, 48 get_course_outline, 12 listes LMS Certificate Request et 8 get_schedule simulés** ; cours/détails/avis/relations fictifs également substitués. Écritures, paiements, certificats, callbacks, PDF et méthodes non explicitement autorisées bloqués. **Zéro requête sensible tentée et zéro transmise**, aucune donnée pédagogique, progression, inscription, option achetée, adresse, demande d’évaluation ou certificat modifié. Connexion/lectures natives de comptes fictifs seulement ; aucune donnée ou PDF d’apprenant réel.

Deux premiers essais interrompus sur attentes erronées du harnais : Submit est déjà Valider, et formatTime natif affiche AM/PM, pas 24 h. Sélecteurs corrigés uniquement, traces initiales conservées. Final quatre parcours complets : **zéro pageerror / zéro HTTP en erreur dans ce périmètre**, 28 appels boot_config bloqués sans réparation de télémétrie. Ce résultat **ne valide pas le contrôle JavaScript global** : les 16 rejets préexistants FR-02C.2 et la prévention du double clic restent ouverts, non corrigés/non masqués/non rejoués.

### Contrôles et non-exécutés

Prettier ciblé, Ruff lint/format du test Python, diff Git, invariants des sources, intégrité des catalogues et recherche ciblée de secrets réussis. Hooks globaux historiquement bloqués non relancés ; commits après vérifications ciblées avec hooks désactivés. Aucune suite complète, installation, transaction réelle, réservation/annulation, email, PDF, visiteur Guest ou lecteur d’écran exhaustif. Badge contrôlé au niveau composant (infobulle et sr-only), pas de survol Chromium distinct. Erreur de chargement/refus, droits non étudiant et liste d’évaluation remplie contrôlés en composant, pas provoqués en backend réel.

## Limites et suites distinctes

- Get Certificate peut encore réutiliser un certificat existant tout en restant libellé Obtenir : comportement conservé, pas de nouveau mécanisme de consultation.
- I18N-01 : mois Day.js, jours renvoyés par le calendrier, formats AM/PM et fuseaux non francisés globalement ; dates/fuseaux/stockage préservés. D’autres libellés du calendrier (Available Slots, All times in {0}, variantes de dates) restent à inventorier/traduire dans un lot autorisé ; ne pas revendiquer la traduction intégrale de chaque texte de créneau.
- FR-03 : gestion par formateurs/évaluateurs, participants certifiés, administration, autres Schedule/Get Certified et actions de réservation/annulation non élargis.
- FR-04 : modèles PDF, emails, gabarits de certificat et rendu de délivrance non modifiés/non testés.
- Les textes éditoriaux fictifs restent des données utilisateur, pas des clés gettext.

## Livraison locale

Code/tests : CertificationLinks.vue, CourseCard.vue, UpcomingEvaluations.vue, nouveau certificationTranslations.test.ts et test_certificate_messages.py. Catalogues : fr.po/main.pot. Documentation : ce rapport et CODEX_HANDOFF.md. **Commit source/tests : b6ec4644** ; commit catalogues/rapport/handoff à relever avec git log -1.

Preuves hors Git : /workspace/work/fr02c4/ (snapshots, plan et résumé de catalogue, génération/compilation, check.json/log, tests et échecs intermédiaires, build, harnais navigateur, browser.json et captures). Aucun identifiant sensible, cookie, compte, MO ou asset suivi. Checkout propre attendu après commit, distant inchangé à 8ea35b02 et develop à 6b791f33b34efa15566a0cb707f5be59d136df50. Aucun push. **Arrêt après FR-02C.4 : prochaine action, revue puis autorisation de publication ; aucun FR-03/FR-04 commencé.**
