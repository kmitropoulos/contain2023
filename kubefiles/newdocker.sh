#!/bin/sh

# generates the images of web and api, and pushes in microk8s registry
# check the relative paths for that, since Dockerfiles reside in the package/api or package/web folders respectivelly

cd ../scrolller/packages/api
sudo docker build -t scrolller-api:v3 . --no-cache
sudo docker tag scrolller-api:v3 localhost:32000/scrolller-api:v3
sudo docker push localhost:32000/scrolller-api:v3

cd ../web
sudo docker build -t scrolller-web:v3 . --no-cache
sudo docker tag scrolller-web:v3 localhost:32000/scrolller-web:v3
sudo docker push localhost:32000/scrolller-web:v3