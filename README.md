# tasks-service — Ejemplos prácticos Unidad 3

**Arquitectura de Software · UNISANGIL**
Bismarck Barrios

Microservicio REST de tareas en Node.js, contenerizado con Docker, desplegado en Kubernetes (minikube), con infraestructura en la nube definida en Terraform y un pipeline CI/CD en GitHub Actions.

## Estructura

```
tasks-service/
├── app/                      # Microservicio
│   ├── src/app.js            # Rutas y lógica (Express)
│   ├── src/server.js         # Arranque + apagado ordenado (SIGTERM)
│   ├── test/app.test.js      # Pruebas unitarias (node:test)
│   ├── Dockerfile            # Imagen multi-etapa, usuario no-root
│   └── package.json
├── k8s/                      # Manifiestos de Kubernetes
│   ├── deployment.yaml       # 2 réplicas, probes, límites de recursos
│   ├── service.yaml          # NodePort 30080
│   └── hpa.yaml              # Autoescalado 2–5 pods por CPU
├── terraform/                # Clúster GKE en Google Cloud
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
└── .github/workflows/ci-cd.yml  # Build → Test → Docker → Deploy
```

## API

| Método | Ruta          | Descripción                 |
|--------|---------------|-----------------------------|
| GET    | `/health`     | Estado del servicio         |
| GET    | `/tasks`      | Lista todas las tareas      |
| GET    | `/tasks/:id`  | Obtiene una tarea           |
| POST   | `/tasks`      | Crea una tarea `{ title }`  |
| PATCH  | `/tasks/:id`  | Actualiza `{ title, done }` |
| DELETE | `/tasks/:id`  | Elimina una tarea           |

---

## 1. Microservicio en Node.js

```bash
cd app
npm install
npm test          # 5 pruebas unitarias
npm start         # http://localhost:3000/health
```

## 2. Contenerizar con Docker

```bash
cd app
docker build -t tasks-service:1.0.0 .
docker run -p 3000:3000 tasks-service:1.0.0
```

La imagen usa dos etapas (solo dependencias de producción en la final), corre como usuario `node` y tiene `HEALTHCHECK`.

## 3. Desplegar en Kubernetes (minikube)

```bash
minikube start
minikube addons enable metrics-server

# Construir la imagen dentro del Docker de minikube
eval $(minikube docker-env)          # Windows PowerShell: minikube docker-env | Invoke-Expression
docker build -t tasks-service:1.0.0 ./app

kubectl apply -f k8s/
kubectl get pods,svc,hpa

minikube service tasks-service --url   # abre la URL del servicio
```

Probar auto-reparación: `kubectl delete pod <nombre-pod>` → Kubernetes crea otro automáticamente.

## 4. Provisionar el clúster en la nube con Terraform

Requisitos: cuenta de Google Cloud, `gcloud auth application-default login`, API de Kubernetes Engine habilitada.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # poner tu project_id
terraform init
terraform plan
terraform apply
# Conectar kubectl (comando impreso en el output get_credentials)
terraform destroy   # al terminar, para no generar costos
```

Crea una VPC, una subred, el clúster GKE (Control Plane administrado) y un pool de nodos de trabajo con autoescalado de 1 a 3.

## 5. Pipeline CI/CD con GitHub Actions

`.github/workflows/ci-cd.yml` tiene tres jobs encadenados:

1. **build-test** — instala dependencias y ejecuta las pruebas unitarias (en cada push y PR).
2. **docker** — construye la imagen y la publica en GitHub Container Registry con el SHA del commit.
3. **deploy** — aplica los manifiestos y actualiza la imagen en el clúster, esperando el rollout.

Configuración: en el repositorio, *Settings → Secrets → Actions*, crear el secreto `KUBECONFIG` con el kubeconfig del clúster (GKE). El paso de deploy apunta a un clúster en la nube; minikube no es accesible desde los runners de GitHub.

---

## Conceptos de la unidad aplicados

| Concepto           | Dónde                                                  |
|--------------------|--------------------------------------------------------|
| Microservicio      | `app/` — servicio independiente con su propia API      |
| Contenedores       | `Dockerfile` multi-etapa                               |
| Orquestación       | `deployment.yaml` — réplicas y rolling update          |
| Auto-reparación    | `livenessProbe` / `readinessProbe`                     |
| Escalado automático| `hpa.yaml` y autoescalado de nodos en Terraform        |
| IaC                | `terraform/` — infraestructura declarativa versionada  |
| CI/CD              | `ci-cd.yml` — build, test y despliegue automático      |
| DevSecOps (básico) | Contenedor no-root, secretos en GitHub Secrets         |
