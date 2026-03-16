FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/next.config.mjs ./

# Create upload directories
RUN mkdir -p public/uploads/videos public/uploads/thumbnails

# Setup database on start
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD npx prisma db push && npm start
