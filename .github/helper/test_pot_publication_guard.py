"""Offline regression checks; never execute the upstream publication body."""

import subprocess
import tempfile
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]


class PublicationGuardTests(unittest.TestCase):
	def test_script_contexts(self):
		script = ROOT / ".github/helper/update_pot_file.sh"
		text = script.read_text()
		# Positive case ends at a sentinel before setup; no upstream body runs.
		guard = text.split("cd ~ || exit", 1)[0]
		self.assertIn("exit 1", guard)
		cases = [
			("", "", False),
			("true", "", False),
			("true", "L1ttleP00l/lms", False),
			("", "frappe/lms", False),
			("false", "frappe/lms", False),
			("true", "frappe/lms", True),
		]
		with tempfile.TemporaryDirectory() as directory:
			# An empty PATH makes any unexpected external command fail offline.
			for actions, repository, allowed in cases:
				with self.subTest(actions=actions, repository=repository):
					env = {
						"PATH": directory,
						"HOME": directory,
						"GITHUB_ACTIONS": actions,
						"GITHUB_REPOSITORY": repository,
					}
					command = guard + '\nprintf "GUARD_PASSED\\n"\n'
					result = subprocess.run(
						["/bin/bash", "-c", command], env=env, capture_output=True, text=True
					)
					self.assertEqual(result.returncode, 0 if allowed else 1)
					self.assertEqual("GUARD_PASSED" in result.stdout, allowed)
					if not allowed:
						# Also exercise the actual script, which must stop at the guard.
						actual = subprocess.run(
							["/bin/bash", str(script)], env=env, capture_output=True, text=True
						)
						self.assertEqual(actual.returncode, 1)
						self.assertIn("restricted", actual.stderr)
						self.assertEqual(actual.stdout, "")

	def test_workflow_job_guard(self):
		workflow = yaml.safe_load((ROOT / ".github/workflows/generate-pot-file.yml").read_text())
		job = workflow["jobs"]["regenerate-pot-file"]
		self.assertEqual(job["if"], "github.repository == 'frappe/lms'")
		self.assertEqual(len(job["strategy"]["matrix"]["include"]), 4)


if __name__ == "__main__":
	unittest.main()
