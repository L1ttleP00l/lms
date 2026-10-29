# Glossaire français LittlePool Learning — proposition FR-01C

Date : 28 octobre 2026. **Propositions à valider ; aucune traduction importée.** L’anglais reste la langue source et de secours. Ce glossaire définit les textes affichés, pas les noms internes des DocTypes, routes, API, clés gettext ou valeurs stockées.

## Vocabulaire pédagogique

| Terme anglais | Recommandation française | Alternatives et critère de choix |
| --- | --- | --- |
| Course | **Cours** | Formation si offre commerciale globale ; garder Cours pour l’objet qui contient chapitres et leçons et pour la cohérence avec la traduction existante |
| Lesson | **Leçon** | Séance pour un événement planifié en direct ; une leçon LMS est une unité de contenu, donc Leçon |
| Chapter | **Chapitre** | Module possible pour un regroupement pédagogique plus large ; Chapitre correspond directement à l’organisation existante |
| Quiz | **Quiz** | Questionnaire si formulaire non évaluatif ; Quiz est court et cohérent pour l’activité avec questions, tentatives et score |
| Assignment | **Devoir** | Travail à rendre pour une aide longue ; Évaluation serait trop large, puisqu’elle peut aussi être un quiz ou un exercice |
| Batch | **Session de formation** (Session en libellé court) | Cohorte décrit bien le groupe d’apprenants ; Groupe est générique. Le Batch associe cours, groupe, durée/calendrier et cours en direct : Session de formation distingue cette organisation d’une seule classe en direct. Valider avant remplacement de traductions existantes telles que Lots |
| Enrollment | **Inscription** ; **Inscription au cours** si nécessaire | Adhésion pour une communauté seulement ; ne pas confondre inscription pédagogique et création de compte |
| Member | **Membre** dans l’administration générique | Apprenant quand la personne participe à un cours ; Participant dans une session ou un événement. Le compte peut aussi être formateur/gestionnaire, donc ne pas tout traduire par Apprenant |
| Certificate | **Certificat** | Attestation de suivi / de réussite si cette portée est explicitement définie. Ne pas promettre une reconnaissance officielle ou des compétences certifiées à partir d’une simple complétion |
| Certification | **Certification** pour le processus de validation évaluée | Dans les statistiques FR-01B, Certifications compte des certificats publiés : proposer **Certificats publiés** dans ce contexte, sans changer la valeur métier |
| Completion | **Achèvement** pour le concept ; **Terminé** pour un état affiché | Complétion est technique et moins naturel. Dans une carte, **Cours terminés** est plus lisible ; expliquer qu’on compte les inscriptions terminées, pas les cours uniques |
| Progress | **Progression** | Avancement convient en gestion de projet ; Progression est cohérent pour les leçons, quiz et parcours d’une personne |
| Instructor | **Formateur** | Enseignant pour un contexte scolaire ; Intervenant pour une séance ponctuelle. Recommander Formateur tant que le public cible est général |
| Student | **Apprenant** | Élève pour le scolaire ; Étudiant pour le supérieur. Le LMS est généraliste : Apprenant évite de présumer âge ou établissement |
| Program | **Parcours** | Programme de formation dans une description longue ; le Program regroupe plusieurs cours avec ordre éventuellement imposé, ce qui justifie Parcours |

Ces choix n’ont pas le statut de décisions métier approuvées. Les termes qui changent selon le contexte doivent être relus dans leurs écrans, sans ajouter un second moteur de localisation ni modifier les clés existantes pour le seul glossaire.

## Distinctions utiles aux statistiques et aux images

| Notion | Proposition / règle |
| --- | --- |
| Signup | **Création de compte** ; Signups → **Comptes créés**, distinct d’Enrollment. Le compteur actuel filtre les utilisateurs activés : conserver cette nuance dans la revue |
| Course enrollment | **Inscription au cours** ; pluriel de carte **Inscriptions aux cours** |
| Course Completion | **Achèvement des cours** pour le sous-titre de répartition des états ; ne pas traduire les catégories stockées dans les données |
| Upload Image | **Importer une image** : action d’un utilisateur qui choisit un fichier local et l’envoie au serveur. **Téléverser une image** est l’alternative technique ; ne pas employer Télécharger pour cet envoi |
| Uploading {0}% | **Importation : {0} %** si Importer est retenu ; **Envoi de {0}%** existe actuellement et reste compréhensible. Conserver `{0}` et le caractère `%` |
| Download | **Télécharger** quand un fichier va du serveur vers l’appareil de l’utilisateur |
| Search by keyword | **Rechercher par mot-clé** : même intention pour placeholder et aria-label, mais conserver leurs deux clés anglaises et leur casse |

Les compteurs Certifications actuels filtrent les certificats publiés et leur série temporelle utilise la date d’émission : ne pas déduire une date de publication de ce seul graphique. Les propositions détaillées et l’état POT de chaque clé sont dans `docs/FR-01C-STRATEGIE.md`.

## Style et qualité

- Vouvoiement dans les consignes : « Sélectionnez… », « Vous pouvez… ». Pour une action, utiliser un infinitif court : « Importer une image ».
- Phrases naturelles, accents et apostrophes cohérents ; éviter le jargon informatique quand un terme courant est précis. Espace française avant `%` dans les traductions proposées.
- Préserver exactement `{0}`, `{1}`, variables Jinja, balises utiles et liens ; ne pas traduire le nom d’une variable ou concaténer des fragments qui cassent la grammaire.
- Adapter singulier/pluriel au contexte et aux mécanismes natifs ; ne pas présumer que des phrases anglaises concaténées suffisent au français.
- Garder une même intention dans le texte visible et son libellé accessible ; vérifier le texte final avec lecteur d’écran et sur mobile lors du lot concerné.
- Séparer interface et contenus pédagogiques saisis par les utilisateurs. Ne pas modifier les noms techniques (LMS Course, LMS Enrollment, URLs, rôles/API, statuts stockés) pour leur donner un nom français.

## Arbitrages à faire valider

1. Batch : Session de formation / Session ou Cohorte ? Recommandation : Session pour l’organisation, cohorte seulement pour les personnes.
2. Student / Instructor : Apprenant / Formateur pour le public général, ou variante scolaire selon le positionnement réel ?
3. Certificate : Certificat générique, ou Attestation de suivi/réussite selon les critères retenus ? Certification à réserver à une validation explicitement évaluée.
4. Program : Parcours en interface, Programme de formation en description ?
5. Member : Membre pour le compte générique, Apprenant seulement en contexte pédagogique ?
6. Statistiques : valider les libellés proposés à partir des métriques réelles, en particulier Signups et Certifications ; aucun changement de calcul demandé.
7. Images : confirmer Importer / Importation, ou Téléverser / Téléversement ; conserver la cohérence du bouton et du pourcentage.

Après validation, ces décisions pourront guider Crowdin et la revue des traductions officielles réutilisées. Le présent document n’active ni projet, ni catalogue, ni surcharge en base.


## Décisions contextuelles confirmées — FR-02B.1 (29 octobre 2026)

| Source contextualisée | Français retenu | Portée confirmée |
| --- | --- | --- |
| Free course | **Gratuit** | Prix d’un cours gratuit ; éviter Libre dans ce contexte. La clé globale Free reste inchangée pour les autres usages. |
| Your review | **Avis** | Champ de rédaction d’un avis sur un cours ; éviter Révoir. La clé globale Review reste inchangée. |

Ces décisions sont autorisées pour FR-02B.1 ; elles ne valident pas toutes les propositions historiques du glossaire et n’autorisent pas un nouveau lot.
