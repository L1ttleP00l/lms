# FR-02C — Audit des inscriptions, paiements et certificats

30 octobre 2026 (Europe/Paris), `L1ttleP00l/lms`, branche exclusive `littlepool-dev`. Base initiale **2c2ffd6cbc4f977ba5d4452cc627012768831963**, propre et identique au distant vérifié. FR-02B.1 à FR-02B.4 publiés. **Audit documentaire uniquement : aucune correction, inscription, transaction ou délivrance.**

## 1. Méthode, preuves et état de l’environnement

AGENTS, handoff, ROADMAP, PLAN_FRANCISATION, glossaire et rapports FR-02 précédents réutilisés. Le découpage historique de ROADMAP prime : parcours apprenant en FR-02, gestion/formateurs en FR-03, courriels et rendu PDF/certificats en FR-04. Les mentions anciennes « phase non commencée » de ces documents ne remplacent pas les résultats publiés.

- **[C] Confirmé par le code** : conditions Vue, appels automatiques, contrôleurs et permissions directement associés, extraction des clés et provenance. Cela ne prouve pas une transaction exécutée.
- **[M] Disponible dans les MO conservés** : lecture locale, sans service, des catalogues français compilés Frappe puis LMS, rapprochée de fr.po et main.pot. Une valeur compilée n’est pas une preuve du dictionnaire actuellement chargé ou d’un rendu.
- **[O] Observé au navigateur pendant FR-02C : aucun cas.** Les observations FR-02B publiées restent historiques et ne testaient pas un paiement ni une délivrance.
- **[S] Simulé pendant FR-02C : aucun cas.** Les scénarios ci-dessous sont des matrices de code, pas des tests de rendu.
- **[NV] Non vérifié en fonctionnement** : transactions, passerelle installée/configurée sur le site, annulation/retour réels, factures, émission/lecture PDF, langue effective des erreurs serveur, bureaux/mobile de ces nouveaux écrans.

Le conteneur lms-bench est **arrêté après restauration**. Une tentative de lecture du dictionnaire dans ce conteneur a échoué avant exécution Python (« container is not running »). Aucun service redémarré, aucune réinstallation, connexion DB ou préférence modifiée. La documentation locale de démarrage a seulement été lue. L’audit est poursuivi hors ligne, sans opération coûteuse ; une mesure du dictionnaire courant reste à faire sur environnement actif avant corrections/recette. Aucune lecture de compte, d’adresse personnelle ou de secret.

État vérifié : **637 traductions renseignées / 2 706 entrées PO LMS ; 2 985 clés POT**. Ne pas déduire le nombre de traductions manquantes par une simple soustraction : PO historiques, contributions Framework et contextes diffèrent. Les 79 PO des deux applications, le POT et les sources sont conservés. Aucun build, compilation, test applicatif, paiement ou navigateur lancé pendant cet audit.

## 2. Cartographie et responsabilités

| Parcours | Présentation et transition [C] | Serveur direct [C] | Limite importante |
| --- | --- | --- | --- |
| Auto-inscription | CourseCardOverlay → Enroll Now → insertion LMS Enrollment → leçon | LMSEnrollment.before_insert/validate, permissions natives du DocType | Inscription réelle, compteurs et progression de parcours peuvent être modifiés ; ne pas cliquer pendant l’audit |
| Achat de cours | Buy this course → Billing(type=course) → validation/récapitulatif → lien externe | validate_billing_access, get_order_summary, get_payment_link puis contrôleur Payments et callbacks | Acheter et s’inscrire ne sont pas des opérations de lecture |
| Option certificat payante | CertificationLinks.Get Certified → Billing(type=certificate) | Paiement puis update_certificate_purchase ; peut aussi créer l’inscription manquante | Achète un droit ; ne délivre pas le certificat |
| Évaluation après achat | Second Get Certified → CourseCertification → UpcomingEvaluations/EvaluationModal | get_certification_details, get_schedule, insertion LMS Certificate Request ; annulation via cancel_evaluation | Réserver ou annuler écrit et peut notifier ; ne garantit pas la réussite ni la délivrance |
| Certificat de fin de cours | Get Certificate lorsque progression ≥100 et enable_certification | create_certificate : réutilise l’existant ou valide puis insère LMS Certificate | Création suivie d’ouverture PDF ; ce bouton n’est pas une simple consultation |
| Certificat existant | View Certificate / carte de CourseCertification | get_latest_certificate puis frappe.utils.print_format.download_pdf | Ouvre un PDF, sans présumer qu’il est public ; aucun téléchargement réalisé |
| Inscription par personnel | CourseEnrollmentForm → EnrollStudentsForm et helpers enrollment.ts | enroll_students_in_course, bulk_enrollment, LMSEnrollment ; éventuellement paiements/adresses | Dépendance FR-03, pas parcours d’auto-inscription de l’apprenant |

### États d’inscription et rôles

| Acteur / état | Rendu et action déduits du code [C] | Validation côté serveur / conséquence |
| --- | --- | --- |
| Visiteur, cours gratuit et ouvert | Enroll Now peut être présenté ; le clic avertit de se connecter et redirige vers login | Aucun insert dans cette branche du gestionnaire ; l’accès au catalogue reste dépendant des règles Guest du site |
| Visiteur, cours payant | Buy this course précède la branche de connexion et mène à Billing | Billing affiche un refus/login sans user.data ; validate_billing_access n’autorise pas Guest |
| Connecté, non inscrit, gratuit | Enroll Now si non administrateur du cours et inscription libre | Identité du membre imposée au demandeur, doublon refusé, publication et inscription libre contrôlées |
| Connecté, non inscrit, payant | Buy this course, même si disable_self_learning est également vrai : priorité du v-else-if payant | Contrôleur d’inscription vérifie encore inscription libre et paiement reçu ; la seule présence du bouton n’assure pas la possibilité finale d’inscription |
| Inscription libre désactivée, non payé | Avertissement Contact the Administrator dans la branche non payante | Le contrôleur refuse l’auto-inscription ; exemption pour personnel autorisé et parcours de session validé |
| Déjà inscrit | Start/Continue Learning, progression et CertificationLinks | Pas de seconde auto-inscription proposée ; tentative directe de doublon refusée. Bibliothèque de formulaires de gestion distincte |
| Formateur du cours / gestionnaire | Boutons d’auto-inscription masqués par isAdmin ; formulaire d’ajout sur parcours de gestion | can_enroll_others/can_record_payments pour un cours délèguent à can_author_course : administrateur du site, Moderator ou auteur effectif du cours. Le rôle Course Creator seul ne donne pas tous les cours |
| Apprenant tentant d’inscrire autrui | Pas de formulaire autorisé ; refus UX si URL directe | enforce_member_ownership et contrôles API restent les limites de sécurité, pas le masquage Vue |
| Erreur d’inscription | Succès, permission, doublon, paiement requis et repli réseau distincts | Le catch de l’overlay fournit encore le fallback brut 'Error', alors que sa traduction Erreur existe |
| Mode lecture seule | L’overlay masque ses actions ; CourseEnrollmentForm fournit un refus | Garde UX observée dans le code ; pas de certification générale de l’immutabilité de toutes les API |

Les contrôleurs empêchent le changement de course/member/enrollment_from_batch après inscription et rétablissent progress/purchased_certificate pour un demandeur non gestionnaire. Une inscription peut aussi mettre à jour les compteurs de cours et la progression d’un parcours : aucun insert « de test » n’est anodin.

### Inscription multiple : dépendances FR-03

MAX_STUDENTS=50, choix/déduplication de comptes, contrôle/aperçu, paiement commun ou individuel, liaison à un paiement existant, adresse et confirmations par résultat. Preview/search sont distincts de la soumission. enroll_each utilise un savepoint par membre et renvoie added/upgraded/errors : une réussite partielle doit rester une réussite partielle dans le texte français.

paidKind course/batch active l’enregistrement par défaut ; certificate ne l’active pas de la même façon. « Record payments » crée des enregistrements marqués reçus par le personnel autorisé ; ce n’est pas l’encaissement via une passerelle. « Students get the certificate… » est trop affirmatif : l’opération active purchased_certificate, elle n’émet pas un LMS Certificate. Les huit clés FR-01F de résultats/actions sont déjà traduites ; aucune régression n’est déduite ni test répétée ici. Les formulaires de gestion et leur validation complète restent FR-03.

## 3. Paiements : scénarios et effets

| Scénario [C] | Comportement établi par lecture | Ce qui n’a pas été vérifié |
| --- | --- | --- |
| Achat du cours | Billing(type=course), LMS Course ; course_price, currency et pays servent au récapitulatif | Aucun paiement ni calcul réel sur les données du site |
| Achat de l’option certificat | Billing(type=certificate) utilise le même LMS Course et payment_for_certificate=1 ; le type ne doit pas apparaître brut dans une phrase française | Pas de lien demandé ; pas de certificat créé |
| Montant positif | get_controller valide l’installation et la passerelle avant record_payment ; contrôleur crée le lien/ordre externe | Disponibilité, configuration, devises et intégration externes non testées |
| Code de réduction | get_order_summary → apply_coupon vérifie code activé, expiration, limite d’usage et applicabilité ; remise plafonnée au montant | Aucun coupon soumis, aucune consommation ou modification de coupon |
| Total nul après remise | Pas de contrôleur de passerelle ; LMS Payment est créé/marqué reçu, complete_enrollment puis redirection | **Ce chemin écrit réellement même sans carte bancaire** ; Enroll for Free n’est pas neutre pour une option certificat |
| Accès déjà acquis | validate_billing_access renvoie un refus ; get_payment_link a aussi une garde indépendante de paiement répété | La garde de get_payment_link conserve néanmoins l’adresse via save_address : ne jamais l’utiliser comme une sonde |
| Passerelle absente/invalide | Exceptions traduites avec titre constant Payment Gateway Not Configured ; avant création de paiement/adresse pour un total positif | Aucun appel effectué pour provoquer l’erreur |
| Succès/retour | LMSCourse.on_payment_authorized accepte Authorized/Completed puis update_payment_record ; vérification du callback, déduplication, reprise différée, finalisation et consommation du coupon | Aucun callback, signature, retour ou replay testé ; ne pas présenter l’idempotence comme validée en transaction |
| Échec/annulation | Billing affiche les erreurs via showError ; retour/cancel du fournisseur dépend du contrôleur installé | Pas d’écran local universel de paiement annulé établi ; aucun statut bancaire simulé ou affirmé |

**Défauts/risques fonctionnels confirmés par le code, non reproduits en navigateur :**

- Refus de Billing(type=certificate) : le bouton de retour teste seulement type == course, puis utilise Checkout Batch et /batches/{name} pour le certificat. C’est un défaut de contexte et de destination, pas une traduction à corriger par un remplacement global de Batch.
- Payment for suivi de props.type affiche un identifiant brut course/certificate/batch. Traduire le préfixe seul ne suffit pas.
- Le total nul propose Enroll for Free aussi pour l’option certificat ; distinguer validation sans paiement, activation d’option et inscription.
- Consentement : deux clés anglaises ne diffèrent que par le point final ; l’une alimente l’erreur du champ, l’autre la validation. Elles doivent rester couvertes ensemble, sans perte de sens ni promesse juridique automatique.
- Les champs Billing Name/Address/City/State/Country/Postal Code/Phone/Source et, pour India, GST/PAN, utilisent __() ; leur validation reconstruit toutefois un nom de champ technique en anglais. GST ne doit pas devenir TVA sans décision fiscale. Les règles pays/devises et la légalité du consentement restent des décisions distinctes de traduction.
- Le bouton de paiement n’est pas lié à paymentLink.loading par :loading/:disabled dans Billing. Risque d’attente ambiguë ou de double clic à examiner dans une recette autorisée, sans changer ici l’idempotence serveur ni prétendre à une double facturation observée.

## 4. Certificats : matrice des états

Deux mécanismes **mutuellement exclusifs** sont validés par LMSCourse.validate_certification : enable_certification (fin de cours) et paid_certificate (parcours avec évaluateur). Le mode payant impose un évaluateur, un fuseau et des informations de prix. Il ne faut donc pas fabriquer une anomalie supposant ces deux options activées ensemble dans un document valide.

| État [C] | Certificat de fin de cours enable_certification | Option payante paid_certificate |
| --- | --- | --- |
| Non inscrit, sans certificat existant | create_certificate refuse ; l’interface n’a pas de progression membre permettant le bouton | CertificationLinks est placé dans la branche membre ; l’absence de CTA n’est pas un accès universel à acheter |
| Inscrit, incomplet | Get Certificate masqué ; validation serveur progression <100 | CTA achat si option non achetée, pour is_student ; pas de garantie de progression terminée par ce CTA |
| Formation terminée | Get Certificate visible : peut créer le certificat puis ouvrir le PDF | La progression seule ne crée ni achat ni certificat ; passage par l’option et l’évaluation |
| Option non achetée | Sans objet pour ce mécanisme | Premier Get Certified → Billing(type=certificate), achat d’un droit |
| Option achetée | Sans objet | Second Get Certified → CourseCertification ; accès aux informations d’évaluation, pas émission immédiate |
| Évaluation nécessaire | Pas le mécanisme employé pour create_certificate | CourseCertification monte UpcomingEvaluations ; réserver insère LMS Certificate Request ; étapes ultérieures relèvent de l’évaluateur |
| Certificat déjà délivré | create_certificate renvoie l’existant ; le bouton garde Get Certificate, pas un texte distinct de consultation | CertificationLinks donne priorité à certificate et affiche View Certificate ; la carte de CourseCertification ouvre le PDF |
| Accès refusé / cours privé | Validation d’inscription/critères et permissions natives du certificat | get_certification_details contrôle la visibilité du cours ; CourseCertification redirige sans membership.purchased_certificate, même si le document de certificat existe |
| Évaluateur absent / configuration ancienne | Sans objet | Document normalement interdit par la validation de cours ; comportement de données historiques incohérentes non vérifié |

get_certification_details est une lecture agrégée : titre, membre/droit acheté, présence d’évaluateur, dernier certificat. get_latest_certificate préfère un certificat de cours sans session, sinon le plus récent ; la présence de ce résultat ne prouve ni l’impression autorisée pour tout acteur ni un statut public.

Les contraintes du parcours payé ne doivent pas être inférées seulement du CTA : LMSCertificateRequest vérifie notamment l’appartenance du membre, l’évaluateur, le créneau et les champs serveur ; le verrou UX purchased_certificate de CourseCertification n’est pas à lui seul une preuve de contrôle de toutes les API. Aucune tentative de contournement effectuée. L’évaluation et l’émission par personnel sont reliées à save_evaluation_details/save_certificate_details avec contrôles de rôle et d’évaluateur ; ce sont des responsabilités FR-03.

**Arbitrages proposés, sans adoption ni modification :**

- Get Certified ne doit pas recevoir une traduction unique « Être certifié ». Distinguer « Acheter l’option certificat » et, après achat, « Accéder à l’évaluation » (ou une étape intermédiaire explicitement nommée).
- Get Certificate → « Obtenir le certificat » pour une action pouvant créer le document ; View Certificate → « Consulter le certificat » pour l’existant, avec indication du PDF si utile.
- Certificate of completion → « Certificat de fin de cours », sans reconnaissance officielle implicite.
- Certification : titre du parcours de validation, à distinguer de « Avec certificat » (filtre déjà corrigé). Ne pas changer cette clé partout.
- Issued On : « Délivré le ». La date affichée utilise Day.js DD MMM YYYY ; la locale générale reste I18N-01 et n’a pas été modifiée.

## 5. Appels automatiques et actions à bloquer pour une future recette

Aucun parcours navigateur n’a été entrepris, donc aucune requête métier n’a été envoyée. Avant une recette future, préférer une interception totale des /api/method/* avec liste explicite de lectures simulées, plutôt qu’un simple blocage du bouton final. Ne pas rejouer une URL de retour d’une passerelle.

| Écran | Lectures automatiques identifiées [C] | Actions d’écriture / effets à interdire ou simuler |
| --- | --- | --- |
| Overlay | get_course_outline ; get_certification_details quand utilisateur disponible | frappe.client.insert LMS Enrollment ; create_certificate ; ouverture download_pdf |
| Billing | onMounted → validate_billing_access ; onSuccess → get_order_summary, même si access est faux ; Link peut rechercher pays/source ; changement pays/code relance le récapitulatif | **get_payment_link interdit absolument**, save_address, record_payment, callbacks et redirection réelle ; code de coupon entièrement fictif |
| Formulaire multiple | get_course_details ; search_users_to_enroll ; get_bulk_enrollment_preview selon sélection/option ; recherche de liens | enroll_students_in_course/add_students_to_batch ; paiements, adresses, purchased_certificate et progression de parcours |
| CourseCertification | get_certification_details lorsque user.data arrive ; liste LMS Certificate Request dans UpcomingEvaluations ; get_schedule sur sélection/présélection de cours | insertion d’une demande, cancel_evaluation ; save_evaluation_details/save_certificate_details ; mapper create_lms_certificate puis sauvegarde ; PDF et courriels |

Lire un certificat existant ou demander son PDF n’est pas nécessaire à un audit linguistique et peut exposer des données personnelles. create_certificate peut aussi déclencher send_certification_email et un partage de document : interdit même si le paiement est gratuit. Enregistrement manuel d’un paiement par personnel n’appelle pas forcément une passerelle, mais écrit tout de même un LMS Payment reçu.

## 6. Inventaire linguistique ciblé

**67 chaînes candidates sélectionnées**, pas un inventaire brut des centaines de chaînes des dépendances : **54 points apprenant à examiner** (10 P0, 43 P1, 1 P2), **8 dépendances FR-03** et **5 traductions à conserver**. Ces 54 points comprennent des ambiguïtés de contexte et d’extraction, pas 54 traductions à remplacer ni une autorisation de lot global. S’y ajoutent les six constructions non extractibles/techniques décrites après le tableau, sans les compter comme des clés gettext existantes.

P0 : compréhension de l’action/consentement/retour ou extraction bloquante ; P1 : traduction manquante, erreur ou consigne utile ; P2 : contexte fiscal/secondaire à arbitrer. Ces priorités linguistiques ne constituent pas des niveaux de gravité sécurité.

**Colonne FR = valeur dans les MO conservés, pas dictionnaire live.** « — » signifie absente des deux MO lus, donc anglais attendu en repli *sans éventuelle surcharge Translation en base non vérifiée*. Dix des 67 clés ont une valeur MO ; cela ne prouve pas qu’elles s’affichent dans chaque branche. Une traduction fournie par un parent/enfant ou un fallback brut peut modifier le résultat. Les libellés déjà corrects ne sont pas modifiés.

Légende des chemins d’origine : O=frontend/src/components/CourseCardOverlay.vue ; B=frontend/src/pages/Billing.vue ; CL=frontend/src/components/CertificationLinks.vue ; CC=frontend/src/pages/Courses/CourseCertification.vue ; V=frontend/src/components/UpcomingEvaluations.vue ; EM=frontend/src/components/Modals/EvaluationModal.vue ; EF=frontend/src/components/Enrollment/EnrollStudentsForm.vue ; ET=frontend/src/components/Enrollment/enrollment.ts ; CF=frontend/src/pages/Forms/CourseEnrollmentForm.vue ; N=lms/lms/doctype/lms_enrollment/lms_enrollment.py ; K=lms/lms/doctype/lms_certificate/lms_certificate.py ; A=lms/lms/api.py ; G=lms/lms/payments.py ; U=lms/lms/utils.py. Les numéros de ligne correspondent au commit de base.

| ID / priorité | Clé anglaise exacte | Origine / scénario | FR disponible en MO | Proposition ou décision | Autres usages et risque |
| --- | --- | --- | --- | --- | --- |
| 1 / P1 | `Enroll Now` | O:82 ; inscription apprenant | — | S’inscrire | Autres : BatchOverlay.vue. action apprenant uniquement |
| 2 / P1 | `Buy this course` | O:60 ; inscription apprenant | — | Acheter ce cours | Pas d’autre fichier littéral repéré. achat du cours, pas option certificat |
| 3 / conserver | `Contact the Administrator to enroll for this course` | O:68 ; inscription apprenant | Contactez l'administrateur pour vous inscrire à ce cours | Conserver : Contactez l'administrateur pour vous inscrire à ce cours | Pas d’autre fichier littéral repéré. pas une erreur technique |
| 4 / P1 | `You need to login first to enroll for this course` | O:178 ; inscription apprenant | — | Connectez-vous pour vous inscrire à ce cours. | Pas d’autre fichier littéral repéré. visiteur, conserver redirection |
| 5 / P1 | `You have been enrolled in this course` | O:194 ; inscription apprenant | — | Vous êtes inscrit à ce cours. | Pas d’autre fichier littéral repéré. succès après écriture, pas avant |
| 6 / P1 | `Error` | O:207 ; inscription apprenant | Erreur | Erreur | Autres : CourseOutline.vue, ReviewModal.vue, CourseForm.vue (+5 fichiers). fallback brut non enveloppé dans ce catch ; global déjà disponible |
| 7 / P1 | `You cannot enroll another user.` | N:27 ; refus serveur inscription | — | Vous ne pouvez pas inscrire un autre utilisateur. | Pas d’autre fichier littéral repéré. permission, utilisateur distinct du rôle apprenant |
| 8 / P1 | `Student is already enrolled in this course.` | N:87 ; refus serveur inscription | — | Cet apprenant est déjà inscrit à ce cours. | Pas d’autre fichier littéral repéré. doublon, autres acteurs possibles |
| 9 / P1 | `You cannot enroll in this course as self-learning is disabled. Please contact the Administrator.` | N:115 ; refus serveur inscription | — | L’inscription libre est désactivée pour ce cours. Contactez l’administrateur. | Pas d’autre fichier littéral repéré. self-learning signifie ici inscription libre |
| 10 / P1 | `You cannot enroll in an unpublished course.` | N:120 ; refus serveur inscription | — | Vous ne pouvez pas vous inscrire à un cours non publié. | Pas d’autre fichier littéral repéré. ne pas traduire le statut stocké |
| 11 / P1 | `You need to complete the payment for this course before enrolling.` | N:134 ; refus serveur inscription | — | Vous devez régler ce cours avant de vous inscrire. | Pas d’autre fichier littéral repéré. achat du cours uniquement |
| 12 / P1 | `Billing Details` | B:3 ; facturation | Détails de la Facturation | Informations de facturation | Pas d’autre fichier littéral repéré. titre et fil d’Ariane |
| 13 / P0 | `Payment for ` | B:10 ; facturation | — | Paiement pour  | Pas d’autre fichier littéral repéré. fragment suivi de type brut course/certificate/batch ; phrase à contextualiser |
| 14 / P0 | `Enroll for Free` | B:218 ; facturation | — | Valider sans paiement | Pas d’autre fichier littéral repéré. total nul peut acheter une option certificat ; décision de libellé nécessaire |
| 15 / P1 | `Proceed to Payment` | B:218 ; facturation | — | Procéder au paiement | Pas d’autre fichier littéral repéré. étape suivante, pas paiement déjà confirmé |
| 16 / P1 | `Enter a Coupon Code` | B:54 ; facturation | — | Saisissez un code de réduction | Pas d’autre fichier littéral repéré. consigne |
| 17 / P1 | `Coupon Code` | B:60 ; facturation | Code de coupon | Code de réduction | Autres : CouponForm.vue, TransactionForm.vue. nom accessible |
| 18 / conserver | `Apply` | B:71 ; facturation | Appliquer | Conserver : Appliquer | Autres : JobDetail.vue. clé globale, vérifier sens dans les autres écrans |
| 19 / P1 | `Remove coupon` | B:75 ; facturation | — | Retirer le code de réduction | Pas d’autre fichier littéral repéré. bouton iconique accessible |
| 20 / P1 | `Original Amount` | B:24 ; facturation | — | Montant initial | Autres : TransactionForm.vue. avant remise et taxes |
| 21 / conserver | `Discount` | B:31 ; facturation | Remise | Conserver : Remise | Autres : coupons.ts. libellé de facture, cohérence avec remise à arbitrer |
| 22 / conserver | `Total` | B:44 ; facturation | Total | Conserver : Total | Autres : ProfileEvaluatorHours.vue. conserver si déjà correct |
| 23 / P2 | `GST Amount` | B:36 ; facturation | — | Montant de la GST | Pas d’autre fichier littéral repéré. taxe indienne, ne pas remplacer automatiquement par TVA |
| 24 / P1 | `Please ensure that the billing name you enter is correct, as it will be used on your invoice.` | B:91 ; facturation | — | Vérifiez le nom de facturation : il figurera sur votre facture. | Pas d’autre fichier littéral repéré. ne pas confondre nom du compte et du payeur |
| 25 / P0 | `I consent to my personal information being stored for invoicing` | B:195 ; facturation | — | J’accepte la conservation de mes données personnelles pour la facturation. | Pas d’autre fichier littéral repéré. sens du consentement ; revue juridique distincte |
| 26 / P0 | `Please provide your consent to proceed with the payment` | B:205 ; facturation | — | Veuillez donner votre accord pour poursuivre le paiement. | Pas d’autre fichier littéral repéré. texte d’erreur du champ |
| 27 / P0 | `Please provide your consent to proceed with the payment.` | B:380 ; facturation | — | Veuillez donner votre accord pour poursuivre le paiement. | Pas d’autre fichier littéral repéré. deuxième clé ponctuée dans validate |
| 28 / P1 | `Could not start the payment. Please contact the administrator.` | B:387 ; facturation | — | Impossible de démarrer le paiement. Contactez l’administrateur. | Pas d’autre fichier littéral repéré. lien invalide, pas refus bancaire démontré |
| 29 / P1 | `Please enter a coupon code` | B:403 ; facturation | — | Veuillez saisir un code de réduction. | Pas d’autre fichier littéral repéré. validation locale |
| 30 / conserver | `Please login to access this page.` | B:238 ; facturation | Veuillez vous connecter pour accéder à cette page. | Conserver : Veuillez vous connecter pour accéder à cette page. | Pas d’autre fichier littéral repéré. visiteur |
| 31 / P0 | `Payment Gateway Not Configured` | G:11 ; passerelle | — | Passerelle de paiement non configurée | Pas d’autre fichier littéral repéré. titre traduit via constante Python ; ABSENT DU POT |
| 32 / P1 | `The Payments app is not installed. Please contact the administrator.` | G:30 ; passerelle | — | L’application Payments n’est pas installée. Contactez l’administrateur. | Pas d’autre fichier littéral repéré. Payments reste nom technique |
| 33 / P1 | `No payment gateway is configured. Please contact the administrator.` | G:36 ; passerelle | — | Aucune passerelle de paiement n’est configurée. Contactez l’administrateur. | Pas d’autre fichier littéral repéré. ne pas masquer la cause |
| 34 / P1 | `The configured payment gateway {0} does not exist. Please contact the administrator.` | G:42 ; passerelle | — | La passerelle de paiement configurée {0} n’existe pas. Contactez l’administrateur. | Pas d’autre fichier littéral repéré. {0} contient du HTML de mise en gras à préserver |
| 35 / P1 | `The coupon code '{0}' is invalid.` | U:3078 ; réduction | — | Le code de réduction « {0} » n’est pas valide. | Pas d’autre fichier littéral repéré. code fourni par utilisateur, conserver paramètre |
| 36 / P1 | `This coupon has expired.` | U:3107 ; réduction | — | Ce code de réduction a expiré. | Pas d’autre fichier littéral repéré. expiration |
| 37 / P1 | `This coupon has reached its maximum usage limit.` | U:3110 ; réduction | — | Ce code de réduction a atteint sa limite d’utilisation. | Pas d’autre fichier littéral repéré. pas d’incrément lors de la simulation |
| 38 / P0 | `This coupon is not applicable to this {0}.` | U:3119 ; réduction | — | À contextualiser : Ce code de réduction ne s’applique pas à ce cours / à cette session. | Pas d’autre fichier littéral repéré. proposition de nouvelle source complète par type ; ne pas supprimer {0} dans la clé actuelle |
| 39 / P1 | `You are already enrolled for this course.` | A:293 ; accès facturation | — | Vous êtes déjà inscrit à ce cours. | Pas d’autre fichier littéral repéré. refus d’un nouveau checkout |
| 40 / P1 | `You have already purchased the certificate for this course.` | A:323 ; accès facturation | — | Vous avez déjà acheté l’option certificat de ce cours. | Pas d’autre fichier littéral repéré. droit acheté, pas certificat délivré |
| 41 / P0 | `Get Certified` | CL:33 ; certificat | — | Acheter l’option certificat / Accéder à l’évaluation | Autres : CourseCard.vue, CertifiedParticipants.vue. proposition générique à écarter : séparer achat de l’option et accès à l’évaluation |
| 42 / P1 | `Get Certificate` | O:95 ; certificat | — | Obtenir le certificat | Pas d’autre fichier littéral repéré. peut créer le certificat puis ouvrir le PDF |
| 43 / P1 | `View Certificate` | CL:9 ; certificat | — | Consulter le certificat | Autres : Event.vue. ouvre download_pdf ; ne pas confondre avec émettre |
| 44 / P1 | `Certificate of completion` | O:145 ; certificat | — | Certificat de fin de cours | Pas d’autre fichier littéral repéré. enable_certification ; pas promesse de qualification officielle |
| 45 / P0 | `Certification` | CC:3 ; certificat | Certification | Certification | Autres : Event.vue, AppSidebar.vue, BatchForm.vue (+4 fichiers). titre d’étape distinct du filtre Avec certificat ; pas de remplacement global |
| 46 / P1 | `Could not load this certification.` | CC:73 ; certificat | — | Impossible de charger les informations de certification. | Pas d’autre fichier littéral repéré. fallback d’erreur |
| 47 / P1 | `You are already certified for this course. Click on the card below to open your certificate.` | CC:9 ; certificat | — | Un certificat vous a déjà été délivré pour ce cours. Sélectionnez la carte pour le consulter. | Pas d’autre fichier littéral repéré. éviter promesse de certification officielle |
| 48 / P1 | `Issued On` | CC:22 ; certificat | — | Délivré le | Autres : badgeAssignments.ts. date Day.js à traiter séparément |
| 49 / P1 | `You are not enrolled in this course.` | K:233 ; éligibilité certificat | — | Vous n’êtes pas inscrit à ce cours. | Autres : lms_certificate_request.py. partagé avec réservation d’évaluation |
| 50 / P1 | `Certification is not enabled for this course.` | K:236 ; éligibilité certificat | — | La délivrance d’un certificat de fin de cours n’est pas activée pour ce cours. | Pas d’autre fichier littéral repéré. enable_certification, pas tous les parcours payants |
| 51 / P1 | `You have not completed the course yet.` | K:242 ; éligibilité certificat | — | Vous n’avez pas encore terminé ce cours. | Pas d’autre fichier littéral repéré. progression inférieure à 100 |
| 52 / P1 | `Upcoming Evaluations` | V:5 ; évaluation | — | Évaluations à venir | Autres : AdminHome.vue. évaluations planifiées, pas certificats |
| 53 / P1 | `Schedule` | V:8 ; évaluation | Planification | Planifier | Autres : Profile.vue. dans ce bouton planifier une évaluation ; usages globaux à vérifier |
| 54 / P1 | `Schedule an evaluation to get certified.` | V:112 ; évaluation | — | Planifiez une évaluation en vue d’obtenir votre certificat. | Pas d’autre fichier littéral repéré. aucune délivrance garantie par la seule réservation |
| 55 / P1 | `Schedule your evaluation` | EM:4 ; évaluation | — | Planifiez votre évaluation | Pas d’autre fichier littéral repéré. titre du dialogue |
| 56 / P1 | `No slots available for the selected course.` | EM:87 ; évaluation | — | Aucun créneau disponible pour ce cours. | Pas d’autre fichier littéral repéré. état vide |
| 57 / P1 | `Please select a slot for your evaluation.` | EM:130 ; évaluation | — | Sélectionnez un créneau pour votre évaluation. | Pas d’autre fichier littéral repéré. validation |
| 58 / FR-03 P1 | `Enroll Students` | EF:3 ; gestion FR-03 | — | Inscrire des apprenants | Autres : bulk_enrollment.py. FR-03 gestion de plusieurs comptes, pas auto-inscription |
| 59 / FR-03 P1 | `You do not have permission to enroll students in this course.` | CF:78 ; gestion FR-03 | — | Vous n’avez pas l’autorisation d’inscrire des apprenants à ce cours. | Pas d’autre fichier littéral repéré. FR-03 rôle et périmètre du cours |
| 60 / FR-03 P0 | `Include paid certificate` | ET:72 ; gestion FR-03 | — | Inclure l’option certificat payante | Pas d’autre fichier littéral repéré. FR-03 achat enregistré, pas délivrance |
| 61 / FR-03 P0 | `Students get the certificate and a payment is recorded for each.` | ET:81 ; gestion FR-03 | — | L’option certificat est activée et un paiement est enregistré pour chaque apprenant. | Pas d’autre fichier littéral repéré. FR-03 source anglaise promet le certificat trop tôt |
| 62 / FR-03 P1 | `Record payments` | ET:73 ; gestion FR-03 | — | Enregistrer des paiements | Pas d’autre fichier littéral repéré. FR-03 écriture comptable, pas encaissement par passerelle |
| 63 / FR-03 P1 | `Turn off to enroll without a payment record.` | ET:85 ; gestion FR-03 | — | Désactivez cette option pour inscrire sans enregistrer de paiement. | Pas d’autre fichier littéral repéré. FR-03 dérogation de personnel autorisé, pas gratuité commerciale |
| 64 / FR-03 P1 | `Could not enroll students` | EF:700 ; gestion FR-03 | — | Impossible d’inscrire les apprenants. | Pas d’autre fichier littéral repéré. FR-03 repli |
| 65 / FR-03 P1 | `Checking the selected students` | EF:556 ; gestion FR-03 | — | Vérification des apprenants sélectionnés | Pas d’autre fichier littéral repéré. FR-03 annonce accessible de chargement |
| 66 / P1 | `Checkout Course` | B:228 ; facturation | — | Voir le cours | Pas d’autre fichier littéral repéré. traduit par NotPermitted enfant, vérifier extraction de cette valeur dynamique ; ABSENT DU POT |
| 67 / P0 | `Checkout Batch` | B:228 ; facturation | — | Voir la session | Pas d’autre fichier littéral repéré. erreur de retour : certificate choisit actuellement Checkout Batch et route batches ; corriger contexte avant traduction ; ABSENT DU POT |

La clé Payment for comporte un espace final, à conserver lors d’une comparaison exacte. Les propositions contextualisées de Get Certified et du coupon ne sont **pas** des msgstr prêts à copier : elles demandent de séparer les actions ou les clés anglaises après autorisation. Pour la clé du coupon actuelle, `{0}` ne doit jamais être supprimé silencieusement ; la proposition de phrases par type suppose de nouvelles sources explicites et une extraction contrôlée.

### Six constructions ou dépendances supplémentaires

1. **Validation d’adresse sans __()** : `'Please enter a valid ' + field.replaceAll('_', ' ')...` dans Billing.validateAddress. Impossible de traduire durablement une infinité de noms techniques reconstruits ; recommander un message source complet avec le libellé localisé du champ. Aucun nouveau paramètre ni catalogue créé ici.
2. **PAN brut** : `'Please enter a valid pan number.'` retourné sans __(). Ne pas franciser le nom fiscal en une autre taxe ; future clé contextualisée.
3. **Paramètre coupon non localisé** : utils.validate_coupon_applicability remplace `{0}` par Course ou Batch bruts, même si la phrase est traduite. Les deux noms doivent être contextualisés sans traduire les valeurs techniques des API.
4. **Repli d’erreur brut** : Overlay passe 'Error' à resourceErrorMessage sans __() ; Billing.showError utilise err.messages / err.message / err et peut exposer des messages du navigateur en anglais. Le résolveur natif de traduction ne suffit pas à ces chemins. Les erreurs serveur déjà traduites ne doivent pas être retraduites à l’aveugle.
5. **Présentation externe du paiement** : payments.get_payment_link construit des f-strings `Payment for {doctype} {title} {docname}` et `{billing_name}'s payment for {title}`, destinées au contrôleur de passerelle. Elles mêlent présentation, noms techniques et contenus ; pas des clés d’interface déjà extraites. À isoler pour une éventuelle recette de prestataire, sans traduire reference_doctype/reference_docname ni exposer les valeurs personnelles dans les preuves.
6. **Chaînes dynamiques absentes du POT** : Payment Gateway Not Configured est passé à _() via GATEWAY_NOT_CONFIGURED_TITLE ; Checkout Course/Checkout Batch sont traduits dans NotPermitted enfant via __() dynamique. Le rendu n’est donc pas « sans mécanisme de traduction », mais les littéraux ne sont pas extraits actuellement. Une correction future doit rendre leurs sources extractibles par le mécanisme natif, avec test ciblé ; aucune extraction ni modification de mapping dans cet audit.

Les champs standards d’adresse/facturation, pays et source, les labels génériques de chargement, et les nombreuses validations JSON/identifiants de la gestion multiple ne constituent pas automatiquement autant de nouvelles traductions prioritaires. Les noms de documents, statuts stockés, codes pays/coupons et valeurs de route restent techniques. Les autres usages listés ci-dessus sont les principaux usages littéraux dans les sources suivies ; cela ne constitue pas une recherche exhaustive de toutes les valeurs dynamiques ou personnalisations en base.

## 7. Découpage recommandé, à autoriser séparément

| Lot proposé | Petit périmètre | Validation future nécessaire, avec écritures interdites ou simulées |
| --- | --- | --- |
| **FR-02C.1 — recommandé en premier** | Auto-inscription apprenant : Enroll Now, Buy this course, connexion/succès, fallback Error ; conserver l’avertissement administrateur déjà correct. Quatre clés françaises à renseigner plus un appel natif de fallback, sans backend métier | Rendus Guest/non inscrit/inscrit, gratuit/payant/inscription libre désactivée, FR/EN bureau/mobile, aucun insert ni lien demandé. Réutiliser les preuves FR-02B pour le reste |
| FR-02C.2 — facturation, actions et extraction | Séparer Payment for par type, total nul adapté, retour certificate vers cours, titre de passerelle/retours extractibles, validations d’adresse et consentement | Valider les libellés d’option et de total nul ; intercepter **tous** les endpoints sensibles avant montage. Tester erreurs et zéro montant sur réponses fictives uniquement. Contrôler l’extraction native si sources changées |
| FR-02C.3 — messages de réduction et passerelle | Un petit groupe d’erreurs, labels de code de réduction et messages d’installation ; terminologie de facturation cohérente | Paramètres/HTML, contextes, pas de code réel ni appel get_payment_link. Préserver Appliquer/Remise/Total déjà corrects |
| FR-02C.4 — parcours de certificat apprenant | Distinguer achat d’option/évaluation/obtenir/consulter, refus et états ; aucun PDF ou acte d’émission | Matrice des deux mécanismes et droits : états simulés, pas d’évaluation réservée ni certificat généré. Pas de changement global de Certification |
| **FR-03** | Formulaire d’inscription multiple, sélecteurs/accessibilité, paiements enregistrés par personnel, paramètres de cours et évaluateurs | Rôles/périmètres, succès partiels, sans nouvelle extension automatique de FR-02 |
| **FR-04** | Langue et formulation des documents, gabarits PDF, courriels et notifications ; contenu d’une facture si concerné | Données entièrement fictives et autorisation dédiée avant génération/envoi |

Le premier lot ne corrige pas les règles de paiement ou d’inscription. Le défaut de retour de Billing(type=certificate), confirmé par lecture, peut être isolé dans un correctif fonctionnel explicite plutôt que caché dans une traduction. Aucune de ces propositions n’autorise une implémentation ou une édition de PO.

### Dépendances FR-04 identifiées sans exécution

- LMSCertificate.after_insert → send_certification_email/send_mail ; sujet `Congratulations on getting certified!`, modèle `lms/templates/emails/certification.html`, éventuel Email Template configuré ; `Dear ` et `Certificate Link` notamment. Ne pas confondre son titre avec une certification professionnelle reconnue.
- LMSCertificateRequest.after_insert et les fonctions de rappel : notifications de demande/évaluateur et `lms/lms/notification/certificate_request_reminder/*`. Langue du destinataire et paramètres date/heure/fuseau à vérifier en FR-04.
- Print Format par défaut choisi par get_default_certificate_template et template du certificat ; ouverture PDF via le Framework. Pas de gabarit modifié ni de document lu/généré. Nom du membre, cours, dates, accents et droits à vérifier sur données fictives lors d’une mission dédiée.

## 8. Contrôles réellement effectués, intégrité et reprise

Lecture ciblée des sources ci-dessus et de leurs dépendances directes ; comparaison des appels et priorités des branches, contrôles de rôle, effets des écritures, requêtes automatiques et extraction connue. Lecture native Python des MO conservés et analyse des PO/POT hors ligne, sans dépendance installée. Inventaire de 67 chaînes, références primaires et principaux autres usages enregistrés.

**Aucun test applicatif exécuté**, aucune suite relancée, aucun build, génération POT/compilation MO, nettoyage de cache, simulation de paiement ou navigateur. Le dictionnaire actif, FR/EN et l’affichage bureau/mobile de ces nouveaux parcours restent **non vérifiés dans cette mission**, et aucune transaction ou émission n’est prétendue testée. La tentative de lecture dans le conteneur arrêté et l’impossibilité de mesurer le live sont documentées en section 1.

Contrôles finaux : seuls ce rapport et CODEX_HANDOFF.md changent ; catalogues et sources comparés avec la base publiée, empreintes des 79 PO/POT et état Framework vérifiés ; diff et recherche ciblée de secrets relus. Pas de modification de develop, configuration du site, préférences, Docker ou production OMV 8 ; aucun compte, paiement, inscription, coupon, demande ou certificat créé/modifié. Aucun PDF téléchargé.

Preuves hors Git : `/workspace/work/fr02c/` : liste de candidats, offline.py, inventory.json (clé/proposition/MO/PO/POT/références), state.json et journaux. inventory.py est une sonde **non exécutée** dans Frappe à cause du conteneur arrêté, pas un résultat runtime. Aucun secret demandé ou enregistré. Un seul commit documentaire local pour rapport/handoff, SHA à relever par git log après création. Aucun push/PR.

**Prochaine action :** valider l’arbitrage achat d’option / évaluation / délivrance / consultation et le petit lot FR-02C.1 ; réactiver l’environnement de développement dans une mission appropriée pour mesurer le dictionnaire courant et réaliser les rendus entièrement simulés. **Arrêt après l’audit, aucune correction FR-02C.1 commencée.**
