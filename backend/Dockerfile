FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
EXPOSE 3000
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
