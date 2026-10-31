import { installTranslations } from './helpers/frenchCatalog'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'

vi.stubGlobal('__', (text: string) => text)
enableAutoUnmount(afterEach)

const { stub } = vi.hoisted(() => ({
	stub: { inheritAttrs: false, render: () => null },
}))

const controls = vi.hoisted(() => ({
	current: null as any,
	submit: vi.fn(),
	dialog: vi.fn(),
}))
vi.mock('frappe-ui', async () => {
	const { reactive } = await import('vue')
	return {
		createDocumentResource: () => {
			controls.current = reactive({
				doc: {
					name: 'B1',
					title: 'Fictional Batch',
					instructors: [{ instructor: 'fake@example.com' }],
					start_date: '2026-11-01',
					end_date: '2026-11-30',
					start_time: '10:00',
					end_time: '11:00',
					timezone: 'Europe/Paris',
					description: 'Fictional description',
					batch_details: '<p>Fictional details</p>',
					paid_batch: 0,
					amount: 100,
					currency: 'EUR',
					medium: 'Offline',
				},
				setValue: { submit: controls.submit },
				reload: vi.fn(),
			})
			return controls.current
		},
		createResource: () => ({ data: null, reload: vi.fn(), submit: vi.fn() }),
		toast: { success: vi.fn(), error: vi.fn() },
		call: vi.fn(),
		Combobox: stub,
		FormControl: {
			inheritAttrs: false,
			props: ['label', 'modelValue'],
			template:
				'<label>{{label}}<input :aria-label="label" :value="modelValue" /></label>',
		},
	}
})
vi.mock('frappe-ui/experimental', () => ({
	InputLabel: stub,
	useInputLabeling: () => ({ inputId: 'id', labelId: 'label' }),
}))

// Only the instructors picker is under test; it reports what it was given.
vi.mock('@/components/Controls/MultiLink.vue', () => ({
	default: defineComponent({
		props: ['label', 'disabled'],
		render() {
			return h('div', {
				'data-testid': `multilink-${this.label}`,
				'data-disabled': String(Boolean(this.disabled)),
			})
		},
	}),
}))
for (const path of [
	'@/components/Controls/BooleanSwitch.vue',
	'@/components/Controls/Uploader.vue',
	'@/components/Controls/VideoPreviewField.vue',
	'@/components/Controls/Link.vue',
	'@/components/RichTextEditor.vue',
	'@/components/Modals/NewMemberModal.vue',
	'@/pages/Batches/components/BatchCourses.vue',
	'@/pages/Batches/components/Assessments.vue',
]) {
	vi.doMock(path, () => ({ default: stub }))
}
vi.mock('@/utils', () => ({
	createLMSCategory: vi.fn(),
	getMetaInfo: vi.fn(),
	openSettings: vi.fn(),
	updateMetaInfo: vi.fn(),
}))
vi.mock('@/components/Controls/Select.vue', () => ({
	default: {
		props: ['label', 'options', 'modelValue'],
		template:
			'<label>{{label}}<select :aria-label="label"><option v-for="o in options" :value="o.value">{{o.label}}</option></select></label>',
	},
}))
vi.mock('@/utils/format', () => ({ getDateFormat: () => 'YYYY-MM-DD' }))
vi.mock('@/utils/resource', () => ({ reportAutosaveError: vi.fn() }))
vi.mock('@/composables/useKeyboardShortcuts', () => ({
	useKeyboardShortcuts: vi.fn(),
	saveShortcut: vi.fn(),
}))
vi.mock('@/composables/useBatchForms', () => ({ openBatchForm: vi.fn() }))

const mountForm = async (
	batchData: Record<string, unknown>,
	lang = 'en',
	all = false
) => {
	const translate = installTranslations(lang)
	vi.stubGlobal('__', translate)
	const { default: BatchForm } = await import('@/pages/Batches/BatchForm.vue')
	const router = createRouter({
		history: createMemoryHistory(),
		routes: [{ path: '/', component: { render: () => null } }],
	})
	const wrapper = mount(BatchForm, {
		props: { batch: { data: { name: 'B1', ...batchData }, reload: vi.fn() } },
		global: {
			plugins: [
				router,
				(app: any) => {
					app.config.globalProperties.$dialog = controls.dialog
				},
			],
			provide: { $user: { data: { name: 'ash@example.com' } } },
			mocks: { __: translate },
		},
	})
	await flushPromises()
	return all
		? wrapper
		: wrapper.find(`[data-testid="multilink-${translate('Instructors')}"]`)
}

describe('the batch form instructors picker', () => {
	it('is read-only for an evaluator who is not an instructor', async () => {
		const picker = await mountForm({ can_manage: true })
		expect(picker.attributes('data-disabled')).toBe('true')
	})

	it('is editable for an instructor or Moderator', async () => {
		const picker = await mountForm({
			can_manage: true,
			can_change_instructors: true,
		})
		expect(picker.attributes('data-disabled')).toBe('false')
	})
})

describe('FR-03B.5 session form translations', () => {
	afterEach(() => {
		vi.useRealTimers()
		installTranslations('en')
	})
	for (const lang of ['fr', 'en']) {
		it(`labels the session form, preserves Online/Offline and restores local guards in ${lang}`, async () => {
			const w = await mountForm(
				{ can_manage: true, can_change_instructors: true },
				lang,
				true
			)
			for (const key of [
				'Batch Start Date',
				'Batch End Date',
				'Session Start Time',
				'Session End Time',
				'Seat Count',
			])
				expect(w.text()).toContain(installTranslations(lang)(key))
			const select = w.get('select')
			expect(
				select.findAll('option').map((o) => o.attributes('value'))
			).toEqual(['Online', 'Offline'])
			expect(select.text()).toContain(lang === 'fr' ? 'Hors ligne' : 'Offline')
			expect(
				w
					.get(
						`[data-testid="multilink-${
							lang === 'fr' ? 'Formateurs' : 'Instructors'
						}"]`
					)
					.attributes('data-disabled')
			).toBe('false')
			controls.dialog.mockReset()
			;(w.vm as any).deleteBatch()
			const d = controls.dialog.mock.calls[0][0]
			expect(d.title).toBe(
				lang === 'fr'
					? 'Confirmer la suppression'
					: 'Confirm your action to delete'
			)
			expect(d.message).toContain(
				lang === 'fr'
					? 'les inscriptions, les liens avec les cours'
					: 'enrolled students, linked courses'
			)
			expect(d.actions[0].label).toBe(lang === 'fr' ? 'Supprimer' : 'Delete')
			// The destructive callback is never invoked.
		})
		it(`captures deferred autosave without a network in ${lang}`, async () => {
			const w = await mountForm(
				{ can_manage: true, can_change_instructors: true },
				lang,
				true
			)
			controls.current.doc = JSON.parse(JSON.stringify(controls.current.doc))
			await flushPromises()
			vi.useFakeTimers()
			controls.submit.mockReset()
			controls.current.doc.title = 'Fictional changed'
			await flushPromises()
			expect(controls.submit).not.toHaveBeenCalled()
			await vi.advanceTimersByTimeAsync(1000)
			expect(controls.submit).toHaveBeenCalledTimes(1)
			const [params] = controls.submit.mock.calls[0]
			expect(params).toMatchObject({
				name: 'B1',
				title: 'Fictional changed',
				medium: 'Offline',
				start_time: '10:00',
				instructors: [{ instructor: 'fake@example.com' }],
			})
			w.unmount()
		})
	}
})
