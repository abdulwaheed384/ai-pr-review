"""Regression checks for review output validation and operational scoring."""

import unittest

from ai.review_runner import calculate_operational_score, validate_review


def make_review(findings=None):
    return {
        "summary": "Review complete.",
        "findings": findings or [],
        "policy_violations": [],
        "positives": [],
        "final_recommendation": "Review before merge.",
    }


def finding(title, evidence, severity="HIGH"):
    return {
        "id": "F-001",
        "category": "SECURITY_VULNERABILITY",
        "category_rationale": "The configured rule permits public management access.",
        "severity": severity,
        "title": title,
        "description": "Public access is allowed by the configured NSG rule.",
        "evidence": evidence,
        "impact": "An internet host could reach the exposed service.",
        "recommendation": "Remove the public allow rule or restrict its source.",
    }


class ReviewRunnerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from pathlib import Path
        import json

        cls.scoring = json.loads((Path(__file__).parents[1] / "ai/scoring.json").read_text())

    def test_clean_baseline_has_no_findings_and_keeps_scoring_enabled(self):
        review = validate_review(make_review())
        self.assertEqual(calculate_operational_score(review, self.scoring), (100, "APPROVE", "LOW"))

    def test_unrestricted_ssh_is_preserved_as_a_penalized_finding(self):
        review = validate_review(make_review([
            finding("Unrestricted SSH", "azurerm_network_security_rule.ssh permits TCP/22 from 0.0.0.0/0")
        ]))
        self.assertEqual(calculate_operational_score(review, self.scoring), (70, "APPROVE_WITH_COMMENTS", "MEDIUM"))

    def test_unrestricted_rdp_and_public_http_are_valid_finding_evidence(self):
        for title, evidence in (
            ("Unrestricted RDP", "azurerm_network_security_rule.rdp permits TCP/3389 from *"),
            ("Public HTTP", "azurerm_network_security_rule.http permits TCP/80 from 0.0.0.0/0"),
        ):
            with self.subTest(title=title):
                review = validate_review(make_review([finding(title, evidence)]))
                self.assertEqual(review["findings"][0]["evidence"], evidence)
                self.assertEqual(calculate_operational_score(review, self.scoring)[0], 70)


if __name__ == "__main__":
    unittest.main()
