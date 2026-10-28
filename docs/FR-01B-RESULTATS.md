# FR-01B — Internationalisation des chaînes Vue

Date : 28 octobre 2026 (Europe/Paris). Branche exclusive : `littlepool-dev`. Base : `1f3db262`. Mission limitée aux trois composants demandés, à leurs tests et à la documentation. FR-02 n’a pas commencé.

## Résultat

**13 clés distinctes sont désormais utilisées par les appels natifs `__()` aux 17 emplacements corrigés.** L’anglais source est conservé ; aucune traduction française n’a été ajoutée. Trois traductions existent déjà à l’exécution ; dix clés ciblées restent en anglais faute de traduction française et nécessitent le circuit Crowdin.

Les classes CSS et blocs script des trois composants sont identiques avant/après. Aucun changement de mise en page, permission, contrat API ou fonction métier. Aucun changement Framework, PO ou workflow Crowdin.

## Reprise et sauvegarde autorisée

AGENTS.md et CODEX_HANDOFF.md ont été lus avant les sections utiles du plan. Checkout initial propre sur littlepool-dev. Le commit local `1f3db262` existait et ne modifiait que CODEX_HANDOFF.md. Après recherche ciblée de motifs de secrets sans résultat et vérification du distant à son parent `d1022580`, il a été publié par push normal sans force.

La branche distante littlepool-dev est donc à `1f3db2621e3bbc6a501f7c20a4253ebb19dce6b5`. develop est restée à `6b791f33b34efa15566a0cb707f5be59d136df50`. Aucun commit FR-01B n’est publié dans cette mission.

L’environnement existant répondait déjà au ping ; aucune dépendance n’a été réinstallée. FR-01A n’a pas été recommencé.

## Chaînes et vérification des composants enfants

| Source | Avant | Après / raison |
| --- | --- | --- |
| `frontend/src/pages/Courses/StudentCourseProgress.vue` | `title="Student Progress"` | `:title="__('Student Progress')"` ; Dialog affiche directement `props.title` |
| `frontend/src/pages/Statistics.vue` | Cinq cartes numériques et quatre graphiques : titres et sous-titres littéraux | Appels `__()` sur les treize attributs concernés ; NumberCard affiche le titre directement, LineChart et DonutChart le transmettent sans traduction à ChartContainer |
| `frontend/src/components/UnsplashImageBrowser.vue` | Placeholder `search by keyword`, action `Upload Image`, texte dynamique `Uploading ${progress}%` | Placeholder/action via `__()` ; `__('Uploading {0}%').format(progress)` pour conserver la valeur et rendre le message extractible |

Vérifications effectuées avant correction dans le paquet frappe-ui installé :

- `src/components/Dialog/Dialog.vue` affiche `{{ props.title }}`.
- `src/charts/NumberCard.vue` et `src/charts/components/ChartContainer.vue` affichent les titres/sous-titres reçus directement ; LineChart/DonutChart les transmettent.
- `src/components/TextInput/TextInput.vue` lie directement `placeholder` à l’input.
- `src/components/Button/Button.vue` rend le slot fourni ; il ne traduit pas le texte anglais construit dans ce slot.

L’aria-label Unsplash `__('Search by keyword')` était déjà enveloppé : il est inchangé. La casse du placeholder source `search by keyword` est également préservée ; les deux clés restent distinctes. Les labels déjà traduisibles et valeurs de données des graphiques n’ont pas été réécrits.

## Disponibilité française réelle et extraction

Le relevé a utilisé `get_all_translations('fr')` dans le site learning.localhost et les catalogues existants, sans changer sa configuration. Le tableau concerne les **13 clés ciblées**, pas toutes les chaînes de ces écrans.

| Clé source | Traduction française effectivement disponible | État POT/PO LMS avant correction |
| --- | --- | --- |
| `Student Progress` | Absente → Student Progress | Clé absente |
| `Courses` | **Cours** | Présente et renseignée |
| `Signups` | Absente → Signups | Présente, traduction vide |
| `Enrollments` | Absente → Enrollments | Présente, traduction vide |
| `Completions` | Absente → Completions | Clé absente |
| `Certifications` | Absente → Certifications | Clé absente |
| `Signups per day` | Absente → Signups per day | Clé absente |
| `Enrollments per day` | Absente → Enrollments per day | Clé absente |
| `Certifications per day` | Absente → Certifications per day | Clé absente |
| `Course Completion` | Absente → Course Completion | Clé absente |
| `search by keyword` | Absente → search by keyword | Présente, traduction vide |
| `Upload Image` | **Télécharger une image** | Présente et renseignée |
| `Uploading {0}%` | **Envoi de {0}%** | Présente et renseignée |

La clé d’accessibilité existante `Search by keyword` est présente mais sa traduction française est également absente. Elle n’a pas été modifiée par FR-01B.

Après correction, l’extracteur natif `frappe.gettext.extractors.html_template.extract`, invoqué par Babel `extract_from_file` avec `PYTHON_KEYWORDS` du Framework, retrouve toutes les 13 clés dans les trois sources et leurs lignes. Cette vérification extrait en mémoire et enregistre le résultat hors dépôt ; elle ne réécrit ni POT ni PO.

### Passage nécessaire par Crowdin

Sept clés ciblées sont absentes du POT/PO actuel : Student Progress, Completions, Certifications, Signups per day, Enrollments per day, Certifications per day, Course Completion. Les nouvelles occurrences sont maintenant extractibles. Il faudra intégrer leur extraction au circuit de génération du POT et d’export des sources Crowdin, faire traduire/relire ces sept clés et les trois clés déjà présentes mais vides, puis importer le catalogue validé et compiler/invalider le cache selon la procédure native.

Ne pas lancer aveuglément le workflow existant : il cible notamment develop, pas littlepool-dev, et n’exporte pas les nouvelles sources. Les accès et la procédure d’export Crowdin restent à établir selon le plan. Aucun workflow, import, compilation ou dictionnaire parallèle n’a été créé ici. La qualité terminologique des traductions existantes n’est pas révisée dans ce sous-lot.

## Tests ciblés exécutés

Un seul nouveau fichier de tests : `frontend/src/tests/fr01bTranslations.test.ts`.

Il monte les trois composants avec le vrai plugin de traduction LMS. Les ressources réseau et les enfants de présentation sont remplacés par des doubles simples affichant les props/slots sans traduction, conformément aux comportements inspectés. Les vérifications portent sur :

- Sources anglaises sans dictionnaire.
- Transmission de toutes les clés ciblées à un dictionnaire de test synthétique, y compris les traductions futures non disponibles. Ces réponses artificielles ne prouvent pas une traduction française déployée et ne sont pas un dictionnaire applicatif parallèle.
- Les trois traductions françaises réellement disponibles et le repli anglais des autres clés.
- Mise à jour des composants montés après une réponse asynchrone du plugin.
- Pourcentages de téléversement 0, 37 et 100, en français et en anglais.
- Valeurs numériques des cartes et données du graphique conservées.

| Contrôle | Résultat |
| --- | --- |
| Nouveau fichier, avant correction | **7 tests : 1 réussi, 6 échoués**, confirmant les chaînes littérales et l’interpolation non traduisible |
| `yarn test src/tests/fr01bTranslations.test.ts src/tests/translation.test.ts src/tests/coverImageTranslations.test.ts --maxWorkers=2` | **16/16 réussis**, trois fichiers, 3,07 s Vitest ; dont 7 nouveaux tests ciblés |
| Prettier 2.7.1 sur les trois Vue et le nouveau test | Réussi après mise en forme |
| `yarn build` dans le frontend du conteneur | Réussi, SPA/HTML et signup-select, 14,91 s ; avertissements Vite/Browserslist/face-api déjà connus |
| Extraction native Frappe/Babel en mémoire | 13/13 clés retrouvées aux lignes attendues |
| Intégrité | Blocs script et classes CSS inchangés ; empreintes des deux PO français identiques à celles relevées avant FR-01A ; diff Framework inchangé |
| Git diff / index | Contrôle d’espaces et revue du périmètre réalisés ; déclarations générées par le build restaurées |

Les tests existants du plugin et du composant voisin de couverture ont été réutilisés en contrôle ciblé de l’interpolation et du rendu, sans refaire la campagne FR-01A. La suite complète de 2 680 tests n’a pas été relancée. Aucune nouvelle installation de Prettier/ESLint ou réparation du lanceur pre-commit n’a été entreprise : le binaire Prettier déjà disponible a été réutilisé ; aucun JavaScript autonome modifié ne nécessite le hook ESLint existant.

## Chromium : résultats réellement affichés

Chromium headless, 1440 × 1000, locale navigateur en-US. Un compte formateur fictif FR01 existant a été réutilisé, sans exposer ses identifiants ; préférence fr puis en via le mécanisme natif et restauration à fr dans un bloc de nettoyage. Le site reste français et aucune donnée réelle n’est utilisée.

| Surface | Préférence fr | Préférence en |
| --- | --- | --- |
| Statistiques : carte Courses | **Cours** visible | **Courses** visible |
| Statistiques : autres intitulés ciblés visibles | Sources anglaises conservées faute de traduction | Sources anglaises |
| Dialogue réel de progression depuis le tableau de bord du cours FR01 | **Student Progress**, repli anglais attendu | **Student Progress** |

Aucune erreur JavaScript pageerror pendant ces deux parcours. Captures conservées hors dépôt dans `/workspace/work/fr01b/statistics-fr.png`, `statistics-en.png`, `progress-fr.png`, `progress-en.png`.

Aucun usage de UnsplashImageBrowser n’a été trouvé dans les autres sources frontend ; le composant existe et est déclaré par l’auto-import, mais aucun parcours de l’application ne le rendait accessible dans le périmètre inspecté. **Pas de vérification Chromium de ce composant ni de requête externe Unsplash/gameplan.** Son placeholder, son action et son interpolation sont contrôlés par les tests de composant. Le téléversement réel n’est pas exécuté. Aucune route de démonstration n’a été ajoutée pour contourner cette limite.

## Livrables et limites

- Commit local de correction/tests : `bc5cd471` — `fix(i18n): make progress statistics and image labels translatable`.
- Rapport présent et mise à jour de CODEX_HANDOFF.md dans un commit documentaire distinct.
- Preuves de cette mission dans `/workspace/work/fr01b/` : relevé catalogues, extraction, journaux avant/après, build et résultats/captures Chromium. Les identifiants de test restent hors dépôt et ne sont pas publiés.

Aucun test backend, suite Vue complète, E2E historique complet, recette mobile exhaustive ou test externe n’a été lancé. Les modifications portent uniquement sur les libellés des trois composants ; cette mission ne certifie pas la couverture française de l’application entière. Les limites de FR-01A (notamment anomalie Babel Framework et lanceur pre-commit) restent documentées dans son rapport et n’ont pas été réinvestiguées.

**FR-01B est terminé dans son périmètre technique ; la traduction française effective des dix clés manquantes reste à livrer par Crowdin.** Prochaine opération : revue et accord explicite avant publication des commits FR-01B, puis préparation du passage Crowdin selon autorisation. FR-02 ne doit pas démarrer automatiquement. Aucun merge, aucune modification de develop, de production OpenMediaVault ou de Docker de production.
