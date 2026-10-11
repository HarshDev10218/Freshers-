# Node.js production container for backend
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application files
COPY server.js ./
COPY data/ ./data/

EXPOSE 5000

CMD ["node", "server.js"]
