"""FR-01F catalogue checks, independent of a running site/database."""

import re
import unittest
from collections import Counter
from pathlib import Path

from babel.messages.pofile import read_po

ROOT = Path(__file__).resolve().parents[2]
KEYS = (
	"Student Progress",
	"Courses",
	"Signups",
	"Enrollments",
	"Completions",
	"Certifications",
	"Signups per day",
	"Enrollments per day",
	"Certifications per day",
	"Course Completion",
	"search by keyword",
	"Upload Image",
	"Uploading {0}%",
	"1 student enrolled",
	"{0} students enrolled",
	"1 student upgraded to certificate",
	"{0} students upgraded to certificate",
	"1 student could not be enrolled",
	"{0} students could not be enrolled",
	"Enroll 1 student",
	"Enroll {0} students",
)


def catalog(name):
	with (ROOT / "lms/locale" / name).open("rb") as source:
		return read_po(source, abort_invalid=True)


class FrenchPilotTests(unittest.TestCase):
	def test_catalogue_validity(self):
		self.assertEqual(list(catalog("fr.po").check()), [])

	def test_target_keys_formats_and_contexts(self):
		pot, french = catalog("main.pot"), catalog("fr.po")
		for key in KEYS:
			with self.subTest(key=key):
				source, translated = pot.get(key), french.get(key)
				self.assertIsNotNone(source)
				self.assertIsNotNone(translated)
				self.assertTrue(translated.string)
				self.assertNotEqual(translated.string, key)
				self.assertEqual(translated.context, source.context)
				self.assertEqual(translated.flags, source.flags)
				self.assertNotIn("fuzzy", translated.flags)
				self.assertEqual(
					Counter(re.findall(r"\{\d+\}", key)),
					Counter(re.findall(r"\{\d+\}", translated.string)),
				)
				self.assertEqual(key.count("%"), translated.string.count("%"))

	def test_distinguishes_enrollment_results_and_actions(self):
		french = catalog("fr.po")
		self.assertEqual(french.get("1 student enrolled").string, "1 apprenant inscrit")
		self.assertEqual(french.get("{0} students enrolled").string.format(2), "2 apprenants inscrits")
		self.assertEqual(french.get("Enroll {0} students").string.format(2), "Inscrire 2 apprenants")
		self.assertIn("option avec certificat", french.get("1 student upgraded to certificate").string)
		self.assertIn("n’ont pas pu", french.get("{0} students could not be enrolled").string)


if __name__ == "__main__":
	unittest.main()
