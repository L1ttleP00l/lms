import { installTranslations } from './helpers/frenchCatalog'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

type ResourceOptions = {
	url?: string
	onSuccess?: (data: unknown) => void
	onError?: (error: any) => void
}

const { passthrough, resources, toast } = vi.hoisted(() => {
	window.matchMedia ??= (() => ({
		matches: false,
		addEventListener: () => {},
		removeEventListener: () => {},
	})) as unknown as typeof window.matchMedia
	return {
		passthrough: { template: `<div><slot /></div>` },
		resources: [] as ResourceOptions[],
		toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
	}
})

vi.mock('@/stores/settings', () => ({ useSettings: () => ({}) }))
vi.mock('@/stores/user', () => ({ usersStore: () => ({ userResource: {} }) }))
vi.mock('@/stores/session', () => ({ sessionStore: () => ({ brand: {} }) }))
vi.mock('frappe-ui', async () => {
	const { reactive } = await import('vue')
	return {
		createResource: (options: ResourceOptions) => {
			resources.push(options)
			return reactive({
				data:
					options.url === 'lms.lms.utils.get_course_details'
						? { name: 'FAKE-COURSE', published: coursePublished }
						: null,
				loading: false,
				reload: vi.fn(),
			})
		},
		usePageMeta: vi.fn(),
		toast,
		Badge: passthrough,
		Button: passthrough,
		Dropdown: passthrough,
		Tooltip: passthrough,
	}
})
vi.mock('@framework/ui/telemetry/index', () => ({
	useTelemetry: () => ({ capture: vi.fn() }),
}))
vi.mock('@framework/ui/components/Onboarding/index', () => ({
	useOnboarding: () => ({ updateOnboardingStep: vi.fn() }),
}))

const { stub } = vi.hoisted(() => ({
	stub: () => ({ default: { render: () => null } }),
}))
vi.mock('@/components/Layouts/pages/TabbedDetailPage.vue', stub)
vi.mock('@/pages/Courses/CourseEditor.vue', stub)
vi.mock('@/pages/Courses/CourseOverview.vue', stub)
vi.mock('@/pages/Courses/CourseDashboard.vue', stub)
vi.mock('@/pages/Courses/CourseForm.vue', stub)
vi.mock('@/components/SkeletonLoader.vue', stub)
vi.mock('@/components/LessonHelp.vue', stub)
vi.mock('@/components/ShortcutTooltip.vue', stub)
vi.mock('@/components/HeaderButton.vue', stub)

import CourseDetail from '@/pages/Courses/CourseDetail.vue'

let coursePublished = 0
const publish = async (
	response: Record<string, unknown>,
	lang = 'en',
	published = 0
) => {
	const translate = installTranslations(lang)
	vi.stubGlobal('__', translate)
	resources.length = 0
	coursePublished = published
	const router = createRouter({
		history: createMemoryHistory(),
		routes: [
			{ path: '/courses/:courseName', component: CourseDetail, props: true },
		],
	})
	await router.push('/courses/COURSE-1')
	mount(CourseDetail, {
		props: { courseName: 'COURSE-1' },
		global: {
			plugins: [router],
			provide: { $user: { data: { name: 'mod@example.com' } } },
			mocks: { __: translate },
		},
	})
	await flushPromises()
	const toggle = resources.find((r) => r.url === 'frappe.client.set_value')
	toggle?.onSuccess?.(response)
	return toggle
}

describe('publishing a course', () => {
	it('warns about quizzes that have no questions', async () => {
		await publish({
			published: 1,
			__onload: { quizzes_without_questions: ['Week 1 Quiz'] },
		})
		expect(toast.warning).toHaveBeenCalledWith(
			expect.stringContaining('Week 1 Quiz')
		)
	})

	it('does not warn when every quiz has questions', async () => {
		toast.warning.mockClear()
		await publish({ published: 1 })
		expect(toast.warning).not.toHaveBeenCalled()
	})
})

describe('FR-03B.4 publication results in both languages', () => {
	afterEach(() => installTranslations('en'))
	for (const lang of ['fr', 'en'])
		for (const alreadyPublished of [0, 1])
			it(`keeps publication and quiz warning messages in ${lang}, published=${alreadyPublished}`, async () => {
				toast.success.mockClear()
				toast.warning.mockClear()
				toast.error.mockClear()
				const toggle = await publish(
					{ __onload: { quizzes_without_questions: ['Fictional Quiz'] } },
					lang,
					alreadyPublished
				)
				expect(toast.success).toHaveBeenCalledWith(
					lang === 'fr'
						? alreadyPublished
							? 'Cours dépublié'
							: 'Cours publié'
						: alreadyPublished
						? 'Course unpublished'
						: 'Course published'
				)
				expect(toast.warning).toHaveBeenCalledWith(
					lang === 'fr'
						? 'Ces quiz ne contiennent aucune question ; les apprenants peuvent les passer sans répondre : Fictional Quiz'
						: 'These quizzes have no questions, so learners skip them: Fictional Quiz'
				)
				toggle?.onError?.({})
				expect(toast.error).toHaveBeenCalledWith(
					lang === 'fr'
						? 'Impossible de modifier le statut de publication'
						: 'Could not update publish status'
				)
				toggle?.onError?.({ messages: ['TEST-REFUSAL'] })
				expect(toast.error).toHaveBeenCalledWith('TEST-REFUSAL')
			})
})
