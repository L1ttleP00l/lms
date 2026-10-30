import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import CourseCardOverlay from '@/components/CourseCardOverlay.vue'
import translationPlugin from '@/translation'
import { resourceErrorMessage } from '@/utils/resource'
const state = vi.hoisted(() => ({
	error: null as unknown,
	call: vi.fn(),
	warning: vi.fn(),
	success: vi.fn(),
	push: vi.fn(),
}))
vi.mock('frappe-ui', () => ({
	Tooltip: { template: '<div><slot /></div>' },
	Button: {
		name: 'TestButton',
		props: ['route'],
		template: '<button><slot /></button>',
	},
	Alert: {
		props: ['description'],
		template: '<p role="alert">{{ description }}</p>',
	},
	call: (...args: unknown[]) => {
		state.call(...args)
		return state.error
			? Promise.reject(state.error)
			: Promise.resolve({ name: 'SIMULATED' })
	},
	toast: { warning: state.warning, success: state.success, error: vi.fn() },
	createResource: () =>
		reactive({ data: [], loading: false, fetch: vi.fn(), reload: vi.fn() }),
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: state.push }) }))
vi.mock('@/components/CertificationLinks.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/VideoPreview.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/utils', () => ({ formatAmount: String }))
vi.mock('@/utils/resource', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/utils/resource')>()
	return { ...actual, resourceErrorMessage: vi.fn(actual.resourceErrorMessage) }
})
const fr: Record<string, string> = {
	'Enroll Now': "S'inscrire",
	'Buy this course': 'Acheter ce cours',
	'You need to login first to enroll for this course':
		'Connectez-vous pour vous inscrire à ce cours.',
	'You have been enrolled in this course': 'Vous êtes inscrit à ce cours.',
	Error: 'Erreur',
	'Contact the Administrator to enroll for this course':
		"Contactez l'administrateur pour vous inscrire à ce cours",
	'Start Learning': 'Commencer le cours',
	'Continue Learning': 'Reprendre le cours',
}
function render(
	lang: string,
	data: Record<string, unknown> = {},
	guest = false
) {
	window.translatedMessages = lang === 'fr' ? fr : {}
	return mount(CourseCardOverlay, {
		props: { course: { data: { name: 'COURSE', ...data } } },
		global: {
			plugins: [translationPlugin],
			provide: {
				$user: { data: guest ? null : { name: 'learner@example.com' } },
			},
		},
	})
}
afterEach(() => {
	delete window.translatedMessages
	state.error = null
	vi.clearAllMocks()
})
describe('safe self-enrollment translations', () => {
	for (const lang of ['fr', 'en']) {
		it(`asks a guest to log in without inserting in ${lang}`, async () => {
			vi.useFakeTimers()
			const view = render(lang, {}, true)
			await view.get('button').trigger('click')
			expect(state.warning).toHaveBeenCalledWith(
				lang === 'fr'
					? 'Connectez-vous pour vous inscrire à ce cours.'
					: 'You need to login first to enroll for this course'
			)
			expect(state.call).not.toHaveBeenCalled()
			expect(vi.getTimerCount()).toBe(1)
		})
		it(`keeps payment, disabled self-learning and membership branches in ${lang}`, () => {
			const free = render(lang)
			expect(free.get('button').text()).toBe(
				lang === 'fr' ? "S'inscrire" : 'Enroll Now'
			)
			const paid = render(lang, { paid_course: 1, disable_self_learning: 1 })
			expect(paid.get('button').text()).toBe(
				lang === 'fr' ? 'Acheter ce cours' : 'Buy this course'
			)
			expect(paid.findComponent({ name: 'TestButton' }).props('route')).toEqual(
				{ name: 'Billing', params: { type: 'course', name: 'COURSE' } }
			)
			// Route is passed to the native Button and remains a Billing course route.
			const closed = render(lang, { disable_self_learning: 1 })
			expect(closed.get('[role="alert"]').text()).toBe(
				lang === 'fr'
					? "Contactez l'administrateur pour vous inscrire à ce cours"
					: 'Contact the Administrator to enroll for this course'
			)
			expect(closed.find('button').exists()).toBe(false)
			for (const progress of [0, 25]) {
				const member = render(lang, { membership: { progress } })
				expect(member.get('button').text()).toContain(
					lang === 'fr'
						? progress
							? 'Reprendre le cours'
							: 'Commencer le cours'
						: progress
						? 'Continue Learning'
						: 'Start Learning'
				)
			}
			expect(state.call).not.toHaveBeenCalled()
		})
		it(`shows a simulated success and preserves the insertion contract and route in ${lang}`, async () => {
			vi.useFakeTimers()
			const view = render(lang)
			await view.get('button').trigger('click')
			await flushPromises()
			expect(state.call).toHaveBeenCalledWith('frappe.client.insert', {
				doc: {
					doctype: 'LMS Enrollment',
					course: 'COURSE',
					member: 'learner@example.com',
				},
			})
			expect(state.success).toHaveBeenCalledWith(
				lang === 'fr'
					? 'Vous êtes inscrit à ce cours.'
					: 'You have been enrolled in this course'
			)
			await vi.advanceTimersByTimeAsync(1000)
			expect(state.push).toHaveBeenCalledWith({
				name: 'Lesson',
				params: { courseName: 'COURSE', chapterNumber: 1, lessonNumber: 1 },
			})
		})
		it.each([false, true])(
			`keeps specific server errors and translates the helper fallback in ${lang}: %s`,
			async (specific) => {
				vi.spyOn(console, 'error').mockImplementation(() => {})
				state.error = specific
					? {
							messages: ['Server validation stays exact', 'Ignored second'],
							message: 'Ignored lower priority',
					  }
					: { message: 'Failed to fetch' }
				const view = render(lang)
				await view.get('button').trigger('click')
				await flushPromises()
				expect(resourceErrorMessage).toHaveBeenCalledWith(
					state.error,
					lang === 'fr' ? 'Erreur' : 'Error'
				)
				expect(state.warning).toHaveBeenCalledWith(
					specific
						? 'Server validation stays exact'
						: lang === 'fr'
						? 'Erreur'
						: 'Error'
				)
				expect(console.error).toHaveBeenCalledWith(state.error)
			}
		)
	}
})
