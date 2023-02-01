#!/bin/sh

# initializes the api/web deployments/services

microk8s kubectl apply -f scrolller-web-deployment.yaml
microk8s kubectl apply -f scrolller-api-deployment.yaml

microk8s kubectl apply -f scrolller-web-service.yaml
microk8s kubectl apply -f scrolller-api-service.yaml