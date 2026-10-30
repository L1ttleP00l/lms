# FR-02C.2 — Facturation, actions et extraction gettext

30 octobre 2026 (Europe/Paris), L1ttleP00l/lms, branche exclusive `littlepool-dev`. Base initiale propre et distante vérifiée : **34d09304e323a78e932fd11e68d08c056ef8a862**. FR-02C.1 publié. Aucun push dans ce lot.

## Résultat et limites de validation

Les libellés de facturation, le retour après refus d’une option certificat, les validations paramétrées et l’extraction du titre de passerelle sont corrigés dans le périmètre demandé. **59 tests Billing et deux tests Python ciblés réussis.** Les assertions fonctionnelles des quatre parcours Chromium FR/EN bureau/mobile réussissent, mais **l’assertion finale d’absence de pageerror échoue : 16 rejets de promesse de validation non capturés**. Cette limite est détaillée plus bas ; le navigateur n’est pas déclaré entièrement sans erreur.

Aucun paiement, inscription, adresse, coupon, demande d’évaluation ou certificat créé/modifié. Aucune requête sensible tentée par la recette navigateur ni transmise au serveur. Aucun get_payment_link réellement appelé, aucun prestataire/callback sollicité.

## Changements applicatifs

| Zone | Avant | Après et invariant |
| --- | --- | --- |
| Récapitulatif Billing | Payment for + type technique | Trois phrases anglaises complètes choisies selon course/batch/certificate ; identifiants, paramètres et routes restent techniques |
| Total nul | Enroll for Free | Confirm without payment → Valider sans paiement. N’affirme pas l’absence de LMS Payment technique ; isZeroAmount et calculs identiques |
| Paiement positif/titre | Texte absent en français / Détails de la Facturation | Procéder au paiement / Informations de facturation. Billing Details a trois usages, tous dans Billing ; pas de conflit global repéré |
| Retour après refus | certificate traité comme batch | course et certificate → getLmsRoute(courses/{name}), batch → getLmsRoute(batches/{name}) ; libellés Back to course / Back to training session. NotPermitted global inchangé |
| Adresse obligatoire | Préfixe anglais + nom technique reconstruit | Please enter a valid value for {0}. avec correspondance explicite des dix champs vers les mêmes clés visibles : Billing Name, Address Line 1/2, City, State/Province, Postal Code, Country, Phone Number, GST Number, PAN Number |
| PAN | Phrase brute, non extractible | Please enter a valid PAN number. via __() ; condition gstin && !pan conservée au même endroit, avant le test de pays comme auparavant |
| État indien | Messages déjà enveloppés mais sans traduction FR | Traductions nécessaires renseignées ; normalisation et choix des États, champs reqd et règles pays inchangés |
| Consentement | Case et deux variantes de message sans traduction FR | Trois traductions conservant le sens initial, erreur liée au contrôle natif ; aucune nouvelle garantie juridique, durée de conservation ou règle de collecte |
| Titre de passerelle | _(GATEWAY_NOT_CONFIGURED_TITLE), non extrait | Trois appels littéraux _("Payment Gateway Not Configured") dans les mêmes branches ; constante inutilisée retirée. Traduction à chaque appel, jamais figée à l’import |

Les champs déjà correctement traduits sont réutilisés, par exemple Nom de facturation, Ligne d’adresse 1/2, Ville, État/Province, Code postal, Pays, Numéro de téléphone et Numéro PAN. **GST Number** était vide : Numéro de GST est ajouté ; aucune assimilation à la TVA.

**Contrôle d’invariants :** tous les corps de fonctions Python de payments.py sont identiques en AST à la base, sauf les trois arguments de titre dans validate_payment_gateway. En remplaçant dans l’AST la constante d’origine par son littéral, cette fonction est elle aussi identique. get_payment_link, paiements, taxes, coupons, accès et callbacks sont donc inchangés. Les blocs generatePaymentLink, showError et isZeroAmount de Billing sont comparés textuellement à la base : identiques. Les validations gardent ordre, champs obligatoires, branches et normalisation ; seules leurs phrases/libellés changent. Le risque de double clic n’est pas corrigé.

## Traductions finales

**17 blocs français ciblés** : 16 valeurs nouvellement renseignées et une correction de traduction existante (Billing Details). Aucune autre traduction modifiée.

| Clé source | Français |
| --- | --- |
| Payment for the course | Paiement du cours |
| Payment for the training session | Paiement de la session de formation |
| Payment for the certificate option | Paiement de l'option certificat |
| Confirm without payment | Valider sans paiement |
| Proceed to Payment | Procéder au paiement |
| Billing Details | Informations de facturation |
| Back to course | Retour au cours |
| Back to training session | Retour à la session |
| Please enter a valid value for {0}. | Veuillez saisir une valeur valide pour le champ « {0} ». |
| Please enter a valid PAN number. | Veuillez saisir un numéro PAN valide. |
| Payment Gateway Not Configured | Passerelle de paiement non configurée |
| I consent to my personal information being stored for invoicing | J’accepte que mes données personnelles soient conservées pour la facturation. |
| Please provide your consent to proceed with the payment | Veuillez donner votre accord pour poursuivre le paiement. |
| Please provide your consent to proceed with the payment. | Veuillez donner votre accord pour poursuivre le paiement. |
| Please select your state. | Veuillez sélectionner votre État. |
| Please select your state from the list. | Veuillez sélectionner votre État dans la liste. |
| GST Number | Numéro de GST |

Les deux clés de consentement sont conservées séparément avec et sans point final. Les autres traductions du récapitulatif, dont Appliquer, Remise et Total, sont conservées ; les erreurs détaillées de coupons et de passerelle restent réservées à FR-02C.3. Seul le titre de passerelle est traité ici, pas tous ses corps de message.

## POT et PO contrôlés

Génération native locale `bench generate-pot-file --app lms`, jamais le helper de publication amont. **2 985 → 2 992 clés** : neuf ajouts, deux retraits, 25 changements de références sur clés communes. Diff intégral relu ; aucun changement de contexte/indicateur commun ni ajout de contenu utilisateur/test.

Ajouts : les trois Payment for…, Confirm without payment, les deux Back to…, Please enter a valid value for {0}., Please enter a valid PAN number., Payment Gateway Not Configured.

Retraits expliqués : **Payment for** avec espace final, et **Enroll for Free**, remplacés dans leur seul appel traduisible Billing. Leurs anciennes entrées restent inchangées dans fr.po ; aucun nettoyage des traductions, aucun autre usage statique traduisible trouvé. Checkout Course/Checkout Batch étaient absents du POT et sont remplacés localement sans modification de NotPermitted.

Des 25 références communes actualisées, **trois clés rattrapent les changements déjà publiés** : Error (repli FR-02C.1), Related Courses et Video preview (accessibilité FR-02B.4). Les autres concernent les libellés réutilisés/positions de Billing et payments. Ces différences sont expliquées par les sources actuelles, pas par une perte de clé ou un élargissement applicatif. Diff final : 71 lignes ajoutées / 37 retirées. Une deuxième extraction a actualisé les références après correction d’une ligne vide exigée par Ruff ; mêmes neuf ajouts/deux retraits et même total, aucune nouvelle variation fonctionnelle.

Édition Babel des seuls blocs autorisés, nouvelle entrée copiée depuis le POT, comparaison octet pour octet de tous les autres blocs et de l’en-tête : réussies. PO français **2 706 → 2 715 entrées**, valeurs non vides **641 → 657**. Aucun autre PO modifié (**38 LMS + 40 Framework intacts**). Framework non modifié. Pas d’update-po-files, de Crowdin ou de changement de mapping.

Babel PO/POT, `{0}`, contextes, indicateurs et encodage : réussis. Compilation native LMS/fr puis invalidation native du seul site learning.localhost : réussies. MO **657 messages / 32 298 octets** ; les 17 valeurs sont présentes dans PO/MO/dictionnaire réel et les quatre valeurs FR-02C.1 contrôlées sont conservées. Dictionnaire agrégé observé : 6 187 clés ; ne pas comparer sa seule taille aux autres mesures de contexte/cache comme preuve de perte du LMS.

## Tests réellement exécutés

### Vue

Harnais **Billing.test.ts réutilisé** et étendu, avec vrai plugin de traduction, ressources simulées et noms/adresses explicitement fictifs. **Passage final : 59 tests réussis en une exécution de 2,45 s**, aucun autre fichier Vue ou suite globale relancé.

Couverture FR/EN : trois types, montant positif/zéro/zéro après remise simulée, trois retours de refus, dix champs rendus obligatoires par métadonnées simulées et leur libellé, PAN absent avec GST, État indien invalide, consentement absent et correction du contrôle. Les tests antérieurs de normalisation des États et du contrat de paramètres sont conservés. Les scénarios valides du harnais capturent la demande de lien dans une fonction simulée, sans accès réseau ni import du backend de paiement.

Premier passage : 39 réussis / deux échecs, car la fixture pays vide était remplacée par le défaut India existant. Le test efface désormais le contrôle après montage ; aucune règle de défaut du pays modifiée. Passage suivant : 41 réussis. Extension finale des cas de champs/montants : 59 réussis. Les résultats intermédiaires ne sont pas assimilés à une suite globale validée.

### Python et extraction

Nouveau `lms/tests/test_billing_gettext.py`, exécuté par unittest sans site/DB : **deux méthodes réussies en 0,047 s**. Extraction des vraies sources par les règles natives Babel/get_method_map et contrôle des neuf clés ; six sous-cas FR/EN sur les trois gardes de passerelle, avec module frappe intégralement simulé. Le titre est résolu par appel et aucune écriture SQL/set_value n’est effectuée ; get_payment_link jamais appelé.

Premier essai : extraction réussie, six sous-cas en erreur parce que le mock inspectait frappe.db hors contexte initialisé. Harnais corrigé en remplaçant le module frappe utilisé par payments ; aucun site initialisé pour contourner cette erreur. Tests finaux réussis. Le titre français réel est aussi vérifié dans le MO/dictionnaire, distinctement de la traduction synthétique du test.

### Format et build

Prettier 2.7.1 ciblé et Ruff lint : réussis ; format du nouveau test Python réussi. Un contrôle Ruff a signalé la ligne vide manquante après retrait de la constante ; correction locale, sans reformatage global des fonctions de paiement. Contrôles d’AST/invariants, diff Git, intégrité et recherche ciblée de secrets : réussis. Lanceur pre-commit complet historiquement bloqué non relancé ; commits avec hooks désactivés après contrôles ciblés.

Build nécessaire au nouveau rendu Billing : **réussi en 16,22 s**. Déclarations générées sauvegardées/restaurées, aucun asset/MO suivi. Pas d’installation, migration, modification Docker ou déploiement ; avertissements Vite/Browserslist/face-api habituels.

## Chromium : preuves fonctionnelles et sécurité

Quatre combinaisons **FR/EN × bureau 1440×1000 / mobile 390×844** ont achevé toutes les assertions fonctionnelles :

- Trois titres de paiement et action positive, option certificat à zéro avec/sans remise simulée.
- Trois refus indépendants : retour cours → /lms/courses/FR02C2-ITEM ; certificat → même destination cours ; session → /lms/batches/FR02C2-ITEM. Les destinations fictives sont interceptées comme pages statiques, pas des cours créés.
- Erreurs de consentement, champ Ville manquant, PAN absent et État invalide en Inde ; association réelle de l’erreur à la case via aria-invalid et aria-errormessage/aria-describedby ; l’erreur disparaît une fois la case cochée.
- Préférences préexistantes des comptes fictifs fr/en utilisées et confirmées après les parcours, aucune modification temporaire donc aucune restauration par écriture nécessaire. Défaut système fr conservé, navigateur en-US.

**Interception avant connexion/montage** : 48 réponses validate_billing_access et 48 get_order_summary entièrement simulées, y compris refus et montants. Autres API bloquées par défaut sauf lectures explicites/login ; recherche de liens simulée. **Zéro tentative de get_payment_link, insert, écriture de facturation, certificat ou callback ; zéro transmission au backend d’un endpoint sensible.** Tous les noms de cours, montants et adresses de Billing sont fictifs. Aucun lien de passerelle suivi. Les boutons valides ne sont pas soumis à une transaction ; les clics de validation échouent localement avant envoi.

### Assertion navigateur échouée : rejets de validation

L’assertion globale finale « aucune pageerror » **échoue**, malgré la réussite des assertions fonctionnelles et de sécurité. **16 erreurs JavaScript** correspondent aux quatre messages de validation × quatre combinaisons. Elles proviennent de la promesse renvoyée par la ressource après affichage du toast : `frappe-ui/src/resources/resources.js:83–100` transforme le message en Error et handleError, vers la ligne 183, le relance même après onError. Billing.generatePaymentLink appelle submit sans capturer cette promesse.

Le bloc generatePaymentLink et showError sont textuellement identiques à la base ; cette chaîne de gestion existante n’a pas été corrigée pour élargir le lot ou masquer le constat. Le harnais unitaire existant appelle le handler sans reproduire cette relance ; **son compteur unhandled ne prouve donc pas l’absence d’erreurs dans le navigateur réel**. Aucune relance navigateur isolée n’est utilisée pour déclarer le contrôle global réussi.

À traiter dans un correctif de gestion d’exception explicitement autorisé, sans masquer une erreur réelle de callback ni changer le paiement ; le problème de double clic reste également distinct. Quatre erreurs HTTP annexes et 48 appels de télémétrie boot_config bloqués consignés, sans correction du service.

Non exécutés : paiement réel, total nul finalisé en backend, callback, émission de certificat, facture PDF, lecteur d’écran exhaustif, suite globale Vue/backend, autres navigateurs. Les sous-cas navigateur zéro avec remise utilisent un récapitulatif fictif, pas un coupon réel ni une validation fiscale.

## Fichiers, commits et suite

Sources : Billing.vue et payments.py. Tests : Billing.test.ts réutilisé, nouveau test_billing_gettext.py. Catalogues : main.pot et fr.po. Documentation : ce rapport et CODEX_HANDOFF.md. **Commit applicatif/tests : 8696c22b** ; le commit suivant livre les catalogues et la documentation, SHA à relever avec git log.

Preuves hors Git : `/workspace/work/fr02c2/` : sauvegardes PO/POT, diff/comparaisons et plan des 17 traductions, journaux tests/format/build/compilation, harnais Chromium/browser.json, captures, final-check.json et préférences (codes de langue seulement). Aucun secret, cookie, adresse réelle ou journal sensible dans Git.

Checkout propre après les commits locaux ; aucun push/PR. **Arrêt après FR-02C.2.** Attendre l’autorisation de publication. FR-02C.3 (corps d’erreurs de passerelle/coupons), FR-02C.4 (Get Certified et parcours de certificat), FR-03/FR-04 et gestion des rejets/double clic restent des travaux distincts non commencés.
