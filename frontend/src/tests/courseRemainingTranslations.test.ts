import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { reactive, nextTick } from 'vue'
import dayjs from 'dayjs'
import translationPlugin from '@/translation'
import CourseOverview from '@/pages/Courses/CourseOverview.vue'
import CourseReviews from '@/components/CourseReviews.vue'
import RelatedCourses from '@/components/RelatedCourses.vue'
import VideoPreview from '@/components/VideoPreview.vue'
import CourseCardOverlay from '@/components/CourseCardOverlay.vue'
const state = vi.hoisted(() => ({
	outline: [] as any[],
	reviews: [] as any[],
	related: [] as any[],
}))
vi.mock('frappe-ui', () => ({
	Badge: { template: '<span><slot /></span>' },
	Button: { template: '<button><slot /></button>' },
	createResource: (opts: any) =>
		reactive({
			get data() {
				return opts.url.includes('get_course_outline')
					? state.outline
					: opts.url.includes('get_related_courses')
					? state.related
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
vi.mock('@/components/CourseOutline.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/SkeletonLoader.vue', () => ({
	default: { template: '<div />' },
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/stores/session', () => ({
	sessionStore: () => ({ user: 'learner@example.com' }),
}))
vi.mock('@/components/CertificationLinks.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/CourseCard.vue', () => ({
	default: {
		props: ['course', 'to'],
		template:
			'<a :href="`/lms/courses/${to.params.courseName}`">{{ course.title }}</a>',
	},
}))
const fr: Record<string, string> = {
	'Related Courses': 'Cours associés',
	'Course content coming soon!':
		'Le contenu du cours sera bientôt disponible !',
	'On demand course video': 'Vidéo du cours à la demande',
	'Quiz topic': 'activité de quiz',
	'Quiz topics': 'activités de quiz',
	'Video preview': 'Aperçu vidéo',
}
function render(component: any, props: any, lang: string, shallow = false) {
	window.translatedMessages = lang === 'fr' ? fr : {}
	return (shallow ? shallowMount : mount)(component, {
		props,
		global: {
			plugins: [translationPlugin],
			provide: {
				$user: { data: { name: 'learner@example.com' } },
				$dayjs: dayjs,
			},
			stubs: { RouterLink: true },
		},
	})
}
afterEach(() => {
	delete window.translatedMessages
	state.outline = []
	state.reviews = []
	state.related = []
})
describe('non-commercial course details', () => {
	for (const lang of ['fr', 'en']) {
		it(`omits an empty related section and preserves multiple cards in ${lang}`, () => {
			const empty = render(RelatedCourses, { courseName: 'COURSE' }, lang)
			expect(empty.find('section').exists()).toBe(false)
			state.related = [
				{ name: 'R1', title: 'Authored title 1' },
				{ name: 'R2', title: 'Authored title 2' },
			]
			const view = render(RelatedCourses, { courseName: 'OTHER' }, lang)
			const heading = view.get('h2')
			expect(heading.text()).toBe(
				lang === 'fr' ? 'Cours associés' : 'Related Courses'
			)
			expect(view.get('section').attributes('aria-labelledby')).toBe(
				heading.attributes('id')
			)
			expect(
				view.findAll('a').map((a) => [a.text(), a.attributes('href')])
			).toEqual([
				['Authored title 1', '/lms/courses/R1'],
				['Authored title 2', '/lms/courses/R2'],
			])
		})
		it.each([
			{ outline: [] },
			{ outline: [{ title: 'Authored empty chapter', lessons: [] }] },
		])(`shows the unchanged no-content state in ${lang}: %j`, ({ outline }) => {
			state.outline = outline
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
			expect(view.text()).toContain(
				lang === 'fr'
					? 'Le contenu du cours sera bientôt disponible !'
					: 'Course content coming soon!'
			)
			expect(view.text()).toContain('Authored title')
		})
		it.each([0, 1, 2, 5])(
			`keeps quiz-block counts and conditions in ${lang}: %s`,
			(count) => {
				const view = render(
					CourseCardOverlay,
					{
						course: {
							data: {
								name: 'COURSE',
								quiz_count: count,
								video_link: '/files/synthetic-preview.mp4',
							},
						},
					},
					lang
				)
				expect(view.text()).toContain(
					lang === 'fr'
						? 'Vidéo du cours à la demande'
						: 'On demand course video'
				)
				if (count)
					expect(view.text()).toContain(
						`${count} ${
							lang === 'fr'
								? count === 1
									? 'activité de quiz'
									: 'activités de quiz'
								: count === 1
								? 'Quiz topic'
								: 'Quiz topics'
						}`
					)
				else expect(view.text()).not.toMatch(/Quiz topic|activité.*quiz/)
			}
		)
		it(`labels native video, iframe and error fallback without changing URLs in ${lang}`, async () => {
			const label = lang === 'fr' ? 'Aperçu vidéo' : 'Video preview'
			const empty = render(VideoPreview, {}, lang)
			expect(empty.find('video,iframe,img').exists()).toBe(false)
			const file = render(
				VideoPreview,
				{
					videoLink: '/files/synthetic-preview.mp4',
					fallbackImage: '/files/synthetic-poster.png',
				},
				lang
			)
			expect(file.get('video').attributes('aria-label')).toBe(label)
			expect(file.get('video').attributes('src')).toBe(
				'/files/synthetic-preview.mp4'
			)
			await file.get('video').trigger('error')
			expect(file.get('img').attributes('alt')).toBe(label)
			const yt = render(
				VideoPreview,
				{ videoLink: 'https://youtu.be/O7FIiYsVy3U' },
				lang
			)
			expect(yt.get('iframe').attributes('title')).toBe(label)
			expect(yt.get('iframe').attributes('src')).toBe(
				'https://www.youtube.com/embed/O7FIiYsVy3U'
			)
		})
	}
})
