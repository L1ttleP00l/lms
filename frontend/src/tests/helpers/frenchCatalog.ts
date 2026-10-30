/** Test fixture from the versioned PO, loaded into the real translation plugin. */
import { readFileSync } from 'node:fs'
import translationPlugin from '@/translation'
const french: Record<string, string> = {}
for (const block of readFileSync('../lms/locale/fr.po', 'utf8').split('\n\n')) {
	const fields: Record<string, string> = {}
	let field = ''
	for (const line of block.split('\n')) {
		const match = line.match(/^(msgid|msgstr) (".*")$/)
		if (match) {
			field = match[1]
			fields[field] = JSON.parse(match[2])
		} else if (line.startsWith('"') && field) fields[field] += JSON.parse(line)
	}
	if (fields.msgid && fields.msgstr) french[fields.msgid] = fields.msgstr
}
export function installTranslations(lang: string) {
	window.translatedMessages = lang === 'fr' ? french : {}
	const app = { config: { globalProperties: {} as Record<string, any> } }
	translationPlugin(app)
	return app.config.globalProperties.__ as (
		key: string,
		values?: unknown[]
	) => any
}
