import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { installTranslations } from './helpers/frenchCatalog'
const state = vi.hoisted(() => ({
	resources: [] as any[],
	count: 9,
	stats: {
		courses: 12,
		users: 35,
		enrollments: 60,
		completions: 20,
		certifications: 14,
	},
	classes: 0,
	evals: 0,
	completed: 20,
}))
vi.mock('frappe-ui', () => ({
	createResource: (config: any) => {
		state.resources.push(config)
		const u = config.url
		return {
			data: u.endsWith('get_chart_details')
				? state.stats
				: u.endsWith('get_course_completion_data')
				? [
						{ label: 'Completed', value: state.completed },
						{ label: 'In Progress', value: 40 },
				  ]
				: u.endsWith('get_admin_live_classes')
				? Array.from({ length: state.classes }, (_, i) => ({
						name: 'FAKE-CLASS-' + i,
						title: 'Fictional Class',
						start_time: '10:00:00',
				  }))
				: u.endsWith('get_admin_evals')
				? Array.from({ length: state.evals }, (_, i) => ({
						name: 'FAKE-EVAL-' + i,
						course_title: 'Fictional Course',
						member_name: 'Fictional Learner',
						date: '2026-10-31',
						start_time: '10:00:00',
				  }))
				: [],
			loading: false,
		}
	},
	createListResource: (config: any) => ({
		data: [],
		list: { loading: false },
		hasNextPage: false,
		pageLength: 24,
		update: vi.fn(),
		reload: vi.fn(),
		next: vi.fn(),
	}),
	call: vi.fn(() => Promise.resolve(state.count)),
	usePageMeta: vi.fn(),
	Tooltip: {
		props: ['text'],
		template: '<div :data-tooltip="text"><slot /></div>',
	},
	LoadingIndicator: { template: '<i />' },
	Badge: { template: '<i />' },
	Button: { props: ['route'], template: '<button><slot /></button>' },
	FormControl: { template: '<input />' },
}))
vi.mock('frappe-ui/charts', () => ({
	NumberCard: {
		name: 'NumberCard',
		props: ['title', 'value', 'format'],
		template: '<div data-testid="counter">{{ title }}: {{ value }}</div>',
	},
	ChartCard: { template: '<div><slot /></div>' },
	LineChart: {
		name: 'LineChart',
		props: ['title', 'data'],
		template: '<span>{{title}}</span>',
	},
	DonutChart: {
		name: 'DonutChart',
		props: ['data'],
		template: '<span data-testid="donut" />',
	},
}))
vi.mock('@/stores/session', () => ({
	sessionStore: () => ({ brand: {}, user: {} }),
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/utils', () => ({
	formatTime: (v: string) => v,
	openSettings: vi.fn(),
}))
vi.mock('@/utils/dayjs', () => ({ serverTime: {} }))
vi.mock('@/components/Layouts/pages/PageHeader.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/Layouts/pages/ListPage.vue', () => ({
	default: {
		props: ['rows', 'totalCount'],
		template:
			'<section><slot name="name" /><slot name="actions" /><slot name="filters" /></section>',
	},
}))
vi.mock('@/components/CourseCard.vue', () => ({
	default: { template: '<i />' },
}))
vi.mock('@/pages/Batches/components/BatchCard.vue', () => ({
	default: { template: '<i />' },
}))
vi.mock('@/pages/Home/LiveClassCard.vue', () => ({
	default: { template: '<i />' },
}))
vi.mock('@/pages/Home/StudentHome.vue', () => ({
	default: { template: '<div data-testid="student-home" />' },
}))
vi.mock('@/pages/Home/Streak.vue', () => ({ default: { template: '<i />' } }))
vi.mock('@/components/Controls/ClearableCombobox.vue', () => ({
	default: { template: '<i />' },
}))
vi.mock('@/components/Controls/ToggleFilter.vue', () => ({
	default: { template: '<i />' },
}))
vi.mock('@/components/UserAvatar.vue', () => ({
	default: { template: '<i />' },
}))
import Statistics from '@/pages/Statistics.vue'
import Home from '@/pages/Home/Home.vue'
import CertifiedParticipants from '@/pages/CertifiedParticipants.vue'
beforeEach(() => {
	state.resources = []
	state.classes = 0
	state.evals = 0
	state.count = 9
	state.completed = 20
})
for (const lang of ['fr', 'en'])
	describe(`FR-03B.9 ${lang}`, () => {
		const text = (fr: string, en: string) => (lang === 'fr' ? fr : en)
		const opts = (role = { is_moderator: true }) => ({
			global: {
				provide: {
					$user: {
						data: {
							name: 'fictional@example.com',
							full_name: 'Fictional Staff',
							...role,
						},
					},
					$dayjs: () => ({ format: () => '2026-10-31' }),
				},
				mocks: { __: installTranslations(lang) },
				stubs: { RouterLink: { template: '<a><slot /></a>' } },
			},
		})
		it('labels certificates rather than nine distinct people and keeps all five numbers', () => {
			const w = mount(Statistics, opts())
			const cards = w.findAll('[data-testid="counter"]')
			expect(cards.map((c) => c.text())).toEqual(
				lang === 'fr'
					? [
							'Cours publiés: 12',
							'Comptes activés: 35',
							'Inscriptions aux cours: 60',
							'Inscriptions achevées: 20',
							'Certificats publiés: 14',
					  ]
					: [
							'Published Courses: 12',
							'Enabled accounts: 35',
							'Course Enrollments: 60',
							'Completed enrollments: 20',
							'Published certificates: 14',
					  ]
			)
			expect(w.find('[data-tooltip]').attributes('data-tooltip')).toBe(
				text(
					'Cours publiés hors cours à venir',
					'Published courses excluding upcoming courses'
				)
			)
			expect(state.stats.certifications).not.toBe(state.count)
			expect(
				state.resources.find((r) => r.params?.chart_name === 'New Signups')
			).toBeDefined()
			w.unmount()
		})
		it('preserves hasCompletions at zero and a positive value without changing chart rows', () => {
			for (const n of [0, 1, 20]) {
				state.completed = n
				const w = mount(Statistics, opts())
				expect(w.find('[data-testid="donut"]').exists()).toBe(n > 0)
				w.unmount()
			}
		})
		for (const n of [0, 1, 5])
			it(`keeps the directory count ${n} distinct and grammatical`, async () => {
				state.count = n
				const w = mount(CertifiedParticipants, opts())
				await flushPromises()
				expect(w.text()).toContain(
					lang === 'fr'
						? n === 1
							? '1 personne certifiée'
							: `${n} personnes certifiées`
						: n === 1
						? '1 certified participant'
						: `${n} certified participants`
				)
				expect(w.text()).toContain(
					text('Cours avec certificat', 'Certificate courses')
				)
				w.unmount()
			})
		for (const role of ['is_moderator', 'is_instructor', 'is_evaluator'])
			for (const n of [0, 1, 3])
				it(`${role} summary with ${n} live classes and evaluations`, async () => {
					state.classes = n
					state.evals = n
					const w = mount(Home, opts({ [role]: true }))
					await flushPromises()
					expect(w.text()).toContain(
						text('Bonjour', 'Hey') + ', Fictional Staff'
					)
					if (n === 0) {
						expect(w.text()).toContain(
							text(
								"Gérez vos cours et vos sessions en un coup d'œil",
								'Manage your courses and batches at a glance'
							)
						)
						expect(w.text()).toContain(
							text('Aucun cours créé', 'No courses created')
						)
					} else
						expect(w.text()).toContain(
							lang === 'fr'
								? `Au programme : ${n} ${
										n === 1 ? 'séance en direct' : 'séances en direct'
								  } à venir et ${n} ${n === 1 ? 'évaluation' : 'évaluations'}.`
								: `You have ${n} upcoming ${
										n === 1 ? 'live class' : 'live classes'
								  } and ${n} ${
										n === 1 ? 'evaluation' : 'evaluations'
								  } scheduled.`
						)
					w.unmount()
				})
	})
