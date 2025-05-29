# A1C Project Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the A1C Project using Kustomize and ArgoCD.

## Directory Structure

```
deployment/
├── base/                   # Base Kubernetes manifests
│   ├── api/                # API service manifests
│   ├── web/                # Web frontend manifests
│   ├── postgres/           # PostgreSQL database manifests
│   ├── redis/              # Redis cache manifests
│   ├── namespace.yaml      # Namespace definition
│   └── kustomization.yaml  # Base kustomization file
├── overlays/               # Environment-specific overlays
│   ├── dev/                # Development environment
│   └── prod/               # Production environment
├── argocd-app.yaml         # ArgoCD Application definition
├── ingress.yaml            # Ingress configuration
└── build-and-deploy.sh     # Helper script for local deployment
```

## Prerequisites

- Docker
- Kubernetes cluster (Minikube, kind, or a cloud provider)
- kubectl
- kustomize
- ArgoCD (optional, for GitOps deployment)

## Local Development

### Building and Deploying

1. Build the Docker images:
   ```
   docker build -t a1c-api:latest -f api/Dockerfile .
   docker build -t a1c-web:latest -f web/Dockerfile .
   ```

2. If using Minikube, load the images:
   ```
   minikube image load a1c-api:latest
   minikube image load a1c-web:latest
   ```

3. Apply the Kubernetes manifests:
   ```
   kubectl apply -k deployment/overlays/dev
   ```

Alternatively, use the provided script:
```
./deployment/build-and-deploy.sh
```

### Accessing the Application

Add the following entry to your `/etc/hosts` file:
```
<minikube-ip> a1c-project.local
```

Then access the application at: http://a1c-project.local

## Deploying with ArgoCD

1. Install ArgoCD in your cluster (if not already installed)

2. Apply the ArgoCD application manifest:
   ```
   kubectl apply -f deployment/argocd-app.yaml
   ```

3. ArgoCD will automatically sync and deploy the application based on the configuration in your Git repository.

## Sealed Secrets

For production deployments, replace the `secretGenerator` sections in the kustomization files with sealed secrets. This allows you to safely store encrypted secrets in your Git repository.

1. Install the Sealed Secrets controller in your cluster
2. Use the `kubeseal` CLI to seal your secrets
3. Replace the secretGenerator sections with the sealed secrets

## Environment-Specific Configuration

The `overlays` directory contains environment-specific configurations:

- `dev`: Development environment with minimal resources
- `prod`: Production environment with higher resource limits and replicas
