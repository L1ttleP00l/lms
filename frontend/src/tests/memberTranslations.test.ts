/** FR-03B.1 list/role/deletion presentation, no account writes. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { installTranslations } from './helpers/frenchCatalog'
const state = vi.hoisted(() => ({
	dialog: vi.fn(),
	call: vi.fn(),
	reload: vi.fn(),
}))
let source: any
vi.mock('frappe-ui', () => ({
	call: state.call,
	toast: { error: vi.fn(), success: vi.fn() },
	Select: {
		props: ['modelValue', 'options'],
		emits: ['update:modelValue'],
		template:
			'<select @change="$emit(\'update:modelValue\',$event.target.value)"><option v-for="o in options" :value="o.value">{{o.label}}</option></select>',
	},
}))
vi.mock('@/utils', () => ({ cleanError: (s: string) => s }))
vi.mock('@/utils/dialogs', () => ({ createDialog: state.dialog }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/components/Settings/Members/MemberForm.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/Layouts/settings/desktop/SettingsList.vue', () => ({
	default: {
		props: ['title', 'columns', 'rows', 'emptyTitle', 'emptyDescription'],
		template:
			'<main>{{title}}<p>{{emptyTitle}}</p><p>{{emptyDescription}}</p><slot name="header-bottom" /></main>',
	},
}))
vi.mock('@/composables/useSettingsListResource', () => ({
	useSettingsMethodResource: () => source,
}))
import Members from '@/components/Settings/Members/Members.vue'
import {
	ROLE_ROWS,
	roleOptions,
	memberColumns,
	rolesFrom,
	confirmMemberDeletion,
	memberError,
} from '@/components/Settings/Members/members'
beforeEach(() => {
	vi.clearAllMocks()
	source = reactive({
		rows: [],
		search: '',
		loading: false,
		hasNextPage: false,
		reload: state.reload,
		loadMore: vi.fn(),
	})
})
describe('member translations FR/EN', () => {
	for (const lang of ['fr', 'en']) {
		it(`keeps all technical roles, columns and names in ${lang}`, () => {
			installTranslations(lang)
			expect(ROLE_ROWS.map((r) => r.role)).toEqual([
				'LMS Student',
				'Course Creator',
				'Batch Evaluator',
				'Moderator',
			])
			expect(roleOptions().map((r) => r.value)).toEqual([
				'All',
				'LMS Student',
				'Course Creator',
				'Moderator',
				'Batch Evaluator',
			])
			expect(roleOptions().map((r) => r.label)).toEqual(
				lang === 'fr'
					? ['Tous', 'Apprenant', 'Formateur', 'Modérateur', 'Évaluateur']
					: ['All', 'Student', 'Instructor', 'Moderator', 'Evaluator']
			)
			const columns = memberColumns({ profile: vi.fn(), remove: vi.fn() })
			const row = {
				name: 'fr03-test@example.com',
				full_name: 'Fictional Member',
				roles: ROLE_ROWS.map((r) => r.role),
			}
			expect(columns[2].ariaLabel!(row)).toBe(
				lang === 'fr'
					? 'Actions pour Fictional Member'
					: 'Actions for Fictional Member'
			)
			expect(rolesFrom(row.roles)).toEqual({
				lms_student: true,
				course_creator: true,
				batch_evaluator: true,
				moderator: true,
			})
			for (const item of ROLE_ROWS) expect(item.description()).toBeTruthy()
		})
		it(`filters by technical role and renders complete empty sentences in ${lang}`, async () => {
			const tr = installTranslations(lang)
			const view = mount(Members, {
				props: { label: 'Users' },
				global: { mocks: { __: tr } },
			})
			expect(view.text()).toContain(
				lang === 'fr' ? 'Aucun membre trouvé' : 'No members found'
			)
			expect(view.text()).toContain(
				lang === 'fr'
					? 'Ajoutez un membre pour commencer.'
					: 'Add a member to get started.'
			)
			await view.get('select').setValue('Moderator')
			await flushPromises()
			expect(state.reload).toHaveBeenCalled()
			expect(view.text()).toContain(
				lang === 'fr'
					? 'Aucun membre ne correspond à ce filtre de rôle.'
					: 'No members match this role filter.'
			)
			source.search = 'FICTIONAL'
			await flushPromises()
			expect(view.text()).toContain(
				lang === 'fr'
					? 'Aucun membre ne correspond à « FICTIONAL ».'
					: 'No members match FICTIONAL.'
			)
			expect(state.call).not.toHaveBeenCalled()
		})
		it(`keeps irreversible deletion behind the unchanged confirmation in ${lang}`, () => {
			installTranslations(lang)
			confirmMemberDeletion(
				{ name: 'fr03-test@example.com', full_name: 'Fictional Member' },
				vi.fn()
			)
			const dialog = state.dialog.mock.calls[0][0]
			expect(dialog.message).toBe(
				lang === 'fr'
					? 'Cette action supprime définitivement le compte utilisateur et ne peut pas être annulée.'
					: 'This permanently deletes the user account and cannot be undone.'
			)
			expect(dialog.actions[0].label).toBe(
				lang === 'fr' ? 'Supprimer' : 'Delete'
			)
			expect(memberError({ messages: ['SIMULATED REFUSAL'] }, 'fallback')).toBe(
				'SIMULATED REFUSAL'
			)
			expect(state.call).not.toHaveBeenCalled() // Never invoke the destructive action.
		})
	}
})
