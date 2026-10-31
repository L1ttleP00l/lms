import { afterEach, describe, it, expect, vi } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { installTranslations } from './helpers/frenchCatalog'
import BatchStudentProgress from '@/pages/Batches/components/BatchStudentProgress.vue'
const state = vi.hoisted(() => ({ progress: 0 }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('frappe-ui', () => ({
	createResource: () => ({
		data: {
			full_name: 'Fictional Learner',
			username: 'fictional',
			progress: state.progress,
			assessments: [],
			courses: [{ title: 'Fictional course', progress: state.progress }],
		},
		loading: false,
	}),
	Dialog: { template: '<section><slot /></section>' },
	Badge: { template: '<span><slot /></span>' },
	Avatar: { template: '<i />' },
	LoadingIndicator: { template: '<i />' },
}))
vi.mock('@/components/ResponsiveListView.vue', () => ({
	default: {
		props: ['columns'],
		template: '<div><span v-for="c in columns">{{c.label}}</span></div>',
	},
}))
vi.mock('@/components/ProgressBar.vue', () => ({
	default: { render: () => null },
}))
enableAutoUnmount(afterEach)
afterEach(() => installTranslations('en'))
for (const lang of ['fr', 'en'])
	it.each([0, 40, 100])(
		`describes %s percent progress as a state in ${lang}`,
		(n) => {
			state.progress = n
			const translate = installTranslations(lang)
			vi.stubGlobal('__', translate)
			const w = mount(BatchStudentProgress, {
				props: {
					batch: 'FAKE-BATCH',
					student: 'FAKE-ENROLLMENT',
					modelValue: true,
				},
				global: { mocks: { __: translate } },
			})
			expect(w.text()).toContain(
				`${n}% ${lang === 'fr' ? 'Terminé' : 'Completed'}`
			)
			expect(w.text()).toContain(lang === 'fr' ? 'Évaluation' : 'Assessment')
		}
	)
