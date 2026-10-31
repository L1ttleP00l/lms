"""Native Notification hook, previews and dispatch with all side effects replaced."""

import copy
import json
import unittest
from datetime import date, datetime, time
from unittest.mock import patch
from zoneinfo import ZoneInfo

import frappe
from frappe.email.doctype.notification.notification import Notification
from frappe.translate import print_language

from lms.lms.notification.certificate_request_reminder import certificate_request_reminder as reminder
from lms.tests import test_certification_email as certification_fixture
from lms.tests import test_evaluation_email as evaluation_fixture

RULE = evaluation_fixture.RULE


class NativeReminder(evaluation_fixture.FictionalNotification):
	send = Notification.send
	send_notification_by_channel = Notification.send_notification_by_channel
	load_standard_properties = Notification.load_standard_properties
	get_template = Notification.get_template
	preview_subject = Notification.preview_subject
	preview_message = Notification.preview_message

	def log_error(self, message):
		raise AssertionError(message)


class TestReminderEmail(unittest.TestCase):
	start = evaluation_fixture.TestEvaluationEmail.start
	clear_context = evaluation_fixture.TestEvaluationEmail.clear_context
	setting = evaluation_fixture.TestEvaluationEmail.setting
	globals = evaluation_fixture.TestEvaluationEmail.globals
	user_language = evaluation_fixture.TestEvaluationEmail.user_language
	value = evaluation_fixture.TestEvaluationEmail.value
	capture = evaluation_fixture.TestEvaluationEmail.capture
	booking = evaluation_fixture.TestEvaluationEmail.booking

	def setUp(self):
		evaluation_fixture.TestEvaluationEmail.setUp(self)
		self.start(
			patch("frappe.email.doctype.notification.notification.get_doc_module", return_value=reminder)
		)
		self.start(
			patch(
				"frappe.email.doctype.notification.notification.get_safe_globals", return_value=self.globals()
			)
		)
		self.start(
			patch("frappe.email.doctype.notification.notification.get_comments_for_context", return_value=[])
		)
		self.custom_email = None

		def cached_doc(doctype, name):
			if (doctype, name) == (self.request.doctype, self.request.name):
				return self.request
			if (doctype, name) == ("Email Template", "FICTIONAL-CUSTOM"):
				return self.custom_email
			raise AssertionError("Unexpected document lookup")

		self.start(patch.object(frappe, "get_cached_doc", side_effect=cached_doc))

	def rule(self):
		data = json.loads(RULE.read_text())
		data["recipients"] = [frappe._dict(r) for r in data["recipients"]]
		return NativeReminder(data)

	def send(self):
		before = self.sendmail.call_count
		self.rule().send(self.request)
		self.assertEqual(self.sendmail.call_count, before + 1)
		return self.messages[-1]

	def test_french_subject_body_and_native_previews(self):
		frappe.local.lang = "en"
		rule = self.rule()
		self.assertEqual(
			rule.preview_subject(self.request.name), "Rappel pour votre évaluation de certification"
		)
		preview = rule.preview_message(self.request.name)
		m = self.send()
		self.assertEqual(m["subject"], "Rappel pour votre évaluation de certification")
		self.assertEqual(m["body"], preview)
		for text in ["Bonjour Élodie Fictional", "Votre évaluation", "Fictional Evaluator", "Veuillez"]:
			self.assertIn(text, m["body"])
		self.assertNotIn("is your evaluator", m["body"])
		self.assertEqual(frappe.local.lang, "en")

	def test_member_language_mixed_and_same_language_never_splits_messages(self):
		for member, evaluator_lang, expected in [
			("fictional-fr@example.com", "en", "fr"),
			("fictional-en@example.com", "fr", "en"),
			("fictional-fr@example.com", "fr", "fr"),
		]:
			with self.subTest(member=member, evaluator=evaluator_lang):
				self.request.member = member
				self.languages[self.request.evaluator] = evaluator_lang
				frappe.local.lang = "de"
				m = self.send()
				self.assertEqual(
					m["subject"],
					"Rappel pour votre évaluation de certification"
					if expected == "fr"
					else "Reminder for Certificate Evaluation",
				)
				self.assertIn("Votre évaluation" if expected == "fr" else "Your evaluation", m["body"])
				self.assertEqual(set(m["recipients"]), {member, self.request.evaluator})
				self.assertEqual((m["cc"], m["bcc"]), ([], []))
				self.assertEqual(frappe.local.lang, "de")

	def test_native_missing_preference_and_source_fallback(self):
		self.request.member = "fictional-none@example.com"
		for system, current, expected in [
			("fr", "en", "fr"),
			("en", "fr", "en"),
			(None, "fr", "fr"),
			(None, None, "en"),
		]:
			with self.subTest(system=system, current=current):
				self.system_language = system
				frappe.local.lang = current
				m = self.send()
				self.assertEqual(
					m["subject"],
					"Rappel pour votre évaluation de certification"
					if expected == "fr"
					else "Reminder for Certificate Evaluation",
				)
				self.assertEqual(frappe.local.lang, current)
		self.request.member = "fictional-fr@example.com"
		self.french.pop("Reminder for Certificate Evaluation", None)
		self.assertEqual(self.send()["subject"], "Reminder for Certificate Evaluation")

	def test_same_address_native_dedup_and_rule_invariants(self):
		self.request.evaluator = self.request.member
		self.assertEqual(self.send()["recipients"], [self.request.member])
		data = self.rule()
		self.assertEqual(len(data.recipients), 4)
		self.assertEqual(
			(
				data.name,
				data.document_type,
				data.event,
				data.date_changed,
				data.days_in_advance,
				data.condition,
				data.enabled,
				data.attach_print,
				data.channel,
			),
			(
				"Certificate Request Reminder",
				"LMS Certificate Request",
				"Days Before",
				"date",
				1,
				'doc.status == "Upcoming"',
				1,
				0,
				"Email",
			),
		)
		self.queue.assert_not_called()

	def test_time_presentation_matches_confirmation_including_dst(self):
		for system, display, day, hour in [
			("UTC", "Europe/Paris", date(2027, 5, 17), time(10)),
			("UTC", "Asia/Tokyo", date(2027, 5, 17), time(23, 45)),
			("Asia/Kolkata", "America/Los_Angeles", date(2027, 5, 17), time(9)),
			("UTC", "Europe/Paris", date(2027, 3, 28), time(0, 30)),
			("UTC", "Europe/Paris", date(2027, 3, 28), time(1, 30)),
		]:
			for member in ["fictional-fr@example.com", "fictional-en@example.com"]:
				with self.subTest(system=system, display=display, day=day, hour=hour, member=member):
					self.system_zone, self.display_zone = system, display
					self.request.member = member
					self.request.date, self.request.start_time = day, hour
					self.request.end_time = time(23, 59)
					self.request.timezone = system
					before = {k: self.request[k] for k in ["date", "start_time", "end_time", "timezone"]}
					confirmation = self.booking(member)
					m = self.send()
					for k in ["date", "start_time", "timezone"]:
						self.assertIn(confirmation["args"][k], m["body"])
					self.assertEqual(before, {k: self.request[k] for k in before})
					# Native context exposes plain presentation text and the converted
					# datetime is independently checked against the same UTC instant.
					from lms.lms.utils import convert_from_system_timezone

					d, t = convert_from_system_timezone(day, hour, display)
					self.assertEqual(
						datetime.combine(d, t, tzinfo=ZoneInfo(display)).astimezone(ZoneInfo("UTC")),
						datetime.combine(day, hour, tzinfo=ZoneInfo(system)).astimezone(ZoneInfo("UTC")),
					)
					if day == date(2027, 3, 28):
						self.assertIn("GMT+1:00" if hour == time(0, 30) else "GMT+2:00", m["body"])

	def test_html_legacy_zone_and_restoration_after_hook_exception(self):
		self.request.member_name = "<script>Fictional</script>"
		self.request.course_title = "Cours <img src=x> & Écologie"
		self.request.evaluator_name = "<b>Fictional Evaluator</b>"
		self.display_zone = "Legacy <img src=x>"
		m = self.send()
		for tag in ["<script>", "<img", "<b>"]:
			self.assertNotIn(tag, m["body"])
		self.assertIn("&amp; Écologie", m["body"])
		self.assertIn("09:00", m["body"])
		self.assertIn("Legacy &lt;img", m["body"])
		self.assertNotIn("href=", m["body"])
		self.assertFalse(m["attachments"])
		frappe.local.lang = "de"
		with patch.object(reminder, "format_date", side_effect=RuntimeError("Fictional formatting error")):
			with self.assertRaises(RuntimeError):
				self.rule().send(self.request)
		self.assertEqual(frappe.local.lang, "de")

	def test_native_python_extraction_and_json_template_consistency(self):
		from babel.messages.extract import extract

		with open(reminder.__file__, "rb") as stream:
			messages = list(extract("frappe.gettext.extractors.python.extract", stream, keywords={"_": None}))
		self.assertIn("Reminder for Certificate Evaluation", [m[1] for m in messages])
		self.assertIn("{0} is your evaluator", [m[1] for m in messages])
		self.assertEqual(self.rule().message, RULE.with_suffix(".html").read_text())
		self.assertNotIn("|safe", self.rule().message)

	def test_context_restored_after_native_jinja_preview_error(self):
		frappe.local.lang = "de"
		with patch.object(frappe, "render_template", side_effect=RuntimeError("Fictional Jinja error")):
			text = self.rule().preview_message(self.request.name)
		self.assertIn("Failed to render message", text)
		self.assertEqual(frappe.local.lang, "de")

	def test_custom_template_priority_and_non_standard_notification(self):
		self.custom_email = certification_fixture.FictionalEmailTemplate(
			subject="Authored literal subject", response="<p>Authored {{ member_name | e }}</p>", use_html=0
		)
		rule = self.rule()
		rule.email_template = "FICTIONAL-CUSTOM"
		frappe.local.lang = "en"
		with patch.object(
			reminder, "get_user_lang", side_effect=AssertionError("Custom override must not force language")
		):
			self.assertEqual(rule.preview_subject(self.request.name), "Authored literal subject")
			rule.send(self.request)
		self.assertEqual(self.messages[-1]["subject"], "Authored literal subject")
		self.assertIn("Authored Élodie Fictional", self.messages[-1]["body"])
		self.assertEqual(frappe.local.lang, "en")
		rule = self.rule()
		rule.is_standard = 0
		rule.subject = "Authored nonstandard subject"
		rule.message = "<p>Authored {{ doc.member_name | e }}</p>"
		with patch.object(
			reminder, "get_context", side_effect=AssertionError("Nonstandard must bypass hook")
		):
			rule.send(self.request)
		self.assertEqual(self.messages[-1]["subject"], "Authored nonstandard subject")
		self.assertEqual(frappe.local.lang, "en")


if __name__ == "__main__":
	unittest.main()
