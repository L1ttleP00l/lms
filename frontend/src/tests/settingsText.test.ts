import { describe, it, expect, vi } from 'vitest'

describe('FR-03B.6 no-op source markers', () => {
	it('loads without any global translator and returns only source strings', async () => {
		const translator = vi.fn(() => {
			throw new Error('translator must not run at module load')
		})
		vi.stubGlobal('__', translator)
		const { settingsText } = await import('@/components/Settings/settingsText')
		expect(Object.values(settingsText)).toEqual([
			'System Configuration',
			'Access & Availability',
			'Seconds a learner must stay on a lesson before it is marked complete.',
		])
		expect(translator).not.toHaveBeenCalled()
		vi.unstubAllGlobals()
	})
})
