FROM node:11 as builder

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build:testing

FROM nginx:1.15-alpine
RUN  rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

COPY nginx-conf/default.conf /etc/nginx/conf.d/

EXPOSE 80
