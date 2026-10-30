/** Billing.vue: India state validation and checkout error surfacing. */
// A case-sensitive state whitelist that also omitted every union territory
// rejected "GUJARAT", and the rejection reached the user as an empty toast
// (toast.error was handed the raw Error), so the button looked dead.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { reactive } from 'vue'
import Billing from '@/pages/Billing.vue'
import translationPlugin from '@/translation'

type BillingAddress = Record<string, unknown>
type SubmittedCall = { url: string; params: { address: BillingAddress } }

const { toastMock, submitted, unhandled } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
	submitted: [] as SubmittedCall[],
	unhandled: [] as unknown[],
}))

const ACCESS_URL = 'lms.lms.api.validate_billing_access'
const SUMMARY_URL = 'lms.lms.utils.get_order_summary'
const PAYMENT_URL = 'lms.lms.payments.get_payment_link'

let fieldMetaOverride = {}
let accessAllowed = true
let summaryFixture: Record<string, unknown> = {}
let paymentResult: unknown = undefined
let addressFixture: Record<string, unknown> | null = null

const FIELD_META = {
	billing_name: { reqd: 1 },
	address_line1: { reqd: 1 },
	city: { reqd: 1 },
	state: { reqd: 0 },
	country: { reqd: 1, default: 'India' },
	pincode: { reqd: 0 },
	phone: { reqd: 0 },
	source: { reqd: 0 },
	gstin: { reqd: 0 },
	pan: { reqd: 0 },
}

const SUMMARY = {
	title: 'Batch',
	original_amount_formatted: '₹ 2,000',
	gst_amount_formatted: '₹ 360',
	total_amount_formatted: '₹ 2,360',
	total_amount: 2360,
	gst_applied: 360,
}

type ResourceParams = { address: BillingAddress } & Record<string, unknown>
type ResourceHandlers = {
	validate?: (
		params: ResourceParams
	) => string | undefined | Promise<string | undefined>
	onSuccess?: (data: unknown) => void
	onError?: (error: Error) => void
}
type ResourceOptions = ResourceHandlers & {
	url: string
	params?: ResourceParams
	makeParams?: (values?: unknown) => ResourceParams
}

// Mirrors frappe-ui's resource contract closely enough for this page: makeParams
// builds the params, validate() runs after and aborts the fetch with a string
// message, and an absent onError leaves that rejection unhandled.
const createResourceMock = (opts: ResourceOptions) => {
	// reactive: the page renders off `resource.data`, so a plain object would
	// leave the template stuck on the loading branch.
	const res = reactive({
		data: null as unknown,
		loading: false,
		error: null as Error | null,
		reload: vi.fn(),
		submit: vi.fn(async (values?: unknown, handlers: ResourceHandlers = {}) => {
			const params = opts.makeParams ? opts.makeParams(values) : opts.params
			const validate = handlers.validate || opts.validate
			if (validate && params) {
				const message = await validate(params)
				if (message && typeof message === 'string') {
					const error = new Error(message)
					const handlerFns = [opts.onError, handlers.onError].filter(Boolean)
					if (!handlerFns.length) unhandled.push(error)
					handlerFns.forEach((fn) => fn?.(error))
					return
				}
			}
			submitted.push({
				url: opts.url,
				params: JSON.parse(JSON.stringify(params)),
			})
			if (opts.url === ACCESS_URL) {
				const data = {
					access: accessAllowed,
					message: accessAllowed ? '' : 'SIMULATED REFUSAL',
					address: addressFixture,
					billing_field_meta: { ...FIELD_META, ...fieldMetaOverride },
				}
				res.data = data
				opts.onSuccess?.(data)
			} else if (opts.url === PAYMENT_URL && paymentResult !== undefined) {
				handlers.onSuccess?.(paymentResult)
			} else if (opts.url === SUMMARY_URL) {
				res.data = { ...SUMMARY, ...summaryFixture }
			}
		}),
	})
	return res
}

vi.mock('frappe-ui', () => ({
	toast: toastMock,
	usePageMeta: vi.fn(),
	createResource: (opts: ResourceOptions) => createResourceMock(opts),
	Breadcrumbs: { template: '<div />' },
	Button: {
		props: ['label'],
		emits: ['click'],
		template: `<button :aria-label="label" @click="$emit('click')"><slot /></button>`,
	},
	FormControl: {
		props: [
			'modelValue',
			'label',
			'type',
			'required',
			'disabled',
			'placeholder',
			// Declared so a field-level error Billing hands the control is
			// observable here; the real control renders it as InputError.
			'error',
		],
		// As in rc.1, attrs land on the input; input and change emit the value,
		// and a required control marks its input aria-required.
		inheritAttrs: false,
		emits: ['update:modelValue'],
		template: `<span><input
			v-bind="$attrs"
			:data-testid="'fc-' + label"
			:type="type || 'text'"
			:aria-required="required || undefined"
			:value="modelValue"
			@input="$emit('update:modelValue', type === 'checkbox' ? $event.target.checked : $event.target.value)"
			@change="$emit('update:modelValue', type === 'checkbox' ? $event.target.checked : $event.target.value)"
		/><span v-if="error" data-slot="error">{{ error }}</span></span>`,
	},
	Combobox: {
		props: ['modelValue', 'options', 'label', 'required', 'placeholder'],
		emits: ['update:modelValue'],
		template: `<select
			:data-testid="'combobox-' + label"
			:value="modelValue"
			@change="$emit('update:modelValue', $event.target.value)"
		>
			<option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
		</select>`,
	},
}))

vi.mock('@framework/ui/telemetry/index', async (importOriginal) => ({
	...(await importOriginal<typeof import('@framework/ui/telemetry/index')>()),
	useTelemetry: () => ({ capture: vi.fn() }),
}))
vi.mock('@/stores/session', () => ({
	sessionStore: () => ({ brand: { favicon: '' } }),
}))
vi.mock('@/components/NotPermitted.vue', () => ({
	default: {
		props: ['text', 'buttonLabel', 'buttonLink'],
		template: '<a :href="buttonLink">{{ buttonLabel }}</a>',
	},
}))
vi.mock('@/components/Controls/Link.vue', () => ({
	default: {
		props: ['value', 'doctype', 'label', 'required'],
		emits: ['change'],
		template: `<select
			:data-testid="'link-' + label"
			:value="value"
			@change="$emit('change', $event.target.value)"
		/>`,
	},
}))
vi.mock('@/utils/basePath', () => ({ getLmsRoute: (r: string) => `/lms/${r}` }))

vi.stubGlobal('__', (s: string) => s)

const french: Record<string, string> = {
	'Payment for the course': 'Paiement du cours',
	'Payment for the training session': 'Paiement de la session de formation',
	'Payment for the certificate option': "Paiement de l'option certificat",
	'Enter a Coupon Code': 'Saisissez un code de réduction',
	'Coupon Code': 'Code de réduction',
	'Remove coupon': 'Retirer le code de réduction',
	'Please enter a coupon code': 'Veuillez saisir un code de réduction.',
	'Could not start the payment. Please contact the administrator.':
		"Impossible de démarrer le paiement. Contactez l'administrateur.",
	Apply: 'Appliquer',
	Discount: 'Remise',
	Total: 'Total',
	'Confirm without payment': 'Valider sans paiement',
	'Proceed to Payment': 'Procéder au paiement',
	'Billing Details': 'Informations de facturation',
	'Back to course': 'Retour au cours',
	'Back to training session': 'Retour à la session',
	'Billing Name': 'Nom de facturation',
	'Address Line 1': "Ligne d'adresse 1",
	'Address Line 2': "Ligne d'adresse 2",
	City: 'Ville',
	'State/Province': 'État/Province',
	'Postal Code': 'Code postal',
	'Phone Number': 'Numéro de téléphone',
	'GST Number': 'Numéro de GST',
	'PAN Number': 'Numéro PAN',
	Country: 'Pays',
	'Please enter a valid value for {0}.':
		'Veuillez saisir une valeur valide pour le champ « {0} ».',
	'Please enter a valid PAN number.': 'Veuillez saisir un numéro PAN valide.',
	'Please provide your consent to proceed with the payment':
		'Veuillez donner votre accord pour poursuivre le paiement.',
	'Please provide your consent to proceed with the payment.':
		'Veuillez donner votre accord pour poursuivre le paiement.',
	'I consent to my personal information being stored for invoicing':
		'J’accepte que mes données personnelles soient conservées pour la facturation.',
	'Please select your state from the list.':
		'Veuillez sélectionner votre État dans la liste.',
}
beforeEach(() => {
	accessAllowed = true
	paymentResult = undefined
	fieldMetaOverride = {}
	summaryFixture = {}
	submitted.length = 0
	unhandled.length = 0
	vi.clearAllMocks()
})

const address = (over: Record<string, unknown> = {}) => ({
	billing_name: 'FR02C2 Test Learner',
	address_line1: '1 Fictional Test Street',
	address_line2: '',
	city: 'Test City',
	state: 'Gujarat',
	country: 'India',
	pincode: '000000',
	phone: '0000000000',
	...over,
})

const mountBilling = async (
	over: Record<string, unknown> = {},
	type = 'batch',
	lang = 'en'
) => {
	window.translatedMessages = lang === 'fr' ? french : {}
	addressFixture = address(over)
	const wrapper = mount(Billing, {
		props: { type, name: 'BATCH-01' },
		global: {
			provide: { $user: { data: { name: 'a@b.c' } } },
			plugins: [translationPlugin],
			stubs: { RouterLink: true },
		},
	})
	await flushPromises()
	return wrapper
}

const consent = async (wrapper: VueWrapper) => {
	const box = wrapper
		.findAll('input[type="checkbox"]')
		.find((i) => i.attributes('type') === 'checkbox')
	if (!box) throw new Error('consent checkbox not rendered')
	await box.setValue(true)
}

const proceed = async (wrapper: VueWrapper) => {
	const button = wrapper
		.findAll('button')
		.find((b) =>
			/Proceed to Payment|Confirm without payment|Procéder au paiement|Valider sans paiement/.test(
				b.text()
			)
		)
	if (!button) throw new Error('checkout button not rendered')
	await button.trigger('click')
	await flushPromises()
}

const checkout = () => submitted.find((s) => s.url === PAYMENT_URL)

const checkoutAddress = () => {
	const call = checkout()
	if (!call) throw new Error('checkout was never submitted')
	return call.params.address
}

describe('Billing: India state field', () => {
	beforeEach(() => {
		submitted.length = 0
		unhandled.length = 0
		vi.clearAllMocks()
	})

	it('offers the canonical states as options instead of free text', async () => {
		const wrapper = await mountBilling()
		const select = wrapper.find('[data-testid="combobox-State/Province"]')
		expect(select.exists()).toBe(true)
		expect(wrapper.find('[data-testid="fc-State/Province"]').exists()).toBe(
			false
		)

		const options = select.findAll('option').map((o) => o.text())
		expect(options).toContain('Gujarat')
		// Union territories were missing from the original list, so anyone in one
		// of them could not check out at all.
		expect(options).toEqual(
			expect.arrayContaining([
				'Chandigarh',
				'Puducherry',
				'Ladakh',
				'Lakshadweep',
				'Andaman and Nicobar Islands',
				'Dadra and Nagar Haveli and Daman and Diu',
			])
		)
	})

	it.each([
		// All-caps saved state.
		{ stored: 'GUJARAT', sent: 'Gujarat' },
		// Stray case and whitespace typed elsewhere.
		{ stored: '  tamil nadu ', sent: 'Tamil Nadu' },
		// A union territory.
		{ stored: 'Chandigarh', sent: 'Chandigarh' },
	])('checks out with $stored saved as $sent', async ({ stored, sent }) => {
		const wrapper = await mountBilling({ state: stored })
		await consent(wrapper)
		await proceed(wrapper)

		expect(toastMock.error).not.toHaveBeenCalled()
		expect(checkout()).toBeTruthy()
		expect(checkoutAddress().state).toBe(sent)
	})

	it('still blocks a state that is not a real one', async () => {
		const wrapper = await mountBilling({ state: 'Gujrat' })
		await consent(wrapper)
		await proceed(wrapper)

		expect(checkout()).toBeFalsy()
		expect(toastMock.error).toHaveBeenCalled()
	})

	it('keeps the state as free text outside India', async () => {
		const wrapper = await mountBilling({ country: 'Germany', state: 'Bayern' })
		await consent(wrapper)
		await proceed(wrapper)

		expect(wrapper.find('[data-testid="fc-State/Province"]').exists()).toBe(
			true
		)
		expect(checkout()).toBeTruthy()
		expect(checkoutAddress().state).toBe('Bayern')
	})
})

describe('Billing: checkout validation errors reach the user', () => {
	beforeEach(() => {
		submitted.length = 0
		unhandled.length = 0
		vi.clearAllMocks()
	})

	it('toasts readable text for the missing-consent error', async () => {
		const wrapper = await mountBilling()
		await proceed(wrapper)

		expect(checkout()).toBeFalsy()
		// An unhandled validation rejection would mean no feedback at all.
		expect(unhandled).toHaveLength(0)
		// Passing the Error object straight to toast.error renders an empty toast.
		expect(toastMock.error).toHaveBeenCalledWith(
			'Please provide your consent to proceed with the payment.'
		)
	})

	it('hands the consent error to the checkbox, not just the toast', async () => {
		// The warning used to be a hand-rolled red div beside the control, so it
		// was never tied to the checkbox for assistive tech. FormControl's own
		// error region is, via aria-invalid / aria-errormessage.
		const wrapper = await mountBilling()
		await proceed(wrapper)

		const error = wrapper
			.findAll('[data-slot="error"]')
			.find((node) => node.text().includes('consent'))
		expect(error?.text()).toBe(
			'Please provide your consent to proceed with the payment'
		)
	})

	it('marks the consent box required before any click', async () => {
		const wrapper = await mountBilling()
		const box = wrapper
			.findAll('input[type="checkbox"]')
			.find((i) => i.attributes('type') === 'checkbox')

		expect(box?.attributes('aria-required')).toBe('true')
	})

	it('clears the consent error once the box is ticked', async () => {
		const wrapper = await mountBilling()
		await proceed(wrapper)
		await consent(wrapper)
		await proceed(wrapper)

		expect(
			wrapper
				.findAll('[data-slot="error"]')
				.some((node) => node.text().includes('consent'))
		).toBe(false)
	})

	it('toasts readable text for an invalid state', async () => {
		const wrapper = await mountBilling({ state: 'Gujrat' })
		await consent(wrapper)
		await proceed(wrapper)

		expect(toastMock.error).toHaveBeenCalledWith(
			expect.stringContaining('state')
		)
	})
})

describe('Billing: coupon field', () => {
	beforeEach(() => {
		submitted.length = 0
		unhandled.length = 0
		vi.clearAllMocks()
	})

	it('sends the typed coupon trimmed and upper-cased', async () => {
		const wrapper = await mountBilling()
		await wrapper
			.find<HTMLInputElement>('input[aria-label="Coupon Code"]')
			.setValue(' save10 ')
		await consent(wrapper)
		await proceed(wrapper)

		expect(checkout()?.params.coupon_code).toBe('SAVE10')
	})

	it('treats a blank coupon as no coupon', async () => {
		const wrapper = await mountBilling()
		await wrapper
			.find<HTMLInputElement>('input[aria-label="Coupon Code"]')
			.setValue('   ')
		await wrapper
			.findAll('button')
			.find((b) => b.text().includes('Apply'))!
			.trigger('click')

		expect(toastMock.error).toHaveBeenCalledWith('Please enter a coupon code')
	})
})

describe('Billing contextual French and English', () => {
	for (const lang of ['fr', 'en']) {
		for (const type of ['course', 'batch', 'certificate']) {
			it.each([
				{ amount: 100, discount: 0 },
				{ amount: 0, discount: 0 },
				{ amount: 0, discount: 100 },
			])(
				`labels ${type} for amount $amount and discount $discount in ${lang}`,
				async ({ amount, discount }) => {
					summaryFixture = {
						total_amount: amount,
						discount_amount: discount,
					}
					const view = await mountBilling({}, type, lang)
					const expected =
						lang === 'fr'
							? {
									course: 'Paiement du cours',
									batch: 'Paiement de la session de formation',
									certificate: "Paiement de l'option certificat",
							  }
							: {
									course: 'Payment for the course',
									batch: 'Payment for the training session',
									certificate: 'Payment for the certificate option',
							  }
					expect(view.text()).toContain(expected[type as keyof typeof expected])
					expect(view.text()).toContain(
						lang === 'fr'
							? amount
								? 'Procéder au paiement'
								: 'Valider sans paiement'
							: amount
							? 'Proceed to Payment'
							: 'Confirm without payment'
					)
					expect(checkout()).toBeFalsy()
				}
			)
			it(`returns ${type} to the correct destination in ${lang}`, async () => {
				accessAllowed = false
				const view = await mountBilling({}, type, lang)
				const link = view.get('a')
				expect(link.attributes('href')).toBe(
					`/lms/${type === 'batch' ? 'batches' : 'courses'}/BATCH-01`
				)
				expect(link.text()).toBe(
					lang === 'fr'
						? type === 'batch'
							? 'Retour à la session'
							: 'Retour au cours'
						: type === 'batch'
						? 'Back to training session'
						: 'Back to course'
				)
			})
		}
		it.each([
			'billing_name',
			'address_line1',
			'address_line2',
			'city',
			'state',
			'pincode',
			'country',
			'phone',
			'gstin',
			'pan',
		])(`localizes required field %s in ${lang}`, async (field) => {
			fieldMetaOverride = { [field]: { reqd: 1 } }
			const view = await mountBilling({ [field]: '' }, 'course', lang)
			if (field === 'country')
				await view
					.get(`[data-testid="link-${lang === 'fr' ? 'Pays' : 'Country'}"]`)
					.setValue('')
			await consent(view)
			await proceed(view)
			const labels: Record<string, string> = {
				billing_name: 'Billing Name',
				address_line1: 'Address Line 1',
				city: 'City',
				country: 'Country',
				address_line2: 'Address Line 2',
				state: 'State/Province',
				pincode: 'Postal Code',
				phone: 'Phone Number',
				gstin: 'GST Number',
				pan: 'PAN Number',
			}
			const label =
				lang === 'fr' ? french[labels[field]] || labels[field] : labels[field]
			expect(toastMock.error).toHaveBeenCalledWith(
				lang === 'fr'
					? `Veuillez saisir une valeur valide pour le champ « ${label} ».`
					: `Please enter a valid value for ${label}.`
			)
			expect(checkout()).toBeFalsy()
		})
		it(`localizes PAN, Indian-state and consent errors in ${lang}`, async () => {
			const pan = await mountBilling(
				{ gstin: 'SIMULATED-GST', pan: '' },
				'course',
				lang
			)
			await consent(pan)
			await proceed(pan)
			expect(toastMock.error).toHaveBeenLastCalledWith(
				lang === 'fr'
					? 'Veuillez saisir un numéro PAN valide.'
					: 'Please enter a valid PAN number.'
			)
			const state = await mountBilling(
				{ state: 'Invalid Test State' },
				'course',
				lang
			)
			await consent(state)
			await proceed(state)
			expect(toastMock.error).toHaveBeenLastCalledWith(
				lang === 'fr'
					? 'Veuillez sélectionner votre État dans la liste.'
					: 'Please select your state from the list.'
			)
			const view = await mountBilling({}, 'course', lang)
			await proceed(view)
			expect(toastMock.error).toHaveBeenLastCalledWith(
				lang === 'fr'
					? 'Veuillez donner votre accord pour poursuivre le paiement.'
					: 'Please provide your consent to proceed with the payment.'
			)
			expect(view.find('[data-slot="error"]').text()).toBe(
				lang === 'fr'
					? 'Veuillez donner votre accord pour poursuivre le paiement.'
					: 'Please provide your consent to proceed with the payment'
			)
			await consent(view)
			expect(view.find('[data-slot="error"]').exists()).toBe(false)
		})
	}
})

describe('FR-02C.3 coupon messages', () => {
	for (const lang of ['fr', 'en']) {
		const tr = (key: string) => (lang === 'fr' ? french[key] || key : key)
		it(`names the field and rejects an empty code in ${lang}`, async () => {
			const view = await mountBilling({}, 'course', lang)
			expect(view.text()).toContain(tr('Enter a Coupon Code'))
			const input = view.get(`input[aria-label="${tr('Coupon Code')}"]`)
			await input.setValue('   ')
			await view
				.findAll('button')
				.find((b) => b.text() === tr('Apply'))!
				.trigger('click')
			expect(toastMock.error).toHaveBeenLastCalledWith(
				tr('Please enter a coupon code')
			)
			expect(checkout()).toBeFalsy()
		})
		it(`keeps normalization and removes a simulated discount in ${lang}`, async () => {
			summaryFixture = {
				discount_amount: 10,
				discount_amount_formatted: '10 EUR',
			}
			const view = await mountBilling({}, 'course', lang)
			const input = view.get(`input[aria-label="${tr('Coupon Code')}"]`)
			await input.setValue(' test-only ')
			expect(view.text()).toContain(tr('Discount'))
			expect(view.text()).toContain(tr('Total'))
			await view
				.get(`button[aria-label="${tr('Remove coupon')}"]`)
				.trigger('click')
			expect((input.element as HTMLInputElement).value).toBe('')
			expect(checkout()).toBeFalsy()
		})
		it(`shows the invalid payment response fallback in ${lang} without network`, async () => {
			paymentResult = {}
			const view = await mountBilling({}, 'course', lang)
			await consent(view)
			await proceed(view)
			expect(toastMock.error).toHaveBeenLastCalledWith(
				tr('Could not start the payment. Please contact the administrator.')
			)
		})
	}
})
