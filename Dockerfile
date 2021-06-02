FROM node:14.16.1-alpine as build-step

RUN mkdir /app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build:testing

FROM nginx:1.20-alpine
COPY --from=build-step /app/build /usr/share/nginx/html