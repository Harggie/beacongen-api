FROM mhart/alpine-node:9.8

WORKDIR /app

COPY . /app

EXPOSE 8081

CMD node index.js