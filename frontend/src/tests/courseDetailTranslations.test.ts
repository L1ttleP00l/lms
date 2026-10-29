import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { reactive, nextTick } from 'vue'
import dayjs from 'dayjs'
import translationPlugin from '@/translation'
import CourseOverview from '@/pages/Courses/CourseOverview.vue'
import CourseReviews from '@/components/CourseReviews.vue'
import CourseCreatorCard from '@/components/CourseCreatorCard.vue'
import CourseInstructors from '@/components/CourseInstructors.vue'
const state = vi.hoisted(() => ({ outline: [] as any[], reviews: [] as any[] }))
vi.mock('frappe-ui', () => ({
	Badge: { template: '<span><slot /></span>' },
	Button: { template: '<button><slot /></button>' },
	createResource: (opts: any) =>
		reactive({
			get data() {
				return opts.url.includes('get_course_outline')
					? state.outline
					: opts.url.includes('get_reviews')
					? state.reviews
					: 0
			},
			fetch: vi.fn(),
			reload: vi.fn(),
		}),
}))
vi.mock('@/utils', () => ({
	formatAmount: String,
	formatRating: String,
	decodeEntities: (s: string) => s,
	htmlToText: (s: string) => s,
}))
vi.mock('@/components/UserAvatar.vue', () => ({
	default: { template: '<i />' },
}))
vi.mock('@/components/Modals/ReviewModal.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CourseCardOverlay.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CourseOutline.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/RelatedCourses.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/SkeletonLoader.vue', () => ({
	default: { template: '<div />' },
}))
const fr: Record<string, string> = {
	'1 chapter': '1 chapitre',
	'{0} chapters': '{0} chapitres',
	'1 lesson': '1 leçon',
	'{0} lessons': '{0} leçons',
	'Course creator': 'Formateur',
	'Taught by': 'Animé par',
	'Taught by a team of {0}': 'Animé par une équipe de {0} formateurs',
	'Also teaching': 'Autres formateurs',
	'Show more instructors': 'Afficher les autres formateurs',
	'Show instructor {0}': 'Afficher le formateur {0}',
	and: 'et',
	'and {0} other instructors': 'et {0} autres formateurs',
	'Average rating: {0}/5 · 1 review': 'Note moyenne : {0}/5 · 1 avis',
	'Average rating: {0}/5 · {1} reviews': 'Note moyenne : {0}/5 · {1} avis',
	'See more': 'Voir plus',
	'See less': 'Voir moins',
	'View all reviews': 'Voir tous les avis',
	'Write a Review': 'Donner un avis',
	Today: "Aujourd'hui",
	'1 day ago': 'Il y a 1 jour',
	'{0} days ago': 'Il y a {0} jours',
	'1 month ago': 'Il y a 1 mois',
	'{0} months ago': 'Il y a {0} mois',
	'Rated {0} out of 5': 'Note : {0} sur 5',
}
const RouterLink = {
	props: ['to'],
	template: '<a :href="`/lms/user/${to.params.username}`"><slot /></a>',
}
function render(component: any, props: any, lang: string, shallow = false) {
	window.translatedMessages = lang === 'fr' ? fr : {}
	return (shallow ? shallowMount : mount)(component, {
		props,
		attachTo: document.body,
		global: {
			plugins: [translationPlugin],
			provide: {
				$user: { data: { name: 'learner@example.com' } },
				$dayjs: dayjs,
			},
			stubs: { RouterLink, LucideStar: true },
		},
	})
}
const instructor = (i: number) => ({
	name: `trainer-${i}`,
	username: `trainer-${i}`,
	full_name: `Trainer ${i}`,
	first_name: `Trainer ${i}`,
	bio: `Biography ${i}`,
})
const review = (
	i: number,
	creation = dayjs().format('YYYY-MM-DD HH:mm:ss')
) => ({
	name: `review-${i}`,
	rating: 4,
	creation,
	review: 'Unchanged authored content '.repeat(15),
	owner_details: instructor(i),
})
afterEach(() => {
	delete window.translatedMessages
	state.outline = []
	state.reviews = []
})
describe('course detail French and English', () => {
	for (const lang of ['fr', 'en']) {
		it.each([0, 1, 2, 5])(
			`localizes chapter and lesson counts in ${lang}: %s`,
			(n) => {
				state.outline = Array.from({ length: n }, (_, i) => ({
					title: `Chapter title ${i}`,
					lessons: [{ title: `Lesson title ${i}` }],
				}))
				const view = render(
					CourseOverview,
					{
						course: {
							data: {
								name: 'COURSE',
								title: 'Authored title',
								instructors: [],
							},
						},
					},
					lang,
					true
				)
				expect(view.text()).toContain('Authored title')
				if (n)
					expect(view.text()).toContain(
						lang === 'fr'
							? `${n} chapitre${n === 1 ? '' : 's'} · ${n} leçon${
									n === 1 ? '' : 's'
							  }`
							: `${n} chapter${n === 1 ? '' : 's'} · ${n} lesson${
									n === 1 ? '' : 's'
							  }`
					)
				else
					expect(view.text()).not.toMatch(/0 (chapter|chapitre|lesson|leçon)/)
			}
		)
		it.each([1, 2, 5])(
			`keeps instructor names, profiles and selection in ${lang}: %s`,
			async (n) => {
				const instructors = Array.from({ length: n }, (_, i) => instructor(i))
				const view = render(CourseCreatorCard, { instructors }, lang)
				expect(view.text()).toContain(
					lang === 'fr'
						? n === 1
							? 'Formateur'
							: n === 2
							? 'Animé par'
							: 'Animé par une équipe de 5 formateurs'
						: n === 1
						? 'Course creator'
						: n === 2
						? 'Taught by'
						: 'Taught by a team of 5'
				)
				expect(view.text()).toContain('Biography 0')
				if (n > 1) {
					const button = view.get(
						`button[aria-label="${
							lang === 'fr' ? 'Afficher le formateur' : 'Show instructor'
						} Trainer 1"]`
					)
					expect(button.attributes('type')).toBe('button')
					if (n === 5) {
						const more = view.get(
							`button[aria-label="${
								lang === 'fr'
									? 'Afficher les autres formateurs'
									: 'Show more instructors'
							}"]`
						)
						expect(more.text()).toBe('+2')
						await more.trigger('click')
						expect(view.findAll('button')).toHaveLength(4)
					}
					await button.trigger('click')
					await nextTick()
					expect(view.text()).toContain('Biography 1')
					expect(document.activeElement?.getAttribute('href')).toBe(
						'/lms/user/trainer-1'
					)
				}
				const line = render(CourseInstructors, { instructors }, lang)
				expect(line.find('a').attributes('href')).toBe('/lms/user/trainer-0')
				if (n === 5)
					expect(line.text()).toContain(
						lang === 'fr' ? 'et 4 autres formateurs' : 'and 4 other instructors'
					)
			}
		)
		it.each([0, 1, 2, 5])(
			`uses a complete rating summary and accessible toggles in ${lang}: %s`,
			async (n) => {
				state.reviews = Array.from({ length: n }, (_, i) => review(i))
				const view = render(
					CourseReviews,
					{
						courseName: 'COURSE',
						avg_rating: n ? '4' : '0',
						membership: { member: 'learner@example.com' },
					},
					lang
				)
				expect(view.text()).toContain(
					lang === 'fr'
						? `Note moyenne : ${n ? 4 : 0}/5 · ${n} avis`
						: `Average rating: ${n ? 4 : 0}/5 · ${n} review${
								n === 1 ? '' : 's'
						  }`
				)
				if (n) {
					const rating = view.get('[role="img"]')
					expect(rating.attributes('aria-label')).toBe(
						lang === 'fr' ? 'Note : 4 sur 5' : 'Rated 4 out of 5'
					)
					const button = view.get('article button')
					expect(button.text()).toBe(lang === 'fr' ? 'Voir plus' : 'See more')
					expect(button.attributes('aria-expanded')).toBe('false')
					const id = button.attributes('aria-controls')
					expect(view.get(`[id="${id}"]`).text()).toBe(
						state.reviews[0].review.trim()
					)
					await button.trigger('click')
					expect(button.text()).toBe(lang === 'fr' ? 'Voir moins' : 'See less')
					expect(button.attributes('aria-expanded')).toBe('true')
					await button.trigger('click')
					expect(button.attributes('aria-expanded')).toBe('false')
				}
				if (n === 5) {
					expect(view.findAll('article')).toHaveLength(4)
					const button = view
						.findAll('button')
						.find(
							(b) =>
								b.text() ===
								(lang === 'fr' ? 'Voir tous les avis' : 'View all reviews')
						)!
					await button.trigger('click')
					expect(view.findAll('article')).toHaveLength(5)
				}
			}
		)
		it(`renders complete relative dates in ${lang}`, () => {
			vi.useFakeTimers({ toFake: ['Date'] })
			vi.setSystemTime(new Date('2026-10-29T12:00:00Z'))
			state.reviews = [0, 1, 2].map((n, i) =>
				review(i, dayjs().subtract(n, 'day').format('YYYY-MM-DD HH:mm:ss'))
			)
			state.reviews.push(
				review(
					3,
					dayjs()
						.subtract(1, 'month')
						.subtract(1, 'day')
						.format('YYYY-MM-DD HH:mm:ss')
				)
			)
			const view = render(CourseReviews, { courseName: 'COURSE' }, lang)
			expect(
				view.findAll('article span.text-ink-gray-6').map((n) => n.text())
			).toEqual(
				lang === 'fr'
					? ["Aujourd'hui", 'Il y a 1 jour', 'Il y a 2 jours', 'Il y a 1 mois']
					: ['Today', '1 day ago', '2 days ago', '1 month ago']
			)
			state.reviews = [
				review(
					4,
					dayjs()
						.subtract(2, 'month')
						.subtract(1, 'day')
						.format('YYYY-MM-DD HH:mm:ss')
				),
			]
			const older = render(CourseReviews, { courseName: 'OTHER' }, lang)
			expect(older.text()).toContain(
				lang === 'fr' ? 'Il y a 2 mois' : '2 months ago'
			)
		})
	}
})
