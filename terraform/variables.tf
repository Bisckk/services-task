variable "project_id" {
  description = "ID del proyecto en Google Cloud"
  type        = string
}

variable "region" {
  description = "Región de GCP"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zona del clúster (zonal = más económico)"
  type        = string
  default     = "us-central1-a"
}

variable "cluster_name" {
  description = "Nombre del clúster"
  type        = string
  default     = "tasks-cluster"
}

variable "node_count" {
  description = "Nodos iniciales"
  type        = number
  default     = 1
}

variable "machine_type" {
  description = "Tipo de máquina de los nodos"
  type        = string
  default     = "e2-medium"
}
