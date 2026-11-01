"""Native certificate HTML and permission/language boundaries; no site or binary PDF."""

import copy
import json
import socket
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlsplit

import frappe
from frappe.translate import print_language
from frappe.utils import format_date
from frappe.utils import print_format as pdf_endpoint
from frappe.utils.pdf import pdf_body_html
from frappe.www import printview

from lms.lms.doctype.lms_certificate import lms_certificate as certificate
from lms.tests import test_certification_email as fixture
from lms.www import certificate as certificate_page

ROOT = Path(__file__).resolve().parents[1]
FORMAT = ROOT / "lms/print_format/certificate/certificate.json"
CLAUSE = "has successfully completed the course {0}, including all required assessments, on {1}."


class TestCertificatePrintLanguage(unittest.TestCase):
	start = fixture.TestCertificationEmail.start
	clear_context = fixture.TestCertificationEmail.clear_context
	user_language = fixture.TestCertificationEmail.user_language

	def setUp(self):
		fixture.TestCertificationEmail.setUp(self)
		self.format = frappe._dict(json.loads(FORMAT.read_text()))
		self.member_name = "Élodie & Noël"
		self.title = "Écologie & océans"
		self.brand = "Académie Fictionnelle"
		self.logo = "/files/fictional-logo.png"
		self.instructors = ["fictional-instructor@example.com"]
		self.doc = frappe._dict(
			doctype="LMS Certificate",
			name="FICTIONAL-CERT",
			member="fictional-fr@example.com",
			course="FICTIONAL-COURSE",
			issue_date="2027-05-17",
			expiry_date=None,
			evaluator=None,
			evaluator_name=None,
			template="Certificate",
			published=0,
			flags=frappe._dict(),
		)
		self.doc._handle_permission_failure = lambda ptype: (_ for _ in ()).throw(
			frappe.PermissionError(ptype)
		)
		frappe.local.form_dict = frappe._dict()
		frappe.local.response = frappe._dict()
		frappe.local.message_log = []
		self.start(patch.object(frappe, "session", frappe._dict(user=self.doc.member), create=True))
		self.start(patch.object(frappe, "get_roles", return_value=[]))
		self.start(patch.object(certificate, "is_site_administrator", return_value=False))
		self.start(
			patch.object(
				frappe,
				"has_permission",
				side_effect=lambda doctype, ptype, doc: certificate.has_permission(
					doc, ptype, frappe.session.user
				),
			)
		)
		self.start(
			patch.object(
				frappe,
				"has_website_permission",
				side_effect=lambda doc: certificate.has_website_permission(doc, "read", frappe.session.user),
			)
		)
		self.start(patch.object(frappe, "get_all", side_effect=self.get_all))
		self.meta = SimpleNamespace(default_print_format="Certificate", name="LMS Certificate")
		self.start(patch.object(frappe, "get_meta", return_value=self.meta))
		self.start(
			patch.object(
				frappe,
				"get_cached_doc",
				side_effect=lambda name: SimpleNamespace(as_dict=lambda: frappe._dict(with_letterhead=0)),
			)
		)
		self.start(
			patch.object(
				frappe,
				"get_hooks",
				side_effect=lambda key, **kwargs: ["frappe.utils.pdf.pdf_body_html"]
				if key == "pdf_body_html"
				else [],
			)
		)
		self.start(
			patch.object(
				frappe,
				"get_attr",
				side_effect=lambda key: pdf_body_html
				if key == "frappe.utils.pdf.pdf_body_html"
				else self.fail("Unexpected hook"),
			)
		)
		self.start(
			patch.object(
				frappe,
				"get_cached_value",
				side_effect=lambda doctype, name, field: 0
				if doctype == "Module Def"
				else self.user_language(doctype, name, field),
			)
		)
		self.start(patch.object(printview, "get_module_path", return_value=str(FORMAT.parent)))
		self.start(patch.object(printview, "make_layout", return_value=[]))
		self.start(patch.object(printview, "convert_markdown"))
		self.start(patch.object(printview, "run_before_print"))
		self.start(patch.object(printview, "validate_print_for_docstatus"))
		self.start(patch.object(printview, "get_letter_head", return_value={}))
		self.start(
			patch(
				"frappe.utils.safe_exec.get_safe_globals",
				return_value={
					"_": frappe._,
					"frappe": {
						"db": {"get_value": self.value, "get_single_value": self.setting},
						"get_all": self.get_all,
						"utils": {"format_date": format_date},
					},
				},
			)
		)
		for method in ["set_value", "insert", "update", "commit", "delete"]:
			getattr(self.db, method).side_effect = AssertionError("Business write forbidden")
		self.start(patch.object(frappe, "connect", side_effect=AssertionError("Site forbidden")))
		self.start(patch.object(frappe, "new_doc", side_effect=AssertionError("Creation forbidden")))
		self.start(patch.object(socket.socket, "connect", side_effect=AssertionError("Network forbidden")))
		self.start(patch("smtplib.SMTP", side_effect=AssertionError("SMTP forbidden")))
		self.start(
			patch.object(certificate, "create_certificate", side_effect=AssertionError("Issuance forbidden"))
		)
		self.start(
			patch.object(
				certificate.LMSCertificate, "after_insert", side_effect=AssertionError("Insertion forbidden")
			)
		)
		self.start(
			patch.object(
				certificate.LMSCertificate,
				"send_certification_email",
				side_effect=AssertionError("Email forbidden"),
			)
		)
		self.start(
			patch(
				"frappe.email.doctype.email_queue.email_queue.EmailQueue.new",
				side_effect=AssertionError("Queue forbidden"),
			)
		)
		self.start(
			patch(
				"frappe.core.doctype.communication.email._make",
				side_effect=AssertionError("Communication forbidden"),
			)
		)
		self.start(patch("frappe.share.add", side_effect=AssertionError("Share forbidden")))

	def setting(self, doctype, field):
		self.assertEqual(doctype, "Website Settings")
		return {"banner_image": self.logo, "app_name": self.brand}[field]

	def value(self, doctype, name, fields, **kwargs):
		if doctype == "User":
			return frappe._dict(full_name=self.member_name) if kwargs.get("as_dict") else "René Fictional"
		if doctype == "LMS Course":
			return frappe._dict(title=self.title, name="FICTIONAL-COURSE", image=None)
		if doctype == "LMS Certificate" and fields == "template":
			return self.doc.template
		self.fail(f"Unexpected read: {doctype}/{fields}")

	def get_all(self, doctype, *args, **kwargs):
		if doctype == "Course Instructor":
			return self.instructors
		if doctype == "Web Form":
			return []
		self.fail("Unexpected list read")

	def capture(self, **kwargs):
		self.fail("Email forbidden")

	def html(self, language="fr", print_format=None):
		with print_language(language):
			return printview.get_rendered_template(
				self.doc,
				print_format=self.format if print_format is None else print_format,
				meta=self.meta,
				no_letterhead=1,
			)

	def test_french_clause_no_english_on(self):
		html = self.html()
		self.assertIn("y compris toutes les évaluations requises", html)
		self.assertIn("le 17 mai 2027", html)
		self.assertNotIn(" on ", html)
		self.assertNotIn("has successfully", html)

	def test_english_source_and_french_accents(self):
		html = self.html("en")
		self.assertIn("has successfully completed the course", html)
		self.assertIn("including all required assessments", html)
		self.assertIn("May 17, 2027", html)
		self.assertIn("Élodie &amp; Noël", html)
		self.assertIn("Écologie &amp; océans", html)
		self.assertEqual(html.encode().decode(), html)

	def test_html_and_attribute_escaping(self):
		self.member_name = self.title = self.brand = '<img src=x> & "Fictional"'
		self.doc.evaluator = "FICTIONAL-EVALUATOR"
		self.doc.evaluator_name = "<script>fictional()</script>"
		self.logo = '/files/logo" onerror="fictional()'
		html = self.html()
		self.assertNotIn("<script>", html)
		self.assertIn("&lt;img", html)
		self.assertIn("&#34; onerror=&#34;", html)
		self.assertNotIn('src="/files/logo" onerror=', html)

	def test_logo_optional_evaluator_or_instructors(self):
		for logo in [None, "/files/fictional-logo.png"]:
			self.logo = logo
			for count in [1, 2]:
				self.instructors = ["FICTIONAL-INSTRUCTOR"] * count
				html = self.html()
				self.assertIn(self.brand, html)
				self.assertIn("René Fictional", html)
				self.assertEqual('class="certificate-logo"' in html, bool(logo))
		self.doc.evaluator = "FICTIONAL-EVALUATOR"
		self.doc.evaluator_name = "Éva Fictional"
		html = self.html()
		self.assertIn("Éva Fictional", html)
		self.assertNotIn("René Fictional", html)

	def test_missing_translation_english_fallback(self):
		self.french.pop(CLAUSE, None)
		self.assertIn("has successfully completed the course", self.html())

	def test_date_civil_expiry_not_displayed_or_modified(self):
		self.doc.issue_date = "2027-03-28"
		for expiry in [None, "2028-01-01"]:
			self.doc.expiry_date = expiry
			for lang in ["fr", "en"]:
				html = self.html(lang)
				with print_language(lang):
					self.assertIn(format_date("2027-03-28", "medium"), html)
				self.assertNotIn("2028", html)
				self.assertEqual(self.doc.issue_date, "2027-03-28")
				self.assertEqual(self.doc.expiry_date, expiry)

	def test_custom_format_native_resolution_and_literals(self):
		custom = frappe._dict(self.format)
		custom.update(
			name="Fictional Custom",
			html="<p>Author literal {{ doc.name | e }}</p>",
			default_print_language="en",
		)
		self.get_doc.side_effect = (
			lambda doctype, name: custom
			if (doctype, name) == ("Print Format", "Fictional Custom")
			else self.fail("Unexpected document")
		)
		resolved = printview.get_print_format_doc("Fictional Custom", self.meta)
		self.assertIs(resolved, custom)
		for language in ["fr", "en", None]:
			custom.default_print_language = language
			self.assertIn("Author literal FICTIONAL-CERT", self.html("fr", custom))
			self.assertNotIn("has successfully", self.html("en", custom))

	def test_native_download_language_and_response_without_binary_pdf(self):
		# Exercise native endpoint/permission/context; only the PDF boundary returns
		# a sentinel, never a PDF converter or real document.
		def boundary(*args, **kwargs):
			self.assertTrue(kwargs["as_pdf"])
			self.assertIs(kwargs["doc"], self.doc)
			self.assertEqual(args, ("LMS Certificate", "FICTIONAL-CERT", "Certificate"))
			self.assertEqual(kwargs["no_letterhead"], 1)
			return self.html(None).encode()

		with patch.object(frappe, "get_print", side_effect=boundary):
			for current, requested, expected in [
				("en", "fr", "y compris"),
				("fr", "en", "including"),
				("fr", None, "y compris"),
				("en", None, "including"),
			]:
				frappe.local.lang = current
				pdf_endpoint.download_pdf(
					"LMS Certificate",
					self.doc.name,
					"Certificate",
					doc=self.doc,
					no_letterhead=1,
					language=requested,
				)
				self.assertIn(expected, frappe.local.response.filecontent.decode())
				self.assertEqual(frappe.local.response.type, "pdf")
				self.assertEqual(frappe.local.response.filename, "FICTIONAL-CERT.pdf")
				self.assertEqual(frappe.local.lang, current)
		self.assertEqual(self.format.default_print_language, "en")

	def test_download_exception_restores_language(self):
		frappe.local.lang = "de"
		with patch.object(frappe, "get_print", side_effect=RuntimeError("Fictional render failure")):
			with self.assertRaises(RuntimeError):
				pdf_endpoint.download_pdf(
					"LMS Certificate", self.doc.name, "Certificate", doc=self.doc, language="fr"
				)
		self.assertEqual(frappe.local.lang, "de")

	def test_native_permissions_private_owner_public_guest(self):
		for user, published, allowed in [
			(self.doc.member, 0, True),
			("fictional-other@example.com", 0, False),
			("Guest", 0, False),
			("Guest", 1, True),
			("fictional-other@example.com", 1, True),
		]:
			self.doc.published = published
			frappe.session.user = user
			if allowed:
				printview.validate_print_permission(self.doc)
			else:
				with self.assertRaises(frappe.PermissionError):
					printview.validate_print_permission(self.doc)
		self.db.set_value.assert_not_called()

	def test_lms_redirect_parameters_and_no_language_forcing(self):
		frappe.local.form_dict.certificate_id = self.doc.name
		with self.assertRaises(frappe.Redirect):
			certificate_page.get_context(frappe._dict())
		params = parse_qs(urlsplit(frappe.local.flags.redirect_location).query)
		self.assertEqual(
			params,
			{
				"doctype": ["LMS Certificate"],
				"name": [self.doc.name],
				"format": ["Certificate"],
				"no_letterhead": ["1"],
			},
		)

	def test_native_multi_print_priority_differs_from_download(self):
		from frappe.utils import print_utils

		for format_language, requested, expected in [
			("en", "fr", "en"),
			("fr", "en", "fr"),
			(None, "fr", "fr"),
			(None, None, "de"),
		]:
			frappe.local.lang = "de"
			observed = []

			def stop_before_pdf(*args, **kwargs):
				observed.append(frappe.local.lang)
				raise frappe.PermissionError("Fictional stop before PDF")

			with (
				patch.object(self.db, "get_value", return_value=format_language),
				patch.object(self.meta, "has_field", return_value=False, create=True),
				patch.object(print_utils, "_print_format_doc_or_none", return_value=self.format),
				patch(
					"frappe.printing.doctype.print_format.classic_converter.uses_beta_renderer",
					return_value=False,
				),
				patch.object(frappe, "get_print", side_effect=stop_before_pdf),
				patch("pypdf.PdfWriter"),
			):
				with self.assertRaises(frappe.PermissionError):
					pdf_endpoint._download_multi_pdf(
						"LMS Certificate", [self.doc.name], format="Certificate", language=requested
					)
			self.assertEqual(observed, [expected])
			self.assertEqual(frappe.local.lang, "de")

	def test_native_download_refusal_never_reaches_pdf(self):
		frappe.session.user = "Guest"
		self.doc.published = 0
		with patch.object(frappe, "get_print") as render:
			with self.assertRaises(frappe.PermissionError):
				pdf_endpoint.download_pdf("LMS Certificate", self.doc.name, "Certificate", doc=self.doc)
			render.assert_not_called()

	def test_standard_include_avoids_runtime_file_override(self):
		self.assertEqual(self.format.html, "{% include 'templates/print_formats/certificate.html' %}")
		self.assertFalse((FORMAT.parent / "certificate.html").exists())
		self.assertEqual(printview.get_print_format("LMS Certificate", self.format), self.format.html)
		before = copy.deepcopy(
			{
				k: self.doc[k]
				for k in ["member", "course", "issue_date", "expiry_date", "published", "template"]
			}
		)
		for language in ["fr", "en"]:
			self.html(language)
		self.assertEqual(before, {k: self.doc[k] for k in before})
		self.sendmail.assert_not_called()
		self.db.set_value.assert_not_called()

	def test_standard_landscape_paper_and_minimal_spacing(self):
		from frappe.printing.doctype.print_format.print_format import PrintFormat
		from frappe.utils.pdf_generator.browser import Browser

		self.assertEqual(self.format.paper_size, "Custom")
		self.assertEqual((self.format.paper_width, self.format.paper_height), (297, 210))
		PrintFormat.validate_paper_size(self.format)
		browser = Browser.__new__(Browser)
		browser.print_format = self.format.name
		browser.options = {}
		with (
			patch.object(self.db, "exists", return_value=True),
			patch.object(frappe, "get_cached_value", return_value=["Custom", 297, 210]),
		):
			browser._set_page_size_from_print_format()
		self.assertEqual(browser.options, {"page-width": "297mm", "page-height": "210mm"})
		template = (ROOT / "templates/print_formats/certificate.html").read_text()
		self.assertIn('style="margin-bottom: 12rem;"', template)
		self.assertIn('style="margin-bottom: 11rem; width: 70%;"', template)
		self.assertNotIn("margin-bottom: 13rem", template)
		self.assertEqual(self.format.default_print_language, "en")

	def test_long_french_english_content_and_custom_spacing_isolation(self):
		self.member_name = "Élodie-Anaïs d’Arcy de la Vallée & Noël « Apprenant fictif au nom particulièrement long »"
		self.title = "Écologie des océans, sécurité & coopération internationale : parcours approfondi d’évaluation des pratiques professionnelles et pédagogiques — module fictif avancé"
		self.instructors = ["FICTIONAL-INSTRUCTOR"] * 3
		custom = frappe._dict(self.format, name="Fictional Custom", html="Author literal {{ doc.name | e }}")
		before = copy.deepcopy(custom)
		for language, clause in [
			("fr", "y compris toutes les évaluations requises"),
			("en", "including all required assessments"),
		]:
			html = self.html(language)
			self.assertIn(clause, html)
			self.assertEqual(html.count("René Fictional"), 3)
			self.assertIn("Élodie-Anaïs", html)
			self.assertIn("pédagogiques", html)
			self.assertIn("Author literal FICTIONAL-CERT", self.html(language, custom))
		self.assertEqual(before, custom)
		self.db.set_value.assert_not_called()
		self.sendmail.assert_not_called()

	def test_native_plutoprint_long_french_english_single_page_without_site(self):
		"""Real optional converter; fake reads only. Installed-site recipe is separate."""
		import importlib.util
		import io
		import unicodedata

		from frappe.utils import pdf as pdf_module
		from frappe.utils.pdf_generator import browser, pluto
		from pypdf import PdfReader

		if importlib.util.find_spec("plutoprint") is None:
			self.skipTest("PlutoPrint is not installed; no download permitted")
		bundles = list((Path(frappe.__file__).parent / "public/dist/css").glob("print.bundle.*.css"))
		if len(bundles) != 1:
			self.skipTest("One local native print CSS bundle is required; no build/download")
		self.logo = None
		self.member_name = "Élodie-Anaïs d’Arcy de la Vallée & Noël « Apprenant fictif au nom particulièrement long »"
		self.title = "Écologie des océans, sécurité & coopération internationale : parcours approfondi d’évaluation des pratiques professionnelles et pédagogiques — module fictif avancé"
		self.instructors = ["FICTIONAL-INSTRUCTOR"] * 3
		# Native standard print typography matters to pagination; compiled CSS alone
		# does not reproduce the printview wrapper/style.
		frappe.get_jenv().loader.searchpath.append(str(Path(frappe.__file__).parent))
		with (
			patch.object(frappe, "get_cached_doc", return_value=frappe._dict(font_size=14)),
			patch.object(printview, "resolve_pdf_generator", return_value="PlutoPrint"),
		):
			css = bundles[0].read_text() + printview.get_print_style(print_format=self.format)
		# Use the native format-field resolver rather than a Landscape URL/option.
		paper = browser.Browser.__new__(browser.Browser)
		paper.print_format = self.format.name
		paper.options = {}
		with (
			patch.object(self.db, "exists", return_value=True),
			patch.object(
				frappe,
				"get_cached_value",
				return_value=[self.format.paper_size, self.format.paper_width, self.format.paper_height],
			),
		):
			paper._set_page_size_from_print_format()
		for language in ["fr", "en"]:
			html = (
				"<html><head><style>"
				+ css
				+ '</style></head><body><div class="print-format">'
				+ self.html(language)
				+ "</div></body></html>"
			)
			with (
				patch.object(frappe, "conf", frappe._dict(developer_mode=0), create=True),
				patch.object(frappe, "get_cached_value", return_value=0),
				patch.object(self.db, "get_single_value", return_value="A4"),
				patch.object(pdf_module, "get_host_url", return_value="http://certificate.invalid/"),
				patch.object(browser, "get_host_url", return_value="http://certificate.invalid/"),
				patch.object(pluto, "get_host_url", return_value="http://certificate.invalid/"),
			):
				binary = pdf_module.get_pdf(
					html,
					{**paper.options, "block-external-requests": True},
					pdf_generator="PlutoPrint",
				)
			self.assertTrue(binary.startswith(b"%PDF-"))
			reader = PdfReader(io.BytesIO(binary), strict=True)
			self.assertEqual(len(reader.pages), 1)
			self.assertAlmostEqual(float(reader.pages[0].mediabox.width), 841.89, delta=0.1)
			self.assertAlmostEqual(float(reader.pages[0].mediabox.height), 595.30, delta=0.1)
			text = unicodedata.normalize("NFKC", reader.pages[0].extract_text())
			self.assertIn("Élodie-Anaïs", text)
			self.assertIn("pédagogiques", text)
			self.assertEqual(text.count("René Fictional"), 3)
		self.db.sql.assert_not_called()
		self.db.insert.assert_not_called()
		self.sendmail.assert_not_called()
