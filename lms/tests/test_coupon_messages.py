"""Coupon/gateway messages with real PO values and entirely mocked Frappe I/O."""

import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest.mock import patch

import frappe
from babel.messages.pofile import read_po

from lms.lms import payments, utils
from lms.tests.test_gettext_extraction import extract_files

ROOT = Path(__file__).resolve().parents[2]
with (ROOT / "lms/locale/fr.po").open("rb") as stream:
	FRENCH = read_po(stream, abort_invalid=True)


class ValidationFailure(Exception):
	pass


def translator(lang):
	return lambda key: FRENCH.get(key).string if lang == "fr" else key


class CouponMessagesTests(unittest.TestCase):
	def test_invalid_code_preserves_parameter(self):
		for lang in ("fr", "en"):
			with self.subTest(lang=lang), patch.object(utils, "frappe") as framework:
				framework.db.exists.return_value = False
				framework.throw.side_effect = ValidationFailure
				with patch.object(utils, "_", side_effect=translator(lang)):
					with self.assertRaises(ValidationFailure):
						utils.apply_coupon("LMS Course", "TEST-ITEM", "TEST-ONLY", 100)
				self.assertEqual(
					framework.throw.call_args.args[0],
					translator(lang)("The coupon code '{0}' is invalid.").format("TEST-ONLY"),
				)
				framework.db.get_value.assert_not_called()
				self.assertEqual(set(framework.db.method_calls[0].kwargs), set())
				self.assertEqual([c[0] for c in framework.db.method_calls], ["exists"])

	def test_expiration_usage_and_valid_coupon(self):
		for lang in ("fr", "en"):
			for expired, count, expected in (
				(True, 0, "This coupon has expired."),
				(False, 2, "This coupon has reached its maximum usage limit."),
				(False, 1, None),
			):
				with self.subTest(lang=lang, expired=expired, count=count):
					coupon = frappe._dict(
						expires_on=date.today() + timedelta(days=-1 if expired else 1),
						usage_limit=2,
						redemption_count=count,
					)
					with (
						patch.object(utils, "frappe") as framework,
						patch.object(utils, "_", side_effect=translator(lang)),
						patch.object(utils, "getdate", side_effect=lambda value=None: value or date.today()),
					):
						framework.throw.side_effect = ValidationFailure
						if expected:
							with self.assertRaises(ValidationFailure):
								utils.validate_coupon("TEST-ONLY", coupon)
							self.assertEqual(framework.throw.call_args.args[0], translator(lang)(expected))
						else:
							utils.validate_coupon("TEST-ONLY", coupon)
							framework.throw.assert_not_called()
						self.assertEqual(framework.db.method_calls, [])

	def test_contextual_applicability_and_original_branch(self):
		for lang in ("fr", "en"):
			for doctype in ("LMS Course", "LMS Batch", "OTHER-TEST"):
				for applicable in (False, True):
					with self.subTest(lang=lang, doctype=doctype, applicable=applicable):
						with (
							patch.object(utils, "frappe") as framework,
							patch.object(utils, "_", side_effect=translator(lang)),
						):
							framework.db.exists.return_value = applicable
							framework.throw.side_effect = ValidationFailure
							if applicable:
								utils.validate_coupon_applicability(doctype, "TEST-ITEM", "TEST-ONLY")
								framework.throw.assert_not_called()
							else:
								with self.assertRaises(ValidationFailure):
									utils.validate_coupon_applicability(doctype, "TEST-ITEM", "TEST-ONLY")
								key = (
									"This coupon is not applicable to this course."
									if doctype == "LMS Course"
									else "This coupon is not applicable to this training session."
								)
								self.assertEqual(framework.throw.call_args.args[0], translator(lang)(key))
							framework.db.exists.assert_called_once_with(
								"LMS Coupon Item",
								{
									"parent": "TEST-ONLY",
									"reference_doctype": doctype,
									"reference_name": "TEST-ITEM",
								},
							)
							self.assertEqual([c[0] for c in framework.db.method_calls], ["exists"])

	def test_gateway_bodies_title_and_bold_parameter(self):
		cases = (
			([], None, "The Payments app is not installed. Please contact the administrator."),
			(["payments"], None, "No payment gateway is configured. Please contact the administrator."),
			(
				["payments"],
				"TEST-GATEWAY",
				"The configured payment gateway {0} does not exist. Please contact the administrator.",
			),
		)
		for lang in ("fr", "en"):
			for installed, gateway, key in cases:
				with self.subTest(lang=lang, key=key), patch.object(payments, "frappe") as framework:
					framework.get_installed_apps.return_value = installed
					framework.db.exists.return_value = False
					framework.throw.side_effect = ValidationFailure
					framework.bold.side_effect = frappe.bold
					with patch.object(payments, "_", side_effect=translator(lang)):
						with self.assertRaises(ValidationFailure):
							payments.validate_payment_gateway(gateway)
					self.assertEqual(
						framework.throw.call_args.args[0],
						translator(lang)(key).format(frappe.bold(gateway or "")),
					)
					self.assertEqual(
						framework.throw.call_args.kwargs["title"],
						translator(lang)("Payment Gateway Not Configured"),
					)
					self.assertTrue(all(c[0] == "exists" for c in framework.db.method_calls))
					if gateway:
						self.assertIn("<strong>TEST-GATEWAY</strong>", framework.throw.call_args.args[0])

	def test_native_extraction(self):
		rows = extract_files({"lms/lms/utils.py": (ROOT / "lms/lms/utils.py").read_text()})
		keys = {message for _, _, message, _, _ in rows}
		self.assertIn("This coupon is not applicable to this course.", keys)
		self.assertIn("This coupon is not applicable to this training session.", keys)
		self.assertNotIn("This coupon is not applicable to this {0}.", keys)


if __name__ == "__main__":
	unittest.main()
