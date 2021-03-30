variable "key_path" {
  description = "Key path for SSHing into EC2"
  type        = string
  default     = "./acmekey.pem"
}

variable "key_name" {
  description = "Key name for SSHing into EC2"
  type        = string
  default     = "acmekey"
}
