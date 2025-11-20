FROM node:24-alpine
EXPOSE 3000
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "dev"]