# PROM06 TC11 - Documented task requirements
# Ground truth: the task requires only the specific read actions below.
# This file documents the intended minimum permissions for comparison.

locals {
  tc11_task_description = "Read resource information for a reporting task"

  tc11_required_actions = [
    "Microsoft.Resources/subscriptions/resourceGroups/read",
    "Microsoft.Resources/subscriptions/resources/read"
  ]
}
