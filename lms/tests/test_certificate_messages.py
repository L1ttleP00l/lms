"""Eligibility refusals only: no creation, site, database or email."""

import unittest
from pathlib import Path
from unittest.mock import patch

from babel.messages.pofile import read_po

from lms.lms.doctype.lms_certificate import lms_certificate as certificate

ROOT = Path(__file__).resolve().parents[2]


class CertificateMessagesTests(unittest.TestCase):
	def test_eligibility_refusals_in_french_and_english(self):
		with (ROOT / "lms/locale/fr.po").open("rb") as stream:
			french = read_po(stream, abort_invalid=True)

		class Refused(Exception):
			pass

		for lang in ("fr", "en"):
			for enrolled, enabled, progress, key in (
				(False, True, 100, "You are not enrolled in this course."),
				(True, False, 100, "Certification is not enabled for this course."),
				(True, True, 99, "You have not completed the course yet."),
				(True, True, 100, None),
			):
				with self.subTest(lang=lang, key=key):
					with (
						patch.object(certificate, "frappe") as framework,
						patch.object(
							certificate,
							"_",
							side_effect=lambda k: french.get(k).string if lang == "fr" else k,
						),
					):
						framework.session.user = "fictitious@example.com"
						framework.db.exists.return_value = enrolled
						framework.db.get_value.side_effect = [enabled, progress]
						framework.throw.side_effect = Refused
						if key:
							with self.assertRaises(Refused):
								certificate.validate_certification_eligibility("TEST-COURSE")
							self.assertEqual(
								framework.throw.call_args.args[0],
								french.get(key).string if lang == "fr" else key,
							)
						else:
							certificate.validate_certification_eligibility("TEST-COURSE")
							framework.throw.assert_not_called()
						self.assertTrue(
							all(c[0] in ("exists", "get_value") for c in framework.db.method_calls)
						)
						framework.get_doc.assert_not_called()
						framework.sendmail.assert_not_called()


if __name__ == "__main__":
	unittest.main()
