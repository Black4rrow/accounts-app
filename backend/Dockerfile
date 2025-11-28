FROM node:24-alpine
EXPOSE 3000
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
