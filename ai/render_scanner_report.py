"""Render standalone PR comments from unmodified Checkov/tfsec JSON output."""

import argparse
import json
import re
from pathlib import Path


def read_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def checkov_findings(data):
    if isinstance(data, list):
        data = data[0] if data else {}
    results = data.get("results", {}) if isinstance(data, dict) else {}
    if not isinstance(results, dict):
        return None
    failed = results.get("failed_checks", [])
    passed = results.get("passed_checks", [])
    skipped = results.get("skipped_checks", [])
    if not all(isinstance(items, list) for items in (passed, failed, skipped)):
        return None
    return passed, failed, skipped


def tfsec_findings(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        results = data.get("results", [])
        if results is None:
            return []
        return results if isinstance(results, list) else None
    return None


def clean_version(version):
    versions = re.findall(r"\b\d+\.\d+\.\d+\b", version)
    lines = version.strip().splitlines()
    return versions[-1] if versions else (lines[-1] if lines else "unknown")


def format_checkov(data, version, exit_code, condition):
    version = clean_version(version)
    parsed = checkov_findings(data)
    valid = parsed is not None
    passed, failed, skipped = parsed or ([], [], [])
    if not valid:
        status = "EXECUTION_ERROR (missing or invalid JSON)"
    elif failed:
        status = "COMPLETED_WITH_FINDINGS"
    elif exit_code == 0:
        status = "COMPLETED_CLEAN"
    else:
        status = f"EXECUTION_ERROR (exit code {exit_code}; no failed checks in JSON)"
    lines = [
        "## Checkov Security Scan",
        f"**Experiment condition:** {condition}",
        f"**Version:** {version}",
        f"**Scan status:** {status}",
        f"**Passed:** {len(passed)} · **Failed:** {len(failed)} · **Skipped:** {len(skipped)}",
    ]
    if failed:
        lines.extend(["", "### Failed checks"])
        for item in failed:
            lines.append(
                f"- **{item.get('check_id', 'Unknown rule')}** — "
                f"{item.get('check_name', item.get('description', 'No description provided'))}; "
                f"resource: `{item.get('resource', 'unknown')}`; "
                f"file: `{item.get('file_path', 'unknown')}`"
            )
    elif valid:
        lines.extend(["", "No failed checks were reported."])
    return "\n".join(lines) + "\n"


def format_tfsec(data, version, exit_code, condition):
    version = clean_version(version)
    findings = tfsec_findings(data)
    valid = findings is not None
    if not valid:
        status = "EXECUTION_ERROR (missing or invalid JSON)"
        findings = []
    elif findings:
        status = "COMPLETED_WITH_FINDINGS"
    elif exit_code == 0:
        status = "COMPLETED_CLEAN"
    else:
        status = f"EXECUTION_ERROR (exit code {exit_code}; no findings in JSON)"
    lines = [
        "## tfsec Security Scan",
        f"**Experiment condition:** {condition}",
        f"**Version:** {version}",
        f"**Scan status:** {status}",
        f"**Findings:** {len(findings)}",
    ]
    if findings:
        lines.extend(["", "### Findings"])
        for item in findings:
            location = item.get("location", {}) or {}
            lines.append(
                f"- **{item.get('severity', 'UNKNOWN')} · {item.get('rule_id', 'Unknown rule')}** — "
                f"{item.get('description', 'No description provided')}; "
                f"resource: `{item.get('resource', 'unknown')}`; "
                f"file: `{location.get('filename', 'unknown')}`"
            )
    elif valid:
        lines.extend(["", "No findings were reported."])
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tool", choices=("checkov", "tfsec"), required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--exit-code", type=int, required=True)
    parser.add_argument("--condition", choices=("A", "B", "C"), required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    data = read_json(args.input)
    if args.tool == "checkov":
        rendered = format_checkov(data, args.version, args.exit_code, args.condition)
    else:
        rendered = format_tfsec(data, args.version, args.exit_code, args.condition)
    Path(args.output).write_text(rendered, encoding="utf-8")


if __name__ == "__main__":
    main()
