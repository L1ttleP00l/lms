import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick, reactive } from 'vue'
import StudentCourseProgress from '@/pages/Courses/StudentCourseProgress.vue'
import Statistics from '@/pages/Statistics.vue'
import UnsplashImageBrowser from '@/components/UnsplashImageBrowser.vue'
import translationPlugin from '@/translation'

const pending = vi.hoisted(() => ({ translations: [] as any[] }))

vi.mock('frappe-ui', () => {
	const slot = { template: '<div><slot /></div>' }
	return {
		Avatar: slot,
		Badge: slot,
		Tooltip: slot,
		LoadingIndicator: slot,
		Popover: slot,
		Button: { template: '<button><slot /></button>' },
		TextInput: {
			props: ['modelValue', 'placeholder'],
			template: '<input :value="modelValue" :placeholder="placeholder" />',
		},
		Dialog: {
			props: ['title'],
			render() {
				return h('section', [h('h1', this.title), this.$slots.default?.()])
			},
		},
		FileUploader: {
			name: 'FileUploader',
			data: () => ({ progress: 0, uploading: false }),
			template:
				'<div><slot :progress="progress" :uploading="uploading" :openFileSelector="() => {}" /></div>',
		},
		createResource: vi.fn((options) => {
			if (options.url === 'lms.lms.api.get_translations') {
				pending.translations.push(options)
				return {}
			}
			let data: any = []
			if (options.url === 'lms.lms.api.get_chart_details') {
				data = {
					courses: 2,
					users: 3,
					enrollments: 4,
					completions: 1,
					certifications: 1,
				}
			} else if (options.url === 'lms.lms.utils.get_course_completion_data') {
				data = [{ label: 'Completed', value: 1 }]
			} else if (options.url === 'lms.lms.api.get_course_assessment_progress') {
				data = { quizzes: [], assignments: [], exercises: [] }
			}
			return reactive({ data, loading: false, reload: vi.fn() })
		}),
		createListResource: () => reactive({ data: [] }),
		usePageMeta: vi.fn(),
	}
})
vi.mock('frappe-ui/charts', () => {
	const chart = (name: string) => ({
		name,
		props: ['title', 'subtitle', 'value', 'data'],
		render() {
			return h('div', [h('h2', this.title), h('p', this.subtitle)])
		},
	})
	return {
		NumberCard: chart('NumberCard'),
		LineChart: chart('LineChart'),
		DonutChart: chart('DonutChart'),
		ChartCard: { template: '<div><slot /></div>' },
	}
})
vi.mock('@/stores/session', () => ({ sessionStore: () => ({ brand: {} }) }))
vi.mock('@/components/Layouts/pages/PageHeader.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/ProgressBar.vue', () => ({
	default: { template: '<div />' },
}))

const browser = window as Window & {
	translatedMessages?: Record<string, string>
	__?: any
}
const statisticTitles = [
	'Courses',
	'Signups',
	'Enrollments',
	'Completions',
	'Certifications',
	'Signups',
	'Enrollments',
	'Certifications',
	'Completions',
]
const statisticSubtitles = [
	'Signups per day',
	'Enrollments per day',
	'Certifications per day',
	'Course Completion',
]
const keys = [
	'Student Progress',
	...statisticTitles,
	...statisticSubtitles,
	'search by keyword',
	'Upload Image',
	'Uploading {0}%',
]
// Synthetic responses exercise every key, including translations not yet available in Crowdin.
const fixture = Object.fromEntries(keys.map((key) => [key, `FR test: ${key}`]))
const availableFrench = {
	Courses: 'Cours',
	'Upload Image': 'Télécharger une image',
	'Uploading {0}%': 'Envoi de {0}%',
}
let wrappers: VueWrapper[]
let previousMessages: typeof browser.translatedMessages
let previousTranslate: typeof browser.__

beforeEach(() => {
	previousMessages = browser.translatedMessages
	previousTranslate = browser.__
	wrappers = []
	pending.translations = []
})
afterEach(() => {
	for (const wrapper of wrappers) wrapper.unmount()
	browser.translatedMessages = previousMessages
	browser.__ = previousTranslate
})

function renderAll(messages?: Record<string, string>) {
	if (messages) browser.translatedMessages = messages
	else delete browser.translatedMessages
	const global = { plugins: [translationPlugin] }
	const progress = mount(StudentCourseProgress, {
		global,
		props: {
			modelValue: true,
			course: { data: { name: 'fr01b-course' } },
			student: { member: 'student@example.com', progress: 37 },
			lessons: { data: [] },
		},
	})
	const statistics = mount(Statistics, { global })
	const images = mount(UnsplashImageBrowser, { global })
	wrappers.push(progress, statistics, images)
	return { progress, statistics, images }
}

function assertLabels(
	view: ReturnType<typeof renderAll>,
	messages: Record<string, string>
) {
	const translated = (key: string) => messages[key] || key
	expect(view.progress.get('h1').text()).toBe(translated('Student Progress'))
	const cards = view.statistics.findAllComponents({ name: 'NumberCard' })
	const lines = view.statistics.findAllComponents({ name: 'LineChart' })
	const donut = view.statistics.findComponent({ name: 'DonutChart' })
	expect([...cards, ...lines, donut].map((c) => c.props('title'))).toEqual(
		statisticTitles.map(translated)
	)
	expect([...lines, donut].map((c) => c.props('subtitle'))).toEqual(
		statisticSubtitles.map(translated)
	)
	expect(view.images.get('input').attributes('placeholder')).toBe(
		translated('search by keyword')
	)
	expect(view.images.get('button').text()).toBe(translated('Upload Image'))
	expect(cards[0].props('value')).toBe(2)
	expect(donut.props('data')).toEqual([{ label: 'Completed', value: 1 }])
}

describe('FR-01B component translations', () => {
	it('preserves English source text without translations', () => {
		assertLabels(renderAll({}), {})
	})
	it('uses supplied translations for every targeted title, subtitle and action', () => {
		assertLabels(renderAll(fixture), fixture)
	})
	it('uses available French strings and falls back to English for missing keys', () => {
		assertLabels(renderAll(availableFrench), availableFrench)
	})
	it('refreshes mounted labels after an asynchronous translation response', async () => {
		const view = renderAll()
		assertLabels(view, {})
		pending.translations[0].transform(fixture)
		await nextTick()
		assertLabels(view, fixture)
	})
	it.each([0, 37, 100])(
		'preserves upload progress %s in French and English',
		async (progress) => {
			for (const messages of [availableFrench, {}]) {
				const view = renderAll(messages)
				await view.images
					.getComponent({ name: 'FileUploader' })
					.setData({ uploading: true, progress })
				expect(view.images.get('button').text()).toBe(
					messages === availableFrench
						? `Envoi de ${progress}%`
						: `Uploading ${progress}%`
				)
			}
		}
	)
})
