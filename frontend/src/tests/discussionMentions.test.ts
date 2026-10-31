/**
 * The @ menu in a discussion lists the people of that lesson or batch, asked
 * for by context, and stores the username as the mention id. The list shows
 * the username next to the name so two people of one name can be told apart.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { installTranslations } from './helpers/frenchCatalog'
import { flushPromises, mount } from '@vue/test-utils'

const { allUsers, replyRows } = vi.hoisted(() => ({
	allUsers: { reload: vi.fn() },
	replyRows: { value: [] as any[] },
}))

vi.mock('frappe-ui', () => ({
	call: vi.fn(),
	createResource: () => ({
		get data() {
			return replyRows.value
		},
		reload: vi.fn(),
	}),
	Button: {
		props: ['label'],
		template: '<button :aria-label="label"><slot /></button>',
	},
	Dropdown: { props: ['options'], template: '<div><slot /></div>' },
	toast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('@/components/UserAvatar.vue', () => ({
	default: { template: '<div />' },
}))
vi.mock('@/components/RichTextEditor.vue', () => ({
	default: {
		props: ['mentions', 'content'],
		template: '<div data-testid="editor" />',
	},
}))
vi.mock('@/utils', () => ({ timeAgo: () => 'now' }))
vi.mock('@framework/ui/telemetry/index', () => ({
	useTelemetry: () => ({ capture: vi.fn() }),
}))

vi.stubGlobal('__', (s: string) => s)
// @ts-expect-error augmenting String for the test runtime
String.prototype.format = function (...args: unknown[]) {
	return this.replace(/\{(\d+)\}/g, (_: string, i: number) => String(args[i]))
}

const mountReplies = async (lang?: string) =>
	mount((await import('@/components/DiscussionReplies.vue')).default, {
		props: {
			topic: { name: 'T1', title: 'A question' },
			doctype: 'LMS Batch',
			docname: 'batch-1',
		},
		global: {
			provide: {
				$socket: { on: vi.fn(), off: vi.fn() },
				$user: { data: { name: 'mod', is_student: false, is_moderator: true } },
				$allUsers: allUsers,
			},
			mocks: { __: lang ? installTranslations(lang) : (s: string) => s },
		},
	})

describe('discussion mentions', () => {
	beforeEach(() => {
		allUsers.reload.mockReset()
	})

	it('asks for the people of the lesson or batch', async () => {
		await mountReplies()
		expect(allUsers.reload.mock.calls[0][0]).toEqual({
			doctype: 'LMS Batch',
			docname: 'batch-1',
		})
	})

	it('stores the username and shows it next to the name', async () => {
		const wrapper = await mountReplies()
		const { onSuccess } = allUsers.reload.mock.calls[0][1]
		onSuccess({
			jane_doe: {
				username: 'jane_doe',
				full_name: 'Jane Doe',
				user_image: null,
			},
			jane_d: { username: 'jane_d', full_name: 'Jane Doe', user_image: null },
		})
		await flushPromises()
		const RichTextEditor = (await import('@/components/RichTextEditor.vue'))
			.default
		const mentions = wrapper
			.findComponent(RichTextEditor as any)
			.props('mentions')
		expect(mentions).toEqual([
			{ value: 'jane_doe', label: 'Jane Doe' },
			{ value: 'jane_d', label: 'Jane Doe' },
		])
		expect(JSON.stringify(mentions)).not.toContain('@example.com')
	})

	it('does not ask for a list as a student', async () => {
		mount((await import('@/components/DiscussionReplies.vue')).default, {
			props: { topic: { name: 'T1' }, doctype: 'Course Lesson', docname: 'L1' },
			global: {
				provide: {
					$socket: { on: vi.fn(), off: vi.fn() },
					$user: { data: { name: 'stu', is_student: true } },
					$allUsers: allUsers,
				},
				mocks: { __: (s: string) => s },
			},
		})
		expect(allUsers.reload).not.toHaveBeenCalled()
	})
})

for (const lang of ['fr', 'en'])
	for (const mode of ['owner', 'other', 'readonly'])
		it(`FR-03B.9 reply actions ${lang} ${mode} do not grant a moderator a new UI action`, async () => {
			const { call, toast } = await import('frappe-ui')
			vi.mocked(call).mockClear()
			replyRows.value = [
				{
					name: 'FAKE-REPLY',
					owner: mode === 'other' ? 'other' : 'mod',
					reply: 'Fictional response',
					creation: '2026-10-31',
					user: { full_name: 'Fictional Author' },
				},
			]
			window.read_only_mode = mode === 'readonly'
			try {
				const w = await mountReplies(lang)
				await flushPromises()
				expect(
					w
						.find(
							'button[aria-label="' +
								(lang === 'fr' ? 'Actions de la réponse' : 'Reply actions') +
								'"]'
						)
						.exists()
				).toBe(mode === 'owner')
				if (mode !== 'readonly') {
					const post = w
						.findAll('button')
						.find((b) => b.text() === installTranslations(lang)('Post'))!
					await post.trigger('click')
					expect(toast.error).toHaveBeenCalledWith(
						lang === 'fr'
							? 'La réponse ne peut pas être vide.'
							: 'Reply cannot be empty.'
					)
				}
				expect(call).not.toHaveBeenCalled()
				w.unmount()
			} finally {
				window.read_only_mode = undefined
				replyRows.value = []
			}
		})
