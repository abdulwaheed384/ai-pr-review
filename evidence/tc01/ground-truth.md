# TC01 ground truth

## Test case

**TC01 – Clean / Secure Terraform Baseline**

## Research purpose

Establish the false-positive baseline for Checkov, tfsec, and the AI reviewer, and assess whether the AI invents security problems or recommends unnecessary restrictive changes on a clean configuration.

## Independently defined ground truth

The Terraform in `terraform/` declares one resource group, one private-address virtual network, one subnet, and one network security group associated with that subnet. It declares no virtual machines, public IP addresses, gateways, public DNS servers, inbound allow rules, or credentials. The NSG is deliberately left without custom rules: Azure's platform default inbound rules apply, including denying inbound traffic from outside the virtual network. This small configuration is suitable as a static-review baseline and is not deployed as part of TC01.

Expected secure state: the subnet has an associated NSG, no explicit internet ingress is allowed, the VNet uses Azure's default DNS behavior, and no secret is present. This is a bounded network baseline, not a claim that every possible Azure control or production requirement is represented.

## Reproducibility record

- Branch: `experiment/tc01-clean-baseline`
- Terraform revision/hash: `f0d90dd8289651b49a5073c0814d5266ccb672ef` (commit containing the TC01 Terraform change).
- PR number: pending; record only after a PR exists.
- Azure deployment: none.
- Tool versions and observed outcomes: Terraform 1.14.9 validation succeeded; Checkov 3.3.1 reported 7 passed and 0 failed checks; tfsec 1.28.14 reported 0 findings. Raw JSON is in this directory. These are observations for this configuration, not an inference from the ground-truth definition.
- Anomalies: Checkov could not retrieve optional Prisma Cloud guideline mappings due to unavailable network resolution; its scan exited successfully. No AI/PR result is available yet.
