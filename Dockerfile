FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p /data

ENV NODE_ENV=production
ENV KNOW_DB_PATH=/data/know.db
ENV PORT=3000

EXPOSE 3000

# Copy schema and seed script for first run
CMD ["node", "build/index.js"]
