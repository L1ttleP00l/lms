# FR-01F — Pilote local de traduction française

Date : 29 octobre 2026 (Europe/Paris). Branche littlepool-dev ; base locale 0b71f90c (FR-01E non publié), dernier distant vérifié 2279552914d1fb51dd425effcf192e4a2b519e11. develop reste 6b791f33b34efa15566a0cb707f5be59d136df50.

## Autorisation et résultat

L’utilisateur autorise explicitement une **dérogation limitée à AGENTS.md pour le seul fr.po LMS et les 21 clés de ce pilote**. La convention générale Crowdin reste intacte ; aucune autorisation implicite pour les autres langues ou futurs lots. Aucun contenu pédagogique, nom de personne, donnée métier, source d’interface ou source Framework traduit/modifié.

**18 traductions renseignées supplémentaires, une correction et deux conservées.** Les 18 se répartissent entre 15 entrées ajoutées depuis le POT et trois entrées déjà présentes mais vides. Upload Image est corrigé de Télécharger une image vers Importer une image. Courses → Cours et Uploading {0}% → Envoi de {0}% sont conservés. Total PO : **2 673 → 2 688 entrées ; 568 → 586 traductions non vides**. Les 21 clés ciblées sont désormais traduites dans le PO, le MO et le dictionnaire réellement chargé.

## Les 21 clés : relevé initial et résultat

Toutes sont présentes dans le POT publié de 2 980 clés. Les colonnes PO et traduction initiale décrivent l’état avant pilote ; la dernière colonne est le choix appliqué, soumis à la relecture finale du pilote. Les formulations ne valent pas validation générale de tout le glossaire.

| Clé anglaise exacte | Contexte | POT | PO initial | Français initial | Français retenu |
| --- | --- | --- | --- | --- | --- |
| `Student Progress` | Titre du dialogue de progression individuelle | Oui | Absente | — (absent) | Progression de l’apprenant |
| `Courses` | Carte/statistiques et autres listes de cours | Oui | Présente | Cours | Cours |
| `Signups` | Comptes utilisateurs activés ; répartition par date de création | Oui | Présente | — (vide) | Comptes créés |
| `Enrollments` | Inscriptions : cours dans les statistiques, parcours dans ProgramProgressSummary | Oui | Présente | — (vide) | Inscriptions |
| `Completions` | Inscriptions de cours à 100 % ; carte et graphique | Oui | Absente | — (absent) | Cours terminés |
| `Certifications` | Compteur de certificats publiés ; aussi libellé de navigation/paramétrage | Oui | Absente | — (absent) | Certificats |
| `Signups per day` | Créations de comptes par jour, filtre utilisateurs activés | Oui | Absente | — (absent) | Comptes créés par jour |
| `Enrollments per day` | Inscriptions aux cours par jour | Oui | Absente | — (absent) | Inscriptions aux cours par jour |
| `Certifications per day` | Certificats publiés regroupés selon issue_date | Oui | Absente | — (absent) | Certificats publiés par jour |
| `Course Completion` | Sous-titre du graphique d’achèvement des cours | Oui | Absente | — (absent) | Achèvement des cours |
| `search by keyword` | Placeholder de recherche Unsplash, clé minuscule | Oui | Présente | — (vide) | Rechercher par mot-clé |
| `Upload Image` | Sélection/envoi d’une image locale au serveur | Oui | Présente | Télécharger une image | Importer une image |
| `Uploading {0}%` | Progression d’envoi ; pourcentage interpolé | Oui | Présente | Envoi de {0}% | Envoi de {0}% |
| `1 student enrolled` | Résultat d’une inscription réussie | Oui | Absente | — (absent) | 1 apprenant inscrit |
| `{0} students enrolled` | Résultat de plusieurs inscriptions réussies | Oui | Absente | — (absent) | {0} apprenants inscrits |
| `1 student upgraded to certificate` | Résultat du passage à l’option avec certificat | Oui | Absente | — (absent) | 1 apprenant passé à l’option avec certificat |
| `{0} students upgraded to certificate` | Passage de plusieurs inscrits à l’option avec certificat | Oui | Absente | — (absent) | {0} apprenants passés à l’option avec certificat |
| `1 student could not be enrolled` | Échec d’une inscription | Oui | Absente | — (absent) | 1 apprenant n’a pas pu être inscrit |
| `{0} students could not be enrolled` | Échec de plusieurs inscriptions | Oui | Absente | — (absent) | {0} apprenants n’ont pas pu être inscrits |
| `Enroll 1 student` | Action d’inscription pour une personne | Oui | Absente | — (absent) | Inscrire 1 apprenant |
| `Enroll {0} students` | Action d’inscription pour plusieurs personnes | Oui | Absente | — (absent) | Inscrire {0} apprenants |

### Formulations et ambiguïtés à relire

- **Enrollments → Inscriptions** : choix générique conforme au glossaire demandé. La clé sert aussi aux inscriptions à un parcours ; Inscriptions aux cours aurait été trop spécifique dans cet usage partagé. Le sous-titre Enrollments per day reste explicitement lié aux cours.
- **Certifications → Certificats** : distingue un document du processus de certification et convient à la navigation comme au compteur. Dans les statistiques, seuls les certificats publiés sont comptés ; le sous-titre précise Certificats publiés par jour. La série utilise issue_date : ce n’est pas nécessairement le jour de publication. Confirmer ces libellés génériques lors de la relecture métier ; ne pas imposer Certificats publiés à toute la navigation.
- **Signups → Comptes créés** suit le glossaire et se distingue d’Inscription. Le compteur actuel ne prend que les utilisateurs activés ; l’infobulle Active Members apporte ce contexte. Ne pas présenter ce chiffre comme un cumul historique immuable de toutes les créations. Si une distinction plus stricte est souhaitée, il faudra des sources contextualisées dans une mission autorisée.
- **Completions → Cours terminés** désigne un décompte d’inscriptions arrivées à 100 %, pas de cours uniques. Achèvement des cours est conservé pour le concept du graphique.
- **Passé à l’option avec certificat** traduit upgraded to certificate sans promettre un certificat déjà délivré ni une certification reconnue. Formulation volontairement explicite, à confirmer par le propriétaire ; elle n’introduit aucun nouveau comportement métier.
- **Importer une image** corrige le sens d’un envoi local → serveur. Envoi de {0}% reste compréhensible et préserve une traduction existante correcte ; aucune correction cosmétique de sa ponctuation n’est ajoutée au pilote.

Les cinq équivalences imposées sont respectées : Apprenant, Formateur, Inscription, Cours, Progression. Aucune clé du pilote ne nécessitait d’ajouter une traduction de Instructor/Formateur hors périmètre.

## Méthode de modification contrôlée

Sauvegarde initiale : /workspace/work/fr01f/fr.before.po, avec empreintes des 79 PO et du POT dans hashes.before.json. Plan par clé, état avant et traduction dans plan.json. Le script apply.py utilise **read_po, Catalog.add et write_po de Babel installé dans le conteneur existant**.

Pas de bench update-po-files ni de mise à jour globale Catalog.update : sept clés Vue et huit TypeScript absentes sont ajoutées avec leurs références/indicateurs depuis le POT. Les entrées existantes touchées sont sérialisées par Babel individuellement ; les deux traductions conservées ne sont pas réécrites. Les autres blocs, l’en-tête, commentaires et traductions sont vérifiés **identiques octet pour octet**. Le PO reste UTF-8. Les métadonnées historiques Crowdin sont conservées comme provenance, sans prétendre que les traductions nouvelles proviennent de Crowdin ou y sont approuvées.

Diff fr.po limité : **69 lignes ajoutées, 4 retirées**. Les quatre entrées anciennes obsolètes issues de FR-01D restent intactes ; aucun nettoyage hors lot. Tous msgctxt, indicateurs de format et paramètres existants sont conservés. Les variantes singulier/pluriel sont des clés séparées selon le code actuel, pas des msgid_plural ajoutés artificiellement. Les 78 autres PO et le POT restent identiques à leurs empreintes initiales.

Deux libellés ont été affinés après lecture de leurs usages partagés (Inscriptions et Certificats) ; la construction contrôlée est repartie de la sauvegarde initiale avec le plan corrigé. Les validations et la compilation ont été réexécutées pour cet état final uniquement quand cette modification le justifiait. Aucun remplacement textuel approximatif ni réécriture du POT.

## Tests et résultats réels

### Qualité et compilation

- Nouveau test autonome lms/tests/test_french_pilot.py : **3/3 réussis** sur le résultat final (0,161 s). Validation de tout le PO avec Babel ; 21 clés reliées au POT, traductions non vides, non fuzzy, contextes/indicateurs conservés ; multiplicité exacte des {0}/{1}/etc. et % ; distinction entre résultat et action d’inscription.
- Contrôle du script de modification : conservation de chaque bloc hors cible ; 18 ajouts de traductions / une correction / deux conservations / 15 nouvelles entrées. Ruff lint/format et git diff --check réussis ; recherche ciblée de secrets avant commit documentaire.
- Commande réellement exécutée : `bench compile-po-to-mo --app lms --locale fr` depuis /workspace/frappe-bench dans lms-bench, puis `bench --site learning.localhost execute frappe.translate.clear_cache`. Réussies. Aucun catalogue Framework recompilé.
- MO LMS vérifié avec read_mo : **586 messages, 27 525 octets**, les 21 valeurs correspondent au plan. MO généré hors Git. Empreinte SHA-256 : f17789e78594b7c6b8ee233966a11ebe33e870f3b13a4c99036903ffee26cba2.
- Dictionnaire français Frappe réel : **6 102 → 6 120 clés**, les 21 valeurs finales correspondent au PO. Pas de traduction Framework ou surcharge prioritaire masquant une clé de ce lot.
- 78 autres PO et POT inchangés ; HEAD/état source Framework inchangés ; aucun code applicatif ou workflow modifié. Le test Python est le seul nouveau code de contrôle versionné.

### Langues et rendu

Backend sur le seul site learning.localhost : Guest, formateur fictif FR et compte fictif sans langue résolvent fr (défaut système inchangé) ; compte fictif anglais résout en malgré le défaut fr. L’API retourne les nouvelles valeurs en FR et laisse le client se replier vers les sources en EN. Aucun nouvel utilisateur créé.

Chromium existant, sans build ni dépendance installée : compte formateur fictif passé fr puis en, préférence enregistrée par API native, rechargement contrôlé dans chaque langue, puis **restauré à fr** et vérifié en base.

| Vérification | Français | Anglais |
| --- | --- | --- |
| Statistiques : cinq cartes ciblées | Cours, Comptes créés, Inscriptions, Cours terminés, Certificats visibles | Sources anglaises visibles |
| Trois sous-titres temporels | Textes français présents dans le DOM | Sources anglaises présentes |
| Dialogue réel de progression du cours FR01 | Progression de l’apprenant | Student Progress |
| Plugin Vue alimenté par le dictionnaire chargé | 21/21 valeurs attendues | 21/21 sources anglaises, paramètres conservés |
| Huit résultats/actions d’inscription | Singulier/pluriel et valeurs 1/2 corrects | Singulier/pluriel sources corrects |
| Pourcentage d’envoi 0/37/100 | Envoi de 0% / 37% / 100% | Uploading 0% / 37% / 100% |
| Repli réel hors lot : Search by keyword | Anglais conservé, traduction absente | Source anglaise |

Les huit cas d’inscription exécutent les **helpers du module enrollment.ts actuel**, dépouillé de ses types par l’API intégrée Node stripTypeScriptTypes puis importé dans le navigateur ; ils utilisent le vrai window.__ de la page et des résultats fictifs. Aucun appel d’inscription/paiement ni création de donnée pédagogique effectué. Ce contrôle ne remplace pas une E2E de soumission du formulaire ou du serveur.

Le chargement asynchrone du dictionnaire est attendu avant contrôle des valeurs ; aucune erreur pageerror dans les deux parcours finaux. Un changement de langue est vérifié après rechargement, pas un sélecteur instantané ajouté.

### Limites, essais échoués et anglais restant

- Le graphique Donut d’achèvement n’est pas affiché : Statistics.vue le conditionne à au moins une complétion. Course Completion est traduit dans PO/MO/dictionnaire mais **son rendu DOM n’a pas été vérifié**, faute de données de test adéquates. Ne pas créer de complétion pour contourner ce point dans ce petit lot.
- UnsplashImageBrowser n’a pas de parcours accessible identifié (constat FR-01B réutilisé). Placeholder/action/envoi vérifiés dans le dictionnaire/plugin réel ; **pas de montage ou rendu réel du composant, ni upload/connexion Unsplash**. Son aria-label distinct Search by keyword reste en anglais parce qu’il est hors des 21 clés autorisées ; pas un problème de cache ou de langue.
- Les descriptions d’erreurs multiples d’enrollment.ts peuvent encore utiliser des clés hors lot, par exemple {0}: {1}, and {2} more. Les huit messages de résultat/action traduits ne rendent pas tout le formulaire français.
- Premier essai de harnais navigateur échoué : comparaison directe d’un retour __() avec paramètres à une chaîne, alors que le plugin renvoie un objet .format. Harnais corrigé via le mode tableau de remplacements pour vérifier les valeurs brutes ; .format et interpolations testés séparément. Le parcours final FR+EN complet réussit ; l’essai initial n’est pas présenté comme un succès.
- Le package npm typescript n’était pas disponible depuis l’hôte ; aucune installation : utilisation de stripTypeScriptTypes déjà fourni par Node. Avertissement expérimental conservé dans le journal, sans erreur applicative.
- Aucun test Vue complet, backend général, FR-01A, build, recette mobile, mails/certificats, Crowdin ou production exécuté. Les tests de rendu antérieurs ne sont pas revendiqués comme réexécutés. Le lanceur pre-commit global bloqué historiquement n’a pas été relancé ; contrôles ciblés effectués.

## Fichiers, commits et reprise

Commit traductions/tests : **3fd92090**, lms/locale/fr.po et lms/tests/test_french_pilot.py uniquement. Un second commit documentaire porte ce rapport et CODEX_HANDOFF.md. Le commit antérieur FR-01E 0b71f90c demeure également local/non publié. Aucun push autorisé ou effectué.

Preuves hors Git : /workspace/work/fr01f/ : fr.before.po, fr.first-pilot.po (étape intermédiaire), hashes.before.json, plan.json, prepare.py, apply.py, measure.py, before/after.json, quality.log, quality-compile-final.log, compile.log, browser.cjs, browser-first.log, browser.log/json, captures statistics-fr/en.png et progress-fr/en.png, final_check.py et final-check.json. Les credentials fictifs existants restent dans leur fichier protégé antérieur ; aucun secret copié dans ce dossier de preuves ou Git. La conservation de ces preuves dépend de celle du workspace.

Le nombre de clés du POT reste **2 980** ; les autres langues restent intactes. Le site de développement utilise désormais le MO pilote ; les commits seuls ne transportent pas les MO ni le cache de site. Aucun paramètre système ni préférence réelle modifié.

## Suite recommandée, soumise à accord

Relire les formulations signalées, notamment les libellés globaux Inscriptions/Certificats, le compteur des comptes activés, Cours terminés et l’option avec certificat. Autoriser ensuite seulement publication des commits ou nouveau lot. L’aria-label Unsplash et les descriptions d’erreurs d’inscription sont des candidats utiles, mais **ne pas étendre automatiquement le périmètre**.

Pour les lots suivants : conserver la base française utile, travailler par clés exactes avec contexte et provenance, mise à jour PO ciblée par Babel/éditeur compatible, vérification des usages partagés, paramètres et blocs hors cible, compilation native et contrôles FR/EN ciblés. Ne généraliser ni l’exception à AGENTS.md ni la modification fragmentaire des catalogues sans décision ; un futur circuit Crowdin devra reprendre ces traductions locales sans les écraser et avec un statut d’approbation honnête. Arrêt après FR-01F, sans FR-02.
