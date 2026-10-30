# FR-02C.3 — Messages de réduction et erreurs de passerelle

30 octobre 2026 (Europe/Paris). Branche `littlepool-dev`, base propre publiée `389affaab75836471aec44a1e196ed8f83a5812e`. Mission locale uniquement, aucune publication.

## Résultat et périmètre

Deux phrases anglaises complètes remplacent l’insertion de Course/Batch dans `validate_coupon_applicability()` :

- `This coupon is not applicable to this course.`
- `This coupon is not applicable to this training session.`

La condition `doctype == "LMS Course"` et son alternative sont strictement conservées, y compris pour les autres valeurs techniques. Requête LMS Coupon Item, critères, permissions, expiration, limites, calcul et plafonnement des remises inchangés. Comparaison AST de tout utils.py à la base : identique après normalisation du seul argument textuel de frappe.throw ; requête et condition explicitement vérifiées.

Billing.vue et payments.py restent inchangés. Tous les libellés ciblés y étaient déjà enveloppés. `Coupon Code` est également utilisé dans CouponForm, TransactionForm et la métadonnée LMS Payment : « Code de réduction » désigne correctement le même code dans ces usages administratifs. Aucun autre libellé administratif harmonisé par extension du lot. Apply → Appliquer, Discount → Remise, Total → Total conservés.

## Traductions

13 blocs ciblés : 12 valeurs nouvellement renseignées, une correction existante. Aucun autre bloc ni en-tête français modifié ; vérification octet pour octet des blocs non ciblés. Anglais source/repli conservé.

| Clé | Français | Action |
| --- | --- | --- |
| Could not start the payment. Please contact the administrator. | Impossible de démarrer le paiement. Contactez l'administrateur. | Ajout |
| Coupon Code | Code de réduction | Correction de « Code de coupon » |
| Enter a Coupon Code | Saisissez un code de réduction | Ajout |
| No payment gateway is configured. Please contact the administrator. | Aucune passerelle de paiement n'est configurée. Contactez l'administrateur. | Ajout |
| Please enter a coupon code | Veuillez saisir un code de réduction. | Ajout |
| Remove coupon | Retirer le code de réduction | Ajout |
| The Payments app is not installed. Please contact the administrator. | L'application Payments n'est pas installée. Contactez l'administrateur. | Ajout |
| The configured payment gateway {0} does not exist. Please contact the administrator. | La passerelle de paiement configurée {0} n'existe pas. Contactez l'administrateur. | Ajout |
| The coupon code '{0}' is invalid. | Le code de réduction « {0} » n'est pas valide. | Ajout |
| This coupon has expired. | Ce code de réduction a expiré. | Ajout |
| This coupon has reached its maximum usage limit. | Ce code de réduction a atteint sa limite d'utilisation. | Ajout |
| This coupon is not applicable to this course. | Ce code de réduction ne s'applique pas à ce cours. | Ajout |
| This coupon is not applicable to this training session. | Ce code de réduction ne s'applique pas à cette session de formation. | Ajout |

`{0}` reste intact dans les messages de code invalide et de passerelle. Le code utilisateur n’est pas réécrit par le backend ; la normalisation trim/majuscules existante du champ Vue est inchangée. Payments reste le nom technique. Le nom de passerelle reste enveloppé par le même `frappe.bold()` natif, vérifié comme `<strong>TEST-GATEWAY</strong>` ; aucune nouvelle interpolation HTML ni modification d’échappement. Attention : bold natif est un formateur, pas un assainisseur HTML ; ce lot ne revendique pas un audit global de sécurité de rendu.

## Catalogues et activation

- Extraction native `bench generate-pot-file --app lms` : **2 992 → 2 993 clés**, **+2/-1**, **zéro changement de références communes**. Diff intégral relu ; seuls les deux messages contextualisés remplacent `This coupon is not applicable to this {0}.`, plus les dates d’en-tête natives. Aucune différence imprévue.
- Ancienne clé sans autre appel traduisible connu, entrée historique **conservée dans fr.po**, sans nettoyage.
- PO **2 715 → 2 717 entrées**, **657 → 669 traductions**. Les 657 valeurs antérieures sont conservées, hormis la correction explicitement autorisée Code de coupon → Code de réduction.
- Babel PO/POT, contextes, indicateurs, paramètres et encodage : réussis. Les nouvelles phrases complètes n’ont plus de paramètre ; l’ancien indicateur python-brace-format reste sur l’ancienne entrée PO.
- 78 autres PO contrôlés par empreintes (38 LMS + 40 Framework). La première collecte de contrôle omettait les 40 Framework à cause d’un chemin erroné ; comparaison complète reprise avec le manifeste de référence FR-02C.2, sans nouveau baselining. Tous identiques. Framework propre à `959b85de4086656273e1d158f41923dd3808c350`.
- Compilation native `bench compile-po-to-mo --app lms --locale fr`, puis `bench --site learning.localhost execute frappe.translate.clear_cache` : réussies, seul site de développement. MO **669 messages** et 13 valeurs identiques PO/MO/dictionnaire natif chargé. Préférences des comptes fictifs fr/en et défaut système fr confirmés sans modification.

## Tests exécutés et résultats

### Vue

Billing.test.ts existant étendu, ressources entièrement simulées : **65 tests réussis / un fichier / une exécution, 4,27 s**. Six nouveaux cas FR/EN : champ nommé, code vide, retrait de remise simulée, valeurs conservées Remise/Total, repli d’erreur sur réponse de paiement invalide. Ce dernier appelle exclusivement le mock en mémoire, jamais la méthode serveur. Le test antérieur de normalisation trim/majuscules est conservé et réussi. Dictionnaire français synthétique limité au harnais, aucun dictionnaire runtime parallèle ajouté ; disponibilité des vraies valeurs contrôlée séparément dans les catalogues et le navigateur.

### Python

Nouveau `lms/tests/test_coupon_messages.py` : **5 méthodes réussies en une exécution finale, 0,118 s**. FR/EN issus du vrai PO : code invalide et interpolation exacte ; expiration, limite atteinte et coupon encore valide ; applicabilité cours/session/autre valeur et branche autorisée ; trois gardes de passerelle avec titre traduit et nom mis en forme ; extraction native des deux phrases et absence de l’ancienne. Module Frappe utilisé par chaque fonction remplacé par un mock ; seules les lectures simulées attendues sont autorisées/vérifiées, aucune connexion de test à un site/DB, aucune écriture. La date courante est simulée pour éviter la consultation du fuseau système de Frappe sans site.

Premier passage : quatre méthodes réussies, six sous-cas de date en erreur (configuration de fuseau hors site). Une première tentative de remplacement du harnais n’avait pas appliqué le patch, même erreur au passage suivant. Patch explicite getdate ensuite appliqué ; final cinq méthodes réussies. Aucune logique métier modifiée pour contourner ces erreurs.

### Chromium

FR/EN × ordinateur 1440×1000 / mobile 390×844 : **quatre parcours ciblés réussis**. Intitulé, nom accessible Code de réduction, erreur de code vide, application de TEST-ONLY entièrement simulée, bouton de retrait nommé, champ désactivé avec remise puis vidé/réactivé au retrait, Remise et langue persistante vérifiés. Aucun bouton de paiement soumis.

Interception API installée avant connexion/montage : **4 réponses d’accès + 12 récapitulatifs entièrement simulés**, recherche de liens simulée, autres méthodes non explicitement autorisées bloquées. Zéro appel sensible tenté/intercepté, zéro transmis au backend ; aucune création/modification/consommation de coupon, adresse, paiement, inscription ou certificat. Lectures générales natives et connexion des comptes fictifs seulement ; aucun code de réduction ou nom de passerelle réel utilisé.

Premier essai arrêté sur sélecteur Remise au lieu du texte réel Remise: (ponctuation existante). Harnais corrigé uniquement, traces initiales conservées ; quatre parcours finaux terminés. **Zéro pageerror / zéro HTTP en erreur dans cette recette ciblée**, quatre appels de télémétrie boot_config bloqués. Cela ne constitue pas une réussite du contrôle JavaScript global de FR-02C.2 : les **16 rejets de validation préexistants restent ouverts**, non corrigés/non masqués, leurs scénarios ne sont pas rejoués ici. Le mock Vue historique ne reproduit pas leur relance.

### Autres contrôles / non exécutés

Prettier ciblé, Ruff lint, format du nouveau test Python, AST d’invariants, diff Git et recherche ciblée de secrets réussis. Lanceur pre-commit global historiquement bloqué non relancé ; hooks désactivés après contrôles ciblés. Première exécution du contrôle d’intégrité interrompue sur manifeste incomplet de 38 PO ; reprise complète réussie après correction du chemin de référence (78).

Aucun build : aucune source Vue/asset frontend modifiée depuis FR-02C.2 ; navigateur sur assets existants et nouvelles traductions compilées. Aucune réinstallation, suite globale, transaction réelle, get_payment_link serveur, callback, création de certificat, écriture de coupon/adresse, PDF, lecteur d’écran exhaustif ou visiteur Guest. Erreurs backend testées en Python simulé, pas provoquées via une passerelle réelle ni un coupon du site.

## Fichiers, preuves et suite

Code/tests : utils.py (seul argument de message), Billing.test.ts, nouveau test_coupon_messages.py. Catalogues : fr.po/main.pot. Documentation : ce rapport et CODEX_HANDOFF.md. Commit code/tests : **5a271c99** ; second commit catalogues/rapport/handoff à relever avec git log -1.

Preuves hors Git : `/workspace/work/fr02c3/` (snapshots, translation-plan.json, summary.json, génération/compilation, tests Vue/Python avec échecs intermédiaires, browser.cjs/json et captures FR/EN, check-final.log/json). Aucun compte, cookie, secret ou asset généré suivi.

Distant vérifié à 389affaa ; develop inchangé à 6b791f33b34efa15566a0cb707f5be59d136df50. Deux commits locaux à soumettre pour autorisation ; aucun push/PR/Crowdin/déploiement. **Arrêt après FR-02C.3** : prochaine action, revue puis autorisation de publication. FR-02C.4, gestion des rejets et doubles clics restent hors périmètre.
