FROM node:24-alpine
LABEL org.opencontainers.image.source=https://github.com/pabloAR22/confirm_deliveries

WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src

USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
