"""Regression checks for review output validation and operational scoring."""

import json
import tempfile
import unittest
from pathlib import Path

from ai.review_runner import (
    calculate_operational_score,
    assemble_review_prompt,
    build_scanner_context,
    deduplicate_findings,
    format_comment,
    parse_model_json,
    validate_review,
)


def make_review(findings=None):
    return {
        "summary": "Review complete.",
        "findings": findings or [],
        "policy_violations": [],
        "positives": [],
        "final_recommendation": "Review before merge.",
    }


def finding(title, evidence, severity="HIGH", category="SECURITY_VULNERABILITY", status="CONFIRMED", identifier="F-001"):
    return {
        "id": identifier,
        "category": category,
        "status": status,
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

    def test_genuine_low_severity_vulnerability_remains_actionable_and_scored(self):
        review = validate_review(make_review([
            finding("Public storage", "azurerm_storage_account.data allows public blob access", severity="LOW")
        ]))
        self.assertEqual(review["findings"][0]["status"], "CONFIRMED")
        self.assertEqual(calculate_operational_score(review, self.scoring)[0], 95)

    def test_legacy_finding_schema_is_accepted_without_downgrading_security_findings(self):
        old_format = finding("Public SSH", "NSG ssh permits TCP/22 from *")
        old_format.pop("status")
        review = validate_review(make_review([old_format]))
        self.assertEqual(review["findings"][0]["status"], "CONFIRMED")
        self.assertEqual(calculate_operational_score(review, self.scoring)[0], 70)

    def test_context_dependent_concern_stays_an_observation_without_losing_severity(self):
        review = validate_review(make_review([
            finding(
                "Provider target needs confirmation",
                "provider azurerm does not set subscription_id or tenant_id",
                severity="MEDIUM",
                category="CONTEXT_DEPENDENT",
                status="NEEDS_CONTEXT",
            )
        ]))
        self.assertEqual(review["findings"][0]["severity"], "MEDIUM")
        self.assertEqual(calculate_operational_score(review, self.scoring)[0], 100)

    def test_documented_deny_all_note_is_not_rendered_as_an_actionable_finding(self):
        review = validate_review(make_review([
            finding(
                "Explicit deny duplicates defaults",
                "azurerm_network_security_group.nsg has DenyAllInbound and DenyAllOutbound at priority 4096",
                severity="INFORMATIONAL",
                category="POTENTIAL_FALSE_POSITIVE",
                status="FALSE_POSITIVE",
            )
        ]))
        review.update({"operational_score": 100, "risk_level": "LOW", "verdict": "APPROVE", "experiment_condition": "C"})
        comment = format_comment(review)
        self.assertIn("### Observations (not scored as confirmed defects)", comment)
        self.assertIn("Potential false positive", comment)
        self.assertNotIn("- **INFORMATIONAL ·", comment)
        self.assertEqual(calculate_operational_score(review, self.scoring)[0], 100)

    def test_scanner_miss_does_not_suppress_evidence_supported_finding(self):
        # Scanner results are secondary evidence and never replace Terraform analysis.
        review = validate_review(make_review([
            finding("Public SSH", "NSG ssh rule permits TCP/22 from 0.0.0.0/0")
        ]))
        self.assertEqual(len(review["findings"]), 1)
        self.assertEqual(review["findings"][0]["status"], "CONFIRMED")
        prompt = (Path(__file__).parents[1] / "ai/prompt.txt").read_text()
        self.assertIn("never a reason by itself to suppress a demonstrated weakness", prompt)

    def test_only_condition_c_receives_normalized_scanner_context_and_raw_is_preserved(self):
        with tempfile.TemporaryDirectory() as temporary:
            results_dir = Path(temporary)
            checkov_raw = {
                "results": {
                    "failed_checks": [{
                        "check_id": "CKV_AZURE_1",
                        "check_name": "Example scanner report",
                        "resource": "azurerm_network_security_group.nsg",
                        "file_path": "terraform/nsg.tf",
                        "severity": "LOW",
                    }]
                }
            }
            (results_dir / "checkov-results.json").write_text(json.dumps(checkov_raw))
            (results_dir / "checkov-exit-code.txt").write_text("1")
            (results_dir / "tfsec-results.json").write_text("[]")
            (results_dir / "tfsec-exit-code.txt").write_text("0")
            before = (results_dir / "checkov-results.json").read_text()

            only_prompt, no_scanners = assemble_review_prompt("Review", "Terraform", "B", results_dir)
            combined_prompt, scanners = assemble_review_prompt("Review", "Terraform", "C", results_dir)
            self.assertIsNone(no_scanners)
            self.assertNotIn("CKV_AZURE_1", only_prompt)
            self.assertIn("CKV_AZURE_1", combined_prompt)
            self.assertEqual(scanners["checkov"]["status"], "COMPLETED_WITH_FINDINGS")
            self.assertEqual(scanners["tfsec"]["status"], "COMPLETED_CLEAN")
            self.assertEqual((results_dir / "checkov-results.json").read_text(), before)
            self.assertEqual(build_scanner_context(results_dir), scanners)

    def test_missing_evidence_is_rejected_and_uncertainty_must_be_explicit(self):
        unsupported = finding(
            "Provider deployment target uncertain",
            "",
            severity="LOW",
            category="CONTEXT_DEPENDENT",
            status="NEEDS_CONTEXT",
        )
        with self.assertRaisesRegex(ValueError, "code evidence"):
            validate_review(make_review([unsupported]))
        supported = finding(
            "Provider deployment target uncertain",
            "provider azurerm does not specify subscription_id; active pipeline target is not shown",
            severity="LOW",
            category="CONTEXT_DEPENDENT",
            status="NEEDS_CONTEXT",
        )
        review = validate_review(make_review([supported]))
        self.assertIn("not shown", review["findings"][0]["evidence"])

    def test_actionable_finding_keeps_evidence_severity_impact_and_remediation(self):
        original = finding("Public SSH", "NSG ssh rule permits TCP/22 from 0.0.0.0/0", severity="LOW")
        review = validate_review(make_review([original]))
        result = review["findings"][0]
        for field in ("evidence", "severity", "impact", "recommendation"):
            self.assertEqual(result[field], original[field])

    def test_parser_deduplication_audit_and_pr_comment_rendering(self):
        parsed = parse_model_json('{"summary":"ok","findings":[]}')
        self.assertEqual(parsed["summary"], "ok")
        first = finding("Public SSH", "NSG ssh permits TCP/22 from *", identifier="F-001")
        duplicate = finding(" public ssh ", " nsg SSH permits tcp/22 from * ", identifier="F-002")
        candidate = make_review([first, duplicate])
        candidate["policy_violations"] = [
            {"finding_id": "F-001", "policy_id": "NET-001", "policy_name": "Network security groups", "severity": "HIGH"},
            {"finding_id": "F-002", "policy_id": "NET-001", "policy_name": "Network security groups", "severity": "HIGH"},
        ]
        review = validate_review(candidate)
        audit = deduplicate_findings(review)
        self.assertEqual([item["id"] for item in review["findings"]], ["F-001"])
        self.assertEqual(audit[0]["duplicate_id"], "F-002")
        self.assertEqual(audit[0]["retained_id"], "F-001")
        self.assertEqual(len(review["policy_violations"]), 1)
        self.assertEqual(review["policy_violations"][0]["finding_id"], "F-001")
        review.update({"operational_score": 70, "risk_level": "MEDIUM", "verdict": "APPROVE_WITH_COMMENTS", "experiment_condition": "C"})
        comment = format_comment(review)
        self.assertIn("Public SSH", comment)
        self.assertEqual(comment.count("Public SSH"), 1)

    def test_prompt_requires_grounded_context_and_preserves_intentional_controls(self):
        prompt = (Path(__file__).parents[1] / "ai/prompt.txt").read_text()
        self.assertIn("Never assert deployment targeting, credential scope, network reachability", prompt)
        self.assertIn("An explicit deny-all NSG posture is not a weakness", prompt)

    def test_context_and_informational_reports_are_not_confirmed_findings(self):
        review = validate_review(make_review([
            finding(
                "Query path is out of current scope",
                "README says TC01 has no interactive query requirement",
                severity="INFORMATIONAL",
                category="POTENTIAL_FALSE_POSITIVE",
                status="FALSE_POSITIVE",
                identifier="F-001",
            ),
            finding(
                "Provider target needs verification",
                "provider block does not define subscription_id",
                severity="LOW",
                category="CONTEXT_DEPENDENT",
                status="NEEDS_CONTEXT",
                identifier="F-002",
            ),
        ]))
        self.assertEqual([item["status"] for item in review["findings"]], ["FALSE_POSITIVE", "NEEDS_CONTEXT"])
        self.assertEqual(calculate_operational_score(review, self.scoring)[0], 100)


if __name__ == "__main__":
    unittest.main()
