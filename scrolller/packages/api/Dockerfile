# basic alpine-based node image
FROM node:alpine

WORKDIR /app

COPY package*.json /app/
# install dependences in the container
RUN npm install
# copy the api codebase
COPY . /app
# initialize the internal prisma db - ONLY WHEN POSTGRES IS NOT USED
RUN npx prisma generate

EXPOSE 8000
# start the api (for now it starts with dev option)
CMD ["npm", "run", "dev"]