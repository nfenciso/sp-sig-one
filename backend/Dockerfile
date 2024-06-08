FROM node:14

WORKDIR /usr/src/backend

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "sh", "-c", "node index.js" ]