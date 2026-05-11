FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run build
EXPOSE 3006
CMD ["npm", "start"]
