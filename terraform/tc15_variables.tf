# PROM06 TC15 research fixture. Do not deploy.

variable "admin_password" {
  description = "Administrator password for the research database."
  type        = string
  sensitive   = true
}
