import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { createResource } from 'frappe-ui'
import translationPlugin from '@/translation.js'

vi.mock('frappe-ui', () => ({ createResource: vi.fn() }))

const browser = window as Window & {
	translatedMessages?: Record<string, string>
	__?: (message: string, replace?: unknown[]) => any
}
let previousMessages: typeof browser.translatedMessages
let previousTranslate: typeof browser.__

beforeEach(() => {
	previousMessages = browser.translatedMessages
	previousTranslate = browser.__
	delete browser.translatedMessages
	vi.mocked(createResource).mockClear()
})

afterEach(() => {
	browser.translatedMessages = previousMessages
	browser.__ = previousTranslate
})

describe('__', () => {
	it('fills values passed the Desk way, as Frappe UI components do', () => {
		browser.translatedMessages = { 'Row {0}': 'Zeile {0}' }
		translationPlugin({ config: { globalProperties: {} } } as any)
		const __ = browser.__!

		expect(__('All ({0})', [3])).toBe('All (3)')
		expect(__('Row {0}', [7])).toBe('Zeile 7')
		expect(__('Row {0}').format(7)).toBe('Zeile 7')
		expect(__('Import')).toBe('Import')
		expect(createResource).not.toHaveBeenCalled()
	})

	it('updates mounted text and computed labels when translations arrive late', async () => {
		const wrapper = mount(
			{
				render() {
					return h('div', [
						h('h1', this.courseLabel),
						h('button', (this as any).__('Next')),
					])
				},
				computed: {
					courseLabel() {
						return (this as any).__('Courses')
					},
				},
			},
			{ global: { plugins: [translationPlugin] } }
		)
		try {
			expect(wrapper.get('h1').text()).toBe('Courses')
			expect(wrapper.get('button').text()).toBe('Next')
			const options = vi.mocked(createResource).mock.calls[0][0] as any
			expect(options.url).toBe('lms.lms.api.get_translations')
			options.transform({ Courses: 'Cours', Next: 'Suivant' })
			await nextTick()
			expect(wrapper.get('h1').text()).toBe('Cours')
			expect(wrapper.get('button').text()).toBe('Suivant')
			expect(browser.translatedMessages).toEqual({
				Courses: 'Cours',
				Next: 'Suivant',
			})
		} finally {
			wrapper.unmount()
		}
	})

	it('keeps English source text when the loaded dictionary has no matching key', async () => {
		const wrapper = mount(
			{
				render() {
					return h('h1', (this as any).__('Courses'))
				},
			},
			{ global: { plugins: [translationPlugin] } }
		)
		try {
			const options = vi.mocked(createResource).mock.calls[0][0] as any
			options.transform({})
			await nextTick()
			expect(wrapper.text()).toBe('Courses')
			expect(browser.__!('Next')).toBe('Next')
		} finally {
			wrapper.unmount()
		}
	})
})
