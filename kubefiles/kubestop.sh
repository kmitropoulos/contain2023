#!/bin/sh

# removes the api/deployment and services

microk8s kubectl delete service scrolller-web-service
microk8s kubectl delete service scrolller-api-service

microk8s kubectl delete deployment scrolller-web-deployment
microk8s kubectl delete deployment scrolller-api-deployment
