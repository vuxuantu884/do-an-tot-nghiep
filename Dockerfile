FROM node:16-alpine3.15 as builder

WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install
RUN export NODE_OPTIONS="--max-old-space-size=8000"
COPY . /app
RUN yarn build:testing

FROM nginx:1.15-alpine
RUN  rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

COPY nginx-conf/default.conf /etc/nginx/conf.d/

EXPOSE 80
