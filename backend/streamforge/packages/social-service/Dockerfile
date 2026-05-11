FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm install
RUN npm run build
EXPOSE 3005
CMD ["npm", "start"]
