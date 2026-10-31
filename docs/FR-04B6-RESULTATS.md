# FR-04B.6 — Documents et PDF de certification

31 octobre 2026 (Europe/Paris), `littlepool-dev`, base publiée vérifiée **c0a5474f79146c2d46cb62565e27343f04634955**, checkout initial propre. Correctif/tests : **812d5a0c** ; catalogues/rapport/handoff dans le commit suivant (SHA via git log -1). AGENTS/handoff, ROADMAP, audit A, résultats B.1/B.3, politique B.5C.2, clôture FR-03 et glossaire consultés ; dépendances existantes réutilisées.

**Livraison partielle : HTML standard FR/EN validé en isolation ; PDF binaire non validé. Print Format installé en base non synchronisé et non déclaré corrigé.** Aucun certificat délivré, email, écriture métier ou ressource externe téléchargée. Politique de diffusion C.2 toujours proposée, non adoptée.

## 1. Architecture et chemins réels

| Chemin                                     | Document/format et paramètres                                                                                                                                                  | Langue, droits, réponse et effets                                                                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/certificate?certificate_id=…`            | www/certificate.py lit template pour l’identifiant et redirige vers download_pdf ; doctype=LMS Certificate, name, format encodé, no_letterhead=1                               | Pas de paramètre language ajouté. La redirection ne rend pas le PDF et ne remplace pas son contrôle d’accès ; lecture de template en amont du contrôle natif. Aucun changement de route/paramètres           |
| Lien « See on Website » du formulaire Desk | lms_certificate.js construit directement la même URL, avec doc.name et doc.template                                                                                            | Pas language explicite : contexte HTTP courant. Ce lien est différent du dialogue d’impression Desk                                                                                                          |
| Frontend certificat                        | CourseCertification, ProfileCertificates, CourseCardOverlay, CertificationLinks et Modals/Event construisent le même endpoint avec name/format/no_letterhead                   | Même langue courante sans forçage par titulaire ; pas de modification Vue. Le courriel certification.html fournit aussi un lien encodé équivalent                                                            |
| Impression native Desk                     | Page printing/page/print et dialogue de pièce jointe choisissent le format et une langue ; aperçu get_html_and_style/printview, téléchargement simple ou multiple selon action | UI choisit doc.language puis default_print_language puis boot.lang. Le schéma LMS Certificate n’a pas language ; le format Certificate propose donc en par défaut. Choix explicite de l’utilisateur possible |
| Endpoint natif simple                      | frappe.utils.print_format.download_pdf, allow_guest=True, document fourni/chargé, validate_print_permission puis print_language(language) et get_print(as_pdf=True)            | Langue explicite ou contexte conservé si absente. Réponse native type pdf, filename nettoyé et contenu. Le test emploie un contenu sentinelle HTML, **pas un vrai PDF**                                      |
| Impression multiple native                 | \_download_multi_pdf ; chemin général Framework, pas nouveau bouton LMS                                                                                                        | Priorité doc.language s’il existe, puis langue du format, puis demandée, puis contexte natif. Writer/branche PDF arrêtés en mémoire dans le test avant production binaire                                    |
| Modèle personnalisé                        | doc.template lié à Print Format ; choix explicite conservé. get_print_format_doc utilise le nom demandé puis défaut natif si format absent/supprimé                            | Ses littéraux restent ceux de l’auteur. Sa langue par défaut influence le Desk/multiple, pas automatiquement tous les appels simples                                                                         |

get_print résout le format et le moteur, prépare form_dict temporairement, passe par les renderers natifs et restaure form_dict. Le modèle standard est custom_format=1, Jinja classique ; son JSON mentionne wkhtmltopdf, mais la version installée résout le moteur parmi ses générateurs effectivement disponibles/configurés et hooks. **La présence de ce champ historique ne prouve pas un moteur binaire opérationnel.** Les moteurs HTML natifs, le convertisseur beta et les hooks peuvent suivre d’autres branches. Aucune route ni aucun générateur ajouté.

Le chemin complet printview/get_print peut journaliser un Access Log ; une impression multiple asynchrone peut produire un File. Aucun de ces effets n’est exécuté ici. Les anciens tests transactionnels test_certificate_pdf_url/test_lms_certificate/test_certificate_member_access sont lus, **pas exécutés sur un site**.

## 2. Priorités de langue confirmées

| Entrée                                        | Cas vérifié ou confirmé par source                                                                                                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Download simple, contexte EN, language=fr     | HTML FR dans le périmètre natif ; contexte EN restauré                                                                                                                             |
| Download simple, contexte FR, language=en     | HTML EN ; contexte FR restauré                                                                                                                                                     |
| Download simple sans language, contexte FR/EN | Conserve ce contexte même si le format déclare en                                                                                                                                  |
| Multiple, format=en et demande=fr             | **en prioritaire**, confirmé par exécution du résolveur natif jusqu’à la frontière PDF                                                                                             |
| Multiple, format=fr et demande=en             | fr prioritaire                                                                                                                                                                     |
| Multiple, format sans langue et demande=fr    | fr ; sans aucune langue demandée ni de format, contexte précédent conservé                                                                                                         |
| Desk, utilisateur FR/EN                       | Le boot exprime normalement sa préférence/repli ; le défaut du format en peut prendre priorité dans le sélecteur. Sources JS lues, pas de session Desk réelle rejouée              |
| Titulaire, tiers, Guest publié                | Même règle de langue du chemin, aucune sélection automatique du titulaire. Autorisation testée séparément de la langue ; pas de simulation d’une connexion réelle de chaque profil |

**default_print_language reste exactement "en".** Le retirer changerait la priorité native Desk/multiple et potentiellement les modèles/flux existants ; ce lot ne le fait pas. Aucun language persistant, préférence User/System Settings ou résolveur parallèle introduit.

Politique proposée pour une adoption ultérieure : langue demandée explicitement par le lecteur lorsqu’il la choisit ; sinon comportement natif du chemin et choix de l’auteur du format. Ne pas imposer la langue du titulaire aux visiteurs d’un certificat publié. Une harmonisation Desk/simple/multiple nécessiterait une spécification distincte et ne relève pas de la correction de texte. I18N-01 non commencé.

## 3. Correction standard et extraction native

Le HTML imbriqué dans le JSON n’était pas couvert par le mapping gettext du checkout : anciennes clés de phrase absentes du POT, « on » littéral et fragments mêlant les langues. Nouveau fichier **lms/templates/print_formats/certificate.html**, inclus depuis le champ HTML du JSON avec le **include Jinja natif**.

Aucun extracteur, mapping ou Framework modifié. Le fichier n’est pas placé dans le dossier du Print Format sous le nom certificate.html : cela éviterait un import mais constituerait une surcharge runtime native prioritaire sur le HTML en base, y compris une personnalisation homonyme. **Cette surcharge n’est pas utilisée.** La correction ne devient donc visible pour un format déjà installé que si son HTML inclut effectivement le nouveau template après adoption contrôlée.

Présentation conservée : titre d’attestation, nom du titulaire dans son bloc existant, puis proposition principale complète (cours + évaluations + date) en une unité gettext paramétrée, au lieu de fragments contraignant l’ordre anglais :

-   This is to certify that → **Nous attestons que**.
-   has successfully completed the course {0}, including all required assessments, on {1}. → **a terminé avec succès le cours {0}, y compris toutes les évaluations requises, le {1}.**
-   Evaluated By → **Évalué par**. Instructor/Formateur et Instructors/Formateurs déjà renseignés, conservés.

Le nom séparé visuellement reste le sujet grammatical. L’introduction et la proposition principale forment ensemble l’attestation ; le cours/date peuvent être réordonnés dans cette dernière traduction sans concaténer course, including ou on. Le paramètre {0} contient uniquement le span de présentation connu et le titre échappé, {1} la date formatée/échappée. Aucun `|safe` ajouté.

Exemple fictif de lecture FR : Nous attestons que / Élodie & Noël / a terminé avec succès le cours Écologie & océans, y compris toutes les évaluations requises, le 17 mai 2027. Source EN conservée et rendue en anglais avec May 17, 2027. Aucune traduction de nom propre ou titre pédagogique.

## 4. Dates, HTML et modèle personnalisé

issue_date est une Date civile obligatoire avec défaut Today ; format_date medium natif conservé, sans conversion de fuseau. Date française/anglaise et date du changement d’heure 28 mars2027 vérifiées sans déplacement de jour. expiry_date facultative n’était pas affichée et ne l’est toujours pas : test absente/présente, valeur inchangée. Aucune règle d’expiration modifiée.

Échappement explicite du nom, cours, marque, évaluateur, noms des formateurs et attribut logo. Tests accents/esperluettes/guillemets/balises. Liste d’un ou plusieurs formateurs si pas d’évaluateur, évaluateur sinon ; logo présent/absent et marque conservés. Les champs métier restent identiques ; les ajustements flags/heading purement en mémoire du moteur de rendu natif ne sont pas une sauvegarde du certificat.

Le CSS JSON, la bordure, Landscape, logo, typographie déclarée, alignement, styles et blocs nom/formateurs sont conservés ; seuls HTML et date modified du JSON changent. Ce contrôle structurel ne prouve pas une équivalence visuelle pixel par pixel ou une pagination PDF.

Les liens Google Fonts/preconnect existants sont conservés sans téléchargement. Un lecteur/générateur pourrait émettre des requêtes vers Google, révélant au moins des métadonnées réseau selon sa configuration ; les URL fixes de police ne contiennent pas les noms du certificat. Sans réseau, disponibilité d’Inter, polices de secours, accents et métriques PDF ne sont pas garantis. Aucune police installée, aucune ressource externe chargée pour les tests. Futur rendu binaire : ressources locales disponibles et figées à évaluer sous mandat, ou constat de blocage ; pas de contournement réseau.

Print Format personnalisé fictif : vraie résolution native par son nom, puis rendu de son propre HTML pour défaut en/fr/absent. Les littéraux d’auteur restent intacts ; aucune substitution par Certificate. Les données accessibles restent doc/meta/layout/letterhead/print_settings selon le moteur et les globals natifs, pas un contexte LMS concurrent. Les personnalisations réelles en base ne sont pas consultées.

## 5. Permissions et confidentialité

Aucun changement de has_permission, has_website_permission, publication, DocShare, rôle, inscription, évaluation ou délivrance. validate_print_permission natif accepte le droit read **ou** print, puis ses autres voies natives (permission website, clé, Web Form approprié) ; il n’exige pas nécessairement les deux droits. L’endpoint allow_guest ne signifie pas libre accès à tout certificat.

Tests isolés : titulaire privé autorisé, autre compte/Guest privé refusé, tiers/Guest publié autorisé ; refus du download avant la frontière get_print. Les délégations natives vers les fonctions LMS sont réelles, mais session/rôles/lectures sont fictifs ; DocShare et configurations effectives ne sont pas validés sur instance. Aucun certificat privé rendu public.

Le droit historique de lecture/impression de certains personnels est plus large que leurs affectations : **réserve FR-03 conservée**, aucune modification linguistique pour le restreindre ou l’élargir. Le certificat publié expose intentionnellement les données prévues par son format ; la politique de publication/consentement et les configurations réelles nécessitent leur revue, non réalisée ici.

## 6. Synchronisation du Print Format installé

Distinguer les états :

1. JSON/template Git corrigés et publiables ; modified de la source actualisé, tous les autres attributs du format inchangés.
2. Format en base éventuellement ancien ou personnalisé : aucune lecture/import/mise à jour de ce document effectués.
3. Cache natif éventuel : aucune purge ni promesse de rechargement immédiat.
4. Impression effective : nécessite adoption et recette ultérieures ; elle n’est pas déduite de l’état1.

Frappe.model.sync importe les fichiers standards via import_file_by_path. Pour un document non DocType déjà présent, l’import non forcé peut être omis si la date DB est au moins celle du JSON ; force contourne ces contrôles. Les protections particulières d’autres DocTypes ne constituent pas une garantie générale de conservation d’une personnalisation Print Format homonyme. La date source actualisée ne suffit donc ni à prouver une adoption ni à protéger toute version personnalisée plus ancienne.

Future opération à autoriser explicitement : sauvegarder/comparer le Print Format installé et les personnalisations, choisir le format cible, contrôler dates/options d’import et hooks, adopter par le mécanisme natif retenu sur développement isolé, puis contrôler cache, HTML FR/EN et PDF hors réseau. **Aucun migrate, reload forcé, import manuel, modification SQL, purge ou redémarrage exécuté.** Ne pas écraser un modèle d’auteur ni considérer ce rapport comme autorisation de le faire. Réserve de synchronisation du rappel B.3 inchangée, distincte de celle du format Certificate.

## 7. Tests réellement exécutés

Nouvelle sélection sans site : `python -m unittest lms.tests.test_certificate_print_language -v`, **14/14 méthodes réussies en 1,270 s**. Plusieurs sous-cas par méthode. Vrai get_rendered_template/get_print_format/get_print_format_doc, hook pdf_body_html, Jinja, format_date, print_language, endpoint download_pdf et validate_print_permission. Pour le multiple, vraie résolution jusqu’au get_print, arrêté par exception sentinelle avant PDF/writer.

Remplacements explicités : DB/Settings/meta/identités/session/rôles fictifs ; layout vide adapté au format HTML autonome, letterhead vide, before_print et conversion Markdown/docstatus isolés afin d’éviter des effets de modèle. Aucun moteur de rendu maison. get_print du test download est une frontière qui retourne du HTML encodé pour contrôler le contexte/réponse ; **ce contenu de réponse simulée n’est pas un PDF**. Chemin HTTP/middleware, renderer binaire, Access Log, permissions réelles, Desk/Chromium et réception client non validés.

Couverture : standard FR/EN, proposition française et on absent, sources anglaises, accents/HTML/attributs, logo, évaluateur/formateurs, date/expiration facultative, formats personnalisés avec/sans défaut, contexte restauré après succès/exception, refus et publication, URL LMS inchangée, priorité multiple différente, pas de surcharge runtime du format ni mutation des champs métier.

Régression avant correction : après mise au point du harnais, un test réellement échoué en français sur le rendu historique mêlant This is to certify that/has successfully/including/on et cours. Incidents de harnais initiaux : message_log non lié, puis Mock DB non autorisé par le sandbox ; remplacé par méthodes de lecture fictives dans les globals natifs. Après sources avant PO : 11 méthodes, un échec de français manquant et deux erreurs de mock get_hooks ne prenant pas app_name ; corrigé sans modifier Framework. Après PO : 11/11, puis ajout des trois contrôles complémentaires et exécution finale complète14/14. Une commande de lecture lancée depuis /workspace a été relancée avec le bon répertoire, sans effet sur les sources. Le contrôle final du diff cumulé a détecté un espace final dans une ligne vide du nouveau HTML, non couvert par un contrôle antérieur sur les seuls changements suivis ; retiré avant publication et commits locaux rectifiés. Aucun contenu ni emplacement de clé changé, pas de relance fonctionnelle pour ce seul espace.

Ruff lint/format du nouveau Python réussis ; Babel et extraction/compilation natifs, contrôle des sources/JSON, paramètres, empreintes, diff et recherche ciblée de secrets conformes. Lanceur complet de hooks non exécuté. Aucun ancien test transactionnel, suite globale, frontend/build ou SMTP relancé. Dépendances non réinstallées.

Isolation : create_certificate, after_insert, send_certification_email, sendmail, enqueue/enqueue_doc, impression générique hors frontière de test, vraie Email Queue/Communication, création de document et DocShare, SQL/écritures, connexion de site, SMTP et socket bloqués/interceptés. Aucun appel de scheduler, File/upload ou publication. Les seuls documents sont des objets fictifs en mémoire. **Zéro certificat réel, zéro email réel, zéro écriture métier réelle.**

## 8. Catalogues et intégrité

Extraction réelle : `bench generate-pot-file --app lms`. **POT3 021 → 3 024, trois ajouts, zéro retrait** : les trois clés listées en section3, toutes référencées dans le nouveau template Jinja. Dix-sept clés communes ont des références modifiées : nouvelles références Instructor/Instructors et réalignements de lignes des contrôleurs d’annonces C.1 qui n’avaient pas requis d’extraction. Références hors de ces trois fichiers inchangées ; pas de perte de message ou de nouveau mapping.

PO français **2 855 → 2 858 entrées**, **995 → 998 traductions renseignées**. Trois blocs ajoutés via Babel et uniquement eux ; 995 valeurs précédentes préservées, flags/contextes/pluriels et paramètres {0}/{1} conservés, aucun pluriel nouveau. Les 78 autres PO (38 LMS +40 Framework) identiques aux empreintes de référence. Aucun catalogue Framework modifié.

Compilation native `bench compile-po-to-mo --app lms --locale fr --force` ; trois valeurs vérifiées dans le MO hors Git, puis **deux rendus HTML natifs FR/EN depuis ce dictionnaire compilé**. Aucun cache de site invalidé ; le fonctionnement d’un dictionnaire déjà en cache d’instance n’est pas revendiqué. Aucun update-po-files/Crowdin.

Sept fichiers : JSON standard, nouveau template HTML, nouveau test Python, fr.po/main.pot, ce rapport et CODEX_HANDOFF.md. Contrôleurs LMS/JS/Vue/www, permissions et hooks inchangés ; Framework propre à 959b85de, develop distant6b791f33 conservé. Les détails de contrôle et rendus fictifs sont hors Git dans `/workspace/work/fr04b6/`.

## 9. Statut et suite recommandée

**HTML validé ; PDF binaire et Print Format installé non validés.** Publicité/campagnes non activées, politique C.2 non adoptée ; limites B.4/B.5 (langue de masse, portail persistant, offset DST, Markdown/URLs et indicateurs sans preuve de livraison), réserve B.3 et réserves FR-03 conservées. Aucun déploiement ni intervention OMV8, aucune PR/migration/Crowdin, I18N-01 non commencé.

Suite proposée : mandat d’adoption contrôlée du format sur développement avec sauvegarde/comparaison des personnalisations, puis recette binaire sur fixtures hors réseau si les ressources sont disponibles. Arbitrer séparément la priorité de langue Desk/multiple avant toute modification de default_print_language ; revue de permissions et politique de diffusion restent distinctes. **Arrêt après ce lot et sa publication contrôlée**, sans enchaînement automatique.
