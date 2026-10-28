import frappe
from frappe.translate import clear_cache, get_user_lang

from lms.lms.api import get_translations
from lms.lms.test_helpers import BaseTestUtils

SOURCE = "LMS translation language regression fixture"


class TestTranslations(BaseTestUtils):
	def setUp(self):
		super().setUp()
		self.previous_lang = frappe.local.lang
		frappe.db.set_single_value("System Settings", "language", "fr")
		frappe.local.system_settings = None
		for language, text in (("fr", "Texte français de test"), ("en", "English test text")):
			frappe.get_doc(
				{
					"doctype": "Translation",
					"language": language,
					"source_text": SOURCE,
					"translated_text": text,
				}
			).insert()

	def tearDown(self):
		super().tearDown()
		frappe.local.lang = self.previous_lang
		frappe.local.system_settings = None
		clear_cache()
		frappe.clear_document_cache("System Settings", "System Settings")

	def assert_language(self, user, language, text):
		frappe.set_user(user)
		self.assertEqual(get_user_lang(), language)
		self.assertEqual(get_translations()[SOURCE], text)

	def create_user(self, suffix, language, roles):
		user = self._create_user(f"translation-{suffix}@example.com", "Translation", suffix, roles)
		user.language = language
		user.save()
		return user.name

	def test_guest_uses_system_language(self):
		self.assert_language("Guest", "fr", "Texte français de test")

	def test_french_preferences_work_for_lms_roles(self):
		for suffix, roles in (
			("student", ["LMS Student"]),
			("instructor", ["Course Creator"]),
			("manager", ["System Manager", "Moderator"]),
		):
			with self.subTest(role=suffix):
				frappe.set_user("Administrator")
				user = self.create_user(suffix, "fr", roles)
				self.assert_language(user, "fr", "Texte français de test")

	def test_english_preference_overrides_french_site(self):
		user = self.create_user("english", "en", ["LMS Student"])
		self.assert_language(user, "en", "English test text")

	def test_missing_preference_falls_back_to_system_language(self):
		user = self.create_user("no-language", None, ["LMS Student"])
		self.assert_language(user, "fr", "Texte français de test")

	def test_missing_user_and_system_preferences_use_request_language(self):
		user = self.create_user("request-language", None, ["LMS Student"])
		frappe.db.set_single_value("System Settings", "language", "")
		frappe.local.system_settings = None
		frappe.local.lang = "en"
		self.assert_language(user, "en", "English test text")
