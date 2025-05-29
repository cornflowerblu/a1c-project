#!/bin/bash
set -e

# Build Docker images
echo "Building Docker images..."
docker build -t a1c-api:latest -f api/Dockerfile .
docker build -t a1c-web:latest -f web/Dockerfile .

# Load images into Minikube
echo "Loading images into Minikube..."
minikube image load a1c-api:latest
minikube image load a1c-web:latest

# Create namespace if it doesn't exist
echo "Creating namespace..."
kubectl create namespace a1c-project-dev --dry-run=client -o yaml | kubectl apply -f -

# Apply Kustomize manifests
echo "Applying Kustomize manifests..."
kubectl apply -k deployment/overlays/dev

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl -n a1c-project-dev wait --for=condition=available --timeout=300s deployment/dev-api
kubectl -n a1c-project-dev wait --for=condition=available --timeout=300s deployment/dev-web
kubectl -n a1c-project-dev wait --for=condition=available --timeout=300s deployment/dev-postgres
kubectl -n a1c-project-dev wait --for=condition=available --timeout=300s deployment/dev-redis

echo "Deployment completed successfully!"
echo "You can access the application at: http://a1c-project.local"
echo "Make sure to add 'a1c-project.local' to your /etc/hosts file pointing to your Minikube IP"
echo "Minikube IP: $(minikube ip)"
