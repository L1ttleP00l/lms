"""Standalone billing gettext checks: no site, payment or database writes."""

import unittest
from pathlib import Path
from unittest.mock import patch

from lms.lms import payments
from lms.tests.test_gettext_extraction import extract_files

ROOT = Path(__file__).resolve().parents[2]
NEW_KEYS = {
	"Payment for the course",
	"Payment for the training session",
	"Payment for the certificate option",
	"Confirm without payment",
	"Back to course",
	"Back to training session",
	"Please enter a valid value for {0}.",
	"Please enter a valid PAN number.",
	"Payment Gateway Not Configured",
}


class BillingGettextTests(unittest.TestCase):
	def test_native_extraction_of_actual_sources(self):
		paths = ["frontend/src/pages/Billing.vue", "lms/lms/payments.py"]
		rows = extract_files({name: (ROOT / name).read_text() for name in paths})
		keys = {message for _, _, message, _, _ in rows}
		self.assertTrue(NEW_KEYS <= keys, f"Missing: {NEW_KEYS - keys}")
		self.assertTrue(all(context is None for _, _, _, _, context in rows))

	def test_gateway_title_is_resolved_per_call_for_each_guard(self):
		class ExpectedFailure(Exception):
			pass

		for lang in ("fr", "en"):
			for installed, gateway, exists in (
				([], None, False),
				(["payments"], None, False),
				(["payments"], "TEST", False),
			):
				with self.subTest(lang=lang, gateway=gateway, installed=installed):

					def translate(message):
						if message == "Payment Gateway Not Configured" and lang == "fr":
							return "Passerelle de paiement non configurée"
						return message

					with (
						patch.object(payments, "_", side_effect=translate),
						patch.object(payments, "frappe") as framework,
					):
						framework.get_installed_apps.return_value = installed
						framework.db.exists.return_value = exists
						framework.bold.side_effect = lambda value: value
						framework.throw.side_effect = ExpectedFailure
						with self.assertRaises(ExpectedFailure):
							payments.validate_payment_gateway(gateway)
						self.assertEqual(
							framework.throw.call_args.kwargs["title"],
							translate("Payment Gateway Not Configured"),
						)
						framework.db.set_value.assert_not_called()
						framework.db.sql.assert_not_called()


if __name__ == "__main__":
	unittest.main()
