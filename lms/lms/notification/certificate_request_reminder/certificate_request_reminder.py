from datetime import datetime

from frappe import _
from frappe.translate import get_user_lang, print_language
from frappe.utils import format_date, format_time

from lms.lms.utils import (
	convert_from_system_timezone,
	format_timezone,
	get_evaluation_display_timezone,
)


def get_context(context):
	alert = context.get("alert")
	# Custom Email Templates keep native priority and their original context.
	if not alert or not alert.get("is_standard") or alert.get("email_template"):
		return {}

	doc = context["doc"]
	# Prepare plain text inside a bounded native context. Notification renders
	# the HTML later, after this context is restored; its template escapes text.
	with print_language(get_user_lang(doc.member)):
		timezone = get_evaluation_display_timezone(doc.course, doc.batch_name)
		date, start_time = convert_from_system_timezone(doc.date, doc.start_time, timezone)
		return {
			"evaluation_reminder": {
				"subject": _("Reminder for Certificate Evaluation"),
				"greeting": _("Hey {0}").format(doc.member_name),
				"schedule": _(
					"Your evaluation for the course {0} has been scheduled on {1} at {2} {3}."
				).format(
					doc.course_title,
					format_date(date, "medium"),
					format_time(start_time, "short"),
					format_timezone(timezone, datetime.combine(date, start_time)),
				),
				"evaluator": _("{0} is your evaluator").format(doc.evaluator_name),
				"preparation": _("Please prepare well and be on time for the evaluations."),
			}
		}
