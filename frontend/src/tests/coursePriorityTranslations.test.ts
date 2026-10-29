import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, reactive } from 'vue'
import translationPlugin from '@/translation'
import CourseCard from '@/components/CourseCard.vue'
import CourseCardOverlay from '@/components/CourseCardOverlay.vue'
import CourseOverview from '@/pages/Courses/CourseOverview.vue'
import ListPage from '@/components/Layouts/pages/ListPage.vue'
import ReviewModal from '@/components/Modals/ReviewModal.vue'

const state = vi.hoisted(() => ({
	error: null as unknown,
	submits: vi.fn(),
	toast: vi.fn(),
	pending: [] as any[],
}))
vi.mock('frappe-ui', () => {
	const slot = { template: '<div><slot /></div>' }
	return {
		Tooltip: slot,
		Badge: slot,
		LoadingIndicator: slot,
		Alert: { props: ['description'], template: '<div>{{ description }}</div>' },
		Button: {
			props: ['label'],
			template: '<button>{{ label }}<slot /></button>',
		},
		FormControl: {
			props: ['label', 'modelValue'],
			template: '<textarea :aria-label="label" />',
		},
		Rating: {
			props: ['label', 'modelValue'],
			emits: ['update:modelValue'],
			template:
				'<input :aria-label="label" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
		},
		Dialog: {
			props: ['title', 'actions', 'open'],
			emits: ['update:open'],
			render() {
				return h('section', [
					h('h1', this.title),
					this.$slots.default?.(),
					...(this.actions || []).map((a: any) =>
						h(
							'button',
							{ onClick: () => a.onClick({ close: () => {} }) },
							a.label
						)
					),
				])
			},
		},
		call: vi.fn(),
		toast: { error: state.toast, success: vi.fn(), warning: vi.fn() },
		createResource: (options: any) => {
			if (options.url === 'lms.lms.api.get_translations') {
				state.pending.push(options)
				return {}
			}
			return reactive({
				data: [],
				loading: false,
				fetch: vi.fn(),
				reload: vi.fn(),
				submit: (_: any, handlers: any) => {
					state.submits()
					handlers.onError?.(state.error || {})
					return Promise.resolve()
				},
			})
		},
	}
})
vi.mock('frappe-ui/experimental', () => ({
	ListFooter: { template: '<div><slot name="right" /></div>' },
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/stores/session', () => ({
	sessionStore: () => ({ user: 'learner@example.com' }),
}))
vi.mock('@/utils', () => ({ formatAmount: String, formatRating: String }))
vi.mock('@/components/Layouts/pages/PageBody.vue', () => ({
	default: {
		template:
			'<div><slot name="filters" /><slot /><slot name="footer" /></div>',
	},
}))
vi.mock('@/components/Layouts/pages/PageHeader.vue', () => ({
	default: { template: '<div><slot /></div>' },
}))
vi.mock('@/components/ResponsiveListView.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/SkeletonLoader.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CardLink.vue', () => ({
	default: { template: '<a><slot /></a>' },
}))
vi.mock('@/components/CourseInstructors.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/UserAvatar.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CertificationLinks.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/VideoPreview.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CourseOutline.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CourseReviews.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CourseCreatorCard.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/RelatedCourses.vue', () => ({
	default: { template: '<div />' },
}))

const french: Record<string, string> = {
	Free: 'Libre',
	Review: 'Révoir',
	'Free course': 'Gratuit',
	'Your review': 'Avis',
	'No courses found': 'Aucun cours trouvé',
	'1 student enrolled': '1 apprenant inscrit',
	'{0} students enrolled': '{0} apprenants inscrits',
	'Course progress': 'Progression du cours',
	'Course progress: {0}%': 'Progression du cours : {0} %',
	Submit: 'Valider',
	Error: 'Erreur',
	'Please enter a rating.': 'Veuillez attribuer une note.',
}
const original = window.__
const wrappers: VueWrapper[] = []
function render(component: any, props: any, language: string) {
	window.translatedMessages = language === 'fr' ? french : {}
	const wrapper = mount(component, {
		props,
		global: {
			plugins: [translationPlugin],
			provide: { $user: { data: { name: 'learner@example.com' } } },
			stubs: { 'router-link': true },
		},
	})
	wrappers.push(wrapper)
	return wrapper
}
afterEach(() => {
	wrappers.splice(0).forEach((w) => w.unmount())
	window.__ = original
	delete window.translatedMessages
	state.toast.mockClear()
	state.submits.mockClear()
	state.error = null
})

describe('scoped learner catalogue translations', () => {
	for (const language of ['fr', 'en']) {
		it.each([0, 1, 2, 5])(
			`keeps counts, prices and accessible progress correct in ${language}: %s`,
			(n) => {
				const data = {
					name: 'COURSE',
					title: 'User course title',
					instructors: [],
					lessons: 0,
					enrollments: n,
					membership: { progress: n },
				}
				const overlay = render(
					CourseCardOverlay,
					{ course: { data } },
					language
				)
				expect(overlay.text()).toContain(
					language === 'fr' ? 'Gratuit' : 'Free course'
				)
				const expected =
					language === 'fr'
						? n === 1
							? '1 apprenant inscrit'
							: `${n} apprenants inscrits`
						: n === 1
						? '1 student enrolled'
						: `${n} students enrolled`
				if (n) expect(overlay.text()).toContain(expected)
				else
					expect(overlay.text()).not.toContain(
						language === 'fr' ? 'apprenant' : 'student'
					)
				const card = render(CourseCard, { course: data }, language)
				if (n) expect(card.text()).toContain(expected)
				else
					expect(card.text()).not.toContain(
						language === 'fr' ? 'apprenant' : 'student'
					)
				expect(card.text()).toContain(
					language === 'fr'
						? `Progression du cours : ${n} %`
						: `Course progress: ${n}%`
				)
				expect(card.get('[role="progressbar"]').attributes('aria-label')).toBe(
					language === 'fr' ? 'Progression du cours' : 'Course progress'
				)
				const overview = render(CourseOverview, { course: { data } }, language)
				if (n) expect(overview.text()).toContain(expected)
			}
		)
		it(`uses a contextual empty heading and announcement in ${language}`, async () => {
			const title =
				language === 'fr' ? 'Aucun cours trouvé' : 'No courses found'
			const view = render(
				ListPage,
				{
					rows: [],
					breadcrumbs: [],
					emptyName: 'Courses',
					emptyTitle: title,
					loading: true,
				},
				language
			)
			await view.setProps({ loading: false })
			await new Promise((r) => setTimeout(r, 550))
			expect(view.text()).toContain(title)
			expect(view.get('[role="status"]').text()).toBe(title)
			expect(view.text()).not.toContain('Aucun Courses')
		})
		it(`translates review labels, validation and fallback without a real save in ${language}`, async () => {
			const view = render(
				ReviewModal,
				{ modelValue: true, courseName: 'COURSE' },
				language
			)
			expect(view.get('textarea').attributes('aria-label')).toBe(
				language === 'fr' ? 'Avis' : 'Your review'
			)
			const action = view
				.findAll('button')
				.find((b) => b.text() === (language === 'fr' ? 'Valider' : 'Submit'))!
			expect(action).toBeDefined()
			await action.trigger('click')
			expect(state.toast).toHaveBeenCalledWith(
				language === 'fr'
					? 'Veuillez attribuer une note.'
					: 'Please enter a rating.'
			)
			expect(state.submits).not.toHaveBeenCalled()
			await view.get('input').setValue('5')
			await action.trigger('click')
			expect(state.toast).toHaveBeenLastCalledWith(
				language === 'fr' ? 'Erreur' : 'Error'
			)
		})
	}
})
