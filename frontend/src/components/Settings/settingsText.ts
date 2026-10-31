/**
 * Source-only labels for static schemas; renderers still translate with __().
 * Frappe's shared gettext keywords include the N_ no-op marker. The exact
 * babel_extractors.csv rule uses Babel's JavaScript extractor for this leaf
 * module only; other TypeScript/Vue files keep their Frappe extractors.
 */
function N_(message: string): string {
	return message
}

export const settingsText = {
	systemConfiguration: N_('System Configuration'),
	accessAvailability: N_('Access & Availability'),
	lessonDwellDescription: N_(
		'Seconds a learner must stay on a lesson before it is marked complete.'
	),
} as const
