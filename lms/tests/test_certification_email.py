"""Certification email rendering only: no site, database, queue or certificate insertion.

Run with the bench Python: python -m unittest lms.tests.test_certification_email -v
"""

import copy
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlsplit

import frappe
from babel.messages.pofile import read_po
from frappe.email.doctype.email_template.email_template import EmailTemplate
from frappe.utils.jinja import get_email_from_template
from jinja2 import FileSystemLoader
from jinja2.sandbox import SandboxedEnvironment

from lms.lms.doctype.lms_certificate.lms_certificate import LMSCertificate

ROOT = Path(__file__).resolve().parents[1]
SUBJECT = "Congratulations on getting certified!"
INTRO = "I am delighted to inform you that you have successfully earned your certification for the {0} course. Congratulations!"


class FictionalEmailTemplate(SimpleNamespace):
	# Run native Email Template rendering without constructing a Document or
	# reading its metadata/permissions from a site.
	response_ = EmailTemplate.response_
	get_formatted_email = EmailTemplate.get_formatted_email
	get_formatted_subject = EmailTemplate.get_formatted_subject
	get_formatted_response = EmailTemplate.get_formatted_response
	inject_email_account = EmailTemplate.inject_email_account

	def check_permission(self, permission):
		if permission != "read":
			raise AssertionError("Unexpected permission check")


class TestCertificationEmail(unittest.TestCase):
	def setUp(self):
		with (ROOT / "locale/fr.po").open("rb") as stream:
			self.french = {m.id: m.string for m in read_po(stream) if m.id and m.string}
		self.languages = {"fictional-fr@example.com": "fr", "fictional-en@example.com": "en"}
		self.system_language = "en"
		self.custom = None
		self.messages = []
		self.course_title = "Écologie & océans"
		self.cert = SimpleNamespace(
			member="fictional-fr@example.com",
			member_name="Élodie & Fictional",
			course="FICTIONAL-COURSE",
			name="FICTIONAL-CERT",
			template="Certificate",
		)
		frappe.local.lang = "en"
		frappe.local.flags = frappe._dict()
		frappe.local.job = None
		frappe.local.jenv_restricted = None
		frappe.local.jenv_unrestricted = None
		self.db = Mock()
		self.db.get_single_value.side_effect = self.setting
		self.db.get_value.side_effect = self.value
		self.db.sql.side_effect = AssertionError("Database access forbidden")
		self.start(patch.object(frappe, "db", self.db, create=True))
		self.start(patch.object(frappe, "get_cached_value", side_effect=self.user_language))
		self.start(patch.object(frappe, "get_system_settings", side_effect=lambda key: self.system_language))
		self.start(
			patch(
				"frappe.translate.get_all_translations",
				side_effect=lambda lang: self.french if lang == "fr" else {},
			)
		)
		# Supply an in-memory loader/global set to the real native Jinja rendering
		# and context manager. No get_hooks/site cache/database is needed.
		self.start(
			patch(
				"frappe.utils.jinja._get_jenv",
				return_value=SandboxedEnvironment(loader=FileSystemLoader(ROOT)),
			)
		)
		self.start(patch("frappe.utils.jinja.get_jinja_hooks", return_value=({}, {})))
		self.start(
			patch(
				"frappe.utils.safe_exec.get_safe_globals",
				return_value={"_": frappe._, "frappe": {"bold": frappe.bold}},
			)
		)
		self.start(patch("frappe.utils.safe_exec.is_render_exec_enabled", return_value=False))
		self.start(patch("frappe.utils.logger.get_logger", return_value=Mock()))
		self.sendmail = self.start(patch.object(frappe, "sendmail", side_effect=self.capture))
		self.get_doc = self.start(
			patch.object(frappe, "get_doc", side_effect=AssertionError("Document access forbidden"))
		)
		for method in ["enqueue", "enqueue_doc", "get_print"]:
			self.start(patch.object(frappe, method, side_effect=AssertionError("Side effect forbidden")))
		self.addCleanup(self.clear_context)

	def start(self, patcher):
		value = patcher.start()
		self.addCleanup(patcher.stop)
		return value

	def clear_context(self):
		frappe.local.lang = "en"
		frappe.local.job = None
		frappe.local.jenv_restricted = None
		frappe.local.jenv_unrestricted = None

	def setting(self, doctype, field):
		self.assertEqual((doctype, field), ("LMS Settings", "certification_template"))
		return self.custom

	def value(self, doctype, name, field):
		self.assertEqual((doctype, name, field), ("LMS Course", "FICTIONAL-COURSE", "title"))
		return self.course_title

	def user_language(self, doctype, user, field):
		self.assertEqual((doctype, field), ("User", "language"))
		return self.languages.get(user)

	def capture(self, **kwargs):
		body = (
			get_email_from_template(kwargs["template"], kwargs["args"])[0]
			if kwargs["template"]
			else kwargs["content"]
		)
		self.messages.append({**copy.deepcopy(kwargs), "body": body, "lang": frappe.local.lang})

	def render(self, member):
		self.cert.member = member
		LMSCertificate.send_mail(self.cert)
		return self.messages[-1]

	def test_french_subject_and_entire_standard_body(self):
		m = self.render("fictional-fr@example.com")
		self.assertEqual(m["subject"], "Félicitations pour votre certification !")
		for text in [
			"Bonjour Élodie &amp; Fictional,",
			"Félicitations",
			"Cordialement",
			"Lien de certificat",
		]:
			self.assertIn(text, m["body"])
		self.assertNotIn("I am delighted", m["body"])
		self.assertNotIn("With this certification", m["body"])
		self.assertNotIn("Once again", m["body"])
		self.assertIn("<strong>Écologie &amp; océans</strong>", m["body"])
		m["body"].encode("utf-8").decode("utf-8")
		self.assertEqual(m["header"], [m["subject"], "green"])
		self.assertEqual(self.sendmail.call_count, 1)

	def test_english_and_separate_successive_recipients(self):
		fr = self.render("fictional-fr@example.com")
		self.cert.member_name = "Fictional English Learner"
		en = self.render("fictional-en@example.com")
		self.assertEqual(en["subject"], SUBJECT)
		self.assertIn("I am delighted", en["body"])
		self.assertNotIn("Félicitations", en["body"])
		self.assertNotIn("Élodie", en["body"])
		self.assertIn("Élodie", fr["body"])
		self.assertEqual(fr["lang"], "fr")
		self.assertEqual(en["lang"], "en")
		self.assertEqual(frappe.local.lang, "en")
		self.assertEqual(len(self.messages), 2)

	def test_missing_preference_native_site_and_context_fallbacks(self):
		for system, current, expected in [
			("fr", "en", "fr"),
			("en", "fr", "en"),
			(None, "fr", "fr"),
			(None, None, "en"),
		]:
			with self.subTest(system=system, current=current):
				self.system_language = system
				frappe.local.lang = current
				m = self.render("fictional-no-preference@example.com")
				self.assertEqual(m["lang"], expected)
				self.assertEqual(frappe.local.lang, current)

	def test_missing_translation_uses_english_source(self):
		self.french.pop(INTRO, None)
		self.assertIn("I am delighted", self.render("fictional-fr@example.com")["body"])

	def test_context_and_jinja_environment_restored(self):
		old = SandboxedEnvironment()
		frappe.local.lang = "de"
		frappe.local.jenv_unrestricted = old
		self.render("fictional-fr@example.com")
		self.assertEqual(frappe.local.lang, "de")
		self.assertIs(frappe.local.jenv_unrestricted, old)

	def test_job_context_is_resolved_then_restored(self):
		frappe.local.job = frappe._dict(user="fictional-en@example.com", lang_resolved=False)
		self.assertEqual(self.render("fictional-fr@example.com")["lang"], "fr")
		self.assertTrue(frappe.local.job.lang_resolved)
		self.assertEqual(frappe.local.lang, "en")

	def test_custom_native_email_template_keeps_variables_and_language(self):
		self.custom = "FICTIONAL-TEMPLATE"
		template = FictionalEmailTemplate(
			**{
				"doctype": "Email Template",
				"name": self.custom,
				"subject": '{{ _("Congratulations on getting certified!") }}',
				"response": "<p>{{ member_name | e }} {{ course_title | e }} {{ course_name }} {{ name }} {{ template }}</p>",
				"use_html": 0,
			}
		)
		self.get_doc.side_effect = (
			lambda doctype, name: template
			if (doctype, name) == ("Email Template", self.custom)
			else self.fail("Unexpected document")
		)
		m = self.render("fictional-fr@example.com")
		self.assertIsNone(m["template"])
		self.assertEqual(m["subject"], "Félicitations pour votre certification !")
		self.assertIn("Élodie &amp; Fictional", m["body"])
		self.assertIn("FICTIONAL-COURSE FICTIONAL-CERT Certificate", m["body"])
		self.assertEqual(self.render("fictional-en@example.com")["subject"], SUBJECT)
		template.subject = "Fictional literal subject"
		template.response = "Fictional literal body"
		for lang in ["fictional-fr@example.com", "fictional-en@example.com"]:
			m = self.render(lang)
			self.assertEqual((m["subject"], m["body"]), (template.subject, template.response))

	def test_custom_html_mode_native_rendering(self):
		self.custom = "FICTIONAL-HTML"
		template = FictionalEmailTemplate(
			subject='{{ _("Congratulations on getting certified!") }}',
			response="UNUSED",
			response_html="<p>{{ member_name | e }}</p>",
			use_html=1,
		)
		self.get_doc.side_effect = (
			lambda doctype, name: template
			if (doctype, name) == ("Email Template", self.custom)
			else self.fail("Unexpected document")
		)
		account = self.start(
			patch(
				"frappe.email.doctype.email_account.email_account.EmailAccount.find_outgoing",
				return_value=None,
			)
		)
		m = self.render("fictional-fr@example.com")
		self.assertEqual(m["subject"], "Félicitations pour votre certification !")
		self.assertEqual(m["body"], "<p>Élodie &amp; Fictional</p>")
		account.assert_called_once()

	def test_standard_escapes_names_and_encodes_same_link(self):
		self.cert.member_name = '<script>fictional</script> & "élève"'
		self.course_title = '<img src=x onerror="fictional"> & Cours'
		self.cert.name = 'FICTIONAL & "é"'
		self.cert.template = "Certificat & FR"
		body = self.render("fictional-fr@example.com")["body"]
		self.assertNotIn("<script>", body)
		self.assertNotIn("<img", body)
		from html.parser import HTMLParser

		class Links(HTMLParser):
			def handle_starttag(inner, tag, attrs):
				if tag == "a":
					inner.link = dict(attrs)["href"]

		links = Links()
		links.feed(body)
		url = urlsplit(links.link)
		self.assertEqual(url.path, "/api/method/frappe.utils.print_format.download_pdf")
		self.assertEqual(
			parse_qs(url.query),
			{
				"doctype": ["LMS Certificate"],
				"name": [self.cert.name],
				"format": [self.cert.template],
				"no_letterhead": ["1"],
			},
		)
		self.assertNotIn("attachments", self.messages[-1])

	def test_render_error_restores_language_without_sending(self):
		self.custom = "FICTIONAL-BROKEN"
		self.get_doc.side_effect = RuntimeError("Fictional render failure")
		with self.assertRaises(RuntimeError):
			self.render("fictional-fr@example.com")
		self.assertEqual(frappe.local.lang, "en")
		self.sendmail.assert_not_called()


if __name__ == "__main__":
	unittest.main()
