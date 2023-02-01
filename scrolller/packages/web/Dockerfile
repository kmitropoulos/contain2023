# build the application
FROM node as build-container

WORKDIR /app

COPY package*.json /app/
# install the dependences
RUN npm install

COPY . /app
# build the web app
RUN npm run build -- --outDir=./dist/out
# get an nginx image
FROM nginx
# copy the built app to the default nginx path
COPY --from=build-container /app/dist/out/ /usr/share/nginx/html
# copy the our configuration to nginx
COPY /nginx-custom.conf /etc/nginx/conf.d/default.conf