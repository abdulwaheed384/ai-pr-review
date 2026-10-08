# AI-Powered Terraform Security Review

This project integrates:
- Terraform Cloud (IaC deployment)
- GitHub Actions (CI/CD)
- Claude AI (security review)

Workflow:
1. Developer creates PR
2. Terraform validation runs
3. AI reviews code
4. Peer approves
5. Terraform Cloud applies changes

## PROM06 experiment: TC01

TC01 uses the Terraform configuration in `terraform/` as a clean network baseline. Its independently stated ground truth, expected state, execution commands, and evidence inventory are in [`evidence/tc01/README.md`](evidence/tc01/README.md). TC01 is intended to run before vulnerable cases and is not deployed to Azure.
