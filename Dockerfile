FROM node:15-alpine

WORKDIR /acme-explorer
COPY package.json .
COPY package-lock.json .
RUN npm install

WORKDIR /acme-explorer
COPY source source

EXPOSE 8080

CMD npm run start:prod
