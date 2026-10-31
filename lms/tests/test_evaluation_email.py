"""Isolated booking emails and diagnostic-only standard reminder checks.

No site, scheduler, reservation, Communication, queue, calendar or SMTP operation.
"""

import copy
import json
import unittest
from datetime import date, datetime, time
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
from zoneinfo import ZoneInfo

import frappe
from babel.messages.extract import pathmatch
from frappe.email.doctype.email_queue.email_queue import QueueBuilder
from frappe.email.doctype.notification.notification import Notification
from frappe.translate import print_language
from frappe.utils import format_date, format_time
from frappe.utils.jinja import get_email_from_template

from lms.lms.doctype.lms_certificate_request.lms_certificate_request import LMSCertificateRequest
from lms.lms.utils import convert_from_system_timezone, format_timezone
from lms.tests import test_certification_email as certification_fixture

ROOT = Path(__file__).resolve().parents[1]
RULE = ROOT / "lms/notification/certificate_request_reminder/certificate_request_reminder.json"
SUBJECT = "Your evaluation slot has been booked"


class FictionalRequest(frappe._dict):
	def as_dict(self):
		return dict(self)


class FictionalNotification(frappe._dict):
	send_an_email = Notification.send_an_email
	get_list_of_recipients = Notification.get_list_of_recipients
	get_email_template_content = Notification.get_email_template_content

	def get_attachment(self, doc):
		return []


class TestEvaluationEmail(unittest.TestCase):
	# Reuse the B.1 no-site fixture, without inheriting/re-running its tests.
	start = certification_fixture.TestCertificationEmail.start
	clear_context = certification_fixture.TestCertificationEmail.clear_context
	setting = certification_fixture.TestCertificationEmail.setting

	def setUp(self):
		certification_fixture.TestCertificationEmail.setUp(self)
		self.outgoing = True
		self.system_zone = "Asia/Kolkata"
		self.display_zone = "America/Los_Angeles"
		self.languages["fictional-evaluator@example.com"] = "en"
		self.start(patch.object(frappe, "conf", frappe._dict(mail_login=False)))
		frappe.get_system_settings.side_effect = (
			lambda key: self.system_zone if key == "time_zone" else self.system_language
		)
		self.request = FictionalRequest(
			doctype="LMS Certificate Request",
			name="FICTIONAL-REQUEST",
			member="fictional-fr@example.com",
			evaluator="fictional-evaluator@example.com",
			member_name="Élodie Fictional",
			evaluator_name="Fictional Evaluator",
			course="FICTIONAL-COURSE",
			course_title="Écologie & océans",
			batch_name="FICTIONAL-BATCH",
			date=date(2027, 5, 17),
			start_time=time(9),
			timezone=self.system_zone,
			status="Upcoming",
			owner="fictional-fr@example.com",
			meta=frappe._dict(istable=0),
		)
		self.start(patch("frappe.utils.safe_exec.render_safe_globals", return_value=self.globals()))
		self.start(patch("frappe.utils.safe_exec.get_safe_globals", return_value=self.globals()))
		self.start(patch("socket.create_connection", side_effect=AssertionError("Network forbidden")))
		self.start(
			patch.object(frappe, "connect", side_effect=AssertionError("Database connection forbidden"))
		)
		self.communication = self.start(
			patch(
				"frappe.core.doctype.communication.email._make",
				return_value={"name": "FICTIONAL-COMMUNICATION"},
			)
		)
		self.lazy_doc = self.start(patch.object(frappe, "get_lazy_doc", return_value=Mock()))
		self.queue = self.start(
			patch(
				"frappe.email.doctype.email_queue.email_queue.EmailQueue.new",
				side_effect=AssertionError("Queue creation forbidden"),
			)
		)
		self.start(
			patch(
				"frappe.desk.doctype.notification_log.notification_log.enqueue_create_notification",
				side_effect=AssertionError("Notification forbidden"),
			)
		)

		self.start(
			patch(
				"frappe.email.doctype.notification.notification.enqueue_create_notification",
				side_effect=AssertionError("Notification Log forbidden"),
			)
		)

	def globals(self):
		return {
			"_": frappe._,
			"frappe": {
				"bold": frappe.bold,
				"utils": {"format_date": format_date, "format_time": format_time},
			},
		}

	def user_language(self, doctype, user, field):
		if doctype == "Email Account":
			self.assertEqual((user, field), ({"default_outgoing": 1, "enable_outgoing": 1}, "name"))
			return "FICTIONAL-OUTGOING" if self.outgoing else None
		return certification_fixture.TestCertificationEmail.user_language(self, doctype, user, field)

	def value(self, doctype, name, field, **kwargs):
		if (doctype, name, field) == ("LMS Batch", "FICTIONAL-BATCH", "timezone"):
			return self.display_zone
		if doctype == "LMS Course" and field == ["paid_certificate", "timezone"]:
			return frappe._dict(paid_certificate=True, timezone=self.display_zone)
		raise AssertionError("Unexpected database read")

	def capture(self, **kwargs):
		body = (
			get_email_from_template(kwargs["template"], kwargs["args"])[0]
			if kwargs.get("template")
			else kwargs["message"]
		)
		self.messages.append({**copy.deepcopy(kwargs), "body": body, "lang": frappe.local.lang})

	def booking(self, member="fictional-fr@example.com"):
		self.request.member = member
		LMSCertificateRequest.send_notification(self.request)
		return self.messages[-1] if self.messages else None

	def notification(self):
		data = json.loads(RULE.read_text())
		data["recipients"] = [frappe._dict(r) for r in data["recipients"]]
		return FictionalNotification(data)

	def remind(self, lang):
		with print_language(lang):
			self.notification().send_an_email(self.request, {"doc": self.request})
		return self.messages[-1]

	def test_booking_french_and_english_subject_body(self):
		for member, lang, subject, text in [
			(
				"fictional-fr@example.com",
				"fr",
				"Votre créneau d’évaluation a été réservé",
				"Votre évaluateur est Fictional Evaluator",
			),
			("fictional-en@example.com", "en", SUBJECT, "Your evaluator is Fictional Evaluator"),
		]:
			with self.subTest(lang=lang):
				m = self.booking(member)
				self.assertEqual((m["lang"], m["subject"]), (lang, subject))
				self.assertIn(text, m["body"])
				self.assertEqual(m["recipients"], [member])
				self.assertEqual(m["cc"], [self.request.evaluator])
				self.assertEqual(m["retry"], 3)
				self.assertEqual(m["header"], [subject, "green"])
				self.assertEqual(frappe.local.lang, "en")
		self.assertEqual(self.sendmail.call_count, 2)

	def test_booking_mixed_languages_keeps_one_message_and_cc(self):
		for member, evaluator_language, expected in [
			("fictional-fr@example.com", "en", "fr"),
			("fictional-en@example.com", "fr", "en"),
			("fictional-fr@example.com", "fr", "fr"),
		]:
			self.languages[self.request.evaluator] = evaluator_language
			before = self.sendmail.call_count
			m = self.booking(member)
			self.assertEqual(m["lang"], expected)
			self.assertEqual(m["cc"], [self.request.evaluator])
			self.assertEqual(self.sendmail.call_count, before + 1)
			self.assertNotIn("bcc", m)

	def test_booking_missing_language_site_and_context_fallbacks(self):
		for system, current, expected in [
			("fr", "en", "fr"),
			("en", "fr", "en"),
			(None, "fr", "fr"),
			(None, None, "en"),
		]:
			with self.subTest(system=system, current=current):
				self.system_language = system
				frappe.local.lang = current
				self.assertEqual(self.booking("fictional-none@example.com")["lang"], expected)
				self.assertEqual(frappe.local.lang, current)

	def test_booking_timezone_native_conversion_preserves_instant(self):
		for system, display, stored_date, stored_time, expected_date, expected_time in [
			("UTC", "Europe/Paris", date(2027, 5, 17), time(10), date(2027, 5, 17), time(12)),
			("UTC", "Asia/Tokyo", date(2027, 5, 17), time(23, 45), date(2027, 5, 18), time(8, 45)),
			(
				"Asia/Kolkata",
				"America/Los_Angeles",
				date(2027, 5, 17),
				time(9),
				date(2027, 5, 16),
				time(20, 30),
			),
		]:
			with self.subTest(system=system, display=display):
				self.system_zone, self.display_zone = system, display
				self.request.date, self.request.start_time = stored_date, stored_time
				m = self.booking()
				with print_language("fr"):
					self.assertEqual(m["args"]["date"], format_date(expected_date, "medium"))
					self.assertEqual(m["args"]["start_time"], format_time(expected_time, "short"))
				self.assertEqual(
					m["args"]["timezone"],
					format_timezone(display, datetime.combine(expected_date, expected_time)),
				)
				self.assertEqual((self.request.date, self.request.start_time), (stored_date, stored_time))
				self.assertEqual(
					datetime.combine(stored_date, stored_time, tzinfo=ZoneInfo(system)).astimezone(
						ZoneInfo("UTC")
					),
					datetime.combine(expected_date, expected_time, tzinfo=ZoneInfo(display)).astimezone(
						ZoneInfo("UTC")
					),
				)

	def test_booking_legacy_timezone_optional_fields_and_html(self):
		self.display_zone = "Legacy Zone <script>fictional</script>"
		self.request.member_name = '<img src=x onerror="fictional">'
		self.request.course_title = "<script>fictional</script> & Cours"
		self.request.evaluator_name = "Fictional <b>Evaluator</b>"
		self.request.batch_name = None
		m = self.booking()
		for tag in ["<img", "<script>", "<b>Evaluator"]:
			self.assertNotIn(tag, m["body"])
		self.assertIn("&amp; Cours", m["body"])
		self.assertNotIn("href=", m["body"])
		self.assertNotIn("attachments", m)
		self.assertEqual(m["args"]["course"], self.request.course_title)

	def test_booking_no_outgoing_account_preserves_guard(self):
		self.outgoing = False
		self.assertIsNone(self.booking())
		self.sendmail.assert_not_called()
		frappe.conf.mail_login = True
		self.assertIsNotNone(self.booking())
		self.assertEqual(self.sendmail.call_count, 1)

	def test_booking_translation_fallback_and_restoration_on_error(self):
		self.french.pop(SUBJECT, None)
		self.assertEqual(self.booking()["subject"], SUBJECT)
		frappe.local.lang = "de"
		with patch("frappe.utils.jinja.get_template", side_effect=RuntimeError("Fictional render error")):
			with self.assertRaises(RuntimeError):
				self.booking()
		self.assertEqual(frappe.local.lang, "de")

	def test_booking_same_address_is_not_split_into_more_messages(self):
		self.request.evaluator = self.request.member
		m = self.booking()
		self.assertEqual(self.sendmail.call_count, 1)
		self.assertEqual(m["recipients"], m["cc"])
		# Native QueueBuilder performs exact envelope deduplication below.

	def test_reminder_exact_duplicates_are_deduplicated_by_native_rule(self):
		n = self.notification()
		self.assertEqual(len(n.recipients), 4)
		to, cc, bcc = n.get_list_of_recipients(self.request, {"doc": self.request})
		self.assertEqual(set(to), {self.request.member, self.request.evaluator})
		self.assertEqual((cc, bcc), ([], []))
		self.request.evaluator = self.request.member
		self.assertEqual(
			n.get_list_of_recipients(self.request, {"doc": self.request})[0], [self.request.member]
		)

	def test_native_queue_envelope_deduplication_without_queue_creation(self):
		# Call native processing only with every source/render/queue operation
		# substituted. EmailQueue.new is a capture, never the real constructor.
		builder = SimpleNamespace(
			final_recipients=lambda: ["fictional-fr@example.com"],
			final_cc=lambda: ["fictional-fr@example.com"],
			final_bcc=lambda: [],
			queue_separately=False,
			as_dict=lambda **kw: {"subject": "Fictional"},
		)
		self.queue.side_effect = None
		QueueBuilder.process(builder, send_now=False)
		self.assertEqual(self.queue.call_count, 1)
		self.assertEqual(self.queue.call_args.args[0]["recipients"], ["fictional-fr@example.com"])

	def test_reminder_diagnostic_single_render_subject_stays_english(self):
		for lang in ["fr", "en"]:
			m = self.remind(lang)
			self.assertEqual(m["subject"], "Reminder for Certificate Evaluation")
			self.assertEqual(set(m["recipients"]), {self.request.member, self.request.evaluator})
			self.assertEqual(m["lang"], lang)
			self.assertIn("Votre évaluation" if lang == "fr" else "Your evaluation", m["body"])
		self.assertEqual(self.communication.call_count, 2)  # fully mocked
		self.assertEqual(self.queue.call_count, 0)

	def test_reminder_diagnostic_same_instant_different_display_zone(self):
		booking = self.booking()
		reminder = self.remind("fr")
		self.assertIn("16 mai 2027", booking["body"])
		self.assertIn("20:30", booking["body"])
		self.assertIn("17 mai 2027", reminder["body"])
		self.assertIn("09:00", reminder["body"])
		self.assertIn("Asia/Kolkata", reminder["body"])
		self.assertNotIn("America/Los_Angeles", reminder["body"])

	def test_reminder_missing_people_produces_no_send(self):
		self.request.member = None
		self.request.evaluator = None
		with print_language("fr"):
			self.notification().send_an_email(self.request, {"doc": self.request})
		self.sendmail.assert_not_called()
		self.communication.assert_not_called()

	def test_reminder_native_render_precedes_recipients_and_custom_template_uses_context(self):
		events = []
		render = frappe.render_template

		def observed(template, context, **kwargs):
			events.append("render")
			return render(template, context, **kwargs)

		def recipients(rule, doc, context):
			events.append("recipients")
			return Notification.get_list_of_recipients(rule, doc, context)

		with (
			patch.object(frappe, "render_template", side_effect=observed),
			patch.object(FictionalNotification, "get_list_of_recipients", new=recipients),
		):
			self.remind("fr")
		self.assertEqual(events, ["render", "recipients"])  # plain subject is not rendered
		n = self.notification()
		n.email_template = "FICTIONAL-CUSTOM"
		template = certification_fixture.FictionalEmailTemplate(
			subject='{{ _("Your evaluation slot has been booked") }}',
			response="<p>Custom {{ member_name | e }}</p>",
			use_html=0,
		)
		with patch.object(frappe, "get_cached_doc", return_value=template):
			with print_language("fr"):
				n.send_an_email(self.request, {"doc": self.request})
		self.assertEqual(self.messages[-1]["subject"], "Votre créneau d’évaluation a été réservé")
		self.assertIn("Custom Élodie Fictional", self.messages[-1]["body"])
		self.assertIsNone(n.get("set_property_after_alert"))

	def test_notification_json_subject_has_no_native_mapping(self):
		from frappe.gettext.translate import get_method_map

		with patch.object(
			frappe,
			"get_app_path",
			side_effect=lambda app: str(
				ROOT if app == "lms" else Path("/workspace/frappe-bench/apps/frappe/frappe")
			),
		):
			rules = get_method_map("lms") + get_method_map("frappe")
		path = RULE.relative_to(ROOT.parent).as_posix()
		self.assertFalse(any(pathmatch(pattern, path) for pattern, method in rules))
		self.assertEqual(self.notification().subject, "Reminder for Certificate Evaluation")


if __name__ == "__main__":
	unittest.main()
