# variable "access_key" {
#     description = "AWS access key"
#     type        = string
#     default     = ""
# }

# variable "secret_key" {
#     description = "AWS secret key"
#     type        = string
#     default     = ""
# }

variable "author" {
  description = "Name of the operator. Used as a prefix to avoid name collision on resources."
  type        = string
  default     = "rodcalrubContainers"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2" # Paris
}

variable "key_path" {
  description = "Key path for SSHing into EC2"
  type        = string
  default     = "./keys/paris-keys.pem"
}

variable "key_name" {
  description = "Key name for SSHing into EC2"
  type        = string
  default     = "paris-keys"
}

variable "hostname" {
  description = "Insert the hostname to be used"
  type        = string
  default = "do2021-grupal.com"
}