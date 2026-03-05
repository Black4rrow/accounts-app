#FROM node:24-alpine
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#EXPOSE 3000
#CMD ["sh", "-c", "npx prisma generate && npm run dev"]

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN if [ -d "./src/generated" ]; then cp -r ./src/generated ./dist/ || true; fi

EXPOSE 3000

CMD ["node", "dist/server.js"]



