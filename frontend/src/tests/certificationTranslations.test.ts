/** FR-02C.4: synthetic states only; every write/PDF operation fails closed. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { readFileSync } from 'node:fs'
import dayjs from '@/utils/dayjs'
import translationPlugin from '@/translation'
import CertificationLinks from '@/components/CertificationLinks.vue'
import CourseCard from '@/components/CourseCard.vue'
import CourseCardOverlay from '@/components/CourseCardOverlay.vue'
import CourseCertification from '@/pages/Courses/CourseCertification.vue'
import UpcomingEvaluations from '@/components/UpcomingEvaluations.vue'
import EvaluationModal from '@/components/Modals/EvaluationModal.vue'

const state = vi.hoisted(() => ({
	details: null as any,
	error: null as any,
	list: [] as any[],
	slots: [] as any[],
	push: vi.fn(),
	external: vi.fn(),
	write: vi.fn(),
	warning: vi.fn(),
	errorToast: vi.fn(),
}))
vi.mock('@/utils', () => ({
	formatAmount: String,
	formatRating: String,
	formatTime: (v: string) => v?.slice(0, 5) || '',
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: state.push }) }))
vi.mock('@/stores/session', () => ({
	sessionStore: () => ({ brand: {}, user: 'test@example.com' }),
}))
vi.mock('@/utils/openExternal', () => ({ openExternal: state.external }))
vi.mock('frappe-ui', () => ({
	Button: {
		props: ['route', 'label'],
		template:
			'<button :data-route="JSON.stringify(route)" :aria-label="label"><slot /></button>',
	},
	Tooltip: {
		props: ['text'],
		template: '<span :data-tooltip="text"><slot /></span>',
	},
	Alert: {
		props: ['description', 'title'],
		template: '<div role="alert">{{title}} {{description}}</div>',
	},
	Dropdown: { template: '<div />' },
	FormControl: {
		props: ['label', 'modelValue', 'options', 'type'],
		template:
			'<select :aria-label="label"><option v-for="o in options" :value="o.value">{{o.label}}</option></select>',
	},
	Dialog: {
		props: ['open', 'title', 'actions'],
		template:
			'<section v-if="open" role="dialog" :aria-label="title"><slot /><button v-for="a in actions" @click="a.onClick({close:()=>{}})">{{a.label}}</button></section>',
	},
	toast: { warning: state.warning, error: state.errorToast, success: vi.fn() },
	usePageMeta: vi.fn(),
	call: (...args: any[]) => {
		state.write(...args)
		throw Error('Forbidden write')
	},
	createListResource: () => reactive({ data: state.list, reload: vi.fn() }),
	createResource: (options: any) => {
		const res = reactive({
			data: options.url.includes('get_certification_details')
				? state.details
				: options.url.includes('get_schedule')
				? state.slots
				: [],
			loading: false,
			reload: vi.fn(),
			fetch: vi.fn(() => {
				if (options.url.includes('create_certificate'))
					throw Error('Forbidden certificate creation')
				if (state.error) options.onError?.(state.error)
				else options.onSuccess?.(state.details)
			}),
		})
		return res
	},
}))
vi.mock('@/components/Layouts/pages/PageHeader.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/Layouts/pages/PageBody.vue', () => ({
	default: { props: ['title'], template: '<main>{{title}}<slot /></main>' },
}))
vi.mock('@/components/VideoPreview.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CardLink.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CourseInstructors.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/UserAvatar.vue', () => ({
	default: { template: '<div />' },
}))

// Use the versioned PO, never a parallel runtime dictionary.
const french: Record<string, string> = {}
for (const block of readFileSync('../lms/locale/fr.po', 'utf8').split('\n\n')) {
	let field = ''
	const row: Record<string, string> = {}
	for (const line of block.split('\n')) {
		const match = line.match(/^(msgid|msgstr) (".*")$/)
		if (match) {
			field = match[1]
			row[field] = JSON.parse(match[2])
		} else if (line.startsWith('"') && field) row[field] += JSON.parse(line)
	}
	if (row.msgid && row.msgstr) french[row.msgid] = row.msgstr
}
const details = (purchased = 0, certificate: any = null) => ({
	title: 'Fictional Course',
	paid_certificate: 1,
	has_evaluator: true,
	membership: { purchased_certificate: purchased },
	certificate,
})
function render(component: any, props: any, lang: string, student = true) {
	window.translatedMessages = lang === 'fr' ? french : {}
	return mount(component, {
		props,
		global: {
			plugins: [translationPlugin],
			provide: {
				$user: { data: { name: 'test@example.com', is_student: student } },
				$dayjs: dayjs,
			},
			config: { globalProperties: { $dialog: vi.fn() } },
		},
	})
}
beforeEach(() => {
	state.details = details()
	state.error = null
	state.list = []
	state.slots = []
	vi.clearAllMocks()
})
describe('Certification FR/EN without transactions', () => {
	for (const lang of ['fr', 'en']) {
		const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en)
		it(`distinguishes purchase, evaluation and issued certificate in ${lang}`, async () => {
			let view = render(CertificationLinks, { courseName: 'TEST-COURSE' }, lang)
			expect(view.text()).toContain(
				tr("Acheter l'option certificat", 'Buy the certificate option')
			)
			expect(JSON.parse(view.get('button').attributes('data-route'))).toEqual({
				name: 'Billing',
				params: { type: 'certificate', name: 'TEST-COURSE' },
			})
			view.unmount()
			state.details = details(1)
			view = render(CertificationLinks, { courseName: 'TEST-COURSE' }, lang)
			expect(view.text()).toContain(
				tr("Accéder à l'évaluation", 'Access the evaluation')
			)
			expect(JSON.parse(view.get('button').attributes('data-route'))).toEqual({
				name: 'CourseCertification',
				params: { courseName: 'TEST-COURSE' },
			})
			view.unmount()
			state.details = details(0, {
				name: 'TEST-CERT',
				template: 'TEST-TEMPLATE',
			})
			view = render(
				CertificationLinks,
				{ courseName: 'TEST-COURSE' },
				lang,
				false
			)
			expect(view.text()).toContain(
				tr('Consulter le certificat', 'View Certificate')
			)
			expect(view.text()).not.toContain(
				tr("Acheter l'option certificat", 'Buy the certificate option')
			)
			expect(state.external).not.toHaveBeenCalled()
			expect(state.write).not.toHaveBeenCalled()
		})
		it(`hides purchase without student rights or membership in ${lang}`, () => {
			expect(
				render(CertificationLinks, { courseName: 'TEST' }, lang, false)
					.find('button')
					.exists()
			).toBe(false)
			state.details = { ...details(), membership: null }
			expect(
				render(CertificationLinks, { courseName: 'TEST' }, lang)
					.find('button')
					.exists()
			).toBe(false)
			state.details = null
			expect(
				render(CertificationLinks, { courseName: 'TEST' }, lang)
					.find('button')
					.exists()
			).toBe(false)
		})
		it.each([0, 99, 100])(`completion at %s in ${lang}`, (progress) => {
			state.details = {
				...details(),
				paid_certificate: 0,
				membership: { purchased_certificate: 0 },
			}
			const view = render(
				CourseCardOverlay,
				{
					course: {
						data: {
							name: 'TEST',
							title: 'Fictional Course',
							enable_certification: 1,
							membership: { progress },
						},
					},
				},
				lang
			)
			expect(
				view.text().includes(tr('Obtenir le certificat', 'Get Certificate'))
			).toBe(progress >= 100)
			expect(view.text()).toContain(
				tr('Certificat de fin de cours', 'Certificate of completion')
			)
			expect(state.write).not.toHaveBeenCalled()
			expect(state.external).not.toHaveBeenCalled()
		})
		it.each([false, true])(`describes badge paid=%s in ${lang}`, (paid) => {
			const view = render(
				CourseCard,
				{
					course: {
						name: 'TEST',
						title: 'Fictional Course',
						instructors: [],
						enrollments: 0,
						lessons: 0,
						paid_certificate: paid,
						enable_certification: !paid,
					},
				},
				lang
			)
			const label = paid
				? tr('Option certificat', 'Certificate option')
				: tr('Certificat de fin de cours', 'Certificate of completion')
			expect(view.get('[data-tooltip]').attributes('data-tooltip')).toBe(label)
			expect(view.findAll('.sr-only').some((n) => n.text() === label)).toBe(
				true
			)
		})
		it(`preserves issued details and load error in ${lang}`, async () => {
			state.details = details(1, {
				name: 'TEST-CERT',
				template: 'TEST-TEMPLATE',
				issue_date: '2026-01-01',
			})
			const view = render(CourseCertification, { courseName: 'TEST' }, lang)
			expect(view.text()).toContain(tr('Délivré le', 'Issued On'))
			expect(view.text()).toContain(
				tr(
					'Un certificat vous a déjà été délivré pour ce cours. Sélectionnez la carte pour le consulter.',
					'You are already certified for this course. Click on the card below to open your certificate.'
				)
			)
			expect(view.text()).toContain('Fictional Course')
			expect(state.external).not.toHaveBeenCalled()
			state.error = {}
			render(CourseCertification, { courseName: 'TEST' }, lang)
			expect(state.errorToast).toHaveBeenLastCalledWith(
				tr(
					'Impossible de charger les informations de certification.',
					'Could not load this certification.'
				)
			)
			state.error = { messages: ['TEST ACCESS DENIED'] }
			render(CourseCertification, { courseName: 'TEST' }, lang)
			expect(state.errorToast).toHaveBeenLastCalledWith('TEST ACCESS DENIED')
		})
		it(`keeps redirect without purchased option in ${lang}`, () => {
			render(CourseCertification, { courseName: 'TEST' }, lang)
			expect(state.push).toHaveBeenCalledWith({
				name: 'CourseDetail',
				params: { courseName: 'TEST' },
			})
		})
		it(`empty evaluation list, no evaluator and existing evaluation in ${lang}`, () => {
			const course = {
				course: 'TEST',
				title: 'Fictional Course',
				has_evaluator: true,
			}
			const view = render(UpcomingEvaluations, { courses: [course] }, lang)
			expect(view.text()).toContain(
				tr('Évaluations à venir', 'Upcoming Evaluations')
			)
			expect(view.text()).toContain(
				tr(
					"Planifiez une évaluation en vue d'obtenir votre certificat.",
					'Schedule an evaluation to get certified.'
				)
			)
			expect(view.text()).toContain(
				tr('Planifier une évaluation', 'Schedule an evaluation')
			)
			expect(
				render(
					UpcomingEvaluations,
					{ courses: [{ ...course, has_evaluator: false }] },
					lang
				)
					.findAll('button')
					.map((b) => b.text())
			).not.toContain(tr('Planifier une évaluation', 'Schedule an evaluation'))
			state.list = [
				{
					name: 'TEST-EVAL',
					course_title: 'Fictional Course',
					date: '2099-01-01',
					start_time: '10:00:00',
					evaluator_name: 'Fictional Evaluator',
				},
			]
			const existing = render(UpcomingEvaluations, { courses: [course] }, lang)
			expect(existing.text()).toContain('Fictional Evaluator')
			expect(existing.findAll('button').map((b) => b.text())).not.toContain(
				tr('Planifier une évaluation', 'Schedule an evaluation')
			)
		})
		it(`slots and empty selection validation in ${lang}`, async () => {
			const props = {
				modelValue: true,
				courses: [
					{ course: 'TEST', title: 'Fictional Course', has_evaluator: true },
				],
				reloadEvals: { reload: vi.fn() },
			}
			const view = render(EvaluationModal, props, lang)
			expect(view.get('[role="dialog"]').attributes('aria-label')).toBe(
				tr('Planifiez votre évaluation', 'Schedule your evaluation')
			)
			expect(view.text()).toContain(
				tr(
					'Aucun créneau disponible pour ce cours.',
					'No slots available for the selected course.'
				)
			)
			await view.get('button').trigger('click')
			expect(state.warning).toHaveBeenCalledWith(
				tr(
					'Sélectionnez un créneau pour votre évaluation.',
					'Please select a slot for your evaluation.'
				),
				{ duration: 10000 }
			)
			expect(state.write).not.toHaveBeenCalled()
			state.slots = [
				{
					display_date: '2099-01-01',
					display_day: 'Thursday',
					display_timezone_label: 'UTC',
					slots: [
						{
							date: '2099-01-01',
							start_time: '10:00:00',
							end_time: '11:00:00',
							display_start_time: '10:00:00',
							display_end_time: '11:00:00',
						},
					],
				},
			]
			const slots = render(EvaluationModal, props, lang)
			await flushPromises()
			expect(
				slots.find('button[aria-label]').attributes('aria-label')
			).toContain('10:00')
			// No selection or submit of a valid slot: no booking even in the mock.
			expect(state.write).not.toHaveBeenCalled()
		})
	}
})
