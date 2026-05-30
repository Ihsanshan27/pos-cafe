FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client based on schema
RUN npx prisma generate

EXPOSE 3000

# Use db push (no migration files needed) then start dev server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run start:dev"]
