import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { installTranslations } from './helpers/frenchCatalog'

const mocks = vi.hoisted(() => ({
	call: vi.fn(),
	success: vi.fn(),
	error: vi.fn(),
	dialog: vi.fn(),
	reload: vi.fn(() => Promise.resolve()),
	canDelete: true,
	save: vi.fn(),
	record: null as any,
	applyFilters: vi.fn(),
}))
vi.mock('frappe-ui', () => ({
	call: mocks.call,
	toast: { success: mocks.success, error: mocks.error },
	createResource: () => ({ data: {}, fetch: vi.fn(() => Promise.resolve()) }),
	Select: {
		name: 'Select',
		props: ['options', 'modelValue'],
		template: '<select />',
	},
	FormControl: { template: '<input />' },
	Checkbox: { template: '<input />' },
	ErrorMessage: {
		name: 'ErrorMessage',
		props: ['message'],
		template: '<div>{{ message }}</div>',
	},
	LoadingIndicator: { template: '<span />' },
}))
vi.mock('@/components/Layouts/settings/desktop/SettingsLayout.vue', () => ({
	default: {
		name: 'SettingsLayout',
		props: ['title'],
		emits: ['save'],
		template: '<section><slot /></section>',
	},
}))
vi.mock('@/router', () => ({ default: { push: vi.fn() } }))
vi.mock('@/utils/dialogs', () => ({ createDialog: mocks.dialog }))
vi.mock('@/utils', () => ({ cleanError: (error: unknown) => error || '' }))
vi.mock('@/composables/usePermissions', () => ({
	usePermissions: () => ({ can: () => mocks.canDelete }),
}))
vi.mock('@/composables/useSettingsListResource', () => ({
	reloadSettingsLists: mocks.reload,
	useSettingsListResource: () => ({
		rows: [],
		search: '',
		loading: false,
		hasNextPage: false,
		applyFilters: mocks.applyFilters,
		reload: mocks.reload,
		loadMore: vi.fn(),
	}),
}))
vi.mock('@/composables/useSettingsRecord', () => ({
	useSettingsRecord: () => mocks.record,
}))
vi.mock('@/components/Controls/Link.vue', () => ({
	default: { template: '<input />' },
}))
vi.mock('@/components/Settings/Transactions/AddressModal.vue', () => ({
	default: { template: '<span />' },
}))

import {
	columns,
	statusOptions,
	statusFilters,
	transactionList,
	DOCTYPE,
	REQUIRED_FIELDS,
} from '@/components/Settings/Transactions/transactions'
import TransactionForm from '@/components/Settings/Transactions/TransactionForm.vue'
import Transactions from '@/components/Settings/Transactions/Transactions.vue'

const row = {
	name: 'FAKE-PAYMENT',
	billing_name: 'Fictional Learner',
	member: 'fictional@example.com',
	payment_for_document_type: 'LMS Batch',
	payment_for_document: 'fictional-session',
	payment_received: 0,
	payment_for_certificate: 0,
	currency: 'EUR',
	amount: 100,
}
const actions = columns.find((c) => c.key === 'actions')!
const badges = columns.find((c) => c.key === 'status')!

beforeEach(() => {
	vi.clearAllMocks()
	mocks.canDelete = true
	mocks.call.mockResolvedValue(null)
	mocks.save.mockResolvedValue(null)
	mocks.record = {
		source: { save: mocks.save },
		doc: ref({ ...row }),
		isNew: ref(true),
		isDirty: ref(true),
		loading: ref(false),
		name: ref(row.name),
		enabled: ref(false),
	}
})

for (const lang of ['fr', 'en'])
	describe(`FR-03B.7 ${lang}`, () => {
		const text = (fr: string, en: string) => (lang === 'fr' ? fr : en)
		const setup = () => installTranslations(lang)
		it('translates filters without changing technical values, criteria, money or badge colours', () => {
			setup()
			expect(statusOptions().map((o) => o.value)).toEqual([
				'All',
				'Paid',
				'Unpaid',
				'Certificate',
				'Course',
			])
			expect(statusOptions().map((o) => o.label)).toEqual(
				lang === 'fr'
					? [
							'Tous les paiements',
							'Reçu',
							'Non reçu',
							'Option certificat',
							'Autres paiements',
					  ]
					: [
							'All Payments',
							'Received',
							'Not received',
							'For Certificate',
							'Other payments',
					  ]
			)
			expect(statusFilters('Paid')).toEqual([['payment_received', '=', 1]])
			expect(statusFilters('Unpaid')).toEqual([['payment_received', '=', 0]])
			expect(statusFilters('Certificate')).toEqual([
				['payment_for_certificate', '=', 1],
			])
			expect(statusFilters('Course')).toEqual([
				['payment_for_certificate', '=', 0],
			])
			expect(statusFilters('All')).toEqual([])
			expect(badges.badges!({ ...row })).toEqual([
				{ label: text('Non reçu', 'Not received'), theme: 'amber' },
			])
			expect(
				badges.badges!({
					...row,
					payment_received: 1,
					payment_for_certificate: 1,
				})
			).toEqual([
				{ label: text('Reçu', 'Received'), theme: 'green' },
				{
					label: text('Option certificat', 'For Certificate'),
					theme: 'blue',
				},
			])
			expect(columns.find((c) => c.key === 'amount')!.value!(row)).toBe('€ 100')
			expect(transactionList.searchFields).toEqual(['billing_name', 'member'])
			expect(actions.ariaLabel!(row)).toBe(
				'Actions for Fictional Learner'.replace(
					'Actions for',
					text('Actions pour', 'Actions for')
				)
			)
		})
		it('keeps the session in the other-payments filter and forwards the unchanged filter', async () => {
			const tr = setup()
			const w = shallowMount(Transactions, {
				props: { label: 'Transactions' },
				global: {
					mocks: { __: tr },
					stubs: {
						SettingsLayout: false,
						ErrorMessage: false,
						SettingsList: {
							template: '<div><slot name="header-bottom" /></div>',
						},
					},
				},
			})
			const select = w.findComponent({ name: 'Select' })
			expect(select.attributes('aria-label')).toBe(
				text('Filtrer par statut du paiement', 'Filter by payment status')
			)
			select.vm.$emit('update:modelValue', 'Course')
			await flushPromises()
			expect(mocks.applyFilters).toHaveBeenCalledWith([
				['payment_for_certificate', '=', 0],
			])
			expect(row.payment_for_document_type).toBe('LMS Batch')
			expect(mocks.call).not.toHaveBeenCalled()
			w.unmount()
		})
		it('shows irreversible deletion text without any write before confirmation', () => {
			setup()
			const option = actions.options!(row).find(
				(o) => o.icon === 'lucide-trash-2'
			)!
			option.onClick!()
			const dialog = mocks.dialog.mock.calls[0][0]
			expect(dialog.title).toBe(
				text('Supprimer cette transaction ?', 'Delete this transaction?')
			)
			expect(dialog.message).toBe(
				text(
					'Cette action supprime définitivement cet enregistrement de paiement, y compris ses détails de facturation. Elle ne peut pas être annulée.',
					'This will permanently delete this payment record, including its billing details. This cannot be undone.'
				)
			)
			expect(dialog.actions[0].label).toBe(text('Supprimer', 'Delete'))
			expect(mocks.call).not.toHaveBeenCalled()
		})
		it('hides deletion for a read-only permission answer', () => {
			setup()
			mocks.canDelete = false
			expect(
				actions.options!(row).some((o) => o.icon === 'lucide-trash-2')
			).toBe(false)
			expect(mocks.call).not.toHaveBeenCalled()
		})
		for (const denied of [false, true])
			it(`handles ${
				denied ? 'refused' : 'successful'
			} deletion entirely in a mock`, async () => {
				setup()
				vi.spyOn(console, 'error').mockImplementation(() => {})
				if (denied) mocks.call.mockRejectedValue({})
				actions.options!(row).find((o) => o.icon === 'lucide-trash-2')!
					.onClick!()
				const close = vi.fn()
				mocks.dialog.mock.calls[0][0].actions[0].onClick({ close })
				await flushPromises()
				expect(mocks.call).toHaveBeenCalledWith('frappe.client.delete', {
					doctype: DOCTYPE,
					name: row.name,
				})
				if (denied) {
					expect(mocks.error).toHaveBeenCalledWith(
						text(
							'Impossible de supprimer la transaction',
							'Unable to delete transaction'
						)
					)
					expect(close).not.toHaveBeenCalled()
				} else {
					expect(mocks.success).toHaveBeenCalledWith(
						text(
							'Transaction supprimée avec succès',
							'Transaction deleted successfully'
						)
					)
					expect(close).toHaveBeenCalled()
				}
				vi.restoreAllMocks()
			})
		for (const mode of ['create', 'update', 'error', 'invalid'])
			it(`renders ${mode} form feedback with an isolated fictitious record`, async () => {
				const tr = setup()
				mocks.record.isNew.value = mode !== 'update'
				Object.assign(
					mocks.record.doc.value,
					Object.fromEntries(
						REQUIRED_FIELDS.map((k) => [k, k === 'amount' ? 100 : 'fictional'])
					)
				)
				if (mode === 'invalid') mocks.record.doc.value.member = ''
				if (mode === 'error') mocks.save.mockRejectedValue({})
				const before = JSON.stringify(mocks.record.doc.value)
				const w = shallowMount(TransactionForm, {
					props: { name: 'FAKE-PAYMENT' },
					global: {
						mocks: { __: tr },
						stubs: {
							SettingsLayout: false,
							ErrorMessage: false,
							SettingsList: {
								template: '<div><slot name="header-bottom" /></div>',
							},
						},
					},
				})
				w.findComponent({ name: 'SettingsLayout' }).vm.$emit('save')
				await flushPromises()
				if (mode === 'invalid') {
					expect(mocks.save).not.toHaveBeenCalled()
					expect(w.text()).toContain('Fill in every required field')
				} else if (mode === 'error') {
					expect(w.text()).toContain(
						text(
							"Erreur lors de l'enregistrement de la transaction",
							'Error saving transaction'
						)
					)
					expect(mocks.error).toHaveBeenCalled()
				} else
					expect(mocks.success).toHaveBeenCalledWith(
						mode === 'create'
							? text(
									'Transaction créée avec succès',
									'Transaction created successfully'
							  )
							: text(
									'Transaction mise à jour avec succès',
									'Transaction updated successfully'
							  )
					)
				expect(JSON.stringify(mocks.record.doc.value)).toBe(before)
				expect(mocks.call).not.toHaveBeenCalled()
				w.unmount()
			})
	})

describe('LMS Payment permission answers without a server', () => {
	it.each([
		['manager', { read: 1, write: 1, delete: 1 }, true, true],
		['reader', { read: 1 }, true, false],
		['denied', {}, false, false],
	] as const)(
		'keeps the native %s answer',
		async (name, seed, read, remove) => {
			const { usePermissions } = await vi.importActual<
				typeof import('@/composables/usePermissions')
			>('@/composables/usePermissions')
			const answer = usePermissions('LMS Payment', 'FAKE-' + name, { seed })
			expect(answer.can('read')).toBe(read)
			expect(answer.can('delete')).toBe(remove)
		}
	)
	it('does not grant permissions when their simulated load fails', async () => {
		const { usePermissions } = await vi.importActual<
			typeof import('@/composables/usePermissions')
		>('@/composables/usePermissions')
		const fetcher = vi
			.fn()
			.mockRejectedValue(new Error('Fictional permission load failed'))
		const answer = usePermissions('LMS Payment', 'FAKE-error', { fetcher })
		await flushPromises()
		expect(answer.can('read')).toBe(false)
		expect(answer.can('delete')).toBe(false)
		expect(fetcher).toHaveBeenCalledWith('LMS Payment', ['FAKE-error'])
	})
})
