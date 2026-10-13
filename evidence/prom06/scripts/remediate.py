import re,sys,pathlib
tc=sys.argv[1]; T=pathlib.Path("terraform")
def sub(path,old,new,count=1):
    p=T/path; s=p.read_text()
    if old not in s: sys.exit(f"{tc}: pattern not found in {path}: {old!r}")
    p.write_text(s.replace(old,new,count))
if tc in("02","03","04"):
    sub("nsg.tf",'source_address_prefix      = "0.0.0.0/0"','source_address_prefix      = "203.0.113.10/32"')
elif tc=="05":
    p=T/"network.tf"; p.write_text(p.read_text().rstrip()+'\n\n# AI remediation (TC05): associate the NSG with the subnet.\nresource "azurerm_subnet_network_security_group_association" "subnet" {\n  subnet_id                 = azurerm_subnet.subnet.id\n  network_security_group_id = azurerm_network_security_group.nsg.id\n}\n')
elif tc=="06":
    p=T/"network.tf"; s=p.read_text(); n=re.sub(r'\n\s*dns_servers\s*=\s*\["8\.8\.8\.8"\][^\n]*','\n  # AI remediation (TC06): dns_servers removed so the VNet uses Azure-provided DNS.',s)
    assert n!=s; p.write_text(n)
elif tc=="07":
    sub("storage.tf",'min_tls_version = "TLS1_0"','min_tls_version = "TLS1_2"')
elif tc=="08":
    p=T/"nsg.tf"; p.write_text(p.read_text().rstrip()+'\n\n# AI remediation (TC08): forward NSG logs to Log Analytics.\nresource "azurerm_monitor_diagnostic_setting" "nsg" {\n  name                       = "diag-nsg-demo-ai"\n  target_resource_id         = azurerm_network_security_group.nsg.id\n  log_analytics_workspace_id = azurerm_log_analytics_workspace.network.id\n\n  enabled_log {\n    category = "NetworkSecurityGroupEvent"\n  }\n\n  enabled_log {\n    category = "NetworkSecurityGroupRuleCounter"\n  }\n}\n')
elif tc=="09":
    f=[x for x in T.glob("*.tf") if "tc09_dummy_secret" in x.read_text()][0]
    s=f.read_text(); n=re.sub(r'\nlocals \{\n\s*tc09_dummy_secret = "[^"]*"\n\}\n?','\n# AI remediation (TC09): hard-coded value removed from source control.\n',s); assert n!=s; f.write_text(n)
elif tc=="10":
    f=[x for x in T.glob("*.tf") if "tc10_excessive_permissions" in x.read_text()][0]; f.unlink()
elif tc=="10tags":
    f=[x for x in T.glob("*.tf") if "tc10_excessive_permissions" in x.read_text()][0]
    s=f.read_text(); n=s.replace('  assignable_scopes = [','  tags = local.common_tags\n\n  assignable_scopes = [',1); assert n!=s; f.write_text(n)
elif tc=="11":
    f=[x for x in T.glob("*.tf") if "tc11_reporting_role" in x.read_text()][0]; s=f.read_text()
    n=s.replace('actions     = ["*"]','actions     = ["Microsoft.Resources/subscriptions/resourceGroups/read", "Microsoft.Resources/subscriptions/resources/read"]',1)
    n=re.sub(r'assignable_scopes = \[\s*data\.azurerm_subscription\.tc11_current\.id\s*\]','assignable_scopes = [\n    azurerm_resource_group.rg.id\n  ]',n)
    assert n!=s and "azurerm_resource_group.rg.id" in n; f.write_text(n)
elif tc=="13":
    sub("tc13_reporting_identity.tf",'role_definition_name = "Contributor"','role_definition_name = "Reader"')
    s=(T/"tc13_reporting_identity.tf").read_text(); n=re.sub(r'scope(\s*)= data\.azurerm_subscription\.tc13_current\.id',r'scope\1= azurerm_resource_group.rg.id',s); assert n!=s; (T/"tc13_reporting_identity.tf").write_text(n)
elif tc=="15":
    sub("tc15_variables.tf",'  default     = "Prom06-Lab-Passw0rd-2026"\n','  sensitive   = true\n')
else: sys.exit("unknown")
print("ok",tc)
