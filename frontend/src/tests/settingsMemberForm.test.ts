import { installTranslations } from './helpers/frenchCatalog'
/**
 * Settings > Users > member form: adding and editing a member goes through the
 * members API (add_member, update_member), never a direct write on User, which
 * moderators do not have.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'

vi.stubGlobal('__', (text: string) => text)
enableAutoUnmount(afterEach)

const { callMock, toastMock, record } = vi.hoisted(() => ({
	callMock: vi.fn(),
	toastMock: { success: vi.fn(), error: vi.fn() },
	record: {
		doc: null as Record<string, unknown> | null,
		save: vi.fn(),
		reload: vi.fn(),
	},
}))

vi.mock('frappe-ui', () => ({
	call: callMock,
	toast: toastMock,
	createResource: () => ({ fetch: vi.fn() }),
	LoadingIndicator: { template: '<span />' },
	FormControl: {
		props: ['modelValue', 'label', 'disabled'],
		emits: ['update:modelValue'],
		template: `<input :data-testid="'field-' + label" :value="modelValue" :disabled="disabled" @input="$emit('update:modelValue', $event.target.value)" />`,
	},
}))

vi.mock('@/components/Layouts/settings/desktop/SettingsLayout.vue', () => ({
	default: {
		emits: ['save', 'back'],
		template: `<div><slot /><button data-testid="save" @click="$emit('save')" /></div>`,
	},
}))
vi.mock('@/components/Controls/RoleSwitches.vue', () => ({
	default: {
		emits: ['toggle'],
		template: `<button data-testid="role-student" @click="$emit('toggle', 'student', true)" />`,
	},
}))
vi.mock('@/components/Settings/Members/members', () => ({
	MEMBERS_DOCTYPE: 'User',
	ROLE_ROWS: [{ key: 'student', role: 'LMS Student' }],
	memberError: (_error: unknown, fallback: string) => fallback,
	noRoles: () => ({ student: false }),
	rolesFrom: () => ({}),
}))
vi.mock('@/composables/useSettingsRecord', () => ({
	useSettingsRecord: () => {
		const source = reactive({
			isDirty: true,
			save: record.save,
			reload: record.reload,
		})
		const doc = ref(record.doc)
		return {
			source,
			doc: computed(() => doc.value),
			isDirty: computed(() => true),
		}
	},
}))
vi.mock('@framework/ui/components/Onboarding/index', () => ({
	useOnboarding: () => ({ updateOnboardingStep: vi.fn() }),
}))
vi.mock('@framework/ui/telemetry/index', () => ({
	useTelemetry: () => ({ capture: vi.fn() }),
}))
vi.mock('@/stores/members', () => ({ notifyMembersChanged: vi.fn() }))
vi.mock('@/utils', () => ({ sanitizeHTML: (html: string) => html }))

import MemberForm from '@/components/Settings/Members/MemberForm.vue'

const mountForm = (name: string, lang = 'en', moderator = true) => {
	const translate = installTranslations(lang)
	return mount(MemberForm, {
		props: { name },
		global: {
			mocks: { __: translate },
			provide: { $user: { data: { is_moderator: moderator } } },
		},
	})
}

beforeEach(() => {
	callMock.mockReset()
	record.save.mockReset()
	record.reload.mockReset()
})

describe('Settings member form', () => {
	it('adds a member and its profile in one add_member call', async () => {
		record.doc = reactive({
			email: ' ada@example.com ',
			first_name: 'Ada',
			last_name: 'Lovelace',
			phone: '123',
		})
		callMock.mockResolvedValueOnce({ name: 'ada@example.com' })
		const w = mountForm('new')
		await w.get('[data-testid="save"]').trigger('click')
		await flushPromises()

		expect(callMock).toHaveBeenCalledTimes(1)
		expect(callMock).toHaveBeenCalledWith('lms.lms.api.add_member', {
			email: 'ada@example.com',
			first_name: 'Ada',
			last_name: 'Lovelace',
			profile: {
				first_name: 'Ada',
				last_name: 'Lovelace',
				username: null,
				phone: '123',
				mobile_no: null,
				location: null,
				bio: null,
			},
		})
		expect(record.save).not.toHaveBeenCalled()
		expect(toastMock.success).toHaveBeenCalled()
	})

	it('finishes the added member on a retry instead of adding it again', async () => {
		record.doc = reactive({ email: 'ada@example.com', first_name: 'Ada' })
		callMock
			.mockResolvedValueOnce({ name: 'ada@example.com' }) // add_member
			.mockRejectedValueOnce(new Error('role refused')) // save_role
			.mockResolvedValue({ name: 'ada@example.com' })
		const w = mountForm('new')
		await w.get('[data-testid="role-student"]').trigger('click')
		await w.get('[data-testid="save"]').trigger('click')
		await flushPromises()
		expect(record.doc.email).toBe('ada@example.com')
		// The account exists now, so its address can no longer change.
		expect(
			w.get('[data-testid="field-Email"]').attributes('disabled')
		).toBeDefined()

		await w.get('[data-testid="save"]').trigger('click')
		await flushPromises()

		const methods = callMock.mock.calls.map(([method]) => method)
		expect(methods).toEqual([
			'lms.lms.api.add_member',
			'lms.lms.api.save_role',
			'lms.lms.api.update_member',
			'lms.lms.api.save_role',
		])
		expect(callMock).toHaveBeenNthCalledWith(
			3,
			'lms.lms.api.update_member',
			expect.objectContaining({ member: 'ada@example.com' })
		)
		expect(w.emitted('back')).toHaveLength(1)
	})

	it('unlocks the email again once the form moves to another record', async () => {
		record.doc = reactive({ email: 'ada@example.com', first_name: 'Ada' })
		callMock
			.mockResolvedValueOnce({ name: 'ada@example.com' }) // add_member
			.mockRejectedValueOnce(new Error('role refused')) // save_role
		const w = mountForm('new')
		await w.get('[data-testid="role-student"]').trigger('click')
		await w.get('[data-testid="save"]').trigger('click')
		await flushPromises()
		expect(
			w.get('[data-testid="field-Email"]').attributes('disabled')
		).toBeDefined()

		await w.setProps({ name: 'bob@example.com' })
		await w.setProps({ name: 'new' })
		expect(
			w.get('[data-testid="field-Email"]').attributes('disabled')
		).toBeUndefined()
	})

	it('saves an edited member through update_member and reloads it', async () => {
		record.doc = reactive({
			name: 'ada@example.com',
			email: 'ada@example.com',
			first_name: 'Ada',
			last_name: 'King',
		})
		callMock.mockResolvedValue({ name: 'ada@example.com' })
		const w = mountForm('ada@example.com')
		await w.get('[data-testid="save"]').trigger('click')
		await flushPromises()

		expect(callMock).toHaveBeenCalledWith(
			'lms.lms.api.update_member',
			expect.objectContaining({
				member: 'ada@example.com',
				profile: expect.objectContaining({ last_name: 'King' }),
			})
		)
		expect(callMock).not.toHaveBeenCalledWith(
			'lms.lms.api.add_member',
			expect.anything()
		)
		expect(record.save).not.toHaveBeenCalled()
		expect(record.reload).toHaveBeenCalled()
	})

	it('closes an edited member only once the reload has finished', async () => {
		record.doc = reactive({ name: 'ada@example.com', first_name: 'Ada' })
		let finishReload = () => {}
		record.reload.mockReturnValue(
			new Promise<void>((resolve) => (finishReload = resolve))
		)
		callMock.mockResolvedValue({ name: 'ada@example.com' })
		const w = mountForm('ada@example.com')
		await w.get('[data-testid="save"]').trigger('click')
		await flushPromises()

		expect(w.emitted('back')).toBeUndefined()
		finishReload()
		await flushPromises()
		expect(w.emitted('back')).toHaveLength(1)
	})
})

describe('FR-03B.1 settings member messages', () => {
	for (const lang of ['fr', 'en']) {
		const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en)
		it(`refuses read-only mode before any write in ${lang}`, async () => {
			const previous = (window as any).read_only_mode
			try {
				;(window as any).read_only_mode = true
				record.doc = reactive({
					email: 'fr03-test@example.com',
					first_name: 'Fictional',
				})
				const view = mountForm('new', lang)
				expect(view.text()).toContain(
					tr('Ce site est en lecture seule.', 'This site is in read-only mode.')
				)
				expect(callMock).not.toHaveBeenCalled()
			} finally {
				;(window as any).read_only_mode = previous
			}
		})

		it(`creates and edits entirely in memory in ${lang}`, async () => {
			record.doc = reactive({
				email: 'fr03-test@example.com',
				first_name: 'Fictional',
			})
			callMock.mockResolvedValue({ name: 'fr03-test@example.com' })
			const added = mountForm('new', lang)
			await added.get('[data-testid="save"]').trigger('click')
			await flushPromises()
			expect(toastMock.success).toHaveBeenLastCalledWith(
				tr('Membre ajouté avec succès', 'Member added successfully')
			)
			record.doc = reactive({
				name: 'fr03-test@example.com',
				first_name: 'Fictional',
			})
			const edited = mountForm('fr03-test@example.com', lang)
			await edited.get('[data-testid="save"]').trigger('click')
			await flushPromises()
			expect(toastMock.success).toHaveBeenLastCalledWith(
				tr('Membre mis à jour', 'Member updated')
			)
			expect(callMock.mock.calls.map((c) => c[0])).toEqual([
				'lms.lms.api.add_member',
				'lms.lms.api.update_member',
			])
		})
		it(`validates, refuses and reports a simulated failure in ${lang}`, async () => {
			record.doc = reactive({ email: '', first_name: '' })
			const blank = mountForm('new', lang)
			await blank.get('[data-testid="save"]').trigger('click')
			await flushPromises()
			expect(callMock).not.toHaveBeenCalled()
			record.doc = reactive({
				email: 'fr03-test@example.com',
				first_name: 'Fictional',
			})
			const refused = mountForm('new', lang, false)
			expect(refused.text()).toContain(
				tr(
					'Vous n’êtes pas autorisé à gérer les membres.',
					'You are not permitted to manage members.'
				)
			)
			callMock.mockRejectedValue({})
			const failed = mountForm('new', lang)
			await failed.get('[data-testid="save"]').trigger('click')
			await flushPromises()
			expect(toastMock.error).toHaveBeenLastCalledWith(
				tr('Impossible d’ajouter le membre', 'Unable to add member')
			)
		})
	}
})
