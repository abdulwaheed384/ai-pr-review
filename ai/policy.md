# Security Policy for Terraform (Azure)

## NET-001
All subnets must have a Network Security Group (NSG) associated.

## NET-002
Virtual Networks must NOT use public DNS servers. Use Azure DNS or internal DNS only.

## NET-003
Production Virtual Networks must have DDoS Protection Standard enabled. This control does not apply to research or other non-production workloads; do not report its absence as a finding when the supplied context establishes that the workload is non-production.

## LOG-001
Resources that expose Azure Monitor diagnostic categories must have the supported security-relevant logs enabled and forwarded to Log Analytics. This policy covers log collection and forwarding; it does not require a query path, alerting, or interactive log review unless a workload-specific requirement says so. A resource type with no diagnostic categories, and a subresource that cannot be targeted independently (such as a subnet), is not applicable; document that limitation. Do not create unrelated resources solely to manufacture diagnostic coverage.

## TAG-001
All taggable Azure resources must include mandatory tags: environment, owner, cost-center. Use documented research values where this is a research deployment; preserve the research_case identifier. Azure resources that do not support tags are not applicable.

## SEC-001
No resource should be publicly exposed unless explicitly required and justified.
