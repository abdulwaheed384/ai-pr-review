"""PR-diff based AI review with deterministic operational scoring."""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FINDING_CATEGORIES = {
    "SECURITY_VULNERABILITY",
    "POLICY_OR_COMPLIANCE",
    "CONTEXT_DEPENDENT",
    "POTENTIAL_FALSE_POSITIVE",
}
SEVERITIES = {"INFORMATIONAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"}
FINDING_STATUSES = {"CONFIRMED", "NEEDS_CONTEXT", "INFORMATIONAL", "FALSE_POSITIVE"}
CLASSIFICATION_POLICY_VERSION = "2.2"
MAX_SCANNER_FINDINGS = 25
MAX_SCANNER_FIELD_CHARS = 300


def load_file(path):
    return (ROOT / path).read_text(encoding="utf-8")


def get_terraform_review_context():
    """Return changed Terraform paths plus complete Terraform/policy context."""
    try:
        base_ref = os.environ.get("GITHUB_BASE_REF") or os.environ.get("BASE_REF", "main")
        subprocess.run(["git", "fetch", "origin", base_ref], cwd=ROOT, check=True)
        result = subprocess.run(
            ["git", "diff", "--name-only", f"origin/{base_ref}...HEAD"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )

        changed = []
        for relative_path in result.stdout.splitlines():
            path = Path(relative_path)
            if (
                path.parts[0:1] == ("terraform",)
                and path.suffix == ".tf"
                and (ROOT / path).is_file()
            ):
                changed.append(path.as_posix())
        if not changed:
            return [], ""

        parts = ["Changed Terraform files: " + ", ".join(sorted(changed))]
        for path in sorted((ROOT / "terraform").glob("*.tf")):
            label = "CHANGED FILE" if path.relative_to(ROOT).as_posix() in changed else "CONTEXT FILE"
            parts.append(f"\n{label}: {path.relative_to(ROOT).as_posix()}\n{path.read_text(encoding='utf-8')}\n")
        for relative_path in ("ai/policy.md", "README.md"):
            path = ROOT / relative_path
            parts.append(f"\nREVIEW CONTEXT: {relative_path}\n{path.read_text(encoding='utf-8')}\n")
        return sorted(changed), "".join(parts).strip()
    except Exception as exc:
        raise RuntimeError(f"Could not collect changed Terraform files: {exc}") from exc


def _clip_scanner_value(value, limit=MAX_SCANNER_FIELD_CHARS):
    if value is None:
        return ""
    return str(value).strip()[:limit]


def build_scanner_context(results_dir):
    """Load a bounded summary of scanner results for Condition C only."""
    scanners = {}
    for tool in ("checkov", "tfsec"):
        json_path = results_dir / f"{tool}-results.json"
        exit_path = results_dir / f"{tool}-exit-code.txt"
        try:
            data = json.loads(json_path.read_text(encoding="utf-8"))
            exit_code = int(exit_path.read_text(encoding="utf-8").strip())
        except (OSError, ValueError, json.JSONDecodeError):
            scanners[tool] = {"status": "UNAVAILABLE_OR_INVALID", "findings": []}
            continue

        findings = []
        if tool == "checkov":
            if isinstance(data, list):
                data = data[0] if data else {}
            checks = data.get("results", {}) if isinstance(data, dict) else {}
            failed = checks.get("failed_checks") if isinstance(checks, dict) else None
            if not isinstance(failed, list):
                scanners[tool] = {"status": "UNAVAILABLE_OR_INVALID", "findings": []}
                continue
            for item in failed[:MAX_SCANNER_FINDINGS]:
                if not isinstance(item, dict):
                    continue
                findings.append({
                    "rule": _clip_scanner_value(item.get("check_id")),
                    "description": _clip_scanner_value(item.get("check_name") or item.get("description")),
                    "resource": _clip_scanner_value(item.get("resource")),
                    "file": _clip_scanner_value(item.get("file_path")),
                    "severity": _clip_scanner_value(item.get("severity")),
                })
        else:
            if isinstance(data, dict):
                findings_data = data.get("results", [])
            else:
                findings_data = data
            if not isinstance(findings_data, list):
                scanners[tool] = {"status": "UNAVAILABLE_OR_INVALID", "findings": []}
                continue
            for item in findings_data[:MAX_SCANNER_FINDINGS]:
                if not isinstance(item, dict):
                    continue
                location = item.get("location") or {}
                if not isinstance(location, dict):
                    location = {}
                findings.append({
                    "rule": _clip_scanner_value(item.get("rule_id")),
                    "description": _clip_scanner_value(item.get("description")),
                    "resource": _clip_scanner_value(item.get("resource")),
                    "file": _clip_scanner_value(location.get("filename")),
                    "severity": _clip_scanner_value(item.get("severity")),
                })

        if findings:
            status = "COMPLETED_WITH_FINDINGS"
        elif exit_code == 0:
            status = "COMPLETED_CLEAN"
        else:
            status = "EXECUTION_ERROR"
        scanners[tool] = {
            "status": status,
            "exit_code": exit_code,
            "findings": findings,
            "truncated": max(
                0,
                len(failed if tool == "checkov" else findings_data) - MAX_SCANNER_FINDINGS,
            ),
        }
    return scanners


def assemble_review_prompt(prompt, terraform_context, condition, results_dir):
    full_prompt = prompt + "\n\nTerraform Changes and Full Repository Context:\n" + terraform_context
    scanner_context = None
    if condition == "C":
        scanner_context = build_scanner_context(results_dir)
        full_prompt += (
            "\n\nCondition C supporting scanner evidence (normalized from the separate raw artifacts; "
            "this is evidence to assess, not authoritative ground truth):\n"
            + json.dumps(scanner_context, indent=2, ensure_ascii=False)
        )
    return full_prompt, scanner_context


def call_ai(prompt):
    import requests

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-6",
            "max_tokens": 3000,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=90,
    )
    if response.status_code != 200:
        raise RuntimeError(f"Claude API returned HTTP {response.status_code}")
    data = response.json()
    text_blocks = [block["text"] for block in data.get("content", []) if block.get("type") == "text"]
    if len(text_blocks) != 1:
        raise RuntimeError("Claude response did not contain exactly one text block")
    return text_blocks[0]


def call_ai_with_retry(prompt, retries=2):
    for attempt in range(retries + 1):
        try:
            return call_ai(prompt)
        except Exception as exc:
            print(f"AI call failed (attempt {attempt + 1}): {exc}", file=sys.stderr)
            if attempt == retries:
                raise
            time.sleep(2)


def parse_model_json(response_text):
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].lstrip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"AI output is not valid JSON: {exc}") from exc


def validate_review(review):
    required = {"summary", "findings", "policy_violations", "positives", "final_recommendation"}
    if not isinstance(review, dict) or set(review) != required:
        raise ValueError(f"AI response must contain exactly these fields: {sorted(required)}")
    if not isinstance(review["summary"], str) or not isinstance(review["final_recommendation"], str):
        raise ValueError("summary and final_recommendation must be strings")
    if not isinstance(review["findings"], list) or len(review["findings"]) > 3:
        raise ValueError("AI response findings must be a list of at most three items")
    finding_by_id = {}
    for index, finding in enumerate(review["findings"], start=1):
        fields = {
            "id", "category", "category_rationale", "severity", "title",
            "description", "evidence", "impact", "recommendation",
        }
        if not isinstance(finding, dict) or set(finding) not in (fields, fields | {"status"}):
            raise ValueError(f"Finding {index} does not match the required schema")
        # Accept the prior schema during rolling upgrades; infer status without
        # discarding or downgrading any finding from an older model response.
        if "status" not in finding:
            if finding["severity"] == "INFORMATIONAL":
                finding["status"] = "INFORMATIONAL"
            else:
                finding["status"] = {
                    "SECURITY_VULNERABILITY": "CONFIRMED",
                    "POLICY_OR_COMPLIANCE": "CONFIRMED",
                    "CONTEXT_DEPENDENT": "NEEDS_CONTEXT",
                    "POTENTIAL_FALSE_POSITIVE": "FALSE_POSITIVE",
                }.get(finding["category"])
        if finding["category"] not in FINDING_CATEGORIES:
            raise ValueError(f"Finding {index} has an invalid category")
        if finding["severity"] not in SEVERITIES:
            raise ValueError(f"Finding {index} has an invalid severity")
        if finding["status"] not in FINDING_STATUSES:
            raise ValueError(f"Finding {index} has an invalid status")
        if finding["status"] == "CONFIRMED" and finding["category"] not in {
            "SECURITY_VULNERABILITY", "POLICY_OR_COMPLIANCE"
        }:
            raise ValueError(f"Finding {index} cannot be confirmed under its category")
        if finding["status"] == "NEEDS_CONTEXT" and finding["category"] != "CONTEXT_DEPENDENT":
            raise ValueError(f"Finding {index} needs context but is not context-dependent")
        if finding["status"] == "FALSE_POSITIVE" and finding["category"] != "POTENTIAL_FALSE_POSITIVE":
            raise ValueError(f"Finding {index} is marked false-positive under another category")
        if finding["severity"] == "INFORMATIONAL" and finding["status"] == "CONFIRMED":
            raise ValueError(f"Finding {index} cannot be confirmed with INFORMATIONAL severity")
        for field in fields:
            if not isinstance(finding[field], str):
                raise ValueError(f"Finding {index} field {field!r} must be a string")
        if not finding["evidence"].strip() or not finding["category_rationale"].strip():
            raise ValueError(f"Finding {index} must explain its code evidence and category")
        if finding["id"] in finding_by_id:
            raise ValueError("Finding IDs must be unique")
        finding_by_id[finding["id"]] = finding
    if not all(isinstance(review[field], list) for field in ("policy_violations", "positives")):
        raise ValueError("policy_violations and positives must be lists")
    if not all(isinstance(item, str) for item in review["positives"]):
        raise ValueError("positives must contain strings")
    for index, policy in enumerate(review["policy_violations"], start=1):
        if (
            not isinstance(policy, dict)
            or set(policy) != {"finding_id", "policy_id", "policy_name", "severity"}
            or policy["severity"] not in SEVERITIES
            or not isinstance(policy["finding_id"], str)
            or not isinstance(policy["policy_id"], str)
            or not isinstance(policy["policy_name"], str)
            or policy["finding_id"] not in finding_by_id
            or policy["severity"] != finding_by_id[policy["finding_id"]]["severity"]
            or finding_by_id[policy["finding_id"]]["status"] != "CONFIRMED"
        ):
            raise ValueError(f"Policy mapping {index} must refer to a matching finding")
    return review


def deduplicate_findings(review):
    """Collapse exact repeated reports while recording every removed duplicate."""
    retained = []
    seen = {}
    duplicates = []
    duplicate_ids = {}
    for finding in review["findings"]:
        fingerprint = (
            finding["category"],
            finding["status"],
            finding["severity"],
            " ".join(finding["title"].casefold().split()),
            " ".join(finding["evidence"].casefold().split()),
        )
        if fingerprint in seen:
            duplicate_ids[finding["id"]] = seen[fingerprint]
            duplicates.append({
                "duplicate_id": finding["id"],
                "retained_id": seen[fingerprint],
                "reason": "Matching category, status, severity, normalized title, and evidence.",
            })
            continue
        seen[fingerprint] = finding["id"]
        retained.append(finding)
    review["findings"] = retained
    remapped_policies = []
    seen_policies = set()
    for policy in review["policy_violations"]:
        policy["finding_id"] = duplicate_ids.get(policy["finding_id"], policy["finding_id"])
        fingerprint = (
            policy["finding_id"], policy["policy_id"], policy["policy_name"], policy["severity"]
        )
        if fingerprint not in seen_policies:
            seen_policies.add(fingerprint)
            remapped_policies.append(policy)
    review["policy_violations"] = remapped_policies
    return duplicates


def calculate_operational_score(review, scoring):
    """Score confirmed findings only; observations remain visible but unpenalized."""
    score = scoring["base_score"]
    penalties = scoring["severity_penalties"]
    for finding in review["findings"]:
        if finding.get("status", "CONFIRMED") == "CONFIRMED":
            score += penalties[finding["severity"].lower()]
    score = max(scoring.get("minimum_score", 0), min(scoring.get("maximum_score", 100), score))

    approve_at = scoring["verdict_thresholds"]["approve"]
    comments_at = scoring["verdict_thresholds"]["approve_with_comments"]
    if score >= approve_at:
        verdict = "APPROVE"
    elif score >= comments_at:
        verdict = "APPROVE_WITH_COMMENTS"
    else:
        verdict = "DO_NOT_MERGE"

    if any(
        item["severity"] == "CRITICAL" and item.get("status", "CONFIRMED") == "CONFIRMED"
        for item in review["findings"]
    ):
        risk_level = "CRITICAL"
    elif score >= scoring["risk_thresholds"]["low"]:
        risk_level = "LOW"
    elif score >= scoring["risk_thresholds"]["medium"]:
        risk_level = "MEDIUM"
    elif score >= scoring["risk_thresholds"]["high"]:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"
    return score, verdict, risk_level


def format_comment(review):
    publishable = [
        finding for finding in review["findings"]
        if finding["status"] == "CONFIRMED"
    ]
    score = review["operational_score"]
    condition = review["experiment_condition"]
    lines = [
        "## AI Security Review",
        f"**Experiment condition:** {condition}",
        "**Automated operational score:** "
        f"{score}/100 — {review['risk_level']} — {review['verdict']}",
        "*This tool is for demonstration purposes only.*",
        "",
        "### Summary",
        (
            f"The AI reviewer reported {len(publishable)} confirmed actionable finding(s)."
            if publishable
            else "The AI reviewer reported no confirmed actionable findings."
        ),
        "",
        "### Findings",
    ]
    if not publishable:
        lines.append("No confirmed actionable findings reported by the AI reviewer.")
    for finding in publishable:
        lines.extend([
            f"- **{finding['severity']} · {finding['category']} · {finding['title']}**",
            f"  - Category rationale: {finding['category_rationale']}",
            f"  - Evidence: {finding['evidence']}",
            f"  - Analysis: {finding['description']}",
            f"  - Impact: {finding['impact']}",
            f"  - Recommendation: {finding['recommendation']}",
        ])
    if review["policy_violations"]:
        lines.extend(["", "### Policy mappings"])
        for policy in review["policy_violations"]:
            lines.append(
                f"- **{policy['policy_id']}** — {policy['policy_name']} "
                f"(finding {policy['finding_id']})"
            )
    if publishable:
        lines.extend(["", "### Recommendation", "Review and remediate the confirmed findings above."])
    else:
        lines.extend(["", "### Recommendation", "No confirmed actionable findings require remediation."])
    return "\n".join(lines) + "\n"


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    results_dir = ROOT / "run-results"
    results_dir.mkdir(exist_ok=True)
    condition = os.environ.get("EXPERIMENT_CONDITION", "C").upper()
    if condition not in {"A", "B", "C"}:
        raise ValueError("EXPERIMENT_CONDITION must be A, B, or C")

    changed_files, terraform_context = get_terraform_review_context()
    if not changed_files:
        write_json(results_dir / "ai_output.json", {
            "status": "skipped",
            "reason": "No changed Terraform .tf files in the PR diff.",
            "experiment_condition": condition,
        })
        (results_dir / "pr_comment_ai.md").write_text(
            "## AI Security Review\n"
            f"**Experiment condition:** {condition}\n\n"
            "AI was not invoked because the PR diff contains no changed Terraform `.tf` files.\n",
            encoding="utf-8",
        )
        return

    prompt = load_file("ai/prompt.txt")
    full_prompt, scanner_context = assemble_review_prompt(
        prompt, terraform_context, condition, results_dir
    )
    raw_response = call_ai_with_retry(full_prompt)
    (results_dir / "ai_raw_response.txt").write_text(raw_response, encoding="utf-8")
    review = validate_review(parse_model_json(raw_response))
    duplicates = deduplicate_findings(review)
    scoring = json.loads(load_file("ai/scoring.json"))
    score, verdict, risk_level = calculate_operational_score(review, scoring)
    review.update({
        "operational_score": score,
        "verdict": verdict,
        "risk_level": risk_level,
        "experiment_condition": condition,
        "scoring_config": "ai/scoring.json",
        "classification_policy_version": CLASSIFICATION_POLICY_VERSION,
        "scanner_context": scanner_context,
        "processing_audit": {"deduplicated_findings": duplicates},
    })
    write_json(results_dir / "ai_output.json", review)
    (results_dir / "pr_comment_ai.md").write_text(format_comment(review), encoding="utf-8")
    print("AI review completed; raw response and rendered output saved under run-results/.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"AI review failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
