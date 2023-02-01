#!/bin/sh

# stop and remove all containers (WARNING)
sudo docker stop $(sudo docker ps -a -q)
sudo docker rm $(sudo docker ps -a -q)

# remove scrolller images

sudo docker rmi -f $(sudo docker image ls localhost:32000/scrolller-web -q)
sudo docker rmi -f $(sudo docker image ls localhost:32000/scrolller-api -q)
sudo docker rmi -f $(sudo docker image ls scrolller-web -q)
sudo docker rmi -f $(sudo docker image ls scrolller-api -q)