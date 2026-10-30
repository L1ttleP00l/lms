# FR-02C.1 — Auto-inscription apprenant

30 octobre 2026 (Europe/Paris), `L1ttleP00l/lms`, branche exclusive `littlepool-dev`. Base initiale propre et distante vérifiée : **a9188d6e0e85ecc358fcc42b9719d0c42c2262ea**. L’audit FR-02C est publié ; ses anciennes mentions « commit local » décrivent sa rédaction. Aucun push pendant ce lot.

## Corrections strictement réalisées

| Clé anglaise conservée | Traduction française autorisée |
| --- | --- |
| Enroll Now | S'inscrire |
| Buy this course | Acheter ce cours |
| You need to login first to enroll for this course | Connectez-vous pour vous inscrire à ce cours. |
| You have been enrolled in this course | Vous êtes inscrit à ce cours. |

Les quatre clés existaient dans le POT et étaient vides dans le PO. Recherche des autres usages : Enroll Now est également le bouton d’inscription libre de BatchOverlay, compatible avec **S'inscrire**. Les trois autres clés sont dans CourseCardOverlay. Aucune clé contextualisée nouvelle nécessaire, aucune modification du parcours des sessions. L’effet linguistique partagé sur le bouton de session n’est pas présenté comme une recette fonctionnelle des sessions.

**Seule modification applicative**, dans CourseCardOverlay.vue :

```diff
- const msg = resourceErrorMessage(err, 'Error')
+ const msg = resourceErrorMessage(err, __('Error'))
```

Le helper global, `toast.warning(__(msg))`, `console.error(err)`, les messages serveur, insert, routes, délais, conditions, permissions et contrôleurs restent identiques. L’égalité du fichier avec sa version de base après cette seule substitution a été contrôlée.

**Nuance du diagnostic initial :** le toast appelait déjà __() sur msg. Le fallback brut transmis au helper ne prouvait donc pas, à lui seul, un affichage anglais de l’erreur avant ce lot. La correction demandée localise explicitement l’argument de repli à l’entrée du helper, sans changer le traitement final. Le test français vérifie cet argument et l’affichage ; aucun « avant Error visible / après Erreur » non observé n’est revendiqué.

La priorité du helper reste : message serveur précis disponible, sinon repli localisé ; les erreurs réseau brutes ne remplacent pas ce repli. L’appel final __() préexistant reste également intact. **Error → Erreur** et l’avertissement administrateur existant sont conservés dans le PO, sans retouche globale ni réécriture d’erreur serveur.

## Catalogues, environnement et chargement

| Mesure | Avant | Après |
| --- | ---: | ---: |
| Entrées fr.po | 2 706 | **2 706** |
| Traductions françaises non vides | 637 | **641** |
| Clés POT | 2 985 | **2 985** |
| Messages MO LMS/fr | 637 | **641** |

Seuls les quatre blocs autorisés du français sont sérialisés via Babel ; tous les autres blocs/en-tête sont identiques. Paramètres, contextes et indicateurs vérifiés avec le POT ; aucun paramètre nouveau. **POT inchangé octet pour octet**, aucune extraction ou mise à jour de PO globale. Error était déjà une clé existante : le nouvel appel ne nécessite pas de nouvelle source. Références de lignes non rafraîchies pour elles seules.

Le développement était arrêté depuis la restauration. La procédure existante `/workspace/.setup/start-services.sh`, autorisée par la mission, a redémarré les services de développement existants ; sortie 0 et ping pong. Quelques réponses curl transitoires ont précédé la disponibilité ; aucun nouveau conteneur, installation, migration, changement de configuration ou intervention de production. Aucun script install.sh lancé.

Compilation native `bench compile-po-to-mo --app lms --locale fr`, puis `bench --site learning.localhost execute frappe.translate.clear_cache` : réussies, sur ce seul site. MO **641 messages / 30 910 octets** ; les quatre valeurs concordent entre PO, MO et dictionnaire réel. Les traductions de la phase précédente contrôlée restent conservées. Dictionnaire agrégé observé : 6 309 clés, sans l’assimiler au nombre de traductions LMS ajoutées.

**78 autres PO et Framework inchangés**, POT inchangé ; pas de Crowdin, PDF ou modification des paramètres du site.

## Tests réellement exécutés

Nouveau `frontend/src/tests/courseSelfEnrollmentTranslations.test.ts` : **10 cas FR/EN** utilisant le plugin réel et un appel métier entièrement simulé :

- Visiteur simulé : invitation à se connecter et délai de redirection planifié, aucun insert ; navigation login réelle non exécutée dans le test.
- Non inscrit : S'inscrire / Enroll Now ; cours payant prioritaire même si inscription libre désactivée, route Billing(type=course) conservée sans navigation ; cours gratuit fermé : avertissement administrateur inchangé.
- Déjà inscrit : actions Commencer/Reprendre le cours selon progression simulée 0/25 ; aucune inscription demandée.
- Succès simulé : message, contrat exact frappe.client.insert et route Lesson avec chapitres/leçons inchangés après le délai existant.
- Erreur générique et message serveur précis : argument de fallback localisé, priorité conservée, toast attendu et console.error existant inchangé. Le message précis fictif n’est pas réécrit.

**Passage final : deux fichiers / 14 tests tous réussis en une exécution de 3,08 s**, avec CourseCardOverlay.test.ts directement concerné. Trois passages intermédiaires laissaient chacun deux échecs sur 14 : mock de ressource sans reload (y compris une première tentative de correction incomplète), puis export Tooltip manquant dans le mock de la branche de progression. Harnais complété ; aucune modification applicative supplémentaire pour satisfaire ces échecs. Les suites complètes et les 62 tests historiques n’ont pas été relancés.

Babel PO/POT, paramètres/contextes, intégrité, recherche ciblée de secrets et git diff --check réussis. Prettier 2.7.1 sur le composant et son test : réussi. Le lanceur pre-commit complet historiquement bloqué n’a pas été relancé ; commits avec hooks désactivés après contrôles ciblés. Aucun JS autonome modifié.

**Build nécessaire au rendu de la source Vue modifiée : réussi en 14,59 s**, application et signup-select. Déclarations générées sauvegardées/restaurées ; aucun asset/MO suivi. Avertissements Vite/Browserslist/face-api habituels, pas de réparation ou réinstallation.

## Chromium : observations et sécurité

**Quatre combinaisons réussies : FR/EN × 1440×1000 / 390×844.** Comptes apprenants fictifs existants distincts fr/en ; navigateur en-US. La fiche réelle sert de base, puis ses états d’inscription/prix/inscription libre sont modifiés **dans les seules réponses réseau simulées**, sans changer le cours ou l’inscription en base.

Parcours observés : non inscrit, cours payant (lien inspecté, jamais ouvert), inscription libre désactivée, déjà inscrit ; puis trois réponses d’inscription simulées : erreur serveur précise, erreur générique et succès. Les textes français/anglais et la route du lien d’achat sont vérifiés. Huit captures documentent les erreurs. Les contextes sont fermés après succès, avant la navigation de leçon différée ; cette route est couverte par le test unitaire, sans progression réelle.

- Garde réseau installée **avant connexion et montage** : seules les familles de lecture prévues et login passent ; tout appel d’écriture/facturation/certificat est bloqué ou simulé.
- **12 requêtes frappe.client.insert entièrement interceptées**, quatre succès simulés, quatre erreurs serveur spécifiques et quatre erreurs génériques. **Zéro requête d’insertion transmise au backend.** Aucun get_payment_link, create_certificate ou appel de facturation effectué ; aucune inscription, paiement, certificat, progression ou avis créé/modifié par les tests.
- **Zéro pageerror JavaScript**. Huit réponses HTTP 417/500 sont les erreurs simulées attendues ; deux autres réponses HTTP annexes consignées. Trente-deux appels de télémétrie boot_config ont été bloqués par la liste d’autorisation de sécurité du harnais ; aucun correctif de ce service hors périmètre.
- Préférences préexistantes fr/en confirmées après les parcours en base, et langue respectée à chaque rechargement. **Aucune préférence temporaire modifiée**, donc aucune écriture de restauration nécessaire ; les comptes restent respectivement fr/en, défaut système fr inchangé.
- Le visiteur non connecté est couvert en FR/EN par le test de composant, **pas par une nouvelle session Guest Chromium**. Les parcours navigateur utilisent des comptes fictifs connectés ; cela ne vaut pas un test de tous les accès Guest/permissions.

Non exécutés : véritable inscription, parcours d’achat, paiement, certificat, publication d’avis, lecture complète d’une leçon, lecteur d’écran exhaustif ou suite backend globale. Les contrôles de rendu n’affirment pas de validation transactionnelle de l’inscription.

## Fichiers, commits et limites restantes

Modifiés : CourseCardOverlay.vue (une ligne), fr.po (quatre valeurs), CODEX_HANDOFF.md. Créés : courseSelfEnrollmentTranslations.test.ts et ce rapport. Aucun POT, backend, helper global, rôle ou autre langue modifié.

Commit sources/tests : **1b6aa0f3**. Le commit suivant contient les traductions et les deux documents ; relever son SHA par git log. Checkout propre après livraison locale ; aucun push/PR.

Preuves hors Git : `/workspace/work/fr02c1/` : sauvegardes PO/POT, traductions/plan, validations Babel/runtime, démarrage/compilation/build/tests, harnais et résultats Chromium, captures, préférences (codes de langue seulement) et final-check.json. Aucun secret dans les livrables suivis.

Restent hors lot : Get Certified ambigu, Enroll for Free, retour d’erreur de Billing(type=certificate), consentement/adresse/coupons et extraction de clés dynamiques, ainsi que les rôles de gestion, mails/PDF et services externes identifiés par FR-02C. **Ne pas commencer FR-02C.2. Prochaine opération : revue de ces résultats et autorisation explicite avant publication.**
