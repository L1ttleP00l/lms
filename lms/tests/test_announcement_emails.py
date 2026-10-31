"""Announcements and discussions: fictional fixtures, native render, no delivery or site."""

import copy
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

import frappe
from frappe.email.doctype.email_queue.email_queue import QueueBuilder
from frappe.translate import print_language
from frappe.utils import format_date, format_time, markdown
from frappe.utils.jinja import get_email_from_template

from lms.lms import utils
from lms.lms.doctype.lms_batch import lms_batch as batches
from lms.lms.doctype.lms_course import lms_course as courses
from lms.tests import test_session_emails as sessions


class TestAnnouncementEmails(unittest.TestCase):
	start = sessions.TestSessionEmails.start
	clear_context = sessions.TestSessionEmails.clear_context
	user_language = sessions.TestSessionEmails.user_language

	def setUp(self):
		sessions.TestSessionEmails.setUp(self)
		self.course = frappe._dict(
			name="FICTIONAL-COURSE",
			title="Océans & horizons",
			short_introduction="Explorez les océans & leurs écosystèmes",
		)
		self.batch.update(description="Session & exercices", end_date="2027-03-30", timezone="Europe/Paris")
		self.instructors = [
			frappe._dict(
				name="fictional-instructor@example.com",
				full_name="Élodie Fictional",
				user_image="/files/avatar.png",
			)
		]
		self.instructor_emails = {self.instructors[0].name: self.instructors[0].name}
		self.native_envelopes = []
		self.users = ["fictional-fr@example.com", "fictional-en@example.com"]
		self.jobs = []
		self.logs = []
		self.doc = frappe._dict(
			owner="fictional-author@example.com", reply="**Fictional discussion**", topic="FICTIONAL-TOPIC"
		)
		self.topic = frappe._dict(
			reference_doctype="LMS Batch",
			reference_docname=self.batch.name,
			title="Fictional topic",
			owner=self.doc.owner,
		)
		self.start(patch.object(frappe, "get_all", side_effect=self.get_all))
		self.start(
			patch.object(
				frappe.utils, "get_url", side_effect=lambda path="": "https://learning.example.invalid" + path
			)
		)
		self.start(patch.object(courses, "get_instructors", return_value=self.instructors))
		self.start(patch.object(batches, "get_instructors", return_value=self.instructors))
		self.start(patch.object(batches, "format_timezone", return_value="Europe/Paris (GMT+2:00)"))
		self.start(patch.object(utils, "get_fullname", return_value="Fictional Author"))
		self.start(patch.object(frappe, "conf", frappe._dict(mail_login="fictional-enabled"), create=True))
		self.start(patch.object(frappe, "new_doc", side_effect=AssertionError("Real document forbidden")))
		self.start(
			patch.object(
				utils,
				"make_notification_logs",
				side_effect=lambda doc, users: self.logs.append((copy.deepcopy(doc), copy.deepcopy(users))),
			)
		)
		self.start(
			patch.object(
				courses,
				"make_notification_logs",
				side_effect=lambda doc, users: self.logs.append((copy.deepcopy(doc), copy.deepcopy(users))),
			)
		)
		self.start(
			patch.object(
				batches,
				"make_notification_logs",
				side_effect=lambda doc, users: self.logs.append((copy.deepcopy(doc), copy.deepcopy(users))),
			)
		)
		self.start(
			patch(
				"frappe.utils.safe_exec.get_safe_globals",
				return_value={
					"_": frappe._,
					"frappe": {
						"utils": {"format_date": format_date, "format_time": format_time},
						"bold": frappe.bold,
					},
					"get_lms_route": utils.get_lms_route,
				},
			)
		)
		self.start(patch("frappe.utils.jinja.get_jinja_hooks", return_value=({}, {"markdown": markdown})))

	def setting(self, doctype, field):
		return {
			("Website Settings", "app_name"): "Fictional Academy",
			("Website Settings", "banner_image"): "/files/logo.png",
			("System Settings", "app_name"): "Fictional Academy",
		}[(doctype, field)]

	def value(self, doctype, name, fields, **kwargs):
		if doctype == "User":
			if fields == "first_name":
				return "Fictional Learner"
			if fields == "email":
				if isinstance(name, str):
					return self.instructor_emails.get(name)
				return name["name"].replace("@example.com", ".delivery@example.com")
		if doctype == "LMS Batch" and fields == "title":
			return self.batch.title
		if doctype == "Course Lesson" and fields == "course":
			return self.course.name
		self.fail(f"Unexpected database read: {doctype}, {fields}")

	def get_all(self, doctype, *args, **kwargs):
		if doctype == "User":
			self.assertEqual(args[0], {"enabled": 1})
			self.assertEqual(kwargs, {"pluck": "name"})
			return self.users
		if doctype == "LMS Course Interest":
			self.assertEqual(args, ({"course": self.course.name}, ["name", "user"]))
			return [frappe._dict(name=f"INTEREST-{i}", user=user) for i, user in enumerate(self.users)]
		self.fail(f"Unexpected get_all: {doctype}")

	def capture(self, **kwargs):
		body = get_email_from_template(kwargs["template"], kwargs["args"])[0]
		self.messages.append({**copy.deepcopy(kwargs), "body": body, "lang": frappe.local.lang})

	def announce(self, kind, language="en"):
		with print_language(language), patch.object(self.db, "set_value") as writes:
			if kind == "course":
				courses.send_email_notification_for_published_courses([self.course])
			else:
				batches.send_email_notification_for_published_batch(self.batch)
			writes.assert_called_once_with(
				"LMS Course" if kind == "course" else "LMS Batch",
				self.course.name if kind == "course" else self.batch.name,
				"notification_sent",
				1,
			)
		return self.messages[-1]

	def test_instructor_without_image_native_jinja_regression(self):
		self.instructors[0].user_image = None
		for kind in ["course", "batch"]:
			message = self.announce(kind)
			self.assertIn("É", message["body"])
			self.assertIn("Élodie Fictional", message["body"])

	def test_announcements_fr_en_and_batch_subject(self):
		for kind in ["course", "batch"]:
			for lang in ["fr", "en"]:
				message = self.announce(kind, lang)
				self.assertIn("Bonjour" if lang == "fr" else "Hello Learner", message["body"])
				self.assertIn("Consulter" if lang == "fr" else "View the", message["body"])
				if kind == "batch":
					self.assertIn("session" if lang == "fr" else "batch", message["subject"])
					self.assertNotIn("course", message["subject"])
				self.assertNotIn(
					"A new course has been published on Fictional Academy that", message["body"]
				) if lang == "fr" else None

	def test_homogeneous_and_mixed_audiences_share_current_context(self):
		for users in [
			["fictional-fr@example.com"],
			["fictional-en@example.com"],
			["fictional-fr@example.com", "fictional-en@example.com"],
		]:
			self.users = users
			for kind in ["course", "batch"]:
				before = len(self.messages)
				message = self.announce(kind, "fr")
				self.assertEqual(len(self.messages), before + 1)
				self.assertEqual(message["lang"], "fr")
				self.assertEqual(
					message["recipients"], [self.instructor_emails[i.name] for i in self.instructors]
				)
				self.assertEqual(message["bcc"], users)
				self.assertNotIn("cc", message)
				self.assertEqual(message["args"]["instructors"], self.instructors)
				self.assertEqual(frappe.local.lang, "en")

	def test_announcement_addresses_pass_native_normalization(self):
		for kind in ["course", "batch"]:
			message = self.announce(kind)
			builder = QueueBuilder(recipients=message["recipients"], bcc=message["bcc"])
			self.assertEqual(set(builder.recipients), {self.instructors[0].name})
			self.assertEqual(set(builder.bcc), set(self.users))

	def test_html_plain_fields_and_attributes_escaped(self):
		self.course.title = self.batch.title = '<img src=x> & "Title"'
		self.course.short_introduction = self.batch.description = "<script>fictional()</script>"
		self.instructors[0].full_name = "<b>Fictional</b>"
		self.instructors[0].user_image = '/files/avatar" onerror="fictional()'
		for kind in ["course", "batch"]:
			message = self.announce(kind)
			self.assertNotIn("<script>", message["body"])
			self.assertNotIn("<b>Fictional</b>", message["body"])
			self.assertIn("&lt;img", message["body"])
			self.assertIn("&#34; onerror=&#34;", message["body"])
			self.assertEqual(message["args"]["title"], self.course.title)
		self.assertIn(
			'href="https://learning.example.invalid/lms/batches/FICTIONAL-BATCH"', self.messages[-1]["body"]
		)

	def test_batch_dates_timezone_and_optional_end_date(self):
		for lang in ["fr", "en"]:
			for end in [None, "2027-03-30"]:
				self.batch.end_date = end
				message = self.announce("batch", lang)
				with print_language(lang):
					self.assertIn(format_date(self.batch.start_date, "long"), message["body"])
					self.assertIn(format_time(self.batch.start_time, "short"), message["body"])
					if end:
						self.assertIn(format_date(end, "long"), message["body"])
				self.assertIn("Europe/Paris (GMT+2:00)", message["body"])
				self.assertEqual(message["args"]["start_time"], self.batch.start_time)
				self.assertEqual(message["args"]["medium"], "Online")

	def test_announcement_missing_translation_falls_back(self):
		self.french.pop("A new batch has been published on {0}", None)
		self.assertEqual(
			self.announce("batch", "fr")["subject"], "A new batch has been published on Fictional Academy"
		)

	def queue_interests(self):
		sent_before = self.sendmail.call_count

		def capture_job(**kwargs):
			self.jobs.append(copy.deepcopy(kwargs))

		with (
			patch.object(frappe, "enqueue", side_effect=capture_job),
			patch.object(self.db, "set_value") as writes,
		):
			courses.LMSCourse.send_email_to_interested_users(self.course)
			self.assertEqual(writes.call_count, len(self.users))
			for i, call in enumerate(writes.call_args_list):
				self.assertEqual(call.args, ("LMS Course Interest", f"INTEREST-{i}", "email_sent", True))
		self.assertEqual(self.sendmail.call_count, sent_before)

	def run_job(self, job):
		job = copy.deepcopy(job)
		method = job.pop("method")
		self.assertEqual(job.pop("queue"), "short")
		self.assertEqual(job.pop("timeout"), 300)
		self.assertTrue(job.pop("is_async"))
		method(**job)
		return self.messages[-1]

	def test_interest_jobs_resolve_recipient_language_at_execution(self):
		self.queue_interests()
		self.assertEqual(len(self.jobs), 2)
		frappe.local.lang = "de"
		for job, lang in zip(self.jobs, ["fr", "en"], strict=True):
			message = self.run_job(job)
			self.assertEqual(message["lang"], lang)
			self.assertIn("disponible" if lang == "fr" else "available", message["subject"])
			self.assertIn("Cliquez" if lang == "fr" else "Click on", message["body"])
			self.assertEqual(frappe.local.lang, "de")
			self.assertTrue(message["now"])
			self.assertEqual(message["recipients"], self.users[len(self.messages) - 1])

	def test_interest_raw_values_link_and_html(self):
		self.course.title = '<img src=x> & "Course"'
		self.queue_interests()
		message = self.run_job(self.jobs[0])
		self.assertNotIn("<img", message["body"])
		self.assertNotIn("<img", message["header"][0])
		self.assertIn("<strong>&lt;img", message["body"])
		self.assertIn('href="/lms/courses/FICTIONAL-COURSE"', message["body"])
		self.assertEqual(message["args"]["title"], self.course.title)

	def test_interest_worker_exception_restores_context(self):
		self.queue_interests()
		self.sendmail.side_effect = RuntimeError("Fictional worker failure")
		frappe.local.lang = "de"
		with self.assertRaises(RuntimeError):
			self.run_job(self.jobs[0])
		self.assertEqual(frappe.local.lang, "de")

	def mention(self):
		original = self.user_language

		def cached(doctype, user, field):
			if doctype == "Email Account":
				return "FICTIONAL-ACCOUNT"
			return original(doctype, user, field)

		with (
			patch.object(frappe, "get_cached_value", side_effect=cached),
			patch.object(utils, "get_mention_recipients", return_value=self.users),
		):
			utils.notify_mentions_via_email(self.doc, self.topic)

	def test_individual_mentions_use_user_identity_not_delivery_email(self):
		self.mention()
		self.assertEqual(len(self.messages), 2)
		for message, lang, user in zip(self.messages, ["fr", "en"], self.users, strict=True):
			self.assertEqual(message["lang"], lang)
			self.assertEqual(message["recipients"], user.replace("@example.com", ".delivery@example.com"))
			self.assertIn("mentionné" if lang == "fr" else "mentioned", message["subject"])
			self.assertNotIn("in your batch.", message["body"])
			self.assertIn('href="/batches/FICTIONAL-BATCH#discussions"', message["body"])
			self.assertIn("<strong>Fictional discussion</strong>", message["body"])
			self.assertEqual(message["retry"], 3)
		self.assertEqual(frappe.local.lang, "en")

	def test_mention_guard_unchanged_requires_both_account_and_mail_login(self):
		for account, login in [(None, None), (None, "fictional"), ("FICTIONAL", None)]:
			frappe.conf.mail_login = login
			with (
				patch.object(frappe, "get_cached_value", return_value=account),
				patch.object(utils, "get_mention_recipients") as recipients,
			):
				utils.notify_mentions_via_email(self.doc, self.topic)
				recipients.assert_not_called()
		self.sendmail.assert_not_called()

	def test_mention_sender_escaped_content_markdown_not_rewritten(self):
		self.doc.reply = "**Fictional** <span>editorial</span>"
		with patch.object(utils, "get_fullname", return_value="<img src=x> Author"):
			self.mention()
		self.assertIn("&lt;img", self.messages[0]["body"])
		self.assertNotIn("<img", self.messages[0]["header"][0])
		self.assertIn("<span>editorial</span>", self.messages[0]["body"])
		self.assertEqual(self.messages[0]["args"]["content"], self.doc.reply)

	def test_mention_exception_restores_context(self):
		self.sendmail.side_effect = RuntimeError("Fictional mention failure")
		frappe.local.lang = "de"
		with self.assertRaises(RuntimeError):
			self.mention()
		self.assertEqual(frappe.local.lang, "de")

	def test_mentions_limit_enabled_filter_and_membership_contract(self):
		many = [f"fictional-{i}@example.com" for i in range(12)]
		with (
			patch.object(utils, "mentioned_users", return_value=many),
			patch.object(frappe, "get_all", return_value=many[:3]) as query,
			patch.object(utils, "is_topic_participant", side_effect=lambda u, t: u != many[1]),
		):
			self.assertEqual(utils.get_mention_recipients(self.doc, self.topic), [many[0], many[2]])
			query.assert_called_once_with(
				"User", {"name": ("in", many[:10]), "enabled": 1, "allowed_in_mentions": 1}, pluck="name"
			)

	def test_persistent_portal_subject_is_shared_not_retranslated(self):
		with patch.object(
			utils,
			"get_batch_details_for_notification",
			return_value=(
				"English subject",
				"/lms/batches/FICTIONAL-BATCH#discussions",
				[self.doc.owner, *self.users],
			),
		):
			with print_language("fr"):
				utils.create_notification_log(self.doc, self.topic)
		log, users = self.logs[-1]
		self.assertEqual(log.subject, "English subject")
		self.assertEqual(users, self.users)
		with print_language("en"):
			self.assertEqual(log.subject, "English subject")
		self.assertEqual(log.email_content, self.doc.reply)
		self.assertEqual(len(self.logs), 1)

	def test_portal_mentions_keep_separate_rows_and_same_rendered_subject(self):
		with patch.object(utils, "get_mention_recipients", return_value=self.users):
			utils.notify_mentions_on_portal(self.doc, self.topic)
		self.assertEqual(len(self.logs), 2)
		self.assertEqual(self.logs[0][0].subject, self.logs[1][0].subject)
		self.assertEqual([row[1] for row in self.logs], self.users)
		self.assertEqual(self.logs[0][0].type, "Mention")

	def test_individual_emails_without_preference_follow_site_language(self):
		self.users = ["fictional-unset@example.com"]
		for site in ["fr", "en"]:
			self.system_language = site
			self.messages.clear()
			self.jobs.clear()
			self.queue_interests()
			self.assertEqual(self.run_job(self.jobs[0])["lang"], site)
			self.mention()
			self.assertEqual(self.messages[-1]["lang"], site)
			self.assertEqual(frappe.local.lang, "en")

	def test_course_lesson_mention_keeps_original_route(self):
		self.topic.reference_doctype = "Course Lesson"
		self.topic.reference_docname = "FICTIONAL-LESSON"
		route = "/lms/courses/FICTIONAL-COURSE/learn/1.1"
		with (
			patch.object(utils, "get_lesson_index", return_value="1.1"),
			patch.object(utils, "get_lesson_url", return_value=route),
		):
			self.mention()
		for message in self.messages:
			self.assertEqual(message["args"]["link"], route)
			self.assertIn('href="' + route + '"', message["body"])
			self.assertNotIn("your batch", message["body"])

	def test_topic_membership_checks_actual_helper_with_fake_reads(self):
		with (
			patch("lms.lms.permissions.can_author_course", return_value=False),
			patch("lms.lms.permissions.can_author_batch", return_value=False),
			patch.object(utils, "has_evaluator_role", return_value=False),
		):
			for doctype in ["Course Lesson", "LMS Batch"]:
				self.topic.reference_doctype = doctype
				for enrolled in [True, False]:
					with patch.object(self.db, "exists", return_value=enrolled):
						self.assertEqual(utils.is_topic_participant(self.users[0], self.topic), enrolled)

	def test_native_notification_rows_store_subject_without_language_metadata(self):
		from frappe.desk.doctype.notification_log import notification_log as native

		rows = []

		class FictionalLog(dict):
			def __getattr__(self, key):
				return self[key]

			def __setattr__(self, key, value):
				self[key] = value

			def insert(self, **kwargs):
				rows.append(copy.deepcopy(dict(self)))

		payload = frappe._dict(
			subject="Rendered English subject",
			from_user=self.doc.owner,
			type="Alert",
			link="/lms/courses/FICTIONAL-COURSE",
		)
		with (
			patch.object(native, "_get_user_ids", return_value=self.users),
			patch.object(native, "get_self_notify_types", return_value=set()),
			patch.object(frappe, "new_doc", side_effect=lambda doctype: FictionalLog()),
		):
			with print_language("fr"):
				native.make_notification_logs(payload, self.users)
		self.assertEqual(len(rows), 2)
		self.assertEqual([r["for_user"] for r in rows], self.users)
		for row in rows:
			self.assertEqual(row["subject"], "Rendered English subject")
			self.assertNotIn("language", row)
			self.assertNotIn("msgid", row)
		with print_language("en"):
			self.assertEqual(rows[0]["subject"], "Rendered English subject")

	def test_announcement_exception_restores_callers_native_context(self):
		self.sendmail.side_effect = RuntimeError("Fictional announcement render failure")
		frappe.local.lang = "de"
		with self.assertRaises(RuntimeError):
			self.announce("course", "fr")
		self.assertEqual(frappe.local.lang, "de")

	def test_batch_timezone_offset_uses_date_not_start_clock_diagnostic(self):
		self.batch.start_time = "23:45:00"
		with patch.object(batches, "format_timezone", side_effect=utils.format_timezone):
			for day in ["2027-03-27", "2027-03-28", "2027-03-29"]:
				self.batch.start_date = day
				message = self.announce("batch", "fr")
				expected = utils.format_timezone("Europe/Paris", day)
				self.assertEqual(message["args"]["timezone"], expected)
				self.assertIn(expected, message["body"])
				if day == "2027-03-28":
					self.assertNotEqual(expected, utils.format_timezone("Europe/Paris", day + " 23:45:00"))

	def native_announce(self, kind, language="en", unsubscribed=()):
		capture = self.capture

		def prepare(**kwargs):
			capture(**kwargs)
			message = self.messages[-1]
			builder = QueueBuilder(
				recipients=kwargs["recipients"],
				bcc=kwargs["bcc"],
				subject=kwargs["subject"],
				message=message["body"],
			)
			with (
				patch.object(builder, "get_unsubscribed_user_emails", return_value=list(unsubscribed)),
				patch.object(
					builder,
					"as_dict",
					return_value={"subject": message["subject"], "message": message["body"]},
				),
				patch(
					"frappe.email.doctype.email_queue.email_queue.EmailQueue.new",
					return_value=SimpleNamespace(send=Mock(side_effect=AssertionError("Delivery forbidden"))),
				) as new,
			):
				builder.process(send_now=False)
				new.assert_called_once()
				self.native_envelopes.append(
					{
						"to": builder.final_recipients(),
						"bcc": builder.final_bcc(),
						"cc": builder.final_cc(),
						"queue": copy.deepcopy(new.call_args.args[0]),
					}
				)
				new.return_value.send.assert_not_called()

		with patch.object(frappe, "sendmail", side_effect=prepare) as transport:
			message = self.announce(kind, language)
			transport.assert_called_once()
		return message

	def test_reproduce_historical_objects_then_accept_addresses(self):
		with self.assertRaisesRegex(TypeError, "unhashable"):
			_ = QueueBuilder(recipients=self.instructors).recipients
		for kind in ["course", "batch"]:
			message = self.native_announce(kind)
			self.assertEqual(message["recipients"], [self.instructors[0].name])
			self.assertEqual(message["args"]["instructors"], self.instructors)

	def test_multiple_instructors_native_to_and_jinja_unchanged(self):
		second = frappe._dict(
			name="fictional-second@example.com", full_name="Second Fictional", user_image=None
		)
		self.instructors.append(second)
		self.instructor_emails[second.name] = second.name
		before = copy.deepcopy(self.instructors)
		for kind in ["course", "batch"]:
			for language in ["fr", "en"]:
				message = self.native_announce(kind, language)
				envelope = self.native_envelopes[-1]
				self.assertEqual(set(envelope["to"]), set(self.instructor_emails.values()))
				self.assertEqual(set(envelope["bcc"]), set(self.users))
				self.assertEqual(envelope["cc"], [])
				self.assertFalse(set(self.users) & set(envelope["to"]))
				self.assertEqual(message["args"]["instructors"], before)
				self.assertIn("Second Fictional", message["body"])
				self.assertIn("/files/avatar.png", message["body"])
				self.assertEqual(
					message["body"], get_email_from_template(message["template"], message["args"])[0]
				) if language == "en" else None
		self.assertEqual(self.instructors, before)

	def test_user_identity_resolved_to_its_stored_email(self):
		# An exceptional/legacy identity is not itself a deliverable address.
		self.instructors[0].name = "FictionalLegacyIdentity"
		self.instructors[0].username = "not-a-fallback-address"
		self.instructor_emails = {"FictionalLegacyIdentity": "fictional-delivery@example.com"}
		for kind in ["course", "batch"]:
			message = self.native_announce(kind)
			self.assertEqual(message["recipients"], ["fictional-delivery@example.com"])
			self.assertEqual(message["args"]["instructors"][0].name, "FictionalLegacyIdentity")

	def test_native_exact_duplicates_and_to_bcc_overlap(self):
		duplicate = copy.deepcopy(self.instructors[0])
		self.instructors.append(duplicate)
		self.users.append(duplicate.name)
		self.users.append(self.users[0])
		for kind in ["course", "batch"]:
			message = self.native_announce(kind)
			envelope = self.native_envelopes[-1]
			self.assertEqual(message["recipients"], [duplicate.name, duplicate.name])
			self.assertEqual(message["bcc"], self.users)
			self.assertEqual(envelope["to"], [duplicate.name])
			self.assertIn(duplicate.name, envelope["bcc"])
			self.assertEqual(set(envelope["queue"]["recipients"]), {duplicate.name, *self.users})
			self.assertEqual(len(envelope["queue"]["recipients"]), len(set(envelope["queue"]["recipients"])))

	def test_empty_instructors_preserve_bcc_only_native_envelope(self):
		self.instructors.clear()
		for kind in ["course", "batch"]:
			message = self.native_announce(kind)
			self.assertEqual(message["recipients"], [])
			self.assertEqual(message["args"]["instructors"], [])
			self.assertEqual(self.native_envelopes[-1]["to"], [])
			self.assertEqual(set(self.native_envelopes[-1]["queue"]["recipients"]), set(self.users))

	def test_missing_invalid_or_multiple_instructor_email_stops_before_send_and_flag(self):
		for address in [
			None,
			"",
			"not-an-email",
			"fictional-a@example.com, fictional-b@example.com",
			"undisclosed-recipients:;",
		]:
			self.instructor_emails[self.instructors[0].name] = address
			for kind in ["course", "batch"]:
				with (
					self.subTest(address=address, kind=kind),
					patch.object(frappe, "sendmail") as transport,
					patch.object(self.db, "set_value") as writes,
				):
					with self.assertRaises(frappe.InvalidEmailAddressError):
						if kind == "course":
							courses.send_email_notification_for_published_courses([self.course])
						else:
							batches.send_email_notification_for_published_batch(self.batch)
					transport.assert_not_called()
					writes.assert_not_called()

	def test_missing_instructor_identity_never_falls_back_to_session_user(self):
		self.instructors[0].name = None
		for kind in ["course", "batch"]:
			with (
				patch.object(frappe, "sendmail") as transport,
				patch.object(self.db, "set_value") as writes,
				patch.object(frappe.utils, "get_email_address") as resolve,
			):
				with self.assertRaises(frappe.InvalidEmailAddressError):
					if kind == "course":
						courses.send_email_notification_for_published_courses([self.course])
					else:
						batches.send_email_notification_for_published_batch(self.batch)
				resolve.assert_not_called()
				transport.assert_not_called()
				writes.assert_not_called()

	def test_native_preparation_failure_does_not_mark_notification_sent(self):
		def reject(**kwargs):
			# Reach the native boundary, then simulate its preparation failure.
			self.assertEqual(
				QueueBuilder(recipients=kwargs["recipients"]).recipients, [self.instructors[0].name]
			)
			raise RuntimeError("Fictional preparation failure")

		for kind in ["course", "batch"]:
			frappe.local.lang = "fr"
			with (
				patch.object(frappe, "sendmail", side_effect=reject) as transport,
				patch.object(self.db, "set_value") as writes,
			):
				with self.assertRaises(RuntimeError):
					if kind == "course":
						courses.send_email_notification_for_published_courses([self.course])
					else:
						batches.send_email_notification_for_published_batch(self.batch)
				self.assertEqual(transport.call_count, 1)
				writes.assert_not_called()
				self.assertEqual(frappe.local.lang, "fr")

	def test_native_unsubscribe_filter_is_not_reimplemented(self):
		for kind in ["course", "batch"]:
			self.native_announce(kind, unsubscribed=[self.users[0]])
			self.assertEqual(self.native_envelopes[-1]["bcc"], [self.users[1]])
