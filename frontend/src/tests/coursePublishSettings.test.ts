import { installTranslations } from './helpers/frenchCatalog'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CoursePublishSettings from '@/pages/Courses/CoursePublishSettings.vue'

vi.hoisted(() => {
	// @/utils pulls in plyr, which touches matchMedia at import time.
	window.matchMedia ??= (() => ({
		matches: false,
		addEventListener: () => {},
		removeEventListener: () => {},
	})) as unknown as typeof window.matchMedia
})

const payments = vi.hoisted(() => ({ installed: 1 }))
vi.mock('@/stores/settings', () => ({
	useSettings: () => ({
		settings: { data: { is_payments_app_installed: payments.installed } },
	}),
}))

vi.mock('frappe-ui', () => ({
	Dialog: { name: 'Dialog', template: '<div><slot /></div>' },
	FormControl: { name: 'FormControl', template: '<div />' },
	createResource: () => ({ data: null, reload: vi.fn(), submit: vi.fn() }),
}))

// NewMemberModal.vue -> RoleSwitches.vue pulls in members.ts -> Members.vue ->
// MemberForm.vue, which imports `@framework/ui/telemetry` and
// `@framework/ui/components/Onboarding`. Both must resolve even though nothing
// here renders MemberForm.vue.
vi.mock('@framework/ui/telemetry/index', () => ({}))
vi.mock('@framework/ui/components/Onboarding/index', () => ({}))

vi.stubGlobal('__', (s: string) => s)

const doc = {
	name: 'COURSE-1',
	upcoming: 0,
	featured: 0,
	disable_self_learning: 0,
	enforce_lesson_completion: 0,
}

describe('CoursePublishSettings', () => {
	it('marks the form dirty when the switch is flipped', async () => {
		const markDirty = vi.fn()
		const wrapper = mount(CoursePublishSettings, {
			global: {
				mocks: { __: (s: string) => s },
				provide: {
					courseForm: { resource: { doc: { ...doc } }, markDirty },
					$dayjs: (v: unknown) => ({ format: () => String(v) }),
				},
				stubs: {
					CollapsibleSection: { template: '<div><slot /></div>' },
					Link: true,
					NewMemberModal: true,
					BooleanSwitch: {
						props: ['modelValue', 'label'],
						emits: ['update:modelValue'],
						template: `<button
							:data-label="label"
							@click="$emit('update:modelValue', !modelValue)"
						/>`,
					},
				},
			},
		})

		await wrapper
			.find('[data-label="Enforce Lesson Completion"]')
			.trigger('click')
		expect(markDirty).toHaveBeenCalled()
	})
})

// Regression: currency picker 403 for Moderator and Course Creator, LMS roles
// cannot read Currency (#3023, fixed in #3038).
describe('CoursePublishSettings currency picker', () => {
	it.each([{ paid_course: 1 }, { paid_certificate: 1 }])(
		'searches through the LMS query (%o)',
		(pricing) => {
			const wrapper = mount(CoursePublishSettings, {
				global: {
					mocks: { __: (s: string) => s },
					provide: {
						courseForm: {
							resource: { doc: { ...doc, ...pricing } },
							markDirty: vi.fn(),
						},
						$dayjs: (v: unknown) => ({ format: () => String(v) }),
					},
					stubs: {
						CollapsibleSection: { template: '<div><slot /></div>' },
						Link: true,
						NewMemberModal: true,
						BooleanSwitch: true,
					},
				},
			})

			const picker = wrapper
				.findAllComponents({ name: 'Link' })
				.find((link) => link.props('doctype') === 'Currency')
			expect(picker?.props('query')).toBe('lms.lms.api.search_currencies')
		}
	)
})

describe('FR-03B.4 course settings translations', () => {
	afterEach(() => {
		installTranslations('en')
		payments.installed = 1
	})
	for (const lang of ['fr', 'en'])
		for (const kind of ['free', 'course', 'certificate'])
			it(`renders ${kind} settings and keeps field contracts in ${lang}`, async () => {
				const translate = installTranslations(lang),
					markDirty = vi.fn()
				const document = {
					...doc,
					paid_course: kind === 'course' ? 1 : 0,
					paid_certificate: kind === 'certificate' ? 1 : 0,
					enable_certification: 0,
					currency: 'EUR',
					course_price: 100,
					evaluator: 'FAKE-EVAL',
				}
				const w = mount(CoursePublishSettings, {
					global: {
						mocks: { __: translate },
						provide: {
							courseForm: { resource: { doc: document }, markDirty },
							$dayjs: () => ({ format: () => '' }),
						},
						stubs: {
							CollapsibleSection: {
								props: ['label'],
								template: '<section><h2>{{ label }}</h2><slot /></section>',
							},
							BooleanSwitch: {
								props: ['modelValue', 'label', 'description'],
								emits: ['update:modelValue'],
								template: `<label>{{label}}<span>{{description}}</span><button :aria-label="label" :aria-pressed="Boolean(modelValue)" @click="$emit('update:modelValue',!modelValue)" /></label>`,
							},
							Link: {
								props: ['label', 'doctype', 'query', 'filters', 'required'],
								template:
									'<input :aria-label="label" :data-doctype="doctype" :data-query="query" :data-filters="JSON.stringify(filters)" />',
							},
							FormControl: {
								props: ['label', 'required'],
								template: '<input :aria-label="label" />',
							},
							NewMemberModal: true,
						},
					},
				})
				expect(w.text()).toContain(lang === 'fr' ? 'Visibilité' : 'Visibility')
				expect(w.text()).toContain(
					lang === 'fr'
						? 'Tarification et certificats'
						: 'Pricing and certification'
				)
				expect(w.text()).toContain(
					lang === 'fr'
						? "Imposer l'achèvement des leçons"
						: 'Enforce Lesson Completion'
				)
				const toggle = (key: string) =>
					w.get(`button[aria-label="${translate(key)}"]`)
				await toggle('Self enrollment').trigger('click')
				expect(document.disable_self_learning).toBe(1)
				expect(markDirty).toHaveBeenCalled()
				if (kind !== 'free') {
					const currency = w.get('input[data-doctype="Currency"]')
					expect(currency.attributes('data-query')).toBe(
						'lms.lms.api.search_currencies'
					)
					expect(currency.attributes('data-filters')).toBe('{"enabled":1}')
				}
				expect(w.text()).toContain(
					lang === 'fr'
						? 'Certificat de fin de cours'
						: 'Completion certificate'
				)
				expect(
					w
						.find(`button[aria-label="${translate('Paid certificate')}"]`)
						.exists()
				).toBe(kind !== 'course')
				if (kind === 'certificate')
					expect(
						w
							.get(`input[aria-label="${translate('Certificate price')}"]`)
							.exists()
					).toBe(true)
				if (kind === 'free') {
					await toggle('Paid course').trigger('click')
					expect(document.paid_course).toBe(1)
					expect(document.paid_certificate).toBe(0)
				}
			})
	for (const lang of ['fr', 'en'])
		it(`explains missing Payments without opening an external link in ${lang}`, async () => {
			payments.installed = 0
			const translate = installTranslations(lang),
				markDirty = vi.fn(),
				document = { ...doc, paid_course: 0, paid_certificate: 0 }
			const w = mount(CoursePublishSettings, {
				global: {
					mocks: { __: translate },
					provide: {
						courseForm: { resource: { doc: document }, markDirty },
						$dayjs: () => ({ format: () => '' }),
					},
					stubs: {
						CollapsibleSection: { template: '<div><slot /></div>' },
						BooleanSwitch: {
							props: ['modelValue', 'label'],
							emits: ['update:modelValue'],
							template: `<button :aria-label="label" @click="$emit('update:modelValue',true)" />`,
						},
						Dialog: {
							props: ['open', 'title', 'actions'],
							template:
								'<div v-if="open" role="dialog"><h2>{{title}}</h2><slot /><button v-for="a in actions">{{a.label}}</button></div>',
						},
						Link: true,
						NewMemberModal: true,
					},
				},
			})
			await w
				.get(`button[aria-label="${translate('Paid course')}"]`)
				.trigger('click')
			expect(document.paid_course).toBe(0)
			expect(markDirty).not.toHaveBeenCalled()
			expect(w.get('[role="dialog"]').text()).toContain(
				lang === 'fr' ? 'Application Payments requise' : 'Payments app required'
			)
			expect(w.text()).toContain(
				lang === 'fr'
					? "Obtenir l'application Payments"
					: 'Get the Payments app'
			)
		})
})
