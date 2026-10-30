import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { reactive, nextTick } from 'vue'
import { installTranslations } from './helpers/frenchCatalog'
import CourseForm from '@/pages/Courses/CourseForm.vue'
import CourseDashboard from '@/pages/Courses/CourseDashboard.vue'
import { validateCourse } from '@/utils/courseForm'

const state = vi.hoisted(() => ({
	options: [] as any[],
	rows: [] as any[],
	filters: {} as any,
	push: vi.fn(),
	dialog: vi.fn(),
	submit: vi.fn(),
	toast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: state.push }) }))
vi.mock('@/utils', () => ({
	formatAmount: String,
	getMetaInfo: vi.fn(),
	updateMetaInfo: vi.fn(),
}))
vi.mock('@/utils/exportCourse', () => ({ exportCourseAsZip: vi.fn() }))
vi.mock('@/composables/useKeyboardShortcuts', () => ({
	useKeyboardShortcuts: vi.fn(),
	saveShortcut: (f: any) => f,
}))
vi.mock('@/components/Courses/CourseDetailsSection.vue', async () => {
	const { inject } = await import('vue')
	return {
		default: {
			setup: () => ({ form: inject('courseForm') }),
			template: `<button data-edit @click="form.resource.doc.title='Fictional edited';form.markDirty()">edit</button>`,
		},
	}
})
vi.mock('@/components/Courses/CourseOverviewSection.vue', () => ({
	default: { render: () => null },
}))
vi.mock('@/pages/Courses/CoursePublishSettings.vue', () => ({
	default: { render: () => null },
}))
vi.mock('@/components/SkeletonLoader.vue', () => ({
	default: { render: () => null },
}))
vi.mock('@/pages/Courses/StudentCourseProgress.vue', () => ({
	default: { render: () => null },
}))
vi.mock('@/components/ProgressBar.vue', () => ({
	default: { render: () => null },
}))
vi.mock('@/components/ResponsiveListView.vue', () => ({
	default: {
		props: ['columns', 'rows'],
		template:
			'<table><thead><tr><th v-for="c in columns">{{c.label}}</th></tr></thead><tbody><tr v-for="r in rows"><td>{{r.member_name}}</td></tr></tbody></table>',
	},
}))
vi.mock('@/components/NumberChartGraph.vue', () => ({
	default: {
		props: ['title', 'value'],
		template: '<section><h2>{{title}}</h2><span>{{value}}</span></section>',
	},
}))
vi.mock('@/components/Layouts/EmptyStateLayout.vue', () => ({
	default: {
		props: ['title', 'description'],
		template: '<div><h2>{{title}}</h2><p>{{description}}</p></div>',
	},
}))
vi.mock('@/components/Controls/Select.vue', () => ({
	default: {
		props: ['options'],
		template:
			'<select><option v-for="o in options">{{o.label}}</option></select>',
	},
}))
vi.mock('frappe-ui/charts', async () => {
	const { ref } = await import('vue')
	return {
		registerChartModules: vi.fn(),
		useChart: vi.fn(),
		useChartTokens: () => ({
			tokens: ref({ categorical: Array(10).fill('gray') }),
		}),
	}
})
vi.mock('frappe-ui', async () => {
	const { reactive } = await import('vue')
	return {
		toast: state.toast,
		createDocumentResource: () => documentResource,
		createResource: (opts: any) => {
			state.options.push(opts)
			return reactive({
				data: opts.url.includes('distribution')
					? { average_progress: 45, progress_distribution: [] }
					: [],
				reload: vi.fn(),
			})
		},
		createListResource: () =>
			reactive({
				get data() {
					return list.rows
				},
				loading: false,
				hasNextPage: false,
				update: (p: any) => {
					state.filters = p.filters
				},
				reload: vi.fn(),
				next: vi.fn(),
			}),
		FormControl: {
			props: ['modelValue', 'placeholder'],
			emits: ['update:modelValue'],
			template: `<input :value="modelValue" :placeholder="placeholder" @input="$emit('update:modelValue',$event.target.value)" />`,
		},
		Avatar: { template: '<span />' },
		Button: { template: '<button><slot /></button>' },
		Tooltip: { template: '<span><slot /></span>' },
		ErrorMessage: { props: ['message'], template: '<span>{{message}}</span>' },
	}
})
const list = reactive({ rows: [] as any[] })
const documentResource = reactive({
	doc: null as any,
	setValue: { submit: state.submit },
	reload: vi.fn(),
})
enableAutoUnmount(afterEach)
beforeEach(() => {
	state.options = []
	list.rows = []
	state.filters = {}
	vi.clearAllMocks()
	documentResource.doc = null
})
afterEach(() => {
	vi.useRealTimers()
	installTranslations('en')
})
const doc = () => ({
	name: 'FAKE-COURSE',
	doctype: 'LMS Course',
	title: 'Fictional course',
	short_introduction: 'Fictional introduction',
	description: '<p>Fictional description</p>',
	instructors: [{ instructor: 'fictional@example.com' }],
	related_courses: [],
	paid_course: 0,
	paid_certificate: 0,
	currency: 'EUR',
	course_price: 100,
})
const form = async (
	lang: string,
	user: Record<string, unknown> = {
		name: 'fictional@example.com',
		is_moderator: true,
	}
) => {
	const translate = installTranslations(lang)
	vi.stubGlobal('__', translate)
	const w = mount(CourseForm, {
		props: {
			course: { data: { name: 'FAKE-COURSE' }, reload: vi.fn() } as any,
		},
		global: {
			mocks: { __: translate },
			plugins: [
				(app: any) => {
					app.config.globalProperties.$dialog = state.dialog
				},
			],
			provide: {
				$user: { data: user },
			},
		},
	})
	documentResource.doc = doc()
	await nextTick()
	await flushPromises()
	return w
}
describe('FR-03B.4 course administration', () => {
	for (const lang of ['fr', 'en']) {
		it(`shows the destructive warning without invoking its action in ${lang}`, async () => {
			const w = await form(lang)
			;(w.vm as any).trashCourse()
			const options = state.dialog.mock.calls[0][0]
			expect(options.title).toBe(
				lang === 'fr' ? 'Supprimer le cours' : 'Delete Course'
			)
			expect(options.message).toBe(
				lang === 'fr'
					? 'La suppression du cours supprimera également tous ses chapitres et toutes ses leçons. Voulez-vous vraiment supprimer ce cours ?'
					: 'Deleting the course will also delete all its chapters and lessons. Are you sure you want to delete this course?'
			)
			expect(options.actions[0]).toMatchObject({
				label: lang === 'fr' ? 'Supprimer' : 'Delete',
				theme: 'red',
			})
			expect(state.submit).not.toHaveBeenCalled()
			const deletion = state.options.find(
				(o) => o.url === 'lms.lms.api.delete_course'
			)
			deletion.onError({ messages: ['TEST-REFUSAL'] })
			expect(state.toast.error).toHaveBeenCalledWith('TEST-REFUSAL')
			// Only the success callback is inspected; the destructive action is never run.
			deletion.onSuccess()
			expect(state.toast.success).toHaveBeenCalledWith(
				lang === 'fr'
					? 'Cours supprimé avec succès'
					: 'Course deleted successfully'
			)
		})
		it(`intercepts the existing deferred save and its success/error callbacks in ${lang}`, async () => {
			const w = await form(lang)
			vi.useFakeTimers()
			await w.get('[data-edit]').trigger('click')
			expect(state.submit).not.toHaveBeenCalled()
			await vi.advanceTimersByTimeAsync(1000)
			expect(state.submit).toHaveBeenCalledTimes(1)
			const [params, handlers] = state.submit.mock.calls[0]
			expect(params).toMatchObject({
				name: 'FAKE-COURSE',
				title: 'Fictional edited',
				instructors: [{ instructor: 'fictional@example.com' }],
			})
			handlers.onSuccess()
			// Explicit save, in memory, keeps its success toast; silent save does not add one.
			;(w.vm as any).submitCourse()
			state.submit.mock.calls[1][1].onSuccess()
			expect(state.toast.success).toHaveBeenCalledWith(
				lang === 'fr'
					? 'Cours mis à jour avec succès'
					: 'Course updated successfully'
			)
			const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
			state.submit.mock.calls[1][1].onError({ messages: ['TEST-SAVE-REFUSAL'] })
			expect(errorLog).toHaveBeenCalledWith({ messages: ['TEST-SAVE-REFUSAL'] })
			errorLog.mockRestore()
			expect(state.toast.error).toHaveBeenCalledWith('TEST-SAVE-REFUSAL')
		})
		it(`renders empty/search/dashboard headings with unchanged query filters in ${lang}`, async () => {
			const translate = installTranslations(lang)
			vi.stubGlobal('__', translate)
			const w = mount(CourseDashboard, {
				props: {
					course: {
						data: {
							name: 'FAKE-COURSE',
							enrollments: 0,
							lessons: 4,
							rating: 3,
						},
					} as any,
				},
				global: {
					mocks: { __: translate },
					provide: { $dayjs: () => ({ format: () => '' }) },
				},
			})
			expect(w.text()).toContain(
				lang === 'fr' ? "Taux moyen d'achèvement" : 'Average Completion Rate'
			)
			expect(w.text()).toContain('45%')
			expect(w.text()).toContain(
				lang === 'fr' ? 'Apprenants inscrits' : 'Enrolled learners'
			)
			expect(w.text()).toContain(
				lang === 'fr'
					? 'Aucun apprenant inscrit pour le moment'
					: 'No students enrolled yet'
			)
			list.rows = [
				{ name: 'FAKE-ENROLLMENT', member_name: 'Fictional Learner' },
			]
			await nextTick()
			const search = w.get(
				`input[aria-label="${translate('Search students')}"]`
			)
			await search.setValue('Missing Learner')
			list.rows = []
			await nextTick()
			expect(state.filters).toEqual({
				course: 'FAKE-COURSE',
				member_name: ['like', '%Missing Learner%'],
			})
			expect(w.text()).toContain(
				lang === 'fr'
					? 'Aucun apprenant ne correspond à votre recherche'
					: 'No students match your search'
			)
		})
		it(`preserves validation parameters for free/paid/certificate courses in ${lang}`, () => {
			vi.stubGlobal('__', installTranslations(lang))
			const d = doc()
			expect(
				validateCourse({ doc: d as any, instructors: ['fictional'] })
			).toBeNull()
			d.title = ''
			expect(
				validateCourse({ doc: d as any, instructors: ['fictional'] })
			).toBe(
				lang === 'fr'
					? 'Renseignez le champ « Titre » avant d’enregistrer.'
					: 'Add a Title before saving.'
			)
			d.title = 'Fictional'
			for (const kind of ['paid_course', 'paid_certificate'] as const) {
				d.paid_course = 0
				d.paid_certificate = 0
				d[kind] = 1
				d.currency = ''
				expect(
					validateCourse({ doc: d as any, instructors: ['fictional'] })
				).toBe(
					lang === 'fr'
						? `La devise est obligatoire pour ${
								kind === 'paid_course'
									? 'les cours payants'
									: 'les options certificat payantes'
						  }.`
						: `Currency is required for ${
								kind === 'paid_course' ? 'paid courses' : 'paid certificates'
						  }.`
				)
			}
		})
	}
})

describe('FR-03B.4 existing course form access guards', () => {
	it.each([
		{
			role: 'Moderator',
			user: { name: 'other@example.com', is_moderator: true },
			allowed: true,
		},
		{
			role: 'assigned instructor',
			user: { name: 'fictional@example.com', is_instructor: true },
			allowed: true,
		},
		{
			role: 'unassigned Course Creator',
			user: { name: 'other@example.com', is_instructor: true },
			allowed: false,
		},
		{
			role: 'evaluator',
			user: { name: 'other@example.com', is_evaluator: true },
			allowed: false,
		},
		{
			role: 'learner',
			user: { name: 'other@example.com', is_student: true },
			allowed: false,
		},
	])('keeps $role client access unchanged', async ({ user, allowed }) => {
		await form('fr', user)
		expect(
			state.push.mock.calls.some(([target]) => target.name === 'Courses')
		).toBe(!allowed)
		expect(state.submit).not.toHaveBeenCalled()
	})
})
