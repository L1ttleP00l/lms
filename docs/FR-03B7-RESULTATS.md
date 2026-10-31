# FR-03B.7 — Transactions, statuts et erreurs

31 octobre 2026. Branche exclusive `littlepool-dev`.

## Publication préalable et base

FR-03B.6 publié par push normal autorisé : **ebef8f52f9bf0d2595848ecb4423a3a06c225339**, puis **c040d188ead7cd3557ec47bdb9a497f5a9928a8e**. Distant initial 866b742c confirmé ; ordre, douze fichiers et diff, 896 traductions/3 013 POT (+3/-0), empreintes des 78 autres PO et Framework contrôlés. Preuves 86 Vue/sept extraction/compilation/build/navigateur relues sans relancer ces tests pour publier. Aucun appel sensible transmis. Rapport GitHub récupéré au SHA et identique ; checkout propre/HEAD égal au distant. develop reste 6b791f33b34efa15566a0cb707f5be59d136df50. Les références locales develop et origin/littlepool-dev sont absentes ici : contrôle effectué avec ls-remote, sans créer/modifier ces branches.

**c040d188 est la base réellement publiée de FR-03B.7. Aucun push de ce lot.** AGENTS/handoff, audit FR-03A, résultats FR-03B3/B6, glossaire et sections utiles du plan relus. Environnement existant conservé : aucun conteneur/dépendance installé, aucune lecture de transaction réelle.

## Périmètre et diagnostic métier

Une seule source applicative modifiée : **Transactions/transactions.ts**, six occurrences de libellés. TransactionForm.vue, Transactions.vue, AddressModal.vue, recordForm/rowActions, renderers, usePermissions, API, hooks et DocType restent inchangés. Douze nouvelles valeurs françaises, sans étendre aux coupons/adresses/passerelles ni à tous les champs du formulaire.

### Filtre For Course

`statusFilters('Course')` renvoie uniquement `[['payment_for_certificate', '=', 0]]`. Aucun critère `payment_for_document_type = 'LMS Course'`. Le Select du DocType LMS Payment accepte LMS Course et LMS Batch ; les helpers d’inscription du personnel peuvent enregistrer des paiements pour les deux types. **Une session sans option certificat est donc incluse.** Ce n’est pas un filtre exclusivement cours.

Le seul changement est **For Course → Other payments → Autres paiements**, complément de For Certificate. `value: 'Course'` et les critères restent identiques. C’est une correction du libellé trompeur, pas du comportement de filtrage. Un éventuel filtre distinct par type de document est un besoin fonctionnel séparé, à autoriser et spécifier ; rien de tel n’est développé ici.

### Reçu / non reçu

Paid/Unpaid deviennent les libellés anglais **Received/Not received**, traduits **Reçu/Non reçu**. La clé Received possède déjà la valeur Reçu et sert au commutateur du même formulaire ; elle n’est pas modifiée globalement. Les valeurs techniques **Paid/Unpaid** demeurent inchangées.

Le champ payment_received est un indicateur de l’enregistrement. Le paiement du personnel peut le positionner sans capture de passerelle. Ces termes ne garantissent ni débit bancaire, rapprochement, remboursement ou livraison de certificat. For Certificate → Option certificat est réutilisé dans le badge bleu, sans annoncer une délivrance.

| Valeur technique | Critère inchangé | Présentation |
| --- | --- | --- |
| All | aucun | Tous les paiements / All Payments |
| Paid | payment_received = 1 | Reçu / Received ; vert |
| Unpaid | payment_received = 0 | Non reçu / Not received ; ambre |
| Certificate | payment_for_certificate = 1 | Option certificat / For Certificate ; badge bleu si applicable |
| Course | payment_for_certificate = 0 | Autres paiements / Other payments ; inclut des sessions |

Recherche OR billing_name/member, champs demandés, tri, pagination, montants/devises, conditions de badges, REQUIRED_FIELDS, minimums, GST, coupons et source/save inchangés. Comparaison AST de transactions.ts identique après normalisation des seuls libellés traduits ; aucune nouvelle condition ou requête.

## Douze traductions nouvelles

| Clé anglaise exacte | Français |
| --- | --- |
| All Payments | Tous les paiements |
| Not received | Non reçu |
| For Certificate | Option certificat |
| Other payments | Autres paiements |
| Delete this transaction? | Supprimer cette transaction ? |
| This will permanently delete this payment record, including its billing details. This cannot be undone. | Cette action supprime définitivement cet enregistrement de paiement, y compris ses détails de facturation. Elle ne peut pas être annulée. |
| Unable to delete transaction | Impossible de supprimer la transaction |
| Transaction deleted successfully | Transaction supprimée avec succès |
| Transaction created successfully | Transaction créée avec succès |
| Transaction updated successfully | Transaction mise à jour avec succès |
| Error saving transaction | Erreur lors de l'enregistrement de la transaction |
| Filter by payment status | Filtrer par statut du paiement |

**Aucune des 896 valeurs françaises antérieures modifiée ou supprimée.** Quatre entrées auparavant vides renseignées ; huit entrées ajoutées depuis le POT. Reçu, Supprimer, Enregistrer et Actions pour {0} sont réutilisés. Les douze clés n’ont pas de paramètres numériques ; contrôles de paramètres/contextes/flags et conservation des autres blocs effectués. Les usages partagés ont été recherchés : clés de transaction locales, Received déjà employé avec le même sens par le formulaire ; aucun remplacement global de Paid/Course/Certificate.

Le message de suppression annonce explicitement la suppression définitive de l’enregistrement et de ses détails de facturation, sans remboursement implicite. Le code de suppression, son appel et les conséquences serveur ne sont pas modifiés.

## POT, PO et runtime

Génération **native** `bench generate-pot-file --app lms`, aucun helper de publication ni update-po-files. **3 013 → 3 012 clés : +2, -3**.

- Ajouts : **Not received**, **Other payments**.
- Retraits : **Paid**, **Unpaid**, **For Course**. Leurs seules références sources traduisibles étaient les occurrences remplacées ci-dessus. Recherche ciblée des appels connus frontend/backend : aucun usage littéral restant. Les valeurs techniques anglaises restent dans statusOptions/statusFilters et d’autres données métier, elles ne sont pas des clés de libellé retirées. Ces trois clés n’avaient pas d’entrée dans le PO français ; aucune traduction existante n’est effacée. Aucun nettoyage d’autres PO.
- Trois clés communes ont des références modifiées : Certificate perd seulement sa référence de badge et reste au catalogue pour les métadonnées ; For Certificate gagne la référence du badge ; Received gagne les deux références de statuts. Dates natives d’en-tête en plus ; aucun autre changement de contenu/contextes/flags/pluriels.
- PO **2 819 → 2 827 entrées**, **896 → 908 valeurs renseignées**, par Babel contrôlé avec préservation des blocs/en-tête hors douze clés. Les 78 autres PO conservent leur empreinte ; Framework propre à 959b85de4086656273e1d158f41923dd3808c350.
- Babel PO/POT valide. Compilation native `bench compile-po-to-mo --app lms --locale fr`, puis cache du seul site `learning.localhost` via `frappe.translate.clear_cache` : réussis. Les douze valeurs concordent réellement entre PO, MO et get_all_translations('fr'). Anglais/repli et préférences FR/EN préservés, aucune préférence ni langue système modifiée.

Une première validation hors dépôt a échoué parce que le script nommé inspect.py masquait le module Python standard inspect ; renommé, sans installer de dépendance ni changer l’application. Contrôle final réussi, pas un échec Babel du catalogue.

## Permissions et erreurs : portée des preuves

Lecture seule du JSON LMS Payment : **System Manager et Moderator** possèdent les droits généraux read/create/write/delete. Pas de DocPerm générale de ce type pour Course Creator/Batch Evaluator. Les autorisations d’inscription multiple `can_record_payments` ne donnent pas à elles seules l’administration générale des transactions.

`usePermissions` demande get_doc_permissions_many ; ce dernier renvoie les permissions effectives du document et masque les réponses sans read. Le menu de ligne attend `can('delete')`, initialement faux. Les tests réutilisent les critères natifs et réponses fictives : gestionnaire, lecteur sans suppression, refus total et erreur de chargement des permissions. Aucune attribution réelle de rôle. Le refus de suppression et sa traduction de secours sont testés avec une fonction call entièrement simulée.

**Limites importantes :** le composant Transactions ne masque pas lui-même Nouveau selon une DocPerm, et le formulaire n’ajoute pas de garde de rôle. Les opérations serveur doivent appliquer leurs contrôles natifs ; aucun droit UI ou appel API n’est changé ici. Les permissions effectives d’une instance avec Custom DocPerm ne sont pas certifiées. Un refus/échec de chargement de la liste ne possède pas de message local traduit explicite dans ce composant : amélioration à traiter séparément ; pas de promesse d’un parcours d’erreur réseau intégralement francisé. Le test d’échec de chargement concerne la réponse de permissions native, pas tous les refus de liste. Les messages serveur détaillés sont conservés ; un texte anglais fourni par le serveur peut encore apparaître.

## Tests ciblés

**105 tests / sept fichiers réussis dans une même exécution finale (21,05 s)** : transactionsI18n nouveau, settingsList, settingsListResource, settingsListSearch, settingsTableScroll, settingsContract et usePermissions. **24 nouveaux cas**, 81 existants.

Nouveaux cas : FR/EN de filtres/badges et couleurs, critères et valeurs techniques, inclusion des sessions, relais du filtre par Transactions, nom accessible du filtre et actions avec interpolation, dialogue irréversible sans écriture avant confirmation ; succès/refus de suppression entièrement fictifs ; création/modification/erreur de sauvegarde et validation obligatoire du vrai formulaire avec document/source fictifs ; invariance des valeurs de montant/documents. Quatre cas utilisent le vrai usePermissions avec seed/fetcher fictifs. runSave natif utilisé, aucune requête réseau par les mocks Vue.

Passages préparatoires : 89/101 puis 95/101, puis 16/20 ont révélé des défauts du harnais (PO lu avant la mise à jour, slots/header-bottom masqués par shallowMount, ErrorMessage anonyme auto-stubbé). Corrections limitées aux mocks/stubs. 20/20 puis 101/101 ; ajout des quatre vérifications natives de permission puis **105/105 dans la sélection complète**, et non une déduction à partir d’une relance isolée. Aucun défaut applicatif corrigé pour faire passer le harnais.

Build frontend requis : application **17,40 s**, signup **1,62 s**, commande **21,83 s**, réussie ; déclaration components.d.ts générée restaurée, assets/MO ignorés. Avertissements Vite/Browserslist/fs préexistants. Prettier des deux fichiers frontend, AST, Babel/paramètres, empreintes, diff et recherche ciblée de secrets contrôlés. Hooks désactivés après contrôles explicites, lanceur pre-commit complet historiquement bloqué non relancé. Aucun Python/backend transactionnel ni suite Vue globale. Tests d’extraction FR-03B.6 non rejoués : mapping/extracteurs inchangés ; nouvelles clés contrôlées dans le POT natif.

## Chromium : simulation et limites

Deux parcours **ordinateur FR/EN** sur le site existant, comptes apprenants fictifs avec personnel simulé dans get_user_info : liste de trois paiements fictifs (cours/session, reçu/non reçu, certificat/autre), cinq options de filtre, quatre critères, recherche combinée par nom, aucun résultat, dialogue de suppression avec avertissement sans confirmation, formulaire avec montant 100 EUR fictif, modification locale du nom et message de succès.

**Deux sauvegardes navigateur de modification entièrement simulées**, une FR et une EN, via fulfill local de frappe.client.set_value pour LMS Payment. Aucune requête sensible n’a atteint le serveur. Création, validation invalide, erreur de sauvegarde et refus de suppression sont vérifiés en composants, pas déclarés comme des transactions navigateur réelles. Aucun insert/delete/coupon/Address/passerelle/inscription/rôle/certificat/email réel tenté. Aucun encaissement réel validé.

Deux vérifications **mobile FR/EN** sur /you#settings/transactions confirment l’absence native de ce panneau d’administration : aucun filtre/dialogue exposé. **Ne pas les qualifier de deux recettes complètes de transactions sur mobile**, aucun écran inventé.

Interceptions installées avant connexion/navigation. Toutes lectures LMS Payment, User/référentiels/liens/configurations sont fictives ; méthodes inconnues et REST bloqués, seule authentification des comptes de test, ping et traduction native autorisés vers le site. Recette principale : quatre résultats, zéro pageerror, zéro réponse HTTP en erreur, quatre boot_config bloqués ; **deux écritures attendues simulées, zéro écriture imprévue, zéro écriture sensible transmise**. Le compteur sensitiveRequestsAttempted du script compte seulement les tentatives non prévues ; ne pas le confondre avec les deux sauvegardes simulées.

Premiers essais navigateur échoués dans le harnais : filtres initiaux sous forme d’objet non normalisés ; Select Reka pris pour un select HTML ; data-testid posé sur l’input lui-même, pas un conteneur. Adaptations du script uniquement, interceptions maintenues. Traces conservées, aucune logique applicative modifiée.

### Revue visuelle et contrôle complémentaire final

Deux contrôles de lecture supplémentaires FR/EN sur ordinateur confirment les badges rendus dans la liste, le focus **dans** le dialogue de suppression, l’absence d’action Supprimer après une réponse de lecture seule rechargée, et l’absence de débordement horizontal du dialogue à 1440 px. Aucune sauvegarde ni suppression dans ces contrôles supplémentaires. Les premières attentes de ce script ont échoué après Échap/panneau fermé et changement de réponse de permissions sans vider le cache natif ; le harnais rouvre explicitement le panneau et recharge la page avant le cas de lecture seule. Aucun cache applicatif ou mécanisme de permissions n’est modifié.

La capture initiale montrait le badge « Pour l’option certificat » tronqué. **La valeur finale est « Option certificat »**, qui reste fidèle au filtre et au badge, lisible sur la capture finale sans changement de largeur/CSS ni treizième traduction. L’anglais source demeure For Certificate. Après cet ajustement PO/test : recompilation/cache et PO/MO/dictionnaire de nouveau vérifiés, **105/105 dans les sept fichiers en une exécution de 21,05 s**, deux vérifications visuelles FR/EN finales réussies. Le build précédent reste applicable : sources applicatives inchangées, seule valeur PO et attente de test raccourcies. Les quatre parcours principaux précèdent ce raccourcissement ; les deux lectures finales valident la valeur livrée. Ne pas prétendre que toutes les captures initiales montrent le texte final.

## Limites et suite

Lot volontairement limité à douze valeurs. Restent notamment : New Transaction, Fill in every required field, No results/No {0} match {1}, descriptions/champs secondaires anglais, Batch → Lot dans ce formulaire, état de chargement/refus de liste, traductions serveur détaillées. L’état vide avec recherche a été observé en anglais en FR : repli confirmé, pas traduction française annoncée. Ne pas élargir automatiquement aux adresses/coupons.

Conserver les limites historiques : toast mobile FR-03B.1 non confirmé ; 16 rejets JavaScript historiques et contrôle JS global non validé ; double clic paiement non corrigé ; transactions financières réelles non testées ; dates/heures I18N-01 ; avertissements de suppression des cours/sessions non exhaustifs ; administration mobile absente ; description de durée FR-03B.6 non associée au contrôle. Pas de certification globale d’accessibilité ou d’autorisations de production.

Éléments à proposer pour FR-03B.8 uniquement après autorisation : champs/validation/états vides résiduels des transactions, présentation des erreurs de chargement, éventuel filtre distinct cours/session ; confirmer son périmètre avant action. Aucune nouvelle phase commencée.

## Livraison locale et preuves

Six fichiers : transactions.ts, nouveau transactionsI18n.test.ts, fr.po/main.pot, ce rapport, CODEX_HANDOFF.md. Commit source/tests **36d73db1** ; second commit catalogues/rapport/handoff à relever avec git log -1. Aucun push FR-03B.7, PR, Crowdin, déploiement, develop/Framework/OMV modifié.

Preuves hors Git `/workspace/work/fr03b7/` : snapshots/empreintes, traductions et plan, summary, génération, tests Vue initiaux/final complet, compilation/check, build, invariants AST, browser/inspection et captures exclusivement fictives. Ne pas publier les comptes/cookies/journaux privés ni les assets/MO. Prochaine opération : revue de ce lot et autorisation explicite avant sa publication.
