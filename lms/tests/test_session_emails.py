"""Session emails, native Jinja with all transport and database boundaries isolated."""

import copy
import re
import socket
import unittest
from unittest.mock import patch

import frappe
from frappe.utils import format_date, format_time
from frappe.utils.jinja import get_email_from_template

from lms.lms.doctype.lms_batch import lms_batch as batches
from lms.lms.doctype.lms_batch_enrollment import lms_batch_enrollment as enrollments
from lms.lms.doctype.lms_live_class import lms_live_class as classes
from lms.lms.utils import get_lms_route
from lms.tests import test_certification_email as fixture
from lms.tests.test_certification_email import FictionalEmailTemplate


class TestSessionEmails(unittest.TestCase):
	start = fixture.TestCertificationEmail.start
	clear_context = fixture.TestCertificationEmail.clear_context
	user_language = fixture.TestCertificationEmail.user_language

	def setUp(self):
		fixture.TestCertificationEmail.setUp(self)
		self.batch = frappe._dict(
			name="FICTIONAL-BATCH",
			title="Océans & horizons",
			start_date="2027-03-28",
			start_time="23:45:00",
			medium="Online",
			show_live_class=1,
			evaluation=1,
			evaluation_end_date="2027-04-30",
			confirmation_email_template=None,
		)
		self.live = frappe._dict(
			name="FICTIONAL-CLASS",
			batch_name=self.batch.name,
			title="Marées & littoral",
			date="2027-03-28",
			time="00:30:00",
		)
		self.student = frappe._dict(member="fictional-fr@example.com", member_name="Élodie & Fictional")
		self.enrollment = frappe._dict(
			doctype="LMS Batch Enrollment",
			name="FICTIONAL-ENROLLMENT",
			batch=self.batch.name,
			member=self.student.member,
			member_name=self.student.member_name,
			confirmation_email_sent=0,
		)
		self.start(patch("lms.lms.utils.get_lms_path", return_value="lms"))
		self.start(
			patch(
				"frappe.utils.safe_exec.get_safe_globals",
				return_value={
					"_": frappe._,
					"frappe": {"utils": {"format_date": format_date, "format_time": format_time}},
					"get_lms_route": get_lms_route,
				},
			)
		)
		for method in ["insert", "update", "commit", "rollback", "delete"]:
			getattr(self.db, method).side_effect = AssertionError("Database write forbidden")
		self.db.set_value.side_effect = AssertionError("Database write forbidden")
		self.start(patch.object(frappe, "connect", side_effect=AssertionError("Site connection forbidden")))
		self.start(patch.object(socket, "create_connection", side_effect=AssertionError("Network forbidden")))
		self.start(patch.object(socket.socket, "connect", side_effect=AssertionError("Network forbidden")))
		self.start(patch("smtplib.SMTP", side_effect=AssertionError("SMTP forbidden")))
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
		self.start(
			patch(
				"frappe.desk.doctype.notification_log.notification_log.enqueue_create_notification",
				side_effect=AssertionError("Notification Log forbidden"),
			)
		)

	def setting(self, doctype, field):
		self.assertEqual((doctype, field), ("LMS Settings", "batch_confirmation_template"))
		return self.custom

	def value(self, doctype, name, fields, **kwargs):
		self.assertEqual((doctype, name), ("LMS Batch", "FICTIONAL-BATCH"))
		self.assertEqual(
			fields, ["name", "title", "start_date", "start_time", "medium", "confirmation_email_template"]
		)
		return self.batch

	def capture(self, **kwargs):
		body = (
			get_email_from_template(kwargs["template"], kwargs["args"])[0]
			if kwargs["template"]
			else kwargs["content"]
		)
		self.messages.append({**copy.deepcopy(kwargs), "body": body, "lang": frappe.local.lang})

	def render(self, family, language="fr"):
		member = f"fictional-{language}@example.com"
		self.student.member = self.enrollment.member = member
		if family == "confirmation":
			enrollments.send_mail(self.enrollment)
		elif family == "class":
			classes.send_mail(self.live, self.student)
		else:
			self.batch.show_live_class = int(family == "live")
			batches.send_mail(self.batch, self.student)
		return self.messages[-1]

	def test_class_is_today_not_tomorrow(self):
		message = self.render("class", "en")
		self.assertIn("is today", message["subject"])
		self.assertIn("scheduled today.", message["body"])
		self.assertNotIn("tomorrow", message["body"])

	def test_four_families_french_and_english_independently(self):
		subjects = {
			"confirmation": ("Confirmation", "Enrollment Confirmation"),
			"live": ("demain", "starting tomorrow"),
			"recorded": ("rythme", "start whenever"),
			"class": ("aujourd’hui", "is today"),
		}
		for family, (fr_subject, en_subject) in subjects.items():
			with self.subTest(family=family):
				for language, subject in [("fr", fr_subject), ("en", en_subject)]:
					message = self.render(family, language)
					self.assertIn(subject, message["subject"])
					self.assertIn("Bonjour" if language == "fr" else "Hi", message["body"])
					self.assertEqual(message["lang"], language)
					self.assertEqual(message["recipients"], f"fictional-{language}@example.com")
					self.assertEqual(frappe.local.lang, "en")
					self.assertIn("Cordialement" if language == "fr" else "Best Regards", message["body"])
		self.assertEqual(len(self.messages), 8)
		self.db.set_value.assert_not_called()

	def test_no_preference_native_site_context_and_english_fallback(self):
		for family in ["confirmation", "live", "recorded", "class"]:
			for site, current, expected in [
				("fr", "en", "fr"),
				("en", "fr", "en"),
				(None, "fr", "fr"),
				(None, None, "en"),
			]:
				with self.subTest(family=family, site=site, current=current):
					self.system_language = site
					frappe.local.lang = current
					self.assertEqual(self.render(family, "unset")["lang"], expected)
					self.assertEqual(frappe.local.lang, current)

	def test_missing_translation_falls_back_to_source(self):
		self.french.pop("Your class on {0} is today", None)
		self.assertEqual(self.render("class")["subject"], "Your class on Marées & littoral is today")

	def test_language_restored_after_render_exception_each_family(self):
		self.sendmail.side_effect = RuntimeError("Fictional rendering failure")
		for family in ["confirmation", "live", "recorded", "class"]:
			frappe.local.lang = "de"
			with self.assertRaises(RuntimeError):
				self.render(family)
			self.assertEqual(frappe.local.lang, "de")

	def test_html_escaped_and_relative_links_preserved(self):
		self.student.member_name = self.enrollment.member_name = '<img src=x> & "Learner"'
		self.batch.title = self.live.title = '<script>alert(1)</script> & "Session"'
		self.batch.medium = '<img src=x> & "Mode"'
		for family in ["confirmation", "live", "recorded", "class"]:
			message = self.render(family)
			self.assertNotIn("<img", message["body"])
			self.assertNotIn("<script", message["body"])
			self.assertNotIn("<script", message["header"][0])
			self.assertIn("&lt;img", message["body"])
			self.assertIn('href="/lms/batches/FICTIONAL-BATCH"', message["body"])
			self.assertEqual(message["args"]["title"], self.batch.title)
		self.batch.name = self.live.batch_name = 'FICTIONAL-"quoted"&name'
		for family in ["confirmation", "live", "recorded", "class"]:
			self.assertIn(
				'href="/lms/batches/FICTIONAL-&#34;quoted&#34;&amp;name"', self.render(family)["body"]
			)

	def test_modalities_presentation_only_and_titles_not_translated(self):
		self.batch.title = "Online"
		for medium, french in [("Online", "En ligne"), ("Offline", "Hors ligne"), ("Legacy", "Legacy")]:
			self.batch.medium = medium
			for family in ["confirmation", "live", "recorded"]:
				message = self.render(family)
				self.assertIn(french, message["body"])
				self.assertEqual(message["args"]["medium"], medium)
				self.assertIn("Online", message["subject"])
		self.assertEqual(self.render("confirmation")["header"][0], "Online")

	def test_dates_times_midnight_dst_are_formatted_not_converted(self):
		for day, clock in [
			("2027-03-28", "00:30:00"),
			("2027-03-28", "02:30:00"),
			("2027-10-31", "23:45:00"),
		]:
			self.batch.start_date = self.live.date = day
			self.batch.start_time = self.live.time = clock
			for language in ["fr", "en"]:
				for family in ["confirmation", "live", "class"]:
					message = self.render(family, language)
					with frappe.translate.print_language(language):
						self.assertIn(
							format_date(day, "medium" if family == "confirmation" else "long"),
							message["body"],
						)
						self.assertIn(format_time(clock, "short"), message["body"])
					self.assertEqual(message["args"].get("date", message["args"].get("start_date")), day)
					self.assertEqual(message["args"].get("time", message["args"].get("start_time")), clock)
				recorded = self.render("recorded", language)
				with frappe.translate.print_language(language):
					self.assertIn(format_date(self.batch.evaluation_end_date, "long"), recorded["body"])

	def test_optional_evaluation_and_deadline_and_medium(self):
		for language in ["fr", "en"]:
			for evaluation, deadline in [(0, None), (1, None), (1, "2027-04-30")]:
				self.batch.evaluation, self.batch.evaluation_end_date = evaluation, deadline
				body = self.render("recorded", language)["body"]
				self.assertEqual(
					("get certified" if language == "en" else "obtenir votre certification") in body,
					bool(evaluation),
				)
				self.assertEqual(
					("last day" if language == "en" else "date limite") in body, bool(evaluation and deadline)
				)
		self.batch.medium = None
		self.assertNotIn("Delivery mode:", self.render("confirmation", "en")["body"])

	def test_custom_templates_priority_native_render_raw_variables(self):
		self.custom = "SETTINGS-TEMPLATE"
		for batch_template, expected in [("BATCH-TEMPLATE", "BATCH-TEMPLATE"), (None, "SETTINGS-TEMPLATE")]:
			self.batch.confirmation_email_template = batch_template
			for language in ["fr", "en"]:
				template = FictionalEmailTemplate(
					doctype="Email Template",
					name=expected,
					subject='{{ _("Enrollment Confirmation for {0}").format(title) }}',
					response="<p>Author literal {{ student_name | e }} {{ title | e }} {{ medium }} {{ start_date }} {{ start_time }} {{ name }}</p>",
					use_html=0,
				)
				self.get_doc.side_effect = (
					lambda doctype, name: template
					if (doctype, name) == ("Email Template", expected)
					else self.fail("Unexpected document access")
				)
				message = self.render("confirmation", language)
				self.assertIsNone(message["template"])
				self.assertIn("Author literal", message["body"])
				self.assertIn("Élodie &amp; Fictional", message["body"])
				self.assertIn("Online", message["body"])
				self.assertIn(
					"Confirmation" if language == "fr" else "Enrollment Confirmation", message["subject"]
				)
				self.assertEqual(message["retry"], 3)
				self.get_doc.assert_called_with("Email Template", expected)

	def test_native_jinja_exception_restores_language(self):
		self.custom = "BROKEN-TEMPLATE"
		template = FictionalEmailTemplate(
			doctype="Email Template", name=self.custom, subject="{{ 1 / 0 }}", response="unused", use_html=0
		)
		self.get_doc.side_effect = lambda *args, **kwargs: template
		frappe.local.lang = "de"
		with self.assertRaises(Exception):
			self.render("confirmation")
		self.assertEqual(frappe.local.lang, "de")
		self.sendmail.assert_not_called()

	def test_confirmation_guard_permissions_flag_and_retry_mocked_only(self):
		self.start(patch.object(frappe, "session", frappe._dict(user=self.enrollment.member), create=True))
		self.start(patch.object(frappe, "conf", frappe._dict(mail_login=None), create=True))
		self.start(patch.object(frappe, "get_roles", return_value=[]))
		self.start(patch.object(enrollments, "can_author_batch", return_value=False))
		with patch.object(frappe, "get_cached_value", return_value=None):
			enrollments.send_confirmation_email(self.enrollment)
			self.sendmail.assert_not_called()
		# The sole permitted write is captured by this local mock, never a site.
		self.db.set_value.side_effect = None
		with patch.object(frappe, "get_cached_value", return_value="FICTIONAL-OUTGOING"):
			enrollments.send_confirmation_email(self.enrollment)
		self.db.set_value.assert_called_once_with(
			"LMS Batch Enrollment", "FICTIONAL-ENROLLMENT", "confirmation_email_sent", 1
		)
		self.assertEqual(self.messages[-1]["retry"], 3)
		self.enrollment.confirmation_email_sent = 1
		enrollments.send_confirmation_email(self.enrollment)
		self.assertEqual(self.sendmail.call_count, 1)

	def test_all_standard_template_literals_have_available_french(self):
		for name in [
			"batch_confirmation",
			"batch_start_reminder",
			"batch_start_reminder_recorded",
			"live_class_reminder",
		]:
			source = (fixture.ROOT / "templates/emails" / (name + ".html")).read_text()
			for key in re.findall(r'_\("([^"\n]+)"\)', source):
				with self.subTest(template=name, key=key):
					self.assertTrue(self.french.get(key), "French must exist, not merely be extractable")
		message = self.render("class", "fr")
		self.assertIn("prévue aujourd’hui", message["body"])
		self.assertNotIn("demain", message["body"])
		for family, key in [("live", "Batch Start Reminder: {0}"), ("class", "Class Reminder: {0}")]:
			message = self.render(family)
			self.assertEqual(
				message["header"][0], self.french[key].format(message["args"]["title"].replace("&", "&amp;"))
			)

	def test_worker_language_does_not_override_student_or_mutate_inputs(self):
		before_batch, before_live = copy.deepcopy(self.batch), copy.deepcopy(self.live)
		frappe.local.lang = "de"
		frappe.local.job = frappe._dict(user="fictional-en@example.com", lang_resolved=True)
		for family in ["confirmation", "live", "recorded", "class"]:
			message = self.render(family)
			self.assertEqual(message["lang"], "fr")
			self.assertEqual(frappe.local.lang, "de")
			self.assertEqual(message["recipients"], self.student.member)
			if family != "class":
				self.assertEqual(message["args"]["start_date"], before_batch.start_date)
				self.assertEqual(message["args"]["start_time"], before_batch.start_time)
				self.assertEqual(message["args"]["medium"], before_batch.medium)
		# show_live_class is changed only by the test's explicit variant selector.
		self.batch.show_live_class = before_batch.show_live_class
		self.assertEqual(self.batch, before_batch)
		self.assertEqual(self.live, before_live)
		self.db.set_value.assert_not_called()

	def test_confirmation_failure_does_not_mark_sent(self):
		self.start(patch.object(frappe, "session", frappe._dict(user=self.enrollment.member), create=True))
		self.start(patch.object(frappe, "get_roles", return_value=[]))
		self.start(patch.object(enrollments, "can_author_batch", return_value=False))
		self.sendmail.side_effect = RuntimeError("Fictional delivery preparation failure")
		with patch.object(frappe, "get_cached_value", return_value="FICTIONAL-OUTGOING"):
			with self.assertRaises(RuntimeError):
				enrollments.send_confirmation_email(self.enrollment)
		self.db.set_value.assert_not_called()
		self.assertEqual(frappe.local.lang, "en")

	def test_unresolved_job_native_bootstrap_then_restoration(self):
		frappe.local.lang = "de"
		frappe.local.job = frappe._dict(user="fictional-en@example.com", lang_resolved=False)
		self.assertEqual(self.render("class")["lang"], "fr")
		self.assertTrue(frappe.local.job.lang_resolved)
		self.assertEqual(frappe.local.lang, "en")
