"""Standalone native gettext regression tests; no site or database required."""

import tempfile
import unittest
from pathlib import Path

from babel.messages.extract import extract_from_dir
from frappe.gettext.translate import PYTHON_KEYWORDS, get_method_map

ROOT = Path(__file__).resolve().parents[2]
ENROLLMENT_KEYS = {
	"1 student enrolled",
	"{0} students enrolled",
	"1 student upgraded to certificate",
	"{0} students upgraded to certificate",
	"1 student could not be enrolled",
	"{0} students could not be enrolled",
	"Enroll 1 student",
	"Enroll {0} students",
}


def extract_files(files):
	"""Use the same ordered application + Framework rules as generate_pot."""
	methods = get_method_map("lms") + get_method_map("frappe")
	with tempfile.TemporaryDirectory() as directory:
		for name, source in files.items():
			path = Path(directory) / name
			path.parent.mkdir(parents=True, exist_ok=True)
			path.write_text(source)
		return list(extract_from_dir(directory, methods, keywords=PYTHON_KEYWORDS))


class TypeScriptExtractionTests(unittest.TestCase):
	def test_settings_source_markers(self):
		path = "frontend/src/components/Settings/settingsText.ts"
		keys = {message for _, _, message, _, _ in extract_files({path: (ROOT / path).read_text()})}
		self.assertEqual(
			keys,
			{
				"System Configuration",
				"Access & Availability",
				"Seconds a learner must stay on a lesson before it is marked complete.",
			},
		)

	def test_settings_marker_scope(self):
		path = "frontend/src/components/Settings/settingsText.ts"
		code = "const label = N_('Probe {0}'); const raw = 'Not a message';"
		self.assertEqual([message for _, _, message, _, _ in extract_files({path: code})], ["Probe {0}"])
		self.assertEqual(extract_files({"frontend/src/utils/not_schema.ts": code}), [])

	def test_vue_bulk_enrollment_messages(self):
		paths = [
			"frontend/src/components/Enrollment/StudentPicker.vue",
			"frontend/src/components/Enrollment/EnrollStudentsForm.vue",
			"frontend/src/components/Enrollment/EnrollPaymentPanel.vue",
		]
		rows = extract_files({p: (ROOT / p).read_text() for p in paths})
		keys = {message for _, _, message, _, _ in rows}
		expected = {
			"Different addresses for these {0} students",
			"{0} seats left, {1} selected",
			"You can enroll up to {0} students at a time.",
		}
		self.assertTrue(expected <= keys, f"Missing: {expected-keys}")

	def test_vue_argument_layout_with_native_extractors(self):
		variants = {
			"simple": "__('Probe {0}', [value])",
			"newline_before_message": "__(\n 'Probe {0}', [value])",
			"newline_in_array": "__('Probe {0}', [\n value,\n])",
			"external_format": "__('Probe {0}').format(\n value\n)",
		}
		for label, source in variants.items():
			for suffix in ("vue", "ts"):
				with self.subTest(label=label, suffix=suffix):
					rows = extract_files({f"frontend/src/utils/probe.{suffix}": source})
					self.assertEqual(
						[message for _, _, message, _, _ in rows],
						[] if label == "newline_in_array" and suffix == "vue" else ["Probe {0}"],
					)

	def test_real_typescript_messages(self):
		paths = [
			"frontend/src/components/Enrollment/enrollment.ts",
			"frontend/src/utils/proctoring.ts",
			"frontend/src/utils/quizSummary.ts",
			"frontend/src/composables/useSettingsSource.ts",
		]
		messages = extract_files({path: (ROOT / path).read_text() for path in paths})
		keys = {message for _, _, message, _, _ in messages}
		self.assertTrue(ENROLLMENT_KEYS <= keys, f"Missing: {ENROLLMENT_KEYS - keys}")
		self.assertTrue({"Tab switch", "{0} {1} left", "Save failed"} <= keys)
		self.assertTrue(all(context is None for _, _, _, _, context in messages))

	def test_typescript_syntax_parameters_context_and_occurrences(self):
		source = """
import type { Ref } from 'vue'
interface Item { value?: string }
type Result<T> = T | null
const value = { value: 'technical field' } satisfies Item
const describe = <T extends Item>(item: T): string => {
  const typed = item as Item
  const optional: Result<string> = typed?.value ?? null
  return __('Result {0}: {1}', [optional, 'not a key'], 'Enrollment outcome')
}
const duplicate: string = __('Repeated label')
const again = __('Repeated label')
const label = __('Typed label') as string
const ignored = 'not translated'
// __('Comment must not be extracted')
"""
		messages = extract_files({"frontend/src/utils/example.ts": source})
		pairs = [(message, context) for _, _, message, _, context in messages]
		self.assertCountEqual(
			pairs,
			[
				("Result {0}: {1}", "Enrollment outcome"),
				("Repeated label", None),
				("Repeated label", None),
				("Typed label", None),
			],
		)

	def test_excludes_non_application_typescript_and_preserves_existing_rules(self):
		ignored = [
			"frontend/src/tests/example.ts",
			"frontend/src/utils/example.test.ts",
			"frontend/src/utils/example.spec.ts",
			"frontend/src/utils/__tests__/example.ts",
			"frontend/src/generated.d.ts",
			"frontend/components.d.ts",
			"frontend/vite.config.ts",
			"node_modules/example.ts",
			"lms/public/frontend/example.ts",
		]
		files = {path: "__('Excluded technical fixture')" for path in ignored}
		files.update(
			{
				"frontend/src/utils/example.ts": "const text: string = __('TS label')",
				"frontend/src/example.js": "__('JS label')",
				"frontend/src/example.vue": "<template>{{ __('Vue label') }}</template>",
				"lms/example.py": 'label = _("Python label")',
			}
		)
		messages = extract_files(files)
		self.assertCountEqual(
			[message for _, _, message, _, _ in messages],
			["TS label", "JS label", "Vue label", "Python label"],
		)


if __name__ == "__main__":
	unittest.main()
